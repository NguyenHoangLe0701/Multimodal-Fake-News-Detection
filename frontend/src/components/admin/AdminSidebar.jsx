import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import adminAvatar from '../../assets/admin.jpg';
import {
  LayoutDashboard,
  History,
  Users,
  LogOut,
  PanelLeftClose,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Prediction Logs', href: '/admin/logs', icon: History },
  { name: 'Users', href: '/admin/users', icon: Users },
];

const AdminSidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user] = useState(() => {
    const savedUser = localStorage.getItem('user:v1') || localStorage.getItem('user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <aside
      className={`relative z-20 flex h-full shrink-0 flex-col border-r border-surface-700 bg-white transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'w-72' : 'w-[84px]'
      }`}
    >
      <div className="flex h-[4.25rem] shrink-0 items-center justify-between border-b border-surface-700 px-4">
        <Link 
          to="/" 
          className="flex min-w-0 items-center gap-3 transition-opacity hover:opacity-80"
          title="Về trang chủ"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-800 shadow-sm border border-surface-700">
            <img src="/app-logo.png" alt="Logo" className="h-full w-full object-cover" />
          </div>
          {isSidebarOpen && (
            <span className="truncate text-base font-bold text-surface-50">
              AntiFakeNews
            </span>
          )}
        </Link>

        {isSidebarOpen && (
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Thu gọn sidebar"
            className="btn-icon btn-icon-sm shrink-0"
          >
            <PanelLeftClose size={16} />
          </button>
        )}
      </div>

      <nav className="hide-scrollbar flex-1 overflow-y-auto px-4 py-6">
        {isSidebarOpen && (
          <p className="admin-sidebar-section">Menu</p>
        )}

        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive =
              location.pathname === item.href ||
              (location.pathname.startsWith(item.href) && item.href !== '/admin');
            return (
              <li key={item.name} title={!isSidebarOpen ? item.name : undefined}>
                <Link
                  to={item.href}
                  className={`admin-nav-link ${isActive ? 'is-active' : ''} ${
                    !isSidebarOpen ? 'justify-center px-0' : ''
                  }`}
                >
                  <item.icon
                    size={20}
                    className={`shrink-0 ${
                      isActive ? 'text-accent' : 'text-surface-400'
                    }`}
                  />
                  {isSidebarOpen && <span className="truncate">{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="admin-sidebar-footer">
        {isSidebarOpen ? (
          <>
            <div className="admin-user-mini">
              <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-[#2563EB] to-[#9333EA] p-[2px] shadow-md">
                <img
                  className="h-full w-full rounded-full border-2 border-white object-cover bg-white"
                  src={adminAvatar}
                  alt="Admin avatar"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-surface-100">
                  {user ? (user.name || user.email.split('@')[0]) : 'Admin User'}
                </p>
                <p className="text-xs text-accent">Super Admin</p>
              </div>
            </div>
            <button type="button" onClick={handleLogout} className="admin-logout-btn">
              <LogOut size={18} />
              Đăng xuất
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={handleLogout}
            title="Đăng xuất"
            className="admin-logout-btn admin-logout-btn-collapsed"
          >
            <LogOut size={18} />
          </button>
        )}
      </div>
    </aside>
  );
};

export default AdminSidebar;
