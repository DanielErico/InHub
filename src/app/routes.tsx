import { createBrowserRouter, redirect } from "react-router";
import AuthPage from "./components/auth/AuthPage";
import Layout from "./components/layout/Layout";
import DashboardPage from "./components/dashboard/DashboardPage";
import CoursesPage from "./components/courses/CoursesPage";
import CoursePlayerPage from "./components/courses/CoursePlayerPage";
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

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AuthPage,
  },
  {
    path: "/app",
    Component: Layout,
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
        path: "course/:id",
        Component: CoursePlayerPage,
      },
      {
        path: "assignments",
        Component: AssignmentsPage,
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
    ],
  },
]);
