import { useState, useEffect, useMemo } from 'react';
import { Shield, User, Ban, Loader2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { m as motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });

        if (!usersError && usersData) {
          setUsers(usersData);
        }
      } catch (error) {
        console.error('Error fetching data from Supabase:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Blocked' : 'Active';
    // Optimistic UI update
    setUsers((prevUsers) =>
      prevUsers.map((u) =>
        u.id === id ? { ...u, status: newStatus } : u
      )
    );
    // Update Database
    try {
      const { error } = await supabase.from('users').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      
      // Optional: Add toast success here if you import toast
    } catch (e) {
      console.error("Lỗi cập nhật trạng thái:", e);
      // Revert if error
      setUsers((prevUsers) => 
        prevUsers.map((u) => (u.id === id ? { ...u, status: currentStatus } : u))
      );
      alert('Không thể cập nhật trạng thái. Vui lòng kiểm tra quyền truy cập hoặc cấu hình RLS.');
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const searchLower = searchTerm.toLowerCase();
      const nameMatch = (user.full_name || '').toLowerCase().includes(searchLower);
      const emailMatch = (user.email || '').toLowerCase().includes(searchLower);
      return nameMatch || emailMatch;
    });
  }, [users, searchTerm]);

  // Render loading state

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={36} />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2 className="page-title text-2xl md:text-3xl">Quản lý Người dùng</h2>
        <p className="page-subtitle !mt-0">Theo dõi, phân quyền và quản lý tài khoản hệ thống.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card overflow-hidden"
      >
        {/* Toolbar in card */}
        <div className="card-header border-b border-surface-700 bg-surface-900 p-4 flex justify-between items-center">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-surface-400" />
            </div>
            <input
              type="text"
              aria-label="Tìm kiếm người dùng"
              placeholder="Tìm kiếm email, tên người dùng..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="input-field !pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-auto max-h-[65vh]">
          <table className="data-table min-w-[860px]">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Ngày tham gia</th>
                <th className="text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((user) => (
                <tr key={user.id} className="group">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-surface-700 bg-surface-900 text-sm font-bold text-surface-200">
                        {(user.full_name || user.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-surface-100">
                          {user.full_name || user.email || 'Unknown User'}
                        </p>
                        <p className="text-[11px] text-surface-500">
                          {user.full_name ? user.email : `ID: ${user.id.substring(0, 8)}...`}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      {user.role === 'admin' ? (
                        <>
                          <Shield size={13} className="text-purple-600" />
                          <span className="text-sm font-medium text-purple-600">Admin</span>
                        </>
                      ) : (
                        <>
                          <User size={13} className="text-surface-400" />
                          <span className="text-sm text-surface-300">User</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        (user.status || 'Active') === 'Active' ? 'badge-real' : 'badge-fake'
                      }`}
                    >
                      {user.status || 'Active'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap text-sm text-surface-400">
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString('vi-VN')
                      : 'Không rõ'}
                  </td>
                  <td className="text-right">
                    <button
                      type="button"
                      onClick={() => toggleStatus(user.id, user.status || 'Active')}
                      aria-label={user.status === 'Banned' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                      className={`btn-icon btn-icon-sm ${
                        (user.status || 'Active') === 'Active'
                          ? 'hover:border-red-200 hover:bg-red-50 hover:text-danger'
                          : 'hover:border-emerald-200 hover:bg-emerald-50 hover:text-accent'
                      }`}
                      title={
                        (user.status || 'Active') === 'Active'
                          ? 'Chặn người dùng'
                          : 'Bỏ chặn'
                      }
                    >
                      {(user.status || 'Active') === 'Active' ? <Ban size={16} /> : <Shield size={16} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-surface-900 rounded-full flex items-center justify-center mb-4">
                <User size={32} className="text-surface-400" />
              </div>
              <p className="text-surface-100 font-semibold mb-1">Không tìm thấy người dùng</p>
              <p className="text-surface-400 text-sm">Chưa có người dùng nào khớp với tìm kiếm của bạn.</p>
            </div>
          )}
          {filteredUsers.length > itemsPerPage && (
            <div className="flex items-center justify-between border-t border-surface-700 bg-surface-900 px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-surface-300 ring-1 ring-inset ring-surface-700 hover:bg-surface-800 disabled:opacity-50"
                >
                  Trước
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.min(p + 1, Math.ceil(filteredUsers.length / itemsPerPage)))}
                  disabled={currentPage === Math.ceil(filteredUsers.length / itemsPerPage)}
                  className="relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-surface-300 ring-1 ring-inset ring-surface-700 hover:bg-surface-800 disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-surface-300">
                    Hiển thị <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> đến{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, filteredUsers.length)}
                    </span>{' '}
                    trên tổng số <span className="font-medium">{filteredUsers.length}</span> người dùng
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      type="button"
                      onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-surface-400 ring-1 ring-inset ring-surface-700 hover:bg-surface-800 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft size={16} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentPage(p => Math.min(p + 1, Math.ceil(filteredUsers.length / itemsPerPage)))}
                      disabled={currentPage === Math.ceil(filteredUsers.length / itemsPerPage)}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-surface-400 ring-1 ring-inset ring-surface-700 hover:bg-surface-800 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight size={16} aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminUsers;
