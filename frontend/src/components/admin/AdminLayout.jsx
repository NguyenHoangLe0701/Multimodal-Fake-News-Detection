import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const getPageTitle = (path) => {
    if (path === '/admin') return 'Dashboard Overview';
    if (path.includes('/logs')) return 'Prediction Logs';
    if (path.includes('/users')) return 'User Management';
    return 'Admin Panel';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface-900 font-body text-surface-200">
      <AdminSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <main className="relative flex min-w-0 flex-1 flex-col">
        <AdminHeader
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          title={getPageTitle(location.pathname)}
        />

        <div className="admin-content">
          <div className="mx-auto max-w-7xl animate-fade-up">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
