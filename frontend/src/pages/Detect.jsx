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
  Layers,
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
    <div className="page-shell pb-20">
      <div className="h-28 md:h-36 w-full"></div> {/* Larger spacer for beautiful top margin */}
      <div className="page-container relative z-10">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-header w-full flex flex-col items-center justify-center text-center mb-14"
        >
          <div className="inline-flex items-center justify-center gap-2 mb-5 px-4 py-1.5 rounded-full border border-emerald-200/50 bg-emerald-50 text-xs font-bold uppercase tracking-[0.15em] text-emerald-600 shadow-sm mx-auto">
            <Sparkles size={14} className="text-emerald-500" />
            AI Verification Engine
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-surface-50 mb-5 w-full block" style={{ textAlign: 'center' }}>
            Kiểm tra <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">tin giả</span>
          </h1>
          <p className="text-base md:text-lg text-surface-400 w-full block leading-relaxed" style={{ textAlign: 'center' }}>
            Hệ thống phân tích đa phương thức (Multimodal AI) kết hợp NLP và Computer
            <br className="hidden md:block" />
            Vision để phát hiện tin giả với độ chính xác cao.
          </p>
        </motion.header>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Input Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="lg:col-span-8 flex flex-col gap-10"
          >
            {/* Form Section 1: Text Input */}
            <div className="relative z-10 w-full flex flex-col items-center bg-white p-8 md:p-12 shadow-xl rounded-[2.5rem] border border-surface-700/60 overflow-hidden">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-emerald-50/50 blur-3xl pointer-events-none z-0"></div>
              
              <div className="relative z-10 w-full flex flex-col items-center">
                <div className="flex items-center justify-center gap-3 mb-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                    <FileText size={24} />
                  </div>
                  <span className="text-lg font-extrabold text-surface-100 uppercase tracking-widest text-center">Nội dung bài viết</span>
                </div>
                
                <div className="flex flex-col w-full rounded-3xl border-2 border-surface-700 bg-surface-900/50 focus-within:border-emerald-500/50 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all overflow-hidden">
                  <textarea
                    value={newsText}
                    onChange={(e) => setNewsText(e.target.value)}
                    placeholder="Dán toàn bộ nội dung bài viết hoặc tiêu đề vào đây để AI bắt đầu phân tích..."
                    className="min-h-[280px] w-full resize-y bg-transparent p-8 text-xl leading-relaxed text-surface-50 outline-none placeholder:text-surface-400 text-center block"
                  />
                  <div className="flex justify-center px-6 py-5 border-t-2 border-surface-700/50 bg-surface-800/30 w-full">
                    <span className={`font-mono text-sm font-bold ${newsText.length > 0 ? 'text-emerald-600' : 'text-surface-400'}`}>
                      {newsText.length} ký tự
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Section 2: Image Input */}
            <div className="relative z-10 w-full flex flex-col items-center bg-white p-8 md:p-12 shadow-xl rounded-[2.5rem] border border-surface-700/60 overflow-hidden">
              <div className="absolute top-0 left-0 -ml-20 -mt-20 w-64 h-64 rounded-full bg-teal-50/50 blur-3xl pointer-events-none z-0"></div>

              <div className="relative z-10 w-full flex flex-col items-center">
                <div className="flex items-center justify-center gap-3 mb-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
                    <Upload size={24} />
                  </div>
                  <span className="text-lg font-extrabold text-surface-100 uppercase tracking-widest text-center">
                    Hình ảnh đính kèm <span className="text-surface-400 font-medium normal-case ml-2">(Tùy chọn)</span>
                  </span>
                </div>
                
                <div className="w-full flex flex-col">
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
                        className="flex flex-col items-center justify-center w-full rounded-3xl border-2 border-dashed border-surface-600 bg-surface-900/30 px-8 py-24 cursor-pointer transition-all hover:border-teal-500 hover:bg-teal-50/50 group"
                      >
                        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-sm ring-2 ring-surface-700 transition-transform group-hover:scale-110">
                          <Upload size={40} className="text-surface-400 transition-colors group-hover:text-teal-500" />
                        </div>
                        <p className="mb-4 text-xl font-bold text-surface-100 text-center">
                          Kéo thả hoặc nhấn để tải ảnh lên
                        </p>
                        <p className="text-base font-medium text-surface-400 text-center">Hỗ trợ định dạng PNG, JPG, WEBP (Tối đa 10MB)</p>
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
                        className="relative overflow-hidden rounded-3xl border-2 border-surface-700 bg-surface-900 shadow-inner group w-full flex flex-col"
                      >
                        <img
                           src={imagePreview}
                           alt="Preview"
                           className="mx-auto h-auto max-h-[400px] w-full object-contain block"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-surface-500 shadow-sm backdrop-blur-sm transition-all hover:bg-danger hover:text-white hover:scale-110"
                        >
                          <X size={24} />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 p-8 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                          <p className="truncate text-lg font-bold text-white drop-shadow-md text-center">
                            {imageFile?.name}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Submit Button Section */}
            <div className="relative z-10 w-full flex flex-col bg-white p-6 shadow-xl rounded-[2.5rem] border border-surface-700/60 overflow-hidden">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit || isLoading}
                className={`relative flex items-center justify-center gap-4 w-full h-20 rounded-3xl text-xl font-black uppercase tracking-wider transition-all duration-300 overflow-hidden ${
                  !canSubmit || isLoading 
                    ? 'cursor-not-allowed bg-surface-200 text-surface-400 shadow-none opacity-80' 
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xl hover:shadow-emerald-500/25 hover:-translate-y-1 active:translate-y-0'
                }`}
              >
                {!canSubmit && !isLoading ? null : (
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent hover:animate-shimmer"></div>
                )}
                
                <span className="relative flex items-center justify-center gap-3 z-10">
                  {isLoading ? (
                    <>
                      <Loader2 size={28} className="animate-spin text-white" />
                      <span className="text-white">Đang phân tích dữ liệu...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={28} className={!canSubmit ? "opacity-50" : ""} />
                      KHỞI CHẠY AI VERIFICATION
                    </>
                  )}
                </span>
              </button>
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 flex items-center justify-center gap-3 rounded-xl border border-red-200 bg-red-50 p-6 text-base font-bold text-danger shadow-sm w-full text-center"
                >
                  <AlertTriangle size={24} className="shrink-0" />
                  {error}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Right Column: AI Result */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="lg:col-span-4 lg:sticky lg:top-28"
          >
            <AnimatePresence mode="wait">
              {!result && !isLoading && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative rounded-3xl border border-surface-700/60 bg-gradient-to-b from-white to-surface-900/50 p-8 min-h-[460px] flex flex-col items-center justify-center text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden"
                >
                  {/* Subtle background circles */}
                  <div className="absolute top-10 left-10 w-32 h-32 bg-emerald-50 rounded-full blur-3xl opacity-60"></div>
                  <div className="absolute bottom-10 right-10 w-32 h-32 bg-teal-50 rounded-full blur-3xl opacity-60"></div>
                  
                  <div className="relative z-10 mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-surface-700/50">
                    <ShieldCheck size={32} className="text-surface-300" />
                  </div>
                  <h3 className="relative z-10 mb-3 text-xl font-bold text-surface-100">Chờ nội dung phân tích</h3>
                  <p className="relative z-10 max-w-xs text-sm leading-relaxed text-surface-400">
                    AI engine đã sẵn sàng. Hãy nhập văn bản hoặc hình ảnh ở bên trái để xem kết quả đối chiếu đa phương thức tại đây.
                  </p>
                </motion.div>
              )}

              {isLoading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative rounded-3xl border border-surface-700/60 bg-white p-8 min-h-[460px] flex flex-col items-center justify-center text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-50/30 to-transparent animate-pulse"></div>
                  
                  <div className="relative z-10 mb-8 flex h-24 w-24 items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20" />
                    <div className="absolute inset-0 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent border-r-transparent" />
                    <div className="absolute inset-2 animate-spin-reverse rounded-full border-4 border-teal-500/40 border-b-transparent border-l-transparent" />
                    <Sparkles size={28} className="text-emerald-500" />
                  </div>
                  <h3 className="relative z-10 mb-2 text-xl font-bold text-surface-100">Đang quét đa phương thức</h3>
                  <p className="relative z-10 text-sm text-surface-400 font-medium">Phân tích chéo dữ liệu văn bản và hình ảnh...</p>
                </motion.div>
              )}

              {result && !isLoading && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-3xl border border-surface-700/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden"
                >
                  <div
                    className={`px-8 py-8 relative overflow-hidden ${
                      isFake ? 'bg-gradient-to-br from-red-50 to-rose-50/50' : 'bg-gradient-to-br from-emerald-50 to-teal-50/50'
                    }`}
                  >
                    <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-40 ${isFake ? 'bg-red-300' : 'bg-emerald-300'}`}></div>
                    
                    <div className="relative z-10 mb-4 flex items-center gap-4">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm ${
                          isFake ? 'bg-white text-danger ring-1 ring-red-200' : 'bg-white text-emerald-600 ring-1 ring-emerald-200'
                        }`}
                      >
                        {isFake ? <ShieldAlert size={28} /> : <ShieldCheck size={28} />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-surface-500 mb-1">
                          Kết luận AI
                        </span>
                        <span
                          className={`text-3xl font-black tracking-tight leading-none ${
                            isFake ? 'text-danger' : 'text-emerald-600'
                          }`}
                        >
                          {result.label}
                        </span>
                      </div>
                    </div>
                    <p className="relative z-10 text-[15px] leading-relaxed font-medium text-surface-200">
                      {isFake
                        ? 'Cảnh báo: Nội dung này có dấu hiệu cao của việc thao túng thông tin hoặc là tin giả mạo.'
                        : 'Xác thực: Nội dung này có mức độ tin cậy cao và không tìm thấy dấu hiệu thao túng đáng ngờ.'}
                    </p>
                  </div>

                  <div className="p-8 space-y-8">
                    {/* Confidence Score */}
                    <div>
                      <div className="mb-3 flex items-end justify-between">
                        <span className="text-xs font-bold uppercase tracking-[0.15em] text-surface-500">
                          Độ tin cậy của mô hình
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="font-mono text-3xl font-black leading-none text-surface-50">
                            {(result.confidence * 100).toFixed(1)}
                          </span>
                          <span className="text-lg font-bold text-surface-400">%</span>
                        </div>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-surface-800 shadow-inner">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${result.confidence * 100}%` }}
                          transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
                          className={`h-full rounded-full ${isFake ? 'bg-gradient-to-r from-red-500 to-rose-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'}`}
                        />
                      </div>
                    </div>

                    {/* Feature Scores */}
                    <div className="rounded-2xl border border-surface-700/60 bg-surface-900/50 p-5">
                      <h4 className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-surface-500">
                        <Layers size={14} />
                        Phân tích Late-Fusion
                      </h4>
                      <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-surface-200">Text Semantics (NLP)</span>
                            <span className="font-mono text-sm font-bold text-surface-50">
                              {result.textScore}
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-surface-700 overflow-hidden">
                            <div className="h-full bg-surface-400 rounded-full" style={{ width: `${Math.min(Math.abs(result.textScore) * 10, 100)}%` }}></div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-surface-200">Visual Artifacts (CNN)</span>
                            <span className="font-mono text-sm font-bold text-surface-50">
                              {result.imageScore}
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-surface-700 overflow-hidden">
                            <div className="h-full bg-surface-400 rounded-full" style={{ width: `${Math.min(Math.abs(result.imageScore) * 10, 100)}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="flex items-start gap-3 rounded-2xl border border-amber-200/60 bg-amber-50/50 p-4">
                      <AlertTriangle size={18} className="mt-0.5 shrink-0 text-warning" />
                      <p className="text-[13px] leading-relaxed font-medium text-surface-400">
                        Kết quả phân tích dựa trên AI và mang tính tham khảo. Hãy luôn kiểm tra chéo với các nguồn tin tức chính thống.
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
