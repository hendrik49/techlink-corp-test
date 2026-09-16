import { Link } from 'react-router-dom'

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Leadership', href: '#team' },
  { label: 'Careers', href: '#careers' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
]

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
          {/* Brand */}
          <div className="md:col-span-7">
            <div className="flex items-center gap-3 mb-6">
              <span className="font-display text-xl text-slate-900 tracking-wide">
                TechLink
              </span>
              <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-accent-muted">
                Corp
              </span>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed max-w-sm">
              Series&nbsp;A-funded enterprise software engineering for
              organizations that demand reliability, scalability, and technical
              depth. Headquartered in San Francisco.{' '}
              <a href="#careers" className="text-accent hover:text-accent-light transition-colors duration-300">
                We&apos;re hiring.
              </a>
            </p>
          </div>

          {/* Navigation */}
          <div className="md:col-span-5">
            <p className="text-[10px] font-medium tracking-[0.25em] uppercase text-slate-500 mb-5">
              Navigation
            </p>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-slate-600 text-sm hover:text-slate-900 transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  to="/verify"
                  className="text-accent text-sm hover:text-accent-light transition-colors duration-300"
                >
                  ID Verification
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-xs tracking-wide">
            &copy; {new Date().getFullYear()} TechLink Corp. All rights
            reserved.
          </p>
          <div className="flex items-center gap-8 text-xs text-slate-500 tracking-wide">
            <a href="#" className="hover:text-slate-600 transition-colors duration-300">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-slate-600 transition-colors duration-300">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
