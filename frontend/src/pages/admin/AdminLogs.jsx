import React, { useState, useEffect } from 'react';
import { Eye, ShieldAlert, ShieldCheck, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/predictions');
      const result = await response.json();
      if (result.status === 'success') {
        setLogs(result.data);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async (id, feedback) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/predictions/${id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback })
      });
      const result = await response.json();
      if (result.status === 'success') {
        // Update local state
        setLogs(logs.map(log => log.id === id ? { ...log, admin_feedback: feedback } : log));
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
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
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Image</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Content Summary</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Prediction</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Confidence</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Feedback</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2e2e36]">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-[#222228]/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="w-12 h-12 rounded-lg bg-[#2e2e36] overflow-hidden flex items-center justify-center border border-[#3f3f46]">
                    {log.image_url ? (
                      <img src={log.image_url} alt="Thumbnail" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-gray-500">No Image</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-200 line-clamp-2 max-w-xs">{log.news_text || 'No text content'}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                    log.prediction_label === 'FAKE' 
                      ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                      : 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20'
                  }`}>
                    {log.prediction_label === 'FAKE' ? <ShieldAlert size={12} /> : <ShieldCheck size={12} />}
                    {log.prediction_label}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-[#2e2e36] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${log.prediction_label === 'FAKE' ? 'bg-red-500' : 'bg-[#10b981]'}`}
                        style={{ width: `${(log.confidence_score || 0) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-gray-400">
                      {((log.confidence_score || 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {log.admin_feedback ? (
                    <span className={`flex items-center gap-1 text-xs font-medium ${log.admin_feedback === 'CORRECT' ? 'text-green-500' : 'text-red-500'}`}>
                      {log.admin_feedback === 'CORRECT' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                      {log.admin_feedback}
                    </span>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => submitFeedback(log.id, 'CORRECT')} className="p-1.5 text-gray-500 hover:text-green-500 hover:bg-green-500/10 rounded-md transition-colors" title="Mark Correct">
                        <CheckCircle2 size={16} />
                      </button>
                      <button onClick={() => submitFeedback(log.id, 'INCORRECT')} className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors" title="Mark Incorrect">
                        <XCircle size={16} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <div className="p-8 text-center text-gray-500">No predictions found.</div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminLogs;
