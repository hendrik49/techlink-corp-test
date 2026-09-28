import { useState } from 'react'
import { Link } from 'react-router-dom'

const paragraph = 'TechLink helps businesses build dependable digital products through thoughtful engineering, secure systems, and practical technology consulting. Our team works closely with every client to understand their goals and deliver solutions that make everyday work simpler.'

export default function Searchtxt() {
  const [searchText, setSearchText] = useState('')
  const normalizedSearch = searchText.trim()
  const matchIndex = normalizedSearch
    ? paragraph.toLowerCase().indexOf(normalizedSearch.toLowerCase())
    : -1

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-800 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="text-sm font-medium text-accent hover:underline">
          TechLink
        </Link>
        <h1 className="mt-10 text-3xl font-semibold tracking-tight text-slate-900">
          Search the paragraph
        </h1>
        <label htmlFor="paragraph-search" className="mt-7 block text-sm font-medium text-slate-700">
          Search text
        </label>
        <input
          id="paragraph-search"
          type="search"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Type a word or phrase"
          className="mt-2 w-full border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        />

        <p className="mt-8 text-base leading-8 text-slate-600">
          {matchIndex >= 0 ? (
            <>
              {paragraph.slice(0, matchIndex)}
              <mark className="bg-yellow-300 text-slate-900">
                {paragraph.slice(matchIndex, matchIndex + normalizedSearch.length)}
              </mark>
              {paragraph.slice(matchIndex + normalizedSearch.length)}
            </>
          ) : (
            paragraph
          )}
        </p>
        {normalizedSearch && matchIndex < 0 && (
          <p role="status" className="mt-3 text-sm text-rose-700">
            No text found.
          </p>
        )}
      </div>
    </main>
  )
}