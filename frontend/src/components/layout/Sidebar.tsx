'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { clearTokens } from '@/lib/auth'

function NavIcon({ label, color }: { label: string; color: string }) {
  const icons: Record<string, React.ReactNode> = {

    Dashboard: (
      <svg width="16" height="16" viewBox="0 0 15 15" fill="none">
        <rect x="1" y="1" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="8.5" y="1" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="1" y="8.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      </svg>
    ),

    Analytics: (
      <svg width="16" height="16" viewBox="0 0 15 15" fill="none">
        <path d="M1 11.5l3.5-4 3 2.5 3-5 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M1 14h13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),

    Publish: (
      <svg width="16" height="16" viewBox="0 0 15 15" fill="none">
        <rect x="1" y="4" width="13" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M5 4V3a2.5 2.5 0 0 1 5 0v1" stroke="currentColor" strokeWidth="1.3"/>
      </svg>
    ),

    Alerts: (
      <svg width="16" height="16" viewBox="0 0 15 15" fill="none">
        <path d="M7.5 1.5a5 5 0 0 1 5 5v3l1 2H1.5l1-2v-3a5 5 0 0 1 5-1z"
          stroke="currentColor" strokeWidth="1.3"/>
      </svg>
    ),

    Profile: (
      <svg width="16" height="16" viewBox="0 0 15 15" fill="none">
        <circle cx="7.5" cy="5" r="3" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M1.5 13.5c0-3.31 2.69-5 6-5s6 1.69 6 5"
          stroke="currentColor" strokeWidth="1.3"/>
      </svg>
    ),

  }

  return (
    <span style={{ color }}>
      {icons[label] ?? <div style={{ width: 6, height: 6, borderRadius: 999, background: color }} />}
    </span>
  )
}

const NAV = [
  { href: '/dashboard', label: 'Dashboard', color: '#534AB7' },
  { href: '/analytics', label: 'Analytics', color: '#1D9E75' },
  { href: '/publish', label: 'Publish', color: '#D85A30' },
  { href: '/ai-insights', label: 'AI insights', color: '#7F77DD' },
  { href: '/alerts', label: 'Alerts', color: '#BA7517' },
  { href: '/brand-collabs', label: 'Brand collabs', color: '#D4537E' },
  { href: '/profile', label: 'Profile', color: '#888780' },
]

export default function Sidebar() {

  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  function handleLogout() {
    clearTokens()
    router.push('/login')
  }

  return (

    <aside
      style={{
        width: collapsed ? 64 : 200,
        transition: 'all .25s',
        background: 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(0,0,0,0.06)',
        height: '100vh',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column'
      }}
    >

      {/* Toggle */}
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-end',
          padding: '0 16px'
        }}
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            border: 'none',
            background: '#F4F3FB',
            cursor: 'pointer'
          }}
        >
          ☰
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1 }}>

        {NAV.map(item => {

          const active = pathname === item.href

          return (

            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: collapsed ? 0 : 12,
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '12px 0' : '10px 18px',
                background: active ? item.color + '14' : 'transparent',
                color: active ? item.color : '#6B7280',
                border: 'none',
                borderLeft: active ? `3px solid ${item.color}` : '3px solid transparent',
                cursor: 'pointer',
                fontWeight: active ? 600 : 500
              }}
            >

              <NavIcon label={item.label} color={active ? item.color : '#9CA3AF'} />

              {!collapsed && (
                <span>{item.label}</span>
              )}

            </button>

          )
        })}

      </nav>

      {/* User */}
      <div
        style={{
          padding: 16,
          borderTop: '1px solid rgba(0,0,0,0.06)'
        }}
      >

        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: 8,
            border: 'none',
            background: '#FEE2E2',
            color: '#B91C1C',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>

      </div>

    </aside>

  )
}