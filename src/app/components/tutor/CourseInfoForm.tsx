import React, { useState } from "react";
import { Plus, Trash2, Save, Loader2, ChevronDown, ChevronUp, Upload } from "lucide-react";
import { courseService, Course, CourseModule } from "../../../services/courseService";

interface Props { course: Course; onSaved: (updated: Course) => void; }

const LEVELS = ["beginner","intermediate","advanced"] as const;
const LANGUAGES = ["English","Yoruba","Igbo","Hausa","French","Pidgin"];
const FORMATS = ["Video Lessons","PDF Materials","Live Sessions","Recorded Sessions","Assignments","Projects"];

export function CourseInfoForm({ course, onSaved }: Props) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadState, setUploadState] = useState("");

  const [level, setLevel] = useState<string>(course.level || "");
  const [language, setLanguage] = useState(course.language || "English");
  const [targetAudience, setTargetAudience] = useState(course.target_audience || "");
  const [outcomes, setOutcomes] = useState<string[]>(course.learning_outcomes?.length ? course.learning_outcomes : ["","",""]);
  const [requirements, setRequirements] = useState<string[]>(course.requirements?.length ? course.requirements : [""]);
  const [modules, setModules] = useState<CourseModule[]>(course.modules?.length ? course.modules : [{ title: "", lessons: [""] }]);
  const [teachingFormats, setTeachingFormats] = useState<string[]>(
    course.teaching_format ? course.teaching_format.split(",") : []
  );
  const [totalDuration, setTotalDuration] = useState(course.total_duration || "");
  const [hasAssignments, setHasAssignments] = useState(course.has_assignments ?? false);
  const [assignmentCount, setAssignmentCount] = useState(course.assignment_count ?? 0);
  const [hasCertificate, setHasCertificate] = useState(course.has_certificate ?? false);
  const [certReqs, setCertReqs] = useState(course.certificate_requirements || "");
  const [previewUrl, setPreviewUrl] = useState(course.preview_video_url || "");
  const [thumbnailUrl, setThumbnailUrl] = useState(course.thumbnail_url || "");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [hasTutorCert, setHasTutorCert] = useState(course.has_tutor_certificate ?? false);
  const [certSampleUrl, setCertSampleUrl] = useState(course.tutor_certificate_sample_url || "");
  const [certFile, setCertFile] = useState<File | null>(null);

  const addOutcome = () => setOutcomes(p => [...p, ""]);
  const removeOutcome = (i: number) => setOutcomes(p => p.filter((_, j) => j !== i));
  const setOutcome = (i: number, v: string) => setOutcomes(p => p.map((x, j) => j === i ? v : x));

  const addRequirement = () => setRequirements(p => [...p, ""]);
  const removeRequirement = (i: number) => setRequirements(p => p.filter((_, j) => j !== i));
  const setRequirement = (i: number, v: string) => setRequirements(p => p.map((x, j) => j === i ? v : x));

  const addModule = () => setModules(p => [...p, { title: "", lessons: [""] }]);
  const removeModule = (i: number) => setModules(p => p.filter((_, j) => j !== i));
  const setModuleTitle = (i: number, v: string) => setModules(p => p.map((m, j) => j === i ? { ...m, title: v } : m));
  const addLesson = (mi: number) => setModules(p => p.map((m, j) => j === mi ? { ...m, lessons: [...m.lessons, ""] } : m));
  const removeLesson = (mi: number, li: number) => setModules(p => p.map((m, j) => j === mi ? { ...m, lessons: m.lessons.filter((_, k) => k !== li) } : m));
  const setLesson = (mi: number, li: number, v: string) => setModules(p => p.map((m, j) => j === mi ? { ...m, lessons: m.lessons.map((l, k) => k === li ? v : l) } : m));

  const toggleFormat = (f: string) => setTeachingFormats(p => p.includes(f) ? p.filter(x => x !== f) : [...p, f]);

  const handleSave = async () => {
    setSaving(true);
    setUploadProgress(0);
    setUploadState("");
    try {
      let finalThumbnailUrl = thumbnailUrl;
      if (thumbnailFile) {
        setUploadState("Uploading Thumbnail...");
        finalThumbnailUrl = await courseService.uploadCourseThumbnail(course.id, thumbnailFile, setUploadProgress);
      }

      let finalCertSampleUrl = certSampleUrl;
      if (certFile) {
        setUploadState("Uploading Certificate...");
        setUploadProgress(0);
        finalCertSampleUrl = await courseService.uploadCertificateSample(course.id, certFile, setUploadProgress);
      }
      
      setUploadState("Saving Details...");

      await courseService.updateCourseDetails(course.id, {
        level: level as any,
        language,
        target_audience: targetAudience,
        learning_outcomes: outcomes.filter(Boolean),
        requirements: requirements.filter(Boolean),
        modules: modules.filter(m => m.title),
        teaching_format: teachingFormats.join(","),
        total_duration: totalDuration,
        has_assignments: hasAssignments,
        assignment_count: assignmentCount,
        has_certificate: hasCertificate,
        certificate_requirements: certReqs,
        preview_video_url: previewUrl,
        thumbnail_url: finalThumbnailUrl,
        has_tutor_certificate: hasTutorCert,
        tutor_certificate_sample_url: finalCertSampleUrl,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      onSaved({ ...course, level: level as any, language, target_audience: targetAudience, learning_outcomes: outcomes, requirements, modules, teaching_format: teachingFormats.join(","), total_duration: totalDuration, has_assignments: hasAssignments, assignment_count: assignmentCount, has_certificate: hasCertificate, certificate_requirements: certReqs, preview_video_url: previewUrl, thumbnail_url: finalThumbnailUrl });
    } catch (err: any) {
      alert("Save failed: " + err.message);
    } finally {
      setSaving(false);
      setUploadState("");
      setUploadProgress(0);
    }
  };

  const inputCls = "w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-700 focus:border-transparent outline-none bg-background text-foreground";
  const sectionCls = "bg-card rounded-2xl border border-border shadow-sm p-6 space-y-4";
  const labelCls = "block text-sm font-semibold text-foreground mb-1.5";

  return (
    <div className="space-y-6">
      {/* Basic Setup */}
      <div className={sectionCls}>
        <h3 className="font-bold text-foreground text-base flex items-center gap-2">🎯 Basic Setup</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Course Level</label>
            <select value={level} onChange={e => setLevel(e.target.value)} className={inputCls}>
              <option value="">Select level...</option>
              {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Language</label>
            <select value={language} onChange={e => setLanguage(e.target.value)} className={inputCls}>
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Total Duration</label>
            <input className={inputCls} value={totalDuration} onChange={e => setTotalDuration(e.target.value)} placeholder="e.g. 3 weeks, 10 hours" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Course Thumbnail Image <span className="text-muted-foreground font-normal">(Cover image)</span></label>
            <div className="flex items-center gap-3">
              {thumbnailUrl && (
                <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-muted border border-border">
                  <img src={thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                </div>
              )}
              <label className="flex-1 border border-dashed border-border hover:border-blue-500 rounded-xl px-4 py-2.5 text-sm flex items-center justify-center cursor-pointer transition-colors text-muted-foreground hover:text-blue-600 bg-card h-12">
                <Upload className="w-4 h-4 mr-2 shrink-0" /> <span className="truncate">{thumbnailFile ? thumbnailFile.name : "Upload new image"}</span>
                <input type="file" accept="image/*" className="hidden" onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    setThumbnailFile(e.target.files[0]);
                    setThumbnailUrl(URL.createObjectURL(e.target.files[0]));
                  }
                }} />
              </label>
            </div>
          </div>
          <div>
            <label className={labelCls}>Preview Video URL <span className="text-muted-foreground font-normal">(Public intro)</span></label>
            <input className={inputCls} value={previewUrl} onChange={e => setPreviewUrl(e.target.value)} placeholder="https://..." />
          </div>
        </div>
      </div>

      {/* Learning Outcomes */}
      <div className={sectionCls}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-foreground text-base">🏆 Learning Outcomes</h3>
          <button onClick={addOutcome} className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 flex items-center gap-1 font-medium"><Plus className="w-3 h-3"/>Add</button>
        </div>
        <p className="text-xs text-muted-foreground">"By the end of this course, students will be able to..."</p>
        <div className="space-y-2">
          {outcomes.map((o, i) => (
            <div key={i} className="flex gap-2 items-center">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">{i+1}</span>
              <input className={inputCls} value={o} onChange={e => setOutcome(i, e.target.value)} placeholder={`Outcome ${i+1}...`} />
              {outcomes.length > 1 && <button onClick={() => removeOutcome(i)} className="text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4"/></button>}
            </div>
          ))}
        </div>
      </div>

      {/* Target Audience */}
      <div className={sectionCls}>
        <h3 className="font-bold text-foreground text-base">👥 Target Audience</h3>
        <textarea className={inputCls + " resize-none"} rows={3} value={targetAudience} onChange={e => setTargetAudience(e.target.value)} placeholder="Who is this course for? e.g. Absolute beginners, university students, designers looking to switch careers..." />
      </div>

      {/* Requirements */}
      <div className={sectionCls}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-foreground text-base">📋 Requirements</h3>
          <button onClick={addRequirement} className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 flex items-center gap-1 font-medium"><Plus className="w-3 h-3"/>Add</button>
        </div>
        <div className="space-y-2">
          {requirements.map((r, i) => (
            <div key={i} className="flex gap-2 items-center">
              <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0 mt-0.5"/>
              <input className={inputCls} value={r} onChange={e => setRequirement(i, e.target.value)} placeholder="e.g. A laptop with internet, No prior experience needed..." />
              {requirements.length > 1 && <button onClick={() => removeRequirement(i)} className="text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4"/></button>}
            </div>
          ))}
        </div>
      </div>

      {/* Course Modules */}
      <div className={sectionCls}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-foreground text-base">📚 Course Modules</h3>
          <button onClick={addModule} className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 flex items-center gap-1 font-medium"><Plus className="w-3 h-3"/>Add Module</button>
        </div>
        <div className="space-y-4">
          {modules.map((mod, mi) => (
            <div key={mi} className="border border-border rounded-xl overflow-hidden">
              <div className="bg-muted/50 px-4 py-3 flex gap-3 items-center">
                <span className="w-7 h-7 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs font-bold shrink-0">M{mi+1}</span>
                <input className="flex-1 bg-transparent text-sm font-semibold text-foreground outline-none placeholder-muted-foreground" value={mod.title} onChange={e => setModuleTitle(mi, e.target.value)} placeholder={`Module ${mi+1} title...`} />
                {modules.length > 1 && <button onClick={() => removeModule(mi)} className="text-muted-foreground hover:text-red-500 shrink-0"><Trash2 className="w-4 h-4"/></button>}
              </div>
              <div className="px-4 py-3 space-y-2">
                {mod.lessons.map((lesson, li) => (
                  <div key={li} className="flex gap-2 items-center">
                    <span className="text-xs text-muted-foreground w-5 text-right shrink-0">{li+1}.</span>
                    <input className={inputCls + " text-xs py-2"} value={lesson} onChange={e => setLesson(mi, li, e.target.value)} placeholder="Lesson title..." />
                    {mod.lessons.length > 1 && <button onClick={() => removeLesson(mi, li)} className="text-muted-foreground hover:text-red-500"><Trash2 className="w-3.5 h-3.5"/></button>}
                  </div>
                ))}
                <button onClick={() => addLesson(mi)} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 ml-7 mt-1"><Plus className="w-3 h-3"/>Add lesson</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Teaching Format */}
      <div className={sectionCls}>
        <h3 className="font-bold text-foreground text-base">🎬 Teaching Format</h3>
        <div className="flex flex-wrap gap-2">
          {FORMATS.map(f => (
            <button key={f} onClick={() => toggleFormat(f)} className={`text-sm px-3 py-1.5 rounded-lg border transition-colors font-medium ${teachingFormats.includes(f) ? "bg-blue-700 text-white border-blue-700" : "bg-card border-border text-muted-foreground hover:border-blue-400"}`}>{f}</button>
          ))}
        </div>
      </div>

      {/* Assignments & Certificate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={sectionCls}>
          <h3 className="font-bold text-foreground text-base">📝 Assignments & Practice</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => setHasAssignments(p => !p)} className={`w-11 h-6 rounded-full transition-colors relative ${hasAssignments ? "bg-blue-600" : "bg-muted"}`}>
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${hasAssignments ? "translate-x-5" : ""}`}/>
            </div>
            <span className="text-sm text-foreground">Includes assignments</span>
          </label>
          {hasAssignments && (
            <div>
              <label className={labelCls}>Number of assignments</label>
              <input type="number" min={0} className={inputCls} value={assignmentCount} onChange={e => setAssignmentCount(Number(e.target.value))} />
            </div>
          )}
        </div>

        <div className={sectionCls}>
          <h3 className="font-bold text-foreground text-base">🎓 Certification</h3>
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-xs text-blue-700 font-medium">Note: Intern Connect will always award a certificate upon completion. You can also award your own custom certificate.</p>
            </div>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <div onClick={() => setHasTutorCert(p => !p)} className={`w-11 h-6 rounded-full transition-colors relative ${hasTutorCert ? "bg-blue-600" : "bg-muted"}`}>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${hasTutorCert ? "translate-x-5" : ""}`}/>
              </div>
              <span className="text-sm text-foreground">Award Tutor Certificate</span>
            </label>

            {hasTutorCert && (
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>Sample Certificate</label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 cursor-pointer">
                      <div className="border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-blue-400 transition-colors">
                        <Upload className="w-6 h-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Click to upload sample (PNG/JPG/PDF)</span>
                      </div>
                      <input type="file" className="hidden" accept="image/*,.pdf" onChange={e => setCertFile(e.target.files?.[0] || null)} />
                    </label>
                    {(certFile || certSampleUrl) && (
                      <div className="w-20 h-14 bg-muted rounded-lg overflow-hidden border border-border flex items-center justify-center">
                        {certFile ? (
                          <span className="text-[10px] text-center px-1 font-medium">{certFile.name.slice(0, 15)}...</span>
                        ) : (
                          <img src={certSampleUrl} alt="Sample" className="w-full h-full object-cover" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Requirements to earn it</label>
                  <textarea className={inputCls + " resize-none"} rows={2} value={certReqs} onChange={e => setCertReqs(e.target.value)} placeholder="e.g. Complete all modules and submit final project..." />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex flex-col items-end gap-3 pb-6">
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-emerald-600 font-medium flex items-center gap-1.5">✅ Saved successfully</span>}
          <button onClick={handleSave} disabled={saving} className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-60 transition-colors">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin"/>Saving...</> : <><Save className="w-4 h-4"/>Save Course Info</>}
          </button>
        </div>
        
        {saving && uploadState && uploadState.startsWith("Uploading") && (
          <div className="w-64 space-y-1.5 bg-card border border-border p-3 rounded-xl shadow-sm">
            <div className="flex justify-between text-xs font-medium text-foreground">
              <span>{uploadState}</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
