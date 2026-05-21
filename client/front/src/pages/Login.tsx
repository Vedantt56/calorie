import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, Chrome as Google, Facebook, Apple, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, startGoogleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f1fa] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Abstract Background Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#adff00] blur-[120px] opacity-20 rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#8e85fd] blur-[120px] opacity-20 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      {/* Decorative Orbs */}
      <div className="absolute ring-1 ring-zinc-200 rounded-full w-[600px] h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none"></div>
      <div className="absolute ring-1 ring-zinc-300 rounded-full w-[400px] h-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none"></div>

      <div className="w-full max-w-md z-10 transition-all duration-700 animate-in fade-in slide-in-from-bottom-8">
        <div className="bg-white/70 backdrop-blur-3xl border border-white/50 rounded-[2.5rem] shadow-[0_32px_80px_rgba(0,0,0,0.08)] p-10 overflow-hidden relative">
          
          {/* Header Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-white rounded-3xl shadow-[0_8px_20px_rgba(0,0,0,0.04)] flex items-center justify-center border border-zinc-100 group hover:scale-110 transition-all duration-300">
              <LogIn className="w-8 h-8 text-[#1c1c1e] group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight mb-2">Sign in with email</h1>
            <p className="text-zinc-500 text-sm font-medium leading-relaxed px-4">
              Track your journey, reach your goals, and unlock your full potential. For free.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100 animate-in fade-in zoom-in-95">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-[#8e85fd] transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                required
                className="w-full bg-zinc-50/50 border border-zinc-100 rounded-2xl py-4 pl-14 pr-5 focus:outline-none focus:ring-4 focus:ring-[#8e85fd]/10 focus:border-[#8e85fd] focus:bg-white transition-all text-zinc-900 font-medium placeholder-zinc-400"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-[#8e85fd] transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                required
                className="w-full bg-zinc-50/50 border border-zinc-100 rounded-2xl py-4 pl-14 pr-5 focus:outline-none focus:ring-4 focus:ring-[#8e85fd]/10 focus:border-[#8e85fd] focus:bg-white transition-all text-zinc-900 font-medium placeholder-zinc-400"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex justify-end pr-1 text-xs font-bold text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer">
              Forgot password?
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1c1c1e] text-white py-5 rounded-2xl font-black text-lg shadow-[0_12px_30px_rgba(0,0,0,0.15)] hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                'Get Started'
              )}
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-100 border-dashed"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-black text-zinc-300">
              <span className="bg-white/80 backdrop-blur-md px-4">Or sign in with</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <SocialButton label="Sign in with Google" icon={<Google />} onClick={startGoogleLogin} />
            <SocialButton icon={<Facebook />} />
            <SocialButton icon={<Apple />} />
          </div>

          <div className="mt-10 text-center animate-in fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
            <p className="text-sm font-bold text-zinc-400">
              New here? <Link to="/register" className="text-[#8e85fd] hover:underline">Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SocialButton({
  icon,
  label,
  onClick
}: {
  icon: React.ReactNode;
  label?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex items-center justify-center py-4 bg-white border border-zinc-100 rounded-2xl shadow-sm text-zinc-900 hover:bg-zinc-50 hover:scale-105 active:scale-95 transition-all"
    >
      {React.isValidElement(icon) && React.cloneElement(icon, { className: 'w-6 h-6 text-zinc-950' } as any)}
    </button>
  );
}
