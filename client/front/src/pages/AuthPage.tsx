/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Flame, Mail, Lock, User, ArrowLeft, ArrowRight, Loader2, Eye, EyeOff, Sparkles, ShieldCheck } from 'lucide-react';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
}

export default function AuthPage({ initialMode = 'login' }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'register');
  const [showPassword, setShowPassword] = useState(false);

  // Sync state if initialMode changes
  useEffect(() => {
    setIsSignUp(initialMode === 'register');
  }, [initialMode]);

  // Sign-in state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const { login, register, startGoogleLogin } = useAuth();
  const navigate = useNavigate();

  // Reset errors when switching states
  useEffect(() => {
    setLoginError('');
    setRegError('');
  }, [isSignUp]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      await login(loginEmail, loginPassword);

      navigate('/dashboard');

    } catch (err: any) {
      setLoginError(err.message || 'Invalid email or password');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError('');

    try {
      await register(regName, regEmail, regPassword);

      navigate('/dashboard');

    } catch (err: any) {
      setRegError(err.message || 'Failed to create account');
    } finally {
      setRegLoading(false);
    }
  };

  const handleGoogleSignInClick = async () => {
    setLoginLoading(true);
    setRegLoading(true);
    try {
      await startGoogleLogin();
    } catch (err) {
      // Safe fallback
    } finally {
      setLoginLoading(false);
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050506] flex items-center justify-center p-4 md:p-8 relative overflow-hidden font-sans select-none selection:bg-amber-500/20">

      <button
        type="button"
        onClick={() => navigate('/')}
        aria-label="Back to landing page"
        className="absolute left-4 top-4 md:left-8 md:top-8 z-50 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-xs font-semibold text-zinc-300 backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-[#f5b35c]/30 hover:bg-[#f5b35c]/10 hover:text-[#f4e7d1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5b35c]"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to home</span>
      </button>

      {/* Cinematic Dynamic Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Warm Golden Glow Left */}
        <div className="absolute left-[-10%] top-[-10%] w-[55vw] h-[55vw] rounded-full bg-radial-gradient from-[#f5b35c]/12 to-transparent blur-[96px] opacity-75" />
        {/* Cool Aqua Glow Right */}
        <div className="absolute right-[-10%] bottom-[-10%] w-[48vw] h-[48vw] rounded-full bg-radial-gradient from-[#69b8cc]/8 to-transparent blur-[84px] opacity-70" />
        {/* Tech Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.035] bg-[radial-gradient(circle_at_center,rgba(244,241,234,0.6)_1px,transparent_1.5px)] bg-[size:36px_36px]" />
      </div>

      {/* ── 1. MAIN INTUITIVE WRAPPER CONTAINER ── */}
      {/* 
        This is our relative, overflow-hidden parent structure that has fixed, perfectly balanced proportions.
        It is completely constrained to avoid floating card escapes on desktop, and wraps into a neat form on mobile grids.
      */}
      <div
        id="main-auth-card"
        className="relative overflow-hidden w-full max-w-md md:max-w-5xl h-auto md:h-[660px] rounded-[30px] border border-white/5 bg-[#09090b]/90 backdrop-blur-2xl shadow-[0_32px_120px_rgba(0,0,0,0.85)] z-10 flex flex-col md:flex-row"
      >
        {/* Glass Top Sheen Filter */}
        <div className="absolute inset-0 pointer-events-none rounded-[30px] bg-gradient-to-br from-white/[0.04] to-transparent [mask-image:linear-gradient(to_bottom,black,transparent_55%)] z-10" />

        {/* ── LEFT HALF: SIGN-IN PANEL (Absolute on desktop, adapts responsive on mobile) ── */}
        <div
          className={`
            w-full md:w-1/2 h-full flex flex-col justify-center px-6 py-10 md:px-14 md:py-0
            md:absolute md:top-0 md:left-0 md:transition-all md:duration-[700ms] md:ease-[cubic-bezier(0.25,1,0.5,1)]
            ${!isSignUp ? 'md:opacity-100 md:translate-x-0 md:pointer-events-auto md:z-20' : 'md:opacity-0 md:-translate-x-12 md:pointer-events-none md:z-10'}
            ${isSignUp ? 'hidden md:flex' : 'flex'}
          `}
        >
          {/* Logo Brand Title */}
          <div className="inline-flex items-center gap-2.5 mb-8 md:mb-12">
            <span className="w-8 h-8 rounded-full bg-[#f4e7d1]/95 flex items-center justify-center border border-amber-500/20 shadow-[0_6px_20px_rgba(245,179,92,0.15)]">
              <Flame className="w-4 h-4 text-black font-bold" />
            </span>
            <span className="text-[10px] tracking-[0.24em] font-mono font-bold uppercase text-zinc-400">CALTRACK</span>
          </div>

          {/* Form Context */}
          <div className="max-w-md w-full mx-auto">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-100 mb-2">
              Welcome back.
            </h1>
            <p className="text-xs text-zinc-500 mb-8">
              Sign in to continue your premium nutrition journey.
            </p>

            {/* Google Authentication Button */}
            <button
              onClick={handleGoogleSignInClick}
              disabled={loginLoading || regLoading}
              className="flex items-center justify-center gap-3 w-full border border-white/5 hover:border-white/10 bg-white/[0.03] hover:bg-white/[0.06] rounded-xl py-3 text-xs font-semibold text-zinc-300 cursor-pointer transition-all duration-200 hover:scale-[1.01]"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            {/* Separator */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-[1px] bg-white/[0.05]" />
              <span className="text-[9px] font-mono font-bold tracking-[0.2em] text-zinc-600 uppercase">OR SECURE MAIL</span>
              <div className="flex-1 h-[1px] bg-white/[0.05]" />
            </div>

            {/* Error messaging */}
            {loginError && (
              <div className="mb-4 text-xs font-medium text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                {loginError}
              </div>
            )}

            {/* Login form fields */}
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div className="relative">
                <span className="absolute left-[14px] top-1/2 -translate-y-1/2 text-zinc-500 flex items-center">
                  <Mail className="w-3.5 h-3.5" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-zinc-800 focus:border-amber-500/30 text-xs rounded-xl py-3.5 pl-[38px] pr-4 text-zinc-200 outline-none transition-all placeholder:text-zinc-600"
                />
              </div>

              <div className="relative">
                <span className="absolute left-[14px] top-1/2 -translate-y-1/2 text-zinc-500 flex items-center">
                  <Lock className="w-3.5 h-3.5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="w-full bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-zinc-800 focus:border-amber-500/30 text-xs rounded-xl py-3.5 pl-[38px] pr-10 text-zinc-200 outline-none transition-all placeholder:text-zinc-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors flex items-center"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors font-medium"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-[#f4e7d1] hover:bg-amber-100 text-black font-semibold rounded-xl py-3.5 text-xs transition-all duration-200 cursor-pointer shadow-[0_12px_32px_rgba(0,0,0,0.25)] flex items-center justify-center gap-1.5 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-55"
              >
                {loginLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-3.5 h-3.5 text-black" />
                  </>
                )}
              </button>
            </form>

            {/* Mobile layout footer toggle */}
            <p className="mt-8 text-center text-xs text-zinc-500 md:hidden">
              Have no account?{' '}
              <button
                onClick={() => setIsSignUp(true)}
                className="text-[#f5b35c] font-semibold cursor-pointer underline decoration-dotted underline-offset-4"
              >
                Create one
              </button>
            </p>
          </div>
        </div>

        {/* ── RIGHT HALF: SIGN-UP PANEL (Absolute on desktop, adapts responsive on mobile) ── */}
        <div
          className={`
            w-full md:w-1/2 h-full flex flex-col justify-center px-6 py-10 md:px-14 md:py-0
            md:absolute md:top-0 md:right-0 md:transition-all md:duration-[700ms] md:ease-[cubic-bezier(0.25,1,0.5,1)]
            ${isSignUp ? 'md:opacity-100 md:translate-x-0 md:pointer-events-auto md:z-20' : 'md:opacity-0 md:translate-x-12 md:pointer-events-none md:z-10'}
            ${!isSignUp ? 'hidden md:flex' : 'flex'}
          `}
        >
          {/* Logo Brand Title */}
          <div className="inline-flex items-center gap-2.5 mb-8 md:mb-12">
            <span className="w-8 h-8 rounded-full bg-[#f4e7d1]/95 flex items-center justify-center border border-amber-500/20 shadow-[0_6px_20px_rgba(245,179,92,0.15)]">
              <Flame className="w-4 h-4 text-black font-bold" />
            </span>
            <span className="text-[10px] tracking-[0.24em] font-mono font-bold uppercase text-zinc-400">CALTRACK</span>
          </div>

          {/* Form Context */}
          <div className="max-w-md w-full mx-auto">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-100 mb-2">
              Start tracking.
            </h1>
            <p className="text-xs text-zinc-500 mb-8">
              Beautifully capture and understand what fuels you.
            </p>

            {/* Google Authentication Button */}
            <button
              onClick={handleGoogleSignInClick}
              disabled={loginLoading || regLoading}
              className="flex items-center justify-center gap-3 w-full border border-white/5 hover:border-white/10 bg-white/[0.03] hover:bg-white/[0.06] rounded-xl py-3 text-xs font-semibold text-zinc-300 cursor-pointer transition-all duration-200 hover:scale-[1.01]"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Register with Google
            </button>

            {/* Separator */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-[1px] bg-white/[0.05]" />
              <span className="text-[9px] font-mono font-bold tracking-[0.2em] text-zinc-600 uppercase">OR REGULAR ACCOUNT</span>
              <div className="flex-1 h-[1px] bg-white/[0.05]" />
            </div>

            {/* Error messaging */}
            {regError && (
              <div className="mb-4 text-xs font-medium text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                {regError}
              </div>
            )}

            {/* Register form fields */}
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="relative">
                <span className="absolute left-[14px] top-1/2 -translate-y-1/2 text-zinc-500 flex items-center">
                  <User className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Full name"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  className="w-full bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-zinc-800 focus:border-amber-500/30 text-xs rounded-xl py-3.5 pl-[38px] pr-4 text-zinc-200 outline-none transition-all placeholder:text-zinc-600"
                />
              </div>

              <div className="relative">
                <span className="absolute left-[14px] top-1/2 -translate-y-1/2 text-zinc-500 flex items-center">
                  <Mail className="w-3.5 h-3.5" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  className="w-full bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-zinc-800 focus:border-amber-500/30 text-xs rounded-xl py-3.5 pl-[38px] pr-4 text-zinc-200 outline-none transition-all placeholder:text-zinc-600"
                />
              </div>

              <div className="relative">
                <span className="absolute left-[14px] top-1/2 -translate-y-1/2 text-zinc-500 flex items-center">
                  <Lock className="w-3.5 h-3.5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Create password"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  className="w-full bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-zinc-800 focus:border-amber-500/30 text-xs rounded-xl py-3.5 pl-[38px] pr-10 text-zinc-200 outline-none transition-all placeholder:text-zinc-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors flex items-center"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={regLoading}
                className="w-full bg-[#f4e7d1] hover:bg-amber-100 text-black font-semibold rounded-xl py-3.5 text-xs transition-all duration-200 cursor-pointer shadow-[0_12px_32px_rgba(0,0,0,0.25)] flex items-center justify-center gap-1.5 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-55 mt-4"
              >
                {regLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                ) : (
                  <>
                    Create account
                    <ArrowRight className="w-3.5 h-3.5 text-black" />
                  </>
                )}
              </button>
            </form>

            {/* Mobile layout footer toggle */}
            <p className="mt-8 text-center text-xs text-zinc-500 md:hidden">
              Have an account?{' '}
              <button
                onClick={() => setIsSignUp(false)}
                className="text-[#f5b35c] font-semibold cursor-pointer underline decoration-dotted underline-offset-4"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>

        {/* ── 3. SLIDING CINEMATIC OVERLAY PANEL (Occupies exactly 50% width) ── */}
        {/* 
          This is the sliding divider card.
          - It is absolute.
          - Sits at `left-1/2` (covering right half by default).
          - Uses clean declarative transitions:
            * `translate-x-0` (Login mode - right-aligned)
            * `-translate-x-full` (Register mode - slides elegantly left to cover left-aligned login form)
          - It is completely constrained with `overflow-hidden` inside the parent wrapper.
        */}
        <div
          id="sliding-cinematic-panel"
          className={`
            absolute top-0 left-1/2 w-1/2 h-full z-30 overflow-hidden hidden md:block
            border border-orange-500/10 cursor-default shadow-3xl bg-gradient-to-br from-[#0e0b06] to-[#0f0c05]
            transition-transform duration-[700ms] ease-[cubic-bezier(0.25,1,0.5,1)]
            ${isSignUp ? '-translate-x-full border-r border-[#f5b35c]/10' : 'translate-x-0 border-l border-[#f5b35c]/10'}
          `}
        >
          {/* Inner Panel Atmospheric Layers */}
          <div className="absolute inset-0 pointer-events-none z-0">
            {/* Swirling Conic Highlight */}
            <div className="absolute inset-0 bg-[conic-gradient(from_140deg_at_60%_40%,rgba(245,179,92,0.18),transparent_22%,rgba(71,123,138,0.08),transparent_52%)] filter blur-[1px]" />
            {/* Micro Radial Ambient Blob */}
            <div className="absolute left-[-20%] top-[-20%] w-[80%] h-[80%] rounded-full bg-radial-gradient from-[#f5b35c]/25 to-transparent blur-[52px] opacity-65" />
            {/* Star dust style details */}
            <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_center,rgba(244,241,234,0.6)_1.2px,transparent_1.6px)] bg-[size:28px_28px]" />
            <div className="absolute inset-0 rounded-[30px] shadow-[inset_0_0_80px_rgba(0,0,0,0.65)]" />
          </div>

          {/* Internal Panel Core Context */}
          <div className="relative h-full w-full z-10 flex flex-col justify-between p-12 text-center items-center">

            {/* Header spacer */}
            <div className="flex items-center gap-1.5 justify-center">
              <Sparkles className="w-3.5 h-3.5 text-[#f5b35c]/50 animate-pulse" />
              <span className="text-[9px] font-mono font-bold tracking-[0.25em] text-zinc-500">OPTIMIZED CORE</span>
            </div>

            {/* Orbit & Spinning Flame Node */}
            <div className="my-auto flex flex-col items-center">
              <div className="relative mb-6">
                {/* Central Flame Orb */}
                <div className="w-[72px] h-[72px] rounded-full bg-[#f4e7d1] flex items-center justify-center border border-amber-500/25 shadow-[0_0_48px_rgba(245,179,92,0.22),_0_12px_36px_rgba(0,0,0,0.5)]">
                  <Flame className="w-8 h-8 text-black" />
                </div>
                {/* Outer spin rings */}
                <div className="absolute inset-[-10px] rounded-full border border-zinc-700/30 animate-[spin_16s_linear_infinite]" />
                <div className="absolute inset-[-20px] rounded-full border border-dashed border-[#f5b35c]/10 animate-[spin_24s_linear_infinite_reverse]" />
              </div>

              <p className="text-[10px] tracking-[0.35em] font-mono font-bold uppercase text-[#f5b35c]/50 mb-3">CALTRACK EXPERT</p>
              <h2 className="text-2xl font-bold text-zinc-100 tracking-tight leading-tight mb-3">
                {isSignUp ? 'Already tracking?' : 'New here?'}
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-[260px] mb-8">
                {isSignUp
                  ? 'Sign in and pick up right where your dynamic health analytics left off.'
                  : 'Join thousands optimizing their daily macronutrient profile.'}
              </p>

              {/* Mode Toggle Switch Trigger */}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="group flex items-center gap-2.5 rounded-full border border-[#f4e7d1]/20 hover:border-[#f4e7d1]/40 bg-[#f4e7d1]/5 hover:bg-[#f4e7d1]/10 px-6 py-3 text-xs font-bold text-zinc-200 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>{isSignUp ? 'Sign in' : 'Create account'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>

            {/* Micro details stats dashboard bottom */}
            <div className="w-full space-y-2 max-w-[280px]">
              <div className="flex items-center gap-1.5 justify-center mb-1 text-[10px] font-mono text-zinc-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/65" /> Verified Performance
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 border border-white/[0.04] bg-white/[0.01] rounded-xl text-xs">
                <span className="text-zinc-500 text-[11px]">Macro Accuracy</span>
                <span className="font-mono font-bold text-[#f5b35c]">94%</span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 border border-white/[0.04] bg-white/[0.01] rounded-xl text-xs">
                <span className="text-zinc-500 text-[11px]">Global Logs Traced</span>
                <span className="font-mono font-bold text-[#f5b35c]">184K+</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
