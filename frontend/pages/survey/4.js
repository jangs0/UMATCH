import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { AppHeader, Footer } from '../../components/Header'

const OPTIONS = {
  climate: ['warm', 'mild', 'cold', 'any'],
  city_size: ['rural / college town', 'small city', 'mid-size city', 'large city', 'any'],
  sports: ['D1', 'D2', 'D3', 'any'],
  uni_size: ['small (<3000)', 'medium (3000–10000)', 'large (>10000)', 'any'],
  student_life: ['low', 'mid', 'high'],
}

export default function Survey4() {
  const router = useRouter()
  const [prefs, setPrefs] = useState({
    climate: [],
    city_size: [],
    sports: [],
    uni_size: [],
    student_life: '',
  })

  useEffect(() => {
    const saved = localStorage.getItem('surveyAnswers')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setPrefs({
          climate: data.climate || [],
          city_size: data.city_size || [],
          sports: data.sports || [],
          uni_size: data.uni_size || [],
          student_life: data.student_life || '',
        })
      } catch {}
    }
  }, [])

  function toggleMulti(field, val) {
    setPrefs(p => {
      const arr = p[field]
      return {
        ...p,
        [field]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val],
      }
    })
  }

  function setSingle(field, val) {
    setPrefs(p => ({ ...p, [field]: val }))
  }

  function handleNext() {
    const existing = JSON.parse(localStorage.getItem('surveyAnswers') || '{}')
    localStorage.setItem('surveyAnswers', JSON.stringify({
      ...existing,
      preferences: {
        climate: prefs.climate,
        city_size: prefs.city_size,
        sports: prefs.sports,
        uni_size: prefs.uni_size,
        student_life: prefs.student_life,
      },
    }))
    router.push('/survey/5')
  }

  function MultiSelect({ field, label, sub }) {
    const [open, setOpen] = useState(false)
    const selected = prefs[field]

    return (
      <div className="survey-row" style={{ position: 'relative' }}>
        <div className="survey-row-label">
          <span>◆</span> {label}
        </div>
        <div className="survey-row-sub">choose your <strong>desired {label}</strong></div>

        {selected.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {selected.map(v => (
              <span key={v} style={{
                background: '#0a0a0a', color: '#fff',
                borderRadius: 8, padding: '4px 12px',
                fontSize: '0.85rem', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {v}
                <button
                  onClick={() => toggleMulti(field, v)}
                  style={{ color: '#fff', background: 'none', border: 'none', cursor: 'pointer' }}
                >×</button>
              </span>
            ))}
          </div>
        )}

        <button
          onClick={() => setOpen(o => !o)}
          style={{
            width: '100%', marginTop: 10, padding: '10px 14px',
            border: '1.5px solid #e0e0e0', borderRadius: 10,
            fontSize: '0.95rem', background: '#fff', textAlign: 'left',
            cursor: 'pointer',
          }}
        >
          {open ? '▲ close' : '▼ choose...'}
        </button>

        {open && (
          <div style={{
            position: 'absolute', left: 0, right: 0,
            background: '#fff', border: '1.5px solid #e0e0e0',
            borderRadius: 12, zIndex: 20,
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          }}>
            {OPTIONS[field].map(v => (
              <div
                key={v}
                onClick={() => toggleMulti(field, v)}
                style={{
                  padding: '10px 16px', cursor: 'pointer',
                  fontSize: '0.9rem',
                  background: selected.includes(v) ? '#f0f0f0' : '#fff',
                  fontWeight: selected.includes(v) ? 600 : 400,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
                onMouseOver={e => e.currentTarget.style.background = '#f5f5f5'}
                onMouseOut={e => e.currentTarget.style.background = selected.includes(v) ? '#f0f0f0' : '#fff'}
              >
                {v} {selected.includes(v) ? '✓' : ''}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="survey-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      <main style={{ flex: 1, padding: '48px 48px 0' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, textAlign: 'center', marginBottom: 48 }}>
          step 4 out of 5 - preferences (optional)
        </h1>

        <MultiSelect field="climate" label="climate" />
        <MultiSelect field="city_size" label="city size" />
        <MultiSelect field="sports" label="sports" />
        <MultiSelect field="uni_size" label="university size" />

        {/* Student life — single choice */}
        <div className="survey-row">
          <div className="survey-row-label">
            <span className="dot" style={{ background: prefs.student_life ? '#0a0a0a' : '#ccc' }} />
            student life
          </div>
          <div className="survey-row-sub">choose your <strong>desired student life</strong></div>
          <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
            {OPTIONS.student_life.map(v => (
              <button
                key={v}
                onClick={() => setSingle('student_life', v)}
                style={{
                  padding: '8px 24px',
                  borderRadius: 10,
                  border: '1.5px solid',
                  borderColor: prefs.student_life === v ? '#0a0a0a' : '#e0e0e0',
                  background: prefs.student_life === v ? '#0a0a0a' : '#fff',
                  color: prefs.student_life === v ? '#fff' : '#0a0a0a',
                  fontWeight: 600, cursor: 'pointer',
                  fontSize: '0.95rem',
                  transition: 'all 0.15s',
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </main>

      <button className="next-btn" onClick={handleNext}>
        next step
      </button>

      <Footer />
    </div>
  )
}
