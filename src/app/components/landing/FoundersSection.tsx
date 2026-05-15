import { motion } from "framer-motion";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
};

export function FoundersSection() {
  return (
    <section className="py-24 bg-background overflow-hidden relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 rounded-full border border-brand-blue/30 bg-brand-blue/5 px-4 py-1.5 mb-6">
            <span className="h-2 w-2 rounded-full bg-brand-blue"></span>
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-brand-blue font-semibold">
              The Visionaries
            </span>
          </div>
          <h2 className="font-bold text-4xl md:text-5xl text-foreground">
            Meet the Founders
          </h2>
        </motion.div>

        {/* Founders Grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto"
        >

          {/* Founder 1 */}
          <motion.div variants={fadeInUp} className="group relative">
            <div className="aspect-square w-full rounded-3xl overflow-hidden bg-muted mb-6 relative border border-border">
              <img src="/assets/daniel_adeyemo.jpg" alt="Daniel Adeyemo" className="absolute inset-0 w-full h-full object-cover bg-slate-100" />

              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            <div className="text-center">
              <h3 className="font-bold text-2xl text-foreground mb-1">Daniel Adeyemo</h3>
              <p className="text-brand-blue font-medium text-sm mb-3">Co-Founder & CEO</p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Nigerian tech entrepreneur, UI/UX designer, and the CEO and Co-Founder of Intern Connect. Also the co-founder of DANDEM Digitals, a digital solutions agency focused on brand strategy and modern product design.
              </p>
            </div>
          </motion.div>

          {/* Founder 2 */}
          <motion.div variants={fadeInUp} className="group relative">
            <div className="aspect-square w-full rounded-3xl overflow-hidden bg-muted mb-6 relative border border-border">
              <img src="/assets/founder_2.png" alt="Oluwademilade Adebiyi" className="absolute inset-0 w-full h-full object-cover bg-slate-100" />

              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            <div className="text-center">
              <h3 className="font-bold text-2xl text-foreground mb-1">Oluwademilade Adebiyi</h3>
              <p className="text-brand-blue font-medium text-sm mb-3">Co-Founder & CTO</p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Oluwademilade Adebiyi is the Co-Founder of both Intern Connect and DANDEM Digitals, a Full-Stack developer and a Tech entrepreneur.
              </p>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
