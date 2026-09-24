import { useEffect, useState } from 'react'
import { suggestions } from './suggestions'
import './Landing.css'

const HELLO = [...'Hello']

const features = [
  {
    icon: '🤖',
    title: 'Multi-agent research',
    text: 'Specialized agents search, verify, and write — working together like a full research team.',
  },
  {
    icon: '🔍',
    title: 'Verified sources',
    text: 'Claims are checked against real, credible sources before they ever reach your answer.',
  },
  {
    icon: '📄',
    title: 'Cited academic answers',
    text: 'Structured, well-written responses with linked references you can open and trust.',
  },
  {
    icon: '🧠',
    title: 'Visible thinking',
    text: 'Expand the research process and follow every step the agents took, in order.',
  },
  {
    icon: '🗂️',
    title: 'Research history',
    text: 'Every run is saved automatically — reopen any past question with a single click.',
  },
  {
    icon: '⚡',
    title: 'Zero friction',
    text: 'No login, no signup, no credit card. Ask a question and get answers instantly.',
  },
]

const steps = [
  {
    n: '01',
    title: 'Ask anything',
    text: 'Type a research question or pick one of the starter suggestions.',
  },
  {
    n: '02',
    title: 'Agents get to work',
    text: 'Searching, verification, and drafting agents run end to end, automatically.',
  },
  {
    n: '03',
    title: 'Get a cited answer',
    text: 'Read a structured response with sources, status, and the full process log.',
  },
]

const faqs = [
  {
    q: 'Do I need an account?',
    a: 'No. Scholar AI is completely free to use — no login, no signup, and no credit card required. Just click “Try it for free” and start asking.',
  },
  {
    q: 'What can I ask?',
    a: 'Anything research-shaped: latest AI news, comparisons between papers or frameworks, explanations of hard concepts, data science topics, MLOps practices, and more.',
  },
  {
    q: 'How does it work?',
    a: 'A team of AI agents runs a research pipeline — searching the web, verifying sources, and drafting a cited answer. You can expand every step of the process in the chat.',
  },
  {
    q: 'Are the sources real?',
    a: 'Yes. Every answer comes with a source list and direct links, so you can open the original material and verify the claims yourself.',
  },
  {
    q: 'Is my history saved?',
    a: 'Your research runs are stored so you can revisit them from the sidebar at any time. You can delete individual runs or clear all history whenever you want.',
  },
]

const topics = [
  'Machine learning',
  'Quantum computing',
  'Large language models',
  'Climate science',
  'Biotechnology',
  'Space exploration',
  'MLOps',
  'Neuroscience',
  'Economics',
  'RAG pipelines',
  'Agentic AI',
  'Data science',
]

export default function Landing({ onEnter }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)

    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 },
    )

    document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el))

    return () => {
      window.removeEventListener('scroll', onScroll)
      io.disconnect()
    }
  }, [])

  return (
    <div className="l">
      <header className={`l-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="l-nav-inner">
          <div className="l-brand">
            <span className="l-brand-mark" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 64 64">
                <defs>
                  <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4285f4" />
                    <stop offset="50%" stopColor="#9b72cb" />
                    <stop offset="100%" stopColor="#d96570" />
                  </linearGradient>
                </defs>
                <path fill="url(#lg1)" d="M32 6l22 12v28L32 58 10 46V18L32 6zm0 8L16 22v20l16 8 16-8V22L32 14z" />
                <circle cx="32" cy="32" r="8" fill="url(#lg1)" />
              </svg>
            </span>
            <span className="l-brand-name">
              Scholar<span className="l-brand-ai">AI</span>
            </span>
          </div>

          <nav className="l-nav-links">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#faq">FAQ</a>
          </nav>

          <div className="l-nav-right">
            <span className="l-nav-note">No signup needed</span>
            <button className="l-btn l-btn-sm" onClick={() => onEnter()}>
              Try it for free
            </button>
          </div>
        </div>
      </header>

      <section className="l-hero">
        <div className="l-orbs" aria-hidden="true">
          <span className="l-orb l-orb-1" />
          <span className="l-orb l-orb-2" />
          <span className="l-orb l-orb-3" />
        </div>

        <div className="l-hero-inner">
          <p className="l-eyebrow" data-reveal>
            Multi-agent academic research
          </p>

          <div className="l-hello" aria-label="Hello">
            {HELLO.map((ch, i) => (
              <span key={i} style={{ '--i': i }} aria-hidden="true">
                {ch}
              </span>
            ))}
          </div>

          <h1 className="l-title" data-reveal style={{ '--d': '0.15s' }}>
            Research anything with{' '}
            <span className="l-grad">multi-agent intelligence</span>
          </h1>

          <p className="l-sub" data-reveal style={{ '--d': '0.3s' }}>
            Scholar AI searches the web, verifies sources, and writes cited,
            academic-quality answers — end to end, with every step of the
            process visible to you.
          </p>

          <div className="l-cta-col" data-reveal style={{ '--d': '0.45s' }}>
            <button className="l-btn l-btn-lg" onClick={() => onEnter()}>
              Try it for free
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
            <p className="l-cta-note">
              Free forever · <strong>No login or signup required</strong>
            </p>
          </div>

          <div className="l-chips" data-reveal style={{ '--d': '0.6s' }}>
            <span className="l-chip l-chip-1">🔍 Searching sources…</span>
            <span className="l-chip l-chip-2">✅ Verifying claims…</span>
            <span className="l-chip l-chip-3">✍️ Drafting answer…</span>
            <span className="l-chip l-chip-4">📚 Citing references…</span>
          </div>
        </div>
      </section>

      <div className="l-marquee" aria-hidden="true">
        <div className="l-marquee-track">
          {[...topics, ...topics].map((t, i) => (
            <span key={i} className="l-marquee-item">
              {t}
            </span>
          ))}
        </div>
      </div>

      <section className="l-section" id="features">
        <div className="l-section-inner">
          <p className="l-kicker" data-reveal>Why Scholar AI</p>
          <h2 className="l-section-title" data-reveal style={{ '--d': '0.1s' }}>
            Everything you need to{' '}
            <span className="l-script">research smarter</span>
          </h2>
          <p className="l-section-sub" data-reveal style={{ '--d': '0.2s' }}>
            From the first question to the final citation, the whole pipeline
            runs automatically — and shows its work.
          </p>

          <div className="l-grid">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="l-card"
                data-reveal
                style={{ '--d': `${i * 0.08}s` }}
              >
                <span className="l-card-icon" aria-hidden="true">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="l-section l-section-alt" id="how">
        <div className="l-section-inner">
          <p className="l-kicker" data-reveal>How it works</p>
          <h2 className="l-section-title" data-reveal style={{ '--d': '0.1s' }}>
            Three steps, <span className="l-script">zero setup</span>
          </h2>
          <p className="l-section-sub" data-reveal style={{ '--d': '0.2s' }}>
            No accounts, no configuration — ask a question and the agents take
            it from there.
          </p>

          <div className="l-steps">
            {steps.map((s, i) => (
              <div
                key={s.n}
                className="l-step"
                data-reveal
                style={{ '--d': `${i * 0.12}s` }}
              >
                <span className="l-step-num">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="l-section" id="ask">
        <div className="l-section-inner">
          <p className="l-kicker" data-reveal>Jump straight in</p>
          <h2 className="l-section-title" data-reveal style={{ '--d': '0.1s' }}>
            What will you <span className="l-script">ask first?</span>
          </h2>
          <p className="l-section-sub" data-reveal style={{ '--d': '0.2s' }}>
            Pick a starter question — it opens right in the app, ready to run.
          </p>

          <div className="l-suggest-grid">
            {suggestions.map((s, i) => (
              <button
                key={s.title}
                className="l-suggest"
                data-reveal
                style={{ '--d': `${i * 0.07}s` }}
                onClick={() => onEnter(s.text)}
              >
                <span className="l-suggest-icon" aria-hidden="true">{s.icon}</span>
                <span className="l-suggest-body">
                  <span className="l-suggest-title">{s.title}</span>
                  <span className="l-suggest-text">{s.text}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="l-section l-section-alt" id="faq">
        <div className="l-section-inner l-narrow">
          <p className="l-kicker" data-reveal>FAQ</p>
          <h2 className="l-section-title" data-reveal style={{ '--d': '0.1s' }}>
            Good questions, <span className="l-script">honest answers</span>
          </h2>

          <div className="l-faq">
            {faqs.map((f, i) => (
              <details
                key={f.q}
                className="l-faq-item"
                data-reveal
                style={{ '--d': `${i * 0.07}s` }}
              >
                <summary>
                  {f.q}
                  <span className="l-faq-chevron" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="l-final">
        <div className="l-final-inner" data-reveal>
          <h2>
            Start your next <span className="l-script">research</span> in
            seconds
          </h2>
          <p>
            No login. No signup. Just ask — and let the agents do the work.
          </p>
          <button className="l-btn l-btn-lg" onClick={() => onEnter()}>
            Try it for free
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </section>

      <footer className="l-footer">
        <div className="l-footer-inner">
          <div className="l-brand">
            <span className="l-brand-mark" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 64 64">
                <defs>
                  <linearGradient id="lg2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4285f4" />
                    <stop offset="50%" stopColor="#9b72cb" />
                    <stop offset="100%" stopColor="#d96570" />
                  </linearGradient>
                </defs>
                <path fill="url(#lg2)" d="M32 6l22 12v28L32 58 10 46V18L32 6zm0 8L16 22v20l16 8 16-8V22L32 14z" />
                <circle cx="32" cy="32" r="8" fill="url(#lg2)" />
              </svg>
            </span>
            <span className="l-brand-name">
              Scholar<span className="l-brand-ai">AI</span>
            </span>
          </div>
          <p className="l-footer-tag">
            Multi-agent academic research — free, open, no signup.
          </p>
          <p className="l-footer-copy">© 2026 Scholar AI</p>
        </div>
      </footer>
    </div>
  )
}
