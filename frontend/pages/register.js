import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Footer } from '../components/Header'

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  )
}

export default function Register() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function onChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError('please fill all fields')
      return
    }
    if (form.password !== form.confirm) {
      setError('passwords do not match')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://uniply-api.onrender.com'}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'registration failed')
      localStorage.setItem('token', data.token)
      localStorage.setItem('username', data.name || form.name)
      router.push('/home')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      {/* Хедер — только лого */}
      <header className="header">
        <Link href="/" className="header-logo">uniply</Link>
      </header>

      <main className="auth-body">
        {/* Email форма */}
        <form className="auth-form-card" onSubmit={handleSubmit}>
          <div className="auth-form-title">registration</div>

          <input
            className="auth-input"
            name="name"
            placeholder="your name"
            value={form.name}
            onChange={onChange}
            autoComplete="off"
          />
          <input
            className="auth-input"
            name="email"
            type="email"
            placeholder="email"
            value={form.email}
            onChange={onChange}
            autoComplete="off"
          />
          <input
            className="auth-input"
            name="password"
            type="password"
            placeholder="password"
            value={form.password}
            onChange={onChange}
          />
          <input
            className="auth-input"
            name="confirm"
            type="password"
            placeholder="confirm password"
            value={form.confirm}
            onChange={onChange}
          />

          {error && (
            <div style={{ color: '#e53935', fontSize: '0.85rem', marginBottom: 8, textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? 'creating...' : 'create an account'}
          </button>
        </form>

        {/* Google */}
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL || 'https://uniply-api.onrender.com'}/auth/google`}
          className="google-card"
        >
          <GoogleIcon />
          continue with Google
        </a>
      </main>

      <Footer />
    </div>
  )
}
