import { Link } from "react-router";
import { motion } from "framer-motion";
import { Logo } from "../ui/Logo";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/80 border-b border-border/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="bg-brand-blue/10 p-2 rounded-xl group-hover:bg-brand-blue/20 transition-colors">
            <Logo className="w-8 h-8 text-brand-blue" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-foreground">InHub</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#tutors" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">For Tutors</a>
          <a href="#stats" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Impact</a>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            to="/login" 
            className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Log In
          </Link>
          <Link 
            to="/login" 
            className="group relative inline-flex h-11 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-brand-blue to-brand-blue-light px-6 font-medium text-white shadow-md shadow-brand-blue/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-blue/30 active:scale-[0.98]"
          >
            <span className="relative flex items-center gap-2">
              Get Started
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
