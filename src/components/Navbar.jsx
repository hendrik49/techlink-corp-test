import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Leadership', href: '#team' },
  { label: 'Careers', href: '#careers' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const handleClick = () => setMobileOpen(false)

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-lg border-b border-slate-200 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 lg:h-22">
          <a href="#" className="flex items-center gap-3">
            <span className="font-display text-xl text-slate-900 tracking-wide">
              TechLink
            </span>
            <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-accent-muted">
              Corp
            </span>
          </a>

          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[13px] font-medium tracking-wide text-slate-600 hover:text-slate-900 transition-colors duration-300 uppercase"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/verify"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium tracking-wide text-accent hover:text-accent-light transition-colors duration-300 uppercase"
            >
              <ShieldCheck size={14} strokeWidth={1.5} />
              Verify ID
            </Link>
            <a
              href="#contact"
              className="px-6 py-2.5 text-[13px] font-medium tracking-wide uppercase border border-accent/40 text-accent hover:bg-accent/5 hover:border-accent/60 transition-all duration-300"
            >
              Get in Touch
            </a>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-slate-700 p-2"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/98 backdrop-blur-lg border-t border-slate-200 overflow-hidden"
          >
            <div className="px-6 py-8 flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={handleClick}
                  className="text-sm font-medium tracking-wide text-slate-600 hover:text-slate-900 transition-colors py-3 uppercase"
                >
                  {link.label}
                </a>
              ))}
              <Link
                to="/verify"
                onClick={handleClick}
                className="inline-flex items-center gap-2 text-sm font-medium tracking-wide text-accent hover:text-accent-light transition-colors py-3 uppercase"
              >
                <ShieldCheck size={15} strokeWidth={1.5} />
                Verify ID
              </Link>
              <a
                href="#contact"
                onClick={handleClick}
                className="mt-4 px-6 py-3 border border-accent/40 text-accent text-sm font-medium tracking-wide text-center uppercase"
              >
                Get in Touch
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
