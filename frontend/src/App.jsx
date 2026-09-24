import { useCallback, useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  checkHealth,
  clearHistory,
  deleteResearch,
  fetchHistory,
  fetchResearch,
  startResearch,
} from './api'
import { suggestions } from './suggestions'
import Landing from './Landing.jsx'
import './App.css'

const emptyResult = null

function timeAgo(iso) {
  if (!iso) return ''
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function App() {
  const [entered, setEntered] = useState(false)
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(emptyResult)
  const [history, setHistory] = useState([])
  const [backendUp, setBackendUp] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth > 900,
  )
  const [activeId, setActiveId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [confirmClear, setConfirmClear] = useState(false)
  const [askedQuestion, setAskedQuestion] = useState('')
  const inputRef = useRef(null)
  const resultRef = useRef(null)

  const loadHistory = useCallback(async () => {
    try {
      const items = await fetchHistory()
      setHistory(items)
    } catch {
      /* history is non-critical */
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    checkHealth()
      .then(() => {
        if (!cancelled) setBackendUp(true)
      })
      .catch(() => {
        if (!cancelled) setBackendUp(false)
      })

    fetchHistory()
      .then((items) => {
        if (!cancelled) setHistory(items)
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [result])

  useEffect(() => {
    if (entered) {
      const t = setTimeout(() => inputRef.current?.focus(), 80)
      return () => clearTimeout(t)
    }
  }, [entered])

  function enterApp(text) {
    if (text) setQuestion(text)
    setEntered(true)
    window.scrollTo(0, 0)
  }

  function goHome() {
    setEntered(false)
    setResult(emptyResult)
    setError('')
    setQuestion('')
    setAskedQuestion('')
    setActiveId(null)
    setLoading(false)
    window.scrollTo(0, 0)
  }

  function closeSidebarOnMobile() {
    if (typeof window !== 'undefined' && window.innerWidth <= 900) {
      setSidebarOpen(false)
    }
  }

  async function runResearch(text) {
    const q = (text ?? question).trim()
    if (!q || loading) return

    setQuestion(q)
    setAskedQuestion(q)
    setLoading(true)
    setError('')
    setResult(emptyResult)
    setActiveId(null)
    closeSidebarOnMobile()

    try {
      const data = await startResearch(q)
      setResult(data)
      setAskedQuestion(data.question)
      setActiveId(data.id)
      setQuestion('')
      await loadHistory()
      setBackendUp(true)
    } catch (err) {
      setError(err.message || 'Something went wrong.')
      setBackendUp(false)
    } finally {
      setLoading(false)
    }
  }

  async function openHistoryItem(item) {
    if (loading) return
    setError('')
    setResult(emptyResult)
    closeSidebarOnMobile()
    setActiveId(item.id)
    setAskedQuestion(item.question)
    setLoading(true)

    try {
      const data = await fetchResearch(item.id)
      setResult(data)
      setQuestion(data.question)
      setAskedQuestion(data.question)
    } catch (err) {
      setError(err.message || 'Could not load that research run.')
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      runResearch()
    }
  }

  async function handleDelete(e, id) {
    e.stopPropagation()
    if (deletingId) return

    setDeletingId(id)
    try {
      await deleteResearch(id)
      setHistory((prev) => prev.filter((item) => item.id !== id))
      if (activeId === id) {
        setActiveId(null)
        setResult(emptyResult)
        setAskedQuestion('')
        setError('')
      }
    } catch (err) {
      setError(err.message || 'Could not delete that item.')
    } finally {
      setDeletingId(null)
    }
  }

  async function handleClearAll() {
    if (!confirmClear) {
      setConfirmClear(true)
      return
    }

    setConfirmClear(false)
    try {
      await clearHistory()
      setHistory([])
      setActiveId(null)
      setResult(emptyResult)
      setAskedQuestion('')
      setError('')
    } catch (err) {
      setError(err.message || 'Could not clear history.')
    }
  }

  const showWelcome = !loading && !result && !error

  if (!entered) {
    return <Landing onEnter={enterApp} />
  }

  return (
    <div className="app">
      <div className="bg-orbs" aria-hidden="true">
        <span className="orb orb-1" />
        <span className="orb orb-2" />
        <span className="orb orb-3" />
      </div>

      <header className="topbar">
        <button
          className="icon-btn menu-btn"
          aria-label="Toggle history"
          onClick={() => setSidebarOpen((v) => !v)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <button className="icon-btn home-btn" aria-label="Back to home" title="Home" onClick={goHome}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 10.5L12 3l9 7.5" />
            <path d="M5 9.5V21h14V9.5" />
          </svg>
        </button>

        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 64 64">
              <defs>
                <linearGradient id="tg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4285f4" />
                  <stop offset="50%" stopColor="#9b72cb" />
                  <stop offset="100%" stopColor="#d96570" />
                </linearGradient>
              </defs>
              <path fill="url(#tg)" d="M32 6l22 12v28L32 58 10 46V18L32 6zm0 8L16 22v20l16 8 16-8V22L32 14z" />
              <circle cx="32" cy="32" r="8" fill="url(#tg)" />
            </svg>
          </span>
          <span className="brand-name">
            Scholar<span className="brand-ai">AI</span>
          </span>
        </div>

        <div className="topbar-right">
          <span
            className={`status-pill ${backendUp ? 'up' : backendUp === false ? 'down' : 'unknown'}`}
            title={backendUp ? 'Backend connected' : 'Backend unreachable'}
          >
            <span className="status-dot" />
            {backendUp ? 'Connected' : backendUp === false ? 'Offline' : 'Checking'}
          </span>
        </div>
      </header>

      <div className="shell">
        {sidebarOpen && (
          <button className="sidebar-backdrop" aria-label="Close sidebar" onClick={() => setSidebarOpen(false)} />
        )}

        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-head">
            <span className="sidebar-title">Research history</span>
            <div className="sidebar-head-actions">
              {history.length > 0 && (
                <button
                  className={`clear-history-btn ${confirmClear ? 'confirm' : ''}`}
                  onClick={handleClearAll}
                  onBlur={() => setConfirmClear(false)}
                >
                  {confirmClear ? 'Confirm?' : 'Clear'}
                </button>
              )}
              <button className="icon-btn close-btn" aria-label="Close" onClick={() => setSidebarOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <button
            className="new-research-btn"
            onClick={() => {
              setResult(emptyResult)
              setError('')
              setQuestion('')
              setAskedQuestion('')
              setActiveId(null)
              closeSidebarOnMobile()
              inputRef.current?.focus()
            }}
          >
            + New research
          </button>

          <div className="history-list">
            {history.length === 0 && <p className="history-empty">No research yet.</p>}
            {history.map((item) => (
              <div
                key={item.id}
                className={`history-item ${activeId === item.id ? 'active' : ''} ${deletingId === item.id ? 'deleting' : ''}`}
              >
                <button
                  className="history-item-main"
                  onClick={() => openHistoryItem(item)}
                  disabled={deletingId === item.id}
                >
                  <span className={`history-status ${item.status}`} />
                  <span className="history-body">
                    <span className="history-q">{item.question}</span>
                    <span className="history-meta">
                      {item.status} · {timeAgo(item.created_at)}
                    </span>
                  </span>
                </button>
                <button
                  className="history-delete"
                  aria-label="Delete history item"
                  title="Delete"
                  disabled={deletingId === item.id}
                  onClick={(e) => handleDelete(e, item.id)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </aside>

        <main className="main">
          {showWelcome && (
            <section className="welcome">
              <div className="welcome-glow" aria-hidden="true" />
              <h1 className="welcome-title">
                Research anything with
                <br />
                <span className="gradient-text">multi-agent intelligence</span>
              </h1>
              <p className="welcome-sub">
                Scholar AI searches, verifies sources, and writes cited academic answers — end to end.
              </p>

              <div className="composer-wrap">
                <div className="composer">
                  <textarea
                    ref={inputRef}
                    rows={2}
                    placeholder="Ask a research question… (e.g. How do transformers compare to RNNs?)"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <button
                    className="send-btn"
                    onClick={() => runResearch()}
                    disabled={loading || !question.trim()}
                    aria-label="Run research"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </button>
                </div>
                <p className="composer-hint">Enter to run · Shift+Enter for new line</p>
              </div>

              <div className="suggestions">
                <p className="suggestions-label">Try a suggestion</p>
                <div className="suggestion-grid">
                  {suggestions.map((s) => (
                    <button key={s.title} className="suggestion-card" onClick={() => runResearch(s.text)}>
                      <span className="suggestion-icon">{s.icon}</span>
                      <span className="suggestion-body">
                        <span className="suggestion-title">{s.title}</span>
                        <span className="suggestion-text">{s.text}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

          {!showWelcome && (
            <section className="workspace" ref={resultRef}>
              <div className="chat-thread">
                {(askedQuestion || question) && (
                  <div className="user-turn">
                    <div className="turn-avatar you" aria-hidden="true">You</div>
                    <div className="turn-content">
                      <div className="turn-label">You</div>
                      <div className="user-bubble">{askedQuestion || question}</div>
                    </div>
                  </div>
                )}

                {loading && (
                  <div className="assistant-turn">
                    <div className="turn-avatar ai" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 64 64">
                        <defs>
                          <linearGradient id="ag" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#4285f4" />
                            <stop offset="50%" stopColor="#9b72cb" />
                            <stop offset="100%" stopColor="#d96570" />
                          </linearGradient>
                        </defs>
                        <path fill="url(#ag)" d="M32 6l22 12v28L32 58 10 46V18L32 6zm0 8L16 22v20l16 8 16-8V22L32 14z" />
                      </svg>
                    </div>
                    <div className="turn-content">
                      <div className="turn-label">Scholar AI</div>
                      <div className="loading-card">
                        <div className="loading-row">
                          <div className="spinner" />
                          <div className="loading-copy">
                            <strong>Running research agents…</strong>
                            <span>Searching · verifying sources · drafting answer</span>
                          </div>
                        </div>
                        <div className="shimmer-lines" aria-hidden="true">
                          <span />
                          <span />
                          <span />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="assistant-turn">
                    <div className="turn-avatar ai" aria-hidden="true">!</div>
                    <div className="turn-content">
                      <div className="turn-label">Error</div>
                      <div className="error-card">
                        <strong>Something went wrong</strong>
                        <p>{error}</p>
                        {!backendUp && (
                          <p className="error-hint">
                            Start the backend first: <code>uvicorn app.main:app --reload</code> (from <code>backend/</code>)
                          </p>
                        )}
                        <button className="retry-btn" onClick={() => runResearch()}>Retry</button>
                      </div>
                    </div>
                  </div>
                )}

                {result && !loading && (
                  <div className="assistant-turn">
                    <div className="turn-avatar ai" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 64 64">
                        <defs>
                          <linearGradient id="ag2" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#4285f4" />
                            <stop offset="50%" stopColor="#9b72cb" />
                            <stop offset="100%" stopColor="#d96570" />
                          </linearGradient>
                        </defs>
                        <path fill="url(#ag2)" d="M32 6l22 12v28L32 58 10 46V18L32 6zm0 8L16 22v20l16 8 16-8V22L32 14z" />
                      </svg>
                    </div>
                    <div className="turn-content">
                      <div className="turn-label">
                        Scholar AI
                        <span className={`badge ${result.status}`}>{result.status}</span>
                      </div>

                      {result.steps?.length > 0 && (
                        <details className="thoughts">
                          <summary>Research process ({result.steps.length} steps)</summary>
                          <ol className="step-list">
                            {result.steps.map((step, i) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ol>
                        </details>
                      )}

                      <div className="markdown-body">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            table: ({ children }) => (
                              <div className="table-wrap">
                                <table>{children}</table>
                              </div>
                            ),
                          }}
                        >
                          {result.answer}
                        </ReactMarkdown>
                      </div>

                      {result.sources?.length > 0 && (
                        <div className="sources">
                          <p className="section-label">Sources · {result.sources.length}</p>
                          <ul className="source-list">
                            {result.sources.map((src, i) => {
                              const url = typeof src === 'string' ? src : src.url
                              const title =
                                typeof src === 'string'
                                  ? safeHost(src)
                                  : src.title || src.url || `Source ${i + 1}`
                              if (!url) return <li key={i} className="source-item">{title}</li>
                              return (
                                <li key={i} className="source-item">
                                  <span className="source-num">{i + 1}</span>
                                  <a href={url} target="_blank" rel="noreferrer noreferrer">
                                    {title}
                                  </a>
                                </li>
                              )
                            })}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="composer-dock">
                <div className="composer">
                  <textarea
                    ref={inputRef}
                    rows={1}
                    placeholder="Ask another research question…"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <button
                    className="send-btn"
                    onClick={() => runResearch()}
                    disabled={loading || !question.trim()}
                    aria-label="Run research"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </button>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

function safeHost(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}
