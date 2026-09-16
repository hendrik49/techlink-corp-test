import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Upload,
  Send,
  ShieldCheck,
  GraduationCap,
  Heart,
  Landmark,
  Baby,
  Palmtree,
  TrendingUp,
  Users,
  Laptop,
} from 'lucide-react'

const positions = [
  {
    id: 'senior-backend',
    title: 'Senior Backend Engineer',
    department: 'Engineering',
    location: 'Remote — Worldwide',
    type: 'Full-time',
    salary: '$140,000 – $185,000 + bonus',
    whyRoleExists:
      'As TechLink scales post-Series A, our product domains are growing in complexity and each one needs a dedicated owner — someone who makes the architecture calls, not just implements features. Backend reliability and shipping cadence are becoming critical differentiators for our enterprise clients, and we need senior engineers who treat both as first-class priorities.',
    summary:
      'Take end-to-end ownership of a core product domain in our platform. You\'ll be the technical authority for your area: making architecture calls, shipping features in tight cycles, and keeping your systems reliable in production. This is a hands-on Senior IC role — you\'ll start by shipping and improving systems directly, with scope expanding as you ramp.',
    success: {
      sixMonth: [
        'Own a product domain end-to-end and be the go-to person for its architecture and reliability.',
        'Ship multiple features in 2–3 day cycles with consistent quality.',
        'Become a trusted partner to product and data teams for your domain.',
      ],
      twelveMonth: [
        'Have materially improved the reliability and scalability of your domain.',
        'Contribute to cross-domain architecture decisions and raise the engineering bar.',
        'Mentor other engineers and shape how new product surfaces are built and deployed.',
      ],
    },
    whatYouDo: [
      'Own a product domain end-to-end — architecture decisions, feature delivery, reliability, and operational health.',
      'Ship features in 2–3 day cycles — break down projects into small deliverables, write tech docs, and drive them to production.',
      'Design and build data validation and processing capabilities for high-throughput backend services.',
      'Lead technical discovery — implementation approach, testing strategy, rollout plan, risks — reviewed by peers before development starts.',
      'Own what you build through production — deployment, monitoring, and incident response.',
      'Contribute to architectural decisions that directly impact system scalability, cost efficiency, and long-term platform evolution.',
    ],
    thrive: [
      '5+ years of experience in software engineering and owning a product domain end-to-end.',
      'Strong backend fluency in Python, Java (Spring Boot), or Go — with solid PostgreSQL experience.',
      'Have owned a product domain before — not just implemented features, but made the architectural calls.',
      'Ship small and often — you\'re uncomfortable when PRs sit for days and treat "in production" as the only definition of done.',
      'DevOps mindset — you own your components from technical design to release, monitoring, and maintainability.',
      'Debug across layers — when something\'s wrong, you trace it end-to-end rather than pointing at someone else\'s service.',
    ],
    demonstratedAbility: [
      'Own systems end-to-end, from design through deployment and ongoing operation.',
      'Make sound technical decisions under real-world constraints — balancing speed, quality, and long-term maintainability.',
      'Work effectively in small teams and ambiguous, fast-moving environments.',
      'Debug complex production issues across layers and drive them to resolution.',
    ],
    niceToHave: [
      'Experience with event-driven architectures (Kafka, SQS, Pub/Sub).',
      'Familiarity with AWS (ECS, Lambda, Aurora) or GCP.',
      'Experience stabilizing or rewriting legacy systems incrementally.',
      'Series A/B startup experience.',
    ],
    tags: ['Python', 'Java', 'Go', 'PostgreSQL', 'Kafka', 'AWS', 'Redis', 'gRPC', 'Docker', 'Datadog'],
  },
  {
    id: 'senior-frontend',
    title: 'Senior Frontend Developer',
    department: 'Engineering',
    location: 'Remote — Worldwide',
    type: 'Full-time',
    salary: '$130,000 – $175,000 + bonus',
    whyRoleExists:
      'Our enterprise clients rely on complex data-dense dashboards and operational tools every day. As our platform scales, we need to elevate the frontend experience — faster interfaces, better developer tooling, and polished UIs that surface critical information clearly. This role exists to own that layer and make it exceptional.',
    summary:
      'Own the frontend experience for our enterprise clients. You\'ll build complex, data-dense interfaces that surface critical information clearly — working closely with backend engineers and product to ship polished features every week. This is a product-minded engineer role: you care about what the user sees as much as the code underneath.',
    success: {
      sixMonth: [
        'Ship meaningful improvements to internal dashboards and enterprise-facing tools.',
        'Establish frontend standards — testing, accessibility, component patterns — that the team adopts.',
        'Become a key partner to backend and product teams for UI decisions.',
      ],
      twelveMonth: [
        'Own the frontend architecture across multiple product surfaces.',
        'Have materially improved the developer experience for frontend workflows.',
        'Help shape how new products are designed, prototyped, and deployed.',
      ],
    },
    whatYouDo: [
      'Own the frontend architecture for one or more product surfaces — component design, state management, and performance.',
      'Build complex data-rich UIs — dashboards, analytics views, and operational tools used daily by enterprise teams.',
      'Collaborate closely with backend engineers on API contracts, data shapes, and real-time data flows.',
      'Establish and maintain frontend standards — testing patterns, accessibility, design system components.',
      'Ship iteratively with tight feedback loops — from prototype to production in days, not weeks.',
    ],
    thrive: [
      '5+ years of frontend engineering experience, with 2+ years in a senior or lead role.',
      'Expert-level React and TypeScript — you think in components and know when to reach for context, reducers, or external state.',
      'Experience building data-dense interfaces for B2B SaaS or enterprise platforms.',
      'Strong opinions on code quality, testing, and accessibility — loosely held when the team finds a better way.',
      'Comfortable navigating backend codebases when you need to understand the full picture.',
      'Write clear technical documents that other engineers actually use.',
    ],
    demonstratedAbility: [
      'Own product surfaces end-to-end, from design through deployment and iteration.',
      'Make sound technical decisions under real-world constraints — balancing polish, speed, and long-term maintainability.',
      'Work effectively across disciplines — design, backend, and product — to ship cohesive features.',
      'Improve engineering workflows, tooling, and overall developer experience.',
    ],
    niceToHave: [
      'Experience with Next.js or similar SSR/SSG frameworks.',
      'Familiarity with charting libraries (D3, Recharts) or data visualization.',
      'Design system experience — building and maintaining a shared component library.',
      'Experience with Storybook, Playwright, or Cypress.',
    ],
    tags: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'GraphQL', 'Storybook', 'Playwright', 'Figma', 'Vite', 'Webpack'],
  },
  {
    id: 'devops-cloud',
    title: 'DevOps & Cloud Infrastructure Engineer',
    department: 'Infrastructure',
    location: 'Remote — Worldwide',
    type: 'Full-time',
    salary: '$140,000 – $185,000 + bonus',
    whyRoleExists:
      'As TechLink grows, our engineering systems are becoming more central to product delivery and client reliability. We are a small, senior engineering team where backend capabilities are strong, but we need to elevate our infrastructure posture, deployment reliability, observability, and developer experience as the platform scales. This role exists to proactively strengthen those foundations rather than reacting to scale challenges later.',
    summary:
      'Own the reliability and scalability of our cloud infrastructure. You\'ll build the deployment pipelines, monitoring systems, and IaC foundations that let our engineering teams ship with confidence every day. This is a hands-on role with meaningful autonomy — you\'ll shape how we deploy, monitor, and evolve our systems.',
    success: {
      sixMonth: [
        'Improve observability, monitoring, and deployment reliability across the platform.',
        'Ship meaningful improvements to CI/CD and developer workflows.',
        'Become a key partner to backend and data engineering teams for system reliability.',
      ],
      twelveMonth: [
        'Have materially improved our DevOps posture and infrastructure consistency.',
        'Be the go-to person for infrastructure and architecture decisions.',
        'Help shape how new products are deployed and supported in production.',
        'Raise the engineering standard across infra, tooling, and cost efficiency.',
      ],
    },
    whatYouDo: [
      'Design, build, and maintain production infrastructure on AWS — ECS, Lambda, Aurora, SQS, and more.',
      'Own CI/CD pipelines end-to-end — from pull request to production, with automated testing and rollback.',
      'Build and improve observability — structured logging, distributed tracing, alerting, and runbooks.',
      'Manage infrastructure as code with Terraform — review, plan, and apply changes safely across environments.',
      'Respond to and lead incident resolution — root-cause analysis, remediation, and post-mortems.',
      'Contribute to architectural decisions that directly impact system reliability, cost efficiency, and platform evolution.',
    ],
    thrive: [
      '4+ years of experience in DevOps, SRE, or cloud infrastructure roles.',
      'Deep AWS expertise — you\'ve operated production workloads on ECS, Lambda, RDS/Aurora, and S3.',
      'Fluent in Terraform — you write modular, reusable infrastructure code and review others\' IaC.',
      'Strong with Docker, container orchestration, and networking fundamentals.',
      'Production-first mindset — you care about uptime SLAs, deployment safety, and cost efficiency.',
      'Clear communicator — you write runbooks, post-mortems, and architecture docs that the team trusts.',
    ],
    demonstratedAbility: [
      'Own systems end-to-end, from design through deployment and ongoing operation.',
      'Make sound technical decisions under real-world constraints — balancing reliability, cost, and speed.',
      'Improve engineering workflows, deployment processes, and overall system reliability.',
      'Identify and proactively address infrastructure or operational bottlenecks before they become critical.',
    ],
    niceToHave: [
      'Kubernetes experience (EKS or self-managed).',
      'Experience with multi-account AWS organizations and landing zones.',
      'Familiarity with security tooling — Vault, AWS IAM best practices, SOC 2 compliance.',
      'Background in platform engineering or internal developer tooling.',
    ],
    tags: ['AWS', 'Terraform', 'Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Prometheus', 'Grafana', 'GitHub Actions', 'Vault'],
  },
  {
    id: 'people-talent',
    title: 'People & Talent Lead',
    department: 'People',
    location: 'Remote — Worldwide',
    type: 'Full-time',
    salary: '$110,000 – $140,000 + bonus',
    whyRoleExists:
      'TechLink is scaling from 40 to 80+ people over the next 18 months. Our founders have been handling recruiting and people operations alongside their engineering work, and we need a dedicated owner for the entire talent lifecycle — someone who can build the recruiting engine, shape the culture as we grow, and make TechLink a place senior engineers actively choose over big-tech offers.',
    summary:
      'Own the full talent lifecycle at TechLink — from sourcing and recruiting senior engineers globally, to onboarding, culture, and retention. You\'ll be the first dedicated People hire, reporting directly to the CEO, with real authority to shape how we build and support the team.',
    success: {
      sixMonth: [
        'Own the recruiting pipeline end-to-end and fill 3–5 senior engineering roles.',
        'Build and ship an onboarding program that gets new hires productive in their first two weeks.',
        'Establish core People processes — performance cadence, compensation bands, and employee handbook.',
      ],
      twelveMonth: [
        'Have built a repeatable recruiting engine that consistently attracts top-tier senior talent globally.',
        'Be the trusted advisor to leadership on team health, retention, and organizational design.',
        'Shape the culture and employer brand as TechLink scales past 60 people.',
      ],
    },
    whatYouDo: [
      'Own end-to-end recruiting for engineering and non-engineering roles — sourcing, screening, interviewing, closing.',
      'Build and manage the full onboarding experience — from offer letter to productive contributor.',
      'Develop compensation philosophy and maintain competitive salary bands across global markets.',
      'Create and run performance review cycles, growth frameworks, and feedback culture.',
      'Partner with leadership on organizational design, headcount planning, and team structure.',
      'Champion employee experience — offsites, remote culture, engagement, and retention.',
    ],
    thrive: [
      '4+ years of experience in talent/people roles at high-growth tech startups (Series A–C).',
      'Proven track record sourcing and closing senior engineers in competitive markets.',
      'Experience building People processes from scratch — not just inheriting them.',
      'Strong sense for culture — you know how to preserve what works while scaling.',
      'Comfortable operating with ambiguity and wearing multiple hats.',
      'Excellent written and verbal communication — you represent the company to every candidate.',
    ],
    demonstratedAbility: [
      'Build recruiting pipelines that consistently fill senior technical roles within 6 weeks.',
      'Design People processes that scale with the company, not against it.',
      'Work autonomously and make sound judgment calls on sensitive situations.',
      'Earn trust across engineering, product, and leadership as the go-to person for all things people.',
    ],
    niceToHave: [
      'Experience with distributed/remote-first companies across multiple time zones.',
      'Background in employer branding or talent marketing.',
      'Familiarity with immigration and global employment (EOR, contractors, visas).',
      'Prior experience at a company during a 2–3x headcount growth phase.',
    ],
    tags: ['Lever', 'LinkedIn Recruiter', 'Notion', 'BambooHR', 'Slack', 'Google Workspace', 'Deel', 'Lattice'],
  },
  {
    id: 'design-lead',
    title: 'Design Lead (Product Design)',
    department: 'Design',
    location: 'Remote — Worldwide',
    type: 'Full-time',
    salary: '$120,000 – $155,000 + bonus',
    whyRoleExists:
      'TechLink builds complex enterprise tools — dashboards, analytics surfaces, and operational platforms — that real users rely on every day. Until now, design decisions have been made by engineers and product together, but as we scale our platform and client base, we need a dedicated design owner who can bring craft, consistency, and user empathy to every surface we ship.',
    summary:
      'Own product design across TechLink\'s internal tools and client-facing platforms. You\'ll be the first dedicated design hire — defining the visual language, building the design system, and working hand-in-hand with engineering to turn complex data and workflows into interfaces that feel simple and trustworthy.',
    success: {
      sixMonth: [
        'Audit existing product surfaces and ship meaningful UX improvements to at least two dashboards or tools.',
        'Establish a foundational design system — component library, typography, color, spacing — that engineering adopts.',
        'Build a collaborative design-to-engineering handoff process that eliminates back-and-forth.',
      ],
      twelveMonth: [
        'Own the end-to-end design vision across all product surfaces.',
        'Have measurably improved usability and user satisfaction for enterprise-facing tools.',
        'Be a trusted creative partner to engineering and leadership, influencing what we build — not just how it looks.',
      ],
    },
    whatYouDo: [
      'Own product design end-to-end — research, wireframes, high-fidelity designs, prototypes, and QA of shipped work.',
      'Build and maintain a design system that scales across multiple product surfaces.',
      'Translate complex data-heavy workflows into clean, intuitive interfaces.',
      'Conduct user research and usability testing with enterprise clients to validate design decisions.',
      'Work directly with frontend engineers on implementation — review PRs, refine interactions, and sweat the details.',
      'Shape the visual identity of TechLink\'s products — ensuring consistency, accessibility, and craft.',
    ],
    thrive: [
      '5+ years of product design experience, with 2+ years designing data-dense B2B or enterprise interfaces.',
      'Expert-level Figma — you think in components, auto-layout, and design tokens.',
      'A strong portfolio showing complex information design — dashboards, tables, analytics views, multi-step flows.',
      'Deep understanding of accessibility standards (WCAG) and responsive design.',
      'Comfortable working closely with engineers — you understand CSS, component architecture, and front-end constraints.',
      'Strong opinions on craft, loosely held when the team finds a better way.',
    ],
    demonstratedAbility: [
      'Own design for a product surface end-to-end, from research through launch and iteration.',
      'Build design systems that engineering teams actually use and maintain.',
      'Communicate design rationale clearly to non-designers — in writing and in reviews.',
      'Work autonomously in fast-paced environments and make sound judgment calls on UX trade-offs.',
    ],
    niceToHave: [
      'Experience with data visualization design (charts, maps, real-time displays).',
      'Motion design skills — micro-interactions, transitions, and loading states.',
      'Basic frontend knowledge (HTML, CSS, React) to prototype or contribute small fixes.',
      'Experience as the first or early design hire at a startup.',
    ],
    tags: ['Figma', 'Design Systems', 'Prototyping', 'WCAG', 'User Research', 'Storybook', 'Framer', 'Notion'],
  },
  {
    id: 'client-success',
    title: 'Client Success Manager',
    department: 'Client Success',
    location: 'Remote — Worldwide',
    type: 'Full-time',
    salary: '$100,000 – $135,000 + bonus',
    whyRoleExists:
      'TechLink\'s enterprise clients invest heavily in our engineering services, and the quality of the relationship post-sale directly impacts retention, expansion, and referrals. As our client base grows, we need someone dedicated to making every engagement feel high-touch — owning the client experience from onboarding through renewal and making sure we deliver what we promised.',
    summary:
      'Own the post-sale client relationship for TechLink\'s enterprise accounts. You\'ll be the primary point of contact for our clients — managing onboarding, coordinating with engineering teams, tracking engagement health, driving renewals, and turning satisfied clients into long-term partners and advocates.',
    success: {
      sixMonth: [
        'Own the full client relationship for 8–12 enterprise accounts.',
        'Build and ship a structured onboarding playbook that reduces time-to-value for new clients.',
        'Establish a health-scoring system to proactively identify at-risk accounts before escalation.',
      ],
      twelveMonth: [
        'Achieve 90%+ client retention rate across your portfolio.',
        'Drive expansion revenue — upsells, additional engagements, or team scaling — from existing accounts.',
        'Be the voice of the client internally, influencing product and engineering priorities based on real feedback.',
      ],
    },
    whatYouDo: [
      'Own the client lifecycle end-to-end — onboarding, regular check-ins, QBRs, renewals, and expansion.',
      'Serve as the primary point of contact between enterprise clients and TechLink\'s engineering teams.',
      'Monitor engagement health — track satisfaction, delivery milestones, and flag risks early.',
      'Build and run a structured onboarding process for new enterprise clients.',
      'Drive contract renewals and identify expansion opportunities within existing accounts.',
      'Translate client feedback into actionable insights for engineering and leadership.',
    ],
    thrive: [
      '3+ years of experience in client success, account management, or customer success at a B2B SaaS or services company.',
      'Experience managing enterprise accounts with $100K+ annual contract values.',
      'Strong relationship builder — clients trust you, engineers respect you, and leadership relies on you.',
      'Organized and process-driven — you build playbooks, track metrics, and never let things fall through the cracks.',
      'Comfortable with technical conversations — you don\'t need to write code, but you understand how software projects work.',
      'Excellent written and verbal communication, including executive-level presentations.',
    ],
    demonstratedAbility: [
      'Retain and grow a portfolio of enterprise accounts over multiple renewal cycles.',
      'Build repeatable client success processes that scale as the company grows.',
      'Navigate complex stakeholder environments — coordinating between clients, engineering, and leadership.',
      'Identify and resolve client escalations before they become churn risks.',
    ],
    niceToHave: [
      'Experience at a professional services or consulting company (not just SaaS).',
      'Familiarity with project management tools (Linear, Jira, Notion).',
      'Background in technical recruiting, staffing, or team augmentation services.',
      'Experience at Series A–C startups during high-growth phases.',
    ],
    tags: ['HubSpot', 'Salesforce', 'Notion', 'Slack', 'Google Workspace', 'Loom', 'Zoom', 'Linear'],
  },
]

const benefits = [
  {
    icon: Heart,
    title: 'Health & Dental',
    detail:
      '100% company-paid medical, dental, and vision for employees. 75% covered for dependents.',
  },
  {
    icon: Landmark,
    title: '401(k) Match',
    detail:
      'Up to 4% company match with immediate vesting. Your future, funded from day one.',
  },
  {
    icon: Baby,
    title: 'Parental Leave',
    detail:
      '16 weeks paid for primary caregivers, 10 weeks for secondary. Plus gradual return-to-work flexibility.',
  },
  {
    icon: Palmtree,
    title: '20+ PTO Days',
    detail:
      'Plus national holidays, your birthday off, and life-event leave for the moments that matter.',
  },
  {
    icon: GraduationCap,
    title: '$1,500 Learning Budget',
    detail:
      'Annual budget for conferences, courses, books, and certifications. We invest in your growth.',
  },
  {
    icon: Laptop,
    title: 'Remote-First + Stipend',
    detail:
      'Work from anywhere. $85/month internet & mobile reimbursement plus a $500 one-time home office setup.',
  },
  {
    icon: TrendingUp,
    title: 'Equity & Bonus',
    detail:
      'Stock options (subject to board approval) plus quarterly performance bonuses tied to team goals.',
  },
  {
    icon: Users,
    title: 'Team Offsites',
    detail:
      'Annual company offsite and quarterly team events. We cover flights, hotels, and meals.',
  },
]

const FORMSPREE_URL = 'https://formspree.io/f/meerqkze'

function JobCard({ job, isOpen, toggle, index, inView }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.1 + index * 0.08 }}
      className="border border-slate-200 bg-white"
    >
      <button
        onClick={toggle}
        className="w-full p-8 lg:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left group"
      >
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg text-slate-900 group-hover:text-accent transition-colors duration-300">
            {job.title}
          </h3>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-wide uppercase text-slate-500">
              <Briefcase size={12} strokeWidth={1.5} />
              {job.department}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-wide uppercase text-slate-500">
              <MapPin size={12} strokeWidth={1.5} />
              {job.location}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-wide uppercase text-slate-500">
              <Clock size={12} strokeWidth={1.5} />
              {job.type}
            </span>
            {job.salary && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-wide uppercase text-accent">
                <DollarSign size={12} strokeWidth={1.5} />
                {job.salary}
              </span>
            )}
          </div>
        </div>
        <ChevronDown
          size={18}
          className={`text-slate-500 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
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
            <div className="px-8 lg:px-10 pb-8 lg:pb-10 border-t border-slate-200">
              <p className="text-slate-700 text-sm leading-relaxed mt-6 mb-4 max-w-3xl">
                {job.summary}
              </p>

              {job.whyRoleExists && (
                <div className="mb-8 p-5 bg-surface rounded-lg border border-slate-100">
                  <h4 className="text-[11px] font-medium tracking-[0.2em] uppercase text-accent-muted mb-3">
                    Why this role exists
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {job.whyRoleExists}
                  </p>
                </div>
              )}

              {job.success && (
                <div className="mb-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-5 border border-slate-200 rounded-lg bg-white">
                    <h4 className="text-[11px] font-medium tracking-[0.2em] uppercase text-accent-muted mb-4">
                      Success at 6 months
                    </h4>
                    <ul className="space-y-3">
                      {job.success.sixMonth.map((item, i) => (
                        <li key={i} className="flex gap-3 text-slate-600 text-sm leading-relaxed">
                          <span className="mt-1.5 shrink-0 w-1 h-1 rounded-full bg-green-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-5 border border-slate-200 rounded-lg bg-white">
                    <h4 className="text-[11px] font-medium tracking-[0.2em] uppercase text-accent-muted mb-4">
                      Success at 12 months
                    </h4>
                    <ul className="space-y-3">
                      {job.success.twelveMonth.map((item, i) => (
                        <li key={i} className="flex gap-3 text-slate-600 text-sm leading-relaxed">
                          <span className="mt-1.5 shrink-0 w-1 h-1 rounded-full bg-accent" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div>
                  <h4 className="text-[11px] font-medium tracking-[0.2em] uppercase text-accent-muted mb-4">
                    What you&apos;ll do
                  </h4>
                  <ul className="space-y-3">
                    {job.whatYouDo.map((item, i) => (
                      <li key={i} className="flex gap-3 text-slate-600 text-sm leading-relaxed">
                        <span className="mt-1.5 shrink-0 w-1 h-1 rounded-full bg-accent-muted" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-[11px] font-medium tracking-[0.2em] uppercase text-accent-muted mb-4">
                    You&apos;ll thrive if you
                  </h4>
                  <ul className="space-y-3">
                    {job.thrive.map((item, i) => (
                      <li key={i} className="flex gap-3 text-slate-600 text-sm leading-relaxed">
                        <span className="mt-1.5 shrink-0 w-1 h-1 rounded-full bg-accent-muted" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {job.demonstratedAbility && (
                <div className="mt-8">
                  <h4 className="text-[11px] font-medium tracking-[0.2em] uppercase text-accent-muted mb-4">
                    You have demonstrated ability to
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {job.demonstratedAbility.map((item, i) => (
                      <li key={i} className="flex gap-3 text-slate-700 text-sm leading-relaxed font-medium">
                        <span className="mt-1.5 shrink-0 w-1 h-1 rounded-full bg-accent" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-8">
                <h4 className="text-[11px] font-medium tracking-[0.2em] uppercase text-accent-muted mb-4">
                  Nice to have
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {job.niceToHave.map((item, i) => (
                    <li key={i} className="flex gap-3 text-slate-600 text-sm leading-relaxed">
                      <span className="mt-1.5 shrink-0 w-1 h-1 rounded-full bg-accent-muted" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-slate-200">
                {job.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 text-[10px] font-medium tracking-wider uppercase text-slate-500 border border-slate-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function ApplicationForm({ inView }) {
  const [status, setStatus] = useState('idle')
  const [fileName, setFileName] = useState('')

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    setFileName(file ? file.name : '')
  }

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
        setFileName('')
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
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="mt-24"
    >
      <div className="max-w-3xl mb-12">
        <h3 className="font-display text-2xl sm:text-3xl text-slate-900 leading-[1.15]">
          Apply Now
        </h3>
        <p className="mt-4 text-slate-700 text-sm sm:text-base leading-relaxed">
          Interested in joining TechLink Corp.? Submit your application below.
          We review every application personally and respond within 5 business days.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-[11px] font-medium tracking-[0.15em] uppercase text-slate-500 mb-3">
              First Name <span className="text-accent-muted">*</span>
            </label>
            <input
              type="text"
              name="first_name"
              required
              placeholder="Jane"
              className="w-full px-0 py-3 bg-transparent border-0 border-b border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-accent/50 transition-colors text-sm"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium tracking-[0.15em] uppercase text-slate-500 mb-3">
              Last Name <span className="text-accent-muted">*</span>
            </label>
            <input
              type="text"
              name="last_name"
              required
              placeholder="Smith"
              className="w-full px-0 py-3 bg-transparent border-0 border-b border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-accent/50 transition-colors text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-[11px] font-medium tracking-[0.15em] uppercase text-slate-500 mb-3">
              Email <span className="text-accent-muted">*</span>
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="jane@example.com"
              className="w-full px-0 py-3 bg-transparent border-0 border-b border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-accent/50 transition-colors text-sm"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium tracking-[0.15em] uppercase text-slate-500 mb-3">
              Phone <span className="text-accent-muted">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              required
              placeholder="+1 (555) 000-0000"
              className="w-full px-0 py-3 bg-transparent border-0 border-b border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-accent/50 transition-colors text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-[11px] font-medium tracking-[0.15em] uppercase text-slate-500 mb-3">
              LinkedIn Profile <span className="text-accent-muted">*</span>
            </label>
            <input
              type="url"
              name="linkedin"
              required
              placeholder="https://linkedin.com/in/janesmith"
              className="w-full px-0 py-3 bg-transparent border-0 border-b border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-accent/50 transition-colors text-sm"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium tracking-[0.15em] uppercase text-slate-500 mb-3">
              Position <span className="text-accent-muted">*</span>
            </label>
            <select
              name="position"
              required
              className="w-full px-0 py-3 bg-transparent border-0 border-b border-slate-300 text-slate-600 focus:outline-none focus:border-accent/50 transition-colors text-sm appearance-none cursor-pointer"
            >
              <option value="" className="bg-white text-slate-500">Select a position</option>
              {positions.map((p) => (
                <option key={p.id} value={p.title} className="bg-white text-slate-900">
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-[11px] font-medium tracking-[0.15em] uppercase text-slate-500 mb-3">
              Salary Expectations <span className="text-accent-muted">*</span>
            </label>
            <input
              type="text"
              name="salary_expectations"
              required
              placeholder="e.g. $150,000 – $180,000 USD"
              className="w-full px-0 py-3 bg-transparent border-0 border-b border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-accent/50 transition-colors text-sm"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium tracking-[0.15em] uppercase text-slate-500 mb-3">
              Notice Period <span className="text-accent-muted">*</span>
            </label>
            <input
              type="text"
              name="notice_period"
              required
              placeholder="e.g. 2 weeks, Immediately"
              className="w-full px-0 py-3 bg-transparent border-0 border-b border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-accent/50 transition-colors text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium tracking-[0.15em] uppercase text-slate-500 mb-3">
            Upload CV <span className="text-accent-muted">*</span>
          </label>
          <label className="flex items-center justify-center gap-3 w-full py-6 border border-dashed border-slate-300 hover:border-accent/40 transition-colors duration-300 cursor-pointer group">
            <Upload size={18} strokeWidth={1.5} className="text-slate-500 group-hover:text-accent-muted transition-colors" />
            <span className="text-slate-500 text-sm group-hover:text-slate-700 transition-colors">
              {fileName || 'Drop your file or click to upload'}
            </span>
            <input
              type="file"
              name="cv"
              required
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        <div>
          <label className="block text-[11px] font-medium tracking-[0.15em] uppercase text-slate-500 mb-3">
            Cover Letter / Additional Notes
          </label>
          <textarea
            name="cover_letter"
            rows={4}
            placeholder="Tell us why you're interested in TechLink Corp. and what you'd bring to the team..."
            className="w-full px-0 py-3 bg-transparent border-0 border-b border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-accent/50 transition-colors text-sm resize-none"
          />
        </div>

        <div className="flex items-start gap-3 pt-2">
          <input
            type="checkbox"
            name="privacy_consent"
            required
            id="privacy-consent"
            className="mt-1 accent-accent"
          />
          <label htmlFor="privacy-consent" className="text-slate-600 text-xs leading-relaxed">
            By submitting this application, I confirm that I have read the{' '}
            <a href="#" className="text-accent hover:text-accent-light transition-colors">Privacy Policy</a>{' '}
            and agree that TechLink Corp. may store my personal details to process my job application. <span className="text-accent-muted">*</span>
          </label>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={status === 'sending'}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-accent text-white text-sm font-medium tracking-wide uppercase hover:bg-accent-light transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {status === 'sending' && 'Submitting...'}
            {status === 'success' && 'Application Sent'}
            {status === 'error' && 'Failed — Try Again'}
            {status === 'idle' && (
              <>
                Submit Application
                <Send
                  size={14}
                  className="group-hover:translate-x-0.5 transition-transform duration-300"
                />
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  )
}

export default function Careers() {
  const [openIndex, setOpenIndex] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="careers" className="relative py-28 lg:py-36 bg-surface">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mb-16"
        >
          <p className="text-[11px] font-medium tracking-[0.3em] uppercase text-accent-muted mb-6">
            Careers
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-slate-900 leading-[1.15]">
            Build What Matters.
            <br />
            Own What You Ship.
          </h2>
          <p className="mt-8 text-slate-700 text-base sm:text-lg leading-relaxed max-w-2xl">
            We&apos;re growing fast and looking for senior engineers who want to
            own entire product domains — not just write code, but make the
            architectural calls and be the person who knows how the whole thing
            works. Remote-first, globally distributed.
          </p>
        </motion.div>

        {/* Open Positions */}
        <div className="space-y-4">
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[11px] font-medium tracking-[0.2em] uppercase text-slate-500 mb-4"
          >
            {positions.length} Open Positions
          </motion.p>
          {positions.map((job, i) => (
            <JobCard
              key={job.id}
              job={job}
              index={i}
              isOpen={openIndex === i}
              toggle={() => setOpenIndex(openIndex === i ? -1 : i)}
              inView={inView}
            />
          ))}
        </div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-24"
        >
          <h3 className="font-display text-2xl sm:text-3xl text-slate-900 leading-[1.15] mb-4">
            Why TechLink Corp.
          </h3>
          <p className="text-slate-700 text-sm sm:text-base leading-relaxed max-w-2xl mb-12">
            We offer competitive base salaries, quarterly performance bonuses,
            and early-stage equity. Here&apos;s the full package you get when
            you join a Series&nbsp;A-funded engineering company that&apos;s still
            small enough for your work to matter.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200">
            {benefits.map((benefit, i) => {
              const Icon = benefit.icon
              return (
                <div key={i} className="bg-surface p-8 lg:p-10">
                  <Icon size={22} strokeWidth={1.5} className="text-accent-muted mb-5" />
                  <h4 className="text-slate-900 text-base font-semibold mb-2">{benefit.title}</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">{benefit.detail}</p>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Diversity statement */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-12 text-slate-500 text-xs leading-relaxed max-w-2xl"
        >
          TechLink Corp. is an equal opportunity employer. We provide equal
          employment opportunities to all employees and applicants and prohibit
          discrimination and harassment of any type without regard to race, color,
          religion, age, sex, national origin, disability status, genetics,
          protected veteran status, sexual orientation, gender identity or
          expression, or any other characteristic protected by applicable law.
          Our recruitment process is fair, objective, and based solely on the
          skills and qualifications required for each role.
        </motion.p>

        {/* ID Verification CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="mt-12 p-8 lg:p-10 bg-white border border-slate-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-6"
        >
          <ShieldCheck size={28} strokeWidth={1.5} className="text-accent shrink-0" />
          <div className="flex-1">
            <h4 className="text-slate-900 font-semibold mb-1">Identity Verification</h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              Already applied? Complete your ID verification as part of the hiring process.
              You&apos;ll need your ID card and a working camera.
            </p>
          </div>
          <Link
            to="/verify"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white text-sm font-medium tracking-wide uppercase hover:bg-accent-light transition-colors duration-300 shrink-0"
          >
            Verify Identity
          </Link>
        </motion.div>

        {/* Application Form */}
        <ApplicationForm inView={inView} />
      </div>
    </section>
  )
}
