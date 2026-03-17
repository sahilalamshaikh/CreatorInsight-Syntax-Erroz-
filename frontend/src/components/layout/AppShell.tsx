'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isLoggedIn } from '@/lib/auth';
import Sidebar from './Sidebar';
import Chatbot from '@/components/ui/Chatbot';
import { authApi, alertsApi } from '@/lib/api';

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: 'linear-gradient(135deg, #534AB7 0%, #7C6FD4 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(83,74,183,0.35)',
        flexShrink: 0,
      }}>
        <svg width="16" height="16" viewBox="0 0 22 22" fill="none">
          <rect x="2" y="12" width="4" height="8" rx="1.5" fill="white" fillOpacity="0.5"/>
          <rect x="8" y="7" width="4" height="13" rx="1.5" fill="white" fillOpacity="0.75"/>
          <rect x="14" y="3" width="4" height="17" rx="1.5" fill="white"/>
          <circle cx="18" cy="2" r="2" fill="#A5F3FC"/>
          <path d="M3 11 L9 7 L15 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1.5 1.5"/>
        </svg>
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.4px' }}>
        <span style={{ color: '#534AB7' }}>creator</span>
        <span style={{ color: '#1a1a2e' }}>insight</span>
      </div>
    </div>
  );
}

const PAGE_TITLES: Record<string, { title: string; sub: string }> = {
  '/dashboard': { title: 'Dashboard', sub: 'Welcome back — here\'s your growth at a glance' },
  '/analytics': { title: 'Analytics', sub: 'Track your performance across every platform' },
  '/publish': { title: 'New post', sub: 'Create and publish across all your platforms' },
  '/ai-insights': { title: 'AI insights', sub: 'Score captions and discover what works' },
  '/brand-collabs': { title: 'Brand collaborations', sub: 'Manage your deals and discover new brand partners' },
  '/alerts': { title: 'Alerts', sub: 'Real-time notifications about your content' },
  '/milestones': { title: 'Milestones', sub: 'Track your goals and celebrate achievements' },
  '/profile': { title: 'Profile', sub: 'Manage your account and connected platforms' },
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [unread, setUnread] = useState(0);
  const [time, setTime] = useState(new Date());
  const [particles, setParticles] = useState<{ x: number; y: number; size: number; speed: number; opacity: number; hue: number }[]>([]);

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    loadUser();
    // tick clock
    const clock = setInterval(() => setTime(new Date()), 1000);
    // generate particles once
    setParticles(Array.from({ length: 18 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 20 + 15,
      opacity: Math.random() * 0.12 + 0.04,
      hue: Math.random() > 0.5 ? 250 : 280,
    })));
    return () => clearInterval(clock);
  }, [router]);

  async function loadUser() {
    try {
      const [userRes, alertRes] = await Promise.all([
        authApi.me(),
        alertsApi.list(true),
      ]);
      setUser(userRes.data);
      setUnread(alertRes.data.length);
    } catch { }
  }

  const page = PAGE_TITLES[pathname] || { title: 'CreatorInsight', sub: '' };

  const hour = time.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AK';

  return (
    <div className="flex min-h-screen" style={{ background: '#F4F3FB' }}>

      {/* ── Animated background ── */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none',
      }}>
        {/* Gradient blobs */}
        <div style={{
          position: 'absolute', top: '-20%', right: '-10%',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(83,74,183,0.08) 0%, transparent 70%)',
          animation: 'float1 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '-15%', left: '10%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,111,212,0.06) 0%, transparent 70%)',
          animation: 'float2 10s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', top: '40%', left: '30%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,83,126,0.04) 0%, transparent 70%)',
          animation: 'float3 12s ease-in-out infinite',
        }} />

        {/* Floating particles */}
        {particles.map((p, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: p.x + '%',
            top: p.y + '%',
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: `hsla(${p.hue}, 60%, 60%, ${p.opacity})`,
            animation: `rise ${p.speed}s linear infinite`,
            animationDelay: `-${Math.random() * p.speed}s`,
          }} />
        ))}

        {/* Subtle grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(83,74,183,0.06) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />
      </div>

      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(-30px, 20px) scale(1.05); }
          66%       { transform: translate(20px, -15px) scale(0.95); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(40px, -30px) scale(1.08); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0); }
          25%       { transform: translate(-20px, 20px); }
          75%       { transform: translate(20px, -10px); }
        }
        @keyframes rise {
          0%   { transform: translateY(0px);    opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(-80px);  opacity: 0; }
        }
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1);   opacity: 1; }
          50%       { transform: scale(1.4); opacity: 0.6; }
        }
      `}</style>

      {/* ── Sidebar ── */}
      <div style={{ position: 'relative', zIndex: 20 }}>
        <Sidebar />
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ position: 'relative', zIndex: 10 }}>

        {/* ── Top header ── */}
        <header style={{
          height: 64,
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(83,74,183,0.1)',
          display: 'flex', alignItems: 'center',
          padding: '0 24px',
          gap: 16,
          position: 'sticky', top: 0, zIndex: 30,
          boxShadow: '0 1px 24px rgba(83,74,183,0.06)',
        }}>

          {/* Page title */}
          <div className="flex-1">
            <Logo />
          </div>

          {/* Live clock */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
            padding: '6px 14px', background: '#F8F7FF',
            borderRadius: 10, border: '1px solid #EEEDFE',
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#534AB7', fontVariantNumeric: 'tabular-nums' }}>
              {timeStr}
            </div>
            <div style={{ fontSize: 10, color: '#9CA3AF' }}>{dateStr}</div>
          </div>

          {/* Quick stats pills */}
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', background: '#EAF3DE',
              borderRadius: 20, border: '1px solid #C6E3A0',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1D9E75', display: 'inline-block', animation: 'pulse-dot 2s ease-in-out infinite' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#27500A' }}>80.2K followers</span>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', background: '#EEEDFE',
              borderRadius: 20, border: '1px solid #C4BFEF',
            }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#3C3489' }}>4.7% eng</span>
            </div>
          </div>

          {/* Notifications */}
          <button
            onClick={() => router.push('/alerts')}
            style={{
              position: 'relative', width: 38, height: 38,
              borderRadius: 10, background: '#F8F7FF',
              border: '1px solid #EEEDFE', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1.5a4.5 4.5 0 0 1 4.5 4.5v2.5l1 2H2.5l1-2V6A4.5 4.5 0 0 1 8 1.5z" stroke="#534AB7" strokeWidth="1.3" strokeLinejoin="round" />
              <path d="M6.5 11.5a1.5 1.5 0 0 0 3 0" stroke="#534AB7" strokeWidth="1.3" />
            </svg>
            {unread > 0 && (
              <div style={{
                position: 'absolute', top: -4, right: -4,
                width: 16, height: 16, borderRadius: '50%',
                background: '#D85A30', color: 'white',
                fontSize: 9, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid white',
              }}>
                {unread > 9 ? '9+' : unread}
              </div>
            )}
          </button>

          {/* Quick publish */}
          <button
            onClick={() => router.push('/publish')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', background: '#534AB7',
              borderRadius: 10, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, color: 'white',
              boxShadow: '0 2px 8px rgba(83,74,183,0.3)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v10M1 6h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
            New post
          </button>

          {/* Avatar */}
          <button
            onClick={() => router.push('/profile')}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #534AB7, #7C6FD4)',
              color: 'white', fontSize: 12, fontWeight: 700,
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(83,74,183,0.3)',
            }}
          >
            {initials}
          </button>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      <Chatbot />
    </div>
  );
}