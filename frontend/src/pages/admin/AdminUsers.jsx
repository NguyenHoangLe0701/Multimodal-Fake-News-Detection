import { useState, useEffect } from 'react';
import { Shield, User, Ban, Loader2, History, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAdminUsers } from '../../services/api';
import { supabase } from '../../lib/supabaseClient';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loginHistory, setLoginHistory] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Lấy lịch sử đăng nhập từ Database Supabase
        const { data: logsData, error: logsError } = await supabase
          .from('login_logs')
          .select('*')
          .order('login_time', { ascending: false });
          
        if (!logsError && logsData) {
          setLoginHistory(logsData.filter(log => log.role !== 'admin'));
          
          // Trích xuất danh sách user duy nhất từ login_logs để làm User Management (vì Supabase Auth không cho phép lấy trực tiếp từ client)
          const uniqueUsersMap = new Map();
          logsData.forEach(log => {
            if (log.role !== 'admin' && !uniqueUsersMap.has(log.email)) {
              uniqueUsersMap.set(log.email, {
                id: log.id.toString(),
                email: log.email,
                role: 'user',
                status: 'Active',
                created_at: log.login_time
              });
            }
          });
          setUsers(Array.from(uniqueUsersMap.values()));
        }
      } catch (error) {
        console.error('Error fetching data from Supabase:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleStatus = async (id, currentStatus) => {
    setUsers(
      users.map((u) =>
        u.id === id
          ? { ...u, status: currentStatus === 'Active' ? 'Blocked' : 'Active' }
          : u
      )
    );
  };

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
        <h2 className="page-title text-2xl md:text-3xl">User Management</h2>
        <p className="page-subtitle !mt-0">Quản lý tài khoản người dùng và phân quyền truy cập.</p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card overflow-hidden"
      >
        <div className="overflow-x-auto">
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
            {users.map((user) => (
              <tr key={user.id} className="group">
                <td>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-surface-700 bg-surface-900 text-sm font-bold text-surface-200">
                      {(user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-surface-100">
                        {user.email || 'Unknown User'}
                      </p>
                      <p className="text-[11px] text-surface-500">
                        ID: {user.id.substring(0, 8)}...
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
                    ? new Date(user.created_at).toLocaleDateString()
                    : 'Không rõ'}
                </td>
                <td className="text-right">
                  <button
                    type="button"
                    onClick={() => toggleStatus(user.id, user.status || 'Active')}
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
                    <Ban size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="p-8 text-center text-surface-400">Không có người dùng nào.</div>
        )}
      </div>
    </motion.div>

      {/* Login History Section */}
      <div className="mt-16 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm">
          <History size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-surface-50 tracking-tight">Lịch sử đăng nhập</h2>
          <p className="mt-1 text-sm text-surface-400">Theo dõi thời gian truy cập của người dùng trên hệ thống.</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="data-table min-w-[600px]">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Vai trò</th>
                <th>Thời gian đăng nhập</th>
              </tr>
            </thead>
            <tbody>
              {loginHistory.map((log, index) => (
                <tr key={index} className="group">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-surface-700 bg-surface-900 text-sm font-bold text-surface-200">
                        {(log.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <p className="text-sm font-semibold text-surface-100">
                        {log.email}
                      </p>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-800 rounded-full w-fit border border-surface-700">
                        <User size={13} className="text-surface-300" />
                        <span className="text-sm text-surface-300 font-medium">User</span>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap">
                    <div className="flex items-center gap-2 text-surface-300">
                      <LogIn size={14} className="text-surface-500" />
                      <span className="text-sm font-medium">{new Date(log.login_time || log.time).toLocaleString('vi-VN')}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loginHistory.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-800/50 mb-4">
                <History size={28} className="text-surface-500" />
              </div>
              <p className="text-base font-medium text-surface-300">Chưa có lịch sử đăng nhập</p>
              <p className="mt-1 text-sm text-surface-500">Lịch sử đăng nhập của người dùng sẽ xuất hiện tại đây.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminUsers;
