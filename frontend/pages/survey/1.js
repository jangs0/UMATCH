import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { AppHeader, Footer } from '../../components/Header'

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Argentina','Armenia','Australia','Austria','Azerbaijan',
  'Bangladesh','Belarus','Belgium','Bolivia','Bosnia','Brazil','Bulgaria','Cambodia','Canada',
  'Chile','China','Colombia','Croatia','Cuba','Czech Republic','Denmark','Ecuador','Egypt',
  'Estonia','Ethiopia','Finland','France','Georgia','Germany','Ghana','Greece','Guatemala',
  'Hungary','India','Indonesia','Iran','Iraq','Ireland','Israel','Italy','Japan','Jordan',
  'Kazakhstan','Kenya','Kosovo','Kuwait','Kyrgyzstan','Latvia','Lebanon','Lithuania',
  'Malaysia','Mexico','Moldova','Mongolia','Morocco','Myanmar','Nepal','Netherlands',
  'New Zealand','Nigeria','North Korea','Norway','Pakistan','Palestine','Panama','Paraguay',
  'Peru','Philippines','Poland','Portugal','Romania','Russia','Saudi Arabia','Serbia',
  'Singapore','Slovakia','Slovenia','South Africa','South Korea','Spain','Sri Lanka',
  'Sweden','Switzerland','Syria','Taiwan','Tajikistan','Tanzania','Thailand','Tunisia',
  'Turkey','Turkmenistan','Uganda','Ukraine','United Arab Emirates','United Kingdom',
  'United States','Uruguay','Uzbekistan','Venezuela','Vietnam','Yemen','Zimbabwe',
]

const MAJORS = [
  'Computer Science','Data Science','Mathematics','Statistics','Physics','Chemistry',
  'Biology','Biochemistry','Neuroscience','Psychology','Economics','Business Administration',
  'Finance','Accounting','Marketing','Entrepreneurship','Political Science','International Relations',
  'History','Philosophy','Sociology','Anthropology','Communication','Journalism','Media Studies',
  'English Literature','Linguistics','Education','Law (Pre-Law)','Medicine (Pre-Med)',
  'Nursing','Public Health','Environmental Science','Earth Science','Astronomy',
  'Electrical Engineering','Mechanical Engineering','Civil Engineering','Chemical Engineering',
  'Biomedical Engineering','Computer Engineering','Industrial Engineering','Architecture',
  'Urban Planning','Art & Design','Film & Media','Music','Theater','Dance',
  'Sports Science','Kinesiology','Social Work','Criminal Justice','Public Policy',
]

export default function Survey1() {
  const router = useRouter()
  const [citizenship, setCitizenship] = useState('')
  const [enrollmentYear, setEnrollmentYear] = useState('')
  const [majors, setMajors] = useState([])
  const [majorOpen, setMajorOpen] = useState(false)
  const [majorSearch, setMajorSearch] = useState('')

  useEffect(() => {
    // Загружаем сохранённые ответы если edit current
    const saved = localStorage.getItem('surveyAnswers')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        if (data.citizenship) setCitizenship(data.citizenship)
        if (data.enrollment_year) setEnrollmentYear(data.enrollment_year)
        if (data.majors) setMajors(data.majors)
      } catch {}
    }
  }, [])

  function toggleMajor(m) {
    if (majors.includes(m)) {
      setMajors(majors.filter(x => x !== m))
    } else if (majors.length < 3) {
      setMajors([...majors, m])
    }
  }

  function handleNext() {
    // Сохраняем в localStorage
    const existing = JSON.parse(localStorage.getItem('surveyAnswers') || '{}')
    localStorage.setItem('surveyAnswers', JSON.stringify({
      ...existing,
      citizenship,
      enrollment_year: enrollmentYear,
      majors,
    }))
    router.push('/survey/2')
  }

  const filteredMajors = MAJORS.filter(m =>
    m.toLowerCase().includes(majorSearch.toLowerCase())
  )

  return (
    <div className="survey-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      <main style={{ flex: 1, padding: '48px 48px 0' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, textAlign: 'center', marginBottom: 48 }}>
          step 1 out of 5 - basics
        </h1>

        {/* Citizenship */}
        <div className="survey-row">
          <div className="survey-row-label">
            <span>▼</span> citizenship
          </div>
          <div className="survey-row-sub">choose your <strong>citizenship</strong></div>
          <select
            value={citizenship}
            onChange={e => setCitizenship(e.target.value)}
          >
            <option value="">select country...</option>
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Enrollment year */}
        <div className="survey-row">
          <div className="survey-row-label">
            <span>▼</span> enrollment year
          </div>
          <div className="survey-row-sub">choose your <strong>enrollment year</strong></div>
          <select
            value={enrollmentYear}
            onChange={e => setEnrollmentYear(e.target.value)}
          >
            <option value="">select year...</option>
            <option value="fall 2026">fall 2026</option>
            <option value="fall 2027">fall 2027</option>
            <option value="fall 2028">fall 2028</option>
          </select>
        </div>

        {/* Major */}
        <div className="survey-row" style={{ position: 'relative' }}>
          <div className="survey-row-label">
            <span>◆</span> major
          </div>
          <div className="survey-row-sub">choose your major(s) (up to 3 options)</div>

          {/* Выбранные мэйджоры */}
          {majors.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
              {majors.map(m => (
                <span key={m} style={{
                  background: '#0a0a0a', color: '#fff',
                  borderRadius: 8, padding: '4px 12px',
                  fontSize: '0.85rem', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  {m}
                  <button
                    onClick={() => toggleMajor(m)}
                    style={{
                      color: '#fff', background: 'none', border: 'none',
                      cursor: 'pointer', fontSize: '0.9rem', lineHeight: 1,
                    }}
                  >×</button>
                </span>
              ))}
            </div>
          )}

          <input
            style={{ marginTop: 10 }}
            placeholder={majors.length >= 3 ? 'max 3 majors selected' : 'search major...'}
            value={majorSearch}
            onChange={e => { setMajorSearch(e.target.value); setMajorOpen(true) }}
            onFocus={() => setMajorOpen(true)}
            disabled={majors.length >= 3}
            className=""
            style={{
              width: '100%', marginTop: 10, padding: '10px 14px',
              border: '1.5px solid #e0e0e0', borderRadius: 10,
              fontSize: '0.95rem', background: '#fff', outline: 'none',
            }}
          />

          {majorOpen && majorSearch && (
            <div style={{
              position: 'absolute', left: 0, right: 0,
              background: '#fff', border: '1.5px solid #e0e0e0',
              borderRadius: 12, maxHeight: 220, overflowY: 'auto',
              zIndex: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              marginTop: 4,
            }}>
              {filteredMajors.slice(0, 20).map(m => (
                <div
                  key={m}
                  onClick={() => { toggleMajor(m); setMajorSearch(''); setMajorOpen(false) }}
                  style={{
                    padding: '10px 16px', cursor: 'pointer',
                    fontSize: '0.9rem',
                    background: majors.includes(m) ? '#f0f0f0' : '#fff',
                    fontWeight: majors.includes(m) ? 600 : 400,
                  }}
                  onMouseOver={e => e.currentTarget.style.background = '#f5f5f5'}
                  onMouseOut={e => e.currentTarget.style.background = majors.includes(m) ? '#f0f0f0' : '#fff'}
                >
                  {m} {majors.includes(m) ? '✓' : ''}
                </div>
              ))}
              {filteredMajors.length === 0 && (
                <div style={{ padding: '10px 16px', color: '#888', fontSize: '0.9rem' }}>no results</div>
              )}
            </div>
          )}
        </div>
      </main>

      <button className="next-btn" onClick={handleNext}>
        next step
      </button>

      <Footer />
    </div>
  )
}
