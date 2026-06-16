import React from 'react';
import { Search, Filter, ShieldAlert, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const mockHistory = [
  { id: '1', title: "Hình ảnh UFO rơi tại Hà Nội gây chấn động", label: 'FAKE', score: 0.95, date: '2026-06-16 10:30' },
  { id: '2', title: "Chứng khoán Việt Nam giảm mạnh trong phiên sáng", label: 'REAL', score: 0.88, date: '2026-06-16 09:15' },
  { id: '3', title: "Sốc: Thuốc chữa bách bệnh làm từ rễ cây lạ", label: 'FAKE', score: 0.92, date: '2026-06-15 20:45' },
  { id: '4', title: "Hội nghị AI toàn cầu được tổ chức tại TP.HCM", label: 'REAL', score: 0.75, date: '2026-06-15 14:20' },
];

const History = () => {
  return (
    <div className="min-h-screen pt-24 pb-20 relative">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Detection History</h1>
            <p className="text-gray-400">Review your past analysis results and verifications.</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input 
                type="text" 
                placeholder="Search history..." 
                className="pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#10b981] transition-colors w-full md:w-64"
              />
            </div>
            <button className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 transition-colors flex items-center gap-2">
              <Filter size={16} />
              <span className="hidden sm:inline">Filter</span>
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#0f0f13]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/10">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Content Summary</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Verdict</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Confidence</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {mockHistory.map((item, i) => (
                  <motion.tr 
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-5">
                      <p className="text-gray-200 font-medium group-hover:text-[#10b981] transition-colors">{item.title}</p>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                        item.label === 'FAKE' 
                          ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                          : 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20'
                      }`}>
                        {item.label === 'FAKE' ? <ShieldAlert size={12} /> : <ShieldCheck size={12} />}
                        {item.label}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${item.label === 'FAKE' ? 'bg-red-500' : 'bg-[#10b981]'}`}
                            style={{ width: `${item.score * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-mono text-gray-400">{(item.score * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                      {item.date}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default History;
