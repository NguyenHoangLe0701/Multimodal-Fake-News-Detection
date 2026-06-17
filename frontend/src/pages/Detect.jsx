import { useState, useRef } from 'react';
import {
  Upload,
  X,
  FileText,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { predictNews } from '../services/api';

const Detect = () => {
  const [newsText, setNewsText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!newsText.trim() && !imageFile) return;
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const data = await predictNews(newsText, imageFile);
      setResult({
        label: data.label,
        confidence: data.confidence,
        textScore: Number(data.text_score).toFixed(2),
        imageScore: Number(data.image_score).toFixed(2),
      });
    } catch (err) {
      setError(err.message || 'Không thể kết nối backend. Hãy chạy Flask server.');
    } finally {
      setIsLoading(false);
    }
  };

  const canSubmit = newsText.trim().length > 10 || imageFile;
  const isFake = result?.label === 'FAKE';

  return (
    <div className="page-shell pb-20 pt-12 md:pb-24 md:pt-16">
      <div className="page-container">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-header mx-auto max-w-3xl text-center"
        >
          <div className="section-label mx-auto">
            <Sparkles size={13} />
            AI Verification Engine
          </div>
          <h1 className="page-title">Kiểm tra tin giả</h1>
          <p className="page-subtitle mx-auto">
            Nhập nội dung bài viết hoặc hình ảnh để phân tích bằng AI đa phương thức.
          </p>
        </motion.header>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="section-stack lg:col-span-7"
          >
            <div className="card transition-colors focus-within:border-accent/30">
              <div className="card-header">
                <FileText size={16} className="text-surface-400" />
                <span className="text-sm font-semibold text-surface-100">Nội dung bài viết</span>
                <span className="ml-auto font-mono text-xs text-surface-500">
                  {newsText.length} ký tự
                </span>
              </div>
              <textarea
                value={newsText}
                onChange={(e) => setNewsText(e.target.value)}
                placeholder="Dán toàn bộ nội dung bài viết hoặc tiêu đề vào đây..."
                className="min-h-52 w-full resize-y bg-transparent p-5 text-sm leading-relaxed text-surface-100 outline-none placeholder:text-surface-500"
              />
            </div>

            <div className="card">
              <div className="card-header">
                <Upload size={16} className="text-surface-400" />
                <span className="text-sm font-semibold text-surface-100">Hình ảnh đính kèm</span>
              </div>

              <AnimatePresence mode="wait">
                {!imagePreview ? (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleImageChange(e);
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                    className="group/drop flex cursor-pointer flex-col items-center justify-center px-6 py-14 transition-colors hover:bg-surface-900/60"
                  >
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-dashed border-surface-600 transition-colors group-hover/drop:border-accent group-hover/drop:bg-accent/5">
                      <Upload
                        size={22}
                        className="text-surface-400 transition-colors group-hover/drop:text-accent"
                      />
                    </div>
                    <p className="mb-1 text-sm font-medium text-surface-200">
                      Kéo thả hoặc nhấn để chọn ảnh
                    </p>
                    <p className="text-xs text-surface-500">PNG, JPG, WEBP — tối đa 10MB</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="card-body"
                  >
                    <div className="relative overflow-hidden rounded-xl border border-surface-700 bg-surface-900">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="mx-auto h-auto max-h-72 w-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-surface-200 shadow-sm transition-colors hover:bg-danger hover:text-white"
                      >
                        <X size={14} />
                      </button>
                      <p className="border-t border-surface-700 bg-white px-4 py-2 text-sm text-surface-300">
                        {imageFile?.name}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || isLoading}
              className={`btn-primary btn-primary-lg w-full ${
                !canSubmit || isLoading ? 'cursor-not-allowed opacity-50 hover:shadow-none' : ''
              } ${!canSubmit || isLoading ? '!bg-surface-800 !text-surface-500 hover:!bg-surface-800' : ''}`}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Đang phân tích...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Phân tích nội dung
                </>
              )}
            </button>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">
                {error}
              </div>
            )}
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="lg:col-span-5 lg:sticky lg:top-24"
          >
            <AnimatePresence mode="wait">
              {!result && !isLoading && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="card flex min-h-[420px] flex-col items-center justify-center p-8 text-center"
                >
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-surface-700 bg-surface-900">
                    <ShieldCheck size={22} className="text-surface-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-surface-100">Chờ nội dung</h3>
                  <p className="max-w-xs text-sm leading-relaxed text-surface-400">
                    Nhập văn bản hoặc ảnh bên trái để xem kết quả phân tích AI tại đây.
                  </p>
                </motion.div>
              )}

              {isLoading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="card flex min-h-[420px] flex-col items-center justify-center p-8 text-center"
                >
                  <div className="relative mb-6 flex h-16 w-16 items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-[3px] border-accent/20" />
                    <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-accent border-t-transparent" />
                    <Sparkles size={20} className="text-accent" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-surface-100">Đang phân tích</h3>
                  <p className="text-sm text-surface-400">Đối chiếu dữ liệu multimodal...</p>
                </motion.div>
              )}

              {result && !isLoading && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="card overflow-hidden"
                >
                  <div
                    className={`border-b border-surface-700 px-6 py-6 ${
                      isFake ? 'bg-red-50' : 'bg-emerald-50'
                    }`}
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <div
                        className={`rounded-xl p-3 ${
                          isFake ? 'bg-red-100 text-danger' : 'bg-emerald-100 text-accent'
                        }`}
                      >
                        {isFake ? <ShieldAlert size={24} /> : <ShieldCheck size={24} />}
                      </div>
                      <span
                        className={`text-3xl font-black tracking-tight ${
                          isFake ? 'text-danger' : 'text-accent'
                        }`}
                      >
                        {result.label}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-surface-200">
                      {isFake
                        ? 'Nội dung này có dấu hiệu mạnh của thao túng thông tin và tin giả.'
                        : 'Nội dung này có vẻ xác thực với độ tin cậy cao.'}
                    </p>
                  </div>

                  <div className="card-body space-y-6">
                    <div>
                      <div className="mb-3 flex items-end justify-between gap-4">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-surface-500">
                          Độ tin cậy AI
                        </span>
                        <span className="font-mono text-2xl font-bold leading-none text-surface-50">
                          {(result.confidence * 100).toFixed(1)}
                          <span className="text-base text-surface-400">%</span>
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-surface-800">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${result.confidence * 100}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={`h-full rounded-full ${isFake ? 'bg-danger' : 'bg-accent'}`}
                        />
                      </div>
                    </div>

                    <div className="rounded-xl border border-surface-700 bg-surface-900 p-4">
                      <h4 className="mb-4 border-b border-surface-700 pb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-surface-500">
                        Phân tích đa phương thức
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm font-medium text-surface-200">Text Semantics</span>
                          <span className="font-mono text-sm font-semibold text-accent">
                            {result.textScore}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm font-medium text-surface-200">Visual Artifacts</span>
                          <span className="font-mono text-sm font-semibold text-accent">
                            {result.imageScore}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <AlertTriangle size={16} className="mt-0.5 shrink-0 text-warning" />
                      <p className="text-xs leading-relaxed text-surface-300">
                        Kết quả AI mang tính xác suất, không phải kết luận cuối cùng.
                        Hãy xác minh lại thông qua nhiều nguồn tin chính thống.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.aside>
        </div>
      </div>
    </div>
  );
};

export default Detect;
