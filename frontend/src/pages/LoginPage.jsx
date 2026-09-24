import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = await login(email, password);
      if (userData.role === 'ADMIN') navigate('/admin/dashboard');
      else if (userData.role === 'AUTHORITY') navigate('/authority/dashboard');
      else navigate('/citizen/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 mx-auto flex items-center justify-center shadow-xs">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sign In to CityWise</h2>
          <p className="text-xs text-slate-500 font-medium">Jaipur Municipal Citizen & Officer Portal</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. citizen@citywise.org"
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Role Selectors */}
        <div className="pt-4 border-t border-slate-200 space-y-2">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">Quick Role Selectors</div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => fillDemo('citizen@citywise.org', 'password123')}
              className="p-2.5 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 rounded-xl text-indigo-700 font-medium text-left transition"
            >
              Citizen (Rajesh)
            </button>
            <button
              type="button"
              onClick={() => fillDemo('roads@citywise.org', 'password123')}
              className="p-2.5 bg-purple-50 hover:bg-purple-100/80 border border-purple-200 rounded-xl text-purple-700 font-medium text-left transition"
            >
              PWD Roads Officer
            </button>
            <button
              type="button"
              onClick={() => fillDemo('water@citywise.org', 'password123')}
              className="p-2.5 bg-cyan-50 hover:bg-cyan-100/80 border border-cyan-200 rounded-xl text-cyan-700 font-medium text-left transition"
            >
              PHED Water Officer
            </button>
            <button
              type="button"
              onClick={() => fillDemo('admin@citywise.org', 'admin123')}
              className="p-2.5 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 rounded-xl text-rose-700 font-medium text-left transition"
            >
              Nagar Nigam Admin
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 pt-2">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
            Register as Citizen
          </Link>
        </div>

      </div>
    </div>
  );
}

