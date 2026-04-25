import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  ClipboardList, Users, Clock, CheckCircle2, Calendar, ChevronRight,
  Loader2, Plus, BookOpenText,
} from "lucide-react";
import { cbtService, Quiz } from "../../../services/cbtService";
import ManualQuizBuilderModal from "./ManualQuizBuilderModal";
import PublishQuizModal from "./PublishQuizModal";

export default function TutorAssignmentsPage() {
  const [quizzes, setQuizzes] = useState<(Quiz & { submissionCount?: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [publishData, setPublishData] = useState<{ questions: any[]; title: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const data = await cbtService.getTutorQuizzes();
      // fetch submission counts
      const withCounts = await Promise.all(
        data.map(async q => {
          const subs = await cbtService.getQuizSubmissions(q.id).catch(() => []);
          return { ...q, submissionCount: subs.length };
        })
      );
      setQuizzes(withCounts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const onPublished = () => {
    setPublishData(null);
    showToast("Assignment published successfully!");
    load();
  };

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "No deadline";

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-7 animate-in fade-in duration-500">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white text-sm px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4" /> {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Assignments</h1>
          <p className="text-muted-foreground mt-1">Manage and review your published CBT assignments.</p>
        </div>
        <button
          onClick={() => setShowBuilder(true)}
          className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-800 transition-colors shadow-sm shadow-blue-200"
        >
          <Plus className="w-4 h-4" /> New Quiz
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 text-blue-700 animate-spin" /></div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-24 bg-card rounded-2xl border border-dashed border-border">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="font-semibold text-foreground">No assignments yet</p>
          <p className="text-muted-foreground text-sm mt-1">Create your first CBT assignment above or from the AI Tools page.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {quizzes.map(quiz => (
            <button
              key={quiz.id}
              onClick={() => navigate(`/app/tutor/assignments/${quiz.id}`)}
              className="w-full bg-card border border-border rounded-2xl p-5 shadow-sm hover:border-blue-400 hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <BookOpenText className="w-5 h-5 text-blue-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-foreground truncate">{quiz.title}</h3>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 group-hover:text-blue-600 transition-colors" />
                  </div>
                  {quiz.description && (
                    <p className="text-muted-foreground text-sm mt-0.5 truncate">{quiz.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><ClipboardList className="w-3.5 h-3.5" />{quiz.questions.length} questions</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{quiz.submissionCount} submitted</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Due {formatDate(quiz.due_date)}</span>
                    {quiz.time_limit_minutes && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{quiz.time_limit_minutes} min</span>}
                    <span className={`px-2 py-0.5 rounded-full font-medium capitalize ${quiz.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>{quiz.status}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Manual Builder Modal */}
      {showBuilder && (
        <ManualQuizBuilderModal
          onClose={() => setShowBuilder(false)}
          onPublish={(questions, title) => {
            setShowBuilder(false);
            setPublishData({ questions, title });
          }}
          onSaveToLibrary={async (questions, title) => {
            try {
              await cbtService.saveCurriculum(title, JSON.stringify(questions, null, 2));
              setShowBuilder(false);
              showToast("Draft saved to library!");
            } catch (err: any) {
              alert("Failed to save: " + err.message);
            }
          }}
        />
      )}

      {/* Publish Modal */}
      {publishData && (
        <PublishQuizModal
          title={publishData.title}
          questions={publishData.questions}
          onClose={() => setPublishData(null)}
          onPublished={onPublished}
        />
      )}
    </div>
  );
}
