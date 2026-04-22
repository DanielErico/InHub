import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";
import { MoreVertical, Eye, CheckCircle, Trash2 } from "lucide-react";

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
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<{
    open: boolean;
    course?: typeof courses[0];
    action?: "approve" | "delete";
  }>({ open: false });

  useEffect(() => {
    async function fetchCourses() {
      const { data } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          status,
          users!tutor_id ( full_name )
        `);
      
      if (data) {
        setCourses(data.map((c: any) => ({
          id: c.id,
          title: c.title,
          tutor: c.users?.full_name || 'Unknown Tutor',
          students: Math.floor(Math.random() * 300), // mock until enrollments table exists
          completionRate: Math.floor(Math.random() * 100), // mock
          status: c.status === 'published' ? 'approved' : 'pending'
        })));
      }
      setLoading(false);
    }
    fetchCourses();
  }, []);

  const handleConfirm = () => {
    console.log(`${confirmAction.action} course:`, confirmAction.course?.title);
    setConfirmAction({ open: false });
  };

  return (
    <div className="space-y-6">
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
              {courses.map((course) => (
                <TableRow
                  key={course.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="font-medium max-w-xs">
                    {course.title}
                    {course.status === "pending" && (
                      <span className="ml-2 text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                        Pending Review
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
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Course
                        </DropdownMenuItem>
                        {course.status === "pending" && (
                          <DropdownMenuItem
                            onClick={() =>
                              setConfirmAction({
                                open: true,
                                course,
                                action: "approve",
                              })
                            }
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </DropdownMenuItem>
                        )}
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
        {courses.map((course) => (
          <Card key={course.id} className="p-4 border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{course.title}</h3>
                {course.status === "pending" && (
                  <span className="inline-block mt-1 text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                    Pending Review
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
                  <DropdownMenuItem>
                    <Eye className="w-4 h-4 mr-2" />
                    View Course
                  </DropdownMenuItem>
                  {course.status === "pending" && (
                    <DropdownMenuItem
                      onClick={() =>
                        setConfirmAction({ open: true, course, action: "approve" })
                      }
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </DropdownMenuItem>
                  )}
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
            <AlertDialogTitle>
              {confirmAction.action === "delete"
                ? "Delete Course"
                : "Approve Course"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction.action === "delete"
                ? `Are you sure you want to delete "${confirmAction.course?.title}"? This action cannot be undone.`
                : `Are you sure you want to approve "${confirmAction.course?.title}"?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
