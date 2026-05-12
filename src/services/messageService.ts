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
You are a strict AI content moderator for InHub, a professional educational platform for tutors and students.
Your ONLY role is to decide if a message is appropriate for a professional learning environment.

BLOCK the message if it contains ANY of the following:
- Insults, personal attacks, or name-calling (e.g. "you are mad", "you are a fool", "idiot", "stupid", "dumb", "crazy", "useless")
- Rudeness, mockery, or disrespect toward another person
- Profanity, hate speech, or offensive language of any kind
- Inappropriate, romantic, flirtatious, or sexual language or advances
- Requests for personal photos, videos, or private contact details
- Sharing sensitive personal information (bank details, SSNs, home addresses)
- Asking students for payments, fees, or money outside the platform
- Attempts to move communication outside the platform (WhatsApp, Telegram, private email, etc.)
- Threats, intimidation, or bullying behaviour
- Any content that is off-topic or harmful to a tutor-student educational relationship

ALLOW the message ONLY if it is clearly related to learning, course content, scheduling, academic feedback, or professional support.

Be STRICT. When in doubt, BLOCK.

Return ONLY a valid JSON object with no markdown formatting, no explanation outside JSON.
Format:
{
  "is_safe": true/false,
  "reason": "Short reason if blocked, empty string if safe"
}

Message to evaluate:
"{{MESSAGE}}"
`;

// Fast client-side blocklist — catches obvious insults before the AI call
// so they are rejected instantly even when the AI API is slow or unavailable.
const QUICK_BLOCK_PATTERNS = [
  /\b(you'?re?|ur|u\s+r)\s+(mad|crazy|stupid|dumb|idiot|fool|foolish|useless|trash|rubbish|disgusting|ugly|worthless|terrible|awful|horrible|pathetic|moron|imbecile|retard|loser|clown|joke)\b/i,
  /\b(idiot|stupid|dumb|moron|imbecile|retard|fool|foolish|useless|worthless|trash|rubbish|loser|clown|pathetic)\b/i,
  /\b(shut\s*up|go\s*to\s*hell|screw\s*you|f+\s*u+|f[*!@#]+\s*you|damn\s*you|go\s*away)\b/i,
  /\b(send\s*(me\s*)?your\s*(pic|picture|photo|image|selfie|body|nudes?))\b/i,
  /\b(whatsapp|telegram|snapchat|instagram\s*dm|meet\s*me\s*(outside|privately))\b/i,
  /\b(pay\s*me|send\s*(me\s*)?(money|cash|payment|transfer))\b/i,
];

export const messageService = {
  // === Moderation & Reporting === //

  async checkMessageSafety(content: string): Promise<{ is_safe: boolean; reason: string }> {
    if (!content || content.trim().length === 0) return { is_safe: true, reason: "" };

    // 1. Fast client-side check — no API needed
    for (const pattern of QUICK_BLOCK_PATTERNS) {
      if (pattern.test(content)) {
        return {
          is_safe: false,
          reason: "Your message contains language that is not appropriate for a professional educational platform. Please keep conversations respectful and on-topic."
        };
      }
    }

    // 2. AI moderation for nuanced cases
    try {
      const prompt = MODERATION_PROMPT.replace("{{MESSAGE}}", content);
      const response = await chatCompletion([
        { role: 'system', content: prompt }
      ], { model: MODELS.NANO, temperature: 0.0 });

      const cleanedText = response.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedText);
      return {
        is_safe: parsed.is_safe === true,
        reason: parsed.reason || "Content flagged by safety system."
      };
    } catch (err) {
      console.error("Moderation AI unavailable — blocking message for safety:", err);
      // Fail CLOSED: if the AI moderation service is down, block the message
      // to prevent abuse rather than allowing unmoderated content through.
      return {
        is_safe: false,
        reason: "Our safety system is temporarily unavailable. Please try again in a moment."
      };
    }
  },

  async reportContent(offenderId: string, content: string, reason: string, messageId?: string, isAiBlock: boolean = false, receiverId?: string) {
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

    // Notify all admins with full sender + receiver details
    try {
      // Fetch sender (offender) and receiver profiles in one query
      const lookupIds = [offenderId, ...(receiverId ? [receiverId] : [])].filter(Boolean);
      const { data: profiles } = await supabase
        .from('users')
        .select('id, full_name, role')
        .in('id', lookupIds);

      const profileMap: Record<string, { full_name: string; role: string }> = {};
      (profiles || []).forEach((p: any) => { profileMap[p.id] = p; });

      const sender   = profileMap[offenderId];
      const receiver = receiverId ? profileMap[receiverId] : null;

      const senderLabel   = sender   ? `${sender.full_name} (${sender.role})`     : 'Unknown sender';
      const receiverLabel = receiver ? `${receiver.full_name} (${receiver.role})` : 'Unknown recipient';
      const sourceLabel   = isAiBlock ? '🤖 AI filter' : '👤 user report';
      const preview       = content.length > 80 ? content.slice(0, 80) + '…' : content;

      const { data: admins } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin');

      if (admins && admins.length > 0) {
        const adminNotifs = admins.map((a: any) => ({
          user_id: a.id,
          title: '🚨 Flagged Message',
          message: `Blocked by ${sourceLabel} — From: ${senderLabel} → To: ${receiverLabel}. Message: "${preview}"`,
          type: 'alert',
          read: false,
          link: '/app/admin/notifications',
        }));
        await supabase.from('notifications').insert(adminNotifs);
      }
    } catch (notifErr) {
      console.warn('Failed to send admin flagged-message notification:', notifErr);
    }
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
        // Log the blocked attempt — pass receiverId so admin notification shows both parties
        await this.reportContent(user.id, content, moderation.reason, undefined, true, receiverId);
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
