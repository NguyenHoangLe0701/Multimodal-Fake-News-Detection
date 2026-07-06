import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShieldCheck, LogOut, LayoutDashboard } from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';
import adminAvatar from '../assets/admin.jpg';

const navLinks = [
  { to: '/', label: 'Trang chủ' },
  { to: '/detect', label: 'Kiểm tra tin' },
  { to: '/history', label: 'Lịch sử' },
  { to: '/about', label: 'Công nghệ' },
];

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user:v1') || localStorage.getItem('user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll, { passive: true });
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('user:v1');
    localStorage.removeItem('user');
    setUser(null);
    window.location.reload();
  };

  return (
    <header
      className={`sticky inset-x-0 top-0 z-50 h-20 border-b transition-all duration-500 ${
        scrolled
          ? 'border-white/20 bg-white/80 shadow-[0_4px_30px_rgba(0,0,0,0.05)] backdrop-blur-2xl'
          : 'border-transparent bg-white/40 backdrop-blur-lg'
      }`}
    >
      <div className="page-container flex h-full items-center justify-between gap-6">
        <Link to="/" className="group flex shrink-0 items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-surface-800 shadow-lg shadow-accent/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-accent/40 border border-surface-700">
            <img src="/app-logo.png" alt="Logo" className="h-full w-full object-cover" />
          </div>
          <span className="text-xl font-black tracking-tight text-surface-100">
            AntiFake<span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-teal-500">News</span>
          </span>
        </Link>

        <div className="hidden items-center gap-4 md:flex">
          <nav className="nav-pills">
            {navLinks.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`nav-pill-link ${active ? 'is-active' : ''}`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-white shadow-sm"
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.45 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {user ? (
            <div className="flex items-center gap-4 ml-4 border-l border-surface-700/40 pl-6">
              <div className="flex items-center gap-3 bg-white/50 px-3 py-1.5 rounded-full border border-white shadow-sm">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-white font-bold text-sm shadow-inner overflow-hidden border border-white">
                  {user.role === 'admin' ? (
                    <img src={adminAvatar} alt="Admin" className="h-full w-full object-cover" />
                  ) : user.avatar_url ? (
                    <img src={user.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    (user.name || user.email || 'U').charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex flex-col pr-2">
                  {!(user.role === 'admin' && ['admin', 'administrator'].includes((user.name || '').toLowerCase())) && (
                    <span className="text-[13px] font-bold text-surface-100 leading-tight">
                      {user.name || user.email.split('@')[0]}
                    </span>
                  )}
                  {user.role === 'admin' && (
                    <span className="text-[10px] font-semibold text-accent uppercase tracking-wider">Admin</span>
                  )}
                </div>
              </div>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/50 border border-white shadow-sm text-surface-400 hover:text-accent hover:bg-accent/5 hover:border-accent/20 transition-all"
                  title="Trang quản trị"
                >
                  <LayoutDashboard size={18} />
                </Link>
              )}
              <button 
                type="button"
                onClick={handleLogout}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/50 border border-white shadow-sm text-surface-400 hover:text-danger hover:bg-red-50 hover:border-red-100 transition-all"
                title="Đăng xuất"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-primary">
              Đăng nhập
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
          className="btn-icon md:hidden"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-b border-surface-700 bg-white md:hidden"
          >
            <nav className="page-container flex flex-col gap-2 py-5">
              {navLinks.map((link) => {
                const active = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`rounded-full px-5 py-3 text-[15px] font-medium transition-colors ${
                      active
                        ? 'bg-accent/10 text-accent'
                        : 'text-surface-300 hover:bg-surface-800'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="my-2 h-px bg-surface-700" />
              {user ? (
                <div className="flex flex-col gap-3 px-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#9333EA] text-white font-bold text-lg shadow-md ring-2 ring-white overflow-hidden">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="Avatar" className="h-full w-full object-cover bg-white" />
                      ) : (
                        (user.name || user.email || 'U').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-surface-50">{user.name || user.email.split('@')[0]}</div>
                      <div className="text-xs text-surface-400">{user.email}</div>
                    </div>
                  </div>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="btn-secondary w-full justify-center text-accent border-accent/20 hover:bg-accent/5 mt-2">
                      <LayoutDashboard size={18} /> Trang quản trị
                    </Link>
                  )}
                  <button type="button" onClick={handleLogout} className="btn-secondary w-full justify-center text-danger border-red-100 hover:bg-red-50 mt-2">
                    <LogOut size={18} /> Đăng xuất
                  </button>
                </div>
              ) : (
                <Link to="/login" className="btn-primary justify-center">
                  Đăng nhập
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
