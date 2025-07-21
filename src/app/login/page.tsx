'use client';
import React, { useState } from 'react';
import { useAuth } from '../AuthWrapper';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const {
    user,
    loading,
    userLogin,
    setEmail,
    setPassword,
    email,
    password,
    userLogout,
  } = useAuth();

  const router = useRouter();
  const [step, setStep] = useState<'email' | 'otp' | 'done'>(user ? 'done' : 'email');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already logged in
  React.useEffect(() => {
    if (!loading && user) {
      router.replace('/');
    }
  }, [user, loading, router]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setStep('otp');
        setInfo('OTP sent to your email.');
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Failed to send OTP');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setSubmitting(true);
    try {
      const ok = await userLogin(email, otp);
      if (ok) {
        setStep('done');
        setInfo('Logged in!');
        router.replace('/'); // Redirect to root after login
      } else {
        setError('Invalid OTP');
      }
    } catch (err) {
      setError('Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (user && step === 'done')
    return (
      <div>
        <h2>Welcome, {user.email}!</h2>
        <button onClick={userLogout}>Logout</button>
      </div>
    );

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {info && <div className="text-green-600 mb-2">{info}</div>}
      {step === 'email' && (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>
      )}
      {step === 'otp' && (
        <form onSubmit={handleOtpSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
      )}
    </div>
  );
};

export default LoginPage; 