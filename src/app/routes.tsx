import { createBrowserRouter, redirect } from "react-router";
import { supabase } from "../lib/supabase";
import AuthPage from "./components/auth/AuthPage";
import AuthCallbackPage from "./components/auth/AuthCallbackPage";
import Layout from "./components/layout/Layout";
import DashboardPage from "./components/dashboard/DashboardPage";
import CoursesPage from "./components/courses/CoursesPage";
import MyCoursesPage from "./components/courses/MyCoursesPage";
import CoursePlayerPage from "./components/courses/CoursePlayerPage";
import CourseDetailPage from "./components/courses/CourseDetailPage";
import AssignmentsPage from "./components/assignments/AssignmentsPage";
import SchedulePage from "./components/schedule/SchedulePage";
import SettingsPage from "./components/settings/SettingsPage";
import TutorLayout from "./components/tutor/TutorLayout";
import TutorDashboardPage from "./components/tutor/TutorDashboardPage";
import TutorContentPage from "./components/tutor/TutorContentPage";
import TutorStudentsPage from "./components/tutor/TutorStudentsPage";
import TutorSchedulePage from "./components/tutor/TutorSchedulePage";
import TutorSettingsPage from "./components/tutor/TutorSettingsPage";
import TutorAIToolsPage from "./components/tutor/TutorAIToolsPage";
import TutorCourseDetailsPage from "./components/tutor/TutorCourseDetailsPage";
import TutorAssignmentsPage from "./components/tutor/TutorAssignmentsPage";
import TutorAssignmentDetailPage from "./components/tutor/TutorAssignmentDetailPage";
import MessagesPage from "./components/messages/MessagesPage";

import { AdminLayout } from "./components/admin/AdminLayout";
import { DashboardPage as AdminDashboardPage } from "./components/admin/pages/DashboardPage";
import { UsersPage as AdminUsersPage } from "./components/admin/pages/UsersPage";
import { CoursesPage as AdminCoursesPage } from "./components/admin/pages/CoursesPage";
import { CourseReviewPage as AdminCourseReviewPage } from "./components/admin/pages/CourseReviewPage";
import { AssignmentsPage as AdminAssignmentsPage } from "./components/admin/pages/AssignmentsPage";
import { AIAnalyticsPage as AdminAIAnalyticsPage } from "./components/admin/pages/AIAnalyticsPage";
import { NotificationsPage as AdminNotificationsPage } from "./components/admin/pages/NotificationsPage";
import { SettingsPage as AdminSettingsPage } from "./components/admin/pages/SettingsPage";
import { SurveysPage as AdminSurveysPage } from "./components/admin/pages/SurveysPage";

// Authentication loader - checks if user is authenticated
async function authLoader() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return redirect("/");
    }

    return null;
  } catch (error) {
    console.error("Auth loader error:", error);
    return redirect("/");
  }
}

// Tutor-specific loader - checks if user has tutor role
async function tutorAuthLoader() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return redirect("/");
    }

    // Get user role
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return redirect("/");
    }

    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (userData?.role?.toLowerCase() !== "tutor") {
      return redirect("/app/dashboard");
    }

    return null;
  } catch (error) {
    console.error("Tutor auth loader error:", error);
    return redirect("/");
  }
}

// Admin-specific loader - checks if user has admin role
async function adminAuthLoader() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return redirect("/");
    }

    // Get user role
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return redirect("/");
    }

    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (userData?.role?.toLowerCase() !== "admin") {
      return redirect("/app/dashboard");
    }

    return null;
  } catch (error) {
    console.error("Admin auth loader error:", error);
    return redirect("/");
  }
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AuthPage,
  },
  {
    path: "/auth/callback",
    Component: AuthCallbackPage,
  },
  {
    path: "/app",
    Component: Layout,
    loader: authLoader,
    children: [
      {
        index: true,
        loader: () => redirect("/app/dashboard"),
      },
      {
        path: "dashboard",
        Component: DashboardPage,
      },
      {
        path: "courses",
        Component: CoursesPage,
      },
      {
        path: "my-courses",
        Component: MyCoursesPage,
      },
      {
        path: "course/:id",
        Component: CourseDetailPage,
      },
      {
        path: "course/:courseId/play",
        Component: CoursePlayerPage,
      },
      {
        path: "assignments",
        Component: AssignmentsPage,
      },
      {
        path: "messages",
        Component: MessagesPage,
      },
      {
        path: "schedule",
        Component: SchedulePage,
      },
      {
        path: "settings",
        Component: SettingsPage,
      },
    ],
  },
  {
    path: "/app/tutor",
    Component: TutorLayout,
    loader: tutorAuthLoader,
    children: [
      {
        index: true,
        loader: () => redirect("/app/tutor/dashboard"),
      },
      {
        path: "dashboard",
        Component: TutorDashboardPage,
      },
      {
        path: "content",
        Component: TutorContentPage,
      },
      {
        path: "content/:courseId",
        Component: TutorCourseDetailsPage,
      },
      {
        path: "students",
        Component: TutorStudentsPage,
      },
      {
        path: "schedule",
        Component: TutorSchedulePage,
      },
      {
        path: "settings",
        Component: TutorSettingsPage,
      },
      {
        path: "ai-tools",
        Component: TutorAIToolsPage,
      },
      {
        path: "assignments",
        Component: TutorAssignmentsPage,
      },
      {
        path: "assignments/:quizId",
        Component: TutorAssignmentDetailPage,
      },
      {
        path: "messages",
        Component: MessagesPage,
      },
    ],
  },
  {
    path: "/app/admin",
    Component: AdminLayout,
    loader: adminAuthLoader,
    children: [
      {
        index: true,
        Component: AdminDashboardPage,
      },
      {
        path: "users",
        Component: AdminUsersPage,
      },
      {
        path: "courses",
        Component: AdminCoursesPage,
      },
      {
        path: "courses/:courseId/review",
        Component: AdminCourseReviewPage,
      },
      {
        path: "assignments",
        Component: AdminAssignmentsPage,
      },
      {
        path: "ai-analytics",
        Component: AdminAIAnalyticsPage,
      },
      {
        path: "notifications",
        Component: AdminNotificationsPage,
      },
      {
        path: "surveys",
        Component: AdminSurveysPage,
      },
      {
        path: "settings",
        Component: AdminSettingsPage,
      },
    ],
  },
]);
