import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../../../../lib/supabase";
import { Eye, Trash2, Filter, ClipboardX, CheckCircle2, XCircle, Loader2, AlertTriangle } from "lucide-react";
import { courseService } from "../../../../services/courseService";
import toast from "react-hot-toast";

interface Course {
  id: string;
  title: string;
  tutor: string;
  students: number;
  completionRate: number;
  status: string;
}

interface DeletionRequest {
  id: string;
  course_id: string;
  course_title: string;
  tutor_reason: string;
  status: string;
  created_at: string;
  tutor: { id: string; full_name: string; avatar_url: string | null };
}

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

// ── Reusable Reason Modal ────────────────────────────────────────────────────
function ReasonModal({
  open,
  title,
  description,
  confirmLabel,
  confirmClass,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmClass: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState("");

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border p-6">
        <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter your reason here..."
          className="w-full border border-border rounded-xl p-3 text-sm min-h-[100px] resize-none outline-none focus:ring-2 focus:ring-blue-500 bg-muted mb-4"
        />
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => { onCancel(); setReason(""); }}
            className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { if (reason.trim()) { onConfirm(reason.trim()); setReason(""); } }}
            disabled={!reason.trim()}
            className={`px-4 py-2 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-50 ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function CoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [requests, setRequests] = useState<DeletionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [reqLoading, setReqLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Pending");

  // Delete flow
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);

  // Request action flow
  const [reqAction, setReqAction] = useState<{
    mode: "approve" | "reject";
    req: DeletionRequest;
  } | null>(null);

  const fetchCourses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("courses")
      .select("id, title, status, tutor_id")
      .order("created_at", { ascending: false });

    if (error) { console.error(error); setLoading(false); return; }

    if (data) {
      const tutorIds = [...new Set(data.map((c: any) => c.tutor_id).filter(Boolean))];
      let tutorMap: Record<string, string> = {};
      if (tutorIds.length > 0) {
        const { data: tutors } = await supabase.from("users").select("id, full_name").in("id", tutorIds);
        (tutors || []).forEach((t: any) => { tutorMap[t.id] = t.full_name || "Unknown Tutor"; });
      }
      setCourses(data.map((c: any) => ({
        id: c.id, title: c.title, tutor: tutorMap[c.tutor_id] || "Unknown Tutor",
        students: 0, completionRate: 0, status: c.status,
      })));
    }
    setLoading(false);
  };

  const fetchRequests = async () => {
    setReqLoading(true);
    try {
      const data = await courseService.getDeletionRequests();
      setRequests(data as DeletionRequest[]);
    } catch (err: any) {
      toast.error("Failed to load deletion requests: " + err.message);
    } finally {
      setReqLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchRequests();
  }, []);

  // Admin direct delete with reason
  const handleDelete = async (reason: string) => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    try {
      setLoading(true);
      await courseService.deleteCourse(target.id, reason);
      await fetchCourses();
      toast.success(`"${target.title}" deleted. Tutor and enrolled students have been notified.`);
    } catch (err: any) {
      await fetchCourses();
      toast.error(`Failed to delete: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Approve deletion request
  const handleApprove = async (reason: string) => {
    if (!reqAction) return;
    const { req } = reqAction;
    setReqAction(null);
    try {
      await courseService.approveDeletionRequest(req.id, req.course_id, reason);
      await Promise.all([fetchCourses(), fetchRequests()]);
      toast.success(`Course "${req.course_title}" deleted. Tutor and students notified.`);
    } catch (err: any) {
      toast.error(`Approval failed: ${err.message}`);
    }
  };

  // Reject deletion request
  const handleReject = async (reason: string) => {
    if (!reqAction) return;
    const { req } = reqAction;
    setReqAction(null);
    try {
      await courseService.rejectDeletionRequest(req.id, req.tutor.id, req.course_title, reason);
      await fetchRequests();
      toast.success(`Deletion request for "${req.course_title}" rejected. Tutor has been notified.`);
    } catch (err: any) {
      toast.error(`Rejection failed: ${err.message}`);
    }
  };

  const filteredCourses = courses.filter((c) => {
    if (activeFilter === "Pending") return c.status === "pending_review";
    if (activeFilter === "Approved") return c.status === "published";
    if (activeFilter === "Rejected") return c.status === "rejected" || c.status === "needs_changes";
    if (activeFilter === "Drafts") return c.status === "draft";
    return true; // "All"
  });

  const filterTabs = ["Pending", "Approved", "Rejected", "Drafts", "All", "Deletion Requests"];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
        {filterTabs.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
              activeFilter === f
                ? f === "Deletion Requests"
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-blue-600 text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f === "Deletion Requests" && <ClipboardX className="w-3.5 h-3.5" />}
            {f}
            {f === "Deletion Requests" && requests.length > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${activeFilter === f ? "bg-white text-red-600" : "bg-red-600 text-white"}`}>
                {requests.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Deletion Requests View ── */}
      {activeFilter === "Deletion Requests" && (
        <div className="space-y-3">
          {reqLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-red-500" /></div>
          ) : requests.length === 0 ? (
            <Card className="p-10 text-center border-dashed">
              <ClipboardX className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground text-sm">No pending deletion requests.</p>
            </Card>
          ) : (
            requests.map((req) => (
              <Card key={req.id} className="p-5 border-border border-l-4 border-l-red-500">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{req.course_title}</h3>
                      <span className="text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full">Deletion Requested</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{req.tutor?.full_name || "Unknown Tutor"}</span> — {new Date(req.created_at).toLocaleDateString()}
                    </p>
                    <div className="bg-muted rounded-lg p-3 text-sm text-foreground/80 border-l-2 border-amber-400 mt-2">
                      <span className="font-semibold text-amber-700">Tutor's Reason: </span>{req.tutor_reason}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => setReqAction({ mode: "approve", req })}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-medium hover:bg-emerald-100 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => setReqAction({ mode: "reject", req })}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* ── Standard Courses Table ── */}
      {activeFilter !== "Deletion Requests" && (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Card className="border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Title</TableHead>
                    <TableHead>Tutor</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Completion Rate</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course) => (
                    <TableRow key={course.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-medium max-w-xs">
                        {course.title}
                        {course.status === "pending_review" && <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Pending</span>}
                        {course.status === "needs_changes" && <span className="ml-2 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Needs Changes</span>}
                        {course.status === "draft" && <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Draft</span>}
                      </TableCell>
                      <TableCell className="text-gray-600">{course.tutor}</TableCell>
                      <TableCell className="text-gray-900">{course.students}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Progress value={course.completionRate} className="w-24" />
                          <span className="text-sm text-gray-600 min-w-12">{course.completionRate}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/app/admin/courses/${course.id}/review`)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            {course.status === "pending_review" ? "Review" : "View"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(course)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>

          {/* Mobile Cards */}
          <div className="space-y-4 md:hidden">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="p-4 border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{course.title}</h3>
                    {course.status === "pending_review" && <span className="inline-block mt-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Pending Review</span>}
                    {course.status === "needs_changes" && <span className="inline-block mt-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Needs Changes</span>}
                    <p className="text-sm text-gray-600 mt-2">Tutor: {course.tutor}</p>
                    <p className="text-sm text-gray-600 mt-1">Students: {course.students}</p>
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
                      <div className="flex items-center gap-3">
                        <Progress value={course.completionRate} className="flex-1" />
                        <span className="text-sm text-gray-600">{course.completionRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/app/admin/courses/${course.id}/review`)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {course.status === "pending_review" ? "Review" : "View"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(course)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* ── Reason Modal: Admin Direct Delete ── */}
      <ReasonModal
        open={!!deleteTarget}
        title={`Delete "${deleteTarget?.title}"`}
        description="This will permanently delete the course and notify the tutor and all enrolled students. Please provide a clear reason — it will be included in their notifications."
        confirmLabel="Delete Course"
        confirmClass="bg-red-600 hover:bg-red-700"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* ── Reason Modal: Approve Request ── */}
      <ReasonModal
        open={reqAction?.mode === "approve"}
        title={`Approve deletion of "${reqAction?.req.course_title}"`}
        description="The course will be permanently deleted. The tutor and all enrolled students will be notified with your reason."
        confirmLabel="Approve & Delete"
        confirmClass="bg-emerald-600 hover:bg-emerald-700"
        onConfirm={handleApprove}
        onCancel={() => setReqAction(null)}
      />

      {/* ── Reason Modal: Reject Request ── */}
      <ReasonModal
        open={reqAction?.mode === "reject"}
        title={`Reject deletion of "${reqAction?.req.course_title}"`}
        description="The course will remain active. The tutor will be notified with your reason for rejection."
        confirmLabel="Reject Request"
        confirmClass="bg-red-600 hover:bg-red-700"
        onConfirm={handleReject}
        onCancel={() => setReqAction(null)}
      />
    </div>
  );
}
