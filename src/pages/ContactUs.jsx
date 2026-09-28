import { useState } from 'react'
import { Link } from 'react-router-dom'

const initialValues = { fullName: '', email: '', message: '' }

export default function ContactUs() {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setValues((currentValues) => ({ ...currentValues, [name]: value }))
    setErrors((currentErrors) => ({ ...currentErrors, [name]: '' }))
    setSubmitted(false)
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {}

    if (!values.fullName.trim()) nextErrors.fullName = 'Please enter your full name.'
    if (!values.email.trim()) {
      nextErrors.email = 'Please enter your email address.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      nextErrors.email = 'Please enter a valid email address.'
    }
    if (!values.message.trim()) nextErrors.message = 'Please enter a message.'

    setErrors(nextErrors)
    setSubmitted(Object.keys(nextErrors).length === 0)
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-800 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="text-sm font-medium text-accent hover:underline">
          TechLink
        </Link>
        <h1 className="mt-10 text-3xl font-semibold tracking-tight text-slate-900">Contact us</h1>
        <p className="mt-2 text-slate-600">Send us a message and we’ll be in touch.</p>

        <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              value={values.fullName}
              onChange={handleChange}
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby={errors.fullName ? 'fullName-error' : undefined}
              className="mt-2 w-full border border-slate-300 bg-white px-4 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
            {errors.fullName && <p id="fullName-error" className="mt-1 text-sm text-rose-700">{errors.fullName}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={handleChange}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className="mt-2 w-full border border-slate-300 bg-white px-4 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
            {errors.email && <p id="email-error" className="mt-1 text-sm text-rose-700">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-slate-700">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows="5"
              value={values.message}
              onChange={handleChange}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={errors.message ? 'message-error' : undefined}
              className="mt-2 w-full resize-y border border-slate-300 bg-white px-4 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
            {errors.message && <p id="message-error" className="mt-1 text-sm text-rose-700">{errors.message}</p>}
          </div>

          <button
            type="submit"
            className="bg-accent px-6 py-3 text-sm font-medium text-white transition hover:bg-accent-light focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          >
            Send message
          </button>
          {submitted && (
            <p role="status" className="text-sm font-medium text-emerald-700">
              Thank you. Your message has been submitted successfully.
            </p>
          )}
        </form>
      </div>
    </main>
  )
}