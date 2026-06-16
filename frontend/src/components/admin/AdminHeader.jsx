import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, Search, ChevronDown, LogOut, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const AdminHeader = ({ isSidebarOpen, toggleSidebar, title }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
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
    // Perform logout logic here (e.g. clear tokens)
    setIsProfileOpen(false);
    navigate('/');
  };

  return (
    <header className="h-16 shrink-0 bg-[#0f0f13]/70 backdrop-blur-md border-b border-[#222228] flex items-center justify-between px-4 sm:px-6 z-10 sticky top-0">
      <div className="flex items-center gap-4">
        {!isSidebarOpen && (
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-[#18181d] text-gray-400 hover:text-white transition-colors shrink-0"
          >
            <Menu size={20} />
          </button>
        )}
        <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400 hidden sm:block whitespace-nowrap">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        {/* Search Bar */}
        <div className="hidden md:flex relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-500 group-focus-within:text-[#10b981] transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-[#2e2e36] rounded-full leading-5 bg-[#18181d] text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#10b981] focus:border-[#10b981] transition-all sm:text-sm"
            placeholder="Search..."
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-full hover:bg-[#18181d] text-gray-400 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-[#0f0f13]"></span>
        </button>

        <div className="w-px h-6 bg-[#2e2e36] hidden sm:block"></div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 hover:bg-[#18181d] p-1.5 pr-2 rounded-full transition-colors border border-transparent hover:border-[#2e2e36]"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#10b981] to-[#06b6d4] p-[2px]">
              <img 
                className="h-full w-full rounded-full object-cover border-2 border-[#0f0f13]"
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                alt="Admin avatar" 
              />
            </div>
            <div className="text-sm text-left hidden sm:block">
              <p className="font-semibold text-gray-200 leading-tight">Admin User</p>
              <p className="text-xs text-[#10b981]">Super Admin</p>
            </div>
            <motion.div
              animate={{ rotate: isProfileOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={16} className="text-gray-500 hidden sm:block" />
            </motion.div>
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-56 bg-[#18181d]/90 backdrop-blur-xl border border-[#2e2e36] rounded-xl shadow-2xl overflow-hidden py-2 z-50"
              >
                <div className="px-4 py-3 border-b border-[#2e2e36] sm:hidden">
                  <p className="font-semibold text-gray-200">Admin User</p>
                  <p className="text-xs text-[#10b981]">Super Admin</p>
                </div>
                
                <Link 
                  to="/"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-[#222228] transition-colors"
                >
                  <Home size={16} className="text-gray-500" />
                  Return to Website
                </Link>
                
                <div className="h-px bg-[#2e2e36] my-1 mx-2"></div>
                
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors w-full text-left"
                >
                  <LogOut size={16} />
                  Logout
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
