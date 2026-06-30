import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { AppHeader, Footer } from '../../components/Header'

export default function Survey3() {
  const router = useRouter()
  // budget: 0..16 шагов по $5k, т.е. 0=0, 16=80+
  const [budgetStep, setBudgetStep] = useState(8)   // дефолт $40k
  // grant: 0..20 шагов по 5%, т.е. 0=0%, 20=100%
  const [grantStep, setGrantStep] = useState(10)    // дефолт 50%

  useEffect(() => {
    const saved = localStorage.getItem('surveyAnswers')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        if (data.family_budget != null) {
          const step = data.family_budget >= 80 ? 16 : Math.round(data.family_budget / 5)
          setBudgetStep(step)
        }
        if (data.grant_needed != null) {
          setGrantStep(Math.round(data.grant_needed / 5))
        }
      } catch {}
    }
  }, [])

  function budgetLabel(step) {
    if (step >= 16) return '$80K+'
    return `$${step * 5}K`
  }

  function grantLabel(step) {
    return `${step * 5}%`
  }

  function handleNext() {
    const existing = JSON.parse(localStorage.getItem('surveyAnswers') || '{}')
    const family_budget = budgetStep >= 16 ? 80 : budgetStep * 5
    const grant_needed = grantStep * 5

    localStorage.setItem('surveyAnswers', JSON.stringify({
      ...existing,
      family_budget,
      grant_needed,
    }))
    router.push('/survey/4')
  }

  return (
    <div className="survey-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      <main style={{ flex: 1, padding: '48px 48px 0' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, textAlign: 'center', marginBottom: 16 }}>
          step 3 out of 5 - finances
        </h1>
        <p style={{ textAlign: 'center', color: '#555', fontSize: '1.05rem', marginBottom: 48 }}>
          this helps us calculate your real grant probability at each university
        </p>

        {/* Family budget */}
        <div className="survey-row">
          <div className="survey-row-label">
            <span className="dot" />
            family can pay per year
          </div>
          <div className="survey-row-sub">
            choose the amount of <strong>payment ability</strong>
          </div>
        </div>

        <div className="slider-wrap">
          <span className="slider-label">$0</span>
          <input
            type="range"
            min={0} max={16} step={1}
            value={budgetStep}
            onChange={e => setBudgetStep(Number(e.target.value))}
          />
          <span className="slider-label-center">{budgetLabel(budgetStep)}</span>
          <input
            type="range"
            min={0} max={16} step={1}
            value={budgetStep}
            onChange={e => setBudgetStep(Number(e.target.value))}
            style={{ display: 'none' }}
          />
          <span className="slider-label" style={{ textAlign: 'right' }}>$80K+</span>
        </div>

        {/* Grant needed */}
        <div className="survey-row" style={{ marginTop: 24 }}>
          <div className="survey-row-label">
            <span className="dot" />
            grant needed
          </div>
          <div className="survey-row-sub">
            choose the amount of <strong>needed grant</strong>
          </div>
        </div>

        <div className="slider-wrap">
          <span className="slider-label">0%</span>
          <input
            type="range"
            min={0} max={20} step={1}
            value={grantStep}
            onChange={e => setGrantStep(Number(e.target.value))}
          />
          <span className="slider-label-center">{grantLabel(grantStep)}</span>
          <span className="slider-label" style={{ textAlign: 'right' }}>100%</span>
        </div>
      </main>

      <button className="next-btn" onClick={handleNext}>
        next step
      </button>

      <Footer />
    </div>
  )
}
