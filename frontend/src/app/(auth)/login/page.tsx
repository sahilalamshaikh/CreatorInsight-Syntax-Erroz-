'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { setTokens } from '@/lib/auth';
import Link from 'next/link';

export default function LoginPage() {

  const router = useRouter();

  const [email,setEmail]=useState('demo@creatorinsight.app');
  const [password,setPassword]=useState('Demo1234!');
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);

  async function handleSubmit(e:React.FormEvent){
    e.preventDefault();
    setLoading(true);
    setError('');

    try{

      const res = await authApi.login({email,password});

      setTokens(res.data.access_token,res.data.refresh_token);

      router.push('/dashboard');

    }catch{
      setError('Invalid email or password');
    }finally{
      setLoading(false);
    }
  }

  return(

<div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-100 to-purple-100 flex items-center justify-center p-6">

<div className="w-full max-w-md">

{/* Logo */}

<div className="text-center mb-8">

<h1 className="text-3xl font-semibold tracking-tight text-gray-900">
<span className="text-indigo-600">Creator</span>Insight
</h1>

<p className="text-sm text-gray-500 mt-2">
Sign in to your account
</p>

</div>

{/* Card */}

<div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">

{/* Demo hint */}

<div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 mb-6 text-xs text-indigo-700">

<strong>Demo account:</strong> demo@creatorinsight.app / Demo1234!

</div>

<form onSubmit={handleSubmit} className="space-y-5">

{/* Email */}

<div>

<label className="text-xs font-medium text-gray-600 block mb-1">
Email
</label>

<input
type="email"
value={email}
onChange={e=>setEmail(e.target.value)}
required
className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
/>

</div>

{/* Password */}

<div>

<label className="text-xs font-medium text-gray-600 block mb-1">
Password
</label>

<input
type="password"
value={password}
onChange={e=>setPassword(e.target.value)}
required
className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
/>

</div>

{/* Error */}

{error && (
<div className="text-xs text-red-500">
{error}
</div>
)}

{/* Button */}

<button
type="submit"
disabled={loading}
className="w-full py-2.5 rounded-lg text-white text-sm font-medium transition"
style={{
background:'#4F46E5',
opacity:loading?0.7:1
}}
>

{loading?'Signing in…':'Sign in'}

</button>

</form>

<p className="text-center text-xs text-gray-400 mt-6">

No account?{' '}

<Link
href="/register"
className="text-indigo-600 hover:underline"
>
Register
</Link>

</p>

</div>

</div>

</div>

  );
}