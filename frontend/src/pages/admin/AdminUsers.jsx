import { useState, useEffect } from 'react';
import { Shield, User, Ban, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAdminUsers } from '../../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAdminUsers();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
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
    </div>
  );
};

export default AdminUsers;
