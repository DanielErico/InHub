import { Link } from "react-router";
import { Logo } from "../ui/Logo";

export function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-border py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
          
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6 inline-flex">
              <div className="bg-brand-blue/10 p-2 rounded-xl">
                <Logo className="w-6 h-6 text-brand-blue" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">InHub</span>
            </Link>
            <p className="text-muted-foreground max-w-sm mb-6">
              The intelligent learning platform designed for interns and expert tutors. Powered by InternConnect.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Platform</h4>
            <ul className="space-y-3">
              <li><a href="#features" className="text-sm text-muted-foreground hover:text-brand-blue transition-colors">Features</a></li>
              <li><Link to="/login" className="text-sm text-muted-foreground hover:text-brand-blue transition-colors">For Tutors</Link></li>
              <li><Link to="/login" className="text-sm text-muted-foreground hover:text-brand-blue transition-colors">For Students</Link></li>
              <li><Link to="/tutor-agreement" className="text-sm text-muted-foreground hover:text-brand-blue transition-colors">Tutor Agreement</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-brand-blue transition-colors">About Us</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-brand-blue transition-colors">Contact</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-brand-blue transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-brand-blue transition-colors">Terms of Service</a></li>
            </ul>
          </div>

        </div>
        
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} InternConnect. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {/* Social Icons Placeholders */}
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <span className="sr-only">Twitter</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <span className="sr-only">LinkedIn</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
