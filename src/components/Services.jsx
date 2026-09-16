import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  Server,
  Globe,
  Cloud,
  Brain,
  Database,
  UsersRound,
} from 'lucide-react'

const services = [
  {
    icon: Server,
    title: 'Backend & Distributed Systems',
    description:
      'High-throughput backend services and microservices architectures. Event-driven pipelines, low-latency APIs, and end-to-end ownership from architecture through production support.',
    tags: ['Java', 'Python', 'Go', 'Node.js', 'Spring Boot', 'Kafka'],
  },
  {
    icon: Globe,
    title: 'Frontend & Web Applications',
    description:
      'Modern, responsive web applications with component-driven architectures. Customer-facing platforms, internal dashboards, and data-rich operational tools.',
    tags: ['React', 'TypeScript', 'Next.js', 'Angular', 'Tailwind CSS'],
  },
  {
    icon: Cloud,
    title: 'Cloud Infrastructure & DevOps',
    description:
      'Production-grade cloud infrastructure on AWS, GCP, and Azure. Infrastructure-as-code, containerized workloads, CI/CD pipelines, and comprehensive observability.',
    tags: ['AWS', 'Terraform', 'Kubernetes', 'Docker', 'ECS', 'Lambda'],
  },
  {
    icon: Brain,
    title: 'AI & ML Integration',
    description:
      'AI-powered capabilities integrated into existing platforms - LLM-based services, intelligent automation, model inference APIs, and production ML data pipelines.',
    tags: ['OpenAI', 'LangChain', 'Vertex AI', 'Hugging Face', 'Python'],
  },
  {
    icon: Database,
    title: 'API & Data Engineering',
    description:
      'RESTful and GraphQL APIs built for security, scalability, and throughput. Data persistence across SQL and NoSQL, event-driven architectures, and reliable data pipelines.',
    tags: ['PostgreSQL', 'MongoDB', 'GraphQL', 'Redis', 'Kafka', 'Pub/Sub'],
  },
  {
    icon: UsersRound,
    title: 'Consulting & Team Augmentation',
    description:
      'Strategic technology advisory and senior engineering talent embedded directly into your team. Architecture decisions, workflow improvements, and scalable development capacity.',
    tags: ['Architecture', 'Staff Aug', 'Code Review', 'SRE', 'Agile'],
  },
]

export default function Services() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="services" className="relative py-28 lg:py-36 bg-surface">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mb-16"
        >
          <p className="text-[11px] font-medium tracking-[0.3em] uppercase text-accent-muted mb-6">
            Capabilities
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-slate-900 leading-[1.15]">
            End-to-End Engineering
            <br />
            Services
          </h2>
          <p className="mt-8 text-slate-700 text-base sm:text-lg leading-relaxed max-w-2xl">
            Every engagement is backed by engineers who own their systems in
            production and make sound technical decisions under real-world
            constraints.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-200">
          {services.map((service, i) => {
            const Icon = service.icon
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.08 }}
                className="group bg-surface p-8 lg:p-10 flex flex-col"
              >
                <Icon
                  size={24}
                  strokeWidth={1.5}
                  className="text-accent-muted mb-6"
                />
                <h3 className="font-display text-lg text-slate-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed flex-1">
                  {service.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-slate-200">
                  {service.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 text-[10px] font-medium tracking-wider uppercase text-slate-500 border border-slate-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
