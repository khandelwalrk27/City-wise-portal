import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Building2, 
  MapPin, 
  Users, 
  PlusCircle, 
  Bell, 
  LogOut, 
  User, 
  BarChart3, 
  Layers,
  ChevronDown,
  Shield,
  CheckCircle2
} from 'lucide-react';

export default function Navbar() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, location.pathname]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (e) {}
  };

  const handleQuickRoleSwitch = async (email, password) => {
    try {
      await login(email, password);
      setShowRoleMenu(false);
      if (email.includes('admin')) navigate('/admin/dashboard');
      else if (email.includes('citizen')) navigate('/citizen/dashboard');
      else navigate('/authority/dashboard');
    } catch (e) {
      alert('Role switch failed: ' + (e.response?.data?.error || e.message));
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 flex items-center justify-center shadow-md shadow-indigo-600/30">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white tracking-tight">
              CityWise
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
              JAIPUR
            </span>
          </div>
        </Link>

        {/* Role-Specific Navigation Menu */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
          
          {/* Public / Common Links */}
          <Link 
            to="/map" 
            className={`hover:text-indigo-400 flex items-center gap-1.5 transition ${location.pathname === '/map' ? 'text-indigo-400' : ''}`}
          >
            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
            Jaipur Map
          </Link>

          <Link 
            to="/community" 
            className={`hover:text-indigo-400 flex items-center gap-1.5 transition ${location.pathname === '/community' ? 'text-indigo-400' : ''}`}
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            Community Issues
          </Link>

          {/* Citizen Menu */}
          {user && user.role === 'CITIZEN' && (
            <>
              <Link 
                to="/citizen/dashboard" 
                className={`hover:text-indigo-400 transition ${location.pathname === '/citizen/dashboard' ? 'text-indigo-400 font-bold' : ''}`}
              >
                Citizen Hub
              </Link>
              <Link 
                to="/citizen/my-issues" 
                className={`hover:text-indigo-400 transition ${location.pathname === '/citizen/my-issues' ? 'text-indigo-400 font-bold' : ''}`}
              >
                My Submissions
              </Link>
              <Link 
                to="/citizen/report" 
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-md transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Report Issue
              </Link>
            </>
          )}

          {/* Authority Menu */}
          {user && user.role === 'AUTHORITY' && (
            <>
              <Link 
                to="/authority/dashboard" 
                className={`hover:text-indigo-400 transition ${location.pathname === '/authority/dashboard' ? 'text-indigo-400 font-bold' : ''}`}
              >
                Control Center
              </Link>
              <Link 
                to="/authority/issues" 
                className={`hover:text-indigo-400 transition ${location.pathname === '/authority/issues' ? 'text-indigo-400 font-bold' : ''}`}
              >
                Assigned Queue
              </Link>
              <Link 
                to="/authority/analytics" 
                className={`hover:text-indigo-400 flex items-center gap-1 transition ${location.pathname === '/authority/analytics' ? 'text-indigo-400 font-bold' : ''}`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Analytics
              </Link>
            </>
          )}

          {/* Admin Menu */}
          {user && user.role === 'ADMIN' && (
            <>
              <Link 
                to="/admin/dashboard" 
                className={`hover:text-indigo-400 transition ${location.pathname === '/admin/dashboard' ? 'text-indigo-400 font-bold' : ''}`}
              >
                Admin Portal
              </Link>
              <Link 
                to="/admin/wards" 
                className={`hover:text-indigo-400 transition ${location.pathname === '/admin/wards' ? 'text-indigo-400 font-bold' : ''}`}
              >
                Wards & GeoJSON
              </Link>
              <Link 
                to="/admin/authorities" 
                className={`hover:text-indigo-400 transition ${location.pathname === '/admin/authorities' ? 'text-indigo-400 font-bold' : ''}`}
              >
                Authorities & Routing
              </Link>
              <Link 
                to="/admin/analytics" 
                className={`hover:text-indigo-400 transition ${location.pathname === '/admin/analytics' ? 'text-indigo-400 font-bold' : ''}`}
              >
                City Analytics
              </Link>
            </>
          )}

          <Link to="/about" className="hover:text-indigo-400 transition">
            How It Works
          </Link>
        </nav>

        {/* Right Side Controls */}
        <div className="flex items-center gap-3">
          
          {/* Quick Role Switcher Dropdown (No "Demo" text) */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1.5 transition"
            >
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span>Roles</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-60 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 text-xs">
                <div className="px-3 py-1 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Switch Role Profile</div>
                <button 
                  onClick={() => handleQuickRoleSwitch('citizen@citywise.org', 'password123')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                >
                  <span>Citizen (Rajesh Sharma)</span>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-semibold">Citizen</span>
                </button>
                <button 
                  onClick={() => handleQuickRoleSwitch('roads@citywise.org', 'password123')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                >
                  <span>PWD Roads Officer</span>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-semibold">Authority</span>
                </button>
                <button 
                  onClick={() => handleQuickRoleSwitch('water@citywise.org', 'password123')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                >
                  <span>PHED Water Officer</span>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-semibold">Authority</span>
                </button>
                <button 
                  onClick={() => handleQuickRoleSwitch('sanitation@citywise.org', 'password123')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                >
                  <span>Nagar Nigam Sanitation</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-semibold">Authority</span>
                </button>
                <button 
                  onClick={() => handleQuickRoleSwitch('admin@citywise.org', 'admin123')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center justify-between border-t border-slate-800 mt-1 pt-2"
                >
                  <span>Nagar Nigam Admin</span>
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded font-semibold">Admin</span>
                </button>
              </div>
            )}
          </div>

          {/* User Notifications */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 relative transition"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50 max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                    <h4 className="font-semibold text-xs text-white">Notifications</h4>
                    <span className="text-[11px] text-indigo-400 font-semibold">{unreadCount} unread</span>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4 text-center">No notifications</p>
                  ) : (
                    <div className="space-y-2">
                      {notifications.map(n => (
                        <div key={n.id} className={`p-2.5 rounded-lg text-xs border ${n.is_read ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-900 border-indigo-500/30 text-slate-200'}`}>
                          <div className="font-semibold text-indigo-300">{n.title}</div>
                          <div className="mt-0.5">{n.message}</div>
                          <div className="text-[10px] text-slate-500 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* User Profile & Auth */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-semibold text-white">{user.name}</div>
                <div className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider">{user.role}</div>
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 hover:text-rose-400 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition">
                Sign In
              </Link>
              <Link to="/register" className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition">
                Register
              </Link>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
