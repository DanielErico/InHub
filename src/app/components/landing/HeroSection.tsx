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
    <section className="relative w-full overflow-hidden bg-background pt-20 pb-32 md:pt-28 md:pb-40 lg:pt-36">
      {/* Background Textures */}
      <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-gradient-to-bl from-brand-blue/10 via-cyan-400/5 to-transparent blur-[100px] rounded-bl-full pointer-events-none -z-10" />
      <div className="absolute top-40 left-0 w-[500px] h-[500px] bg-brand-blue/5 blur-[120px] rounded-r-full pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-12 lg:gap-16 items-center">

          {/* Left Column: Text */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="flex flex-col items-start"
          >
            {/* Section Badge */}
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 rounded-full border border-brand-blue/20 bg-brand-blue/5 px-3 py-1 mb-6 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-blue"></span>
              </span>
              <span className="text-[11px] uppercase tracking-wider text-brand-blue font-bold">
                InHub Platform 2.0
              </span>
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl lg:text-[4.5rem] font-extrabold tracking-tight text-slate-900 leading-[1.05] mb-6">
              Learn smarter. <br />
              Teach better. <br />
              <span className="bg-gradient-to-r from-brand-blue to-[#00b4d8] bg-clip-text text-transparent">
                In one space.
              </span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-lg mb-10">
              Join thousands of learners and expert instructors on the most intelligent e-learning platform built for Learners.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-10">
              <Link
                to="/login?mode=signup"
                className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-brand-blue to-brand-blue-light px-8 font-semibold text-white shadow-lg shadow-brand-blue/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-blue/35 active:scale-[0.98]"
              >
                <span className="relative flex items-center gap-2 text-base">
                  Start Learning Free
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
              <Link
                to="/login"
                className="inline-flex h-14 items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-8 font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
              >
                Explore Courses
              </Link>
            </motion.div>


          </motion.div>

          {/* Right Column: Platform UI Mockup */}
          <div className="relative w-full max-w-lg mx-auto lg:ml-auto mt-12 lg:mt-0">
            {/* Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-gradient-to-tr from-brand-blue/20 to-cyan-400/20 blur-3xl rounded-full" />

            {/* Main Mockup Card Image */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="relative z-10 w-full rounded-2xl overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)] border border-slate-200/50"
            >
              <img src="/assets/hero-dashboard.png" alt="Platform Dashboard" className="w-full h-auto object-cover bg-white" />
            </motion.div>

            {/* Floating AI Assistant Card */}
            <motion.div
              animate={{ y: [-8, 8, -8] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-6 lg:-right-12 top-1/4 z-20 w-64 bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 rounded-2xl p-4"
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
              animate={{ y: [5, -5, 5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -left-4 lg:-left-10 bottom-1/4 z-20 bg-white shadow-xl border border-slate-100 rounded-full px-5 py-3 flex items-center gap-3"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-xs font-bold text-slate-700 tracking-wide">Tutor joined session</span>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
