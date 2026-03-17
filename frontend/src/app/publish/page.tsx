'use client';

import { useState, useRef } from 'react';
import AppShell from '@/components/layout/AppShell';
import Card from '@/components/ui/Card';
import SectionLabel from '@/components/ui/SectionLabel';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { postsApi, aiApi } from '@/lib/api';

import {
FaInstagram,
FaYoutube,
FaTiktok,
FaTwitter,
FaLinkedin
} from "react-icons/fa";

const PLATFORMS = [
{ id:'instagram', label:'Instagram', followers:'31.4K', icon:<FaInstagram/> },
{ id:'youtube', label:'YouTube', followers:'22.1K', icon:<FaYoutube/> },
{ id:'tiktok', label:'TikTok', followers:'18.7K', icon:<FaTiktok/> },
{ id:'twitter', label:'X / Twitter', followers:'8.3K', icon:<FaTwitter/> },
{ id:'linkedin', label:'LinkedIn', followers:'3.7K', icon:<FaLinkedin/> }
];

export default function PublishPage(){

const [caption,setCaption]=useState('');
const [selectedPlats,setSelectedPlats]=useState<string[]>(['instagram']);
const [mediaFiles,setMediaFiles]=useState<File[]>([]);
const [mediaPreviews,setMediaPreviews]=useState<string[]>([]);
const [publishing,setPublishing]=useState(false);
const [progress,setProgress]=useState(0);
const [published,setPublished]=useState(false);

const [aiResult,setAiResult]=useState<any>(null);
const [scoring,setScoring]=useState(false);

const fileRef=useRef<HTMLInputElement>(null);

function togglePlat(id:string){

setSelectedPlats(prev=>
prev.includes(id)
? prev.filter(p=>p!==id)
: [...prev,id]
);

}

function handleFiles(files:FileList | null){

if(!files) return;

const arr=Array.from(files);

setMediaFiles(prev=>[...prev,...arr]);

arr.forEach(file=>{
const reader=new FileReader();
reader.onload=e=>{
setMediaPreviews(prev=>[...prev,e.target?.result as string]);
};
reader.readAsDataURL(file);
});

}

function removeMedia(index:number){

setMediaFiles(prev=>prev.filter((_,i)=>i!==index));
setMediaPreviews(prev=>prev.filter((_,i)=>i!==index));

}

async function scoreCaption(text:string){

if(!text.trim()) return;

setScoring(true);

try{

const tags=text.match(/#\w+/g)||[];

const res=await aiApi.feedback({
caption:text,
platforms:selectedPlats,
hashtags:tags
});

setAiResult(res.data);

}catch{

setAiResult(null);

}finally{

setScoring(false);

}

}

async function handlePublish(){

setPublishing(true);

let p=0;

const interval=setInterval(()=>{
p+=20;
setProgress(p);

if(p>=100){
clearInterval(interval);
setPublishing(false);
setPublished(true);
}

},400);

try{

await postsApi.create({
caption,
platforms:selectedPlats,
media_urls:mediaPreviews
});

}catch{}

}

function resetPost(){

setPublished(false);
setCaption('');
setMediaFiles([]);
setMediaPreviews([]);
setAiResult(null);
setProgress(0);

}

return(

<AppShell>

<div className="p-5">

<h1 className="text-[15px] font-medium text-gray-900 mb-5">
New post
</h1>

{published ? (

<div className="max-w-md mx-auto text-center py-16">

<div className="w-16 h-16 rounded-full bg-green-100 text-green-600 text-3xl flex items-center justify-center mx-auto mb-4">
✓
</div>

<div className="text-[16px] font-medium text-gray-900 mb-2">
Post published successfully!
</div>

<div className="text-[13px] text-gray-400 mb-6">
Your post is now live on {selectedPlats.join(', ')}.
</div>

<button
onClick={resetPost}
className="px-6 py-2 rounded-lg text-white text-[13px] font-medium"
style={{background:'#534AB7'}}
>
Create another post
</button>

</div>

) : (

<div className="grid grid-cols-3 gap-4">

{/* LEFT EDITOR */}

<div className="col-span-2 flex flex-col gap-4">

<Card>

<SectionLabel>Upload media</SectionLabel>

<div
onClick={()=>fileRef.current?.click()}
className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center py-12 cursor-pointer hover:border-purple-400 transition-all"
>

<span className="text-3xl mb-2">📁</span>

<div className="text-[13px] font-medium text-gray-700">
Upload photos or videos
</div>

<div className="text-[11px] text-gray-400 mt-1">
JPG, PNG, GIF, MP4, MOV
</div>

<input
ref={fileRef}
type="file"
multiple
accept="image/*,video/*"
className="hidden"
onChange={(e)=>handleFiles(e.target.files)}
/>

</div>

{mediaPreviews.length>0 && (

<div className="flex flex-wrap gap-2 mt-3">

{mediaPreviews.map((src,i)=>(
<div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden">

<img src={src} className="w-full h-full object-cover"/>

<button
onClick={()=>removeMedia(i)}
className="absolute top-1 right-1 bg-black/60 text-white text-[10px] px-1 rounded"
>
✕
</button>

</div>
))}

</div>

)}

</Card>

<Card>

<SectionLabel>Publish to</SectionLabel>

<div className="grid grid-cols-3 gap-2">

{PLATFORMS.map(p=>{

const active=selectedPlats.includes(p.id);

return(

<button
key={p.id}
onClick={()=>togglePlat(p.id)}
className="flex items-center gap-2 p-2.5 rounded-lg border text-[12px] font-medium transition-all text-left"
style={{
borderColor:active?'#534AB7':'#E5E7EB',
borderWidth:active?1.5:1,
color:active?'#534AB7':'#9CA3AF',
background:active?'#EEEDFE':'white'
}}
>

<span className="text-[16px] text-gray-700">
{p.icon}
</span>

<div>

<div>{p.label}</div>

<div className="text-[10px] text-gray-400 font-normal">
{p.followers}
</div>

</div>

</button>

);

})}

</div>

</Card>

<Card>

<SectionLabel>Caption</SectionLabel>

<textarea
value={caption}
onChange={(e)=>{
setCaption(e.target.value);
scoreCaption(e.target.value);
}}
placeholder="Write your caption..."
rows={4}
className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] outline-none focus:border-purple-400 resize-none"
/>

</Card>

<button
onClick={handlePublish}
disabled={publishing}
className="w-full py-3 rounded-xl text-white text-[13px] font-medium"
style={{background:'#534AB7'}}
>

{publishing?'Publishing…':'Publish post'}

</button>

{publishing && (

<div>

<div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">

<div
className="h-full rounded-full transition-all duration-500"
style={{width:progress+'%',background:'#534AB7'}}
/>

</div>

<div className="text-[12px] text-gray-400 text-center">
Publishing...
</div>

</div>

)}

</div>

{/* RIGHT PANEL */}

<div className="flex flex-col gap-4">

<Card>

<SectionLabel>AI caption score</SectionLabel>

<div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">

<div className="text-3xl font-medium" style={{color:'#534AB7'}}>
{scoring?'…':aiResult?aiResult.score:'--'}
</div>

<div>

{scoring?(
<div className="flex items-center gap-2">
<LoadingSpinner size={14}/>
<span className="text-[12px] text-gray-400">Analysing…</span>
</div>
):aiResult?(
<>
<div className="text-[13px] font-medium text-gray-900">
{aiResult.grade}
</div>

<div className="text-[11px] text-gray-400">
Best time: {aiResult.best_post_time}
</div>
</>
):(
<div className="text-[12px] text-gray-400">
Type a caption to get AI feedback
</div>
)}

</div>

</div>

{aiResult?.suggestions && (

<div className="mt-3 space-y-2">

{aiResult.suggestions.map((s:any,i:number)=>(
<div key={i} className="text-[12px] text-gray-600">
• {s.text}
</div>
))}

</div>

)}

</Card>

<Card>

<SectionLabel>Post preview</SectionLabel>

<div className="border border-gray-100 rounded-xl overflow-hidden">

{mediaPreviews.length>0?(
<img src={mediaPreviews[0]} className="w-full h-40 object-cover"/>
):(
<div className="h-40 bg-gray-100 flex items-center justify-center text-gray-400 text-[12px]">
Media preview
</div>
)}

<div className="p-3">

<div className="text-[12px] font-medium text-gray-700">
Preview
</div>

<p className="text-[11px] text-gray-400 mt-1 whitespace-pre-wrap">
{caption || 'Your caption preview will appear here'}
</p>

</div>

</div>

</Card>

</div>

</div>

)}

</div>

</AppShell>

);

}