import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const team = [
  {
    name: 'Amy Wang',
    role: 'Founder',
    bio: 'Serial entrepreneur with a vision for building technology that scales. Founded TechLink Corp. to bridge the gap between enterprise ambition and engineering execution.',
    initials: 'AW',
    image: '/team/amy-wang.jpg',
  },
  {
    name: 'Takeshi Morita',
    role: 'Chief Executive Officer',
    bio: '15+ years leading engineering organizations. Previously VP Engineering at a Series C fintech startup. Drives company strategy and client partnerships.',
    initials: 'TM',
    image: '/team/takeshi-morita.jpeg',
  },
  {
    name: 'Samira Patel',
    role: 'Chief Technology Officer',
    bio: 'Distributed systems architect with deep expertise in Python, Go, and cloud-native platforms. Former principal engineer at a top-tier cloud provider.',
    initials: 'SP',
    image: '/team/samira-patel.jpg',
  },
  {
    name: 'Marcus Chen',
    role: 'VP of Infrastructure',
    bio: 'Cloud and SRE specialist who has built and scaled infrastructure on AWS, GCP, and Azure. Expert in Kubernetes, Terraform, and CI/CD.',
    initials: 'MC',
    image: '/team/marcus-chen.jpg',
  },
  {
    name: 'Jordan Kim',
    role: 'Head of Design',
    bio: 'Led product design at two Y Combinator startups. Specializes in complex data-dense interfaces for underwriting and geospatial analytics.',
    initials: 'JK',
    image: '/team/jordan-kim.jpg',
  },
  {
    name: 'David Okafor',
    role: 'Head of AI Engineering',
    bio: 'ML engineer specializing in LLM integration, model inference APIs, and intelligent automation across healthcare and fintech domains.',
    initials: 'DO',
    image: '/team/david-okafor.jpg',
  },
  {
    name: 'Alex Dong',
    role: 'Head of Engineering Manager',
    bio: 'Experienced engineering leader who drives delivery across cross-functional teams. Focuses on process excellence, mentorship, and scaling engineering culture.',
    initials: 'AD',
    image: '/team/alex-dong.jpeg',
  },
  {
    name: 'Elena Vasquez',
    role: 'Principal Engineer',
    bio: 'Java, Spring Boot, and Python expert with 10+ years building high-throughput microservices. Leads backend architecture decisions across engagements.',
    initials: 'EV',
    image: '/team/elena-vasquez.png',
  },
]

function Avatar({ member }) {
  const [failed, setFailed] = useState(false)

  if (member.image && !failed) {
    return (
      <img
        src={member.image}
        alt={member.name}
        className="w-14 h-14 rounded object-cover bg-slate-200 mb-6"
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <div className="w-14 h-14 bg-slate-200 flex items-center justify-center text-slate-500 text-sm font-medium tracking-wide rounded mb-6">
      {member.initials}
    </div>
  )
}

export default function Team() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="team" className="relative py-28 lg:py-36">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mb-16"
        >
          <p className="text-[11px] font-medium tracking-[0.3em] uppercase text-accent-muted mb-6">
            Leadership
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-slate-900 leading-[1.15]">
            Senior Engineers Who Own
            <br />
            What They Build
          </h2>
          <p className="mt-8 text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl">
            Our leadership team brings decades of combined experience from
            top-tier tech companies, high-growth startups, and enterprise
            engineering organizations.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 border border-slate-200">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.08 }}
              className="bg-white p-8 lg:p-10"
            >
              <Avatar member={member} />
              <h3 className="text-base font-semibold text-slate-900">
                {member.name}
              </h3>
              <p className="text-[11px] font-medium tracking-[0.15em] uppercase text-accent-muted mt-1">
                {member.role}
              </p>
              <p className="text-slate-500 text-sm leading-relaxed mt-4">
                {member.bio}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
