'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import Card from '@/components/ui/Card';
import SectionLabel from '@/components/ui/SectionLabel';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { brandApi } from '@/lib/api';

const STAGES = [
  { id: 'prospect',      label: 'Prospects',      color: '#534AB7', bg: '#EEEDFE' },
  { id: 'in_talks',      label: 'In talks',        color: '#378ADD', bg: '#E6F1FB' },
  { id: 'contract_sent', label: 'Contract sent',   color: '#BA7517', bg: '#FAEEDA' },
  { id: 'live',          label: 'Live / completed',color: '#1D9E75', bg: '#EAF3DE' },
];

export default function BrandCollabsPage() {
  const [deals, setDeals]         = useState<any[]>([]);
  const [discover, setDiscover]   = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState<'pipeline'|'discover'>('pipeline');
  const [adding, setAdding]       = useState(false);
  const [newDeal, setNewDeal]     = useState({ brand_name: '', deal_type: 'Sponsored Post', value: '', stage: 'prospect' });

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [dealsRes, discRes] = await Promise.all([brandApi.list(), brandApi.discover()]);
      setDeals(dealsRes.data);
      setDiscover(discRes.data);
    } catch {} finally {
      setLoading(false);
    }
  }

  async function moveDeal(id: string, newStage: string) {
    try {
      await brandApi.update(id, { stage: newStage });
      setDeals(prev => prev.map(d => d.id === id ? { ...d, stage: newStage } : d));
    } catch {}
  }

  async function addDeal() {
    if (!newDeal.brand_name) return;
    try {
      const res = await brandApi.create({ ...newDeal, value: parseFloat(newDeal.value) || undefined });
      setDeals(prev => [res.data, ...prev]);
      setAdding(false);
      setNewDeal({ brand_name: '', deal_type: 'Sponsored Post', value: '', stage: 'prospect' });
    } catch {}
  }

  async function deleteDeal(id: string) {
    try {
      await brandApi.delete(id);
      setDeals(prev => prev.filter(d => d.id !== id));
    } catch {}
  }

  const totalRevenue = deals
    .filter(d => ['live','completed'].includes(d.stage))
    .reduce((sum, d) => sum + (d.value || 0), 0);

  return (
    <AppShell>
      <div className="p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-[15px] font-medium text-gray-900">Brand collaborations</h1>
            <p className="text-[12px] text-gray-400 mt-0.5">{deals.length} active deals · ${totalRevenue.toLocaleString()} revenue</p>
          </div>
          <div className="flex gap-2">
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {(['pipeline','discover'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="text-[12px] px-3 py-1.5 rounded-md capitalize transition-all"
                  style={{
                    background: activeTab === tab ? 'white' : 'transparent',
                    color: activeTab === tab ? '#374151' : '#9CA3AF',
                    fontWeight: activeTab === tab ? 500 : 400,
                    boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  {tab === 'pipeline' ? 'Pipeline' : 'Discover brands'}
                </button>
              ))}
            </div>
            <button
              onClick={() => setAdding(true)}
              className="px-4 py-1.5 rounded-lg text-white text-[12px] font-medium"
              style={{ background: '#534AB7' }}
            >
              + Add deal
            </button>
          </div>
        </div>

        {/* Add deal form */}
        {adding && (
          <Card className="mb-4">
            <SectionLabel>New deal</SectionLabel>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] text-gray-500 block mb-1">Brand name</label>
                <input placeholder="e.g. Calm" value={newDeal.brand_name}
                  onChange={e => setNewDeal(p => ({ ...p, brand_name: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-[12px] outline-none focus:border-purple-400 w-full" />
              </div>
              <div>
                <label className="text-[11px] text-gray-500 block mb-1">Deal type</label>
                <select value={newDeal.deal_type} onChange={e => setNewDeal(p => ({ ...p, deal_type: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-[12px] outline-none focus:border-purple-400 w-full">
                  {['Sponsored Post','Brand Ambassador','Product Review','Affiliate','Co-created Content'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] text-gray-500 block mb-1">Value ($)</label>
                <input type="number" placeholder="600" value={newDeal.value}
                  onChange={e => setNewDeal(p => ({ ...p, value: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-[12px] outline-none focus:border-purple-400 w-full" />
              </div>
              <div className="flex items-end gap-2">
                <button onClick={addDeal} className="flex-1 py-2 rounded-lg text-white text-[12px] font-medium" style={{ background: '#534AB7' }}>Add</button>
                <button onClick={() => setAdding(false)} className="flex-1 py-2 rounded-lg text-[12px] border border-gray-200 text-gray-500">Cancel</button>
              </div>
            </div>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-48"><LoadingSpinner size={28} /></div>
        ) : activeTab === 'pipeline' ? (
          <div className="grid grid-cols-4 gap-3">
            {STAGES.map(stage => {
              const stagDeals = deals.filter(d => d.stage === stage.id);
              return (
                <div key={stage.id}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[12px] font-medium text-gray-700">{stage.label}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{ background: stage.bg, color: stage.color }}>
                      {stagDeals.length}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {stagDeals.map(deal => (
                      <div key={deal.id} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="text-[13px] font-medium text-gray-900">{deal.brand_name}</div>
                            <div className="text-[11px] text-gray-400">{deal.deal_type}</div>
                          </div>
                          {deal.value && (
                            <div className="text-[13px] font-medium" style={{ color: stage.color }}>
                              ${deal.value.toLocaleString()}
                            </div>
                          )}
                        </div>
                        {deal.ai_fit_score && (
                          <div className="flex items-center gap-1.5 mb-2">
                            <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: deal.ai_fit_score + '%', background: stage.color }} />
                            </div>
                            <span className="text-[10px] text-gray-400">{deal.ai_fit_score}% fit</span>
                          </div>
                        )}
                        <div className="flex gap-1 flex-wrap">
                          {stage.id !== 'live' && (
                            <button
                              onClick={() => moveDeal(deal.id, STAGES[STAGES.findIndex(s => s.id === stage.id) + 1]?.id || 'live')}
                              className="text-[10px] px-2 py-0.5 rounded-md text-white"
                              style={{ background: stage.color }}
                            >
                              Move forward
                            </button>
                          )}
                          <button onClick={() => deleteDeal(deal.id)} className="text-[10px] px-2 py-0.5 rounded-md text-gray-400 border border-gray-100 hover:text-red-400">
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                    {stagDeals.length === 0 && (
                      <div className="border-2 border-dashed border-gray-100 rounded-xl p-6 text-center text-[11px] text-gray-300">
                        No deals
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {discover.map((brand: any, i: number) => (
              <Card key={i}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 text-[11px] font-medium flex items-center justify-center flex-shrink-0">
                      {brand.name.slice(0,2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-[13px] font-medium text-gray-900">{brand.name}</div>
                      <div className="text-[11px] text-gray-400">{brand.budget} per post</div>
                    </div>
                  </div>
                  <span className="text-[12px] font-medium" style={{ color: brand.fit >= 85 ? '#1D9E75' : '#BA7517' }}>
                    {brand.fit}% fit
                  </span>
                </div>
                <p className="text-[12px] text-gray-500 leading-relaxed mb-3">{brand.description}</p>
                <button
                  onClick={async () => {
                    try {
                      const res = await brandApi.create({ brand_name: brand.name, deal_type: 'Sponsored Post', ai_fit_score: brand.fit });
                      setDeals(prev => [res.data, ...prev]);
                      setActiveTab('pipeline');
                    } catch {}
                  }}
                  className="text-[11px] px-3 py-1.5 rounded-lg text-white font-medium"
                  style={{ background: '#534AB7' }}
                >
                  Add to pipeline ↗
                </button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
