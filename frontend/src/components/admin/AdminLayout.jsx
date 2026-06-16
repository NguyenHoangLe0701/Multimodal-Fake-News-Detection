import React, { useState } from 'react';
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
    <div className="flex h-screen bg-[#09090b] text-gray-200 font-sans overflow-hidden selection:bg-[#10b981] selection:text-black">
      {/* Sidebar */}
      <AdminSidebar 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Glow effect behind main content */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#10b981]/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#06b6d4]/10 blur-[120px] rounded-full pointer-events-none" />

        {/* Header */}
        <AdminHeader 
          isSidebarOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar}
          title={getPageTitle(location.pathname)}
        />

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth z-10 relative">
          <div className="mx-auto max-w-7xl animate-fade-up">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
