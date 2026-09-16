import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-accent/[0.06] rounded-full blur-[160px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent-muted/[0.05] rounded-full blur-[140px]" />
      </div>

      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-[11px] sm:text-xs font-medium tracking-[0.3em] uppercase text-accent-muted mb-10"
        >
          Built to Scale. Built to Last.
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="font-display text-[2.75rem] sm:text-6xl md:text-7xl lg:text-[5.25rem] text-slate-900 leading-[1.1] tracking-tight"
        >
          We Build the Systems
          <br />
          That Power Your Business
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-8 text-base sm:text-lg text-slate-700 max-w-2xl mx-auto leading-relaxed"
        >
          TechLink Corp. delivers mission-critical backend systems, cloud
          infrastructure, and AI-powered platforms for organizations that
          demand reliability at scale.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5"
        >
          <a
            href="#contact"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-accent text-white text-sm font-medium tracking-wide uppercase hover:bg-accent-light transition-colors duration-300"
          >
            Start a Conversation
            <ArrowRight
              size={16}
              className="group-hover:translate-x-0.5 transition-transform duration-300"
            />
          </a>
          <a
            href="#services"
            className="inline-flex items-center gap-2 px-8 py-4 border border-slate-300 text-slate-700 text-sm font-medium tracking-wide uppercase hover:text-slate-900 hover:border-slate-400 transition-all duration-300"
          >
            Our Capabilities
          </a>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  )
}
