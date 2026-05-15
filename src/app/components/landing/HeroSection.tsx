import { motion } from "framer-motion";
import { Link } from "react-router";

const easeOut = [0.16, 1, 0.3, 1] as const;

const fadeInUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeOut } }
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-background pt-8 pb-32 md:pt-12 md:pb-48">
      {/* Background Textures */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] bg-gradient-to-b from-brand-blue/5 via-cyan-400/5 to-transparent blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none -z-10" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="flex flex-col items-center text-center mb-8 md:mb-10"
        >

          <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-5 max-w-4xl mx-auto">
            Simplify Your <span className="text-brand-blue">Learning</span><br className="hidden sm:block" />
            <span className="text-brand-blue">Journey Today</span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mb-6">
            Join thousands of learners and expert instructors on the most intelligent e-learning platform built for growth.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link 
              to="/login?mode=signup" 
              className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-xl bg-brand-blue px-8 font-semibold text-white shadow-lg shadow-brand-blue/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-blue/30 active:scale-[0.98]"
            >
              <span className="relative flex items-center gap-2 text-base">
                Get Started Free
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
            <Link 
              to="#how-it-works" 
              className="inline-flex h-14 items-center justify-center rounded-xl border border-border bg-white px-8 font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98]"
            >
              How It Works
            </Link>
          </motion.div>
        </motion.div>

        {/* Central Visual: Platform Mockup */}
        <div className="relative w-full max-w-5xl mx-auto hidden sm:block">
          {/* Ambient Glow behind visual */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-gradient-to-tr from-brand-blue/10 to-cyan-400/10 blur-3xl rounded-full" />
          
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: easeOut, delay: 0.2 }}
            className="relative z-10 w-full rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] border border-slate-200/60 bg-white"
          >
            {/* The Dashboard Image replaces the lady in the concept */}
            <img 
              src="/assets/hero-dashboard.png" 
              alt="Platform Dashboard" 
              className="w-full h-auto object-cover" 
            />

            {/* Play Button Overlay (Optional, matching concept style) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center pl-1 shadow-2xl">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-brand-blue shadow-inner">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Floating AI Assistant Card - Positioned relative to central visual */}
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-4 md:-right-12 top-1/4 z-20 w-64 bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-100 rounded-2xl p-4 hidden sm:block"
          >
            <div className="flex gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue to-cyan-400 flex items-center justify-center shrink-0 shadow-md">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">AI Study Assistant</div>
                <div className="text-[10px] text-brand-blue font-semibold">Suggested answer ready</div>
              </div>
            </div>
            <div className="pl-11 pr-2">
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                "Based on your recent quiz, I suggest reviewing the <strong className="text-brand-blue font-semibold">React Hooks</strong> module. Let's break it down step-by-step."
              </p>
            </div>
          </motion.div>

          {/* Floating Notification */}
          <motion.div
            animate={{ y: [8, -8, 8] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -left-4 md:-left-16 bottom-1/4 z-20 bg-white shadow-2xl border border-slate-100 rounded-3xl p-5 hidden sm:flex items-center gap-4 max-w-xs"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Tutor joined session</p>
              <p className="text-xs text-slate-500">Dr. Sarah is ready to help</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
