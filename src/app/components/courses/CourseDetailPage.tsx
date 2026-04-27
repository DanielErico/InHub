import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ChevronLeft, Star, Clock, Globe, BarChart2, CheckCircle2,
  BookOpen, FileText, Award, ClipboardList, Play, Lock,
  ChevronDown, ChevronUp, Video, User, Calendar, Loader2, Users,
  ShieldCheck, Maximize
} from "lucide-react";
import { courseService, Course } from "../../../services/courseService";
import { supabase } from "../../../lib/supabase";
import { usePaystackPayment } from "react-paystack";
import { useUserProfile } from "../../context/UserProfileContext";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface TutorInfo {
  id: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
  courseCount: number;
}

const LEVEL_BADGE: Record<string, string> = {
  beginner: "bg-emerald-100 text-emerald-700",
  intermediate: "bg-amber-100 text-amber-700",
  advanced: "bg-red-100 text-red-700",
};

export default function CourseDetailPage() {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useUserProfile();

  const [course, setCourse] = useState<Course | null>(null);
  const [tutor, setTutor] = useState<TutorInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [openModule, setOpenModule] = useState<number | null>(0);
  const [userEmail, setUserEmail] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [lessonCount, setLessonCount] = useState(0);
  const [resourceCount, setResourceCount] = useState(0);

  useEffect(() => { if (courseId) load(); }, [courseId]);

  const load = async () => {
    setLoading(true);
    try {
      const c = await courseService.getCourseById(courseId!);
      setCourse(c);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserEmail(user.email || "");

      // Check purchase
      if (c.price && c.price > 0) {
        const purchased = await courseService.hasPurchasedCourse(courseId!);
        setHasPurchased(purchased);
      } else {
        setHasPurchased(true);
      }

      // Lesson & resource counts
      const [lessons, resources] = await Promise.all([
        courseService.getLessons(courseId!),
        courseService.getResources(courseId!),
      ]);
      setLessonCount(lessons.length);
      setResourceCount(resources.length);

      // Tutor info
      if (c.tutor_id) {
        const { data: tutorData } = await supabase
          .from("users")
          .select("id, full_name, avatar_url, created_at")
          .eq("id", c.tutor_id)
          .single();

        if (tutorData) {
          const { count } = await supabase
            .from("courses")
            .select("id", { count: "exact", head: true })
            .eq("tutor_id", c.tutor_id);

          setTutor({ ...tutorData, courseCount: count ?? 0 });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Paystack
  const config = {
    reference: Date.now().toString(),
    email: userEmail || "student@example.com",
    amount: (course?.price || 0) * 100,
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "",
  };
  const initializePayment = usePaystackPayment(config);

  const onSuccess = async (reference: any) => {
    setIsProcessingPayment(true);
    try {
      await courseService.recordPurchase(course!.id, course!.price, reference.reference);
      setHasPurchased(true);
      navigate(`/app/course/${courseId}/play`);
    } catch {
      alert("Payment recorded but failed to update. Contact support.");
    } finally {
      setIsProcessingPayment(false);
    }
  };
  const onClose = () => {};

  if (loading) return (
    <div className="flex items-center justify-center py-40">
      <Loader2 className="w-8 h-8 animate-spin text-blue-700" />
    </div>
  );
  if (!course) return <div className="p-10 text-center text-muted-foreground">Course not found.</div>;

  const isFree = !course.price || course.price === 0;
  const outcomes = course.learning_outcomes?.filter(Boolean) || [];
  const reqs = course.requirements?.filter(Boolean) || [];
  const modules = course.modules?.filter((m) => m.title) || [];
  const formats = course.teaching_format ? course.teaching_format.split(",") : [];

  const EnrollButton = ({ className = "" }: { className?: string }) => (
    hasPurchased ? (
      <button
        onClick={() => navigate(`/app/course/${courseId}/play`)}
        className={`flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl transition-colors shadow-lg ${className}`}
      >
        <Play className="w-5 h-5 fill-white" /> Go to Course
      </button>
    ) : isFree ? (
      <button
        onClick={() => navigate(`/app/course/${courseId}/play`)}
        className={`flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold py-3.5 rounded-2xl transition-colors shadow-lg ${className}`}
      >
        <Play className="w-5 h-5 fill-white" /> Start Free Course
      </button>
    ) : (
      <button
        onClick={() => initializePayment({ onSuccess, onClose })}
        disabled={isProcessingPayment}
        className={`flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold py-3.5 rounded-2xl transition-colors shadow-lg disabled:opacity-70 ${className}`}
      >
        {isProcessingPayment ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
        Enroll — NGN {course.price?.toLocaleString()}
      </button>
    )
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative border-b border-border text-foreground overflow-hidden bg-background md:bg-blue-50/30">
        {/* Blurred Background */}
        {course.thumbnail_url && (
          <div 
            className="absolute inset-0 z-0 opacity-100 blur-sm scale-105"
            style={{ backgroundImage: `url(${course.thumbnail_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
        )}
        {/* Gradient Overlay for readability */}
        <div className="absolute inset-0 z-0 bg-background/80 md:bg-white/50 dark:md:bg-slate-900/80" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <button
            onClick={() => navigate("/app/courses")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" /> Browse Courses
          </button>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Left: text */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {course.level && (
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${LEVEL_BADGE[course.level]}`}>
                    {course.level}
                  </span>
                )}
                {course.category && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                    {course.category}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold leading-snug mb-4 text-foreground">{course.title}</h1>
              {course.description && (
                <p className="text-muted-foreground text-sm leading-relaxed mb-5 max-w-2xl">{course.description}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-medium mb-6">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-amber-600">4.8</span>
                </div>
                {course.total_duration && (
                  <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{course.total_duration}</div>
                )}
                {course.language && (
                  <div className="flex items-center gap-1.5"><Globe className="w-4 h-4" />{course.language}</div>
                )}
                {lessonCount > 0 && (
                  <div className="flex items-center gap-1.5"><Video className="w-4 h-4" />{lessonCount} lessons</div>
                )}
                {resourceCount > 0 && (
                  <div className="flex items-center gap-1.5"><FileText className="w-4 h-4" />{resourceCount} resources</div>
                )}
              </div>

              {tutor && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {tutor.avatar_url
                      ? <img src={tutor.avatar_url} alt={tutor.full_name} className="w-full h-full object-cover" />
                      : <span className="text-blue-700 text-sm font-bold">{(tutor.full_name || "T").charAt(0)}</span>
                    }
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Instructor</p>
                    <p className="text-sm font-bold text-foreground">{tutor.full_name}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right: sticky card on desktop, shown inline on mobile */}
            <div className="hidden lg:block w-80 shrink-0">
              <div className="bg-card text-foreground rounded-2xl shadow-xl overflow-hidden sticky top-6 border border-border">
                <div className="relative h-44 bg-muted/30">
                  {course.preview_video_url ? (
                    <video src={course.preview_video_url} className="w-full h-full object-cover" controls />
                  ) : course.thumbnail_url ? (
                    <ImageWithFallback src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <div className="p-5 space-y-4">
                  <div className="text-2xl font-extrabold text-blue-700">
                    {isFree ? "Free" : `NGN ${course.price?.toLocaleString()}`}
                  </div>
                  <EnrollButton className="w-full" />
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {lessonCount > 0 && <li className="flex items-center gap-2"><Video className="w-4 h-4 text-blue-600" />{lessonCount} video lessons</li>}
                    {resourceCount > 0 && <li className="flex items-center gap-2"><FileText className="w-4 h-4 text-rose-500" />{resourceCount} downloadable resources</li>}
                    {course.has_certificate && <li className="flex items-center gap-2"><Award className="w-4 h-4 text-amber-500" />Certificate of completion</li>}
                    {course.has_assignments && <li className="flex items-center gap-2"><ClipboardList className="w-4 h-4 text-violet-500" />{course.assignment_count || "Several"} assignments</li>}
                    {course.total_duration && <li className="flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-500" />{course.total_duration} total</li>}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">

          {/* Preview video (mobile) */}
          {course.preview_video_url && (
            <div className="lg:hidden rounded-2xl overflow-hidden shadow-md aspect-video bg-black">
              <video src={course.preview_video_url} controls className="w-full h-full object-contain" />
            </div>
          )}

          {/* Course Thumbnail Cover (Visible if there's a thumbnail) */}
          {course.thumbnail_url && !course.preview_video_url && (
            <div className="lg:hidden rounded-2xl overflow-hidden shadow-md aspect-video bg-muted/30">
              <ImageWithFallback src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Mobile enroll */}
          <div className="lg:hidden bg-card rounded-2xl border border-border p-5 space-y-3">
            <div className="text-2xl font-extrabold text-blue-700">{isFree ? "Free" : `NGN ${course.price?.toLocaleString()}`}</div>
            <EnrollButton className="w-full" />
          </div>

          {/* What You'll Learn */}
          {outcomes.length > 0 && (
            <section className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> What You'll Learn
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {outcomes.map((o, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground/80 leading-snug">{o}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Course Includes */}
          {(formats.length > 0 || course.has_certificate || course.has_assignments || lessonCount > 0 || resourceCount > 0) && (
            <section className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" /> This Course Includes
              </h2>
              <div className="grid sm:grid-cols-2 gap-3 text-sm text-foreground/80">
                {lessonCount > 0 && <div className="flex items-center gap-2"><Video className="w-4 h-4 text-blue-600" />{lessonCount} video lessons</div>}
                {resourceCount > 0 && <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-rose-500" />{resourceCount} downloadable resources</div>}
                {course.total_duration && <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-500" />{course.total_duration} total duration</div>}
                {course.has_assignments && <div className="flex items-center gap-2"><ClipboardList className="w-4 h-4 text-violet-500" />{course.assignment_count || "Multiple"} assignments & projects</div>}
                {course.has_certificate && <div className="flex items-center gap-2"><Award className="w-4 h-4 text-amber-500" />Certificate of completion</div>}
                {course.language && <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-cyan-500" />Taught in {course.language}</div>}
                {course.level && <div className="flex items-center gap-2"><BarChart2 className="w-4 h-4 text-indigo-500" />{course.level.charAt(0).toUpperCase() + course.level.slice(1)} level</div>}
                {formats.map((f, i) => <div key={i} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" />{f}</div>)}
              </div>
            </section>
          )}

          {/* Course Curriculum */}
          {modules.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" /> Course Curriculum
              </h2>
              <div className="space-y-2">
                {modules.map((mod, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenModule(openModule === i ? null : i)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs font-bold shrink-0">M{i + 1}</span>
                        <span className="font-semibold text-sm text-foreground">{mod.title}</span>
                        {mod.lessons?.length > 0 && (
                          <span className="text-xs text-muted-foreground">({mod.lessons.length} lessons)</span>
                        )}
                      </div>
                      {openModule === i ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </button>
                    {openModule === i && mod.lessons?.length > 0 && (
                      <div className="border-t border-border divide-y divide-border/50">
                        {mod.lessons.map((lesson, li) => (
                          <div key={li} className="flex items-center gap-3 px-5 py-3">
                            <Lock className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                            <span className="text-sm text-muted-foreground">{lesson}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Target Audience */}
          {course.target_audience && (
            <section className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-500" /> Who Is This For?
              </h2>
              <p className="text-sm text-foreground/80 leading-relaxed">{course.target_audience}</p>
            </section>
          )}

          {/* Requirements */}
          {reqs.length > 0 && (
            <section className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-orange-500" /> Requirements
              </h2>
              <ul className="space-y-2">
                {reqs.map((r, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-foreground/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Certification Section */}
          <section className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-6 py-4">
              <h2 className="text-white font-bold flex items-center gap-2">
                <Award className="w-5 h-5" /> Professional Certification
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Intern Connect Certificate */}
                <div className="flex-1 p-5 rounded-2xl bg-blue-50 border border-blue-100 flex flex-col gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-900 text-sm">Intern Connect Verified</h4>
                    <p className="text-xs text-blue-700 leading-relaxed mt-1">
                      You will receive an official certificate from Intern Connect upon successful completion of all course modules.
                    </p>
                  </div>
                </div>

                {/* Tutor Certificate */}
                {course.has_tutor_certificate && (
                  <div className="flex-1 p-5 rounded-2xl bg-purple-50 border border-purple-100 flex flex-col gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-purple-900 text-sm">Instructor Certification</h4>
                      <p className="text-xs text-purple-700 leading-relaxed mt-1">
                        In addition to the platform certificate, the instructor will award their personal industry-recognized certificate.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Certificate Previews */}
              <div className="space-y-8 pt-4">
                {/* Default InHub Certificate Preview */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground">InHub Official Certificate Preview</h3>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Sample</span>
                  </div>
                  <div className="relative group aspect-video md:aspect-[16/7] bg-muted rounded-2xl border border-border overflow-hidden shadow-inner">
                    <img 
                      src="/inhub-certificate.png" 
                      alt="InHub Certificate Sample" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <a 
                        href="/inhub-certificate.png" 
                        target="_blank" 
                        rel="noreferrer"
                        className="bg-white/90 backdrop-blur-sm text-foreground px-5 py-2.5 rounded-2xl text-sm font-bold shadow-2xl flex items-center gap-2 hover:bg-white transition-all scale-90 group-hover:scale-100"
                      >
                        <Maximize className="w-4 h-4" /> Enlarge Preview
                      </a>
                    </div>
                  </div>
                </div>

                {/* Tutor Certificate Preview (If tutor has one) */}
                {course.has_tutor_certificate && course.tutor_certificate_sample_url && (
                  <div className="space-y-4 pt-6 border-t border-border">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-foreground">Instructor Certificate Preview</h3>
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Sample</span>
                    </div>
                  <div className="relative group aspect-video md:aspect-[16/7] bg-muted rounded-2xl border border-border overflow-hidden shadow-inner">
                    {course.tutor_certificate_sample_url.toLowerCase().endsWith('.pdf') ? (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-slate-50">
                        <FileText className="w-12 h-12 text-red-500 opacity-40" />
                        <p className="text-sm font-medium text-muted-foreground">PDF Certificate Preview</p>
                        <a 
                          href={course.tutor_certificate_sample_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="mt-2 bg-white border border-border px-4 py-2 rounded-xl text-xs font-bold hover:bg-muted transition-colors flex items-center gap-2 shadow-sm"
                        >
                          <Play className="w-3 h-3 fill-blue-600 text-blue-600" /> View Sample PDF
                        </a>
                      </div>
                    ) : (
                      <>
                        <img 
                          src={course.tutor_certificate_sample_url} 
                          alt="Certificate Sample" 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <a 
                            href={course.tutor_certificate_sample_url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="bg-white/90 backdrop-blur-sm text-foreground px-5 py-2.5 rounded-2xl text-sm font-bold shadow-2xl flex items-center gap-2 hover:bg-white transition-all scale-90 group-hover:scale-100"
                          >
                            <Maximize className="w-4 h-4" /> Enlarge Preview
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                  {course.certificate_requirements && (
                    <div className="flex items-start gap-2.5 text-xs text-muted-foreground bg-muted/30 p-3 rounded-xl border border-border/50">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <p><strong>Requirements:</strong> {course.certificate_requirements}</p>
                    </div>
                  )}
                </div>
              )}
              </div>
            </div>
          </section>

          {/* Instructor */}
          {tutor && (
            <section className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" /> Your Instructor
              </h2>
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
                  {tutor.avatar_url
                    ? <img src={tutor.avatar_url} alt={tutor.full_name} className="w-full h-full object-cover" />
                    : <span className="text-white text-2xl font-bold">{(tutor.full_name || "T").charAt(0)}</span>
                  }
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold text-foreground">{tutor.full_name}</p>
                  <p className="text-xs text-muted-foreground mb-3">Course Instructor</p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-blue-500" />Joined {new Date(tutor.created_at).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</div>
                    <div className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-purple-500" />{tutor.courseCount} course{tutor.courseCount !== 1 ? "s" : ""}</div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Desktop sidebar placeholder (actual sticky card is in hero) */}
        <div className="hidden lg:block" />
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-3 z-30 flex items-center gap-4">
        <div className="text-lg font-extrabold text-blue-700 shrink-0">
          {isFree ? "Free" : `NGN ${course.price?.toLocaleString()}`}
        </div>
        <EnrollButton className="flex-1" />
      </div>
    </div>
  );
}
