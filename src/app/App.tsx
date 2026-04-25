import { RouterProvider } from "react-router";
import { router } from "./routes";
import { ThemeProvider } from "./contexts/ThemeContext";
import { UserProfileProvider } from "./context/UserProfileContext";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <ThemeProvider>
      <UserProfileProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" />
      </UserProfileProvider>
    </ThemeProvider>
  );
}
