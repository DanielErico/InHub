import { useState } from "react";
import { useUserProfile } from "../../context/UserProfileContext";
import { supabase } from "../../../lib/supabase";
import toast from "react-hot-toast";
import { Loader2, ArrowRight, User, Globe, MapPin, Briefcase, ChevronRight, CheckCircle2 } from "lucide-react";

export default function OnboardingFlow() {
  const { profile, completeOnboarding } = useUserProfile();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Profile Form State
  const [bio, setBio] = useState(profile?.bio || "");
  const [location, setLocation] = useState(profile?.location || "");
  const [website, setWebsite] = useState(profile?.website || "");
  const [linkedin, setLinkedin] = useState(profile?.linkedin || "");

  // Survey Form State
  const [source, setSource] = useState("");
  const [goal, setGoal] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const isTutor = profile?.role === 'tutor';

  const TUTOR_FEATURES = [
    "Course Creation Tools",
    "Student Analytics",
    "AI Lesson Planner",
    "Revenue Tracking",
    "Live Class Hosting",
    "Automated Grading",
  ];

  const STUDENT_FEATURES = [
    "Video Courses",
    "Live Classes",
    "AI Tutor Assistant",
    "Interactive Assignments",
    "Course Certificates",
    "Study Schedule",
  ];

  const PLATFORM_FEATURES = isTutor ? TUTOR_FEATURES : STUDENT_FEATURES;

  const TUTOR_GOALS = [
    "Share my expertise",
    "Build an audience",
    "Earn extra income",
    "Professional networking",
    "Other"
  ];

  const STUDENT_GOALS = [
    "Learn a new skill",
    "Career advancement",
    "Get certified",
    "Personal development",
    "Other"
  ];

  const GOALS = isTutor ? TUTOR_GOALS : STUDENT_GOALS;

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev =>
      prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]
    );
  };

  const handleNextStep = () => {
    // Basic validation for Step 1
    if (!bio.trim() || !location.trim()) {
      toast.error("Please fill in your bio and location to continue.");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!profile?.id) return;

    if (!source || !goal.trim() || selectedFeatures.length === 0) {
      toast.error("Please answer all survey questions to complete setup.");
      return;
    }

    setLoading(true);
    try {
      // 1. Upsert Profile in public.users to guarantee it exists
      const { error: profileError } = await supabase
        .from("users")
        .upsert({
          id: profile.id,
          full_name: profile.full_name || 'User',
          role: profile.role || 'student',
          avatar_url: profile.avatar_url,
          bio,
          location,
          website,
          linkedin,
          has_completed_onboarding: true
        });

      if (profileError) throw profileError;

      // 2. Upsert Survey Response (prevents 409 Conflict)
      const { error: surveyError } = await supabase
        .from("onboarding_responses")
        .upsert({
          user_id: profile.id,
          role: profile.role || 'unknown',
          source,
          goal,
          features: selectedFeatures.join(", ")
        }, { onConflict: 'user_id' });

      if (surveyError) throw surveyError;

      // 3. Mark as complete in context to unlock dashboard
      toast.success("Welcome aboard!");
      completeOnboarding();
      
    } catch (err: any) {
      console.error("Failed onboarding submission:", err);
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-blue-200">
            <span className="text-2xl font-bold text-white">IH</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {step === 1 ? "Complete your profile" : "Just a few quick questions"}
          </h2>
          <p className="mt-3 text-lg text-slate-500 max-w-sm mx-auto">
            {step === 1 
              ? "Let the InHub community know a bit more about you." 
              : "Help us tailor your experience to exactly what you need."}
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          
          {/* Progress Bar */}
          <div className="flex bg-slate-50 border-b border-slate-100">
            <div className={`flex-1 py-4 text-center text-sm font-semibold transition-colors duration-300 ${step === 1 ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>
              1. Profile Setup
            </div>
            <div className={`flex-1 py-4 text-center text-sm font-semibold transition-colors duration-300 ${step === 2 ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>
              2. Quick Survey
            </div>
          </div>

          <div className="p-8 sm:p-10">
            {step === 1 ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" /> Short Bio *
                  </label>
                  <textarea
                    required
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us a bit about your background and interests..."
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 p-4 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" /> Location *
                  </label>
                  <input
                    required
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Lagos, Nigeria"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-slate-400" /> Website (Optional)
                    </label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://..."
                      className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-slate-400" /> LinkedIn (Optional)
                    </label>
                    <input
                      type="url"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="linkedin.com/in/..."
                      className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white text-sm"
                    />
                  </div>
                </div>

                <button
                  onClick={handleNextStep}
                  className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all flex items-center justify-center gap-2"
                >
                  Continue to Step 2 <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                
                {/* Q1 */}
                <div className="space-y-3">
                  <label className="block text-base font-bold text-slate-800">
                    1. How did you hear about us? <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-4 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white font-medium"
                  >
                    <option value="" disabled>Select an option...</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Friend or Colleague">Friend or Colleague</option>
                    <option value="Search Engine">Search Engine (Google, etc.)</option>
                    <option value="Advertisement">Advertisement</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Q2 */}
                <div className="space-y-3">
                  <label className="block text-base font-bold text-slate-800">
                    2. What is your primary goal on this platform? <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-4 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white font-medium"
                  >
                    <option value="" disabled>Select your main goal...</option>
                    {GOALS.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                {/* Q3 */}
                <div className="space-y-3">
                  <label className="block text-base font-bold text-slate-800">
                    3. What {isTutor ? 'instructor' : 'learning'} features are you most excited about? <span className="text-red-500">*</span>
                    <span className="text-sm font-normal text-slate-500 ml-1">(Select all that apply)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {PLATFORM_FEATURES.map((feature) => {
                      const isChecked = selectedFeatures.includes(feature);
                      return (
                        <button
                          key={feature}
                          type="button"
                          onClick={() => toggleFeature(feature)}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left text-sm font-medium transition-all ${
                            isChecked
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                            isChecked ? 'bg-blue-500 border-blue-500' : 'border-slate-300'
                          }`}>
                            {isChecked && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          {feature}
                        </button>
                      );
                    })}
                  </div>
                  {selectedFeatures.length > 0 && (
                    <p className="text-xs text-blue-600 font-medium">{selectedFeatures.length} selected</p>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-4 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-slate-900 hover:bg-black text-white font-bold py-4 px-8 rounded-xl shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>Complete Setup <CheckCircle2 className="w-5 h-5" /></>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
