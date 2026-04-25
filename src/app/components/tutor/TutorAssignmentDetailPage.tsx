import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ChevronLeft, Loader2, Users, CheckCircle2, XCircle, Clock,
  Award, BookOpenText, Sparkles, Save, ChevronDown, ChevronUp,
} from "lucide-react";
import { cbtService, Quiz, QuizScore, CBTQuestion } from "../../../services/cbtService";
import { chatCompletion, MODELS } from "../../services/nvidia";

export default function TutorAssignmentDetailPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [submissions, setSubmissions] = useState<QuizScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [theoryScores, setTheoryScores] = useState<Record<string, Record<number, number>>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    if (!quizId) return;
    (async () => {
      setLoading(true);
      try {
        const [quizList, subs] = await Promise.all([
          cbtService.getTutorQuizzes(),
          cbtService.getQuizSubmissions(quizId),
        ]);
        setQuiz(quizList.find(q => q.id === quizId) || null);
        setSubmissions(subs);
        // Init scores from existing final_theory_scores
        const init: Record<string, Record<number, number>> = {};
        subs.forEach(s => {
          if (s.final_theory_scores) init[s.id] = s.final_theory_scores;
        });
        setTheoryScores(init);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, [quizId]);

  const theoryQs = (quiz?.questions || []).filter(q => q.type === "theory");

  const runAIGrading = async (sub: QuizScore) => {
    if (!quiz) return;
    setGradingId(sub.id);
    try {
      const suggestions: Record<number, number> = { ...(theoryScores[sub.id] || {}) };
      for (let i = 0; i < quiz.questions.length; i++) {
        const q = quiz.questions[i];
        if (q.type !== "theory") continue;
        const studentAns = sub.answers?.[i]?.answer || "";
        const prompt = `You are grading a student's theory answer.
Question: ${q.question}
Expected answer: ${q.expectedAnswer || "(not provided)"}
Student's answer: ${studentAns}
Max points: ${q.points ?? 5}

Reply with ONLY a single integer number between 0 and ${q.points ?? 5} representing the score. No explanation.`;
        const result = await chatCompletion([{ role: "user", content: prompt }], { model: MODELS.NANO, temperature: 0.2, maxTokens: 5 });
        const score = Math.min(q.points ?? 5, Math.max(0, parseInt(result.trim()) || 0));
        suggestions[i] = score;
      }
      setTheoryScores(p => ({ ...p, [sub.id]: suggestions }));
      showToast("AI grading complete — review and adjust before saving.");
    } catch (err: any) {
      alert("AI grading failed: " + err.message);
    } finally {
      setGradingId(null);
    }
  };

  const saveScores = async (sub: QuizScore) => {
    if (!quiz) return;
    setSavingId(sub.id);
    try {
      const scores = theoryScores[sub.id] || {};
      const theoryTotal = Object.values(scores).reduce((a, b) => a + b, 0);
      const mcqTotal = sub.score || 0;
      const total = mcqTotal + theoryTotal;
      await cbtService.updateTheoryScores(sub.id, scores, total, sub.max_score || quiz.questions.reduce((a, q) => a + (q.points ?? 1), 0), quiz.pass_mark_percent ?? 50);
      setSubmissions(p => p.map(s => s.id === sub.id ? { ...s, final_theory_scores: scores, total_score: total, passed: (total / (sub.max_score || 1)) * 100 >= (quiz.pass_mark_percent ?? 50) } : s));
      showToast("Scores saved successfully!");
    } catch (err: any) {
      alert("Failed to save: " + err.message);
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <div className="flex justify-center py-40"><Loader2 className="w-8 h-8 text-blue-700 animate-spin" /></div>;
  if (!quiz) return <div className="p-8 text-muted-foreground">Assignment not found.</div>;

  const maxScore = quiz.questions.reduce((a, q) => a + (q.points ?? 1), 0);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-7 animate-in fade-in duration-500">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white text-sm px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4" /> {toast}
        </div>
      )}

      {/* Back + Header */}
      <button onClick={() => navigate("/app/tutor/assignments")} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm transition-colors mb-2">
        <ChevronLeft className="w-4 h-4" /> Back to Assignments
      </button>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <BookOpenText className="w-6 h-6 text-blue-700" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{quiz.title}</h1>
            {quiz.description && <p className="text-muted-foreground text-sm mt-1">{quiz.description}</p>}
            <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><BookOpenText className="w-3.5 h-3.5" />{quiz.questions.length} questions</span>
              <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" />{maxScore} total points</span>
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{submissions.length} submissions</span>
              {quiz.pass_mark_percent && <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />Pass: {quiz.pass_mark_percent}%</span>}
              {quiz.time_limit_minutes && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{quiz.time_limit_minutes} min</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Submissions */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Student Submissions</h2>
        {submissions.length === 0 ? (
          <div className="text-center py-20 bg-card border border-dashed border-border rounded-2xl">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-muted-foreground">No submissions yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map(sub => {
              const isOpen = expanded === sub.id;
              const studentScores = theoryScores[sub.id] || sub.final_theory_scores || {};
              const theoryEarned = Object.values(studentScores).reduce((a: number, b) => a + (b as number), 0);
              const total = (sub.score || 0) + theoryEarned;
              const pct = maxScore > 0 ? Math.round((total / maxScore) * 100) : 0;
              const passed = pct >= (quiz.pass_mark_percent ?? 50);

              return (
                <div key={sub.id} className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                  <button className="w-full flex items-center gap-4 p-5 text-left hover:bg-muted/30 transition-colors" onClick={() => setExpanded(isOpen ? null : sub.id)}>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0 overflow-hidden">
                      {sub.users?.avatar_url
                        ? <img src={sub.users.avatar_url} className="w-full h-full object-cover" alt="" />
                        : (sub.users?.full_name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm">{sub.users?.full_name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{sub.users?.email || ""} · {new Date(sub.completed_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">{total}/{maxScore} pts</p>
                        <p className="text-xs text-muted-foreground">{pct}%</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${passed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {passed ? "Passed" : "Failed"}
                      </span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-border p-5 space-y-5">
                      {/* Questions & Answers */}
                      {quiz.questions.map((q, i) => {
                        const ans = sub.answers?.[i];
                        const isTheory = q.type === "theory";
                        const isCorrect = !isTheory && ans?.isCorrect;
                        const tscore = studentScores[i] ?? null;

                        return (
                          <div key={i} className={`rounded-xl p-4 border ${isTheory ? "bg-purple-50/50 border-purple-100" : isCorrect ? "bg-emerald-50/50 border-emerald-100" : "bg-red-50/50 border-red-100"}`}>
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <p className="text-sm font-semibold text-foreground">{i + 1}. {q.question}</p>
                              <span className="text-xs text-muted-foreground flex-shrink-0">{q.points ?? 1} pts</span>
                            </div>

                            {!isTheory ? (
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Student answered: <span className={`font-semibold ${isCorrect ? "text-emerald-700" : "text-red-700"}`}>{ans?.answer || "—"}</span></p>
                                {!isCorrect && <p className="text-xs text-emerald-700">Correct: {q.correctAnswer}</p>}
                                {q.explanation && <p className="text-xs text-muted-foreground italic mt-1">{q.explanation}</p>}
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <p className="text-xs text-muted-foreground">Student's answer:</p>
                                <div className="bg-white border border-purple-100 rounded-lg p-3 text-sm text-foreground">{ans?.answer || <em className="text-muted-foreground">No answer provided</em>}</div>
                                {q.expectedAnswer && <p className="text-xs text-muted-foreground">Expected: <span className="italic">{q.expectedAnswer}</span></p>}
                                <div className="flex items-center gap-2 mt-2">
                                  <label className="text-xs font-medium text-muted-foreground">Score:</label>
                                  <input
                                    type="number" min={0} max={q.points ?? 5}
                                    value={tscore ?? ""}
                                    placeholder={`0–${q.points ?? 5}`}
                                    onChange={e => setTheoryScores(p => ({ ...p, [sub.id]: { ...(p[sub.id] || {}), [i]: Number(e.target.value) } }))}
                                    className="w-20 border border-border rounded-lg px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-600 bg-card text-center"
                                  />
                                  <span className="text-xs text-muted-foreground">/ {q.points ?? 5}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Actions for theory grading */}
                      {theoryQs.length > 0 && (
                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={() => runAIGrading(sub)}
                            disabled={gradingId === sub.id}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 text-white text-sm font-medium hover:from-violet-700 hover:to-purple-800 transition-all shadow-sm disabled:opacity-60"
                          >
                            {gradingId === sub.id ? <><Loader2 className="w-4 h-4 animate-spin" /> Grading...</> : <><Sparkles className="w-4 h-4" /> AI Grade Theory</>}
                          </button>
                          <button
                            onClick={() => saveScores(sub)}
                            disabled={savingId === sub.id}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-60"
                          >
                            {savingId === sub.id ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Scores</>}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
