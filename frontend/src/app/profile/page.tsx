'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import Card from '@/components/ui/Card';
import SectionLabel from '@/components/ui/SectionLabel';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { authApi, socialApi, userApi } from '@/lib/api';

const NICHES = [
  'Lifestyle & Wellness','Tech','Gaming','Finance','Fashion',
  'Food','Education','Fitness','Travel','Parenting','Business',
];

const PLAT_COLORS: Record<string,string> = {
  instagram:'#534AB7', youtube:'#1D9E75', tiktok:'#D85A30',
  twitter:'#BA7517',   linkedin:'#639922', facebook:'#888780',
};

export default function ProfilePage() {
  const [user, setUser]         = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [form, setForm]         = useState({
    full_name: '', username: '', niche: '', bio: '',
  });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [userRes, accsRes] = await Promise.all([
        authApi.me(),
        socialApi.accounts(),
      ]);
      setUser(userRes.data);
      setAccounts(accsRes.data);
      setForm({
        full_name: userRes.data.full_name || '',
        username:  userRes.data.username  || '',
        niche:     userRes.data.niche     || '',
        bio:       userRes.data.bio       || '',
      });
    } catch {} finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await userApi.update(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {} finally {
      setSaving(false);
    }
  }

  function update(field: string, value: string) {
    setForm(p => ({ ...p, [field]: value }));
  }

  const initials = form.full_name
    ? form.full_name.split(' ').map((n:string) => n[0]).join('').toUpperCase().slice(0,2)
    : 'AK';

  const totalFollowers = accounts.reduce((s, a) => s + (a.follower_count || 0), 0);

  return (
    <AppShell>
      <div className="p-5 max-w-3xl">
        <h1 className="text-[15px] font-medium text-gray-900 mb-5">Profile</h1>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <LoadingSpinner size={28} />
          </div>
        ) : (
          <div className="flex flex-col gap-4">

            {/* Banner */}
            <Card>
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-700 text-xl font-medium flex items-center justify-center flex-shrink-0">
                  {initials}
                </div>
                <div className="flex-1">
                  <div className="text-[16px] font-medium text-gray-900">{form.full_name}</div>
                  <div className="text-[12px] text-gray-400 mt-0.5">@{form.username}</div>
                  <div className="text-[12px] text-gray-400">{user?.email}</div>
                </div>
                <div className="flex gap-6 text-center">
                  <div>
                    <div className="text-[18px] font-medium text-gray-900">
                      {totalFollowers >= 1000 ? (totalFollowers/1000).toFixed(1)+'K' : totalFollowers}
                    </div>
                    <div className="text-[11px] text-gray-400">Followers</div>
                  </div>
                  <div>
                    <div className="text-[18px] font-medium text-gray-900">{accounts.length}</div>
                    <div className="text-[11px] text-gray-400">Platforms</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Edit form */}
            <Card>
              <SectionLabel>Edit profile</SectionLabel>
              <form onSubmit={handleSave} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[12px] font-medium text-gray-500 block mb-1">Full name</label>
                    <input value={form.full_name} onChange={e => update('full_name', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-purple-400" />
                  </div>
                  <div>
                    <label className="text-[12px] font-medium text-gray-500 block mb-1">Username</label>
                    <input value={form.username} onChange={e => update('username', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-purple-400" />
                  </div>
                </div>
                <div>
                  <label className="text-[12px] font-medium text-gray-500 block mb-1">Content niche</label>
                  <select value={form.niche} onChange={e => update('niche', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-purple-400 bg-white">
                    <option value="">Select your niche</option>
                    {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[12px] font-medium text-gray-500 block mb-1">Bio</label>
                  <textarea value={form.bio} onChange={e => update('bio', e.target.value)}
                    rows={3} placeholder="Tell brands and followers about yourself…"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-purple-400 resize-none" />
                </div>
                <div className="flex items-center gap-3">
                  <button type="submit" disabled={saving}
                    className="px-6 py-2 rounded-lg text-white text-[13px] font-medium"
                    style={{ background: '#534AB7', opacity: saving ? 0.6 : 1 }}>
                    {saving ? 'Saving…' : 'Save changes'}
                  </button>
                  {saved && <span className="text-[12px] text-emerald-600 font-medium">✓ Saved</span>}
                </div>
              </form>
            </Card>

            {/* Connected accounts */}
            <Card>
              <SectionLabel>Connected social accounts</SectionLabel>
              {accounts.length === 0 ? (
                <div className="text-[13px] text-gray-400 py-4 text-center">No accounts connected yet</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {accounts.map((acc: any) => (
                    <div key={acc.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-[11px] font-medium flex-shrink-0"
                        style={{ background: PLAT_COLORS[acc.platform] || '#888' }}>
                        {acc.platform.slice(0,2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="text-[13px] font-medium text-gray-800 capitalize">{acc.platform}</div>
                        <div className="text-[11px] text-gray-400">{acc.platform_username}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[13px] font-medium text-gray-800">
                          {acc.follower_count >= 1000 ? (acc.follower_count/1000).toFixed(1)+'K' : acc.follower_count}
                        </div>
                        <div className="text-[10px] text-gray-400">followers</div>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Account info */}
            <Card>
              <SectionLabel>Account info</SectionLabel>
              {[
                ['Email',        user?.email,    'text-gray-700'],
                ['Member since', user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US',{month:'long',year:'numeric'}) : '—', 'text-gray-500'],
                ['Status',       user?.is_active ? 'Active' : 'Inactive', user?.is_active ? 'text-emerald-600' : 'text-red-500'],
              ].map(([label, val, cls]) => (
                <div key={label as string} className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0 text-[13px]">
                  <span className="text-gray-400">{label}</span>
                  <span className={`font-medium ${cls}`}>{val}</span>
                </div>
              ))}
            </Card>

          </div>
        )}
      </div>
    </AppShell>
  );
}