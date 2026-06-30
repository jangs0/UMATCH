import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { AppHeader, Footer } from '../../components/Header'

const TOPICS = [
  { key: 'academic_achievements', label: 'academic achievements' },
  { key: 'extracurriculars',      label: 'extracurriculars' },
  { key: 'startup_project',       label: 'startup/project' },
  { key: 'work_experience',       label: 'work experience' },
]

export default function Survey5() {
  const router = useRouter()
  const [answers, setAnswers] = useState({
    academic_achievements: { has: false, text: '' },
    extracurriculars:      { has: false, text: '' },
    startup_project:       { has: false, text: '' },
    work_experience:       { has: false, text: '' },
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('surveyAnswers')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        const next = { ...answers }
        TOPICS.forEach(t => {
          if (data[t.key]) {
            next[t.key] = { has: true, text: data[t.key] }
          }
        })
        setAnswers(next)
      } catch {}
    }
  }, [])

  function toggle(key) {
    setAnswers(a => ({
      ...a,
      [key]: { ...a[key], has: !a[key].has, text: '' },
    }))
  }

  function setText(key, text) {
    setAnswers(a => ({
      ...a,
      [key]: { ...a[key], text },
    }))
  }

  async function handleSubmit() {
    setLoading(true)

    const existing = JSON.parse(localStorage.getItem('surveyAnswers') || '{}')
    const updates = {}
    TOPICS.forEach(t => {
      if (answers[t.key].has && answers[t.key].text) {
        updates[t.key] = answers[t.key].text
      }
    })

    const finalData = { ...existing, ...updates }
    localStorage.setItem('surveyAnswers', JSON.stringify(finalData))

    // Отправляем в /match
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://uniply-api.onrender.com'}/match`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(finalData),
        }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'match failed')

      // Сохраняем результаты
      localStorage.setItem('matchResults', JSON.stringify(data))

      // Сохраняем краткую статистику для homepage
      const reach = (data.results || []).filter(u => u.tier_label === 'reach').length
      const match = (data.results || []).filter(u => u.tier_label === 'match').length
      const safety = (data.results || []).filter(u => u.tier_label === 'safety').length
      localStorage.setItem('lastResults', JSON.stringify({ reach, match, safety }))

      router.push('/results')
    } catch (err) {
      console.error(err)
      // Даже если API недоступен — переходим на results
      router.push('/results')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="survey-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      <main style={{ flex: 1, padding: '48px 48px 0' }}>
        <h1 style={{ fontSize: '2.1rem', fontWeight: 800, textAlign: 'center', marginBottom: 12 }}>
          step 5 out of 5 - achievements (optional)
        </h1>
        <p style={{
          textAlign: 'center', color: '#555',
          fontSize: '0.9rem', marginBottom: 40,
          lineHeight: 1.6, maxWidth: 600, margin: '0 auto 40px',
        }}>
          your academic profile qualifies you for these universities · however, international admissions are highly competitive · strong extracurriculars and achievements significantly improve your real chances!
        </p>

        {TOPICS.map(t => (
          <div key={t.key} className="survey-row">
            <div className="survey-row-label" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="dot" style={{ background: answers[t.key].has ? '#0a0a0a' : '#ccc' }} />
                <strong>{t.label}</strong>
              </div>
              {/* Yes/No */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => !answers[t.key].has && toggle(t.key)}
                  style={{
                    padding: '4px 16px', borderRadius: 8,
                    border: '1.5px solid',
                    borderColor: answers[t.key].has ? '#0a0a0a' : '#e0e0e0',
                    background: answers[t.key].has ? '#0a0a0a' : '#fff',
                    color: answers[t.key].has ? '#fff' : '#888',
                    fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem',
                  }}
                >
                  yes
                </button>
                <button
                  onClick={() => answers[t.key].has && toggle(t.key)}
                  style={{
                    padding: '4px 16px', borderRadius: 8,
                    border: '1.5px solid',
                    borderColor: !answers[t.key].has ? '#0a0a0a' : '#e0e0e0',
                    background: !answers[t.key].has ? '#0a0a0a' : '#fff',
                    color: !answers[t.key].has ? '#fff' : '#888',
                    fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem',
                  }}
                >
                  no
                </button>
              </div>
            </div>

            {answers[t.key].has && (
              <textarea
                placeholder={`type something about your ${t.label}`}
                value={answers[t.key].text}
                onChange={e => setText(t.key, e.target.value)}
                style={{
                  width: '100%', marginTop: 12,
                  padding: '10px 14px',
                  border: '1.5px solid #e0e0e0',
                  borderRadius: 10, fontSize: '0.95rem',
                  background: '#fff', outline: 'none',
                  resize: 'vertical', minHeight: 80,
                  fontFamily: 'inherit',
                }}
              />
            )}
          </div>
        ))}
      </main>

      <button
        className="next-btn"
        onClick={handleSubmit}
        disabled={loading}
        style={{ opacity: loading ? 0.7 : 1 }}
      >
        {loading ? 'calculating...' : 'check your results'}
      </button>

      <Footer />
    </div>
  )
}
