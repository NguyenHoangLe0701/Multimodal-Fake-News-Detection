import React, { useState, useEffect } from 'react';
import { Shield, User, Ban, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/users');
        const result = await response.json();
        if (result.status === 'success') {
          setUsers(result.data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const toggleStatus = async (id, currentStatus) => {
    // Usually this would call an API like DELETE /api/admin/users/<id>
    // For now, we simulate UI update
    setUsers(users.map(u => u.id === id ? { ...u, status: currentStatus === 'Active' ? 'Blocked' : 'Active' } : u));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin text-[#10b981]" size={40} />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-[#18181d]/80 backdrop-blur-sm rounded-2xl border border-[#2e2e36] overflow-hidden"
    >
      {/* Table section begins directly */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#222228]/50 border-b border-[#2e2e36]">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined Date</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2e2e36]">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-[#222228]/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-gray-300 font-bold border border-gray-600">
                      {(user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-200">{user.email || 'Unknown User'}</p>
                      <p className="text-xs text-gray-500">ID: {user.id.substring(0, 8)}...</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    {user.role === 'admin' ? (
                      <><Shield size={14} className="text-purple-400" /><span className="text-sm font-medium text-purple-400">Admin</span></>
                    ) : (
                      <><User size={14} className="text-gray-400" /><span className="text-sm text-gray-400">User</span></>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    (user.status || 'Active') === 'Active' 
                      ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                      : 'bg-red-500/10 text-red-500 border-red-500/20'
                  }`}>
                    {user.status || 'Active'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button 
                    onClick={() => toggleStatus(user.id, user.status || 'Active')}
                    className={`p-2 rounded-lg transition-colors ${
                      (user.status || 'Active') === 'Active'
                        ? 'text-gray-500 hover:text-red-400 hover:bg-red-500/10'
                        : 'text-gray-500 hover:text-green-400 hover:bg-green-500/10'
                    }`}
                    title={(user.status || 'Active') === 'Active' ? 'Block User' : 'Unblock User'}
                  >
                    <Ban size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="p-8 text-center text-gray-500">No users found.</div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminUsers;
