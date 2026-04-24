import { useState, useEffect } from "react";
import {
  ClipboardList,
  Calendar,
  Upload,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  BookOpen,
  Lightbulb,
  ArrowRight,
  X,
} from "lucide-react";
import { courseService, Assignment } from "../../../services/courseService";
import { useUserProfile } from "../../context/UserProfileContext";

const statusConfig = {
  pending: { label: "Pending", color: "text-amber-600 bg-amber-50 border-amber-200", icon: Clock },
  submitted: { label: "Submitted", color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
  overdue: { label: "Overdue", color: "text-red-600 bg-red-50 border-red-200", icon: AlertCircle },
};

const priorityConfig = {
  high: { label: "High", color: "bg-red-100 text-red-600" },
  medium: { label: "Medium", color: "bg-amber-100 text-amber-600" },
  low: { label: "Low", color: "bg-emerald-100 text-emerald-600" },
};

function getStatus(a: Assignment): "pending" | "submitted" | "overdue" {
  if ((a.assignment_submissions || []).length > 0) return "submitted";
  if (a.due_date && new Date(a.due_date) < new Date()) return "overdue";
  return "pending";
}

function formatDueDate(dateStr: string | null): string {
  if (!dateStr) return "No deadline";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface AIHelperState {
  isOpen: boolean;
  isLoading: boolean;
  isLoaded: boolean;
  hints: { breakdown: string[]; hints: string[]; steps: string[] } | null;
}

const defaultHints = {
  breakdown: [
    "Read the assignment description carefully",
    "Plan your approach before writing",
    "Research relevant concepts",
    "Draft your solution",
    "Review and refine your work",
  ],
  hints: [
    "Break the problem into smaller tasks",
    "Look for examples in course materials",
    "Don't hesitate to revisit earlier lessons",
    "Test your solution step by step",
  ],
  steps: [
    "1. Understand what is being asked",
    "2. Gather resources and references",
    "3. Create an outline or plan",
    "4. Write your first draft",
    "5. Review, refine and submit",
  ],
};

export default function AssignmentsPage() {
  const { profile } = useUserProfile();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "submitted">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [aiHelpers, setAiHelpers] = useState<Record<string, AIHelperState>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  const [submitSuccess, setSubmitSuccess] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!profile?.id) return;
    loadAssignments();
  }, [profile?.id]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await courseService.getAssignments(profile!.id);
      setAssignments(data);
      if (data.length > 0) setExpandedId(data[0].id);
    } catch (err) {
      console.error("Failed to load assignments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (assignmentId: string) => {
    if (!profile?.id) return;
    setSubmitting((p) => ({ ...p, [assignmentId]: true }));
    try {
      await courseService.submitAssignment(assignmentId, profile.id, uploadedFiles[assignmentId] ?? null);
      setSubmitSuccess((p) => ({ ...p, [assignmentId]: true }));
      await loadAssignments();
    } catch (err) {
      console.error("Submit failed:", err);
    } finally {
      setSubmitting((p) => ({ ...p, [assignmentId]: false }));
    }
  };

  const pending = assignments.filter((a) => getStatus(a) === "pending");
  const submitted = assignments.filter((a) => getStatus(a) === "submitted");

  const filtered = assignments.filter((a) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "pending") return getStatus(a) === "pending" || getStatus(a) === "overdue";
    return getStatus(a) === "submitted";
  });

  const toggleAssignment = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getAIHelp = (id: string) => {
    setAiHelpers((prev) => ({
      ...prev,
      [id]: { isOpen: true, isLoading: true, isLoaded: false, hints: null },
    }));
    setTimeout(() => {
      setAiHelpers((prev) => ({
        ...prev,
        [id]: { isOpen: true, isLoading: false, isLoaded: true, hints: defaultHints },
      }));
    }, 2000);
  };

  const closeAIHelper = (id: string) => {
    setAiHelpers((prev) => ({ ...prev, [id]: { ...prev[id], isOpen: false } }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-blue-700 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl text-foreground mb-1">Assignments</h1>
          <p className="text-muted-foreground text-sm">
            {pending.length} pending · {submitted.length} submitted
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(["all", "pending", "submitted"] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 capitalize ${
              activeFilter === filter
                ? "bg-blue-700 text-white shadow-sm"
                : "bg-card text-muted-foreground border border-border hover:border-blue-500 hover:text-blue-600"
            }`}
          >
            {filter === "all"
              ? `All (${assignments.length})`
              : filter === "pending"
              ? `Pending (${pending.length})`
              : `Submitted (${submitted.length})`}
          </button>
        ))}
      </div>

      {/* Assignments List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-muted-foreground">No assignments found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((assignment) => {
            const statusKey = getStatus(assignment);
            const isExpanded = expandedId === assignment.id;
            const status = statusConfig[statusKey];
            const priority = priorityConfig[(assignment.priority as keyof typeof priorityConfig) || "medium"];
            const StatusIcon = status.icon;
            const aiHelper = aiHelpers[assignment.id];
            const file = uploadedFiles[assignment.id];

            return (
              <div
                key={assignment.id}
                className={`bg-card rounded-2xl border shadow-sm overflow-hidden transition-all duration-300 ${
                  isExpanded ? "border-blue-400 shadow-md" : "border-border hover:border-blue-200"
                }`}
              >
                {/* Assignment Header */}
                <div
                  className="flex items-start gap-4 p-5 cursor-pointer"
                  onClick={() => toggleAssignment(assignment.id)}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    statusKey === "submitted" ? "bg-emerald-50" : "bg-blue-100"
                  }`}>
                    <ClipboardList className={`w-5 h-5 ${statusKey === "submitted" ? "text-emerald-500" : "text-blue-700"}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start gap-2 mb-1.5">
                      <h3 className="text-foreground text-sm font-semibold flex-1 min-w-0">{assignment.title}</h3>
                      <div className="flex gap-2 flex-shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${status.color}`}>
                          {status.label}
                        </span>
                        {priority && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${priority.color}`}>
                            {priority.label}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        {assignment.courses?.title || "General"}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Due {formatDueDate(assignment.due_date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <StatusIcon className="w-3.5 h-3.5" />
                        {assignment.points} pts
                      </div>
                    </div>
                  </div>

                  <button className="text-muted-foreground flex-shrink-0 p-1 hover:bg-muted rounded-lg">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 space-y-5 border-t border-border pt-4">
                    {/* Description */}
                    <div>
                      <h4 className="text-foreground text-sm font-medium mb-2">Assignment Description</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {assignment.description || "No description provided."}
                      </p>
                    </div>

                    {/* Submit */}
                    {statusKey === "pending" && (
                      <div>
                        <h4 className="text-foreground text-sm font-medium mb-2">Submit Your Work</h4>
                        <label
                          className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all ${
                            file
                              ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20"
                              : "border-border hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          }`}
                        >
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                setUploadedFiles((prev) => ({ ...prev, [assignment.id]: e.target.files![0] }));
                              }
                            }}
                          />
                          {file ? (
                            <>
                              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                              <div className="text-center">
                                <p className="text-emerald-700 text-sm font-medium">File Selected</p>
                                <p className="text-emerald-500 text-xs">{file.name}</p>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                                <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="text-center">
                                <p className="text-foreground text-sm font-medium">Drop files here or click to upload</p>
                                <p className="text-muted-foreground text-xs mt-1">PDF, ZIP, or any document format</p>
                              </div>
                            </>
                          )}
                        </label>
                        {file && (
                          <button
                            onClick={() => handleSubmit(assignment.id)}
                            disabled={submitting[assignment.id]}
                            className="mt-3 w-full bg-emerald-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                          >
                            {submitting[assignment.id] ? (
                              <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                            ) : submitSuccess[assignment.id] ? (
                              <><CheckCircle2 className="w-4 h-4" /> Submitted!</>
                            ) : (
                              "Submit Assignment"
                            )}
                          </button>
                        )}
                      </div>
                    )}

                    {/* AI Helper */}
                    {statusKey === "pending" && (
                      <div>
                        {(!aiHelper || !aiHelper.isOpen) && (
                          <button
                            onClick={() => getAIHelp(assignment.id)}
                            className="flex items-center gap-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white px-5 py-3 rounded-xl text-sm font-medium hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg shadow-violet-100"
                          >
                            <Sparkles className="w-4 h-4" />
                            Get Help with this Assignment
                          </button>
                        )}

                        {aiHelper?.isOpen && (
                          <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-2xl overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-violet-100">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 bg-violet-500 rounded-xl flex items-center justify-center">
                                  <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <h4 className="text-violet-900 text-sm font-semibold">AI Assignment Assistant</h4>
                                  <p className="text-violet-400 text-xs">Providing hints, not answers</p>
                                </div>
                              </div>
                              <button
                                onClick={() => closeAIHelper(assignment.id)}
                                className="p-1.5 hover:bg-violet-100 rounded-lg transition-colors"
                              >
                                <X className="w-4 h-4 text-violet-400" />
                              </button>
                            </div>

                            {aiHelper.isLoading && (
                              <div className="p-6 space-y-4">
                                <div className="flex items-center gap-3 text-violet-600">
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                  <span className="text-sm">Analyzing your assignment...</span>
                                </div>
                                {[1, 2, 3].map((i) => (
                                  <div key={i} className="space-y-2">
                                    <div className="h-3 bg-violet-100 rounded animate-pulse w-28" />
                                    <div className="h-3 bg-violet-100 rounded animate-pulse w-full" />
                                    <div className="h-3 bg-violet-100 rounded animate-pulse w-4/5" />
                                  </div>
                                ))}
                              </div>
                            )}

                            {aiHelper.isLoaded && aiHelper.hints && (
                              <div className="p-5 space-y-5">
                                <div>
                                  <h5 className="text-violet-700 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    <ClipboardList className="w-3.5 h-3.5" />
                                    Assignment Breakdown
                                  </h5>
                                  <ul className="space-y-2">
                                    {aiHelper.hints.breakdown.map((item, i) => (
                                      <li key={i} className="flex items-start gap-2.5 text-foreground/80 text-sm">
                                        <div className="w-5 h-5 rounded-full bg-violet-100 text-violet-600 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-medium">
                                          {i + 1}
                                        </div>
                                        {item}
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div>
                                  <h5 className="text-violet-700 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    <Lightbulb className="w-3.5 h-3.5" />
                                    Helpful Hints
                                  </h5>
                                  <div className="space-y-2">
                                    {aiHelper.hints.hints.map((hint, i) => (
                                      <div key={i} className="flex items-start gap-2.5 bg-card/70 rounded-xl px-4 py-3">
                                        <span className="text-amber-500">💡</span>
                                        <p className="text-muted-foreground text-sm">{hint}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <h5 className="text-violet-700 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    <ArrowRight className="w-3.5 h-3.5" />
                                    Suggested Steps
                                  </h5>
                                  <div className="space-y-2">
                                    {aiHelper.hints.steps.map((step, i) => (
                                      <div key={i} className="text-muted-foreground text-sm bg-card/70 rounded-xl px-4 py-2.5">
                                        {step}
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                                  <p className="text-amber-700 text-xs">
                                    <strong>Note:</strong> These are hints to guide your thinking — complete the work yourself for the best learning outcome! 🎯
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {statusKey === "submitted" && (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-5 py-4 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        <div>
                          <p className="text-emerald-700 text-sm font-medium">Assignment Submitted</p>
                          <p className="text-emerald-500 text-xs">Awaiting tutor review</p>
                        </div>
                      </div>
                    )}

                    {statusKey === "overdue" && (
                      <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <div>
                          <p className="text-red-700 text-sm font-medium">Assignment Overdue</p>
                          <p className="text-red-500 text-xs">Contact your tutor if you need an extension</p>
                        </div>
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
  );
}
