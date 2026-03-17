'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import StatCard from '@/components/ui/StatCard';
import Card from '@/components/ui/Card';
import SectionLabel from '@/components/ui/SectionLabel';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { analyticsApi, alertsApi, aiApi } from '@/lib/api';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';
import { useRouter } from 'next/navigation';

const PLAT_COLORS: Record<string, string> = {
  instagram: '#534AB7', youtube: '#1D9E75', tiktok: '#D85A30',
  twitter: '#BA7517', linkedin: '#639922',
};

const PILLS = ['all','instagram','youtube','tiktok'] as const;

export default function DashboardPage() {
  const router = useRouter();
  const [overview, setOverview]   = useState<any>(null);
  const [series, setSeries]       = useState<any[]>([]);
  const [alerts, setAlerts]       = useState<any[]>([]);
  const [tips, setTips]           = useState<any[]>([]);
  const [activePlat, setActivePlat] = useState<string>('all');
  const [loading, setLoading]     = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [ovRes, alertRes, tipsRes] = await Promise.all([
        analyticsApi.overview(),
        alertsApi.list(true),
        aiApi.growthTips(),
      ]);
      setOverview(ovRes.data);
      setAlerts(alertRes.data.slice(0, 4));
      setTips(tipsRes.data.slice(0, 3));

      // Load 7-day series for chart
      const serRes = await analyticsApi.platform('instagram', 7);
      const formatted = serRes.data.slice(0, 7).reverse().map((r: any, i: number) => ({
        day: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i % 7],
        eng: parseFloat(r.avg_engagement_rate.toFixed(1)),
      }));
      setSeries(formatted);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function switchPlatform(plat: string) {
    setActivePlat(plat);
    if (plat === 'all') { loadData(); return; }
    try {
      const res = await analyticsApi.platform(plat, 7);
      const formatted = res.data.slice(0, 7).reverse().map((r: any, i: number) => ({
        day: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i % 7],
        eng: parseFloat(r.avg_engagement_rate.toFixed(1)),
      }));
      setSeries(formatted);
    } catch {}
  }

  function fmtNum(n: number) {
    return n >= 1000000 ? (n/1000000).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'K' : String(n);
  }

  const platData = overview?.platforms?.map((p: any) => ({
    name: p.platform.charAt(0).toUpperCase() + p.platform.slice(1),
    followers: p.follower_count,
    color: PLAT_COLORS[p.platform] || '#888',
  })) || [];

  const activeColor = activePlat === 'all' ? '#534AB7' : PLAT_COLORS[activePlat] || '#534AB7';

  return (
    <AppShell>
      <div className="p-5">
        {/* Topbar */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-[15px] font-medium text-gray-900">Good morning, Alex</h1>
            <p className="text-[12px] text-gray-400 mt-0.5">
              {overview ? `${fmtNum(overview.total_follower_delta)} new followers this week` : 'Loading your stats…'}
            </p>
          </div>
          {/* Platform pills */}
          <div className="flex gap-1.5">
            {PILLS.map(p => (
              <button
                key={p}
                onClick={() => switchPlatform(p)}
                className="text-[11px] px-3 py-1.5 rounded-full border transition-all"
                style={{
                  background: activePlat === p ? PLAT_COLORS[p] || '#534AB7' : 'white',
                  color: activePlat === p ? 'white' : '#6B7280',
                  borderColor: activePlat === p ? 'transparent' : '#E5E7EB',
                }}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size={32} />
          </div>
        ) : (
          <>
            {/* Metric cards */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              <StatCard
                label="Total followers"
                value={overview ? fmtNum(overview.total_followers) : '—'}
                delta={overview ? `+${fmtNum(overview.total_follower_delta)} this week` : ''}
                deltaUp={true}
                color="#534AB7"
                onClick={() => router.push('/analytics')}
              />
              <StatCard
                label="Avg engagement"
                value={overview ? overview.avg_engagement_rate.toFixed(1) + '%' : '—'}
                delta="+0.3% vs last week"
                deltaUp={true}
                color="#1D9E75"
                onClick={() => router.push('/analytics')}
              />
              <StatCard
                label="Impressions (7d)"
                value={overview ? fmtNum(overview.total_impressions) : '—'}
                delta="+18% vs last week"
                deltaUp={true}
                color="#D85A30"
              />
              <StatCard
                label="Best post time"
                value="6–8 PM"
                delta="Tue & Thu"
                deltaUp={null}
                color="#BA7517"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Left: charts */}
              <div className="col-span-2 flex flex-col gap-4">
                {/* Engagement chart */}
                <Card>
                  <SectionLabel>Engagement rate — last 7 days</SectionLabel>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={series}>
                        <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => v + '%'} />
                        <Tooltip formatter={(v: any) => [v + '%', 'Engagement']} />
                        <Line
                          type="monotone"
                          dataKey="eng"
                          stroke={activeColor}
                          strokeWidth={2}
                          dot={{ fill: activeColor, r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Platform breakdown */}
                <Card>
                  <SectionLabel>Followers by platform</SectionLabel>
                  <div className="h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={platData} layout="vertical" barSize={14}>
                        <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => fmtNum(v)} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={72} />
                        <Tooltip formatter={(v: any) => [fmtNum(v), 'Followers']} />
                        <Bar dataKey="followers" radius={[0, 4, 4, 0]}>
                          {platData.map((entry: any, i: number) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Top post */}
                <Card onClick={() => router.push('/publish')}>
                  <SectionLabel>Top post this week</SectionLabel>
                  <div className="flex gap-3 items-start">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 text-[10px] font-medium flex items-center justify-center flex-shrink-0">
                      IG
                    </div>
                    <div className="flex-1">
                      <div className="text-[13px] font-medium text-gray-900 mb-1">
                        Morning routine that changed my life 🌅
                      </div>
                      <div className="text-[11px] text-gray-400 mb-2">
                        Instagram Reel · 3 days ago · AI score 91
                      </div>
                      <div className="flex gap-4 flex-wrap">
                        {[['21.4K', 'views'], ['6.8%', 'engagement'], ['1,240', 'saves']].map(([v, l]) => (
                          <div key={l} className="text-[11px]">
                            <span className="font-medium text-gray-700">{v}</span>{' '}
                            <span className="text-gray-400">{l}</span>
                          </div>
                        ))}
                        <button
                          className="text-[11px] text-purple-600 hover:underline ml-auto"
                          onClick={(e) => { e.stopPropagation(); router.push('/ai-insights'); }}
                        >
                          Analyse ↗
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right column */}
              <div className="flex flex-col gap-4">
                {/* AI insights */}
                <Card>
                  <SectionLabel>AI growth insights</SectionLabel>
                  <div className="space-y-3">
                    {tips.map((tip: any, i: number) => (
                      <div
                        key={i}
                        className="flex gap-2 items-start cursor-pointer hover:opacity-70 transition-opacity"
                        onClick={() => router.push('/ai-insights')}
                      >
                        <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                          style={{ background: ['#534AB7','#1D9E75','#D85A30'][i % 3] }} />
                        <p className="text-[12px] text-gray-700 leading-relaxed">{tip.tip}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Alerts */}
                <Card>
                  <SectionLabel>Recent alerts</SectionLabel>
                  <div className="space-y-1">
                    {alerts.map((a: any) => (
                      <div
                        key={a.id}
                        className="flex gap-2 items-start py-2 border-b border-gray-50 last:border-0 cursor-pointer hover:opacity-70"
                        onClick={() => router.push('/alerts')}
                      >
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[11px] font-medium"
                          style={{
                            background: a.severity === 'success' ? '#EAF3DE' : a.severity === 'warning' ? '#FAEEDA' : '#E6F1FB',
                            color: a.severity === 'success' ? '#27500A' : a.severity === 'warning' ? '#633806' : '#0C447C',
                          }}
                        >
                          {a.severity === 'success' ? '✓' : a.severity === 'warning' ? '!' : 'i'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-medium text-gray-800 truncate">{a.title}</div>
                          <div className="text-[11px] text-gray-400 truncate">{a.body.slice(0, 60)}…</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    className="text-[11px] text-purple-600 mt-2 hover:underline"
                    onClick={() => router.push('/alerts')}
                  >
                    View all alerts ↗
                  </button>
                </Card>

                {/* Quick publish CTA */}
                <Card>
                  <SectionLabel>Quick action</SectionLabel>
                  <p className="text-[12px] text-gray-500 mb-3">
                    Ready to post? Get your caption scored by AI before you publish.
                  </p>
                  <button
                    onClick={() => router.push('/publish')}
                    className="w-full py-2 rounded-lg text-white text-[12px] font-medium"
                    style={{ background: '#D85A30' }}
                  >
                    Create new post ↗
                  </button>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
