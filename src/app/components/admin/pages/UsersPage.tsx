import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";
import { MoreVertical, Eye, CheckCircle, Ban, Trash2, ShieldOff } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card } from "../ui/card";
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

interface User {
  id: string;
  name: string;
  email: string;
  role: string | null;
  status: string;
  lastActive: string;
  disabled: boolean;
}

type ActionType = "suspend" | "approve" | "disable" | "enable" | "delete";

const UserMenu = ({
  user,
  actionLoading,
  setConfirmAction,
}: {
  user: User;
  actionLoading: boolean;
  setConfirmAction: (action: {
    open: boolean;
    user: User;
    action: ActionType;
  }) => void;
}) => (
  <DropdownMenu
    modal={false}
    onOpenChange={(open) => console.log("Menu open state changed:", open)}
  >
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        disabled={actionLoading}
        onClick={() => console.log("Menu clicked for user:", user.name)}
      >
        <MoreVertical className="w-4 h-4 text-gray-600" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="end"
      className="bg-white text-gray-900 border border-gray-200 shadow-xl rounded-lg min-w-[180px] z-[9999]"
    >
      <DropdownMenuItem className="text-gray-700 hover:bg-gray-100 cursor-pointer">
        <Eye className="w-4 h-4 mr-2" />
        View Profile
      </DropdownMenuItem>

      {user.role === "Tutor" && user.status === "Disabled" && (
        <DropdownMenuItem
          className="text-gray-700 hover:bg-gray-100 cursor-pointer"
          onClick={() =>
            setConfirmAction({ open: true, user, action: "approve" })
          }
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Approve Tutor
        </DropdownMenuItem>
      )}

      <DropdownMenuSeparator className="bg-gray-200" />

      {user.disabled ? (
        <DropdownMenuItem
          className="cursor-pointer hover:bg-gray-100"
          onClick={() =>
            setConfirmAction({ open: true, user, action: "enable" })
          }
        >
          <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
          <span className="text-green-700">Enable Account</span>
        </DropdownMenuItem>
      ) : (
        <DropdownMenuItem
          className="cursor-pointer hover:bg-gray-100"
          onClick={() =>
            setConfirmAction({ open: true, user, action: "disable" })
          }
        >
          <ShieldOff className="w-4 h-4 mr-2 text-amber-600" />
          <span className="text-amber-700">Disable Account</span>
        </DropdownMenuItem>
      )}

      {!user.disabled && (
        <DropdownMenuItem
          className="text-red-600 hover:bg-red-50 cursor-pointer"
          onClick={() =>
            setConfirmAction({ open: true, user, action: "suspend" })
          }
        >
          <Ban className="w-4 h-4 mr-2" />
          Suspend User
        </DropdownMenuItem>
      )}

      <DropdownMenuSeparator className="bg-gray-200" />

      <DropdownMenuItem
        className="text-red-700 font-medium hover:bg-red-50 cursor-pointer"
        onClick={() => setConfirmAction({ open: true, user, action: "delete" })}
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Delete Account
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    open: boolean;
    user?: User;
    action?: ActionType;
  }>({ open: false });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    const { data, error } = await supabase.from("users").select("*");
    if (data) {
      setUsers(
        data.map((u: any) => ({
          id: u.id,
          name: u.full_name || "Unknown User",
          email: "Protected for privacy",
          role: u.role
            ? u.role.charAt(0).toUpperCase() + u.role.slice(1)
            : "Student",
          status: u.disabled ? "Disabled" : "Active",
          lastActive: new Date(u.created_at).toLocaleDateString(),
          disabled: !!u.disabled,
        }))
      );
    }
    setLoading(false);
  }

  const filteredUsers = users.filter((user) => {
    if (roleFilter !== "all" && user.role !== roleFilter) return false;
    if (statusFilter !== "all" && user.status !== statusFilter) return false;
    return true;
  });

  const handleConfirm = async () => {
    if (!confirmAction.user || !confirmAction.action) return;
    const { user, action } = confirmAction;
    setActionLoading(true);
    setConfirmAction({ open: false });

    try {
      if (action === "delete") {
        const { error } = await supabase
          .from("users")
          .delete()
          .eq("id", user.id);
        if (error) throw error;
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        showToast(`${user.name} has been deleted.`);
      } else if (action === "disable" || action === "enable") {
        const { error } = await supabase
          .from("users")
          .update({ disabled: action === "disable" })
          .eq("id", user.id);
        if (error) throw error;
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id
              ? {
                  ...u,
                  disabled: action === "disable",
                  status: action === "disable" ? "Disabled" : "Active",
                }
              : u
          )
        );
        showToast(
          action === "disable"
            ? `${user.name}'s account has been disabled.`
            : `${user.name}'s account has been re-enabled.`
        );
      } else if (action === "suspend") {
        showToast(`${user.name} has been suspended (local only).`);
      } else if (action === "approve") {
        showToast(`${user.name} has been approved as a tutor.`);
      }
    } catch (err: any) {
      console.error("Action error:", err);
      showToast(err.message || "Something went wrong.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const actionLabel = (action?: ActionType) => {
    switch (action) {
      case "delete":
        return "Delete User";
      case "disable":
        return "Disable Account";
      case "enable":
        return "Enable Account";
      case "suspend":
        return "Suspend User";
      case "approve":
        return "Approve Tutor";
      default:
        return "Confirm";
    }
  };

  const actionDescription = (action?: ActionType, name?: string) => {
    switch (action) {
      case "delete":
        return `This will permanently delete ${name}'s account and all their data. This cannot be undone.`;
      case "disable":
        return `${name}'s account will be disabled. They will not be able to log in until re-enabled.`;
      case "enable":
        return `Re-enable ${name}'s account so they can log in again.`;
      case "suspend":
        return `Are you sure you want to suspend ${name}? They will lose access to the platform.`;
      case "approve":
        return `Are you sure you want to approve ${name} as a tutor?`;
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
            toast.type === "error"
              ? "bg-red-600 text-white"
              : "bg-green-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="Student">Students</SelectItem>
            <SelectItem value="Tutor">Tutors</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Disabled">Disabled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table for desktop */}
      <div className="hidden md:block">
        <Card className="border-gray-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-400 py-8">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-400 py-8">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium text-gray-900">{user.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          user.role === "Tutor"
                            ? "border-purple-200 bg-purple-50 text-purple-700"
                            : "border-blue-200 bg-blue-50 text-blue-700"
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          user.status === "Active"
                            ? "bg-green-100 text-green-700 hover:bg-green-100"
                            : "bg-red-100 text-red-700 hover:bg-red-100"
                        }
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">{user.lastActive}</TableCell>
                    <TableCell>
                      <UserMenu
                        user={user}
                        actionLoading={actionLoading}
                        setConfirmAction={setConfirmAction}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Mobile cards */}
      <div className="space-y-4 md:hidden">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="p-4 border-gray-200 bg-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{user.name}</h3>
                <div className="flex gap-2 mt-3">
                  <Badge
                    variant="outline"
                    className={
                      user.role === "Tutor"
                        ? "border-purple-200 bg-purple-50 text-purple-700"
                        : "border-blue-200 bg-blue-50 text-blue-700"
                    }
                  >
                    {user.role}
                  </Badge>
                  <Badge
                    className={
                      user.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }
                  >
                    {user.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mt-2">Joined: {user.lastActive}</p>
              </div>
              <UserMenu
                user={user}
                actionLoading={actionLoading}
                setConfirmAction={setConfirmAction}
              />
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
            <AlertDialogTitle>{actionLabel(confirmAction.action)}</AlertDialogTitle>
            <AlertDialogDescription>
              {actionDescription(confirmAction.action, confirmAction.user?.name)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={
                confirmAction.action === "delete"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : confirmAction.action === "disable"
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : ""
              }
            >
              {actionLabel(confirmAction.action)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
