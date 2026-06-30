import { useEffect, useState } from 'react'
import { AppHeader, Footer } from '../components/Header'
import UniversityCard from '../components/UniversityCard'

export default function Results() {
  const [unis, setUnis] = useState({ reach: [], match: [], safety: [] })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem('matchResults')
    if (raw) {
      try {
        const data = JSON.parse(raw)
        const results = data.results || data || []

        // Сохранённый список для отметки saved
        const savedList = JSON.parse(localStorage.getItem('savedList') || '[]')
        const savedIds = new Set(savedList.map(u => u.id))

        const reach = results.filter(u => u.tier_label === 'reach').map(u => ({ ...u, saved: savedIds.has(u.id) }))
        const match = results.filter(u => u.tier_label === 'match').map(u => ({ ...u, saved: savedIds.has(u.id) }))
        const safety = results.filter(u => u.tier_label === 'safety').map(u => ({ ...u, saved: savedIds.has(u.id) }))

        setUnis({ reach, match, safety })
      } catch {}
    }
    setLoaded(true)
  }, [])

  const total = unis.reach.length + unis.match.length + unis.safety.length
  const maxLen = Math.max(unis.reach.length, unis.match.length, unis.safety.length)

  return (
    <div className="page">
      <AppHeader />

      <main className="main">
        <div style={{ padding: '40px 48px 24px' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: 4 }}>your results</h1>
          <p style={{ color: '#888', fontSize: '0.95rem' }}>
            {unis.reach.length} reach, {unis.match.length} match, {unis.safety.length} safety, {total} total
          </p>
        </div>

        {loaded && total === 0 && (
          <div style={{ padding: '0 48px', color: '#888' }}>
            no results yet — <a href="/survey/1" style={{ fontWeight: 600, color: '#0a0a0a' }}>take the survey</a>
          </div>
        )}

        {total > 0 && (
          <div className="results-grid">
            {/* Reach */}
            <div>
              <div className="column-header">reach</div>
              {unis.reach.map(u => (
                <UniversityCard key={u.id} uni={u} />
              ))}
            </div>

            {/* Match */}
            <div>
              <div className="column-header">match</div>
              {unis.match.map(u => (
                <UniversityCard key={u.id} uni={u} />
              ))}
            </div>

            {/* Safety */}
            <div>
              <div className="column-header">safety</div>
              {unis.safety.map(u => (
                <UniversityCard key={u.id} uni={u} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
