import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import LogoStrip from '../components/LogoStrip'
import About from '../components/About'
import Services from '../components/Services'
import CtaBanner from '../components/CtaBanner'
import Team from '../components/Team'
import Careers from '../components/Careers'
import FAQ from '../components/FAQ'
import Contact from '../components/Contact'
import Footer from '../components/Footer'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <LogoStrip />
      <About />
      <Services />
      <CtaBanner />
      <Team />
      <Careers />
      <FAQ />
      <Contact />
      <Footer />
    </div>
  )
}
