'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import Card from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
import SectionLabel from '@/components/ui/SectionLabel';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { analyticsApi } from '@/lib/api';
import {
  LineChart, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer,
  CartesianGrid, Legend
} from 'recharts';

const PLATFORMS = ['instagram','youtube','tiktok','twitter','linkedin'];

const PLAT_COLORS: Record<string,string> = {
  instagram:'#534AB7',
  youtube:'#1D9E75',
  tiktok:'#D85A30',
  twitter:'#BA7517',
  linkedin:'#639922',
};

const RANGES = [7,30,90] as const;

const HOURS = [0,3,6,9,12,15,18,21];
const DAYS  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

const HEATMAP = DAYS.map(d =>
  HOURS.map(h => ({
    day:d,
    hour:h,
    val:h>=6 && h<=21
      ? Math.round(20 + Math.random()*80*(d==='Tue'||d==='Thu'?1.4:1)*(h>=18&&h<=20?1.5:1))
      : Math.round(5+Math.random()*15)
  }))
);

export default function AnalyticsPage(){

const [activePlat,setActivePlat]=useState('instagram');
const [range,setRange]=useState<30|7|90>(30);
const [series,setSeries]=useState<any[]>([]);
const [overview,setOverview]=useState<any>(null);
const [loading,setLoading]=useState(true);

useEffect(()=>{loadOverview()},[]);
useEffect(()=>{loadSeries()},[activePlat,range]);

async function loadOverview(){
try{
const res=await analyticsApi.overview();
setOverview(res.data);
}catch{}
}

async function loadSeries(){
setLoading(true);
try{
const res=await analyticsApi.platform(activePlat,range);

const data=res.data.slice(0,range).reverse().map((r:any,i:number)=>({
label:`Day ${i+1}`,
eng:parseFloat(r.avg_engagement_rate.toFixed(1)),
followers:r.follower_count,
reach:r.total_reach,
impressions:r.total_impressions,
delta:r.follower_delta
}));

setSeries(data);

}catch{}finally{
setLoading(false);
}
}

function fmtNum(n:number){
return n>=1000000
?(n/1000000).toFixed(1)+'M'
:n>=1000
?(n/1000).toFixed(1)+'K'
:String(n);
}

const platData=overview?.platforms?.find((p:any)=>p.platform===activePlat);
const color=PLAT_COLORS[activePlat]||'#534AB7';

/* Generate Report Handler */

function generateReport(){

const reportData={
platform:activePlat,
range,
generatedAt:new Date().toLocaleString(),
data:series
};

console.log('Report generated',reportData);

alert('Report generated successfully (demo)');
}

return(

<AppShell>

<div className="p-6 bg-gray-50 min-h-screen">

{/* HEADER */}

<div className="flex items-center justify-between mb-6">

<h1 className="text-lg font-semibold text-gray-900">
Analytics
</h1>

<div className="flex items-center gap-3">

{/* Generate Report Button */}

<button
onClick={generateReport}
className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium shadow-sm hover:opacity-90"
style={{background:'#F59E0B'}}
>
📄 Generate Report
</button>

{/* Platform selector */}

<div className="flex gap-1 bg-gray-100 rounded-lg p-1">

{PLATFORMS.map(p=>(
<button
key={p}
onClick={()=>setActivePlat(p)}
className="text-xs px-3 py-1 rounded-md capitalize"
style={{
background:activePlat===p?'white':'transparent',
color:activePlat===p?PLAT_COLORS[p]:'#9CA3AF'
}}
>
{p}
</button>
))}

</div>

{/* Range selector */}

<div className="flex gap-1 bg-gray-100 rounded-lg p-1">

{RANGES.map(r=>(
<button
key={r}
onClick={()=>setRange(r)}
className="text-xs px-3 py-1 rounded-md"
style={{
background:range===r?'white':'transparent',
color:range===r?'#374151':'#9CA3AF'
}}
>
{r}d
</button>
))}

</div>

</div>

</div>

{/* STAT CARDS */}

<div className="grid grid-cols-4 gap-4 mb-6">

<StatCard
label="Followers"
value={platData?fmtNum(platData.follower_count):'—'}
delta={platData?`+${platData.follower_delta} this week`:''}
deltaUp={true}
color={color}
/>

<StatCard
label="Engagement rate"
value={platData?platData.avg_engagement_rate.toFixed(1)+'%':'—'}
delta="+0.4% vs prev"
deltaUp={true}
color={color}
/>

<StatCard
label="Total reach"
value={platData?fmtNum(platData.total_reach):'—'}
delta="+12% vs prev"
deltaUp={true}
color={color}
/>

<StatCard
label="Impressions"
value={platData?fmtNum(platData.total_impressions):'—'}
delta="+8% vs prev"
deltaUp={true}
color={color}
/>

</div>

{loading?(
<div className="flex justify-center items-center h-48">
<LoadingSpinner size={28}/>
</div>
):(

<div className="grid grid-cols-2 gap-5">

{/* Engagement */}

<Card>

<SectionLabel>
Engagement rate — {range} days
</SectionLabel>

<div className="h-48">

<ResponsiveContainer width="100%" height="100%">

<LineChart data={series}>

<CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6"/>

<XAxis dataKey="label" tick={{fontSize:9}} axisLine={false} tickLine={false}/>

<YAxis tick={{fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>v+'%'}/>

<Tooltip formatter={(v:any)=>[v+'%','Engagement']}/>

<Line type="monotone" dataKey="eng" stroke={color} strokeWidth={2} dot={false}/>

</LineChart>

</ResponsiveContainer>

</div>

</Card>

{/* Followers */}

<Card>

<SectionLabel>
Follower growth — {range} days
</SectionLabel>

<div className="h-48">

<ResponsiveContainer width="100%" height="100%">

<LineChart data={series}>

<CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6"/>

<XAxis dataKey="label" tick={{fontSize:9}} axisLine={false} tickLine={false}/>

<YAxis tick={{fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>fmtNum(v)}/>

<Tooltip formatter={(v:any)=>[fmtNum(v),'Followers']}/>

<Line type="monotone" dataKey="followers" stroke={color} strokeWidth={2} dot={false}/>

</LineChart>

</ResponsiveContainer>

</div>

</Card>

{/* Reach vs Impressions */}

<Card>

<SectionLabel>
Reach vs impressions
</SectionLabel>

<div className="h-48">

<ResponsiveContainer width="100%" height="100%">

<LineChart data={series}>

<CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6"/>

<XAxis dataKey="label" tick={{fontSize:9}} axisLine={false} tickLine={false}/>

<YAxis tick={{fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>fmtNum(v)}/>

<Tooltip formatter={(v:any)=>[fmtNum(v)]}/>

<Legend iconSize={8}/>

<Line type="monotone" dataKey="reach" stroke={color} strokeWidth={2} dot={false}/>

<Line type="monotone" dataKey="impressions" stroke={color+'88'} strokeWidth={1.5} strokeDasharray="4 2" dot={false}/>

</LineChart>

</ResponsiveContainer>

</div>

</Card>

{/* Heatmap */}

<Card>

<SectionLabel>
Best posting times
</SectionLabel>

<div className="mt-2">

{HEATMAP.map((row,di)=>(
<div key={di} className="flex gap-1 mb-1">

{row.map((cell,hi)=>(
<div
key={hi}
className="flex-1 h-5 rounded-sm"
style={{
background:color,
opacity:0.1+(cell.val/100)*0.9
}}
/>
))}

</div>
))}

</div>

</Card>

</div>

)}

</div>

</AppShell>

);

}