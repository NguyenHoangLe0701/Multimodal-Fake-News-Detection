import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { ShieldAlert, ShieldCheck, Activity, Users, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAdminStats } from '../../services/api';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-surface-700 bg-white p-3 shadow-lg">
        <p className="mb-1 text-sm font-medium text-surface-100">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-xs">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getAdminStats();
        setData(response);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={36} />
      </div>
    );
  }

  const stats = [
    {
      title: 'Tổng lượt kiểm tra',
      value: data?.total_predictions || 0,
      icon: Activity,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
    },
    {
      title: 'Tin giả phát hiện',
      value: data?.fake_count || 0,
      icon: ShieldAlert,
      color: 'text-danger',
      bg: 'bg-red-50',
      border: 'border-red-100',
    },
    {
      title: 'Tin thật xác minh',
      value: data?.real_count || 0,
      icon: ShieldCheck,
      color: 'text-accent',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
    {
      title: 'Tổng người dùng',
      value: data?.total_users || 0,
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-100',
    },
  ];

  const pieData = [
    { name: 'Fake', value: data?.fake_count || 0, color: '#dc2626' },
    { name: 'Real', value: data?.real_count || 0, color: '#059669' },
  ];

  const barData = [
    { name: 'Mon', fake: 120, real: 50 },
    { name: 'Tue', fake: 98, real: 45 },
    { name: 'Wed', fake: 150, real: 60 },
    { name: 'Thu', fake: 110, real: 55 },
    { name: 'Fri', fake: 140, real: 70 },
    { name: 'Sat', fake: 180, real: 85 },
    { name: 'Sun', fake: 44, real: 41 },
  ];



  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2 className="page-title text-2xl md:text-3xl">Tổng quan hệ thống</h2>
        <p className="page-subtitle !mt-0">Thống kê hoạt động phát hiện tin giả theo thời gian thực.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="card flex items-center gap-5 p-7 transition-shadow hover:shadow-md"
          >
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${stat.bg} ${stat.border} ${stat.color}`}
            >
              <stat.icon size={24} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-surface-400">{stat.title}</p>
              <h3 className="mt-1 text-3xl font-bold text-surface-50">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="card p-7 lg:col-span-1"
        >
          <h3 className="mb-5 text-base font-semibold text-surface-50">Tỷ lệ Fake vs Real</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#64748b', fontSize: '13px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="card p-7 lg:col-span-2"
        >
          <h3 className="mb-5 text-base font-semibold text-surface-50">Dự đoán theo tuần</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip cursor={{ fill: 'rgba(15, 23, 42, 0.03)' }} content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#64748b', fontSize: '13px' }} />
                <Bar dataKey="fake" name="Tin giả" fill="#dc2626" radius={[4, 4, 0, 0]} />
                <Bar dataKey="real" name="Tin thật" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
