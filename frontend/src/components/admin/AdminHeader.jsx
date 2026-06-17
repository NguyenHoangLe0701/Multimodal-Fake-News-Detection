import { useState, useRef, useEffect } from 'react';
import { Menu, Bell, Search, ChevronDown, LogOut, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const AdminHeader = ({ isSidebarOpen, toggleSidebar, title }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsProfileOpen(false);
    navigate('/');
  };

  return (
    <header className="admin-header sticky top-0 z-10 shrink-0">
      <div className="flex min-w-0 items-center gap-3">
        {!isSidebarOpen && (
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Mở sidebar"
            className="btn-icon btn-icon-sm shrink-0"
          >
            <Menu size={18} />
          </button>
        )}
        <h1 className="truncate text-lg font-bold text-surface-50 md:text-xl">{title}</h1>
      </div>

      <div className="admin-header-actions">
        <div className="admin-search-wrap">
          <Search size={17} className="admin-search-icon" />
          <input
            type="text"
            className="admin-search"
            placeholder="Tìm kiếm logs, users..."
          />
        </div>

        <div className="hidden h-8 w-px bg-surface-700 md:block" />

        <button type="button" aria-label="Thông báo" className="btn-icon relative shrink-0">
          <Bell size={18} />
          <span className="absolute right-2.5 top-2.5 block h-2 w-2 rounded-full bg-danger ring-2 ring-white" />
        </button>

        <div className="relative shrink-0" ref={profileRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="admin-profile-btn"
          >
            <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-accent to-accent-dark p-[2px]">
              <img
                className="h-full w-full rounded-full border-2 border-white object-cover"
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="Admin avatar"
              />
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold leading-tight text-surface-100">Admin User</p>
              <p className="text-[11px] text-accent">Super Admin</p>
            </div>
            <motion.div
              animate={{ rotate: isProfileOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="hidden sm:block"
            >
              <ChevronDown size={15} className="text-surface-400" />
            </motion.div>
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="admin-dropdown"
              >
                <div className="admin-dropdown-header sm:hidden">
                  <p className="font-semibold text-surface-100">Admin User</p>
                  <p className="text-xs text-accent">Super Admin</p>
                </div>

                <Link
                  to="/"
                  onClick={() => setIsProfileOpen(false)}
                  className="admin-dropdown-item"
                >
                  <Home size={16} className="text-surface-400" />
                  Về trang chủ
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="admin-dropdown-item admin-dropdown-item-danger"
                >
                  <LogOut size={16} />
                  Đăng xuất
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
