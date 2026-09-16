import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function CtaBanner() {
  return (
    <section className="relative py-28 lg:py-36 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-accent/[0.06] rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-slate-900 leading-[1.15]">
            Ready to build systems
            <br />
            that stand the test of scale?
          </h2>
          <p className="mt-6 text-slate-600 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Most consultations lead to a detailed technical proposal within one
            week. No obligations, no sales pressure.
          </p>
          <div className="mt-10">
            <a
              href="#contact"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-accent text-white text-sm font-medium tracking-wide uppercase hover:bg-accent-light transition-colors duration-300"
            >
              Schedule a Consultation
              <ArrowRight
                size={16}
                className="group-hover:translate-x-0.5 transition-transform duration-300"
              />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
