import React, { useState, useCallback, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  TrendingUp,
  Loader2,
  Copy,
  CheckCircle2,
  ChevronDown,
  AlertCircle,
  Save,
  Send,
  Library,
  X,
  FileText,
  Calendar,
  Trash2
} from "lucide-react";
import { chatCompletion, streamCompletion, MODELS, PROMPTS } from "../../services/nvidia";
import { cbtService, SavedCurriculum } from "../../../services/cbtService";

// Markdown renderer with nice styling
function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => <h2 className="text-lg font-bold text-foreground mt-6 mb-3 first:mt-0">{children}</h2>,
        h2: ({ children }) => <h3 className="text-base font-bold text-foreground mt-5 mb-2 first:mt-0">{children}</h3>,
        h3: ({ children }) => <h4 className="text-sm font-bold text-blue-800 mt-4 mb-2">{children}</h4>,
        p: ({ children }) => <p className="text-muted-foreground text-sm leading-relaxed mb-3">{children}</p>,
        ul: ({ children }) => <ul className="space-y-1.5 mb-3 ml-1">{children}</ul>,
        ol: ({ children }) => <ol className="space-y-1.5 mb-3 list-decimal list-inside">{children}</ol>,
        li: ({ children }) => (
          <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
            <span>{children}</span>
          </li>
        ),
        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
        hr: () => <hr className="border-border my-4" />,
        code: ({ children, className }) => {
          const isBlock = className?.includes("language-");
          if (isBlock) {
            return (
              <div className="bg-slate-900 rounded-xl p-4 my-3 overflow-x-auto">
                <code className="text-green-400 text-xs font-mono whitespace-pre">{children}</code>
              </div>
            );
          }
          return <code className="bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>;
        },
        pre: ({ children }) => <>{children}</>,
        table: ({ children }) => (
          <div className="overflow-x-auto my-3">
            <table className="w-full text-sm border border-border rounded-xl overflow-hidden">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
        th: ({ children }) => <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground border-b border-border">{children}</th>,
        td: ({ children }) => <td className="px-4 py-2 text-sm text-foreground/80 border-b border-border">{children}</td>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

type Tool = "curriculum" | "quiz" | "insights";

const tools: { id: Tool; title: string; desc: string; icon: React.ElementType; color: string; bgColor: string }[] = [
  {
    id: "curriculum",
    title: "Curriculum Generator",
    desc: "Generate a full course curriculum with learning objectives, activities, and assessments",
    icon: BookOpen,
    color: "text-blue-700",
    bgColor: "bg-blue-50",
  },
  {
    id: "quiz",
    title: "Quiz Generator",
    desc: "Create multiple-choice questions with answers and explanations",
    icon: HelpCircle,
    color: "text-purple-700",
    bgColor: "bg-purple-50",
  },
  {
    id: "insights",
    title: "Student Insights",
    desc: "AI analysis of student performance with actionable recommendations",
    icon: TrendingUp,
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
  },
];

// Mock student data for insights
const mockStudentData = `
| Student | Course | Progress | Grade | Streak | Last Active |
|---------|--------|----------|-------|--------|-------------|
| Alex Johnson | Advanced React Patterns | 88% | 94% | 14 days | 2h ago |
| Maria Santos | System Design Fundamentals | 62% | 78% | 7 days | 5h ago |
| James Liu | Advanced React Patterns | 45% | 65% | 2 days | 2d ago |
| Aisha Patel | Node.js Microservices | 95% | 97% | 30 days | 1h ago |
| Carlos Mendez | System Design Fundamentals | 71% | 82% | 9 days | 3h ago |
| Sophie Wright | Docker & Kubernetes | 33% | 55% | 0 days | 5d ago |
| Kwame Asante | Advanced React Patterns | 79% | 88% | 5 days | 1d ago |
| Yuki Tanaka | Node.js Microservices | 100% | 98% | 21 days | 4h ago |
`;

export default function TutorAIToolsPage() {
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [output, setOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [savingAction, setSavingAction] = useState(false);

  // Library State
  const [showLibrary, setShowLibrary] = useState(false);
  const [savedCurriculums, setSavedCurriculums] = useState<SavedCurriculum[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [selectedCurriculum, setSelectedCurriculum] = useState<SavedCurriculum | null>(null);

  // Curriculum form
  const [currTopic, setCurrTopic] = useState("");
  const [currAudience, setCurrAudience] = useState("beginners");
  const [currWeeks, setCurrWeeks] = useState(4);

  // Quiz form
  const [quizTopic, setQuizTopic] = useState("");
  const [quizDifficulty, setQuizDifficulty] = useState("intermediate");
  const [quizCount, setQuizCount] = useState(5);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateCurriculum = useCallback(async () => {
    if (!currTopic.trim()) return;
    setIsGenerating(true);
    setError(null);
    setOutput("");

    try {
      const stream = streamCompletion(
        [{ role: "user", content: PROMPTS.curriculumGenerator(currTopic, currAudience, currWeeks) }],
        { model: MODELS.SUPER, temperature: 0.7, maxTokens: 4096 }
      );
      for await (const chunk of stream) {
        setOutput((prev) => prev + chunk);
      }
      
      // Cleanup any markdown codeblock backticks if Llama hallucinated them
      setOutput((prev) => {
        let cleaned = prev.trim();
        if (cleaned.startsWith("```json")) cleaned = cleaned.replace("```json", "");
        if (cleaned.startsWith("```")) cleaned = cleaned.replace("```", "");
        if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
        return cleaned.trim();
      });
    } catch (err: any) {
      setError(err.message || "Failed to generate curriculum.");
    } finally {
      setIsGenerating(false);
    }
  }, [currTopic, currAudience, currWeeks]);

  const generateQuiz = useCallback(async () => {
    if (!quizTopic.trim()) return;
    setIsGenerating(true);
    setError(null);
    setOutput("");

    try {
      const stream = streamCompletion(
        [{ role: "user", content: PROMPTS.quizGenerator(quizTopic, quizDifficulty, quizCount) }],
        { model: MODELS.NANO, temperature: 0.6, maxTokens: 3072 }
      );
      for await (const chunk of stream) {
        setOutput((prev) => prev + chunk);
      }
      
      // Cleanup any markdown codeblock backticks to ensure valid JSON string
      setOutput((prev) => {
        let cleaned = prev.trim();
        if (cleaned.startsWith("```json")) cleaned = cleaned.replace("```json", "");
        if (cleaned.startsWith("```")) cleaned = cleaned.replace("```", "");
        if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
        return cleaned.trim();
      });
    } catch (err: any) {
      setError(err.message || "Failed to generate quiz.");
    } finally {
      setIsGenerating(false);
    }
  }, [quizTopic, quizDifficulty, quizCount]);

  const handleSaveCurriculum = async () => {
    if (!output) return;
    try {
      setSavingAction(true);
      await cbtService.saveCurriculum(currTopic, output);
      alert("Curriculum saved successfully to your library!");
    } catch (err: any) {
      alert("Failed to save curriculum: " + err.message);
    } finally {
      setSavingAction(false);
    }
  };

  const handlePublishQuiz = async () => {
    if (!output) return;
    try {
      setSavingAction(true);
      const questionsData = JSON.parse(output);
      await cbtService.publishQuiz(quizTopic, questionsData);
      alert("Quiz successfully published as an assignment!");
    } catch (err: any) {
      alert("Failed to publish quiz. Ensure the AI finished generating correctly: " + err.message);
    } finally {
      setSavingAction(false);
    }
  };

  const fetchLibrary = async () => {
    try {
      setLoadingLibrary(true);
      const data = await cbtService.getSavedCurriculums();
      setSavedCurriculums(data);
    } catch (err: any) {
      alert("Failed to load library: " + err.message);
    } finally {
      setLoadingLibrary(false);
    }
  };

  useEffect(() => {
    if (showLibrary) {
      fetchLibrary();
    }
  }, [showLibrary]);

  const handleDeleteCurriculum = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this curriculum?")) return;
    try {
      await cbtService.deleteCurriculum(id);
      setSavedCurriculums(prev => prev.filter(c => c.id !== id));
      if (selectedCurriculum?.id === id) setSelectedCurriculum(null);
    } catch (err: any) {
      alert("Failed to delete: " + err.message);
    }
  };

  const generateInsights = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    setOutput("");

    try {
      const stream = streamCompletion(
        [{ role: "user", content: PROMPTS.studentInsights(mockStudentData) }],
        { model: MODELS.SUPER, temperature: 0.5, maxTokens: 3072 }
      );
      for await (const chunk of stream) {
        setOutput((prev) => prev + chunk);
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate insights.");
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleGenerate = () => {
    if (activeTool === "curriculum") generateCurriculum();
    else if (activeTool === "quiz") generateQuiz();
    else if (activeTool === "insights") generateInsights();
  };

  const isFormValid = () => {
    if (activeTool === "curriculum") return currTopic.trim().length > 0;
    if (activeTool === "quiz") return quizTopic.trim().length > 0;
    if (activeTool === "insights") return true;
    return false;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">AI Tools</h1>
          </div>
          <p className="text-muted-foreground mt-1 ml-[52px]">Powered by NVIDIA Nemotron — generate curriculum, quizzes, and student insights instantly.</p>
        </div>
        
        <button 
          onClick={() => setShowLibrary(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-card hover:bg-muted/50 border border-border rounded-xl text-sm font-semibold text-foreground transition-all shadow-sm"
        >
          <Library className="w-4 h-4 text-blue-600" />
          Saved Library
        </button>
      </div>

      {/* Tool Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tools.map((tool) => {
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => {
                setActiveTool(tool.id);
                setOutput("");
                setError(null);
              }}
              className={`relative text-left p-5 rounded-2xl border-2 transition-all group ${
                isActive
                  ? "border-blue-600 bg-blue-50 shadow-md shadow-blue-100"
                  : "border-border bg-card hover:border-blue-300 hover:shadow-sm"
              }`}
            >
              {isActive && (
                <div className="absolute top-3 right-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                </div>
              )}
              <div className={`w-12 h-12 rounded-xl ${tool.bgColor} flex items-center justify-center mb-3`}>
                <tool.icon className={`w-6 h-6 ${tool.color}`} />
              </div>
              <h3 className="font-bold text-foreground mb-1">{tool.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{tool.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Active Tool Content */}
      {activeTool && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6 space-y-5 sticky top-8">
              <h2 className="text-lg font-bold text-foreground">
                {tools.find((t) => t.id === activeTool)?.title} Settings
              </h2>

              {/* Curriculum Form */}
              {activeTool === "curriculum" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-1.5">Course Topic</label>
                    <input
                      value={currTopic}
                      onChange={(e) => setCurrTopic(e.target.value)}
                      placeholder="e.g., Full-Stack Web Development with React"
                      className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-700 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-1.5">Target Audience</label>
                    <div className="relative">
                      <select
                        value={currAudience}
                        onChange={(e) => setCurrAudience(e.target.value)}
                        className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-700 outline-none appearance-none bg-card"
                      >
                        <option value="absolute beginners">Absolute Beginners</option>
                        <option value="beginners">Beginners</option>
                        <option value="intermediate learners">Intermediate</option>
                        <option value="advanced professionals">Advanced</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-1.5">Number of Weeks</label>
                    <input
                      type="number"
                      min={1}
                      max={24}
                      value={currWeeks}
                      onChange={(e) => setCurrWeeks(Number(e.target.value))}
                      className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-700 focus:border-transparent outline-none"
                    />
                  </div>
                </>
              )}

              {/* Quiz Form */}
              {activeTool === "quiz" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-1.5">Quiz Topic</label>
                    <input
                      value={quizTopic}
                      onChange={(e) => setQuizTopic(e.target.value)}
                      placeholder="e.g., React Hooks and State Management"
                      className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-700 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-1.5">Difficulty Level</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["beginner", "intermediate", "advanced"].map((level) => (
                        <button
                          key={level}
                          onClick={() => setQuizDifficulty(level)}
                          className={`py-2.5 rounded-xl text-sm font-medium border capitalize transition-all ${
                            quizDifficulty === level
                              ? "bg-blue-700 border-blue-700 text-white shadow-sm"
                              : "bg-card border-border text-muted-foreground hover:border-blue-300"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-1.5">Number of Questions</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={quizCount}
                      onChange={(e) => setQuizCount(Number(e.target.value))}
                      className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-700 focus:border-transparent outline-none"
                    />
                  </div>
                </>
              )}

              {/* Insights Info */}
              {activeTool === "insights" && (
                <div className="bg-muted/50 rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground/80">8 students analyzed</p>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    AI will analyze grades, progress, streaks, and activity data to identify at-risk students, top performers, and provide actionable recommendations.
                  </p>
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !isFormValid()}
                className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 text-white py-3 rounded-xl text-sm font-semibold hover:from-blue-800 hover:to-indigo-800 transition-all disabled:opacity-50 shadow-lg shadow-blue-200"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Generate with AI
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Output Panel */}
          <div className="lg:col-span-3">
            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 text-sm font-medium">Generation failed</p>
                  <p className="text-red-600 text-xs mt-1">{error}</p>
                  <p className="text-red-500 text-xs mt-2">Make sure your NVIDIA API key is set correctly in the <code className="bg-red-100 px-1 rounded">.env</code> file.</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isGenerating && !output && (
              <div className="bg-card rounded-2xl border border-border shadow-sm p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-blue-700 animate-spin" />
                  </div>
                  <div>
                    <p className="text-foreground font-semibold text-sm">Generating with NVIDIA AI...</p>
                    <p className="text-muted-foreground/80 text-xs">This may take a few seconds</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-3 bg-muted rounded animate-pulse" style={{ width: `${70 + Math.random() * 30}%` }} />
                      <div className="h-3 bg-muted/50 rounded animate-pulse" style={{ width: `${50 + Math.random() * 40}%` }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Output Content */}
            {output && (
              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                      {isGenerating ? (
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {tools.find((t) => t.id === activeTool)?.title} Output
                      </p>
                      <p className="text-xs text-muted-foreground/80">
                        {isGenerating ? "Streaming..." : "Powered by NVIDIA Nemotron"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!isGenerating && (
                      <>
                        <button
                          onClick={handleGenerate}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-muted-foreground text-xs font-medium hover:bg-muted/50 transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Regenerate
                        </button>
                        <button
                          onClick={handleCopy}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            copied
                              ? "bg-emerald-600 text-white"
                              : "border border-border text-muted-foreground hover:bg-muted/50"
                          }`}
                        >
                          {copied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copied ? "Copied!" : "Copy"}
                        </button>
                        
                        {activeTool === "curriculum" && (
                          <button
                            onClick={handleSaveCurriculum}
                            disabled={savingAction}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 text-white text-xs font-medium hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-70"
                          >
                            {savingAction ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                            Save
                          </button>
                        )}
                        {activeTool === "quiz" && (
                          <button
                            onClick={handlePublishQuiz}
                            disabled={savingAction}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-700 text-white text-xs font-medium hover:bg-purple-800 transition-colors shadow-sm disabled:opacity-70"
                          >
                            {savingAction ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                            Publish Assignment
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {activeTool === "quiz" && !isGenerating ? (
                    <div className="space-y-6">
                      {(() => {
                        try {
                          const parsed = JSON.parse(output);
                          return parsed.map((item: any, i: number) => (
                            <div key={i} className="bg-slate-50 border border-slate-200 p-5 rounded-xl">
                              <h4 className="font-semibold text-foreground mb-3">{i+1}. {item.question}</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                                {item.options.map((opt: string, j: number) => (
                                  <div key={j} className="bg-white border border-slate-200 px-4 py-2.5 rounded-lg text-sm text-foreground/80">
                                    {String.fromCharCode(65 + j)}) {opt}
                                  </div>
                                ))}
                              </div>
                              <div className="text-xs space-y-1">
                                <p><span className="font-bold text-emerald-700">Correct:</span> {item.correctAnswer}</p>
                                <p className="text-muted-foreground">{item.explanation}</p>
                              </div>
                            </div>
                          ));
                        } catch (e) {
                          return (
                            <div>
                               <p className="text-red-500 mb-4 text-sm font-medium">Failed to parse JSON properly. Formatting raw output:</p>
                               <MarkdownContent content={output} />
                            </div>
                          );
                        }
                      })()}
                    </div>
                  ) : (
                    <MarkdownContent content={output} />
                  )}
                  {isGenerating && (
                    <span className="inline-block w-2 h-4 bg-blue-600 animate-pulse rounded-sm ml-1" />
                  )}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!output && !isGenerating && !error && (
              <div className="bg-card rounded-2xl border border-dashed border-border p-16 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Wand2 className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-foreground/80 font-semibold mb-2">Ready to Generate</h3>
                <p className="text-muted-foreground/80 text-sm max-w-sm mx-auto">
                  Fill in the settings on the left and click "Generate with AI" to create your content using NVIDIA Nemotron.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No tool selected */}
      {!activeTool && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-12 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-200">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-foreground font-bold text-xl mb-2">Select a Tool to Get Started</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Choose one of the AI tools above to generate curriculum outlines, quiz questions, or student performance insights powered by NVIDIA's Nemotron model.
          </p>
        </div>
      )}

      {/* Library Modal */}
      {showLibrary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-xl flex flex-col border border-border">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-xl font-bold text-foreground">My Curriculum Library</h2>
                <p className="text-sm text-muted-foreground">Access all your previously saved AI content</p>
              </div>
              <button
                onClick={() => { setShowLibrary(false); setSelectedCurriculum(null); }}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar List */}
              <div className="w-1/3 border-r border-border overflow-y-auto p-4 bg-muted/20">
                {loadingLibrary ? (
                  <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
                ) : savedCurriculums.length === 0 ? (
                  <div className="text-center p-8 text-muted-foreground text-sm">No saved curriculums yet.</div>
                ) : (
                  <div className="space-y-2">
                    {savedCurriculums.map(c => (
                      <div 
                        key={c.id}
                        onClick={() => setSelectedCurriculum(c)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          selectedCurriculum?.id === c.id 
                            ? 'bg-blue-50 border-blue-200 shadow-sm' 
                            : 'bg-card border-border hover:border-blue-300'
                        }`}
                      >
                        <h4 className="font-semibold text-foreground text-sm truncate pr-2">{c.title}</h4>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {new Date(c.created_at).toLocaleDateString()}
                          </div>
                          <button 
                            onClick={(e) => handleDeleteCurriculum(c.id, e)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Content View */}
              <div className="w-2/3 overflow-y-auto bg-card">
                {selectedCurriculum ? (
                  <div className="p-8">
                    <h2 className="text-2xl font-bold text-foreground mb-6">{selectedCurriculum.title}</h2>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <MarkdownContent content={selectedCurriculum.content} />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-12 opacity-60">
                    <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground font-medium">Select a curriculum from the sidebar to view its contents.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
