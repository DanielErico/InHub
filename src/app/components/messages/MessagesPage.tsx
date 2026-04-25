import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, Image as ImageIcon, Loader2, AlertTriangle, Flag, MoreVertical, X } from "lucide-react";
import { messageService, Message, ChatContact } from "../../../services/messageService";
import { useUserProfile } from "../../context/UserProfileContext";
import { useLocation } from "react-router";
import { supabase } from "../../../lib/supabase";
import toast from "react-hot-toast";

export default function MessagesPage() {
  const { profile } = useUserProfile();
  const location = useLocation();
  const initialContact = location.state?.initialContact as ChatContact | undefined;

  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [activeContact, setActiveContact] = useState<ChatContact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      const data = await messageService.getContacts();
      
      let finalContacts = data;
      if (initialContact) {
        // If the initial contact isn't in our history yet, add them manually to the list
        if (!data.find(c => c.id === initialContact.id)) {
          finalContacts = [initialContact, ...data];
        }
        setActiveContact(initialContact);
        loadMessages(initialContact.id);
      }
      setContacts(finalContacts);
      setLoadingContacts(false);
    };
    init();

    // Setup realtime subscription for new messages
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        loadContacts(); // Refresh contacts list for new message indicators
        if (activeContact && (payload.new.sender_id === activeContact.id || payload.new.receiver_id === activeContact.id)) {
          loadMessages(activeContact.id);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeContact]);

  const loadContacts = async () => {
    try {
      const data = await messageService.getContacts();
      setContacts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingContacts(false);
    }
  };

  const loadMessages = async (contactId: string) => {
    setLoadingMessages(true);
    try {
      const data = await messageService.getConversation(contactId);
      setMessages(data);
      setTimeout(scrollToBottom, 100);
      await messageService.markAsRead(contactId);
      // Update local unread count
      setContacts(prev => prev.map(c => c.id === contactId ? { ...c, unreadCount: 0 } : c));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleContactSelect = (contact: ChatContact) => {
    setActiveContact(contact);
    loadMessages(contact.id);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!activeContact) return;
    if (!inputText.trim() && !imageFile) return;

    const tempText = inputText;
    const tempImg = imageFile;
    setInputText("");
    setImageFile(null);
    setIsSending(true);

    try {
      await messageService.sendMessage(activeContact.id, tempText, tempImg || undefined);
      await loadMessages(activeContact.id);
    } catch (err: any) {
      toast.error(err.message);
      // Restore on fail
      setInputText(tempText);
      setImageFile(tempImg);
    } finally {
      setIsSending(false);
    }
  };

  const handleReport = async () => {
    if (!activeContact) return;
    if (!reportReason.trim()) {
      toast.error("Please provide a reason");
      return;
    }
    try {
      await messageService.reportContent(activeContact.id, "Entire conversation reported", reportReason);
      toast.success("Report submitted successfully.");
      setShowReportModal(false);
      setReportReason("");
    } catch (err: any) {
      toast.error("Failed to report: " + err.message);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] max-w-7xl mx-auto bg-background animate-in fade-in duration-500">
      {/* Contacts Sidebar */}
      <div className={`w-full md:w-80 border-r border-border flex flex-col ${activeContact ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-bold text-lg text-foreground">Messages</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loadingContacts ? (
            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : contacts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No messages yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {contacts.map(contact => (
                <button
                  key={contact.id}
                  onClick={() => handleContactSelect(contact)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left ${activeContact?.id === contact.id ? 'bg-muted' : ''}`}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {contact.avatar_url ? (
                      <img src={contact.avatar_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <span className="text-blue-700 font-bold">{contact.full_name[0]}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground truncate">{contact.full_name}</p>
                      {contact.lastMessageTime && (
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(contact.lastMessageTime).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{contact.lastMessage}</p>
                  </div>
                  {contact.unreadCount > 0 && (
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                      {contact.unreadCount}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      {activeContact ? (
        <div className="flex-1 flex flex-col min-w-0 bg-card/30">
          {/* Chat Header */}
          <div className="h-16 px-4 border-b border-border flex items-center justify-between bg-card">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActiveContact(null)}
                className="md:hidden p-2 -ml-2 rounded-lg hover:bg-muted"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                {activeContact.avatar_url ? (
                  <img src={activeContact.avatar_url} className="w-full h-full object-cover" alt="" />
                ) : (
                  <span className="text-blue-700 font-bold">{activeContact.full_name[0]}</span>
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{activeContact.full_name}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{activeContact.role}</p>
              </div>
            </div>
            
            <button 
              onClick={() => setShowReportModal(true)}
              className="p-2 text-muted-foreground hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
              title="Report Conversation"
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loadingMessages ? (
              <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : (
              messages.map(msg => {
                const isMe = msg.sender_id === profile?.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-muted text-foreground rounded-bl-none'}`}>
                      {msg.image_url && (
                        <a href={msg.image_url} target="_blank" rel="noreferrer">
                          <img src={msg.image_url} alt="Attachment" className="max-w-full rounded-lg mb-2 max-h-64 object-contain bg-black/10" />
                        </a>
                      )}
                      {msg.content && <p className="text-sm whitespace-pre-wrap">{msg.content}</p>}
                      <p className={`text-[10px] mt-1 ${isMe ? 'text-blue-200' : 'text-muted-foreground'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border bg-card">
            {imageFile && (
              <div className="mb-3 flex items-center gap-2 p-2 bg-muted rounded-lg inline-flex relative group">
                <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-10 h-10 object-cover rounded" />
                <span className="text-xs text-muted-foreground max-w-[150px] truncate">{imageFile.name}</span>
                <button 
                  onClick={() => setImageFile(null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <div className="flex items-end gap-2">
              <div className="flex-1 bg-muted rounded-2xl border border-border focus-within:ring-2 focus-within:ring-blue-500 transition-all overflow-hidden flex items-end pr-2">
                <textarea
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full bg-transparent resize-none p-3 max-h-32 text-sm outline-none"
                  rows={1}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <label className="p-2 text-muted-foreground hover:text-blue-600 cursor-pointer mb-1 transition-colors">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={e => e.target.files && setImageFile(e.target.files[0])}
                  />
                  <ImageIcon className="w-5 h-5" />
                </label>
              </div>
              <button
                onClick={handleSend}
                disabled={isSending || (!inputText.trim() && !imageFile)}
                className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl transition-all shadow-sm flex-shrink-0 mb-1"
              >
                {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-center text-[10px] text-muted-foreground mt-2 flex items-center justify-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Protected by AI Safety Moderation
            </p>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-card/30">
          <div className="text-center text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">Your Messages</p>
            <p className="text-sm mt-1">Select a conversation from the sidebar to start chatting</p>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-xl p-6 border border-border">
            <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
              <Flag className="w-5 h-5 text-red-500" /> Report Conversation
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Our safety team will review this conversation. The other party will not be notified.
            </p>
            <textarea
              className="w-full bg-muted border border-border rounded-xl p-3 text-sm min-h-[100px] mb-4 outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Why are you reporting this conversation? (e.g., Harassment, inappropriate content)"
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowReportModal(false)} className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-muted">Cancel</button>
              <button onClick={handleReport} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-sm">Submit Report</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
