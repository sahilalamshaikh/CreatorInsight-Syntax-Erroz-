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
  instagram: '#4F46E5',
  youtube: '#10B981',
  tiktok: '#F97316',
  twitter: '#F59E0B',
  linkedin: '#84CC16',
};

const PILLS = ['all','instagram','youtube','tiktok'] as const;

export default function DashboardPage() {

const router = useRouter();

const [overview,setOverview]=useState<any>(null);
const [series,setSeries]=useState<any[]>([]);
const [alerts,setAlerts]=useState<any[]>([]);
const [tips,setTips]=useState<any[]>([]);
const [activePlat,setActivePlat]=useState<string>('all');
const [loading,setLoading]=useState(true);

useEffect(()=>{loadData();},[]);

async function loadData(){

try{

const [ovRes,alertRes,tipsRes]=await Promise.all([
analyticsApi.overview(),
alertsApi.list(true),
aiApi.growthTips(),
]);

setOverview(ovRes.data);
setAlerts(alertRes.data.slice(0,4));
setTips(tipsRes.data.slice(0,3));

const serRes=await analyticsApi.platform('instagram',7);

const formatted=serRes.data
.slice(0,7)
.reverse()
.map((r:any,i:number)=>({
day:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i%7],
eng:parseFloat(r.avg_engagement_rate.toFixed(1)),
}));

setSeries(formatted);

}catch(e){
console.error(e);
}finally{
setLoading(false);
}

}

async function switchPlatform(plat:string){

setActivePlat(plat);

if(plat==='all'){
loadData();
return;
}

try{

const res=await analyticsApi.platform(plat,7);

const formatted=res.data
.slice(0,7)
.reverse()
.map((r:any,i:number)=>({
day:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i%7],
eng:parseFloat(r.avg_engagement_rate.toFixed(1)),
}));

setSeries(formatted);

}catch{}

}

function fmtNum(n:number){
return n>=1000000
?(n/1000000).toFixed(1)+'M'
:n>=1000
?(n/1000).toFixed(1)+'K'
:String(n);
}

const platData=overview?.platforms?.map((p:any)=>({
name:p.platform.charAt(0).toUpperCase()+p.platform.slice(1),
followers:p.follower_count,
color:PLAT_COLORS[p.platform]||'#888',
}))||[];

const activeColor=
activePlat==='all'
?'#4F46E5'
:PLAT_COLORS[activePlat]||'#4F46E5';

return(

<AppShell>

<div className="bg-[#F5F6FA] min-h-screen p-6">

<div className="max-w-7xl mx-auto">

{/* Header */}

<div className="flex items-center justify-between mb-6">

<div>

<h1 className="text-lg font-semibold text-gray-900">
Overview
</h1>

<p className="text-sm text-gray-500 mt-1">
{overview
?`${fmtNum(overview.total_follower_delta)} new followers this week`
:'Loading your stats…'}
</p>

</div>

</div>

{/* Platform Tabs */}

<div className="flex gap-2 mb-6">

{PILLS.map(p=>(
<button
key={p}
onClick={()=>switchPlatform(p)}
className="px-4 py-1.5 text-xs rounded-md border transition"
style={{
background:activePlat===p?'#111827':'white',
color:activePlat===p?'white':'#374151',
borderColor:'#E5E7EB'
}}
>
{p.charAt(0).toUpperCase()+p.slice(1)}
</button>
))}

</div>

{loading?(
<div className="flex justify-center items-center h-64">
<LoadingSpinner size={32}/>
</div>
):(
<>

{/* Stats */}

<div className="grid grid-cols-4 gap-4 mb-6">

<StatCard
label="Total followers"
value={overview?fmtNum(overview.total_followers):'—'}
delta={overview?`+${fmtNum(overview.total_follower_delta)} this week`:''}
deltaUp={true}
color="#4F46E5"
onClick={()=>router.push('/analytics')}
/>

<StatCard
label="Avg engagement"
value={overview?overview.avg_engagement_rate.toFixed(1)+'%':'—'}
delta="+0.3% vs last week"
deltaUp={true}
color="#10B981"
onClick={()=>router.push('/analytics')}
/>

<StatCard
label="Impressions (7d)"
value={overview?fmtNum(overview.total_impressions):'—'}
delta="+18% vs last week"
deltaUp={true}
color="#F97316"
/>

<StatCard
label="Best post time"
value="6–8 PM"
delta="Tue & Thu"
deltaUp={null}
color="#F59E0B"
/>

</div>

{/* Layout */}

<div className="grid grid-cols-3 gap-6">

{/* Left */}

<div className="col-span-2 space-y-6">

<Card className="p-6 border border-gray-200 rounded-xl bg-white">

<div className="flex items-center justify-between mb-3">

<SectionLabel>
Engagement Performance
</SectionLabel>

<span className="text-xs text-gray-400">
Last 7 days
</span>

</div>

<div className="h-64">

<ResponsiveContainer width="100%" height="100%">

<LineChart data={series}>

<XAxis dataKey="day" tick={{fontSize:11}} axisLine={false} tickLine={false}/>

<YAxis
tick={{fontSize:11}}
axisLine={false}
tickLine={false}
tickFormatter={v=>v+'%'}
/>

<Tooltip formatter={(v:any)=>[v+'%','Engagement']}/>

<Line
type="monotone"
dataKey="eng"
stroke={activeColor}
strokeWidth={2}
dot={{fill:activeColor,r:3}}
/>

</LineChart>

</ResponsiveContainer>

</div>

</Card>

<Card className="p-6 border border-gray-200 rounded-xl bg-white">

<SectionLabel>
Followers by platform
</SectionLabel>

<div className="h-48 mt-4">

<ResponsiveContainer width="100%" height="100%">

<BarChart data={platData} layout="vertical" barSize={16}>

<XAxis
type="number"
tick={{fontSize:11}}
axisLine={false}
tickLine={false}
tickFormatter={v=>fmtNum(v)}
/>

<YAxis
type="category"
dataKey="name"
tick={{fontSize:12}}
axisLine={false}
tickLine={false}
width={90}
/>

<Tooltip formatter={(v:any)=>[fmtNum(v),'Followers']}/>

<Bar dataKey="followers" radius={[0,6,6,0]}>

{platData.map((entry:any,i:number)=>(
<Cell key={i} fill={entry.color}/>
))}

</Bar>

</BarChart>

</ResponsiveContainer>

</div>

</Card>

</div>

{/* Right */}

<div className="space-y-6">

<Card className="p-6 border border-gray-200 rounded-xl bg-white">

<SectionLabel>
AI Growth Insights
</SectionLabel>

<div className="space-y-3 mt-3">

{tips.map((tip:any,i:number)=>(
<div
key={i}
className="flex gap-2 text-sm text-gray-700 cursor-pointer hover:opacity-70"
onClick={()=>router.push('/ai-insights')}
>
<span
className="w-2 h-2 rounded-full mt-2"
style={{
background:['#4F46E5','#10B981','#F97316'][i%3]
}}
/>
{tip.tip}
</div>
))}

</div>

</Card>

<Card className="p-6 border border-gray-200 rounded-xl bg-white">

<SectionLabel>
Recent Alerts
</SectionLabel>

<div className="space-y-2 mt-3">

{alerts.map((a:any)=>(
<div
key={a.id}
className="flex gap-3 text-sm cursor-pointer hover:opacity-70"
onClick={()=>router.push('/alerts')}
>
<div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center text-xs">
!
</div>

<div>

<div className="font-medium text-gray-800">
{a.title}
</div>

<div className="text-xs text-gray-500">
{a.body.slice(0,60)}…
</div>

</div>

</div>
))}

</div>

<button
className="text-xs text-indigo-600 mt-3 hover:underline"
onClick={()=>router.push('/alerts')}
>
View all alerts →
</button>

</Card>

</div>

</div>

</>
)}

</div>

</div>

</AppShell>

);

}