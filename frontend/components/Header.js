import Link from 'next/link'
import { useRouter } from 'next/router'

// Иконка Instagram SVG
function IgIcon({ color = '#000' }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.8" fill={color} stroke="none"/>
    </svg>
  )
}

// Иконка Google SVG
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  )
}

// Лендинг-хедер: sign in, register now, enter via google
export function LandingHeader() {
  return (
    <header className="header">
      <Link href="/" className="header-logo">uniply</Link>
      <div className="header-auth">
        <Link href="/signin">sign in</Link>
        <Link href="/register">register now</Link>
        <Link href="/auth/google" className="google-btn">
          <GoogleIcon />
          enter via google
        </Link>
      </div>
    </header>
  )
}

// Внутренний хедер: home, saved list, profile
export function AppHeader({ white = false }) {
  const router = useRouter()
  const path = router.pathname

  const navClass = white ? 'header-nav header-nav-white' : 'header-nav'
  const logoClass = white ? 'header-logo header-logo-white' : 'header-logo'

  const isActive = (href) => path === href || path.startsWith(href + '/')

  return (
    <header className="header">
      <Link href="/home" className={logoClass}>uniply</Link>
      <nav className={navClass}>
        <Link href="/home" className={isActive('/home') ? 'active' : ''}>home</Link>
        <Link href="/saved" className={isActive('/saved') ? 'active' : ''}>saved list</Link>
        <Link href="/profile" className={isActive('/profile') ? 'active' : ''}>profile</Link>
      </nav>
    </header>
  )
}

// Футер — два варианта: светлый и белый (для страниц с градиентом)
export function Footer({ white = false }) {
  return (
    <footer className={white ? 'footer footer-white' : 'footer'}>
      <span>uniply · built by international applicants, for international applicants · 2026</span>
      <a href="https://instagram.com/uniply" target="_blank" rel="noopener noreferrer" className="footer-ig">
        <IgIcon color={white ? '#fff' : '#000'} />
      </a>
    </footer>
  )
}
