import { useState, useEffect } from "react";
import {
  ClipboardList, Calendar, Loader2, CheckCircle2, Clock,
  AlertCircle, BookOpen, ChevronDown, ChevronUp, Award, XCircle,
} from "lucide-react";
import { cbtService, Quiz, CBTQuestion, StudentAnswer } from "../../../services/cbtService";
import { useUserProfile } from "../../context/UserProfileContext";

function formatDueDate(dateStr: string | null): string {
  if (!dateStr) return "No deadline";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── CBT Exam Component ────────────────────────────────────────
function CBTExam({ quiz, onSubmit }: { quiz: Quiz & { submission: any }; onSubmit: () => void }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; maxScore: number; passed: boolean | null; answers: StudentAnswer[] } | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(
    quiz.time_limit_minutes ? quiz.time_limit_minutes * 60 : null
  );

  // countdown timer
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft(p => (p !== null ? p - 1 : null)), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  const allAnswered = quiz.questions.every((_, i) => answers[i] !== undefined && answers[i] !== "");

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const builtAnswers: StudentAnswer[] = quiz.questions.map((q, i) => ({
        questionIndex: i,
        answer: answers[i] || "",
      }));
      const res = await cbtService.submitQuizAttempt(quiz.id, quiz.questions, builtAnswers);
      setResult({
        score: res.score,
        maxScore: res.maxScore,
        passed: res.submission.passed,
        answers: res.submission.answers || builtAnswers,
      });
    } catch (err: any) {
      alert("Submission failed: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Score screen after submission
  if (result) {
    const pct = result.maxScore > 0 ? Math.round((result.score / result.maxScore) * 100) : 0;
    const theoryPending = quiz.questions.some(q => q.type === "theory");
    return (
      <div className="space-y-6">
        {/* Score card */}
        <div className={`rounded-2xl border p-7 text-center ${result.passed === true ? "bg-emerald-50 border-emerald-200" : result.passed === false ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"}`}>
          <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold ${result.passed === true ? "bg-emerald-100 text-emerald-700" : result.passed === false ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
            {pct}%
          </div>
          <h3 className="text-xl font-bold text-foreground mb-1">
            {result.passed === true ? "🎉 Passed!" : result.passed === false ? "Assignment Failed" : "Submitted!"}
          </h3>
          <p className="text-muted-foreground text-sm">
            MCQ Score: <strong>{result.score}/{quiz.questions.filter(q => q.type !== "theory").reduce((a, q) => a + (q.points ?? 1), 0)}</strong>
          </p>
          {theoryPending && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-700 text-sm">
              <Clock className="inline w-4 h-4 mr-1" />Theory questions are being reviewed by your tutor.
            </div>
          )}
        </div>

        {/* Review answers */}
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground">Answer Review</h4>
          {quiz.questions.map((q, i) => {
            const a = result.answers[i];
            const isTheory = q.type === "theory";
            const isCorrect = !isTheory && a?.isCorrect;
            return (
              <div key={i} className={`rounded-xl border p-4 ${isTheory ? "border-purple-100 bg-purple-50/40" : isCorrect ? "border-emerald-100 bg-emerald-50/40" : "border-red-100 bg-red-50/40"}`}>
                <div className="flex items-start gap-2 mb-2">
                  {isTheory ? <Clock className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" /> : isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />}
                  <p className="text-sm font-medium text-foreground">{q.question}</p>
                </div>
                <p className="text-xs text-muted-foreground ml-6">Your answer: <span className="font-medium text-foreground">{a?.answer || "—"}</span></p>
                {!isTheory && !isCorrect && <p className="text-xs text-emerald-700 ml-6 mt-0.5">Correct: {q.correctAnswer}</p>}
                {!isTheory && q.explanation && <p className="text-xs text-muted-foreground ml-6 mt-0.5 italic">{q.explanation}</p>}
              </div>
            );
          })}
        </div>
        <button onClick={onSubmit} className="w-full py-2.5 rounded-xl bg-blue-700 text-white text-sm font-medium hover:bg-blue-800 transition-colors">
          Back to Assignments
        </button>
      </div>
    );
  }

  // Already submitted view
  if (quiz.submission) {
    const sub = quiz.submission;
    const pct = sub.max_score > 0 ? Math.round((sub.total_score / sub.max_score) * 100) : 0;
    return (
      <div className={`rounded-2xl border p-7 text-center ${sub.passed === true ? "bg-emerald-50 border-emerald-200" : sub.passed === false ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"}`}>
        <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold ${sub.passed === true ? "bg-emerald-100 text-emerald-700" : sub.passed === false ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
          {pct}%
        </div>
        <h3 className="text-xl font-bold text-foreground mb-1">{sub.passed === true ? "🎉 Passed!" : sub.passed === false ? "Failed" : "Awaiting Review"}</h3>
        <p className="text-muted-foreground text-sm">Score: {sub.total_score ?? sub.score}/{sub.max_score ?? "?"} pts</p>
        <p className="text-xs text-muted-foreground mt-2">Submitted {new Date(sub.completed_at).toLocaleDateString()}</p>
      </div>
    );
  }

  // Exam UI
  return (
    <div className="space-y-6">
      {/* Timer */}
      {timeLeft !== null && (
        <div className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl w-fit ${timeLeft < 60 ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
          <Clock className="w-4 h-4" />
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")} remaining
        </div>
      )}

      {quiz.description && (
        <div className="bg-muted/40 rounded-xl px-4 py-3 text-sm text-muted-foreground border border-border">
          {quiz.description}
        </div>
      )}

      {quiz.questions.map((q: CBTQuestion, i: number) => (
        <div key={i} className="bg-card border border-border rounded-2xl p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
              <p className="text-sm font-semibold text-foreground">{q.question}</p>
            </div>
            <span className="text-xs text-muted-foreground flex-shrink-0">{q.points ?? 1} pt{(q.points ?? 1) > 1 ? "s" : ""}</span>
          </div>

          {/* MCQ options */}
          {(q.type === "mcq" || !q.type) && (
            <div className="space-y-2 pl-10">
              {(q.options || []).map((opt: string, oi: number) => (
                <label key={oi} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${answers[i] === opt ? "border-blue-500 bg-blue-50 text-blue-800" : "border-border hover:border-blue-300 hover:bg-muted/30"}`}>
                  <input type="radio" name={`q-${i}`} value={opt} checked={answers[i] === opt} onChange={() => setAnswers(p => ({ ...p, [i]: opt }))} className="accent-blue-600" />
                  <span className="text-sm">{String.fromCharCode(65 + oi)}. {opt}</span>
                </label>
              ))}
            </div>
          )}

          {/* Theory text area */}
          {q.type === "theory" && (
            <div className="pl-10">
              <textarea
                rows={4}
                placeholder="Type your answer here..."
                value={answers[i] || ""}
                onChange={e => setAnswers(p => ({ ...p, [i]: e.target.value }))}
                className="w-full border border-border rounded-xl px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none bg-background transition-all"
              />
            </div>
          )}
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={submitting || !allAnswered}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 text-white font-semibold text-sm hover:from-blue-800 hover:to-indigo-800 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
      >
        {submitting ? <><Loader2 className="inline w-4 h-4 animate-spin mr-2" />Submitting...</> : "Submit Assignment"}
      </button>
      {!allAnswered && <p className="text-center text-xs text-muted-foreground">Please answer all questions before submitting.</p>}
    </div>
  );
}

// ── Main AssignmentsPage ───────────────────────────────────────
export default function AssignmentsPage() {
  const { profile } = useUserProfile();
  const [quizzes, setQuizzes] = useState<(Quiz & { submission: any })[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "submitted">("all");
  const [openQuizId, setOpenQuizId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.id) return;
    load();
  }, [profile?.id]);

  const load = async () => {
    try {
      setLoading(true);
      await cbtService.markAssignmentNotificationsSeen();
      const data = await cbtService.getStudentQuizzes();
      setQuizzes(data as any);
      if (data.length > 0 && !expandedId) setExpandedId(data[0].id);
    } catch (err) {
      console.error("Failed to load quizzes:", err);
    } finally {
      setLoading(false);
    }
  };

  const pending = quizzes.filter(q => !q.submission);
  const submitted = quizzes.filter(q => !!q.submission);
  const filtered = quizzes.filter(q => {
    if (activeFilter === "pending") return !q.submission;
    if (activeFilter === "submitted") return !!q.submission;
    return true;
  });

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 className="w-8 h-8 text-blue-700 animate-spin" /></div>;

  // Full-screen CBT exam
  if (openQuizId) {
    const quiz = quizzes.find(q => q.id === openQuizId);
    if (!quiz) return null;
    return (
      <div className="p-4 sm:p-6 max-w-3xl mx-auto">
        <button onClick={() => setOpenQuizId(null)} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors">
          <ChevronUp className="w-4 h-4 rotate-[-90deg]" /> Back
        </button>
        <h2 className="text-2xl font-bold text-foreground mb-6">{quiz.title}</h2>
        <CBTExam quiz={quiz} onSubmit={() => { setOpenQuizId(null); load(); }} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Assignments</h1>
          <p className="text-muted-foreground text-sm">{pending.length} pending · {submitted.length} submitted</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["all", "pending", "submitted"] as const).map(f => (
          <button key={f} onClick={() => setActiveFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${activeFilter === f ? "bg-blue-700 text-white shadow-sm" : "bg-card text-muted-foreground border border-border hover:border-blue-500 hover:text-blue-600"}`}>
            {f === "all" ? `All (${quizzes.length})` : f === "pending" ? `Pending (${pending.length})` : `Submitted (${submitted.length})`}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-muted-foreground">No assignments found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(quiz => {
            const isSubmitted = !!quiz.submission;
            const isExpanded = expandedId === quiz.id;
            const isOverdue = !isSubmitted && quiz.due_date && new Date(quiz.due_date) < new Date();
            const statusLabel = isSubmitted ? "Submitted" : isOverdue ? "Overdue" : "Pending";
            const statusCls = isSubmitted ? "bg-emerald-100 text-emerald-700 border-emerald-200" : isOverdue ? "bg-red-100 text-red-700 border-red-200" : "bg-amber-100 text-amber-700 border-amber-200";

            return (
              <div key={quiz.id} className={`bg-card rounded-2xl border shadow-sm overflow-hidden transition-all duration-300 ${isExpanded ? "border-blue-400 shadow-md" : "border-border hover:border-blue-200"}`}>
                {/* Header row */}
                <div className="flex items-start gap-4 p-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : quiz.id)}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isSubmitted ? "bg-emerald-50" : "bg-blue-100"}`}>
                    <ClipboardList className={`w-5 h-5 ${isSubmitted ? "text-emerald-500" : "text-blue-700"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start gap-2 mb-1.5">
                      <h3 className="text-foreground text-sm font-semibold flex-1 min-w-0">{quiz.title}</h3>
                      <div className="flex gap-2 flex-shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${statusCls}`}>{statusLabel}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">CBT</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{quiz.questions.length} questions</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Due {formatDueDate(quiz.due_date)}</span>
                      {quiz.time_limit_minutes && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{quiz.time_limit_minutes} min</span>}
                      <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" />{quiz.questions.reduce((a, q) => a + (q.points ?? 1), 0)} pts total</span>
                    </div>
                  </div>
                  <button className="text-muted-foreground flex-shrink-0 p-1 hover:bg-muted rounded-lg">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>

                {/* Expanded */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-border pt-4 space-y-4">
                    {quiz.description && (
                      <p className="text-muted-foreground text-sm leading-relaxed">{quiz.description}</p>
                    )}
                    {isSubmitted ? (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-5 py-4 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        <div>
                          <p className="text-emerald-700 text-sm font-medium">Assignment Submitted</p>
                          <p className="text-emerald-500 text-xs">
                            Score: {quiz.submission.total_score ?? quiz.submission.score}/{quiz.submission.max_score ?? "?"} ·{" "}
                            {quiz.submission.passed === true ? "Passed 🎉" : quiz.submission.passed === false ? "Failed" : "Awaiting tutor review"}
                          </p>
                        </div>
                      </div>
                    ) : isOverdue ? (
                      <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <div>
                          <p className="text-red-700 text-sm font-medium">Assignment Overdue</p>
                          <p className="text-red-500 text-xs">Contact your tutor if you need an extension.</p>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setOpenQuizId(quiz.id)}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 text-white font-semibold text-sm hover:from-blue-800 hover:to-indigo-800 transition-all shadow-md shadow-blue-200"
                      >
                        Start CBT Exam
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
