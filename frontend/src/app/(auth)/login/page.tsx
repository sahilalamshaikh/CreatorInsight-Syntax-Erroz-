'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { setTokens } from '@/lib/auth';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('demo@creatorinsight.app');
  const [password, setPassword] = useState('Demo1234!');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login({ email, password });
      setTokens(res.data.access_token, res.data.refresh_token);
      router.push('/dashboard');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-2xl font-medium mb-1">
            <span style={{ color: '#534AB7' }}>Creator</span>Insight
          </div>
          <div className="text-sm text-gray-500">Sign in to your account</div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          {/* Demo hint */}
          <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 mb-5 text-[12px] text-purple-700">
            <strong>Demo account:</strong> demo@creatorinsight.app / Demo1234!
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[12px] font-medium text-gray-600 block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-purple-400"
              />
            </div>
            <div>
              <label className="text-[12px] font-medium text-gray-600 block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-purple-400"
              />
            </div>
            {error && <div className="text-[12px] text-red-500">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-white text-[13px] font-medium transition-opacity"
              style={{ background: '#534AB7', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-[12px] text-gray-400 mt-4">
            No account?{' '}
            <Link href="/register" className="text-purple-600 hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
