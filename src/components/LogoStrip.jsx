import { motion } from 'framer-motion'

const clients = [
  'Fortune 500 Fintech',
  'Global Healthcare Co.',
  'Series B SaaS',
  'Insurance Enterprise',
  'E-Commerce Platform',
  'Cloud Infrastructure',
]

export default function LogoStrip() {
  return (
    <section className="relative py-16 lg:py-20 border-y border-slate-200">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center text-[11px] font-medium tracking-[0.3em] uppercase text-slate-400 mb-10"
        >
          Trusted by teams building at scale
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12 items-center justify-items-center"
        >
          {clients.map((name) => (
            <div
              key={name}
              className="flex items-center justify-center h-10 px-4"
            >
              <span className="text-[13px] font-medium tracking-wide text-slate-400 whitespace-nowrap">
                {name}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
