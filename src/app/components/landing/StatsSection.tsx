import { motion } from "framer-motion";

const stats = [
  {
    value: "500k+",
    label: "ACTIVE USERS",
    badge: "+12% this month",
  },
  {
    value: "99.99%",
    label: "UPTIME SLA",
    badge: "Enterprise grade",
  },
  {
    value: "24/7",
    label: "SUPPORT ACCESS",
    badge: "Global coverage",
  },
  {
    value: "$10M+",
    label: "CUSTOMER SAVINGS",
    badge: "Annual total",
  },
];

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

export function StatsSection() {
  return (
    <section id="stats" className="relative w-full py-24 bg-[#0b0f19] overflow-hidden">
      {/* Subtle Dot Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.04)_1px,_transparent_1px)] bg-[size:32px_32px]" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8"
        >
          {stats.map((stat, i) => (
            <motion.div key={i} variants={fadeInUp} className="flex flex-col items-center md:items-start">
              <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2">
                {stat.value}
              </h3>
              
              <p className="text-sm font-semibold text-slate-300 tracking-wider mb-4 border-l-2 border-brand-blue/50 pl-3">
                {stat.label}
              </p>
              
              <div className="inline-flex items-center gap-1.5 bg-brand-blue hover:bg-brand-blue-light transition-colors text-white text-xs font-semibold px-3 py-1.5 rounded-full mt-auto cursor-default">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                </svg>
                {stat.badge}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
