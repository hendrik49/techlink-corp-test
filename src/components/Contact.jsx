import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Send, Mail, Phone, MapPin } from 'lucide-react'

const contactInfo = [
  {
    icon: Mail,
    label: 'Email',
    value: 'welcome@techlink-corp.com',
    href: 'mailto:welcome@techlink-corp.com',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+1 (555) 234-5678',
    href: 'tel:+15552345678',
  },
  {
    icon: MapPin,
    label: 'Headquarters',
    value: '100 Innovation Drive, San Francisco, CA 94105',
    href: '#',
  },
]

const FORMSPREE_URL = 'https://formspree.io/f/meerqkze'

export default function Contact() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [status, setStatus] = useState('idle')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')

    const form = e.target
    const data = new FormData(form)

    try {
      const res = await fetch(FORMSPREE_URL, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      })

      if (res.ok) {
        setStatus('success')
        form.reset()
        setTimeout(() => setStatus('idle'), 4000)
      } else {
        setStatus('error')
        setTimeout(() => setStatus('idle'), 4000)
      }
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 4000)
    }
  }

  return (
    <section id="contact" className="relative py-28 lg:py-36">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mb-16"
        >
          <p className="text-[11px] font-medium tracking-[0.3em] uppercase text-accent-muted mb-6">
            Contact
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-slate-900 leading-[1.15]">
            Start a Conversation
          </h2>
          <p className="mt-8 text-slate-700 text-base sm:text-lg leading-relaxed max-w-2xl">
            Whether you need a distributed backend system, cloud migration,
            AI integration, or senior engineering talent - we&apos;d like to
            hear about your project.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="lg:col-span-3 space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-medium tracking-[0.15em] uppercase text-slate-500 mb-3">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Jane Smith"
                  className="w-full px-0 py-3 bg-transparent border-0 border-b border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-accent/50 transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium tracking-[0.15em] uppercase text-slate-500 mb-3">
                  Work Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="jane@company.com"
                  className="w-full px-0 py-3 bg-transparent border-0 border-b border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-accent/50 transition-colors text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-medium tracking-[0.15em] uppercase text-slate-500 mb-3">
                  Company
                </label>
                <input
                  type="text"
                  name="company"
                  placeholder="Acme Inc."
                  className="w-full px-0 py-3 bg-transparent border-0 border-b border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-accent/50 transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium tracking-[0.15em] uppercase text-slate-500 mb-3">
                  Project Type
                </label>
                <select name="project_type" className="w-full px-0 py-3 bg-transparent border-0 border-b border-slate-300 text-slate-600 focus:outline-none focus:border-accent/50 transition-colors text-sm appearance-none cursor-pointer">
                  <option value="" className="bg-white text-slate-400">
                    Select a service
                  </option>
                  <option value="backend" className="bg-white text-slate-900">
                    Backend & Distributed Systems
                  </option>
                  <option value="frontend" className="bg-white text-slate-900">
                    Frontend & Web Applications
                  </option>
                  <option value="cloud" className="bg-white text-slate-900">
                    Cloud Infrastructure & DevOps
                  </option>
                  <option value="ai" className="bg-white text-slate-900">
                    AI & ML Integration
                  </option>
                  <option value="data" className="bg-white text-slate-900">
                    API & Data Engineering
                  </option>
                  <option value="consulting" className="bg-white text-slate-900">
                    Consulting & Team Augmentation
                  </option>
                </select>
              </div>
            </div>

            <div>
                <label className="block text-[11px] font-medium tracking-[0.15em] uppercase text-slate-500 mb-3">
                Project Details
              </label>
              <textarea
                name="message"
                required
                rows={4}
                placeholder="Tell us about your goals, architecture, and timeline..."
                className="w-full px-0 py-3 bg-transparent border-0 border-b border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-accent/50 transition-colors text-sm resize-none"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={status === 'sending'}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-accent text-white text-sm font-medium tracking-wide uppercase hover:bg-accent-light transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === 'sending' && 'Sending...'}
                {status === 'success' && 'Sent Successfully'}
                {status === 'error' && 'Failed - Try Again'}
                {status === 'idle' && (
                  <>
                    Submit Inquiry
                    <Send
                      size={14}
                      className="group-hover:translate-x-0.5 transition-transform duration-300"
                    />
                  </>
                )}
              </button>
            </div>
          </motion.form>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-2 space-y-8"
          >
            {contactInfo.map((info) => {
              const Icon = info.icon
              return (
                <a
                  key={info.label}
                  href={info.href}
                  className="group flex items-start gap-4"
                >
                  <Icon
                    size={18}
                    strokeWidth={1.5}
                    className="text-accent-muted mt-0.5 shrink-0"
                  />
                  <div>
                    <p className="text-[11px] font-medium tracking-[0.15em] uppercase text-slate-500 mb-1">
                      {info.label}
                    </p>
                    <p className="text-slate-700 text-sm group-hover:text-slate-900 transition-colors duration-300">
                      {info.value}
                    </p>
                  </div>
                </a>
              )
            })}

            <div className="pt-8 border-t border-slate-200">
              <p className="text-[11px] font-medium tracking-[0.15em] uppercase text-slate-500 mb-2">
                Business Hours
              </p>
              <p className="text-slate-600 text-sm">
                Monday - Friday: 9:00 AM - 6:00 PM (PST)
              </p>
              <p className="text-slate-600 text-sm">
                Weekend: By appointment
              </p>
            </div>

            <div className="pt-8 border-t border-slate-200">
              <p className="text-[11px] font-medium tracking-[0.15em] uppercase text-slate-500 mb-2">
                Careers
              </p>
              <p className="text-slate-600 text-sm leading-relaxed">
                We&apos;re growing and hiring senior engineers across backend,
                frontend, and infrastructure. Remote-first, competitive
                compensation, and early-stage equity.
              </p>
              <a
                href="#careers"
                className="inline-flex items-center gap-2 mt-3 text-accent text-sm hover:text-accent-light transition-colors duration-300"
              >
                View open positions &rarr;
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
