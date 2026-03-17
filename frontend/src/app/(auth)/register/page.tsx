'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { setTokens } from '@/lib/auth';
import Link from 'next/link';

export default function RegisterPage() {

  const router = useRouter();

  const [form, setForm] = useState({
    email: '',
    username: '',
    full_name: '',
    password: '',
    niche: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {

    e.preventDefault();
    setLoading(true);
    setError('');

    try {

      const res = await authApi.register(form);

      setTokens(res.data.access_token, res.data.refresh_token);

      router.push('/dashboard');

    } catch (err: any) {

      setError(err.response?.data?.detail || 'Registration failed');

    } finally {
      setLoading(false);
    }

  }

  return (

<div className="min-h-screen bg-gradient-to-br from-indigo-100 via-sky-100 to-purple-100 flex items-center justify-center p-6">

<div className="w-full max-w-md">

{/* Logo */}

<div className="text-center mb-8">

<h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
<span className="text-indigo-600">Creator</span>Insight
</h1>

<p className="text-sm text-gray-500 mt-2">
Create your account
</p>

</div>

{/* Card */}

<div className="bg-white border border-gray-100 rounded-2xl shadow-xl p-8">

<form onSubmit={handleSubmit} className="space-y-5">

{[
{ field: 'full_name', label: 'Full name', type: 'text', placeholder: 'Alex Kim' },
{ field: 'username', label: 'Username', type: 'text', placeholder: 'alexkim' },
{ field: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
{ field: 'password', label: 'Password', type: 'password', placeholder: '8+ characters' },
{ field: 'niche', label: 'Your niche (optional)', type: 'text', placeholder: 'Lifestyle & Wellness' },
].map(({ field, label, type, placeholder }) => (

<div key={field}>

<label className="text-xs font-medium text-gray-600 block mb-1">
{label}
</label>

<input
type={type}
placeholder={placeholder}
value={(form as any)[field]}
onChange={e => update(field, e.target.value)}
required={field !== 'niche'}
className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
/>

</div>

))}

{error && (
<div className="text-xs text-red-500">
{error}
</div>
)}

<button
type="submit"
disabled={loading}
className="w-full py-2.5 rounded-lg text-white text-sm font-medium transition"
style={{
background: '#4F46E5',
opacity: loading ? 0.7 : 1
}}
>

{loading ? 'Creating account…' : 'Create account'}

</button>

</form>

<p className="text-center text-xs text-gray-400 mt-6">

Already have an account?{' '}

<Link
href="/login"
className="text-indigo-600 hover:underline"
>
Sign in
</Link>

</p>

</div>

</div>

</div>

  );

}