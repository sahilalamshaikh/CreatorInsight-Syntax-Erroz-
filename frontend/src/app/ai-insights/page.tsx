'use client';
import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import Card from '@/components/ui/Card';
import SectionLabel from '@/components/ui/SectionLabel';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { aiApi } from '@/lib/api';

const PLATFORMS = ['instagram','youtube','tiktok','twitter','linkedin'];

const PAST_POSTS = [
  { title:'Morning routine that changed my life',platform:'instagram',score:91,eng:'6.8%',caption:'Morning routine that changed my life 🌅 Starting the day with intention, movement, and calm. What\'s your non-negotiable morning habit? Drop it below! #MorningRoutine #DailyHabits #Wellness'},
  { title:'5 productivity habits in 60 seconds',platform:'youtube',score:85,eng:'5.9%',caption:'5 productivity habits that will transform your week ⚡ Which one are you adding first? Subscribe for weekly growth tips! #Productivity #Habits'},
  { title:'POV: You fixed your sleep schedule',platform:'tiktok',score:88,eng:'5.4%',caption:'POV: You finally fixed your sleep schedule and everything changed 🌙 What\'s your bedtime secret? #SleepTok #Wellness'},
  { title:'10 lessons from year 1 as a creator',platform:'linkedin',score:72,eng:'3.1%',caption:'10 lessons from my first year as a full-time creator. Lesson 1: consistency beats virality every single time. #CreatorEconomy'},
];

const PLAT_COLOR:Record<string,string>={
instagram:'#4F46E5',
youtube:'#10B981',
tiktok:'#F97316',
twitter:'#F59E0B',
linkedin:'#84CC16',
};

const RELATED_TOPICS:Record<string,string[]>={
wellness:['Morning routines','Sleep optimization','Meditation tips','Mindful eating','Stress management'],
lifestyle:['Daily habits','Minimalism','Work-life balance','Self-improvement','Productivity hacks'],
fitness:['Home workouts','Nutrition tips','Recovery routines','Gym motivation','Meal prep'],
tech:['AI tools','App reviews','Coding tips','Tech news','Gadget reviews'],
finance:['Budgeting tips','Investing basics','Side hustles','Saving money','Financial freedom'],
food:['Easy recipes','Meal prep','Restaurant reviews','Cooking tips','Healthy snacks'],
travel:['Budget travel','Solo travel tips','Hidden gems','Travel hacks','Packing tips'],
default:['Content strategy','Audience growth','Engagement tips','Creator monetisation','Brand deals'],
};

export default function AiInsightsPage(){

const [caption,setCaption]=useState('');
const [selPlats,setSelPlats]=useState(['instagram','tiktok']);
const [result,setResult]=useState<any>(null);
const [loading,setLoading]=useState(false);
const [tips,setTips]=useState<any[]>([]);
const [hashtags,setHashtags]=useState<any[]>([]);
const [tipsLoading,setTipsLoading]=useState(false);
const [activeTab,setActiveTab]=useState<'analyser'|'trending'>('analyser');
const [niche,setNiche]=useState('wellness');

function togglePlat(p:string){
setSelPlats(prev=>prev.includes(p)?prev.filter(x=>x!==p):[...prev,p]);
}

async function analyse(){

if(!caption.trim())return;

setLoading(true);
setResult(null);

try{

const tags=(caption.match(/#\w+/g)||[]);

const res=await aiApi.feedback({caption,platforms:selPlats,hashtags:tags});

setResult(res.data);

}catch{

setResult({
score:50,
grade:'Fair',
suggestions:[{type:'improve',text:'Add a question to invite comments.'}],
hashtag_recommendations:['#ContentCreator','#Growth','#Creator','#Social','#Viral'],
best_post_time:'6–8 PM Tue/Thu'
});

}finally{
setLoading(false);
}

setTipsLoading(true);

try{

const [tipsRes,hashRes]=await Promise.all([
aiApi.growthTips(),
aiApi.trendingHashtags()
]);

setTips(tipsRes.data);
setHashtags(hashRes.data);

}catch{}finally{
setTipsLoading(false);
}

}

function loadPost(post:any){
setCaption(post.caption);
setResult(null);
setActiveTab('analyser');
}

function addHashtagToCaption(tag:string){
if(!caption.includes(tag)){
setCaption(prev=>prev+' '+tag);
}
}

const scoreColor=result
?result.score>=85?'#10B981'
:result.score>=70?'#4F46E5'
:'#F59E0B'
:'#9CA3AF';

const relatedTopics=RELATED_TOPICS[niche]||RELATED_TOPICS.default;

return(

<AppShell>

<div className="bg-[#F5F6FA] min-h-screen p-6">

<div className="max-w-7xl mx-auto">

{/* Header */}

<div className="flex items-center justify-between mb-6">

<h1 className="text-lg font-semibold text-gray-900">
AI Insights
</h1>

<div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1">

{(['analyser','trending'] as const).map(tab=>(
<button
key={tab}
onClick={()=>setActiveTab(tab)}
className="text-xs px-3 py-1.5 rounded-md capitalize"
style={{
background:activeTab===tab?'#111827':'transparent',
color:activeTab===tab?'white':'#6B7280'
}}
>
{tab==='analyser'?'Content analyser':'Trending topics'}
</button>
))}

</div>

</div>

{activeTab==='analyser'?(
<div className="grid grid-cols-3 gap-6">

{/* LEFT */}

<div className="col-span-2 flex flex-col gap-6">

<Card className="bg-white border border-gray-200 rounded-xl p-5">

<SectionLabel>Paste or type your caption</SectionLabel>

<textarea
value={caption}
onChange={e=>{setCaption(e.target.value);setResult(null)}}
rows={5}
placeholder="Write a caption and click Analyse…"
className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
/>

<div className="flex justify-between text-xs text-gray-400 mt-1 mb-3">
<span>{caption.length} characters</span>
<span>{(caption.match(/#\w+/g)||[]).length} hashtags</span>
</div>

<div className="flex flex-wrap gap-2 mb-4">

{PLATFORMS.map(p=>{

const on=selPlats.includes(p);

return(

<button
key={p}
onClick={()=>togglePlat(p)}
className="text-xs px-3 py-1 rounded-full border capitalize"
style={{
background:on?PLAT_COLOR[p]:'white',
color:on?'white':'#6B7280',
borderColor:on?'transparent':'#E5E7EB'
}}
>
{p}
</button>

);

})}

</div>

<button
onClick={analyse}
disabled={loading||!caption.trim()}
className="px-5 py-2 rounded-lg text-white text-sm font-medium"
style={{background:'#4F46E5'}}
>
{loading?'Analysing with AI…':'Analyse with AI'}
</button>

</Card>

{loading&&(
<div className="flex items-center gap-3 p-4">
<LoadingSpinner/>
<span className="text-sm text-gray-400">
AI is reading your caption…
</span>
</div>
)}

{/* RESULTS */}

{result&&(

<Card className="bg-white border border-gray-200 rounded-xl p-5">

<SectionLabel>Score breakdown</SectionLabel>

<div className="flex items-center gap-6 bg-[#F8F9FC] rounded-xl p-4">

<div className="text-center">
<div className="text-4xl font-semibold" style={{color:scoreColor}}>
{result.score}
</div>
<div className="text-xs text-gray-400">/100</div>
</div>

<div>
<div className="text-lg font-medium">{result.grade}</div>
<div className="text-xs text-gray-400">
Best time to post: <strong>{result.best_post_time}</strong>
</div>
</div>

<div className="flex-1">
<div className="h-2 bg-gray-200 rounded-full overflow-hidden">
<div
className="h-full"
style={{width:result.score+'%',background:scoreColor}}
/>
</div>
</div>

</div>

</Card>

)}

</div>

{/* RIGHT */}

<div className="flex flex-col gap-6">

<Card className="bg-white border border-gray-200 rounded-xl p-5">

<SectionLabel>Past posts</SectionLabel>

{PAST_POSTS.map((post,i)=>(

<div
key={i}
onClick={()=>loadPost(post)}
className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0 cursor-pointer hover:opacity-70"
>

<div
className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium"
style={{
background:PLAT_COLOR[post.platform]+'20',
color:PLAT_COLOR[post.platform]
}}
>
{post.platform.slice(0,2).toUpperCase()}
</div>

<div className="flex-1">
<div className="text-sm font-medium truncate">
{post.title}
</div>
<div className="text-xs text-gray-400">
{post.eng} engagement
</div>
</div>

<span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100">
{post.score}
</span>

</div>

))}

</Card>

<Card className="bg-white border border-gray-200 rounded-xl p-5">

<SectionLabel>AI Tip of the Day</SectionLabel>

<p className="text-sm text-gray-600 leading-relaxed">
At your current growth rate of +1,240 followers/week,
posting 1 extra Reel on Tuesday could accelerate
your path to 100K by 4–5 days.
</p>

</Card>

</div>

</div>

):(

<Card className="bg-white border border-gray-200 rounded-xl p-6 text-sm text-gray-500 text-center">

Click analyse on a caption to load trending topics

</Card>

)}

</div>

</div>

</AppShell>

);

}