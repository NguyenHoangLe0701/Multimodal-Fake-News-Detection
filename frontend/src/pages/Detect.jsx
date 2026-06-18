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
  Image as ImageIcon
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
    <div className="page-shell pb-32 relative overflow-x-hidden bg-surface-900/30 min-h-screen">
      {/* Stronger Ambient Background for Glassmorphism pop */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40vw] h-[40vw] rounded-full bg-emerald-300/10 blur-[100px]"></div>
        <div className="absolute top-[20%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-teal-300/10 blur-[120px]"></div>
      </div>
      
      <div className="page-container relative z-10 py-10 md:py-16">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex flex-col items-center justify-center text-center mb-16"
        >
          <div className="inline-flex items-center justify-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-emerald-200/60 bg-white/60 backdrop-blur-md text-xs font-bold uppercase tracking-[0.15em] text-emerald-600 shadow-sm mx-auto">
            <Sparkles size={14} className="text-emerald-500 animate-pulse" />
            AI Verification Engine
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-surface-50 mb-6 w-full text-center leading-tight">
            Kiểm tra <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-teal-500">tin giả</span>
          </h1>
          <p className="text-lg text-surface-400 text-center max-w-2xl leading-relaxed mx-auto">
            Hệ thống phân tích đa phương thức kết hợp NLP và Computer Vision để phát hiện tin giả với độ chính xác cao nhất.
          </p>
        </motion.header>

        {/* 70/30 Grid Layout */}
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-10 xl:gap-12">
          
          {/* Cột trái (70%) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="lg:col-span-7 flex flex-col gap-8"
          >
            {/* Card 1: Text Input */}
            <div className="relative w-full flex flex-col bg-white/80 backdrop-blur-xl p-8 shadow-sm rounded-[2rem] border border-white/60 overflow-hidden group">
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-50/50 rounded-full blur-[80px] -mr-40 -mt-40 pointer-events-none transition-transform duration-1000 group-hover:scale-110"></div>
              
              <div className="relative z-10 w-full flex flex-col">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100/50 text-accent shadow-inner border border-emerald-100">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-surface-50 tracking-tight">NỘI DUNG BÀI VIẾT</h2>
                    <p className="text-sm font-medium text-surface-400">Dán nội dung văn bản cần kiểm chứng</p>
                  </div>
                </div>
                
                <div className="w-full rounded-3xl border border-surface-700/60 bg-white/50 focus-within:border-accent/50 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] transition-all overflow-hidden relative">
                  <textarea
                    value={newsText}
                    onChange={(e) => setNewsText(e.target.value)}
                    placeholder="Nhập hoặc dán nội dung bài viết, tiêu đề tin tức vào đây..."
                    className="h-[320px] w-full resize-none bg-transparent p-6 text-lg leading-relaxed text-surface-100 outline-none placeholder:text-surface-400 block"
                  />
                  <div className="absolute bottom-4 right-6 pointer-events-none">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold font-mono transition-colors ${newsText.length > 0 ? 'bg-emerald-50 text-accent border border-emerald-100' : 'bg-surface-100/5 text-surface-400 border border-transparent'}`}>
                      {newsText.length} / 5000 ký tự
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Image Input */}
            <div className="relative w-full flex flex-col bg-white/80 backdrop-blur-xl p-8 shadow-sm rounded-[2rem] border border-white/60 overflow-hidden group">
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-50/50 rounded-full blur-[80px] -ml-40 -mb-40 pointer-events-none transition-transform duration-1000 group-hover:scale-110"></div>

              <div className="relative z-10 w-full flex flex-col">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100/50 text-teal-600 shadow-inner border border-teal-100">
                    <ImageIcon size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-surface-50 tracking-tight">HÌNH ẢNH ĐÍNH KÈM</h2>
                    <p className="text-sm font-medium text-surface-400">Hình ảnh minh họa cho bài viết (Tùy chọn)</p>
                  </div>
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
                        className="flex flex-col items-center justify-center w-full rounded-3xl border-2 border-dashed border-surface-400/50 bg-white/30 backdrop-blur-sm px-6 h-[320px] cursor-pointer transition-all duration-300 hover:border-teal-400 hover:bg-white/60 group/drop shadow-inner"
                      >
                        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-surface-700/30 transition-transform duration-300 group-hover/drop:-translate-y-2 group-hover/drop:shadow-lg group-hover/drop:ring-teal-200">
                          <Upload size={32} className="text-surface-400 transition-colors group-hover/drop:text-teal-500" />
                        </div>
                        <p className="mb-2 text-lg font-bold text-surface-100">
                          Kéo thả ảnh hoặc <span className="text-teal-600 underline decoration-teal-200 underline-offset-4 hover:decoration-teal-500 transition-colors">duyệt qua máy tính</span>
                        </p>
                        <p className="text-sm font-medium text-surface-400">Định dạng hỗ trợ: PNG, JPG, WEBP (Max 10MB)</p>
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
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative overflow-hidden rounded-3xl border border-surface-700/50 bg-surface-900 group/img w-full flex flex-col shadow-inner h-[320px] justify-center"
                      >
                        <img
                           src={imagePreview}
                           alt="Preview"
                           className="mx-auto h-auto max-h-[320px] w-full object-contain block bg-surface-900/50"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300"></div>
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-surface-500 shadow-sm backdrop-blur-md transition-all hover:bg-danger hover:text-white hover:scale-110"
                        >
                          <X size={20} />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover/img:translate-y-0 group-hover/img:opacity-100 transition-all duration-300">
                          <p className="truncate text-base font-bold text-white drop-shadow-md">
                            {imageFile?.name}
                          </p>
                          <p className="text-xs text-white/70 mt-1 font-medium">{(imageFile?.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Submit Button Section */}
            <div className="relative w-full flex flex-col bg-white/80 backdrop-blur-xl p-6 shadow-sm rounded-[2rem] border border-white/60">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit || isLoading}
                className={`relative flex items-center justify-center gap-3 w-full h-16 rounded-[1.5rem] text-lg font-black uppercase tracking-[0.1em] transition-all duration-300 overflow-hidden ${
                  !canSubmit || isLoading 
                    ? 'cursor-not-allowed bg-surface-200 text-surface-400 shadow-none' 
                    : 'bg-gradient-to-r from-accent to-teal-500 text-white shadow-xl hover:shadow-accent/30 hover:-translate-y-1 active:translate-y-0'
                }`}
              >
                {!canSubmit && !isLoading ? null : (
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]"></div>
                )}
                
                <span className="relative flex items-center justify-center gap-3 z-10 drop-shadow-sm">
                  {isLoading ? (
                    <>
                      <Loader2 size={26} className="animate-spin text-white" />
                      <span>Đang phân tích AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={26} className={!canSubmit ? "opacity-50" : ""} />
                      TIẾN HÀNH KIỂM TRA
                    </>
                  )}
                </span>
              </button>
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6 flex items-center justify-center gap-3 rounded-2xl border border-red-200/60 bg-red-50/80 backdrop-blur p-5 text-sm font-bold text-danger shadow-sm text-center"
                >
                  <AlertTriangle size={20} className="shrink-0" />
                  {error}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Cột phải (30%) - Fixed/Sticky */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="lg:col-span-3 h-full"
          >
            <AnimatePresence mode="wait">
              {!result && !isLoading && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="sticky top-32 flex flex-col items-center justify-center rounded-[2.5rem] border border-surface-700/50 bg-white/50 backdrop-blur-2xl p-10 text-center shadow-lg h-[calc(100vh-10rem)] min-h-[600px] overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-48 h-48 bg-teal-50 rounded-full blur-3xl opacity-60 mix-blend-multiply"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-50 rounded-full blur-3xl opacity-60 mix-blend-multiply"></div>
                  
                  <div className="relative z-10 mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-sm ring-1 ring-surface-700/30">
                    <ShieldCheck size={40} className="text-surface-300" strokeWidth={1.5} />
                  </div>
                  <h3 className="relative z-10 mb-3 text-2xl font-extrabold text-surface-100 tracking-tight">Chờ nội dung</h3>
                  <p className="relative z-10 max-w-xs text-[15px] leading-relaxed text-surface-400 font-medium">
                    Hệ thống đã sẵn sàng. Hãy nhập dữ liệu ở bên trái để AI tiến hành phân tích và đối chiếu.
                  </p>
                </motion.div>
              )}

              {isLoading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="sticky top-32 flex flex-col items-center justify-center rounded-[2.5rem] border border-surface-700/50 bg-white/50 backdrop-blur-2xl p-10 text-center shadow-lg h-[calc(100vh-10rem)] min-h-[600px] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent animate-pulse"></div>
                  
                  <div className="relative z-10 mb-10 flex h-28 w-28 items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-500/10" />
                    <div className="absolute inset-0 animate-spin rounded-full border-4 border-accent border-t-transparent border-r-transparent" />
                    <div className="absolute inset-2 animate-spin-reverse rounded-full border-4 border-teal-400/40 border-b-transparent border-l-transparent" />
                    <Sparkles size={32} className="text-accent" />
                  </div>
                  <h3 className="relative z-10 mb-3 text-2xl font-extrabold text-surface-100 tracking-tight">Đang quét AI</h3>
                  <p className="relative z-10 text-[15px] text-surface-400 font-medium">Đang xử lý mạng neural đa phương thức...</p>
                </motion.div>
              )}

              {result && !isLoading && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="sticky top-32 flex flex-col rounded-[2.5rem] border border-surface-700/50 bg-white/80 backdrop-blur-2xl p-8 shadow-lg overflow-hidden"
                >
                  <div
                    className={`p-8 relative overflow-hidden ${
                      isFake ? 'bg-gradient-to-br from-red-50 to-rose-100/50' : 'bg-gradient-to-br from-emerald-50 to-teal-100/50'
                    }`}
                  >
                    <div className={`absolute -right-12 -top-12 w-48 h-48 rounded-full blur-[40px] opacity-60 ${isFake ? 'bg-red-400' : 'bg-emerald-400'}`}></div>
                    
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div
                        className={`mb-6 flex h-20 w-20 items-center justify-center rounded-[1.5rem] shadow-md bg-white ${
                          isFake ? 'text-danger ring-2 ring-red-200' : 'text-accent ring-2 ring-emerald-200'
                        }`}
                      >
                        {isFake ? <ShieldAlert size={40} /> : <ShieldCheck size={40} />}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.25em] text-surface-500 mb-2">
                        KẾT QUẢ AI
                      </span>
                      <h3
                        className={`text-5xl font-black tracking-tighter mb-4 ${
                          isFake ? 'text-danger' : 'text-accent'
                        }`}
                      >
                        {result.label}
                      </h3>
                      <div className={`px-4 py-2 rounded-xl text-sm font-bold border ${
                        isFake ? 'bg-red-100/50 border-red-200 text-red-700' : 'bg-emerald-100/50 border-emerald-200 text-emerald-700'
                      }`}>
                        {isFake ? 'Cảnh báo nội dung rác' : 'Nội dung tin cậy'}
                      </div>
                    </div>
                  </div>

                  <div className="p-8 space-y-8 bg-white/40">
                    {/* Confidence Score */}
                    <div>
                      <div className="mb-4 flex items-end justify-between">
                        <span className="text-xs font-bold uppercase tracking-[0.1em] text-surface-500">
                          Confidence Score
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="font-mono text-4xl font-black tracking-tight text-surface-100">
                            {(result.confidence * 100).toFixed(1)}
                          </span>
                          <span className="text-lg font-bold text-surface-400">%</span>
                        </div>
                      </div>
                      <div className="h-4 w-full rounded-full bg-surface-800 shadow-inner overflow-hidden p-0.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${result.confidence * 100}%` }}
                          transition={{ duration: 1.5, ease: [0.25, 1, 0.5, 1] }}
                          className={`h-full rounded-full relative overflow-hidden ${isFake ? 'bg-gradient-to-r from-red-500 to-rose-500' : 'bg-gradient-to-r from-accent to-teal-400'}`}
                        >
                          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] animate-[shimmer_1s_linear_infinite]"></div>
                        </motion.div>
                      </div>
                    </div>

                    {/* Feature Scores */}
                    <div className="rounded-2xl border border-surface-700/40 bg-surface-900/30 p-5">
                      <h4 className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-surface-500">
                        <Layers size={14} />
                        Phân tích chi tiết
                      </h4>
                      <div className="space-y-5">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-surface-200">Text (NLP)</span>
                            <span className="font-mono text-sm font-bold text-surface-100 bg-white px-2 py-0.5 rounded shadow-sm">
                              {result.textScore}
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-surface-700/50 overflow-hidden shadow-inner">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(Math.abs(result.textScore) * 10, 100)}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                              className="h-full bg-surface-400 rounded-full"
                            ></motion.div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-surface-200">Visual (CNN)</span>
                            <span className="font-mono text-sm font-bold text-surface-100 bg-white px-2 py-0.5 rounded shadow-sm">
                              {result.imageScore}
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-surface-700/50 overflow-hidden shadow-inner">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(Math.abs(result.imageScore) * 10, 100)}%` }}
                              transition={{ duration: 1, delay: 0.7 }}
                              className="h-full bg-surface-400 rounded-full"
                            ></motion.div>
                          </div>
                        </div>
                      </div>
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
