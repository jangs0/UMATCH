import { useEffect, useState } from 'react'
import { AppHeader, Footer } from '../components/Header'
import UniversityCard from '../components/UniversityCard'

export default function Saved() {
  const [unis, setUnis] = useState({ reach: [], match: [], safety: [] })

  function load() {
    const savedList = JSON.parse(localStorage.getItem('savedList') || '[]')
    setUnis({
      reach: savedList.filter(u => u.tier_label === 'reach'),
      match: savedList.filter(u => u.tier_label === 'match'),
      safety: savedList.filter(u => u.tier_label === 'safety'),
    })
  }

  useEffect(() => { load() }, [])

  function handleRemove(id) {
    // UniversityCard уже обновляет localStorage — просто перезагружаем
    load()
  }

  const total = unis.reach.length + unis.match.length + unis.safety.length

  return (
    <div className="page">
      <AppHeader />

      <main className="main">
        <div style={{ padding: '40px 48px 24px' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: 4 }}>your saved list</h1>
          <p style={{ color: '#888', fontSize: '0.95rem' }}>
            {unis.reach.length} reach, {unis.match.length} match, {unis.safety.length} safety, {total} total
          </p>
        </div>

        {total === 0 && (
          <div style={{ padding: '0 48px', color: '#888' }}>
            no saved universities yet — go to <a href="/results" style={{ fontWeight: 600, color: '#0a0a0a' }}>your results</a> and save some
          </div>
        )}

        {total > 0 && (
          <div className="results-grid">
            <div>
              <div className="column-header">reach</div>
              {unis.reach.map(u => (
                <UniversityCard key={u.id} uni={u} showRemove onRemove={handleRemove} />
              ))}
            </div>
            <div>
              <div className="column-header">match</div>
              {unis.match.map(u => (
                <UniversityCard key={u.id} uni={u} showRemove onRemove={handleRemove} />
              ))}
            </div>
            <div>
              <div className="column-header">safety</div>
              {unis.safety.map(u => (
                <UniversityCard key={u.id} uni={u} showRemove onRemove={handleRemove} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
