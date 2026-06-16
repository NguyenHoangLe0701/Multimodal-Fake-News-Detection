import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { ShieldAlert, ShieldCheck, Activity, Users, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch stats from backend
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/stats');
        const result = await response.json();
        if (result.status === 'success') {
          setData(result.data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin text-[#10b981]" size={40} />
      </div>
    );
  }

  const stats = [
    { title: 'Total Checks', value: data?.total_predictions || 0, icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { title: 'Fake Detected', value: data?.fake_count || 0, icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    { title: 'Real Verified', value: data?.real_count || 0, icon: ShieldCheck, color: 'text-[#10b981]', bg: 'bg-[#10b981]/10', border: 'border-[#10b981]/20' },
    { title: 'Total Users', value: data?.total_users || 0, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  ];

  const pieData = [
    { name: 'Fake', value: data?.fake_count || 0, color: '#ef4444' }, // red-500
    { name: 'Real', value: data?.real_count || 0, color: '#10b981' }, // emerald-500
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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#18181d] border border-[#2e2e36] p-3 rounded-lg shadow-xl">
          <p className="text-gray-300 font-medium mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div 
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#18181d]/80 backdrop-blur-sm rounded-2xl border border-[#2e2e36] p-6 flex items-center relative overflow-hidden group hover:border-gray-500/50 transition-colors"
          >
            <div className={`absolute -right-4 -top-4 w-24 h-24 ${stat.bg} rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`} />
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${stat.bg} ${stat.border} border ${stat.color} mr-4 relative z-10`}>
              <stat.icon size={28} />
            </div>
            <div className="relative z-10">
              <p className="text-sm font-medium text-gray-400">{stat.title}</p>
              <h3 className="text-3xl font-bold text-gray-100 mt-1">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-[#18181d]/80 backdrop-blur-sm rounded-2xl border border-[#2e2e36] p-6 lg:col-span-1"
        >
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Fake vs Real Ratio</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#dadadf' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-[#18181d]/80 backdrop-blur-sm rounded-2xl border border-[#2e2e36] p-6 lg:col-span-2"
        >
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Weekly Predictions</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2e2e36" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8b8b96' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8b8b96' }} />
                <Tooltip cursor={{fill: '#222228'}} content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#dadadf' }} />
                <Bar dataKey="fake" name="Fake News" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="real" name="Real News" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
