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
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: 'linear-gradient(135deg,#534AB7,#7C6FD4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 3px 10px rgba(83,74,183,0.35)',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 22 22" fill="none">
          <rect x="2" y="12" width="4" height="8" rx="1.5" fill="white" fillOpacity="0.5" />
          <rect x="8" y="7" width="4" height="13" rx="1.5" fill="white" fillOpacity="0.75" />
          <rect x="14" y="3" width="4" height="17" rx="1.5" fill="white" />
        </svg>
      </div>

      <div style={{ fontSize: 16, fontWeight: 700 }}>
        <span style={{ color: '#534AB7' }}>creator</span>
        <span style={{ color: '#111827' }}>insight</span>
      </div>
    </div>
  );
}

const PAGE_TITLES: Record<string, { title: string; sub: string }> = {
  '/dashboard': { title: 'Dashboard', sub: 'Overview of your growth' },
  '/analytics': { title: 'Analytics', sub: 'Track performance across platforms' },
  '/publish': { title: 'New post', sub: 'Create and publish across platforms' },
  '/ai-insights': { title: 'AI insights', sub: 'Smart recommendations for creators' },
  '/brand-collabs': { title: 'Brand collaborations', sub: 'Manage partnerships' },
  '/alerts': { title: 'Alerts', sub: 'Notifications about your content' },
  '/milestones': { title: 'Milestones', sub: 'Track achievements and goals' },
  '/profile': { title: 'Profile', sub: 'Manage account settings' },
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<any>(null);
  const [unread, setUnread] = useState(0);
  const [time, setTime] = useState(new Date());
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login');
      return;
    }

    loadUser();

    const clock = setInterval(() => setTime(new Date()), 1000);

    setParticles(
      Array.from({ length: 20 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 20 + 15,
        opacity: Math.random() * 0.12 + 0.04,
      }))
    );

    return () => clearInterval(clock);
  }, []);

  async function loadUser() {
    try {
      const [userRes, alertRes] = await Promise.all([
        authApi.me(),
        alertsApi.list(true),
      ]);

      setUser(userRes.data);
      setUnread(alertRes.data.length);
    } catch {}
  }

  const page = PAGE_TITLES[pathname] || { title: 'CreatorInsight', sub: '' };

  const timeStr = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const dateStr = time.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const initials = user?.full_name
    ? user.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'CI';

  return (
    <div className="flex min-h-screen" style={{ background: '#F4F3FB' }}>

      {/* Animated background */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {particles.map((p, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: p.x + '%',
              top: p.y + '%',
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: 'rgba(83,74,183,0.2)',
              opacity: p.opacity,
              animation: `rise ${p.speed}s linear infinite`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes rise {
          0% { transform: translateY(0); opacity:0 }
          10% { opacity:1 }
          100% { transform: translateY(-100px); opacity:0 }
        }
      `}</style>

      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <header
          style={{
            height: 70,
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(18px)',
            borderBottom: '1px solid rgba(83,74,183,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
          }}
        >
          <div>
            <Logo />
            <div style={{ fontSize: 12, color: '#6B7280' }}>{page.sub}</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>

            {/* Clock */}
            <div
              style={{
                background: '#F8F7FF',
                padding: '6px 12px',
                borderRadius: 10,
                border: '1px solid #E9E8FF',
                textAlign: 'right',
              }}
            >
              <div style={{ fontWeight: 700, color: '#534AB7' }}>{timeStr}</div>
              <div style={{ fontSize: 10, color: '#9CA3AF' }}>{dateStr}</div>
            </div>

            {/* Notifications */}
            <button
              onClick={() => router.push('/alerts')}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                border: '1px solid #E6E4FF',
                background: '#fff',
                position: 'relative',
                cursor: 'pointer',
              }}
            >
              🔔

              {unread > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    background: '#EF4444',
                    color: '#fff',
                    borderRadius: '50%',
                    fontSize: 10,
                    padding: '2px 6px',
                  }}
                >
                  {unread}
                </span>
              )}
            </button>

            {/* Publish */}
            <button
              onClick={() => router.push('/publish')}
              style={{
                padding: '8px 16px',
                background: 'linear-gradient(135deg,#534AB7,#7C6FD4)',
                border: 'none',
                borderRadius: 10,
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              + New Post
            </button>

            {/* Avatar */}
            <button
              onClick={() => router.push('/profile')}
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'linear-gradient(135deg,#534AB7,#7C6FD4)',
                border: 'none',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {initials}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>

      <Chatbot />
    </div>
  );
}