'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import Card from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
import SectionLabel from '@/components/ui/SectionLabel';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { analyticsApi } from '@/lib/api';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell,
} from 'recharts';

const PLATFORMS = ['instagram','youtube','tiktok','twitter','linkedin'];
const PLAT_COLORS: Record<string,string> = {
  instagram:'#534AB7', youtube:'#1D9E75', tiktok:'#D85A30', twitter:'#BA7517', linkedin:'#639922',
};
const RANGES = [7, 30, 90] as const;

// Heatmap hours/days
const HOURS = [0,3,6,9,12,15,18,21];
const DAYS  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const HEATMAP = DAYS.map(d =>
  HOURS.map(h => ({
    day: d, hour: h,
    val: h >= 6 && h <= 21
      ? Math.round(20 + Math.random() * 80 * (d === 'Tue' || d === 'Thu' ? 1.4 : 1) * (h >= 18 && h <= 20 ? 1.5 : 1))
      : Math.round(5 + Math.random() * 15),
  }))
);

export default function AnalyticsPage() {
  const [activePlat, setActivePlat] = useState('instagram');
  const [range, setRange]           = useState<30|7|90>(30);
  const [series, setSeries]         = useState<any[]>([]);
  const [overview, setOverview]     = useState<any>(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => { loadOverview(); }, []);
  useEffect(() => { loadSeries(); }, [activePlat, range]);

  async function loadOverview() {
    try {
      const res = await analyticsApi.overview();
      setOverview(res.data);
    } catch {}
  }

  async function loadSeries() {
    setLoading(true);
    try {
      const res = await analyticsApi.platform(activePlat, range);
      const data = res.data.slice(0, range).reverse().map((r: any, i: number) => ({
        label: `Day ${i + 1}`,
        eng: parseFloat(r.avg_engagement_rate.toFixed(1)),
        followers: r.follower_count,
        reach: r.total_reach,
        impressions: r.total_impressions,
        delta: r.follower_delta,
      }));
      setSeries(data);
    } catch {} finally {
      setLoading(false);
    }
  }

  function fmtNum(n: number) {
    return n >= 1000000 ? (n/1000000).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'K' : String(n);
  }

  const platData = overview?.platforms?.find((p: any) => p.platform === activePlat);
  const color = PLAT_COLORS[activePlat] || '#534AB7';

  return (
    <AppShell>
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-[15px] font-medium text-gray-900">Analytics</h1>
          <div className="flex gap-2">
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {PLATFORMS.map(p => (
                <button
                  key={p}
                  onClick={() => setActivePlat(p)}
                  className="text-[11px] px-2.5 py-1 rounded-md transition-all capitalize"
                  style={{
                    background: activePlat === p ? 'white' : 'transparent',
                    color: activePlat === p ? PLAT_COLORS[p] : '#9CA3AF',
                    fontWeight: activePlat === p ? 500 : 400,
                    boxShadow: activePlat === p ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {RANGES.map(r => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className="text-[11px] px-2.5 py-1 rounded-md transition-all"
                  style={{
                    background: range === r ? 'white' : 'transparent',
                    color: range === r ? '#374151' : '#9CA3AF',
                    fontWeight: range === r ? 500 : 400,
                    boxShadow: range === r ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  {r}d
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          <StatCard label="Followers" value={platData ? fmtNum(platData.follower_count) : '—'} delta={platData ? `+${platData.follower_delta} this week` : ''} deltaUp={true} color={color} />
          <StatCard label="Engagement rate" value={platData ? platData.avg_engagement_rate.toFixed(1) + '%' : '—'} delta="+0.4% vs prev" deltaUp={true} color={color} />
          <StatCard label="Total reach" value={platData ? fmtNum(platData.total_reach) : '—'} delta="+12% vs prev" deltaUp={true} color={color} />
          <StatCard label="Impressions" value={platData ? fmtNum(platData.total_impressions) : '—'} delta="+8% vs prev" deltaUp={true} color={color} />
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48"><LoadingSpinner size={28} /></div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {/* Engagement over time */}
            <Card>
              <SectionLabel>Engagement rate — {range} days</SectionLabel>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={series}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="label" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} interval={Math.floor(series.length / 5)} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => v + '%'} />
                    <Tooltip formatter={(v: any) => [v + '%', 'Engagement']} />
                    <Line type="monotone" dataKey="eng" stroke={color} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Follower growth */}
            <Card>
              <SectionLabel>Follower growth — {range} days</SectionLabel>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={series}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="label" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} interval={Math.floor(series.length / 5)} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => fmtNum(v)} />
                    <Tooltip formatter={(v: any) => [fmtNum(v), 'Followers']} />
                    <Line type="monotone" dataKey="followers" stroke={color} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Reach vs Impressions */}
            <Card>
              <SectionLabel>Reach vs impressions</SectionLabel>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={series}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="label" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} interval={Math.floor(series.length / 5)} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => fmtNum(v)} />
                    <Tooltip formatter={(v: any) => [fmtNum(v)]} />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="reach" stroke={color} strokeWidth={2} dot={false} name="Reach" />
                    <Line type="monotone" dataKey="impressions" stroke={color + '88'} strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="Impressions" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Posting time heatmap */}
            <Card>
              <SectionLabel>Best posting times — engagement heatmap</SectionLabel>
              <div className="overflow-x-auto mt-1">
                <div className="flex gap-1 mb-1">
                  <div className="w-7 flex-shrink-0" />
                  {HOURS.map(h => (
                    <div key={h} className="flex-1 text-center text-[9px] text-gray-400">
                      {h === 0 ? '12a' : h < 12 ? h+'a' : h === 12 ? '12p' : (h-12)+'p'}
                    </div>
                  ))}
                </div>
                {HEATMAP.map((row, di) => (
                  <div key={di} className="flex gap-1 mb-1">
                    <div className="w-7 text-[9px] text-gray-400 flex-shrink-0 flex items-center">{DAYS[di]}</div>
                    {row.map((cell, hi) => (
                      <div
                        key={hi}
                        className="flex-1 h-5 rounded-sm"
                        style={{
                          background: color,
                          opacity: 0.1 + (cell.val / 100) * 0.9,
                        }}
                        title={`${DAYS[di]} ${cell.hour}:00 — ${cell.val} eng score`}
                      />
                    ))}
                  </div>
                ))}
                <div className="flex items-center gap-2 mt-2 justify-end">
                  <span className="text-[10px] text-gray-400">Low</span>
                  {[0.15, 0.35, 0.55, 0.75, 0.95].map(o => (
                    <div key={o} className="w-5 h-3 rounded-sm" style={{ background: color, opacity: o }} />
                  ))}
                  <span className="text-[10px] text-gray-400">High</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
