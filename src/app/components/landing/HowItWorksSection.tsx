import { motion } from "framer-motion";

const steps = [
  {
    number: "1",
    title: "Create an Account",
    description: "Sign up and set up your student profile in seconds. Get access to a personalized learning dashboard tailored to your goals.",
    illustration: (
      <div className="relative h-40 w-full rounded-xl bg-white/10 border border-white/20 p-4 flex flex-col gap-3 mt-6 overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-2 w-24 bg-white/30 rounded" />
            <div className="h-2 w-16 bg-white/20 rounded" />
          </div>
        </div>
        <div className="space-y-2 mt-2">
          <div className="h-8 w-full bg-white/10 rounded-lg border border-white/10" />
          <div className="h-8 w-full bg-white/10 rounded-lg border border-white/10" />
        </div>
        
        {/* Decorative cursor */}
        <motion.div 
          animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="absolute bottom-4 right-4 text-white"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" fill="currentColor" fillOpacity="0.3"/>
          </svg>
        </motion.div>
      </div>
    )
  },
  {
    number: "2",
    title: "Enroll in Courses",
    description: "Browse through our extensive library of expert-led courses. Find the perfect match and enroll with a single click.",
    illustration: (
      <div className="relative h-40 w-full rounded-xl p-2 flex flex-col gap-3 mt-6">
        <motion.div 
          animate={{ y: [-5, 5, -5] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="bg-white/10 backdrop-blur-sm border border-white/20 p-3 rounded-xl shadow-lg"
        >
          <div className="h-16 w-full bg-white/20 rounded-lg mb-2" />
          <div className="h-2 w-3/4 bg-white/30 rounded mb-1" />
          <div className="h-2 w-1/2 bg-white/20 rounded" />
        </motion.div>
        
        <motion.div 
          animate={{ y: [5, -5, 5] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }}
          className="bg-white/10 backdrop-blur-sm border border-white/20 p-3 rounded-xl shadow-lg absolute -bottom-8 -right-4 w-[90%]"
        >
          <div className="h-16 w-full bg-white/20 rounded-lg mb-2" />
          <div className="h-2 w-3/4 bg-white/30 rounded" />
        </motion.div>
      </div>
    )
  },
  {
    number: "3",
    title: "Start Learning",
    description: "Access high-quality materials, interact with AI tutors, and track your progress as you master new skills.",
    illustration: (
      <div className="relative h-40 w-full rounded-xl bg-white/10 border border-white/20 p-4 flex flex-col gap-4 mt-6 overflow-hidden items-center justify-center">
        <motion.div 
          whileHover={{ scale: 1.1 }}
          className="w-16 h-16 bg-white text-brand-blue-light rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)] cursor-pointer"
        >
          <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </motion.div>
        
        <div className="w-full space-y-1">
          <div className="flex justify-between items-center text-white/70 text-[10px] font-mono">
            <span>01:24</span>
            <span>04:00</span>
          </div>
          <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: "0%" }}
              whileInView={{ width: "40%" }}
              transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
              className="h-full bg-white"
            />
          </div>
        </div>
      </div>
    )
  }
];

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-24 overflow-hidden bg-brand-blue-light text-white">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center px-4 py-1.5 mb-6 rounded-full bg-white/20 backdrop-blur-md border border-white/30">
            <span className="text-sm font-semibold tracking-wide uppercase text-white">
              How it works
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            3 Easy steps to start learning
          </h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Join thousands of students and transform your learning experience with our intuitive, AI-powered platform.
          </p>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="grid md:grid-cols-3 gap-6 lg:gap-8"
        >
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              variants={fadeUp}
              className="group relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-8 hover:bg-white-[0.15] transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.05)]"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold leading-tight w-2/3">
                  {step.title}
                </h3>
                <span className="text-3xl font-black text-white/30 group-hover:text-white/50 transition-colors">
                  {step.number}
                </span>
              </div>
              <p className="text-white/90 text-sm leading-relaxed min-h-[4rem]">
                {step.description}
              </p>
              
              {step.illustration}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
