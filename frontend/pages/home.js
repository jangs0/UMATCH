import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { AppHeader, Footer } from '../components/Header'

// Список вузов для фонового коллажа
const UNI_LOGOS_TEXT = [
  'Columbia University', 'Cornell University', 'Vanderbilt University', 'Rice',
  'Penn', 'Northwestern University', 'Stanford University', 'MIT', 'NYU',
  'Princeton University', 'Brown University', 'Yale University', 'Duke',
  'Johns Hopkins', 'Georgetown University', 'Harvard University',
]

export default function Home() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [lastResults, setLastResults] = useState(null)

  useEffect(() => {
    const name = localStorage.getItem('username') || 'user'
    setUsername(name)

    const saved = localStorage.getItem('lastResults')
    if (saved) {
      try { setLastResults(JSON.parse(saved)) } catch {}
    }
  }, [])

  function handleTakeSurvey() {
    // Сбрасываем все ответы survey
    localStorage.removeItem('surveyAnswers')
    router.push('/survey/1')
  }

  function handleEditCurrent() {
    router.push('/survey/1')
  }

  return (
    <div className="page">
      <div style={{ position: 'relative', flex: 1 }}>
        {/* Градиентный фон */}
        <div className="gradient-home" style={{
          position: 'absolute', inset: 0, zIndex: 0,
        }} />

        {/* Хедер поверх градиента */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <AppHeader white />
        </div>

        {/* Контент */}
        <main style={{
          position: 'relative', zIndex: 5,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 60, paddingBottom: 80,
          minHeight: 'calc(100vh - 140px)',
        }}>
          {/* Greeting */}
          <h1 style={{
            fontSize: '3.2rem', fontWeight: 800,
            color: '#fff', letterSpacing: '-1px',
            marginBottom: 32,
          }}>
            hi, {username}
          </h1>

          {/* Кнопки survey */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
            <button
              onClick={handleTakeSurvey}
              style={{
                background: '#fff', color: '#0a0a0a',
                border: 'none', borderRadius: 12,
                padding: '14px 28px', fontSize: '1rem',
                fontWeight: 600, cursor: 'pointer',
                transition: 'opacity 0.15s',
              }}
              onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
              onMouseOut={e => e.currentTarget.style.opacity = '1'}
            >
              take a survey
            </button>
            <button
              onClick={handleEditCurrent}
              style={{
                background: 'transparent', color: '#fff',
                border: '1.5px solid rgba(255,255,255,0.7)',
                borderRadius: 12,
                padding: '14px 28px', fontSize: '1rem',
                fontWeight: 600, cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
            >
              edit current
            </button>
          </div>

          {/* Последние результаты */}
          {lastResults && (
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 12,
              padding: '12px 28px',
              color: '#fff',
              fontSize: '0.95rem',
              marginBottom: 24,
            }}>
              your last results: {lastResults.reach} reach, {lastResults.match} match, {lastResults.safety} safety
            </div>
          )}

          {/* See full list */}
          {lastResults && (
            <Link href="/results" style={{
              background: '#fff', color: '#0a0a0a',
              borderRadius: 12, padding: '12px 28px',
              fontSize: '0.95rem', fontWeight: 600,
              marginBottom: 48,
            }}>
              see full list
            </Link>
          )}

          {/* Коллаж логотипов вузов снизу */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            display: 'flex', flexWrap: 'wrap',
            gap: 16, padding: '0 40px 32px',
            opacity: 0.6,
            pointerEvents: 'none',
            justifyContent: 'center',
            zIndex: 1,
          }}>
            {UNI_LOGOS_TEXT.map((name, i) => (
              <span key={i} style={{
                color: '#fff',
                fontSize: i % 3 === 0 ? '1.1rem' : i % 3 === 1 ? '0.9rem' : '1rem',
                fontWeight: 700,
                letterSpacing: '-0.3px',
              }}>
                {name}
              </span>
            ))}
          </div>
        </main>

        {/* Футер */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <Footer white />
        </div>
      </div>
    </div>
  )
}
