'use client';
import { useRouter } from 'next/navigation';
import { isLoggedIn } from '@/lib/auth';
import { useEffect, useState } from 'react';

function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: { icon: 28, text: 15 }, md: { icon: 36, text: 18 }, lg: { icon: 48, text: 24 } };
  const s = sizes[size];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {/* Icon mark */}
      <div style={{
        width: s.icon, height: s.icon, borderRadius: s.icon * 0.28,
        background: 'linear-gradient(135deg, #534AB7 0%, #7C6FD4 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(83,74,183,0.35)',
        flexShrink: 0,
      }}>
        <svg width={s.icon * 0.58} height={s.icon * 0.58} viewBox="0 0 22 22" fill="none">
          {/* Chart bars */}
          <rect x="2" y="12" width="4" height="8" rx="1.5" fill="white" fillOpacity="0.5"/>
          <rect x="8" y="7" width="4" height="13" rx="1.5" fill="white" fillOpacity="0.75"/>
          <rect x="14" y="3" width="4" height="17" rx="1.5" fill="white"/>
          {/* Sparkle dot */}
          <circle cx="18" cy="2" r="2" fill="#A5F3FC"/>
          {/* Trend line */}
          <path d="M3 11 L9 7 L15 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1.5 1.5"/>
        </svg>
      </div>
      {/* Wordmark */}
      <div style={{ fontSize: s.text, fontWeight: 700, letterSpacing: '-0.4px', lineHeight: 1 }}>
        <span style={{ color: '#534AB7' }}>creator</span>
        <span style={{ color: '#1a1a2e' }}>insight</span>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) router.push('/dashboard');
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [router]);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: '#FAFAFA', minHeight: '100vh' }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', height: 66,
        background: scrolled ? 'rgba(255,255,255,0.96)' : 'white',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #F0EFF8',
        transition: 'all 0.2s',
      }}>
        <Logo size="sm" />
        <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {[
            { label: 'Features', id: 'features' },
            { label: 'Pricing',  id: 'pricing'  },
            { label: 'Blog',     id: 'blog'      },
          ].map(item => (
            <button key={item.label} onClick={() => scrollTo(item.id)} style={{
              background: 'none', border: 'none', fontSize: 14,
              color: '#6B7280', cursor: 'pointer', padding: '8px 14px',
              borderRadius: 8, fontWeight: 500,
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.color = '#1a1a2e'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#6B7280'; }}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => router.push('/login')} style={{
            background: 'none', border: '1px solid #E5E7EB',
            borderRadius: 8, padding: '8px 18px', fontSize: 13,
            color: '#374151', cursor: 'pointer', fontWeight: 500,
          }}>Log in</button>
          <button onClick={() => router.push('/register')} style={{
            background: '#534AB7', border: 'none',
            borderRadius: 8, padding: '8px 20px', fontSize: 13,
            color: 'white', cursor: 'pointer', fontWeight: 600,
            boxShadow: '0 2px 8px rgba(83,74,183,0.3)',
          }}>Get started free</button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        textAlign: 'center',
        padding: '100px 24px 80px',
        background: 'linear-gradient(180deg, #F0EFF8 0%, #FAFAFA 100%)',
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: '#EEEDFE', border: '1px solid #C4BFEF',
          borderRadius: 100, padding: '6px 16px',
          fontSize: 12, color: '#534AB7', fontWeight: 500, marginBottom: 28,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#534AB7', display: 'inline-block', boxShadow: '0 0 0 3px rgba(83,74,183,0.2)' }} />
          AI-powered growth for creators · Free to start
        </div>

        <h1 style={{
          fontSize: 60, fontWeight: 800, lineHeight: 1.1,
          letterSpacing: '-2px', margin: '0 auto 20px', maxWidth: 720, color: '#1a1a2e',
        }}>
          Grow your audience<br />
          <span style={{ color: '#534AB7' }}>10× faster</span> with AI
        </h1>

        <p style={{
          fontSize: 18, color: '#6B7280', maxWidth: 500,
          margin: '0 auto 44px', lineHeight: 1.75,
        }}>
          Real-time analytics, AI caption scoring, brand deal management,
          and a 24/7 AI assistant — built for small creators ready to scale.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
          <button onClick={() => router.push('/register')} style={{
            background: '#534AB7', color: 'white', border: 'none',
            borderRadius: 10, padding: '14px 36px', fontSize: 15,
            fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(83,74,183,0.35)',
          }}>
            Start for free →
          </button>
          <button onClick={() => router.push('/login')} style={{
            background: 'white', color: '#374151',
            border: '1.5px solid #E5E7EB', borderRadius: 10,
            padding: '14px 36px', fontSize: 15, fontWeight: 600, cursor: 'pointer',
          }}>
            View demo
          </button>
        </div>

        <p style={{ fontSize: 12, color: '#9CA3AF' }}>
          No credit card required · Join 10,000+ creators
        </p>

        {/* App mockup */}
        <div style={{
          margin: '60px auto 0', maxWidth: 880,
          background: 'white', borderRadius: 18,
          border: '1px solid #E5E4F5',
          boxShadow: '0 24px 64px rgba(83,74,183,0.12)',
          overflow: 'hidden',
        }}>
          <div style={{
            background: '#F3F2FB', borderBottom: '1px solid #E5E4F5',
            padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {['#F87171','#FBBF24','#34D399'].map(c => (
              <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
            ))}
            <div style={{
              flex: 1, maxWidth: 280, margin: '0 auto',
              background: 'white', borderRadius: 6,
              padding: '4px 12px', fontSize: 11, color: '#9CA3AF',
              border: '1px solid #E5E7EB',
            }}>
              app.creatorinsight.io/dashboard
            </div>
          </div>
          <div style={{ display: 'flex', height: 400 }}>
            {/* Sidebar */}
            <div style={{ width: 168, background: 'white', borderRight: '1px solid #F0EFF8', padding: '16px 0' }}>
              <div style={{ padding: '0 14px 14px' }}>
                <Logo size="sm" />
              </div>
              {[
                ['Dashboard',    '#534AB7', true ],
                ['Analytics',    '#1D9E75', false],
                ['Publish',      '#D85A30', false],
                ['AI insights',  '#7F77DD', false],
                ['Brand collabs','#D4537E', false],
                ['Alerts',       '#BA7517', false],
              ].map(([label, color, active]) => (
                <div key={label as string} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 14px', fontSize: 12,
                  background: active ? '#F0EFF8' : 'transparent',
                  color: active ? '#534AB7' : '#9CA3AF',
                  fontWeight: active ? 600 : 400,
                  borderLeft: active ? '2px solid #534AB7' : '2px solid transparent',
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: color as string, flexShrink: 0 }} />
                  {label}
                </div>
              ))}
              <div style={{ marginTop: 'auto', padding: '12px 14px', position: 'absolute', bottom: 0 }}>
              </div>
            </div>
            {/* Main */}
            <div style={{ flex: 1, padding: 22, background: '#F8F8FC', overflowY: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 18, color: '#1a1a2e' }}>
                Good morning, Alex 👋
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
                {[
                  ['80.2K', '↑ +1,240', 'Followers',   '#534AB7'],
                  ['4.7%',  '↑ +0.3%',  'Engagement',  '#1D9E75'],
                  ['312K',  '↑ +18%',   'Impressions', '#D85A30'],
                  ['91/100','⚡ AI score','Top post',    '#BA7517'],
                ].map(([val, delta, label, color]) => (
                  <div key={label as string} style={{
                    background: 'white', borderRadius: 12, padding: '10px 12px',
                    border: '1px solid #F0EFF8',
                  }}>
                    <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 3 }}>{label}</div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: color as string }}>{val}</div>
                    <div style={{ fontSize: 10, color: '#6B7280', marginTop: 2 }}>{delta}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
                <div style={{
                  background: 'white', borderRadius: 12, padding: '14px 16px',
                  border: '1px solid #F0EFF8',
                }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', marginBottom: 12, letterSpacing: '0.05em' }}>
                    ENGAGEMENT — 7 DAYS
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 90 }}>
                    {[45,68,52,80,72,95,78].map((h, i) => (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{
                          width: '100%', borderRadius: 4,
                          background: i === 5 ? '#534AB7' : '#EEEDFE',
                          height: h + '%', transition: 'height 0.3s',
                        }} />
                        <div style={{ fontSize: 9, color: '#C4C4C4' }}>
                          {['M','T','W','T','F','S','S'][i]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{
                  background: 'white', borderRadius: 12, padding: '14px 16px',
                  border: '1px solid #F0EFF8',
                }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', marginBottom: 12, letterSpacing: '0.05em' }}>
                    AI SCORE
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      ['Caption',  91, '#534AB7'],
                      ['Hashtags', 78, '#1D9E75'],
                      ['Timing',   85, '#D85A30'],
                    ].map(([label, pct, color]) => (
                      <div key={label as string}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 3 }}>
                          <span style={{ color: '#6B7280' }}>{label}</span>
                          <span style={{ fontWeight: 600, color: color as string }}>{pct}</span>
                        </div>
                        <div style={{ height: 4, background: '#F3F4F6', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: color as string, width: pct + '%', borderRadius: 2 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section style={{
        background: '#534AB7', padding: '44px 48px',
        display: 'flex', justifyContent: 'center', gap: 80, flexWrap: 'wrap',
      }}>
        {[
          ['10,000+', 'Active creators'],
          ['4.7%',    'Avg engagement lift'],
          ['80K',     'Avg followers tracked'],
          ['$2.4M',   'Brand deals managed'],
        ].map(([val, label]) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: 'white', letterSpacing: '-1px' }}>{val}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ padding: '100px 48px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{
              display: 'inline-block', background: '#EEEDFE',
              border: '1px solid #C4BFEF', borderRadius: 100,
              padding: '5px 14px', fontSize: 12, color: '#534AB7', fontWeight: 500, marginBottom: 16,
            }}>Features</div>
            <h2 style={{ fontSize: 40, fontWeight: 800, color: '#1a1a2e', letterSpacing: '-1.5px', marginBottom: 12 }}>
              Everything a creator needs
            </h2>
            <p style={{ fontSize: 16, color: '#6B7280', maxWidth: 440, margin: '0 auto', lineHeight: 1.75 }}>
              Stop juggling 10 tools. CreatorInsight is your complete creator OS.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {[
              { icon: '📊', bg: '#EEEDFE', tc: '#534AB7', title: 'Unified analytics',      desc: 'All platform stats in one place. Track followers, engagement, reach and impressions across Instagram, YouTube, TikTok and more.' },
              { icon: '🤖', bg: '#E1F5EE', tc: '#1D9E75', title: 'AI caption scoring',     desc: 'Type a caption, get a real AI score in 2 seconds with specific, actionable suggestions powered by Groq Llama 3.3.' },
              { icon: '🚀', bg: '#FAECE7', tc: '#D85A30', title: 'Multi-platform publish', desc: 'Write once. Publish to 5 platforms simultaneously. Content auto-adapts to each platform\'s format requirements.' },
              { icon: '🤝', bg: '#FBEAF0', tc: '#D4537E', title: 'Brand deal pipeline',   desc: 'Full Kanban pipeline from prospect to payment. AI matches you with brands that fit your niche and audience.' },
              { icon: '🔔', bg: '#FAEEDA', tc: '#BA7517', title: 'Real-time alerts',      desc: 'Get notified when a post goes viral, engagement drops, or a trending hashtag hits your niche. Never miss a moment.' },
              { icon: '💬', bg: '#E6F1FB', tc: '#378ADD', title: 'AI growth assistant',   desc: 'A 24/7 AI that knows your niche, your audience, your goals. Ask it anything — captions, strategy, brand pitches.' },
            ].map(f => (
              <div key={f.title} style={{
                background: 'white', borderRadius: 16, padding: 28,
                border: '1px solid #F0EFF8',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(83,74,183,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 14, background: f.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, marginBottom: 16,
                }}>{f.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e', marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.75 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ background: '#F0EFF8', padding: '100px 48px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-block', background: 'white',
            border: '1px solid #E5E4F5', borderRadius: 100,
            padding: '5px 14px', fontSize: 12, color: '#534AB7', fontWeight: 500, marginBottom: 16,
          }}>How it works</div>
          <h2 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-1.5px', color: '#1a1a2e', marginBottom: 12 }}>
            Up and running in 2 minutes
          </h2>
          <p style={{ fontSize: 16, color: '#6B7280', marginBottom: 64, lineHeight: 1.75 }}>
            No complex setup. No technical knowledge. Just sign up and start.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32, position: 'relative' }}>
            <div style={{
              position: 'absolute', top: 28, left: '22%', right: '22%',
              height: 1, background: 'linear-gradient(90deg, #C4BFEF, #D4B8F0)',
            }} />
            {[
              { step: '01', title: 'Create account',    desc: 'Sign up free in 30 seconds. No credit card required. Pick your niche and set your goals.' },
              { step: '02', title: 'Connect platforms',  desc: 'Link your Instagram, TikTok, YouTube and more. Analytics sync automatically.' },
              { step: '03', title: 'Start growing',      desc: 'Get AI insights, score your captions, manage brand deals, and watch your audience grow.' },
            ].map((s, i) => (
              <div key={s.step} style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: i === 0 ? '#534AB7' : i === 1 ? '#7C6FD4' : '#D4537E',
                  color: 'white', fontSize: 15, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                  boxShadow: `0 4px 16px ${i === 0 ? 'rgba(83,74,183,0.35)' : i === 1 ? 'rgba(124,111,212,0.35)' : 'rgba(212,83,126,0.35)'}`,
                }}>
                  {s.step}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e', marginBottom: 10 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.75 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ padding: '100px 48px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{
              display: 'inline-block', background: '#FEF3C7',
              border: '1px solid #FDE68A', borderRadius: 100,
              padding: '5px 14px', fontSize: 12, color: '#D97706', fontWeight: 500, marginBottom: 16,
            }}>Creator stories</div>
            <h2 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-1.5px', color: '#1a1a2e' }}>
              Real creators. Real results.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {[
              { name: 'Sarah K.',  handle: '@sarahwellness', followers: '42K',  niche: 'Wellness',  color: '#534AB7', bg: '#EEEDFE', quote: 'My engagement went from 2.1% to 5.8% in 3 weeks. The AI caption scoring is insanely accurate — it knows exactly what my audience responds to.' },
              { name: 'Marcus T.', handle: '@marcustech',    followers: '128K', niche: 'Tech',      color: '#1D9E75', bg: '#E1F5EE', quote: 'Closed 3 brand deals last month I would have completely missed. The pipeline shows me exactly where every deal stands at all times.' },
              { name: 'Priya M.',  handle: '@priyalife',     followers: '67K',  niche: 'Lifestyle', color: '#D4537E', bg: '#FBEAF0', quote: 'I used to post blindly. Now I know exactly when to post, what to write, and which brands to pitch. It\'s like having a personal manager.' },
            ].map(t => (
              <div key={t.name} style={{
                background: 'white', borderRadius: 20, padding: 28,
                border: '1px solid #F0EFF8', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', gap: 1, marginBottom: 16 }}>
                  {[1,2,3,4,5].map(i => <span key={i} style={{ color: '#FBBF24', fontSize: 15 }}>★</span>)}
                </div>
                <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, marginBottom: 20, fontStyle: 'italic' }}>
                  "{t.quote}"
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: t.bg, color: t.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, flexShrink: 0,
                  }}>
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e' }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>{t.handle} · {t.followers} · {t.niche}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Blog ── */}
      <section id="blog" style={{ background: '#F0EFF8', padding: '100px 48px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}>
            <div>
              <div style={{
                display: 'inline-block', background: 'white',
                border: '1px solid #E5E4F5', borderRadius: 100,
                padding: '5px 14px', fontSize: 12, color: '#534AB7', fontWeight: 500, marginBottom: 14,
              }}>Resources</div>
              <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1px', color: '#1a1a2e' }}>
                Creator playbook
              </h2>
            </div>
            <button onClick={() => router.push('/register')} style={{
              background: 'white', border: '1px solid #E5E4F5',
              borderRadius: 8, padding: '10px 20px',
              fontSize: 13, color: '#534AB7', cursor: 'pointer', fontWeight: 600,
            }}>
              View all articles →
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {[
              { tag: 'Growth',  tagC: '#534AB7', tagBg: '#EEEDFE', emoji: '📈', title: 'How to go from 0 to 10K followers in 90 days',   date: 'Mar 10, 2025', read: '5 min read' },
              { tag: 'Money',   tagC: '#1D9E75', tagBg: '#E1F5EE', emoji: '💰', title: 'The exact email template that lands brand deals',  date: 'Mar 5, 2025',  read: '4 min read' },
              { tag: 'Content', tagC: '#D85A30', tagBg: '#FAECE7', emoji: '✍️', title: '7 caption hooks that double your engagement rate', date: 'Feb 28, 2025', read: '6 min read' },
            ].map(post => (
              <div key={post.title}
                onClick={() => router.push('/register')}
                style={{ background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid #F0EFF8', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(83,74,183,0.1)'; e.currentTarget.style.transition = 'all 0.2s'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ height: 140, background: post.tagBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52 }}>
                  {post.emoji}
                </div>
                <div style={{ padding: 22 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: post.tagC, background: post.tagBg, padding: '3px 10px', borderRadius: 100 }}>
                    {post.tag}
                  </span>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', margin: '12px 0 8px', lineHeight: 1.5 }}>
                    {post.title}
                  </div>
                  <div style={{ fontSize: 12, color: '#9CA3AF' }}>{post.date} · {post.read}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" style={{ padding: '100px 48px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-block', background: '#EEEDFE',
            border: '1px solid #C4BFEF', borderRadius: 100,
            padding: '5px 14px', fontSize: 12, color: '#534AB7', fontWeight: 500, marginBottom: 16,
          }}>Pricing</div>
          <h2 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-1.5px', color: '#1a1a2e', marginBottom: 12 }}>
            Simple, honest pricing
          </h2>
          <p style={{ fontSize: 16, color: '#6B7280', marginBottom: 56 }}>
            Start free. Upgrade when you're ready. No contracts.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 700, margin: '0 auto' }}>
            {[
              {
                name: 'Free', price: '$0', period: '/forever',
                cardBg: 'white', cardBorder: '1.5px solid #E5E4F5',
                nameColor: '#374151', priceColor: '#1a1a2e', subColor: '#9CA3AF',
                featColor: '#4B5563', checkColor: '#1D9E75',
                btnBg: '#F3F4F6', btnColor: '#374151', btnBorder: '1px solid #E5E7EB',
                features: ['3 connected platforms','Basic analytics','AI caption scoring (5/day)','Post scheduler','Community support'],
              },
              {
                name: 'Pro', price: '$19', period: '/month',
                badge: '🔥 Most popular',
                cardBg: '#534AB7', cardBorder: 'none',
                nameColor: 'rgba(255,255,255,0.8)', priceColor: 'white', subColor: 'rgba(255,255,255,0.55)',
                featColor: 'rgba(255,255,255,0.85)', checkColor: '#A7F3D0',
                btnBg: 'white', btnColor: '#534AB7', btnBorder: 'none',
                features: ['All 6 platforms','Advanced analytics + heatmaps','Unlimited AI scoring','Brand deal pipeline','AI chat assistant 24/7','Priority support'],
              },
            ].map(plan => (
              <div key={plan.name} style={{
                background: plan.cardBg, borderRadius: 20, padding: 32,
                border: plan.cardBorder, textAlign: 'left',
              }}>
                {plan.badge && (
                  <div style={{
                    display: 'inline-block', background: 'rgba(255,255,255,0.2)',
                    borderRadius: 100, padding: '4px 12px',
                    fontSize: 12, color: 'white', fontWeight: 600, marginBottom: 16,
                  }}>{plan.badge}</div>
                )}
                <div style={{ fontSize: 14, fontWeight: 600, color: plan.nameColor, marginBottom: 8 }}>{plan.name}</div>
                <div style={{ marginBottom: 24 }}>
                  <span style={{ fontSize: 44, fontWeight: 800, color: plan.priceColor, letterSpacing: '-2px' }}>{plan.price}</span>
                  <span style={{ fontSize: 14, color: plan.subColor }}>{plan.period}</span>
                </div>
                <div style={{ marginBottom: 28 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: plan.featColor, marginBottom: 12 }}>
                      <span style={{ color: plan.checkColor, fontWeight: 700 }}>✓</span>
                      {f}
                    </div>
                  ))}
                </div>
                <button onClick={() => router.push('/register')} style={{
                  width: '100%', padding: '13px',
                  background: plan.btnBg, color: plan.btnColor,
                  border: plan.btnBorder, borderRadius: 10,
                  fontSize: 14, fontWeight: 700, cursor: 'pointer',
                }}>
                  {plan.name === 'Free' ? 'Get started free →' : 'Start Pro trial →'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '0 48px 100px' }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          background: 'linear-gradient(135deg, #534AB7 0%, #7C6FD4 100%)',
          borderRadius: 24, padding: '80px 56px', textAlign: 'center',
          boxShadow: '0 16px 48px rgba(83,74,183,0.25)',
        }}>
          <Logo size="md" />
          <h2 style={{ fontSize: 44, fontWeight: 800, color: 'white', letterSpacing: '-2px', margin: '24px auto 16px', maxWidth: 480 }}>
            Your audience is waiting.
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.8)', maxWidth: 400, margin: '0 auto 40px', lineHeight: 1.75 }}>
            Join 10,000+ creators who stopped guessing and started growing with AI.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => router.push('/register')} style={{
              background: 'white', color: '#534AB7', border: 'none',
              borderRadius: 10, padding: '14px 36px', fontSize: 15,
              fontWeight: 700, cursor: 'pointer',
            }}>
              Start for free today →
            </button>
            <button onClick={() => router.push('/login')} style={{
              background: 'rgba(255,255,255,0.15)', color: 'white',
              border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 10,
              padding: '14px 32px', fontSize: 15, fontWeight: 600, cursor: 'pointer',
            }}>
              View demo
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid #F0EFF8', padding: '36px 48px',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: 16,
        background: 'white',
      }}>
        <Logo size="sm" />
        <div style={{ fontSize: 13, color: '#9CA3AF' }}>
          © 2025 CreatorInsight. Built for creators, by creators.
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Privacy','Terms','Contact'].map(l => (
            <span key={l} style={{ fontSize: 13, color: '#9CA3AF', cursor: 'pointer', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#534AB7'}
              onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}
            >
              {l}
            </span>
          ))}
        </div>
      </footer>

    </div>
  );
}