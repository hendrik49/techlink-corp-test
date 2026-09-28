import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'

const VerificationPage = lazy(() => import('./verification/VerificationPage'))
const SourcePortal = lazy(() => import('./pages/SourcePortal'))
const Searchtxt = lazy(() => import('./pages/Searchtxt'))
const ContactUs = lazy(() => import('./pages/ContactUs'))

function RouteFallback({ label }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-400 text-sm">{label}</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/search"
          element={
            <Suspense fallback={<RouteFallback label="Loading search..." />}>
              <Searchtxt />
            </Suspense>
          }
        />
        <Route
          path="/contact-us"
          element={
            <Suspense fallback={<RouteFallback label="Loading contact form..." />}>
              <ContactUs />
            </Suspense>
          }
        />
        <Route
          path="/verify"
          element={
            <Suspense fallback={<RouteFallback label="Loading verification..." />}>
              <VerificationPage />
            </Suspense>
          }
        />
        <Route
          path="/source"
          element={
            <Suspense fallback={<RouteFallback label="Loading source portal..." />}>
              <SourcePortal />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
