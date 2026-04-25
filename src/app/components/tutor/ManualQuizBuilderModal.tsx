import React, { useState } from "react";
import { X, Plus, Trash2, Send, Save, ChevronDown, CheckCircle2, BookOpenText } from "lucide-react";
import { CBTQuestion } from "../../../services/cbtService";

interface Props {
  onClose: () => void;
  onPublish: (questions: CBTQuestion[], title: string) => void;
  onSaveToLibrary?: (questions: CBTQuestion[], title: string) => void;
}

const emptyMCQ = (): CBTQuestion => ({
  type: "mcq",
  question: "",
  options: ["", "", "", ""],
  correctAnswer: "",
  explanation: "",
  points: 1,
});

const emptyTheory = (): CBTQuestion => ({
  type: "theory",
  question: "",
  expectedAnswer: "",
  points: 5,
});

export default function ManualQuizBuilderModal({ onClose, onPublish, onSaveToLibrary }: Props) {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<CBTQuestion[]>([emptyMCQ()]);
  const [errors, setErrors] = useState<string[]>([]);

  const addQuestion = (type: "mcq" | "theory") => {
    setQuestions(p => [...p, type === "mcq" ? emptyMCQ() : emptyTheory()]);
  };

  const removeQuestion = (i: number) => {
    setQuestions(p => p.filter((_, j) => j !== i));
  };

  const updateQuestion = (i: number, patch: Partial<CBTQuestion>) => {
    setQuestions(p => p.map((q, j) => j === i ? { ...q, ...patch } : q));
  };

  const updateOption = (qi: number, oi: number, value: string) => {
    setQuestions(p => p.map((q, j) => {
      if (j !== qi) return q;
      const opts = [...(q.options || ["", "", "", ""])];
      opts[oi] = value;
      return { ...q, options: opts };
    }));
  };

  const validate = () => {
    const errs: string[] = [];
    if (!title.trim()) errs.push("Quiz title is required.");
    if (questions.length === 0) errs.push("Add at least one question.");
    questions.forEach((q, i) => {
      if (!q.question.trim()) errs.push(`Question ${i + 1}: question text is required.`);
      if (q.type === "mcq") {
        if ((q.options || []).some(o => !o.trim())) errs.push(`Q${i+1}: all 4 options are required.`);
        if (!q.correctAnswer) errs.push(`Q${i+1}: select a correct answer.`);
      }
    });
    setErrors(errs);
    return errs.length === 0;
  };

  const inputCls = "w-full border border-border rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none bg-background transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-3xl rounded-2xl shadow-2xl border border-border flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center">
              <BookOpenText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">Manual Quiz Builder</h2>
              <p className="text-xs text-muted-foreground">{questions.length} question{questions.length !== 1 ? "s" : ""} · Mix MCQ and Theory</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              {errors.map((e, i) => <p key={i} className="text-red-700 text-sm">{e}</p>)}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1.5">Quiz Title *</label>
            <input className={inputCls} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Unit 1 Assessment" />
          </div>

          {/* Questions */}
          {questions.map((q, qi) => (
            <div key={qi} className="bg-muted/30 border border-border rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">{qi + 1}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${q.type === "mcq" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                    {q.type === "mcq" ? "Multiple Choice" : "Theory"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" min={1} value={q.points ?? 1} onChange={e => updateQuestion(qi, { points: Number(e.target.value) })}
                    className="w-20 border border-border rounded-lg px-2.5 py-1.5 text-xs text-center outline-none focus:ring-2 focus:ring-blue-600 bg-card" title="Points" />
                  <span className="text-xs text-muted-foreground">pts</span>
                  {questions.length > 1 && (
                    <button onClick={() => removeQuestion(qi)} className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors text-muted-foreground">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Question *</label>
                <textarea rows={2} className={inputCls + " resize-none"} value={q.question} onChange={e => updateQuestion(qi, { question: e.target.value })} placeholder="Enter your question..." />
              </div>

              {q.type === "mcq" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(q.options || ["", "", "", ""]).map((opt, oi) => (
                      <div key={oi} className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">{String.fromCharCode(65 + oi)}.</span>
                        <input
                          className={`${inputCls} pl-7 ${q.correctAnswer === opt && opt ? "border-emerald-400 bg-emerald-50/50" : ""}`}
                          value={opt}
                          onChange={e => updateOption(qi, oi, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Correct Answer *</label>
                    <div className="relative">
                      <select className={inputCls + " appearance-none"} value={q.correctAnswer || ""} onChange={e => updateQuestion(qi, { correctAnswer: e.target.value })}>
                        <option value="">— Select correct option —</option>
                        {(q.options || []).filter(o => o.trim()).map((opt, oi) => (
                          <option key={oi} value={opt}>{String.fromCharCode(65 + oi)}. {opt}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Explanation <span className="font-normal">(shown after submission)</span></label>
                    <input className={inputCls} value={q.explanation || ""} onChange={e => updateQuestion(qi, { explanation: e.target.value })} placeholder="Why is this the correct answer?" />
                  </div>
                </>
              )}

              {q.type === "theory" && (
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Expected Answer <span className="font-normal">(used for AI grading reference)</span></label>
                  <textarea rows={3} className={inputCls + " resize-none"} value={q.expectedAnswer || ""} onChange={e => updateQuestion(qi, { expectedAnswer: e.target.value })} placeholder="Describe what a good answer should include..." />
                </div>
              )}
            </div>
          ))}

          {/* Add question buttons */}
          <div className="flex gap-3">
            <button onClick={() => addQuestion("mcq")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-blue-300 text-blue-700 text-sm font-medium hover:bg-blue-50 transition-colors flex-1 justify-center">
              <Plus className="w-4 h-4" /> Add MCQ
            </button>
            <button onClick={() => addQuestion("theory")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-purple-300 text-purple-700 text-sm font-medium hover:bg-purple-50 transition-colors flex-1 justify-center">
              <Plus className="w-4 h-4" /> Add Theory
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-6 border-t border-border flex-shrink-0">
          <button onClick={onClose} className="py-2.5 px-4 rounded-xl border border-border text-muted-foreground text-sm font-medium hover:bg-muted/50 transition-colors">
            Cancel
          </button>
          {onSaveToLibrary && (
            <button onClick={() => { if (validate()) onSaveToLibrary(questions, title); }}
              className="flex items-center gap-2 py-2.5 px-4 rounded-xl border border-border text-foreground text-sm font-medium hover:bg-muted/50 transition-colors">
              <Save className="w-4 h-4" /> Save Draft
            </button>
          )}
          <button
            onClick={() => { if (validate()) onPublish(questions, title); }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 text-white text-sm font-semibold hover:from-blue-800 hover:to-indigo-800 transition-all shadow-lg shadow-blue-200"
          >
            <Send className="w-4 h-4" /> Publish Assignment
          </button>
        </div>
      </div>
    </div>
  );
}
