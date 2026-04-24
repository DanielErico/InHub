import { Eye, AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";

const assignments = [
  {
    id: 1,
    title: "JavaScript Fundamentals Quiz",
    course: "Introduction to Web Development",
    submissions: 287,
    total: 342,
    deadline: "Apr 25, 2026",
    late: 12,
    missing: 43,
  },
  {
    id: 2,
    title: "Data Analysis Project",
    course: "Data Science Fundamentals",
    submissions: 234,
    total: 289,
    deadline: "Apr 22, 2026",
    late: 8,
    missing: 47,
  },
  {
    id: 3,
    title: "Build a Todo App",
    course: "Mobile App Development",
    submissions: 198,
    total: 256,
    deadline: "Apr 28, 2026",
    late: 5,
    missing: 53,
  },
  {
    id: 4,
    title: "Neural Network Implementation",
    course: "Machine Learning Basics",
    submissions: 142,
    total: 198,
    deadline: "Apr 30, 2026",
    late: 3,
    missing: 53,
  },
  {
    id: 5,
    title: "User Research Report",
    course: "UI/UX Design Principles",
    submissions: 159,
    total: 167,
    deadline: "Apr 23, 2026",
    late: 4,
    missing: 4,
  },
];

export function AssignmentsPage() {
  return (
    <div className="space-y-6">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <Card className="border-gray-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assignment Title</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Submissions</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Issues</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow
                  key={assignment.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="font-medium">{assignment.title}</TableCell>
                  <TableCell className="text-gray-600 max-w-xs">
                    {assignment.course}
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-900">
                      {assignment.submissions}/{assignment.total}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {assignment.deadline}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {assignment.late > 0 && (
                        <Badge
                          variant="secondary"
                          className="bg-orange-100 text-orange-700 hover:bg-orange-100"
                        >
                          {assignment.late} late
                        </Badge>
                      )}
                      {assignment.missing > 0 && (
                        <Badge
                          variant="secondary"
                          className="bg-red-100 text-red-700 hover:bg-red-100"
                        >
                          {assignment.missing} missing
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-4 md:hidden">
        {assignments.map((assignment) => (
          <Card key={assignment.id} className="p-4 border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {assignment.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{assignment.course}</p>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span className="text-gray-900">
                    {assignment.submissions}/{assignment.total} submitted
                  </span>
                  <span className="text-gray-600">Due: {assignment.deadline}</span>
                </div>
                {(assignment.late > 0 || assignment.missing > 0) && (
                  <div className="flex gap-2 mt-3">
                    {assignment.late > 0 && (
                      <Badge
                        variant="secondary"
                        className="bg-orange-100 text-orange-700"
                      >
                        {assignment.late} late
                      </Badge>
                    )}
                    {assignment.missing > 0 && (
                      <Badge
                        variant="secondary"
                        className="bg-red-100 text-red-700"
                      >
                        {assignment.missing} missing
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              <Button variant="ghost" size="icon">
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Info Banner */}
      <Card className="p-4 border-orange-200 bg-orange-50">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-orange-900">
              Assignments require attention
            </h4>
            <p className="text-sm text-orange-700 mt-1">
              Multiple assignments have late or missing submissions. Consider
              sending reminders to affected students.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
