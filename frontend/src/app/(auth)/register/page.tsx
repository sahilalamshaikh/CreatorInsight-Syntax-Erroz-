'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { setTokens } from '@/lib/auth';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', username: '', full_name: '', password: '', niche: '' });
  const [error, setError]   = useState('');
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-2xl font-medium mb-1">
            <span style={{ color: '#534AB7' }}>Creator</span>Insight
          </div>
          <div className="text-sm text-gray-500">Create your account</div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { field: 'full_name', label: 'Full name',  type: 'text',     placeholder: 'Alex Kim' },
              { field: 'username',  label: 'Username',   type: 'text',     placeholder: 'alexkim' },
              { field: 'email',     label: 'Email',      type: 'email',    placeholder: 'you@example.com' },
              { field: 'password',  label: 'Password',   type: 'password', placeholder: '8+ characters' },
              { field: 'niche',     label: 'Your niche (optional)', type: 'text', placeholder: 'Lifestyle & Wellness' },
            ].map(({ field, label, type, placeholder }) => (
              <div key={field}>
                <label className="text-[12px] font-medium text-gray-600 block mb-1">{label}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={(form as any)[field]}
                  onChange={e => update(field, e.target.value)}
                  required={field !== 'niche'}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-purple-400"
                />
              </div>
            ))}
            {error && <div className="text-[12px] text-red-500">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-white text-[13px] font-medium"
              style={{ background: '#534AB7', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
          <p className="text-center text-[12px] text-gray-400 mt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-purple-600 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
