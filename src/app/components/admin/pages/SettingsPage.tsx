import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";

export function SettingsPage() {
  return (
    <div className="max-w-4xl space-y-6">
      {/* Account Settings */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="text-xl bg-blue-100 text-blue-700">
                AD
              </AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" size="sm">
                Change Photo
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                JPG, PNG or GIF. Max size 2MB
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue="Admin User" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="admin@inhub.com" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input id="confirm-password" type="password" />
            </div>
          </div>

          <div className="flex justify-end">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Role Management */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle>Role Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
              <div>
                <h4 className="font-medium text-gray-900">Super Admin</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Full access to all features and settings
                </p>
              </div>
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                Your Role
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
              <div>
                <h4 className="font-medium text-gray-900">Content Moderator</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Can approve/reject courses and manage users
                </p>
              </div>
              <Badge variant="outline">Not Assigned</Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
              <div>
                <h4 className="font-medium text-gray-900">Support Admin</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Can view analytics and respond to user issues
                </p>
              </div>
              <Badge variant="outline">Not Assigned</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Settings */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle>Platform Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
            <div>
              <h4 className="font-medium text-gray-900">
                Email Notifications
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                Receive email alerts for important events
              </p>
            </div>
            <Button variant="outline" size="sm">
              Configure
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
            <div>
              <h4 className="font-medium text-gray-900">Data Export</h4>
              <p className="text-sm text-gray-600 mt-1">
                Export platform data and analytics
              </p>
            </div>
            <Button variant="outline" size="sm">
              Export
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
            <div>
              <h4 className="font-medium text-gray-900">System Logs</h4>
              <p className="text-sm text-gray-600 mt-1">
                View platform activity and error logs
              </p>
            </div>
            <Button variant="outline" size="sm">
              View Logs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
