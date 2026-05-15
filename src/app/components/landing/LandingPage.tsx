import { useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { Navbar } from "./Navbar";
import { HeroSection } from "./HeroSection";
import { FeaturesSection } from "./FeaturesSection";
import { FoundersSection } from "./FoundersSection";
import { Footer } from "./Footer";

export default function LandingPage() {
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme("light");
  }, [setTheme]);

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-brand-blue/20 selection:text-brand-blue">
      <Navbar />
      
      <main>
        <HeroSection />
        <FeaturesSection />
        <FoundersSection />
      </main>

      <Footer />
    </div>
  );
}
