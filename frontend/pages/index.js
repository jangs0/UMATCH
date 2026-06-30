import Link from 'next/link'
import { LandingHeader, Footer } from '../components/Header'

// Логотипы вузов для карусели (текстовые плашки т.к. реальные лого требуют лицензий)
const UNI_NAMES = [
  'Harvard', 'Stanford', 'MIT', 'Yale', 'Princeton', 'Columbia',
  'UPenn', 'Brown', 'Dartmouth', 'Cornell', 'Duke', 'Northwestern',
  'Rice', 'Vanderbilt', 'Notre Dame', 'Georgetown', 'Emory', 'Tufts',
  'NYU', 'Boston University', 'Tulane', 'Case Western', 'Rochester',
  'Colby', 'Middlebury', 'Davidson', 'Denison', 'Richmond', 'Trinity',
  'Dickinson', 'Gettysburg', 'Muhlenberg', 'Ursinus', 'Elizabethtown',
  'Harvard', 'Stanford', 'MIT', 'Yale', 'Princeton', 'Columbia',
  'UPenn', 'Brown', 'Dartmouth', 'Cornell', 'Duke', 'Northwestern',
  'Rice', 'Vanderbilt', 'Notre Dame', 'Georgetown', 'Emory', 'Tufts',
]

function UniLogoCard({ name }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e8e8e8',
      borderRadius: 16,
      padding: '20px 28px',
      fontWeight: 700,
      fontSize: '0.95rem',
      whiteSpace: 'nowrap',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      color: '#0a0a0a',
    }}>
      {name}
    </div>
  )
}

function AdvantageCard({ title, desc }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e8e8e8',
      borderRadius: 20,
      padding: '28px 24px',
      flex: 1,
    }}>
      <div style={{ marginBottom: 12 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 32, height: 32, borderRadius: 8,
          background: '#f0f8f0', fontSize: '1rem',
        }}>🙂</span>
      </div>
      <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.5 }}>{desc}</div>
    </div>
  )
}

function UniShowcaseCard({ name, sub, desc }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e8e8e8',
      borderRadius: 20,
      padding: '28px 24px',
      flex: 1,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 12,
        background: '#f5f5f5',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 16, fontSize: '1.5rem',
      }}>🎓</div>
      <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 6 }}>{name}</div>
      {sub && <div style={{ fontSize: '0.82rem', color: '#888', lineHeight: 1.6 }}>{sub}</div>}
    </div>
  )
}

export default function Landing() {
  return (
    <div className="page">
      <LandingHeader />

      <main className="main">
        {/* Hero */}
        <section style={{ display: 'flex', alignItems: 'flex-start', gap: 48, padding: '40px 80px 60px' }}>
          <div style={{ flex: 1, paddingTop: 20 }}>
            <h1 style={{ fontSize: '3.2rem', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-1px', marginBottom: 20 }}>
              find your fit.<br />fund your future.
            </h1>
            <p style={{ fontSize: '1.05rem', fontWeight: 600, color: '#666' }}>
              the right choice for international<br />students, matched to who you are
            </p>
          </div>
          <div style={{ flex: 1 }}>
            <img
              src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=700&q=80"
              alt="university campus"
              style={{ width: '100%', borderRadius: 20, objectFit: 'cover', height: 300 }}
            />
          </div>
        </section>

        {/* Our advantages */}
        <section style={{ padding: '0 80px 60px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 6 }}>our advantages</h2>
          <p style={{ color: '#888', marginBottom: 32, fontSize: '0.95rem' }}>
            there are some points why you should work with us
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            <AdvantageCard
              title="we analyse, not just filter"
              desc="other platforms show you a list. uniply analyses your exact profile — grades, budget, citizenship — and matches universities that truly fit you"
            />
            <AdvantageCard
              title="built for international students"
              desc="we account for need-blind status and citizenship — the things that actually decide your grant chances. most tools don't"
            />
            <AdvantageCard
              title="real grant probability"
              desc="not just 'is it affordable' — your actual chance of funding based on who you are"
            />
          </div>
        </section>

        {/* Showcase cards (вместо реальных логотипов) */}
        <section style={{ padding: '0 80px 60px' }}>
          <div style={{ display: 'flex', gap: 20 }}>
            <UniShowcaseCard
              name="Pomona College"
              sub="need-aware for internationals · ~7% acceptance rate · full grant available for qualifying students"
            />
            <UniShowcaseCard
              name="Harvard University"
              sub="need-blind for internationals · ~4% acceptance rate · one of the most generous financial aid programs in the world"
            />
            <UniShowcaseCard
              name="University of Pennsylvania Wharton"
              sub="top undergraduate business school · need-aware for internationals · meets 100% of demonstrated need"
            />
          </div>
        </section>

        {/* Карусель вузов */}
        <section style={{ padding: '0 0 60px' }}>
          <div style={{ padding: '0 80px', marginBottom: 24 }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.2, maxWidth: 480 }}>
              we offer a gigantic number of colleges all across the USA
            </h2>
            <p style={{ color: '#888', marginTop: 8, fontSize: '0.95rem' }}>
              from Harvard to open-admission — 100 universities, one platform
            </p>
          </div>

          {/* Карусель — два ряда */}
          <div className="logo-carousel" style={{ marginBottom: 12 }}>
            <div className="logo-track">
              {UNI_NAMES.map((n, i) => <UniLogoCard key={i} name={n} />)}
            </div>
          </div>
          <div className="logo-carousel">
            <div className="logo-track" style={{ animationDirection: 'reverse' }}>
              {[...UNI_NAMES].reverse().map((n, i) => <UniLogoCard key={i} name={n} />)}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ display: 'flex', justifyContent: 'center', padding: '0 80px 80px' }}>
          <Link href="/register" style={{
            background: '#0a0a0a',
            color: '#fff',
            borderRadius: 16,
            padding: '28px 80px',
            fontSize: '1.5rem',
            fontWeight: 700,
            display: 'inline-block',
          }}>
            try it now
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  )
}
