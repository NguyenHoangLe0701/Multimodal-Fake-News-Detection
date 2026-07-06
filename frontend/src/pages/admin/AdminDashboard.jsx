import { useState, useEffect } from 'react';

import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { ShieldAlert, ShieldCheck, Activity, Users, Loader2 } from 'lucide-react';
import { m as motion } from 'framer-motion';
import { getAdminStats } from '../../services/api';

const defaultBarData = [
  { name: 'Mon', fake: 0, real: 0 },
  { name: 'Tue', fake: 0, real: 0 },
  { name: 'Wed', fake: 0, real: 0 },
  { name: 'Thu', fake: 0, real: 0 },
  { name: 'Fri', fake: 0, real: 0 },
  { name: 'Sat', fake: 0, real: 0 },
  { name: 'Sun', fake: 0, real: 0 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-surface-700 bg-white/90 backdrop-blur-md p-3 shadow-xl">
        <p className="mb-2 text-sm font-bold text-surface-50">{label}</p>
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2 mb-1 last:mb-0 text-sm font-medium" style={{ color: entry.color }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
            {entry.name}: {entry.value}
          </div>
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
        setData(response || {});
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

  const totalPreds = data?.total_predictions || 0;
  const fakeCount = data?.fake_count || 0;
  const realCount = data?.real_count || 0;
  const totalUsers = data?.total_users || 0;

  const stats = [
    {
      title: 'Tổng lượt kiểm tra',
      value: totalPreds,
      icon: Activity,
      colorClass: 'text-blue-600',
    },
    {
      title: 'Tin giả phát hiện',
      value: fakeCount,
      icon: ShieldAlert,
      colorClass: 'text-red-600',
    },
    {
      title: 'Tin thật xác minh',
      value: realCount,
      icon: ShieldCheck,
      colorClass: 'text-emerald-600',
    },
    {
      title: 'Tổng người dùng',
      value: totalUsers,
      icon: Users,
      colorClass: 'text-purple-600',
    },
  ];

  const pieData = [
    { name: 'Tin giả (Fake)', value: fakeCount, color: '#ef4444' },
    { name: 'Tin thật (Real)', value: realCount, color: '#10b981' },
  ];

  
  const barData = data?.weekly_stats || defaultBarData;

  return (
    <div className="admin-page space-y-6">
      <div className="admin-page-header">
        <h2 className="page-title text-2xl md:text-3xl font-extrabold text-surface-50 tracking-tight">Tổng quan hệ thống</h2>
        <p className="page-subtitle text-surface-400 !mt-1">Thống kê tự động từ CSDL theo thời gian thực.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.3 }}
            className="flex items-center gap-5 p-6 rounded-2xl border border-surface-700 bg-white shadow-sm hover:shadow transition-shadow"
          >
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-surface-700 bg-white shadow-sm ${stat.colorClass}`}>
              <stat.icon size={26} strokeWidth={2.2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-surface-400">{stat.title}</p>
              <h3 className="mt-1 text-3xl font-bold text-surface-50">{stat.value.toLocaleString()}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="rounded-2xl border border-surface-700 bg-white p-6 shadow-sm lg:col-span-1 flex flex-col"
        >
          <div className="mb-6">
            <h3 className="text-lg font-bold text-surface-50">Tỷ lệ Phân bổ</h3>
            <p className="text-xs text-surface-400">So sánh tin thật và giả trong hệ thống</p>
          </div>
          <div className="flex-1 w-full" style={{ minHeight: 280 }}>
            {totalPreds > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <defs>
                    <linearGradient id="colorFake" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={1}/>
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0.8}/>
                    </linearGradient>
                    <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={1}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={6}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={8}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={entry.name} fill={index === 0 ? "url(#colorFake)" : "url(#colorReal)"} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    wrapperStyle={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center text-surface-400">
                <PieChart size={48} className="mb-2 opacity-20" />
                <p className="text-sm">Chưa có dữ liệu dự đoán</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="rounded-2xl border border-surface-700 bg-white p-6 shadow-sm lg:col-span-2 flex flex-col"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-surface-50">Lưu lượng Dự đoán (7 ngày qua)</h3>
              <p className="text-xs text-surface-400">Thống kê số lượng theo ngày</p>
            </div>
            <div className="flex gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-red-500"></span> Tin giả</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-emerald-500"></span> Tin thật</div>
            </div>
          </div>
          <div className="flex-1 w-full mt-4" style={{ minHeight: 280 }}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barFake" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#b91c1c" stopOpacity={0.8}/>
                  </linearGradient>
                  <linearGradient id="barReal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#047857" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }}
                  dx={-10}
                />
                <Tooltip cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }} content={<CustomTooltip />} />
                <Bar dataKey="fake" name="Tin giả" fill="url(#barFake)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                <Bar dataKey="real" name="Tin thật" fill="url(#barReal)" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
