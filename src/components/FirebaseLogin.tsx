import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { LogIn, AlertCircle, Loader2 } from 'lucide-react';

interface FirebaseLoginProps {
  onLogin: () => void;
}

/*
 * LOGIN SETTINGS
 * --------------------------------------------------
 * Yahan se User ID change kar sakte ho.
 *
 * Firebase ka actual email internally use hoga,
 * isliye existing Firebase UID aur Firestore data
 * bilkul same rahenge.
 */
const LOGIN_USER_ID = 'Pioneerjaipur';
const FIREBASE_LOGIN_EMAIL = 'rk7033154856@gmail.com';

export function FirebaseLogin({ onLogin }: FirebaseLoginProps) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId.trim() || !password) {
      setError('User ID aur password dono enter karein.');
      return;
    }

    if (userId.trim() !== LOGIN_USER_ID) {
      setError('User ID ya password galat hai.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(
        auth,
        FIREBASE_LOGIN_EMAIL,
        password
      );

      onLogin();
    } catch (err: any) {
      console.error('Firebase login error:', err);

      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found'
      ) {
        setError('User ID ya password galat hai.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Bahut attempts ho gaye. Thodi der baad try karein.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8">

          <div className="text-center mb-8">
            <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg">
              <LogIn className="w-7 h-7 text-white" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900">
              Export ROI
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Sign in to continue
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                User ID
              </label>

              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter your User ID"
                autoComplete="username"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 flex items-center justify-center gap-2 transition"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>

          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            Secure Firebase Authentication
          </p>

        </div>
      </div>
    </div>
  );
}