import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  History, 
  Users, 
  LogOut,
  X,
  ShieldCheck
} from 'lucide-react';

const AdminSidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Prediction Logs', href: '/admin/logs', icon: History },
    { name: 'Users', href: '/admin/users', icon: Users },
  ];

  return (
    <aside 
      className={`shrink-0 bg-[#0f0f13]/95 backdrop-blur-xl border-r border-[#222228] flex flex-col h-full z-20 relative transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-20'}`}
    >
      {/* Brand & Toggle */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#222228] shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="shrink-0 bg-gradient-to-br from-[#10b981] to-[#059669] p-1.5 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <ShieldCheck size={20} className="text-white" />
          </div>
          {isSidebarOpen && (
            <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400 whitespace-nowrap">
              FakeNews
            </span>
          )}
        </div>
        
        {isSidebarOpen && (
          <button 
            onClick={toggleSidebar} 
            className="p-1.5 rounded-md hover:bg-[#222228] text-gray-400 transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 hide-scrollbar">
        <ul className="space-y-2 px-3">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || (location.pathname.startsWith(item.href) && item.href !== '/admin');
            return (
              <li key={item.name} title={!isSidebarOpen ? item.name : undefined}>
                <Link
                  to={item.href}
                  className={`flex items-center px-3 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                    isActive 
                      ? 'bg-gradient-to-r from-[#10b981]/10 to-transparent text-[#10b981]' 
                      : 'text-gray-400 hover:bg-[#18181d] hover:text-gray-200'
                  }`}
                >
                  {isActive && (
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#10b981] rounded-r-md shadow-[0_0_10px_rgba(16,185,129,0.8)]"
                    />
                  )}
                  
                  <div className="shrink-0 flex items-center justify-center w-6 h-6">
                    <item.icon 
                      size={20} 
                      className={`transition-colors duration-300 ${
                        isActive ? 'text-[#10b981]' : 'text-gray-500 group-hover:text-gray-300'
                      }`} 
                    />
                  </div>

                  {isSidebarOpen && (
                    <span className="ml-3 font-medium whitespace-nowrap">
                      {item.name}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-[#222228] shrink-0">
        <button 
          title={!isSidebarOpen ? 'Logout' : undefined}
          className={`flex items-center w-full py-3 text-sm font-medium text-gray-400 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 group ${
            isSidebarOpen ? 'px-3 justify-start' : 'px-0 justify-center'
          }`}
        >
          <div className="shrink-0 flex items-center justify-center w-6 h-6">
            <LogOut size={20} className="text-gray-500 group-hover:text-red-500 transition-colors" />
          </div>
          
          {isSidebarOpen && (
            <span className="ml-3 font-medium whitespace-nowrap">
              Logout
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
