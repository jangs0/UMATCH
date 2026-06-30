import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { AppHeader, Footer } from '../../components/Header'

function Tag({ children }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '8px 18px',
      border: '1.5px solid rgba(255,255,255,0.7)',
      borderRadius: 100,
      fontSize: '0.88rem', fontWeight: 500,
      color: '#fff',
      background: 'rgba(255,255,255,0.12)',
      backdropFilter: 'blur(4px)',
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  )
}

const GRANT_LABELS = {
  good: 'good',
  moderate: 'moderate',
  bad: 'bad',
}

function grantLabel(prob) {
  if (prob == null) return ''
  if (prob >= 70) return 'good'
  if (prob >= 40) return 'moderate'
  return 'bad'
}

export default function UniversityPage() {
  const router = useRouter()
  const { id } = router.query

  const [uni, setUni] = useState(null)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    // Сначала ищем в localStorage (из результатов матча)
    const raw = localStorage.getItem('matchResults')
    if (raw) {
      try {
        const data = JSON.parse(raw)
        const results = data.results || data || []
        const found = results.find(u => String(u.id) === String(id))
        if (found) {
          setUni(found)
          const savedList = JSON.parse(localStorage.getItem('savedList') || '[]')
          setSaved(savedList.some(u => String(u.id) === String(id)))
          setLoading(false)
          return
        }
      } catch {}
    }

    // Если не нашли — запрашиваем с API
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://uniply-api.onrender.com'}/university/${id}`)
      .then(r => r.json())
      .then(data => {
        setUni(data)
        const savedList = JSON.parse(localStorage.getItem('savedList') || '[]')
        setSaved(savedList.some(u => String(u.id) === String(id)))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  function handleSave() {
    const savedList = JSON.parse(localStorage.getItem('savedList') || '[]')
    if (saved) {
      const idx = savedList.findIndex(u => String(u.id) === String(id))
      if (idx !== -1) savedList.splice(idx, 1)
      setSaved(false)
    } else {
      if (!savedList.find(u => String(u.id) === String(id))) {
        savedList.push({ ...uni, saved: true })
      }
      setSaved(true)
    }
    localStorage.setItem('savedList', JSON.stringify(savedList))
  }

  if (loading) {
    return (
      <div className="page">
        <AppHeader white />
        <main style={{ padding: 48, color: '#fff' }}>loading...</main>
      </div>
    )
  }

  if (!uni) {
    return (
      <div className="page">
        <AppHeader />
        <main style={{ padding: 48 }}>university not found</main>
        <Footer />
      </div>
    )
  }

  const grantProb = uni.grant_probability?.score
  const grantLbl = uni.grant_probability?.label?.toLowerCase() || grantLabel(grantProb)

  const deadlines = [
    { label: 'ED I', value: uni.deadline_ed1 || '–' },
    { label: 'ED II', value: uni.deadline_ed2 || '–' },
    { label: 'EA', value: uni.deadline_ea || '–' },
    { label: 'RD', value: uni.deadline_rd || '–' },
  ]

  return (
    <div className="gradient-university" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <AppHeader white />
      </div>

      <main style={{
        flex: 1, position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        padding: '48px 48px 0',
      }}>
        {/* Название */}
        <h1 style={{
          fontSize: '3rem', fontWeight: 800,
          color: '#fff', marginBottom: 32,
          textAlign: 'center',
        }}>
          {uni.name}
        </h1>

        {/* Ряд 1: tier, aid status, acceptance rate, meets need */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 16 }}>
          {uni.tier_label && <Tag>{uni.tier_label}</Tag>}
          {uni.aid_label && <Tag>{uni.aid_label}</Tag>}
          {uni.acceptance_rate && <Tag>acceptance rate ~{(uni.acceptance_rate * 100).toFixed(1)}%</Tag>}
          <Tag>{uni.full_ride ? 'meets 100% of need' : 'does not meet 100% of need'}</Tag>
        </div>

        {/* Ряд 2: дедлайны */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 16 }}>
          {deadlines.map(d => (
            <Tag key={d.label}>{d.label} {d.value === '–' ? '–' : `- ${d.value}`}</Tag>
          ))}
        </div>

        {/* Ряд 3: стоимость + grant probability */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 16 }}>
          {uni.cost_per_year && <Tag>${uni.cost_per_year.toLocaleString()}/yr</Tag>}
          {grantProb != null && (
            <Tag>grant probability {grantProb}% ({grantLbl})</Tag>
          )}
        </div>

        {/* Ряд 4: sports conference, city size, QS ranking */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 32 }}>
          {uni.sports_conference && <Tag>{uni.sports_conference}</Tag>}
          {uni.city_size && <Tag>{uni.city_size} city</Tag>}
          {uni.qs_ranking && <Tag>#{uni.qs_ranking} in QS Ranking</Tag>}
        </div>

        {/* Кнопки */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 48 }}>
          <button
            onClick={handleSave}
            style={{
              background: saved ? '#0a0a0a' : '#fff',
              color: saved ? '#fff' : '#0a0a0a',
              border: 'none', borderRadius: 12,
              padding: '12px 28px', fontWeight: 600,
              fontSize: '0.95rem', cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {saved ? 'saved ✓' : 'save'}
          </button>
          <button
            onClick={() => router.back()}
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
              border: '1.5px solid rgba(255,255,255,0.5)',
              borderRadius: 12,
              padding: '12px 28px', fontWeight: 600,
              fontSize: '0.95rem', cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >
            back to results
          </button>
        </div>

        {/* About */}
        <div style={{ width: '100%', maxWidth: 800 }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0a0a0a', marginBottom: 16 }}>
            about
          </h2>
          <p style={{ color: '#333', fontSize: '1rem', lineHeight: 1.7 }}>
            {uni.about || `${uni.name} is a university in the United States offering a wide range of undergraduate programs.`}
          </p>
        </div>
      </main>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Footer white />
      </div>
    </div>
  )
}
