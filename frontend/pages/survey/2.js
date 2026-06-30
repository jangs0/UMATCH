import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { AppHeader, Footer } from '../../components/Header'

export default function Survey2() {
  const router = useRouter()
  const [scores, setScores] = useState({
    sat: '', act: '', toefl: '', ielts: '', gpa: '',
  })

  useEffect(() => {
    const saved = localStorage.getItem('surveyAnswers')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setScores({
          sat: data.sat || '',
          act: data.act || '',
          toefl: data.toefl || '',
          ielts: data.ielts || '',
          gpa: data.gpa || '',
        })
      } catch {}
    }
  }, [])

  function onChange(field, value) {
    setScores(s => ({ ...s, [field]: value }))
  }

  function handleNext() {
    const existing = JSON.parse(localStorage.getItem('surveyAnswers') || '{}')
    // Только заполненные поля
    const updates = {}
    if (scores.sat) updates.sat = parseInt(scores.sat)
    if (scores.act) updates.act = parseInt(scores.act)
    if (scores.toefl) updates.toefl = parseInt(scores.toefl)
    if (scores.ielts) updates.ielts = parseFloat(scores.ielts)
    if (scores.gpa) updates.gpa = parseFloat(scores.gpa)

    localStorage.setItem('surveyAnswers', JSON.stringify({ ...existing, ...updates }))
    router.push('/survey/3')
  }

  const fields = [
    { key: 'sat',   label: 'SAT',   placeholder: 'type your SAT result',    type: 'number', min: 400,  max: 1600 },
    { key: 'act',   label: 'ACT',   placeholder: 'type your ACT result',    type: 'number', min: 1,    max: 36   },
    { key: 'toefl', label: 'TOEFL', placeholder: 'type your TOEFL result',  type: 'number', min: 0,    max: 120  },
    { key: 'ielts', label: 'IELTS', placeholder: 'type your IELTS result',  type: 'number', min: 0,    max: 9, step: 0.5 },
    { key: 'gpa',   label: 'GPA',   placeholder: 'type your UNWEIGHTED GPA', type: 'number', min: 0,   max: 4, step: 0.1 },
  ]

  return (
    <div className="survey-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      <main style={{ flex: 1, padding: '48px 48px 0' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, textAlign: 'center', marginBottom: 48 }}>
          step 2 out of 5 - academics
        </h1>

        {fields.map(f => (
          <div key={f.key} className="survey-row">
            <div className="survey-row-label">
              <span className="dot" style={{ background: scores[f.key] ? '#0a0a0a' : '#ccc' }} />
              {f.label}
            </div>
            <div className="survey-row-sub">
              type your <strong>{f.label}{f.key === 'gpa' ? ' (unweighted)' : ''}</strong> result
            </div>
            <input
              type={f.type}
              min={f.min}
              max={f.max}
              step={f.step || 1}
              placeholder={f.placeholder}
              value={scores[f.key]}
              onChange={e => onChange(f.key, e.target.value)}
            />
          </div>
        ))}
      </main>

      <button className="next-btn" onClick={handleNext}>
        next step
      </button>

      <Footer />
    </div>
  )
}
