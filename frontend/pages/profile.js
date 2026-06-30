import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { AppHeader, Footer } from '../components/Header'

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Argentina','Armenia','Australia','Austria','Azerbaijan',
  'Bangladesh','Belarus','Belgium','Bolivia','Brazil','Bulgaria','Canada','Chile','China',
  'Colombia','Croatia','Czech Republic','Denmark','Ecuador','Egypt','Estonia','Finland',
  'France','Georgia','Germany','Ghana','Greece','Hungary','India','Indonesia','Iran',
  'Ireland','Israel','Italy','Japan','Jordan','Kazakhstan','Kenya','Latvia','Lebanon',
  'Lithuania','Malaysia','Mexico','Moldova','Mongolia','Morocco','Myanmar','Nepal',
  'Netherlands','New Zealand','Nigeria','Norway','Pakistan','Palestine','Peru','Philippines',
  'Poland','Portugal','Romania','Russia','Saudi Arabia','Serbia','Singapore','Slovakia',
  'Slovenia','South Africa','South Korea','Spain','Sri Lanka','Sweden','Switzerland',
  'Syria','Taiwan','Turkey','Turkmenistan','Ukraine','United Arab Emirates','United Kingdom',
  'United States','Uruguay','Uzbekistan','Venezuela','Vietnam','Zimbabwe',
]

const MAJORS = [
  'Computer Science','Data Science','Mathematics','Statistics','Physics','Chemistry',
  'Biology','Economics','Business Administration','Finance','Accounting','Marketing',
  'Entrepreneurship','Political Science','International Relations','History','Philosophy',
  'Sociology','Communication','Journalism','English Literature','Linguistics','Education',
  'Medicine (Pre-Med)','Nursing','Public Health','Environmental Science',
  'Electrical Engineering','Mechanical Engineering','Civil Engineering','Chemical Engineering',
  'Biomedical Engineering','Computer Engineering','Architecture','Art & Design',
  'Film & Media','Music','Theater','Sports Science','Social Work','Public Policy',
]

export default function Profile() {
  const router = useRouter()
  const [username, setUsername] = useState('username')
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState('')

  // Данные профиля
  const [data, setData] = useState({
    sat: 1560,
    gpa: 3.9,
    family_budget: 5,
    citizenship: 'Russia',
    enrollment_year: 'fall 2027',
    majors: ['marketing', 'business'],
  })

  // Какое поле редактируется
  const [editing, setEditing] = useState(null) // 'sat' | 'gpa' | 'family_budget' | 'citizenship' | 'enrollment_year' | 'majors'
  const [tempVal, setTempVal] = useState('')

  // Delete account
  const [deleteState, setDeleteState] = useState('idle') // idle | confirm
  const deleteTimerRef = useRef(null)

  useEffect(() => {
    const name = localStorage.getItem('username') || 'username'
    setUsername(name)
    const survey = localStorage.getItem('surveyAnswers')
    if (survey) {
      try {
        const d = JSON.parse(survey)
        setData(prev => ({
          sat: d.sat || prev.sat,
          gpa: d.gpa || prev.gpa,
          family_budget: d.family_budget || prev.family_budget,
          citizenship: d.citizenship || prev.citizenship,
          enrollment_year: d.enrollment_year || prev.enrollment_year,
          majors: d.majors || prev.majors,
        }))
      } catch {}
    }
  }, [])

  function startEdit(field) {
    setEditing(field)
    setTempVal(String(data[field]))
  }

  function commitEdit(field) {
    let val = tempVal
    if (field === 'sat') {
      val = Math.min(1600, Math.round(Number(val) / 10) * 10)
    } else if (field === 'gpa') {
      val = Math.min(4.0, Math.round(Number(val) * 10) / 10)
    } else if (field === 'family_budget') {
      let n = Number(val)
      n = Math.round(n / 5) * 5
      if (n > 80) n = 80 // stored as "80+" display
      val = n
    }
    setData(d => ({ ...d, [field]: val }))
    setEditing(null)

    // Обновляем localStorage
    const survey = JSON.parse(localStorage.getItem('surveyAnswers') || '{}')
    localStorage.setItem('surveyAnswers', JSON.stringify({ ...survey, [field]: val }))
  }

  function handleDeleteClick() {
    if (deleteState === 'idle') {
      setDeleteState('confirm')
      deleteTimerRef.current = setTimeout(() => {
        setDeleteState('idle')
      }, 5000)
    } else {
      // Второй клик в течение 5 сек — удаляем
      clearTimeout(deleteTimerRef.current)
      localStorage.clear()
      router.push('/')
    }
  }

  function formatBudget(v) {
    if (Number(v) >= 80) return '$80+k/yr'
    return `$${v}k/yr`
  }

  function DataBtn({ field, label, value }) {
    const isEditing = editing === field
    const isSelect = ['citizenship', 'enrollment_year', 'majors'].includes(field)

    if (isEditing && !isSelect) {
      return (
        <div style={{ position: 'relative' }}>
          <input
            autoFocus
            type="number"
            value={tempVal}
            onChange={e => setTempVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && commitEdit(field)}
            onBlur={() => commitEdit(field)}
            style={{
              width: '100%', padding: '16px 20px',
              background: 'rgba(255,255,255,0.25)',
              border: '1.5px solid rgba(255,255,255,0.6)',
              borderRadius: 14, color: '#fff',
              fontSize: '0.95rem', fontWeight: 600,
              outline: 'none',
            }}
          />
        </div>
      )
    }

    if (isEditing && field === 'citizenship') {
      return (
        <select
          autoFocus
          value={tempVal}
          onChange={e => { setTempVal(e.target.value); setData(d => ({ ...d, citizenship: e.target.value })); setEditing(null) }}
          style={{
            width: '100%', padding: '16px 20px',
            background: '#fff', border: '1.5px solid #e0e0e0',
            borderRadius: 14, fontSize: '0.95rem', fontWeight: 600,
          }}
        >
          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      )
    }

    if (isEditing && field === 'enrollment_year') {
      return (
        <select
          autoFocus
          value={tempVal}
          onChange={e => { setData(d => ({ ...d, enrollment_year: e.target.value })); setEditing(null) }}
          style={{
            width: '100%', padding: '16px 20px',
            background: '#fff', border: '1.5px solid #e0e0e0',
            borderRadius: 14, fontSize: '0.95rem', fontWeight: 600,
          }}
        >
          <option value="fall 2026">fall 2026</option>
          <option value="fall 2027">fall 2027</option>
          <option value="fall 2028">fall 2028</option>
        </select>
      )
    }
if (isEditing && field === 'majors') {
  const current = Array.isArray(data.majors) ? data.majors : []
  return (
    <div style={{
      background: '#fff', border: '1.5px solid #e0e0e0',
      borderRadius: 14, padding: '16px 20px',
      maxHeight: 220, overflowY: 'auto',
    }}>
      {MAJORS.map(m => (
        <div
          key={m}
          onClick={() => {
            const next = current.includes(m)
              ? current.filter(x => x !== m)
              : current.length < 3 ? [...current, m] : current
            setData(d => ({ ...d, majors: next }))
          }}
          style={{
            padding: '8px 12px', cursor: 'pointer',
            fontSize: '0.9rem', borderRadius: 8,
            background: current.includes(m) ? '#f0f0f0' : 'transparent',
            fontWeight: current.includes(m) ? 600 : 400,
            display: 'flex', justifyContent: 'space-between',
          }}
        >
          {m} {current.includes(m) ? '✓' : ''}
        </div>
      ))}
      <button
        onClick={() => setEditing(null)}
        style={{
          marginTop: 8, width: '100%', padding: '10px',
          background: '#0a0a0a', color: '#fff',
          border: 'none', borderRadius: 10,
          fontWeight: 600, cursor: 'pointer',
        }}
      >
        done
      </button>
    </div>
  )
}
    return (
      <button className="profile-data-btn" onClick={() => startEdit(field)}>
        <span style={{
          width: 10, height: 10, borderRadius: '50%',
          background: 'rgba(255,255,255,0.5)', flexShrink: 0,
          display: 'inline-block',
        }} />
        {label}: <strong>{value}</strong>
      </button>
    )
  }

  return (
    <div className="gradient-profile" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <AppHeader white />
      </div>

      <main style={{
        flex: 1, position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', padding: '48px',
      }}>
        {/* Username */}
        <h1 style={{
          fontSize: '3rem', fontWeight: 800,
          color: '#fff', marginBottom: 48,
        }}>
          {username}
        </h1>

        {/* your data */}
        <div style={{ width: '100%', maxWidth: 700 }}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: 2 }}>
  your data
</h2>
<div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
  click to change
</div>
          </div>

          <div className="profile-data-grid">
            <DataBtn field="sat" label="SAT" value={`${data.sat}/1600`} />
            <DataBtn field="citizenship" label="citizenship" value={data.citizenship} />
            <DataBtn field="gpa" label="GPA" value={`${data.gpa}/4.0`} />
            <DataBtn field="enrollment_year" label="enrollment year" value={data.enrollment_year} />
            <DataBtn field="family_budget" label="family budget" value={formatBudget(data.family_budget)} />
            <DataBtn
              field="majors"
              label="majors"
              value={Array.isArray(data.majors) ? data.majors.join(', ') : data.majors}
            />
          </div>

          {/* edit name / link Google */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24 }}>
            {editingName ? (
              <input
                autoFocus
                value={newName}
                placeholder={username}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={async e => {
  if (e.key === 'Enter' && newName.trim()) {
    const trimmed = newName.trim()
    setUsername(trimmed)
    localStorage.setItem('username', trimmed)
    setEditingName(false)
    setNewName('')

    const token = localStorage.getItem('token')
    if (token) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://uniply-api.onrender.com'}/profile`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: trimmed }),
        })
      } catch (err) {
        console.error('failed to update name', err)
      }
    }
  }
                }}
                style={{
                  padding: '10px 20px', borderRadius: 12,
                  border: '1.5px solid rgba(255,255,255,0.5)',
                  background: 'rgba(255,255,255,0.15)',
                  color: '#fff', fontWeight: 600, fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
            ) : (
              <button
                onClick={() => setEditingName(true)}
                style={{
                  padding: '10px 24px', borderRadius: 12,
                  border: '1.5px solid rgba(255,255,255,0.6)',
                  background: '#fff', color: '#0a0a0a',
                  fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
                }}
              >
                edit name
              </button>
            )}

            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || 'https://uniply-api.onrender.com'}/auth/google`}
              style={{
                padding: '10px 24px', borderRadius: 12,
                border: '1.5px solid rgba(255,255,255,0.6)',
                background: '#fff', color: '#0a0a0a',
                fontWeight: 600, fontSize: '0.9rem',
                display: 'inline-flex', alignItems: 'center',
              }}
            >
              link Google account
            </a>
          </div>

          {/* Delete account */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={handleDeleteClick}
              style={{
                padding: '10px 28px', borderRadius: 12,
                border: '1.5px solid rgba(255,255,255,0.5)',
                background: deleteState === 'confirm' ? '#e53935' : '#fff',
                color: deleteState === 'confirm' ? '#fff' : '#0a0a0a',
                fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
                transition: 'all 0.2s',
              }}
            >
              {deleteState === 'confirm' ? 'are you sure?' : 'delete an account'}
            </button>
          </div>
        </div>
      </main>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Footer white />
      </div>
    </div>
  )
}
