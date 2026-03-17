'use client';

import { useRouter } from 'next/navigation';
import { isLoggedIn } from '@/lib/auth';
import { useEffect, useState } from 'react';

import {
BarChart3,
Brain,
Rocket,
Handshake,
Bell,
MessageCircle
} from "lucide-react";

function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {

const sizes = {
sm: { icon: 28, text: 15 },
md: { icon: 36, text: 18 },
lg: { icon: 48, text: 24 }
};

const s = sizes[size];

return (
<div style={{ display:'flex',alignItems:'center',gap:10 }}>

<div
style={{
width:s.icon,
height:s.icon,
borderRadius:s.icon*0.3,
background:'linear-gradient(135deg,#534AB7,#7C6FD4)',
display:'flex',
alignItems:'center',
justifyContent:'center',
boxShadow:'0 6px 18px rgba(83,74,183,0.35)'
}}
>

<svg width={s.icon*0.6} height={s.icon*0.6} viewBox="0 0 22 22">

<rect x="2" y="12" width="4" height="8" rx="1.5" fill="white" opacity=".5"/>
<rect x="8" y="7" width="4" height="13" rx="1.5" fill="white" opacity=".75"/>
<rect x="14" y="3" width="4" height="17" rx="1.5" fill="white"/>

</svg>

</div>

<div style={{ fontSize:s.text,fontWeight:700 }}>
<span style={{color:'#534AB7'}}>creator</span>
<span style={{color:'#1a1a2e'}}>insight</span>
</div>

</div>
);
}

export default function LandingPage() {

const router = useRouter();
const [scrolled,setScrolled] = useState(false);

useEffect(()=>{

if(isLoggedIn()) router.push('/dashboard');

const scroll = ()=> setScrolled(window.scrollY > 10);

window.addEventListener('scroll',scroll);

return ()=> window.removeEventListener('scroll',scroll);

},[router]);

function scrollTo(id:string){

document.getElementById(id)?.scrollIntoView({behavior:'smooth'});

}

return (

<div style={{
fontFamily:'Inter,system-ui,sans-serif',
background:'#FAFAFA',
minHeight:'100vh'
}}>

{/* NAVBAR */}

<nav style={{
position:'sticky',
top:0,
zIndex:50,
height:70,
display:'flex',
alignItems:'center',
justifyContent:'space-between',
padding:'0 48px',
background: scrolled ? 'rgba(255,255,255,0.9)' : 'white',
backdropFilter:'blur(12px)',
borderBottom:'1px solid #F0EFF8'
}}>

<Logo size="sm"/>

<div style={{display:'flex',gap:12}}>

{[
{label:'Features',id:'features'},
{label:'Pricing',id:'pricing'},
{label:'Blog',id:'blog'}
].map(i=>(
<button
key={i.label}
onClick={()=>scrollTo(i.id)}
style={{
border:'none',
background:'none',
cursor:'pointer',
padding:'8px 14px',
borderRadius:8,
fontSize:14,
color:'#6B7280'
}}
>
{i.label}
</button>
))}

</div>

<div style={{display:'flex',gap:10}}>

<button
onClick={()=>router.push('/login')}
style={{
border:'1px solid #E5E7EB',
background:'none',
padding:'8px 18px',
borderRadius:8,
cursor:'pointer'
}}
>
Log in
</button>

<button
onClick={()=>router.push('/register')}
style={{
border:'none',
background:'#534AB7',
color:'white',
padding:'8px 22px',
borderRadius:8,
fontWeight:600,
cursor:'pointer'
}}
>
Get started
</button>

</div>

</nav>

{/* HERO */}

<section style={{
padding:'120px 24px 80px',
textAlign:'center',
background:'linear-gradient(180deg,#F0EFF8 0%,#FAFAFA 100%)'
}}>

<h1 style={{
fontSize:'clamp(40px,6vw,64px)',
fontWeight:800,
letterSpacing:'-2px',
marginBottom:20,
color:'#1a1a2e'
}}>
Grow your audience
<br/>
<span style={{color:'#534AB7'}}>10× faster with AI</span>
</h1>

<p style={{
fontSize:18,
color:'#6B7280',
maxWidth:520,
margin:'0 auto 40px',
lineHeight:1.7
}}>
Real-time analytics, AI caption scoring, brand deal management
and a 24/7 AI assistant built for creators.
</p>

<div style={{display:'flex',justifyContent:'center',gap:12}}>

<button
onClick={()=>router.push('/register')}
style={{
background:'#534AB7',
color:'white',
border:'none',
padding:'14px 36px',
borderRadius:10,
fontWeight:700,
cursor:'pointer',
boxShadow:'0 8px 28px rgba(83,74,183,0.35)'
}}
>
Start for free →
</button>

<button
onClick={()=>router.push('/login')}
style={{
background:'white',
border:'1px solid #E5E7EB',
padding:'14px 36px',
borderRadius:10,
fontWeight:600,
cursor:'pointer'
}}
>
View demo
</button>

</div>

</section>

{/* FEATURES */}

<section id="features" style={{padding:'100px 48px'}}>

<div style={{maxWidth:1100,margin:'0 auto'}}>

<h2 style={{
fontSize:40,
fontWeight:800,
textAlign:'center',
marginBottom:60
}}>
Everything a creator needs
</h2>

<div style={{
display:'grid',
gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',
gap:24
}}>

{[
{icon:BarChart3,title:'Unified analytics'},
{icon:Brain,title:'AI caption scoring'},
{icon:Rocket,title:'Multi-platform publish'},
{icon:Handshake,title:'Brand deal pipeline'},
{icon:Bell,title:'Real-time alerts'},
{icon:MessageCircle,title:'AI growth assistant'}
].map((f,i)=>{

const Icon = f.icon;

return (

<div
key={f.title}
style={{
background:'white',
borderRadius:16,
padding:28,
border:'1px solid #F0EFF8',
transition:'all .2s'
}}
>

<div style={{
width:44,
height:44,
borderRadius:12,
background:'#F4F3FB',
display:'flex',
alignItems:'center',
justifyContent:'center',
marginBottom:14,
color:'#534AB7'
}}>
<Icon size={22}/>
</div>

<div style={{
fontSize:16,
fontWeight:700,
marginBottom:6
}}>
{f.title}
</div>

<p style={{fontSize:14,color:'#6B7280'}}>
Powerful tools designed to help creators grow faster.
</p>

</div>

)

})}

</div>

</div>

</section>

{/* CTA */}

<section style={{
padding:'120px 48px',
textAlign:'center'
}}>

<h2 style={{
fontSize:44,
fontWeight:800,
marginBottom:20
}}>
Your audience is waiting
</h2>

<button
onClick={()=>router.push('/register')}
style={{
background:'#534AB7',
color:'white',
border:'none',
padding:'16px 40px',
borderRadius:10,
fontWeight:700,
cursor:'pointer'
}}
>
Start for free →
</button>

</section>

{/* FOOTER */}

<footer style={{
borderTop:'1px solid #F0EFF8',
padding:40,
textAlign:'center',
color:'#9CA3AF'
}}>

<Logo size="sm"/>

<div style={{marginTop:10}}>
© 2026 CreatorInsight
</div>

</footer>

</div>

);
}