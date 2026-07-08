import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ShieldAlert, ShieldCheck, Loader2, CheckCircle2, XCircle, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { getAdminPredictions, submitPredictionFeedback } from '../../services/api';

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const itemsPerPage = 5;

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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLogs();
  }, []);


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

      {createPortal(
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              key="lightbox"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
              style={{ position: 'fixed' }}
            >
              <button type="button" onClick={() => setSelectedImage(null)} className="absolute -top-4 -right-4 rounded-full bg-surface-800 p-1.5 text-surface-400 hover:text-white hover:bg-surface-700 transition-colors shadow-lg border border-surface-600" aria-label="Đóng ảnh">
                 <X size={24} />
              </button>
              <motion.img
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                src={selectedImage}
                alt="Preview"
                className="relative z-10 max-h-[90vh] max-w-full rounded-xl object-contain shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card overflow-hidden"
      >
        <div className="overflow-x-auto overflow-y-auto max-h-[65vh]">
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
            {logs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((log) => (
              <tr key={log.id} className="group">
                <td>
                  <button
                    type="button"
                    className={`flex h-11 w-11 p-0 m-0 items-center justify-center overflow-hidden rounded-lg border border-surface-700 bg-surface-900 ${log.image_url ? 'cursor-pointer hover:opacity-80 transition-opacity' : 'cursor-default'}`}
                    onClick={() => log.image_url && setSelectedImage(log.image_url)}
                    title={log.image_url ? "Nhấn để xem ảnh phóng to" : ""}
                  >
                    {log.image_url ? (
                      <img
                        src={log.image_url}
                        alt="Thumbnail"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px] text-surface-500">No Image</span>
                    )}
                  </button>
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
        {logs.length > itemsPerPage && (
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
                onClick={() => setCurrentPage(p => Math.min(p + 1, Math.ceil(logs.length / itemsPerPage)))}
                disabled={currentPage === Math.ceil(logs.length / itemsPerPage)}
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
                    {Math.min(currentPage * itemsPerPage, logs.length)}
                  </span>{' '}
                  trên tổng số <span className="font-medium">{logs.length}</span> kết quả
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
                    onClick={() => setCurrentPage(p => Math.min(p + 1, Math.ceil(logs.length / itemsPerPage)))}
                    disabled={currentPage === Math.ceil(logs.length / itemsPerPage)}
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

export default AdminLogs;
