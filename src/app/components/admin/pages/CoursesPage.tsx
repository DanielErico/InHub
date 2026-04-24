import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../../../../lib/supabase";
import { MoreVertical, Eye, Trash2, Filter } from "lucide-react";

interface Course {
  id: string;
  title: string;
  tutor: string;
  students: number;
  completionRate: number;
  status: string;
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
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

export function CoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Pending");
  const [confirmAction, setConfirmAction] = useState<{
    open: boolean;
    course?: typeof courses[0];
    action?: "delete";
  }>({ open: false });

  const fetchCourses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('courses')
      .select('id, title, status, tutor_id')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching courses:', error);
      setLoading(false);
      return;
    }

    if (data) {
      // Fetch tutor names separately
      const tutorIds = [...new Set(data.map((c: any) => c.tutor_id).filter(Boolean))];
      let tutorMap: Record<string, string> = {};

      if (tutorIds.length > 0) {
        const { data: tutors } = await supabase
          .from('users')
          .select('id, full_name')
          .in('id', tutorIds);
        
        (tutors || []).forEach((t: any) => {
          tutorMap[t.id] = t.full_name || 'Unknown Tutor';
        });
      }

      setCourses(data.map((c: any) => ({
        id: c.id,
        title: c.title,
        tutor: tutorMap[c.tutor_id] || 'Unknown Tutor',
        students: 0,
        completionRate: 0,
        status: c.status
      })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleConfirm = () => {
    console.log(`${confirmAction.action} course:`, confirmAction.course?.title);
    setConfirmAction({ open: false });
  };

  const filteredCourses = courses.filter((c) => {
    if (activeFilter === "Pending") return c.status === "pending_review";
    if (activeFilter === "Approved") return c.status === "published";
    if (activeFilter === "Rejected") return c.status === "rejected" || c.status === "needs_changes";
    if (activeFilter === "Drafts") return c.status === "draft";
    return true; // "All"
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-4 h-4 text-gray-500" />
        {["Pending", "Approved", "Rejected", "Drafts", "All"].map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeFilter === f
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

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
                <TableRow
                  key={course.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="font-medium max-w-xs">
                    {course.title}
                    {course.status === "pending_review" && (
                      <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        Pending
                      </span>
                    )}
                    {course.status === "needs_changes" && (
                      <span className="ml-2 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                        Needs Changes
                      </span>
                    )}
                    {course.status === "draft" && (
                      <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        Draft
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-600">{course.tutor}</TableCell>
                  <TableCell className="text-gray-900">
                    {course.students}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Progress value={course.completionRate} className="w-24" />
                      <span className="text-sm text-gray-600 min-w-12">
                        {course.completionRate}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/app/admin/courses/${course.id}/review`)}>
                          <Eye className="w-4 h-4 mr-2" />
                          {course.status === "pending_review" ? "Review Course" : "View Details"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() =>
                            setConfirmAction({
                              open: true,
                              course,
                              action: "delete",
                            })
                          }
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                {course.status === "pending_review" && (
                  <span className="inline-block mt-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    Pending Review
                  </span>
                )}
                {course.status === "needs_changes" && (
                  <span className="inline-block mt-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                    Needs Changes
                  </span>
                )}
                <p className="text-sm text-gray-600 mt-2">
                  Tutor: {course.tutor}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Students: {course.students}
                </p>
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
                  <div className="flex items-center gap-3">
                    <Progress value={course.completionRate} className="flex-1" />
                    <span className="text-sm text-gray-600">
                      {course.completionRate}%
                    </span>
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setReviewCourseId(course.id)}>
                    <Eye className="w-4 h-4 mr-2" />
                    {course.status === "pending_review" ? "Review Course" : "View Details"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() =>
                      setConfirmAction({ open: true, course, action: "delete" })
                    }
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        ))}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmAction.open}
        onOpenChange={(open) => setConfirmAction({ ...confirmAction, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{confirmAction.course?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} className="bg-red-600 hover:bg-red-700">Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
