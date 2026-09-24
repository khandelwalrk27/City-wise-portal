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
  BarChart3, 
  ChevronDown,
  Shield,
  Menu,
  X,
  FileCheck,
  CheckCircle2,
  Layers,
  ArrowRight,
  Sparkles,
  PhoneCall,
  UserCheck
} from 'lucide-react';

export default function Navbar() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  // Close drawer when location changes
  useEffect(() => {
    setIsMenuOpen(false);
    setShowNotifications(false);
    setShowRoleMenu(false);
  }, [location.pathname]);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setShowNotifications(false);
        setShowRoleMenu(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
      setIsMenuOpen(false);
      if (email.includes('admin')) navigate('/admin/dashboard');
      else if (email.includes('citizen')) navigate('/citizen/dashboard');
      else navigate('/authority/dashboard');
    } catch (e) {
      alert('Role switch failed: ' + (e.response?.data?.error || e.message));
    }
  };

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Left: Brand Logo & Region */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs group-hover:bg-indigo-700 transition">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-slate-900 tracking-tight">
                  CityWise
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-50 text-rose-700 rounded-md border border-rose-200">
                  JAIPUR
                </span>
              </div>
            </Link>

            {/* Quick Public Explorer Chips (Desktop) */}
            <div className="hidden lg:flex items-center gap-1.5 ml-4 pl-4 border-l border-slate-200 text-xs font-semibold">
              <Link 
                to="/map" 
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${location.pathname === '/map' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
              >
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                Jaipur Map
              </Link>
              <Link 
                to="/community" 
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${location.pathname === '/community' ? 'bg-amber-50 text-amber-800 font-bold border border-amber-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
              >
                <Users className="w-3.5 h-3.5 text-amber-600" />
                Complaints Feed
              </Link>
            </div>
          </div>

          {/* Right: Actions + Prominent Three-Bar Menu Button */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* Quick Report Issue Button */}
            <Link 
              to="/citizen/report" 
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Report Issue</span>
              <span className="sm:hidden">Report</span>
            </Link>

            {/* Quick Role Switcher Pill */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition"
                title="Switch User Role"
              >
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden md:inline">Roles</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 text-xs">
                  <div className="px-3 py-1.5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Quick Role Switch</div>
                  <button 
                    onClick={() => handleQuickRoleSwitch('citizen@citywise.org', 'password123')}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">Rajesh Sharma</div>
                      <div className="text-[10px] text-slate-400">Citizen • Malviya Nagar</div>
                    </div>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-semibold">Citizen</span>
                  </button>
                  <button 
                    onClick={() => handleQuickRoleSwitch('roads@citywise.org', 'password123')}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">PWD Roads Dept</div>
                      <div className="text-[10px] text-slate-400">Pothole & Road Repair</div>
                    </div>
                    <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded font-semibold">Authority</span>
                  </button>
                  <button 
                    onClick={() => handleQuickRoleSwitch('water@citywise.org', 'password123')}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">PHED Water Dept</div>
                      <div className="text-[10px] text-slate-400">Water Supply & Leakage</div>
                    </div>
                    <span className="text-[10px] bg-cyan-50 text-cyan-700 border border-cyan-200 px-2 py-0.5 rounded font-semibold">Authority</span>
                  </button>
                  <button 
                    onClick={() => handleQuickRoleSwitch('sanitation@citywise.org', 'password123')}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">Nagar Nigam Sanitation</div>
                      <div className="text-[10px] text-slate-400">Garbage & Drainage</div>
                    </div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-semibold">Authority</span>
                  </button>
                  <button 
                    onClick={() => handleQuickRoleSwitch('admin@citywise.org', 'admin123')}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 flex items-center justify-between border-t border-slate-100 mt-1 pt-2"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">Municipal Admin</div>
                      <div className="text-[10px] text-slate-400">All Wards & Policy</div>
                    </div>
                    <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded font-semibold">Admin</span>
                  </button>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 relative transition"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 max-h-96 overflow-y-auto">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                      <h4 className="font-bold text-xs text-slate-800">Notifications</h4>
                      <span className="text-[11px] text-indigo-600 font-semibold">{unreadCount} unread</span>
                    </div>
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4 text-center">No notifications</p>
                    ) : (
                      <div className="space-y-2">
                        {notifications.map(n => (
                          <div key={n.id} className={`p-2.5 rounded-xl text-xs border ${n.is_read ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-indigo-50/50 border-indigo-200 text-slate-800'}`}>
                            <div className="font-bold text-indigo-900">{n.title}</div>
                            <div className="mt-0.5">{n.message}</div>
                            <div className="text-[10px] text-slate-400 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* User Quick Info */}
            {user && (
              <div className="hidden sm:flex items-center gap-2 pl-1">
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-800 max-w-[120px] truncate">{user.name}</div>
                  <div className="text-[10px] text-indigo-600 uppercase font-bold tracking-wider">{user.role}</div>
                </div>
              </div>
            )}

            {/* THREE-BAR MENU BUTTON (HAMBURGER) */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 flex items-center gap-1.5 transition active:scale-95"
              aria-label="Open Navigation Menu"
              title="Navigation Menu"
            >
              <Menu className="w-5 h-5 text-slate-800" />
              <span className="hidden sm:inline text-xs font-bold text-slate-700">Menu</span>
            </button>

          </div>
        </div>
      </header>

      {/* THREE-BAR MENU NAVIGATION DRAWER OVERLAY */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/40 transition-opacity animate-fade-in"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Drawer Container */}
          <div className="relative w-full max-w-sm sm:max-w-md bg-white h-full shadow-2xl z-10 flex flex-col border-l border-slate-200 overflow-y-auto">
            
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                    CityWise Jaipur
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-rose-50 text-rose-700 rounded border border-rose-200">
                      NAV
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">Municipal Operations Portal</div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200 border border-slate-200 transition"
                aria-label="Close Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current User Card */}
            <div className="p-5 border-b border-slate-200 bg-white">
              {user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center font-black text-indigo-700 text-sm">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{user.name}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[160px]">{user.email}</div>
                      <div className="mt-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wide">
                          {user.role} Active
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => { logout(); setIsMenuOpen(false); }}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition flex items-center gap-1 text-xs font-semibold"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-700">Access Citizen & Authority Services</div>
                  <div className="flex gap-2">
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex-1 py-2 text-center text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex-1 py-2 text-center text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition"
                    >
                      Register
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Sections */}
            <div className="p-5 space-y-6 flex-1">
              
              {/* Quick Action Button in Drawer */}
              <Link
                to="/citizen/report"
                onClick={() => setIsMenuOpen(false)}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center justify-between transition"
              >
                <div className="flex items-center gap-2">
                  <PlusCircle className="w-4 h-4" />
                  <span>Report New Civic Problem</span>
                </div>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-medium">Live Camera</span>
              </Link>

              {/* Section 1: Citizen Services */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                  Citizen Portal
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  <Link
                    to="/citizen/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className={`p-3 rounded-xl border flex items-center justify-between transition ${location.pathname === '/citizen/dashboard' ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-bold' : 'bg-slate-50/50 hover:bg-slate-100 border-slate-200 text-slate-700'}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-100/70 text-indigo-700 flex items-center justify-center">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Citizen Hub & Overview</div>
                        <div className="text-[10px] text-slate-500">Track complaints and local ward metrics</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>

                  <Link
                    to="/citizen/my-issues"
                    onClick={() => setIsMenuOpen(false)}
                    className={`p-3 rounded-xl border flex items-center justify-between transition ${location.pathname === '/citizen/my-issues' ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-bold' : 'bg-slate-50/50 hover:bg-slate-100 border-slate-200 text-slate-700'}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-100/70 text-amber-800 flex items-center justify-center">
                        <FileCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">My Submissions & Approvals</div>
                        <div className="text-[10px] text-slate-500">Verify resolutions and review proof</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                </div>
              </div>

              {/* Section 2: Department Authority Hub */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-purple-600" />
                  Department Authorities
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  <Link
                    to="/authority/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className={`p-3 rounded-xl border flex items-center justify-between transition ${location.pathname === '/authority/dashboard' ? 'bg-purple-50 border-purple-200 text-purple-900 font-bold' : 'bg-slate-50/50 hover:bg-slate-100 border-slate-200 text-slate-700'}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-purple-100/70 text-purple-700 flex items-center justify-center">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Authority Control Center</div>
                        <div className="text-[10px] text-slate-500">Live operational dispatch & stats</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>

                  <Link
                    to="/authority/issues"
                    onClick={() => setIsMenuOpen(false)}
                    className={`p-3 rounded-xl border flex items-center justify-between transition ${location.pathname === '/authority/issues' ? 'bg-purple-50 border-purple-200 text-purple-900 font-bold' : 'bg-slate-50/50 hover:bg-slate-100 border-slate-200 text-slate-700'}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-cyan-100/70 text-cyan-800 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Assigned Issues Queue</div>
                        <div className="text-[10px] text-slate-500">Submit resolution evidence photos</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>

                  <Link
                    to="/authority/analytics"
                    onClick={() => setIsMenuOpen(false)}
                    className={`p-3 rounded-xl border flex items-center justify-between transition ${location.pathname === '/authority/analytics' ? 'bg-purple-50 border-purple-200 text-purple-900 font-bold' : 'bg-slate-50/50 hover:bg-slate-100 border-slate-200 text-slate-700'}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100/70 text-emerald-800 flex items-center justify-center">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Resolution Analytics</div>
                        <div className="text-[10px] text-slate-500">Turnaround time & SLA tracking</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                </div>
              </div>

              {/* Section 3: Municipal Administration */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-rose-600" />
                  Nagar Nigam Admin
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className={`p-3 rounded-xl border flex items-center justify-between transition ${location.pathname === '/admin/dashboard' ? 'bg-rose-50 border-rose-200 text-rose-900 font-bold' : 'bg-slate-50/50 hover:bg-slate-100 border-slate-200 text-slate-700'}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-rose-100/70 text-rose-700 flex items-center justify-center">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Admin Headquarters</div>
                        <div className="text-[10px] text-slate-500">City-wide complaint monitoring</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>

                  <Link
                    to="/admin/wards"
                    onClick={() => setIsMenuOpen(false)}
                    className={`p-3 rounded-xl border flex items-center justify-between transition ${location.pathname === '/admin/wards' ? 'bg-rose-50 border-rose-200 text-rose-900 font-bold' : 'bg-slate-50/50 hover:bg-slate-100 border-slate-200 text-slate-700'}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-100/70 text-amber-800 flex items-center justify-center">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Wards & GeoJSON Inspector</div>
                        <div className="text-[10px] text-slate-500">150 Jaipur ward boundaries & Parshads</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>

                  <Link
                    to="/admin/authorities"
                    onClick={() => setIsMenuOpen(false)}
                    className={`p-3 rounded-xl border flex items-center justify-between transition ${location.pathname === '/admin/authorities' ? 'bg-rose-50 border-rose-200 text-rose-900 font-bold' : 'bg-slate-50/50 hover:bg-slate-100 border-slate-200 text-slate-700'}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-100/70 text-indigo-700 flex items-center justify-center">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Authority Routing Rules</div>
                        <div className="text-[10px] text-slate-500">Configure department assignments</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                </div>
              </div>

              {/* Section 4: Public Civic Intelligence */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  Public Explorers
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  <Link
                    to="/map"
                    onClick={() => setIsMenuOpen(false)}
                    className="p-3 rounded-xl bg-slate-50/50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between transition text-slate-700"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Jaipur Ward Boundary Map</div>
                        <div className="text-[10px] text-slate-500">Live spatial pins and boundary outlines</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>

                  <Link
                    to="/community"
                    onClick={() => setIsMenuOpen(false)}
                    className="p-3 rounded-xl bg-slate-50/50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between transition text-slate-700"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-100/70 text-amber-700 flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Community Complaints Feed</div>
                        <div className="text-[10px] text-slate-500">Public issues across all 150 wards</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>

                  <Link
                    to="/about"
                    onClick={() => setIsMenuOpen(false)}
                    className="p-3 rounded-xl bg-slate-50/50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between transition text-slate-700"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-100/70 text-indigo-700 flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">How CityWise Works</div>
                        <div className="text-[10px] text-slate-500">8-step verified lifecycle guide</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                </div>
              </div>

              {/* Quick Role Switcher Inside Drawer */}
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
                  Quick Role Switch
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <button
                    onClick={() => handleQuickRoleSwitch('citizen@citywise.org', 'password123')}
                    className="p-2 bg-indigo-50/70 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-indigo-800 font-semibold text-left transition"
                  >
                    Citizen (Rajesh)
                  </button>
                  <button
                    onClick={() => handleQuickRoleSwitch('roads@citywise.org', 'password123')}
                    className="p-2 bg-purple-50/70 hover:bg-purple-100 border border-purple-200 rounded-xl text-purple-800 font-semibold text-left transition"
                  >
                    PWD Roads
                  </button>
                  <button
                    onClick={() => handleQuickRoleSwitch('water@citywise.org', 'password123')}
                    className="p-2 bg-cyan-50/70 hover:bg-cyan-100 border border-cyan-200 rounded-xl text-cyan-800 font-semibold text-left transition"
                  >
                    PHED Water
                  </button>
                  <button
                    onClick={() => handleQuickRoleSwitch('admin@citywise.org', 'admin123')}
                    className="p-2 bg-rose-50/70 hover:bg-rose-100 border border-rose-200 rounded-xl text-rose-800 font-semibold text-left transition"
                  >
                    Nagar Nigam Admin
                  </button>
                </div>
              </div>

            </div>

            {/* Drawer Footer with Municipal Helplines */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/60 text-center space-y-1">
              <div className="text-[11px] font-bold text-slate-600 flex items-center justify-center gap-1.5">
                <PhoneCall className="w-3 h-3 text-indigo-600" />
                Jaipur Municipal Helpline: 1800-180-6127
              </div>
              <div className="text-[10px] text-slate-400">
                GeoJSON Spatial Routing & Open-Meteo Weather Online
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

