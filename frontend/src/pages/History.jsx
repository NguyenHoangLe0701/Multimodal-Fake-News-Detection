import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react';
import { m as motion } from 'framer-motion';
import { getHistory } from '../services/api';

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('vi-VN');
};

const getTitle = (text) => {
  if (!text) return 'Không có nội dung';
  return text.length > 80 ? `${text.slice(0, 80)}…` : text;
};

const History = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getHistory(50)
      .then(setRecords)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return records;
    const q = search.toLowerCase();
    return records.filter((item) =>
      (item.news_text || '').toLowerCase().includes(q)
    );
  }, [records, search]);

  return (
    <div className="page-shell pb-20 pt-12 md:pb-24 md:pt-16">
      <div className="page-container">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-header flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <h1 className="page-title">Lịch sử kiểm tra</h1>
            <p className="page-subtitle">
              Xem lại các kết quả phân tích và xác minh trước đó từ backend.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-72">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-surface-400"
                size={16}
              />
              <input
                type="text"
                aria-label="Tìm kiếm lịch sử"
                placeholder="Tìm kiếm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field w-full rounded-full py-3 pl-11"
              />
            </div>
            <button type="button" className="btn-outline shrink-0">
              <Filter size={15} />
              Lọc
            </button>
          </div>
        </motion.header>

        {loading && (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="animate-spin text-accent" size={36} />
          </div>
        )}

        {error && !loading && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-danger">
            {error}
          </div>
        )}

        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="card overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="data-table min-w-[760px]">
                <thead>
                  <tr>
                    <th>Nội dung</th>
                    <th>Kết quả</th>
                    <th>Độ tin cậy</th>
                    <th>Ngày</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, i) => {
                    const label = item.prediction_label || item.label;
                    const score = item.confidence_score ?? item.score ?? 0;
                    return (
                      <motion.tr
                        key={item.id || i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.04 + i * 0.03 }}
                        className="group"
                      >
                        <td>
                          <p className="max-w-md font-medium text-surface-100 transition-colors group-hover:text-accent">
                            {getTitle(item.news_text)}
                          </p>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              label === 'FAKE' ? 'badge-fake' : 'badge-real'
                            }`}
                          >
                            {label === 'FAKE' ? (
                              <ShieldAlert size={12} />
                            ) : (
                              <ShieldCheck size={12} />
                            )}
                            {label}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-800">
                              <div
                                className={`h-full rounded-full ${
                                  label === 'FAKE' ? 'bg-danger' : 'bg-accent'
                                }`}
                                style={{ width: `${score * 100}%` }}
                              />
                            </div>
                            <span className="w-10 font-mono text-sm text-surface-300">
                              {(score * 100).toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap text-sm text-surface-400">
                          {formatDate(item.created_at || item.date)}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="p-12 text-center text-surface-400">
                  Chưa có dữ liệu lịch sử.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default History;
