import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const finishLogin = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setError('Google sign in did not return a login token.');
        return;
      }

      try {
        await loginWithToken(token);
        navigate('/dashboard', { replace: true });
      } catch {
        setError('Google sign in failed. Please try again.');
      }
    };

    finishLogin();
  }, [loginWithToken, navigate, searchParams]);

  return (
    <div className="min-h-screen bg-[#f3f1fa] flex items-center justify-center p-4 font-sans">
      <div className="bg-white/80 backdrop-blur-3xl border border-white/60 rounded-[2rem] shadow-[0_24px_70px_rgba(0,0,0,0.08)] p-8 w-full max-w-sm text-center">
        {error ? (
          <>
            <h1 className="text-xl font-black text-zinc-900 mb-3">Sign in failed</h1>
            <p className="text-sm font-medium text-zinc-500 mb-6">{error}</p>
            <button
              type="button"
              onClick={() => navigate('/login', { replace: true })}
              className="w-full bg-[#1c1c1e] text-white py-4 rounded-2xl font-black hover:bg-black transition-all"
            >
              Back to login
            </button>
          </>
        ) : (
          <>
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#8e85fd]" />
            <h1 className="text-xl font-black text-zinc-900">Finishing sign in</h1>
          </>
        )}
      </div>
    </div>
  );
}
