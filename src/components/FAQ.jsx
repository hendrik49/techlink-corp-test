import { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

const faqs = [
  {
    question: 'What technologies does TechLink specialize in?',
    answer:
      'Our core backend expertise spans Python, Java (Spring Boot), Go, and Node.js. On the infrastructure side, we operate on AWS, GCP, and Azure, using Terraform, Docker, and Kubernetes. For data, we work across PostgreSQL, MongoDB, Redis, and event-driven systems like Kafka. Our AI/ML team integrates solutions using OpenAI APIs, LangChain, Vertex AI, and Hugging Face.',
  },
  {
    question: 'How does your development process work?',
    answer:
      'We follow agile methodology with two-week sprint cycles. Every engagement begins with a discovery phase to map requirements, existing architecture, and business constraints. Engineers own their services end-to-end. You get full visibility through sprint demos, shared dashboards, and async progress reports.',
  },
  {
    question: 'What industries do you serve?',
    answer:
      'We work across fintech, healthcare, insurance, SaaS, and e-commerce. Our projects range from underwriting platforms and geospatial analytics tools to patient data systems and real-time transaction processing engines.',
  },
  {
    question: 'What is the typical timeline for a project?',
    answer:
      'A focused internal tool typically takes 8-12 weeks. Larger platform builds range from 3 to 6 months. For infrastructure engagements, we show meaningful improvements to deployment reliability and observability within the first 6 weeks.',
  },
  {
    question: 'Can you integrate AI/ML capabilities into existing platforms?',
    answer:
      'Yes. We specialize in bringing AI from prototype to production - integrating LLM-based services for intelligent automation, building model inference APIs, creating data pipelines, and ensuring models are deployed reliably with proper monitoring and cost controls.',
  },
  {
    question: 'Do you offer ongoing maintenance and production support?',
    answer:
      'We offer flexible engagement models including dedicated SRE support, on-call rotations, and long-term maintenance partnerships covering bug fixes, security patches, performance optimization, and feature enhancements.',
  },
  {
    question: 'How do you handle pricing and engagement models?',
    answer:
      'Three models: fixed-price for well-scoped projects, time-and-materials for evolving work, and dedicated team staffing for long-term engagements. All include transparent weekly reporting.',
  },
  {
    question: 'Can your engineers embed into our existing team?',
    answer:
      'Yes - our engineers integrate directly into your Slack channels, standups, sprint ceremonies, and Git workflows. Our people come with 5+ years of production experience and a track record of owning systems under real-world constraints.',
  },
  {
    question: 'What is it like working at TechLink?',
    answer:
      'We\'re a 60-person team, Series A funded, with a flat hierarchy where your ideas ship. Engineers own entire product domains — you make the architecture calls and are the person who knows how the whole thing works. We ship in 2–3 day cycles, write tech docs before code, and treat "in production" as the only definition of done. Our founders Amy and Takeshi are deeply involved, and our culture values directness, craftsmanship, and impact over process.',
  },
  {
    question: 'Do you offer remote positions?',
    answer:
      'Yes. TechLink is fully remote and hires globally. We maintain flexible overlap hours for collaboration but otherwise trust you to manage your schedule across time zones. We bring the full team together for annual offsites, and each team has quarterly virtual or in-person events. Every new hire receives a $500 home office stipend.',
  },
]

function AccordionItem({ faq, isOpen, toggle, index }) {
  return (
    <div className={`border-b border-slate-200 ${index === 0 ? 'border-t' : ''}`}>
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between py-6 text-left group"
      >
        <span
          className={`text-[15px] font-medium transition-colors duration-300 pr-8 ${
            isOpen ? 'text-slate-900' : 'text-slate-700 group-hover:text-slate-900'
          }`}
        >
          {faq.question}
        </span>
        <span className="text-slate-500 shrink-0">
          {isOpen ? <Minus size={16} /> : <Plus size={16} />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-slate-600 leading-relaxed text-sm max-w-2xl">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="faq" className="relative py-28 lg:py-36 bg-surface">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <p className="text-[11px] font-medium tracking-[0.3em] uppercase text-accent-muted mb-6">
            Questions
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-slate-900 leading-[1.15]">
            Frequently Asked
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              faq={faq}
              index={i}
              isOpen={openIndex === i}
              toggle={() => setOpenIndex(openIndex === i ? -1 : i)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
