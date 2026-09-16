import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const stats = [
  { label: 'Projects Delivered', value: 200, suffix: '+' },
  { label: 'Enterprise Clients', value: 90, suffix: '+' },
  { label: 'Engineers on Staff', value: 60, suffix: '+' },
  { label: 'Series A Raised', value: 8, suffix: 'M', prefix: '$' },
]

const pillars = [
  {
    title: 'Our Mission',
    text: 'Enterprises lose millions every year to unreliable systems, failed migrations, and teams that can\'t ship. We exist to fix that. Founded by Amy Wang and Takeshi Morita in 2018, TechLink helps organizations modernize legacy systems and ship production-grade software — without the overhead of building large in-house engineering teams from scratch.',
  },
  {
    title: 'Our Approach',
    text: 'Every engineer owns their domain end-to-end. We ship features in 2–3 day cycles: tech doc first, peer review, then straight to production. No long-running branches, no handoffs. Our culture is built on observability, tight feedback loops, and pragmatic trade-offs between speed, quality, and long-term maintainability.',
  },
  {
    title: 'Why TechLink',
    text: 'Series A funded ($8M led by Ridgeline Ventures and Compound Capital), profitable, and growing. CTO Samira Patel and a cross-functional team of 60+ engineers spanning backend, frontend, DevOps, SRE, and AI/ML — ready to integrate into your workflows and ship from day one. Deep expertise across Python, Java, Go, and Node.js with battle-tested infrastructure on AWS and GCP.',
  },
]

function AnimatedCounter({ value, suffix, prefix, inView }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 2000
    const increment = value / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [inView, value])

  return (
    <span>
      {prefix}
      {count}
      {suffix}
    </span>
  )
}

export default function About() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="about" className="relative py-28 lg:py-36">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <p className="text-[11px] font-medium tracking-[0.3em] uppercase text-accent-muted mb-6">
            About the Company
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-slate-900 leading-[1.15]">
            Founded in 2018.
            <br />
            Series&nbsp;A Funded.
          </h2>
          <p className="mt-8 text-slate-700 text-base sm:text-lg leading-relaxed max-w-2xl">
            Headquartered in San Francisco with engineers across North America,
            TechLink Corp. raised $8M in Series&nbsp;A funding led by Ridgeline
            Ventures and Compound Capital. We build the backend systems, cloud
            infrastructure, and intelligent platforms that power enterprises in
            fintech, healthcare, insurance, SaaS, and e-commerce — and
            we&apos;re hiring the senior engineers who want to own what they ship.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 border border-slate-200"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white p-8 lg:p-10 text-center"
            >
              <div className="font-display text-4xl lg:text-5xl text-slate-900">
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  prefix={stat.prefix}
                  inView={inView}
                />
              </div>
              <p className="mt-3 text-[11px] font-medium tracking-[0.2em] uppercase text-slate-500">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Pillars */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-px bg-slate-200"
        >
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="bg-white p-8 lg:p-10"
            >
              <h3 className="font-display text-xl text-slate-900 mb-4">
                {pillar.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {pillar.text}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
