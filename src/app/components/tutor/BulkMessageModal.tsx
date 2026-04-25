import { useState } from "react";
import { Mail, X, Loader2, AlertTriangle } from "lucide-react";
import { messageService } from "../../../services/messageService";

interface BulkMessageModalProps {
  onClose: () => void;
  studentsCount: number;
  studentIds: string[];
}

export default function BulkMessageModal({ onClose, studentsCount, studentIds }: BulkMessageModalProps) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!content.trim()) return;
    setIsSending(true);
    try {
      await messageService.sendBulkMessage(studentIds, content);
      alert("Bulk message sent successfully!");
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card w-full max-w-lg rounded-2xl shadow-xl p-6 border border-border animate-in slide-in-from-bottom-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" /> Message All Students
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Sending to {studentsCount} students</p>
          </div>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:bg-muted rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type your announcement here..."
          className="w-full bg-muted border border-border rounded-xl p-4 text-sm min-h-[150px] outline-none focus:ring-2 focus:ring-blue-600 transition-all mb-4 resize-none"
        />

        <div className="flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Subject to AI Safety Moderation
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors text-foreground">
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={isSending || !content.trim()}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              Send Broadcast
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
