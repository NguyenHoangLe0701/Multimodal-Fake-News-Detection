import { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAdminPredictions, submitPredictionFeedback } from '../../services/api';

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const data = await getAdminPredictions();
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async (id, feedback) => {
    try {
      await submitPredictionFeedback(id, feedback);
      setLogs(logs.map((log) => (log.id === id ? { ...log, admin_feedback: feedback } : log)));
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
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
        <h2 className="page-title text-2xl md:text-3xl">Prediction Logs</h2>
        <p className="page-subtitle !mt-0">Theo dõi và đánh giá các kết quả dự đoán của hệ thống.</p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card overflow-hidden"
      >
        <div className="overflow-x-auto">
        <table className="data-table min-w-[980px]">
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Nội dung</th>
              <th>Dự đoán</th>
              <th>Độ tin cậy</th>
              <th>Ngày</th>
              <th>Feedback</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="group">
                <td>
                  <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg border border-surface-700 bg-surface-900">
                    {log.image_url ? (
                      <img
                        src={log.image_url}
                        alt="Thumbnail"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px] text-surface-500">No Image</span>
                    )}
                  </div>
                </td>
                <td>
                  <p className="line-clamp-2 max-w-xs text-sm text-surface-100">
                    {log.news_text || 'Không có nội dung'}
                  </p>
                </td>
                <td>
                  <span
                    className={`badge ${
                      log.prediction_label === 'FAKE' ? 'badge-fake' : 'badge-real'
                    }`}
                  >
                    {log.prediction_label === 'FAKE' ? (
                      <ShieldAlert size={11} />
                    ) : (
                      <ShieldCheck size={11} />
                    )}
                    {log.prediction_label}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-800">
                      <div
                        className={`h-full rounded-full ${
                          log.prediction_label === 'FAKE' ? 'bg-danger' : 'bg-accent'
                        }`}
                        style={{ width: `${(log.confidence_score || 0) * 100}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs text-surface-300">
                      {((log.confidence_score || 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap text-sm text-surface-400">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td>
                  {log.admin_feedback ? (
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium ${
                        log.admin_feedback === 'CORRECT' ? 'text-accent' : 'text-danger'
                      }`}
                    >
                      {log.admin_feedback === 'CORRECT' ? (
                        <CheckCircle2 size={13} />
                      ) : (
                        <XCircle size={13} />
                      )}
                      {log.admin_feedback}
                    </span>
                  ) : (
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        type="button"
                        onClick={() => submitFeedback(log.id, 'CORRECT')}
                        className="action-pill action-pill-success"
                        title="Đánh dấu đúng"
                      >
                        <CheckCircle2 size={14} />
                        Đúng
                      </button>
                      <button
                        type="button"
                        onClick={() => submitFeedback(log.id, 'INCORRECT')}
                        className="action-pill action-pill-danger"
                        title="Đánh dấu sai"
                      >
                        <XCircle size={14} />
                        Sai
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <div className="p-8 text-center text-surface-400">Không có dữ liệu dự đoán.</div>
        )}
      </div>
    </motion.div>
    </div>
  );
};

export default AdminLogs;
