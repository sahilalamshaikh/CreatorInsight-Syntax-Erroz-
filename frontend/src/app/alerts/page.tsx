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
  info: { bg: '#E6F1FB', color: '#0C447C', icon: 'i' },
  danger: { bg: '#FCEBEB', color: '#A32D2D', icon: '↓' },
};

const FILTERS = ['all','unread','engagement','viral','milestone','trend'] as const;
type Filter = typeof FILTERS[number];

export default function AlertsPage(){

const [alerts,setAlerts]=useState<any[]>([]);
const [loading,setLoading]=useState(true);
const [filter,setFilter]=useState<Filter>('all');

useEffect(()=>{ loadAlerts(); },[]);

async function loadAlerts(){

setLoading(true);

try{

const res=await alertsApi.list();
setAlerts(res.data);

}catch{}finally{

setLoading(false);

}

}

async function markRead(id:string){

try{

await alertsApi.markRead(id);

setAlerts(prev =>
prev.map(a => a.id===id ? {...a,is_read:true} : a)
);

}catch{}

}

async function markAllRead(){

try{

await alertsApi.markAllRead();

setAlerts(prev => prev.map(a => ({...a,is_read:true})));

}catch{}

}

const filtered=alerts.filter(a=>{
if(filter==='all') return true;
if(filter==='unread') return !a.is_read;
return a.type.includes(filter);
});

const unreadCount=alerts.filter(a=>!a.is_read).length;

return(

<AppShell>

<div className="p-6">

{/* HEADER */}

<div className="flex items-center justify-between mb-6">

<div className="flex items-center gap-3">

<h1 className="text-[16px] font-semibold text-gray-900">
Notifications
</h1>

<span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
{unreadCount} unread
</span>

</div>

<button
onClick={markAllRead}
className="text-[12px] px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
>
Mark all read
</button>

</div>

<div className="grid grid-cols-3 gap-6">

{/* LEFT FEED */}

<div className="col-span-2 flex flex-col gap-4">

{/* FILTERS */}

<div className="flex gap-2 flex-wrap">

{FILTERS.map(f=>(
<button
key={f}
onClick={()=>setFilter(f)}
className="text-[11px] px-3 py-1 rounded-full border transition-all capitalize"
style={{
background:filter===f?'#534AB7':'white',
color:filter===f?'white':'#6B7280',
borderColor:filter===f?'transparent':'#E5E7EB'
}}
>
{f}
</button>
))}

</div>

{/* LIST */}

{loading ? (

<div className="flex justify-center items-center h-40">
<LoadingSpinner size={28}/>
</div>

) : (

<Card>

<div className="divide-y divide-gray-100">

{filtered.map(alert => {

const s = SEV_STYLES[alert.severity] || SEV_STYLES.info;

return(

<div
key={alert.id}
onClick={()=>!alert.is_read && markRead(alert.id)}
className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-all"
>

<div
className="w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-medium"
style={{background:s.bg,color:s.color}}
>
{s.icon}
</div>

<div className="flex-1">

<div className="flex items-center justify-between">

<span className="text-[13px] font-medium text-gray-900">
{alert.title}
</span>

<span className="text-[10px] text-gray-400">
{new Date(alert.created_at).toLocaleTimeString()}
</span>

</div>

<p className="text-[11px] text-gray-500 mt-0.5">
{alert.body}
</p>

</div>

{!alert.is_read && (
<div className="w-2 h-2 rounded-full bg-purple-600 mt-2"/>
)}

</div>

);

})}

</div>

</Card>

)}

</div>

{/* RIGHT PANEL */}

<div className="flex flex-col gap-4">

<Card>

<SectionLabel>Recent activity</SectionLabel>

<div className="flex flex-col gap-3">

{alerts.slice(0,5).map(a=>{

const s = SEV_STYLES[a.severity] || SEV_STYLES.info;

return(

<div key={a.id} className="flex items-center gap-3">

<div
className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px]"
style={{background:s.bg,color:s.color}}
>
{s.icon}
</div>

<div className="flex-1">

<div className="text-[12px] text-gray-700 truncate">
{a.title}
</div>

<div className="text-[10px] text-gray-400">
{new Date(a.created_at).toLocaleDateString()}
</div>

</div>

</div>

);

})}

</div>

</Card>

<Card>

<SectionLabel>Notification settings</SectionLabel>

{[
'Engagement alerts',
'Trending topics',
'Milestone alerts',
'Viral post detection'
].map((label,i)=>(
<PrefToggle key={i} label={label}/>
))}

</Card>

</div>

</div>

</div>

</AppShell>

);

}

function PrefToggle({label}:{label:string}){

const [on,setOn]=useState(true);

return(

<div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">

<span className="text-[12px] text-gray-700">
{label}
</span>

<button
onClick={()=>setOn(!on)}
className="w-8 h-5 rounded-full relative transition-colors"
style={{background:on?'#534AB7':'#E5E7EB'}}
>

<div
className="w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm"
style={{left:on?'14px':'2px'}}
/>

</button>

</div>

);

}