import { supabase } from '../lib/supabase';
import { chatCompletion, MODELS } from '../app/services/nvidia';
import { uploadFileWithProgress } from '../lib/uploadHelper';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  course_id?: string;
  content: string;
  image_url?: string;
  is_read: boolean;
  created_at: string;
  sender?: { full_name: string; avatar_url: string | null; role: string };
  receiver?: { full_name: string; avatar_url: string | null; role: string };
}

export interface ChatContact {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

const MODERATION_PROMPT = `
You are an AI content moderator for an educational platform (tutors and students).
Your job is to evaluate the following message for safety and compliance with our policies.
Block the message if it contains:
- Severe profanity, hate speech, or harassment.
- Inappropriate, romantic, or sexual advances between a tutor and student.
- Sharing of sensitive personal information (like SSNs).
- Asking students for external fees, payments, or money aside from the course they purchased on the platform.
- Attempts to take students outside the platform for external tutoring, communication, or private lessons.

Return ONLY a valid JSON object with no markdown formatting.
Format:
{
  "is_safe": true/false,
  "reason": "Explain why if blocked, otherwise empty string"
}

Message to evaluate:
"{{MESSAGE}}"
`;

export const messageService = {
  // === Moderation & Reporting === //

  async checkMessageSafety(content: string): Promise<{ is_safe: boolean; reason: string }> {
    if (!content || content.trim().length === 0) return { is_safe: true, reason: "" };

    try {
      const prompt = MODERATION_PROMPT.replace("{{MESSAGE}}", content);
      const response = await chatCompletion([
        { role: 'system', content: prompt }
      ], { model: MODELS.NANO, temperature: 0.1 });

      const cleanedText = response.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedText);
      return {
        is_safe: parsed.is_safe === true,
        reason: parsed.reason || "Content flagged by safety system."
      };
    } catch (err) {
      console.error("Moderation failed, failing open for safety: ", err);
      return { is_safe: true, reason: "" }; // If AI fails, allow the message to send (or fail closed depending on strictness)
    }
  },

  async reportContent(offenderId: string, content: string, reason: string, messageId?: string, isAiBlock: boolean = false) {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('reported_content').insert({
      reporter_id: isAiBlock ? null : user?.id,
      offender_id: offenderId,
      message_id: messageId || null,
      content,
      reason,
      source: isAiBlock ? 'ai_filter' : 'user_report',
      status: 'pending'
    });
  },

  // === Messaging === //

  async sendMessage(receiverId: string, content: string, imageFile?: File, courseId?: string, onProgress?: (progress: number) => void) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    let finalImageUrl = null;

    // 1. Moderate Content
    if (content) {
      const moderation = await this.checkMessageSafety(content);
      if (!moderation.is_safe) {
        // Log the blocked attempt
        await this.reportContent(user.id, content, moderation.reason, undefined, true);
        throw new Error(`Message blocked: ${moderation.reason}`);
      }
    }

    // 2. Upload Image if provided
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      finalImageUrl = await uploadFileWithProgress('chat_attachments', filePath, imageFile, onProgress);
    }

    // 3. Send Message
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        course_id: courseId || null,
        content: content || null,
        image_url: finalImageUrl,
        is_read: false
      })
      .select('*, sender:users!messages_sender_id_fkey(full_name, avatar_url, role), receiver:users!messages_receiver_id_fkey(full_name, avatar_url, role)')
      .single();

    if (error) throw error;

    // Insert Notification
    const senderProfile = data?.sender;
    const senderName = senderProfile?.full_name || 'someone';
    
    // Check if there's already an unread message notification from this user to avoid flooding
    const { count } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', receiverId)
      .eq('type', 'message')
      .eq('read', false)
      .like('message', `%${senderName}%`);
      
    if (!count || count === 0) {
      await supabase.from('notifications').insert({
        user_id: receiverId,
        title: "New Message",
        message: `You have a new message from ${senderName}.`,
        type: "message",
        link: "/app/messages" // Will be handled correctly in Header for tutors vs students
      });
    }

    return data as Message;
  },

  async sendBulkMessage(receiverIds: string[], content: string, courseId?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Moderate once for bulk message
    const moderation = await this.checkMessageSafety(content);
    if (!moderation.is_safe) {
      await this.reportContent(user.id, content, moderation.reason, undefined, true);
      throw new Error(`Bulk message blocked: ${moderation.reason}`);
    }

    const payload = receiverIds.map(id => ({
      sender_id: user.id,
      receiver_id: id,
      course_id: courseId || null,
      content,
      is_read: false
    }));

    const { error } = await supabase.from('messages').insert(payload);
    if (error) throw error;

    // Send notifications to all
    const { data: senderProfile } = await supabase.from('users').select('full_name').eq('id', user.id).single();
    const senderName = senderProfile?.full_name || 'your tutor';

    const notifications = receiverIds.map(id => ({
      user_id: id,
      title: "New Announcement",
      message: `You have a new bulk message from ${senderName}.`,
      type: "message",
      link: "/app/messages"
    }));

    await supabase.from('notifications').insert(notifications);
  },

  async getConversation(otherUserId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:users!messages_sender_id_fkey(full_name, avatar_url, role), receiver:users!messages_receiver_id_fkey(full_name, avatar_url, role)')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as Message[];
  },

  async markAsRead(otherUserId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('receiver_id', user.id)
      .eq('sender_id', otherUserId)
      .eq('is_read', false);
  },

  async getContacts(): Promise<ChatContact[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Get all messages where user is sender or receiver
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*, sender:users!messages_sender_id_fkey(id, full_name, avatar_url, role), receiver:users!messages_receiver_id_fkey(id, full_name, avatar_url, role)')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const contactsMap = new Map<string, ChatContact>();

    (messages || []).forEach((msg: any) => {
      const isSender = msg.sender_id === user.id;
      const otherUser = isSender ? msg.receiver : msg.sender;
      if (!otherUser) return;

      if (!contactsMap.has(otherUser.id)) {
        contactsMap.set(otherUser.id, {
          id: otherUser.id,
          full_name: otherUser.full_name,
          avatar_url: otherUser.avatar_url,
          role: otherUser.role,
          lastMessage: msg.content || (msg.image_url ? 'Sent an image' : ''),
          lastMessageTime: msg.created_at,
          unreadCount: (!isSender && !msg.is_read) ? 1 : 0
        });
      } else {
        const contact = contactsMap.get(otherUser.id)!;
        if (!isSender && !msg.is_read) {
          contact.unreadCount += 1;
        }
      }
    });

    return Array.from(contactsMap.values());
  },

  async getUnreadCount() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('is_read', false);

    return count || 0;
  }
};
