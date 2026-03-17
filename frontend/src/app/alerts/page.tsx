'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import Card from '@/components/ui/Card';
import SectionLabel from '@/components/ui/SectionLabel';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { alertsApi } from '@/lib/api';

const SEV_STYLES: Record<string, { bg: string; color: string; icon: string }> = {
  success: { bg: '#EAF3DE', color: '#27500A', icon: '✓' },
  warning: { bg: '#FAEEDA', color: '#633806', icon: '!' },
  info:    { bg: '#E6F1FB', color: '#0C447C', icon: 'i' },
  danger:  { bg: '#FCEBEB', color: '#A32D2D', icon: '↓' },
};

const FILTERS = ['all','unread','engagement','viral','milestone','trend'] as const;
type Filter = typeof FILTERS[number];

export default function AlertsPage() {
  const [alerts, setAlerts]     = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<Filter>('all');

  useEffect(() => { loadAlerts(); }, []);

  async function loadAlerts() {
    setLoading(true);
    try {
      const res = await alertsApi.list();
      setAlerts(res.data);
    } catch {} finally {
      setLoading(false);
    }
  }

  async function markRead(id: string) {
    try {
      await alertsApi.markRead(id);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a));
    } catch {}
  }

  async function markAllRead() {
    try {
      await alertsApi.markAllRead();
      setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
    } catch {}
  }

  const filtered = alerts.filter(a => {
    if (filter === 'all')    return true;
    if (filter === 'unread') return !a.is_read;
    return a.type.includes(filter);
  });

  const unreadCount = alerts.filter(a => !a.is_read).length;

  const stats = {
    total:   alerts.length,
    unread:  unreadCount,
    spikes:  alerts.filter(a => a.type === 'engagement_spike' || a.type === 'viral_post').length,
    drops:   alerts.filter(a => a.type === 'engagement_drop').length,
    milestones: alerts.filter(a => a.type.startsWith('milestone')).length,
    trends:  alerts.filter(a => a.type === 'trending_topic').length,
  };

  return (
    <AppShell>
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <h1 className="text-[15px] font-medium text-gray-900">Alerts</h1>
            <div className="flex items-center gap-1.5 text-[12px] text-gray-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
              Live
            </div>
          </div>
          <button
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="text-[12px] px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-all"
          >
            Mark all read
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Left: alert feed */}
          <div className="col-span-2 flex flex-col gap-3">
            {/* Filter chips */}
            <div className="flex gap-1.5 flex-wrap">
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="text-[11px] px-3 py-1.5 rounded-full border transition-all capitalize"
                  style={{
                    background: filter === f ? '#534AB7' : 'white',
                    color: filter === f ? 'white' : '#6B7280',
                    borderColor: filter === f ? 'transparent' : '#E5E7EB',
                  }}
                >
                  {f === 'all' ? `All (${stats.total})` :
                   f === 'unread' ? `Unread (${stats.unread})` :
                   f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-40">
                <LoadingSpinner size={28} />
              </div>
            ) : filtered.length === 0 ? (
              <Card>
                <div className="text-center py-10 text-[13px] text-gray-400">
                  No alerts in this category
                </div>
              </Card>
            ) : (
              <div className="flex flex-col gap-2">
                {/* Unread section */}
                {filtered.some(a => !a.is_read) && (
                  <>
                    <div className="text-[11px] font-medium text-gray-400 px-1">
                      Unread — {filtered.filter(a => !a.is_read).length}
                    </div>
                    {filtered.filter(a => !a.is_read).map(a => (
                      <AlertCard key={a.id} alert={a} onRead={markRead} />
                    ))}
                  </>
                )}
                {/* Read section */}
                {filtered.some(a => a.is_read) && (
                  <>
                    <div className="text-[11px] font-medium text-gray-400 px-1 mt-2">Earlier</div>
                    {filtered.filter(a => a.is_read).map(a => (
                      <AlertCard key={a.id} alert={a} onRead={markRead} />
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right: stats + prefs */}
          <div className="flex flex-col gap-3">
            <Card>
              <SectionLabel>This week at a glance</SectionLabel>
              {[
                ['Total alerts',      stats.total,      'text-gray-700'],
                ['Unread',            stats.unread,     'text-purple-600'],
                ['Engagement spikes', stats.spikes,     'text-emerald-600'],
                ['Engagement drops',  stats.drops,      'text-red-500'],
                ['Trending topics',   stats.trends,     'text-blue-600'],
                ['Milestones',        stats.milestones, 'text-emerald-600'],
              ].map(([label, val, cls]) => (
                <div key={label as string} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0 text-[12px]">
                  <span className="text-gray-500">{label}</span>
                  <span className={`font-medium ${cls}`}>{val}</span>
                </div>
              ))}
            </Card>

            <Card>
              <SectionLabel>Notification preferences</SectionLabel>
              {[
                ['Engagement drops',  'Alert when >15% drop'],
                ['Viral posts',       'Alert when post spikes'],
                ['Trending topics',   'Niche hashtag alerts'],
                ['Milestones',        'Goals & badge alerts'],
              ].map(([label, sub]) => (
                <PrefToggle key={label as string} label={label as string} sub={sub as string} defaultOn />
              ))}
              <PrefToggle label="Email digest" sub="Daily summary email" defaultOn={false} />
            </Card>

            <Card>
              <SectionLabel>Simulate a live alert</SectionLabel>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Engagement spike',  type: 'engagement_spike', sev: 'success', title: 'Live: engagement spike detected!', body: 'Your latest Reel jumped to 8.2% — 74% above baseline.' },
                  { label: 'Engagement drop',   type: 'engagement_drop',  sev: 'warning', title: 'Live: engagement dropped on TikTok', body: 'Last 2 posts averaged 2.1% — down 57% from baseline.' },
                  { label: 'Trending topic',    type: 'trending_topic',   sev: 'info',    title: 'Live: #ProductivityHacks trending', body: 'Up 89% in 3 hours. Only 8% of creators in your niche have posted.' },
                  { label: 'Milestone hit',     type: 'milestone_hit',    sev: 'success', title: 'Live: milestone hit — 85K followers!', body: "You just crossed 85,000 total followers." },
                ].map(sim => (
                  <button
                    key={sim.label}
                    onClick={() => {
                      setAlerts(prev => [{
                        id: 'sim-' + Date.now(),
                        type: sim.type,
                        severity: sim.sev,
                        platform: null,
                        title: sim.title,
                        body: sim.body,
                        metadata: {},
                        is_read: false,
                        created_at: new Date().toISOString(),
                      }, ...prev]);
                      setFilter('all');
                    }}
                    className="text-left text-[11px] px-3 py-2 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
                  >
                    Simulate {sim.label}
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function AlertCard({ alert, onRead }: { alert: any; onRead: (id: string) => void }) {
  const s = SEV_STYLES[alert.severity] || SEV_STYLES.info;
  return (
    <div
      onClick={() => !alert.is_read && onRead(alert.id)}
      className={`bg-white border rounded-xl p-3.5 cursor-pointer transition-all hover:shadow-sm ${
        !alert.is_read ? 'border-l-2' : 'border-gray-100'
      }`}
      style={!alert.is_read ? { borderLeftColor: s.color } : {}}
    >
      <div className="flex items-start gap-2.5">
        {!alert.is_read && <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: '#534AB7' }} />}
        {alert.is_read  && <div className="w-2 h-2 flex-shrink-0" />}
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[12px] font-medium"
          style={{ background: s.bg, color: s.color }}>
          {s.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[12px] font-medium text-gray-900 truncate">{alert.title}</span>
            {alert.platform && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 flex-shrink-0 capitalize">
                {alert.platform}
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-500 leading-relaxed">{alert.body}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[10px] text-gray-300">
              {alert.created_at ? new Date(alert.created_at).toLocaleDateString() : 'Just now'}
            </span>
            {!alert.is_read && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: '#EEEDFE', color: '#534AB7' }}>
                Unread
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PrefToggle({ label, sub, defaultOn }: { label: string; sub: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <div>
        <div className="text-[12px] text-gray-800">{label}</div>
        <div className="text-[10px] text-gray-400">{sub}</div>
      </div>
      <button
        onClick={() => setOn(v => !v)}
        className="w-8 h-5 rounded-full transition-colors relative flex-shrink-0"
        style={{ background: on ? '#534AB7' : '#E5E7EB' }}
      >
        <div className="w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm"
          style={{ left: on ? '14px' : '2px' }} />
      </button>
    </div>
  );
}
