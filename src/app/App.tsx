import { RouterProvider } from "react-router";
import { router } from "./routes";
import { ThemeProvider } from "./contexts/ThemeContext";
import { UserProfileProvider } from "./context/UserProfileContext";

export default function App() {
  return (
    <ThemeProvider>
      <UserProfileProvider>
        <RouterProvider router={router} />
      </UserProfileProvider>
    </ThemeProvider>
  );
}
