import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 h-16 border-b transition-all duration-300 ${
        scrolled
          ? 'border-surface-700 bg-white/95 shadow-sm backdrop-blur-xl'
          : 'border-surface-700/60 bg-white/90 backdrop-blur-md'
      }`}
    >
      <div className="page-container flex h-full items-center justify-between gap-6">
        <Link to="/" className="group flex shrink-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent shadow-sm transition-shadow group-hover:shadow-md">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-surface-50 sm:text-lg">
            AntiFake<span className="text-accent">News</span>
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

          <Link to="/login" className="btn-primary">
            Đăng nhập
          </Link>
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
              <Link to="/login" className="btn-primary justify-center">
                Đăng nhập
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
