import { useState } from "react";
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
import { assignments } from "../../data/mockData";

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

const aiHintsMap: Record<string, { breakdown: string[]; hints: string[]; steps: string[] }> = {
  a1: {
    breakdown: [
      "Create a Node.js server using Express framework",
      "Set up MongoDB database connection with Mongoose",
      "Implement JWT-based authentication system",
      "Build CRUD endpoints for blog posts (Create, Read, Update, Delete)",
      "Add input validation and error handling middleware",
      "Document your API endpoints",
    ],
    hints: [
      "Start with the Express server setup before adding routes",
      "Use environment variables for sensitive data like JWT secret",
      "Mongoose models define your data structure — design them first",
      "Test each endpoint with Postman as you build",
    ],
    steps: [
      "1. Initialize project with npm init and install dependencies (express, mongoose, jsonwebtoken, bcryptjs)",
      "2. Create your Express app and connect to MongoDB",
      "3. Define User and Post Mongoose models",
      "4. Build authentication routes (register, login) with JWT",
      "5. Create protected CRUD routes for blog posts",
      "6. Add error handling and input validation",
      "7. Document with Postman or Swagger",
    ],
  },
  a2: {
    breakdown: [
      "Load the sales CSV dataset using pandas",
      "Explore the data structure and identify issues",
      "Clean data: handle nulls, fix types, remove duplicates",
      "Perform exploratory data analysis (EDA)",
      "Create visualizations showing trends and insights",
      "Write a summary report of findings",
    ],
    hints: [
      "Use df.info() and df.describe() to understand the data first",
      "Check for null values with df.isnull().sum()",
      "Group by category/region to find patterns",
      "Matplotlib/Seaborn for clean visualizations",
    ],
    steps: [
      "1. Import pandas, numpy, matplotlib, seaborn",
      "2. Load dataset: df = pd.read_csv('sales_data.csv')",
      "3. Explore: df.head(), df.info(), df.describe()",
      "4. Clean: handle missing values, fix data types",
      "5. Analyze: groupby, pivot tables, correlations",
      "6. Visualize: bar charts, line plots, heatmaps",
      "7. Write markdown report with key findings",
    ],
  },
  a4: {
    breakdown: [
      "Choose a website to audit (preferably in a niche you know)",
      "Analyze technical SEO (speed, mobile, structured data)",
      "Review on-page optimization (titles, meta, headings)",
      "Check content quality and keyword targeting",
      "Analyze backlink profile",
      "Write recommendations with priority order",
    ],
    hints: [
      "Use Google PageSpeed Insights for performance analysis",
      "Screaming Frog can crawl the site for technical issues",
      "Focus on the most impactful issues first",
      "Be specific with recommendations — generic advice isn't helpful",
    ],
    steps: [
      "1. Choose your website and document its current rankings",
      "2. Run a technical SEO audit (crawl errors, speed, mobile)",
      "3. Analyze title tags, meta descriptions, H1s on key pages",
      "4. Review content quality and keyword density",
      "5. Check Domain Authority and top backlinks",
      "6. Compile findings into a structured report",
      "7. Prioritize fixes by impact and effort",
    ],
  },
};

interface AIHelperState {
  isOpen: boolean;
  isLoading: boolean;
  isLoaded: boolean;
  hints: typeof aiHintsMap.a1 | null;
}

export default function AssignmentsPage() {
  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "submitted">("all");
  const [expandedId, setExpandedId] = useState<string | null>("a1");
  const [aiHelpers, setAiHelpers] = useState<Record<string, AIHelperState>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({});

  const filtered = assignments.filter((a) => {
    if (activeFilter === "all") return true;
    return a.status === activeFilter;
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
        [id]: {
          isOpen: true,
          isLoading: false,
          isLoaded: true,
          hints: aiHintsMap[id] || aiHintsMap.a1,
        },
      }));
    }, 2000);
  };

  const closeAIHelper = (id: string) => {
    setAiHelpers((prev) => ({
      ...prev,
      [id]: { ...prev[id], isOpen: false },
    }));
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl text-foreground mb-1">Assignments</h1>
          <p className="text-muted-foreground text-sm">
            {assignments.filter((a) => a.status === "pending").length} pending · {" "}
            {assignments.filter((a) => a.status === "submitted").length} submitted
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
                : "bg-card text-muted-foreground border border-border hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
            }`}
          >
            {filter === "all" ? `All (${assignments.length})` : 
             filter === "pending" ? `Pending (${assignments.filter(a => a.status === "pending").length})` :
             `Submitted (${assignments.filter(a => a.status === "submitted").length})`}
          </button>
        ))}
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {filtered.map((assignment) => {
          const isExpanded = expandedId === assignment.id;
          const status = statusConfig[assignment.status as keyof typeof statusConfig];
          const priority = priorityConfig[assignment.priority as keyof typeof priorityConfig];
          const StatusIcon = status.icon;
          const aiHelper = aiHelpers[assignment.id];

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
                  assignment.status === "submitted" ? "bg-emerald-50" : "bg-blue-100"
                }`}>
                  <ClipboardList className={`w-5 h-5 ${assignment.status === "submitted" ? "text-emerald-500" : "text-blue-700"}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start gap-2 mb-1.5">
                    <h3 className="text-foreground text-sm font-semibold flex-1 min-w-0">{assignment.title}</h3>
                    <div className="flex gap-2 flex-shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${status.color}`}>
                        {status.label}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${priority.color}`}>
                        {priority.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      {assignment.course}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Due {assignment.dueDate}
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
                    <p className="text-muted-foreground text-sm leading-relaxed">{assignment.description}</p>
                  </div>

                  {assignment.status === "pending" && (
                    <div>
                      <h4 className="text-foreground text-sm font-medium mb-2">Submit Your Work</h4>
                      <label
                        className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all ${
                          uploadedFiles[assignment.id]
                            ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20"
                            : "border-border hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        }`}
                      >
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              setUploadedFiles((prev) => ({
                                ...prev,
                                [assignment.id]: e.target.files![0].name,
                              }));
                            }
                          }}
                        />
                        {uploadedFiles[assignment.id] ? (
                          <>
                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                            <div className="text-center">
                              <p className="text-emerald-700 text-sm font-medium">File Selected</p>
                              <p className="text-emerald-500 text-xs">{uploadedFiles[assignment.id]}</p>
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
                      {uploadedFiles[assignment.id] && (
                        <button className="mt-3 w-full bg-emerald-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors">
                          Submit Assignment
                        </button>
                      )}
                    </div>
                  )}

                  {/* AI Helper */}
                  {assignment.status === "pending" && (
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
                          {/* AI Header */}
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

                          {/* Loading */}
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

                          {/* Content */}
                          {aiHelper.isLoaded && aiHelper.hints && (
                            <div className="p-5 space-y-5">
                              {/* Breakdown */}
                              <div>
                                <h5 className="text-violet-700 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                  <ClipboardList className="w-3.5 h-3.5" />
                                  Assignment Breakdown
                                </h5>
                                <ul className="space-y-2">
                                  {aiHelper.hints.breakdown.map((item, i) => (
                                    <li key={i} className="flex items-start gap-2.5 text-foreground/80 text-sm">
                                      <div className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-300 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-medium">
                                        {i + 1}
                                      </div>
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Hints */}
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

                              {/* Steps */}
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

                  {assignment.status === "submitted" && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-5 py-4 flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <div>
                        <p className="text-emerald-700 text-sm font-medium">Assignment Submitted</p>
                        <p className="text-emerald-500 text-xs">Awaiting tutor review</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
