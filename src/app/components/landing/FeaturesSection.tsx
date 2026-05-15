import { motion } from "framer-motion";

const features = [
  {
    title: "AI-Powered Study Assistant",
    description: "Get instant, intelligent help with lessons, complex topics, and assignments right when you need it.",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  {
    title: "Live Expert Sessions",
    description: "Connect with industry professionals for real-time guidance, feedback, and interactive learning.",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    title: "Progress Tracking",
    description: "Monitor your growth with detailed analytics, milestone tracking, and performance insights.",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  }
];

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
};

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 md:py-32 bg-slate-50 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-16 items-center">
          {/* Left: Content */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-3 rounded-full border border-brand-blue/30 bg-brand-blue/5 px-4 py-1.5 mb-6">
              <span className="h-2 w-2 rounded-full bg-brand-blue"></span>
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-brand-blue font-semibold">
                Platform Capabilities
              </span>
            </motion.div>
            
            <motion.h2 variants={fadeInUp} className="font-bold text-4xl md:text-5xl text-foreground mb-6">
              Everything you need to <br className="hidden md:block"/>
              <span className="bg-gradient-to-r from-brand-blue to-brand-blue-light bg-clip-text text-transparent">excel.</span>
            </motion.h2>
            
            <motion.p variants={fadeInUp} className="text-lg text-muted-foreground mb-12 max-w-xl">
              We've stripped away the clutter to focus on what actually drives learning: intelligent assistance, expert guidance, and clear progression.
            </motion.p>

            <div className="space-y-8">
              {features.map((feature, i) => (
                <motion.div key={i} variants={fadeInUp} className="flex gap-5 group">
                  <div className="flex-shrink-0 mt-1 w-12 h-12 rounded-xl bg-gradient-to-br from-brand-blue to-brand-blue-light shadow-accent flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Visual */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            className="relative"
          >
            <div className="aspect-[4/5] w-full rounded-tl-[4rem] rounded-br-[4rem] rounded-tr-xl rounded-bl-xl bg-gradient-to-br from-brand-blue/10 via-brand-blue/5 to-transparent border border-brand-blue/20 overflow-hidden relative shadow-2xl p-8 flex flex-col items-center justify-center">
              
              {/* Decorative elements inside visual */}
              <motion.div 
                animate={{ y: [-15, 15, -15] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="w-full max-w-sm bg-card rounded-2xl shadow-xl border border-border p-6 mb-6 z-10"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-brand-blue/20 flex items-center justify-center">
                    <span className="text-brand-blue text-xs font-bold">AI</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">AI Study Assistant</div>
                    <div className="text-[11px] font-semibold text-brand-blue">Always on</div>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-[13px] text-muted-foreground leading-relaxed">
                    "I can always help you to better Understand your courses, just ask me and I'm always here to help"
                  </p>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [15, -15, 15] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="w-full max-w-sm bg-card rounded-2xl shadow-xl border border-border p-5 z-20 flex gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div className="flex-1 py-1">
                  <div className="text-sm font-bold text-foreground mb-1">Performance Spike</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your mock exam scores have improved by 24% this week!
                  </p>
                </div>
              </motion.div>
              
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-brand-blue/20 blur-[80px] rounded-full" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
