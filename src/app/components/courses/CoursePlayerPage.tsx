import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Play,
  Pause,
  Volume2,
  Maximize,
  Settings,
  SkipForward,
  SkipBack,
  CheckCircle2,
  Lock,
  ChevronLeft,
  Sparkles,
  Download,
  Send,
  Loader2,
  MessageSquare,
  FileText,
  List,
  Clock,
  X,
  Lightbulb,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { courses } from "../../data/mockData";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { chatCompletion, streamCompletion, MODELS, PROMPTS, type ChatMessage } from "../../services/nvidia";
import { courseService } from "../../../services/courseService";
const quickPrompts = [
  "Explain this lesson simply",
  "Summarize this topic",
  "Give me examples",
  "What are common mistakes?",
];

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h2: ({ children }) => <h5 className="text-blue-800 text-xs font-semibold uppercase tracking-wider mb-2 mt-4 first:mt-0">{children}</h5>,
        h3: ({ children }) => <h5 className="text-blue-800 text-xs font-semibold uppercase tracking-wider mb-2 mt-3">{children}</h5>,
        p: ({ children }) => <p className="text-muted-foreground text-sm leading-relaxed mb-2">{children}</p>,
        ul: ({ children }) => <ul className="space-y-1.5 mb-3">{children}</ul>,
        ol: ({ children }) => <ol className="space-y-1.5 mb-3 list-decimal list-inside">{children}</ol>,
        li: ({ children }) => (
          <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
            <span>{children}</span>
          </li>
        ),
        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
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
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

function AIChatMessage({ msg }: { msg: { id: string; role: string; content: string } }) {
  return (
    <div className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
          msg.role === "assistant"
            ? "bg-blue-700"
            : "bg-gradient-to-br from-blue-600 to-blue-800"
        }`}
      >
        {msg.role === "assistant" ? (
          <Sparkles className="w-3.5 h-3.5 text-white" />
        ) : (
          <span className="text-white text-xs font-bold">D</span>
        )}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
          msg.role === "assistant"
            ? "bg-card border border-border text-foreground/80"
            : "bg-blue-700 text-white"
        }`}
      >
        {msg.role === "assistant" ? (
          <MarkdownContent content={msg.content} />
        ) : (
          <p className="leading-relaxed">{msg.content}</p>
        )}
      </div>
    </div>
  );
}

export default function CoursePlayerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"notes" | "chapters" | "resources">("notes");
  const [sidebarTab, setSidebarTab] = useState<"chat" | "lessons">("chat");

  useEffect(() => {
    async function loadCourse() {
      if (!id) return;
      setLoading(true);
      try {
        // Fallback for mock routes
        if (!id.includes('-')) {
           const mockCourse = courses.find((c) => c.id === id) || courses[0];
           setCourse(mockCourse);
           setLessons(mockCourse.lessons);
           setActiveLesson(mockCourse.lessons[0]);
           return;
        }

        const courseData = await courseService.getCourseById(id);
        const lessonsData = await courseService.getLessons(id);
        const resourcesData = await courseService.getResources(id);

        setCourse({ ...courseData, aiChapters: [] });
        setLessons(lessonsData);
        setResources(resourcesData);
        if (lessonsData.length > 0) setActiveLesson(lessonsData[0]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadCourse();
  }, [id]);

  // AI Notes state
  const [notesContent, setNotesContent] = useState("");
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);

  // Chat state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [displayMessages, setDisplayMessages] = useState<Array<{ id: string; role: string; content: string }>>([
    {
      id: "m1",
      role: "assistant",
      content: `Hi! I'm your AI Course Assistant. I've been trained on all the course materials — ask me anything about the lessons!`,
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const [volume, setVolume] = useState(80);
  const [progress, setProgress] = useState(35);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Reset notes when switching lessons
  useEffect(() => {
    if (!activeLesson) return;
    setNotesContent("");
    setNotesError(null);
  }, [activeLesson?.id]);

  // Scroll chat on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages, isTyping]);

  const generateNotes = useCallback(async () => {
    setIsGeneratingNotes(true);
    setNotesError(null);
    setNotesContent("");

    const lessonIdx = course.lessons.indexOf(activeLesson);
    const topics = course.lessons
      .slice(Math.max(0, lessonIdx - 1), lessonIdx + 2)
      .map((l) => l.title)
      .join(", ");

    try {
      const stream = streamCompletion(
        [
          {
            role: "user",
            content: PROMPTS.generateNotes(course.title, activeLesson.title, topics),
          },
        ],
        { model: MODELS.NANO, temperature: 0.5, maxTokens: 2048 }
      );

      for await (const chunk of stream) {
        setNotesContent((prev) => prev + chunk);
      }
    } catch (err: any) {
      console.error("Notes generation error:", err);
      setNotesError(err.message || "Failed to generate notes. Check your API key.");
    } finally {
      setIsGeneratingNotes(false);
    }
  }, [course, activeLesson]);

  const sendMessage = useCallback(
    async (text?: string) => {
      const messageText = text || chatInput.trim();
      if (!messageText || isTyping) return;

      setChatError(null);
      setChatInput("");

      // Add user message to display
      const userMsg = { id: `m${Date.now()}`, role: "user", content: messageText };
      setDisplayMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      // Build the conversation history for the API
      const systemMsg = PROMPTS.studentChat(course.title, activeLesson.title);
      const newHistory: ChatMessage[] = [
        systemMsg,
        ...chatHistory,
        { role: "user", content: messageText },
      ];

      try {
        const response = await chatCompletion(newHistory, {
          model: MODELS.SUPER,
          temperature: 0.7,
          maxTokens: 1024,
        });

        // Update chat history (without system message for storage)
        setChatHistory((prev) => [
          ...prev,
          { role: "user", content: messageText },
          { role: "assistant", content: response },
        ]);

        // Add AI response to display
        setDisplayMessages((prev) => [
          ...prev,
          { id: `m${Date.now()}-ai`, role: "assistant", content: response },
        ]);
      } catch (err: any) {
        console.error("Chat error:", err);
        setChatError(err.message || "Failed to get response. Check your API key.");
        setDisplayMessages((prev) => [
          ...prev,
          {
            id: `m${Date.now()}-err`,
            role: "assistant",
            content: "⚠️ Sorry, I couldn't process that request. Please check your API key in the `.env` file and try again.",
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [chatInput, isTyping, course, activeLesson, chatHistory]
  );

  const tabs = [
    { id: "notes", icon: FileText, label: "AI Notes" },
    { id: "chapters", icon: List, label: "Chapters" },
    { id: "resources", icon: Download, label: "Resources" },
  ];

  if (loading) return <div className="p-20 text-center text-muted-foreground flex items-center justify-center gap-2"><Loader2 className="animate-spin w-5 h-5"/> Loading course...</div>;
  if (!course) return <div className="p-20 text-center text-muted-foreground">Course not found.</div>;
  if (!activeLesson) return <div className="p-20 text-center text-muted-foreground">No lessons available for this course yet! Tell the tutor to upload one.</div>;

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto lg:overflow-hidden">
        {/* Back + Course Title */}
        <div className="px-4 sm:px-6 py-3 border-b border-border bg-card flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => navigate("/app/courses")}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="min-w-0">
            <h2 className="text-foreground text-sm font-semibold truncate">{course.title}</h2>
            <p className="text-muted-foreground/80 text-xs">{activeLesson.title}</p>
          </div>
        </div>

        {/* Video Player */}
        <div className="relative bg-slate-950 flex-shrink-0 flex justify-center border-b border-slate-800">
          <div className="w-full max-w-3xl xl:max-w-4xl aspect-video relative overflow-hidden">
            {activeLesson.video_url ? (
              <video 
                src={activeLesson.video_url} 
                className="w-full h-full object-cover" 
                controls 
                autoPlay 
              />
            ) : (
              <ImageWithFallback
                src={course.thumbnail_url || course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover opacity-60"
              />
            )}
            <div className={`absolute inset-0 flex flex-col justify-between p-4 sm:p-6 ${activeLesson.video_url ? 'pointer-events-none opacity-0 hover:opacity-100 transition-opacity' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-white text-xs font-medium">LESSON {lessons.indexOf(activeLesson) + 1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 bg-black/40 backdrop-blur-sm rounded-lg hover:bg-black/60 transition-colors">
                    <Settings className="w-4 h-4 text-white" />
                  </button>
                  <button className="p-2 bg-black/40 backdrop-blur-sm rounded-lg hover:bg-black/60 transition-colors">
                    <Maximize className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-16 h-16 bg-blue-700/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-blue-700 transition-all shadow-xl shadow-blue-950/30 hover:scale-110 active:scale-95"
                >
                  {isPlaying ? <Pause className="w-7 h-7 text-white" /> : <Play className="w-7 h-7 text-white fill-white ml-1" />}
                </button>
              </div>
              <div className="space-y-3">
                <div className="group cursor-pointer">
                  <div className="bg-card/20 rounded-full h-1 group-hover:h-1.5 transition-all">
                    <div className="bg-blue-600 h-full rounded-full relative" style={{ width: `${progress}%` }}>
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-card rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const idx = lessons.indexOf(activeLesson);
                        if (idx > 0) setActiveLesson(lessons[idx - 1]);
                      }}
                      className="p-1.5 text-white/80 hover:text-white transition-colors pointer-events-auto"
                    >
                      <SkipBack className="w-5 h-5" />
                    </button>
                    <button onClick={() => setIsPlaying(!isPlaying)} className="p-1.5 text-white/80 hover:text-white transition-colors pointer-events-auto">
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                    </button>
                    <button
                      onClick={() => {
                        const idx = lessons.indexOf(activeLesson);
                        if (idx < lessons.length - 1) setActiveLesson(lessons[idx + 1]);
                      }}
                      className="p-1.5 text-white/80 hover:text-white transition-colors pointer-events-auto"
                    >
                      <SkipForward className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-white/70" />
                      <div className="w-20 bg-card/20 rounded-full h-1 cursor-pointer">
                        <div className="bg-card h-full rounded-full" style={{ width: `${volume}%` }} />
                      </div>
                    </div>
                    <span className="text-white/70 text-xs">
                      {Math.floor((progress / 100) * 28)}:{String(Math.floor(((progress / 100) * 28 * 60) % 60)).padStart(2, "0")} / {activeLesson.duration}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-card border-b border-border px-4 sm:px-6 flex-shrink-0">
          <div className="flex gap-1">
            {tabs.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm border-b-2 transition-all ${
                  activeTab === id
                    ? "border-blue-700 text-blue-800 font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground/80"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:block">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto bg-muted/50/50">
          {/* ============ AI NOTES TAB ============ */}
          {activeTab === "notes" && (
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
                <div className="flex-1">
                  <h3 className="text-foreground font-semibold mb-1">Smart Notes Generator</h3>
                  <p className="text-muted-foreground text-sm">AI-powered notes generated by NVIDIA Nemotron</p>
                </div>
                {!notesContent && !isGeneratingNotes && (
                  <button
                    onClick={generateNotes}
                    className="flex items-center gap-2.5 bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-800 transition-all shadow-lg shadow-blue-200"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate AI Notes
                  </button>
                )}
                {notesContent && !isGeneratingNotes && (
                  <div className="flex gap-2">
                    <button
                      onClick={generateNotes}
                      className="flex items-center gap-2 border border-border text-foreground/80 px-4 py-2.5 rounded-xl text-sm hover:bg-muted/50 transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      Regenerate
                    </button>
                    <button className="flex items-center gap-2 border border-border text-foreground/80 px-4 py-2.5 rounded-xl text-sm hover:bg-muted/50 transition-colors">
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                )}
              </div>

              {/* Error */}
              {notesError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-800 text-sm font-medium">Failed to generate notes</p>
                    <p className="text-red-600 text-xs mt-1">{notesError}</p>
                  </div>
                </div>
              )}

              {/* Loading Skeleton */}
              {isGeneratingNotes && !notesContent && (
                <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 text-blue-700 animate-spin" />
                    </div>
                    <div>
                      <div className="h-4 bg-muted rounded w-48 animate-pulse" />
                      <div className="h-3 bg-muted/50 rounded w-32 animate-pulse mt-1" />
                    </div>
                  </div>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-3 bg-muted rounded w-32 animate-pulse" />
                      <div className="h-3 bg-muted rounded w-full animate-pulse" />
                      <div className="h-3 bg-muted rounded w-5/6 animate-pulse" />
                    </div>
                  ))}
                </div>
              )}

              {/* Notes Content (streaming or complete) */}
              {notesContent && (
                <div className="bg-card rounded-2xl border border-border p-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-border mb-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      {isGeneratingNotes ? (
                        <Loader2 className="w-4 h-4 text-blue-700 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-blue-700" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-foreground text-sm font-semibold">AI Notes: {activeLesson.title}</h4>
                      <p className="text-muted-foreground/80 text-xs">
                        {isGeneratingNotes ? "Generating with Nemotron AI..." : "Powered by NVIDIA Nemotron"}
                      </p>
                    </div>
                  </div>
                  <MarkdownContent content={notesContent} />
                  {isGeneratingNotes && (
                    <div className="mt-2 inline-block w-2 h-4 bg-blue-600 animate-pulse rounded-sm" />
                  )}
                </div>
              )}

              {/* Empty State */}
              {!notesContent && !isGeneratingNotes && !notesError && (
                <div className="bg-card rounded-2xl border border-dashed border-border p-12 text-center">
                  <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-7 h-7 text-blue-600" />
                  </div>
                  <h4 className="text-foreground/80 font-medium mb-2">Generate AI Notes</h4>
                  <p className="text-muted-foreground/80 text-sm max-w-xs mx-auto">
                    Click the button above to generate smart, structured notes from this lesson using NVIDIA AI.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Chat AI moved to right sidebar */}

          {/* ============ AI CHAPTERS TAB ============ */}
          {activeTab === "chapters" && (
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-blue-700 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <h3 className="text-foreground text-sm font-semibold">AI-Generated Chapters</h3>
                  <p className="text-muted-foreground/80 text-xs">Auto-detected from video content</p>
                </div>
              </div>
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                {course.aiChapters.map((chapter, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-blue-100 transition-colors cursor-pointer border-b border-slate-50 last:border-0 group"
                  >
                    <div className="bg-blue-100 group-hover:bg-blue-200 rounded-lg px-2.5 py-1.5 transition-colors">
                      <span className="text-blue-800 text-xs font-mono font-medium">{chapter.timestamp}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground/80 text-sm group-hover:text-blue-900 transition-colors">{chapter.title}</p>
                    </div>
                    <Play className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* ============ RESOURCES TAB ============ */}
          {activeTab === "resources" as any && (
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-blue-700 rounded-lg flex items-center justify-center">
                  <Download className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <h3 className="text-foreground text-sm font-semibold">Course Resources</h3>
                  <p className="text-muted-foreground/80 text-xs">PDFs and downloadable content</p>
                </div>
              </div>
              
              {resources.length === 0 ? (
                <div className="bg-card rounded-2xl border border-dashed border-border p-12 text-center">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No resources available for this course.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resources.map((res) => (
                    <a 
                      href={res.file_url} 
                      target="_blank" 
                      rel="noreferrer"
                      key={res.id} 
                      className="bg-card rounded-xl border border-border p-4 flex items-start gap-4 hover:border-blue-500 hover:shadow-md transition-all group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-rose-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground group-hover:text-blue-700 transition-colors mb-1">{res.title}</p>
                        <p className="text-xs text-muted-foreground uppercase flex items-center gap-1.5">
                          <Download className="w-3 h-3" /> Download {res.file_type}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="lg:w-96 xl:w-[400px] bg-card border-t lg:border-t-0 lg:border-l border-border flex flex-col flex-shrink-0 lg:overflow-hidden">
        {/* Sidebar Tabs */}
        <div className="flex border-b border-border flex-shrink-0 bg-muted/50">
          <button
            onClick={() => setSidebarTab("chat")}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 text-sm font-semibold border-b-2 transition-all ${
              sidebarTab === "chat" ? "border-blue-700 text-blue-800 bg-card" : "border-transparent text-muted-foreground hover:text-foreground/80"
            }`}
          >
            <Sparkles className={`w-4 h-4 ${sidebarTab === "chat" ? "text-blue-700" : ""}`} />
            AI Chat
          </button>
          <button
            onClick={() => setSidebarTab("lessons")}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 text-sm font-semibold border-b-2 transition-all ${
              sidebarTab === "lessons" ? "border-blue-700 text-blue-800 bg-card" : "border-transparent text-muted-foreground hover:text-foreground/80"
            }`}
          >
            <List className={`w-4 h-4 ${sidebarTab === "lessons" ? "text-blue-700" : ""}`} />
            Content
          </button>
        </div>

        {sidebarTab === "lessons" ? (
          <>
            <div className="px-5 py-4 border-b border-border flex-shrink-0 bg-card">
              <h3 className="text-foreground font-semibold text-sm mb-1">Course Content</h3>
              <p className="text-muted-foreground/80 text-xs">
                {lessons.length} lessons available
              </p>
              <div className="mt-3 bg-muted rounded-full h-1.5">
                <div className="bg-blue-700 h-1.5 rounded-full" style={{ width: `0%` }} />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {lessons.map((lesson, i) => {
                const isActive = lesson.id === activeLesson.id;
                return (
                  <div
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    className={`flex gap-3 px-4 py-3.5 cursor-pointer border-b border-slate-50 transition-all duration-150 group ${
                      isActive ? "bg-blue-100 border-l-2 border-l-blue-700" : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {lesson.completed ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        </div>
                      ) : isActive ? (
                        <div className="w-6 h-6 rounded-full bg-blue-700 flex items-center justify-center">
                          <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-border flex items-center justify-center group-hover:border-blue-500 transition-colors">
                          <span className="text-muted-foreground/80 text-xs">{i + 1}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-snug mb-1 ${isActive ? "text-blue-900 font-semibold" : lesson.completed ? "text-muted-foreground" : "text-foreground/80"}`}>
                        {lesson.title}
                      </p>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-slate-300" />
                        <span className="text-muted-foreground/80 text-xs">{lesson.duration}</span>
                      </div>
                    </div>
                    {isActive && (
                      <div className="flex-shrink-0 flex items-center">
                        <div className="flex gap-0.5">
                          <div className="w-1 bg-blue-600 rounded-full animate-pulse" style={{ height: "12px" }} />
                          <div className="w-1 bg-blue-600 rounded-full animate-pulse" style={{ height: "18px", animationDelay: "100ms" }} />
                          <div className="w-1 bg-blue-600 rounded-full animate-pulse" style={{ height: "10px", animationDelay: "200ms" }} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex flex-col flex-1 h-full bg-muted/50/50">
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* Context Banner */}
              <div className="bg-blue-100 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-2.5">
                <div className="w-7 h-7 bg-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <p className="text-blue-900 text-xs">
                  <strong>AI Tutor</strong> — Powered by NVIDIA Nemotron · Context: {course.title}
                </p>
              </div>

              {displayMessages.map((msg) => (
                <AIChatMessage key={msg.id} msg={msg} />
              ))}

              {isTyping && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-card border border-border rounded-2xl px-4 py-3">
                    <div className="flex gap-1 items-center h-4">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              {chatError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-red-700 text-xs">{chatError}</p>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="px-4 pb-3">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    disabled={isTyping}
                    className="flex items-center gap-1.5 bg-blue-100 border border-blue-200 text-blue-800 text-xs px-3 py-2 rounded-full whitespace-nowrap hover:bg-blue-200 transition-colors disabled:opacity-50"
                  >
                    <Lightbulb className="w-3 h-3" />
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="px-4 pb-4">
              <div className="flex gap-2 bg-card border border-border rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-blue-700 focus-within:border-transparent transition-all">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Ask anything about this course..."
                  className="flex-1 px-3 py-1.5 text-sm text-foreground/80 placeholder-slate-400 bg-transparent focus:outline-none"
                  disabled={isTyping}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!chatInput.trim() || isTyping}
                  className="bg-blue-700 text-white p-2.5 rounded-xl hover:bg-blue-800 transition-colors disabled:opacity-40 flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}