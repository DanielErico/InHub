import { UserPlus, BookOpen, AlertTriangle, Send } from "lucide-react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const notifications = [
  {
    id: 1,
    type: "signup",
    icon: UserPlus,
    title: "New tutor signup",
    message: "Dr. Robert Martinez has signed up as a tutor",
    time: "5 minutes ago",
    unread: true,
  },
  {
    id: 2,
    type: "course",
    icon: BookOpen,
    title: "New course uploaded",
    message: 'Sarah Chen uploaded "Advanced React Patterns"',
    time: "1 hour ago",
    unread: true,
  },
  {
    id: 3,
    type: "alert",
    icon: AlertTriangle,
    title: "Inactive students detected",
    message: "47 students haven't logged in for over 7 days",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: 4,
    type: "course",
    icon: BookOpen,
    title: "Course pending approval",
    message: 'James Wilson submitted "Python for Beginners" for review',
    time: "3 hours ago",
    unread: false,
  },
  {
    id: 5,
    type: "signup",
    icon: UserPlus,
    title: "New tutor signup",
    message: "Emily Rodriguez has signed up as a tutor",
    time: "5 hours ago",
    unread: false,
  },
  {
    id: 6,
    type: "alert",
    icon: AlertTriangle,
    title: "Low course completion rate",
    message: "Mobile Development course has 42% completion rate",
    time: "1 day ago",
    unread: false,
  },
];

const iconColors = {
  signup: "text-blue-600 bg-blue-50",
  course: "text-purple-600 bg-purple-50",
  alert: "text-orange-600 bg-orange-50",
};

export function NotificationsPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Notifications List */}
      <div className="lg:col-span-2 space-y-3">
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            className={`p-4 border-gray-200 transition-colors ${
              notification.unread ? "bg-blue-50/30" : ""
            }`}
          >
            <div className="flex gap-4">
              <div
                className={`p-2.5 rounded-lg h-fit ${
                  iconColors[notification.type as keyof typeof iconColors]
                }`}
              >
                <notification.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {notification.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {notification.time}
                    </p>
                  </div>
                  {notification.unread && (
                    <Badge className="bg-blue-600 hover:bg-blue-600 text-white">
                      New
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Broadcast Section */}
      <div className="lg:col-span-1">
        <Card className="p-6 border-gray-200 sticky top-24">
          <h3 className="font-semibold text-gray-900 mb-4">
            Broadcast Message
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-700 mb-2 block">
                Select Audience
              </label>
              <Select defaultValue="all-students">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-students">All Students</SelectItem>
                  <SelectItem value="all-tutors">All Tutors</SelectItem>
                  <SelectItem value="all-users">All Users</SelectItem>
                  <SelectItem value="web-dev">Web Development Course</SelectItem>
                  <SelectItem value="data-science">
                    Data Science Course
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-gray-700 mb-2 block">
                Message
              </label>
              <Textarea
                placeholder="Type your message here..."
                className="min-h-32 resize-none"
              />
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <Send className="w-4 h-4 mr-2" />
              Send Broadcast
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
