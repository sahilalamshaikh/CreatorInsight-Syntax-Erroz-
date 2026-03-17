'use client';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { clearTokens } from '@/lib/auth';

function NavIcon({ label, color }: { label: string; color: string }) {
  const icons: Record<string, React.ReactNode> = {
    Dashboard: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <rect x="1" y="1" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="8.5" y="1" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="1" y="8.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      </svg>
    ),
    Analytics: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M1 11.5l3.5-4 3 2.5 3-5 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M1 14h13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
    Publish: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <rect x="1" y="4" width="13" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M5 4V3a2.5 2.5 0 0 1 5 0v1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        <path d="M7.5 8v3M6 9.5h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
    'AI insights': (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M5 7.5c0-1.38 1.12-2.5 2.5-2.5S10 6.12 10 7.5 8.88 10 7.5 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        <circle cx="7.5" cy="12" r="0.7" fill="currentColor"/>
      </svg>
    ),
    Alerts: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M7.5 1.5a5 5 0 0 1 5 5v3l1 2H1.5l1-2v-3a5 5 0 0 1 5-1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
        <path d="M6 11.5a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.3"/>
      </svg>
    ),
    'Brand collabs': (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M1 7.5h13M7.5 1l2 6.5-2 6.5M7.5 1L5.5 7.5l2 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    Profile: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="7.5" cy="5" r="3" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M1.5 13.5c0-3.31 2.69-5 6-5s6 1.69 6 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  };
  return (
    <span className="flex-shrink-0" style={{ color }}>
      {icons[label] ?? <span className="w-2 h-2 rounded-full block" style={{ background: color }} />}
    </span>
  );
}

const NAV = [
  { href: '/dashboard',     label: 'Dashboard',     color: '#534AB7' },
  { href: '/analytics',     label: 'Analytics',     color: '#1D9E75' },
  { href: '/publish',       label: 'Publish',       color: '#D85A30' },
  { href: '/ai-insights',   label: 'AI insights',   color: '#7F77DD' },
  { href: '/alerts',        label: 'Alerts',        color: '#BA7517' },
  { href: '/brand-collabs', label: 'Brand collabs', color: '#D4537E' },
  { href: '/profile',       label: 'Profile',       color: '#888780' },
];

export default function Sidebar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  function handleLogout() {
    clearTokens();
    router.push('/login');
  }

  return (
    <aside
      style={{
        width: collapsed ? 52 : 176,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(16px)',
        borderRight: '1px solid rgba(83,74,183,0.1)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        transition: 'width 0.2s',
        zIndex: 20,
      }}
    >
      {/* Logo + hamburger toggle */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        padding: collapsed ? '16px 0' : '0 14px',
        height: 64,
        borderBottom: '1px solid rgba(83,74,183,0.08)',
      }}>


        {/* Hamburger button */}
        <button
          onClick={() => setCollapsed(v => !v)}
          style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'transparent', border: 'none',
            cursor: 'pointer', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 4,
            padding: 0, flexShrink: 0,
          }}
          title={collapsed ? 'Expand' : 'Collapse'}
          onMouseEnter={e => e.currentTarget.style.background = '#F0EFF8'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          {/* Three lines */}
          <span style={{
            display: 'block',
            width: collapsed ? 14 : 16,
            height: 1.5,
            borderRadius: 2,
            background: '#534AB7',
            transition: 'all 0.2s',
          }} />
          <span style={{
            display: 'block',
            width: collapsed ? 10 : 16,
            height: 1.5,
            borderRadius: 2,
            background: '#534AB7',
            opacity: 0.6,
            transition: 'all 0.2s',
          }} />
          <span style={{
            display: 'block',
            width: collapsed ? 14 : 16,
            height: 1.5,
            borderRadius: 2,
            background: '#534AB7',
            transition: 'all 0.2s',
          }} />
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 0' }}>
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              title={collapsed ? item.label : undefined}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: collapsed ? 0 : 10,
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '10px 0' : '9px 16px',
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                color: active ? item.color : '#6B7280',
                background: active ? item.color + '12' : 'transparent',
                border: 'none',
                borderLeft: active ? `2px solid ${item.color}` : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s',
                textAlign: 'left',
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = '#F8F7FF';
                  e.currentTarget.style.color = item.color;
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#6B7280';
                }
              }}
            >
              <NavIcon label={item.label} color={active ? item.color : '#9CA3AF'} />
              {!collapsed && (
                <span style={{ transition: 'opacity 0.15s' }}>{item.label}</span>
              )}
              {/* Active dot indicator */}
              {active && !collapsed && (
                <span style={{
                  marginLeft: 'auto',
                  width: 5, height: 5,
                  borderRadius: '50%',
                  background: item.color,
                  flexShrink: 0,
                }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(83,74,183,0.08)', margin: '0 12px' }} />

      {/* User */}
      <div style={{
        padding: collapsed ? '12px 0' : '12px 14px',
        display: 'flex',
        flexDirection: collapsed ? 'column' : 'row',
        alignItems: 'center',
        gap: collapsed ? 8 : 10,
      }}>
        {collapsed ? (
          <>
            <button onClick={() => router.push('/profile')} title="Profile" style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg, #534AB7, #7C6FD4)',
              color: 'white', fontSize: 10, fontWeight: 700,
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              AK
            </button>
            <button onClick={handleLogout} title="Sign out" style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'transparent', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#9CA3AF',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#EF4444'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9CA3AF'; }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M5 11.5H2.5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1H5M9 9.5l3-3-3-3M12 6.5H5"
                  stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </>
        ) : (
          <>
            <button onClick={() => router.push('/profile')} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              flex: 1, background: 'none', border: 'none', cursor: 'pointer',
              padding: 0, textAlign: 'left',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'linear-gradient(135deg, #534AB7, #7C6FD4)',
                color: 'white', fontSize: 10, fontWeight: 700, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                AK
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1a2e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Alex Kim
                </div>
                <div style={{ fontSize: 10, color: '#9CA3AF' }}>Lifestyle</div>
              </div>
            </button>
            <button onClick={handleLogout} style={{
              width: 26, height: 26, borderRadius: 7,
              background: 'transparent', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#9CA3AF', flexShrink: 0,
            }}
              title="Sign out"
              onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#EF4444'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9CA3AF'; }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M5 11.5H2.5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1H5M9 9.5l3-3-3-3M12 6.5H5"
                  stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </>
        )}
      </div>
    </aside>
  );
}