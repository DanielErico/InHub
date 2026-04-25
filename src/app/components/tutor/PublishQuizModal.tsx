import React, { useState, useEffect } from "react";
import { X, Send, Loader2, Calendar, Clock, BookOpen, Target, AlignLeft } from "lucide-react";
import { cbtService, CBTQuestion } from "../../../services/cbtService";
import { courseService } from "../../../services/courseService";

interface Props {
  title: string;
  questions: CBTQuestion[];
  onClose: () => void;
  onPublished: () => void;
}

export default function PublishQuizModal({ title: initialTitle, questions, onClose, onPublished }: Props) {
  const [form, setForm] = useState({
    title: initialTitle,
    description: "",
    courseId: "",
    dueDate: "",
    timeLimitMinutes: "",
    passMarkPercent: "50",
  });
  const [tutorCourses, setTutorCourses] = useState<any[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    courseService.getTutorCourses().then(setTutorCourses).catch(console.error);
  }, []);

  const handlePublish = async () => {
    if (!form.title.trim()) { setError("Title is required."); return; }
    setPublishing(true);
    setError(null);
    try {
      await cbtService.publishQuiz(form.title, questions, {
        description: form.description || undefined,
        courseId: form.courseId || null,
        dueDate: form.dueDate || null,
        timeLimitMinutes: form.timeLimitMinutes ? Number(form.timeLimitMinutes) : null,
        passMarkPercent: Number(form.passMarkPercent),
      });
      onPublished();
    } catch (err: any) {
      setError(err.message || "Failed to publish.");
      setPublishing(false);
    }
  };

  const inputCls = "w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none bg-card transition-all";
  const labelCls = "block text-sm font-medium text-foreground/80 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-lg rounded-2xl shadow-2xl border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
              <Send className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">Publish as Assignment</h2>
              <p className="text-xs text-muted-foreground">{questions.length} question{questions.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
          )}

          <div>
            <label className={labelCls}>Assignment Title *</label>
            <input className={inputCls} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          </div>

          <div>
            <label className={labelCls}><AlignLeft className="inline w-3.5 h-3.5 mr-1" />Description <span className="text-muted-foreground font-normal">(optional)</span></label>
            <textarea className={inputCls + " min-h-[80px] resize-none"} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Instructions or context for students..." />
          </div>

          <div>
            <label className={labelCls}><BookOpen className="inline w-3.5 h-3.5 mr-1" />Link to Course <span className="text-muted-foreground font-normal">(optional)</span></label>
            <select className={inputCls} value={form.courseId} onChange={e => setForm(p => ({ ...p, courseId: e.target.value }))}>
              <option value="">— General (all students) —</option>
              {tutorCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}><Calendar className="inline w-3.5 h-3.5 mr-1" />Due Date <span className="text-muted-foreground font-normal">(optional)</span></label>
              <input type="datetime-local" className={inputCls} value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}><Clock className="inline w-3.5 h-3.5 mr-1" />Time Limit (mins)</label>
              <input type="number" min={5} className={inputCls} value={form.timeLimitMinutes} onChange={e => setForm(p => ({ ...p, timeLimitMinutes: e.target.value }))} placeholder="No limit" />
            </div>
          </div>

          <div>
            <label className={labelCls}><Target className="inline w-3.5 h-3.5 mr-1" />Pass Mark (%)</label>
            <input type="number" min={0} max={100} className={inputCls} value={form.passMarkPercent} onChange={e => setForm(p => ({ ...p, passMarkPercent: e.target.value }))} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-6 border-t border-border">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-muted-foreground text-sm font-medium hover:bg-muted/50 transition-colors">
            Cancel
          </button>
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 text-white text-sm font-semibold hover:from-blue-800 hover:to-indigo-800 transition-all shadow-lg shadow-blue-200 disabled:opacity-60"
          >
            {publishing ? <><Loader2 className="w-4 h-4 animate-spin" /> Publishing...</> : <><Send className="w-4 h-4" /> Publish Assignment</>}
          </button>
        </div>
      </div>
    </div>
  );
}
