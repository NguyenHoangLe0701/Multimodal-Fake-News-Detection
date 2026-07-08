import { useState, useRef } from 'react';
import {
  Upload,
  X,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Sparkles,
  Layers,
  Video,
  Play,
  CheckCircle2,
  Info
} from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';

const DetectVideo = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleVideoChange = (e) => {
    const file = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    } else if (file) {
      setError('Vui lòng chọn một tệp video hợp lệ (MP4, WebM, OGG).');
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!videoFile) return;
    
    setIsLoading(true);
    setResult(null);
    setError(null);

    // Mock API call
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Random result for demonstration
      const isFake = Math.random() > 0.5;
      
      setResult({
        label: isFake ? 'FAKE' : 'REAL',
        confidence: isFake ? 0.92 : 0.89,
        videoScore: isFake ? 0.95 : 0.12,
        audioScore: isFake ? 0.88 : 0.05,
        reason: isFake 
          ? "Phát hiện dấu hiệu thao túng khuôn mặt (Deepfake) và sự không đồng bộ giữa khẩu hình miệng và âm thanh ở giây thứ 12."
          : "Không phát hiện dấu hiệu can thiệp AI vào hình ảnh hoặc âm thanh. Tệp tin nguyên bản.",
        mode: 'video'
      });
    } catch (err) {
      setError('Đã xảy ra lỗi khi phân tích video. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const isFake = result?.label === 'FAKE';

  return (
    <div className="detect-page">
      <div className="detect-ambient">
        <div className="detect-blob detect-blob--1" style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(16, 185, 129, 0) 70%)' }} />
        <div className="detect-blob detect-blob--2" style={{ background: 'radial-gradient(circle, rgba(20, 184, 166, 0.4) 0%, rgba(20, 184, 166, 0) 70%)' }} />
        <div className="detect-blob detect-blob--3" style={{ background: 'radial-gradient(circle, rgba(52, 211, 153, 0.4) 0%, rgba(52, 211, 153, 0) 70%)' }} />
      </div>

      <div className="page-container detect-container">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="detect-header"
        >
          <div className="detect-badge">
            <Video size={14} />
            Video Forensic Analysis
          </div>
          <h1 className="detect-title">
            Phân tích <span className="detect-title-accent" style={{ backgroundImage: 'linear-gradient(135deg, #10b981, #14b8a6)', WebkitBackgroundClip: 'text', color: 'transparent' }}>Video Deepfake</span>
          </h1>
          <p className="detect-subtitle">
            Sử dụng mô hình AI tiên tiến phân tích từng khung hình (frame-by-frame) và quang phổ âm thanh để bóc trần video giả mạo.
          </p>
        </motion.header>

        <div className="detect-grid">
          {/* === LEFT COLUMN: inputs === */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="detect-left"
          >
            {/* Card: Video Input */}
            <div className="detect-card">
              <div className="detect-card__glow detect-card__glow--teal" style={{ background: 'radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(16,185,129,0.1), transparent 40%)' }} />
              <div className="detect-card__inner">
                <div className="detect-card__head">
                  <div className="detect-card__icon detect-card__icon--teal" style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>
                    <Video size={22} />
                  </div>
                  <div>
                    <h2 className="detect-card__title">Tệp Video</h2>
                    <p className="detect-card__desc">Tải lên video cần kiểm chứng (MP4, WebM)</p>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {!videoPreview ? (
                    <motion.div
                      key="upload"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onDrop={(e) => { e.preventDefault(); handleVideoChange(e); }}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => fileInputRef.current?.click()}
                      className="detect-dropzone"
                      style={{ border: '2px dashed rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.05)' }}
                    >
                      <div className="detect-dropzone__icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                        <Upload size={26} />
                      </div>
                      <p className="detect-dropzone__text">
                        Kéo thả video hoặc{' '}
                        <span className="detect-dropzone__link" style={{ color: '#10b981' }}>duyệt qua máy tính</span>
                      </p>
                      <p className="detect-dropzone__hint">MP4, WebM, OGG — Tối đa 50 MB</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        onChange={handleVideoChange}
                        className="hidden"
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative rounded-2xl overflow-hidden border border-surface-700/50 bg-surface-800 shadow-xl"
                    >
                      <video 
                        src={videoPreview} 
                        controls 
                        className="w-full aspect-video object-contain bg-black"
                      />
                      <button 
                        type="button" 
                        onClick={removeVideo} 
                        className="absolute top-2 right-2 h-8 w-8 flex items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-danger hover:text-white transition-colors"
                      >
                        <X size={16} />
                      </button>
                      <div className="p-3 bg-surface-800 border-t border-surface-700/50 flex justify-between items-center">
                        <p className="text-sm font-medium text-surface-200 truncate pr-4">{videoFile?.name}</p>
                        <p className="text-xs text-surface-400 whitespace-nowrap">{(videoFile?.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Submit Video */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!videoFile || isLoading}
              className={`detect-submit ${videoFile && !isLoading ? 'is-ready' : ''}`}
              style={videoFile && !isLoading ? { background: 'linear-gradient(135deg, #10b981, #14b8a6)', boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)' } : {}}
            >
              {videoFile && !isLoading && <div className="detect-submit__shimmer" />}
              <span className="detect-submit__content text-white">
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Đang quét từng khung hình…
                  </>
                ) : (
                  <>
                    <Play size={20} className="fill-current" />
                    Bắt đầu phân tích Video
                  </>
                )}
              </span>
            </button>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="detect-error"
              >
                <AlertTriangle size={16} />
                {error}
              </motion.div>
            )}
          </motion.div>

          {/* === RIGHT COLUMN: result === */}
          <motion.aside
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="detect-right"
          >
            <AnimatePresence mode="wait">
              {/* Empty state */}
              {!result && !isLoading && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="detect-result-empty"
                >
                  <div className="detect-result-empty__glow" style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)' }} />
                  <div className="detect-result-empty__icon" style={{ color: '#10b981' }}>
                    <Video size={40} strokeWidth={1.4} />
                  </div>
                  <h3 className="detect-result-empty__title">Chờ nội dung</h3>
                  <p className="detect-result-empty__desc">
                    Hệ thống đã sẵn sàng. Hãy tải lên một video
                    để AI tiến hành bóc tách hình ảnh và âm thanh.
                  </p>
                  <div className="detect-result-empty__steps">
                    <div className="detect-result-empty__step">
                      <Video size={14} />
                      <span>Tải lên MP4</span>
                    </div>
                    <div className="detect-result-empty__step">
                      <Layers size={14} />
                      <span>Quét Frame</span>
                    </div>
                    <div className="detect-result-empty__step">
                      <CheckCircle2 size={14} />
                      <span>Xem kết quả</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Loading state */}
              {isLoading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="detect-result-loading"
                >
                  <div className="detect-result-loading__pulse" style={{ border: '1px solid rgba(16, 185, 129, 0.5)' }} />
                  <div className="detect-result-loading__spinner">
                    <div className="detect-spinner-ring detect-spinner-ring--outer" style={{ borderTopColor: '#10b981', borderRightColor: '#10b981' }} />
                    <div className="detect-spinner-ring detect-spinner-ring--inner" style={{ borderBottomColor: '#14b8a6', borderLeftColor: '#14b8a6' }} />
                    <Sparkles size={24} className="detect-spinner-icon" style={{ color: '#10b981' }} />
                  </div>
                  <h3 className="detect-result-loading__title">Đang quét Video AI</h3>
                  <p className="detect-result-loading__desc">Trích xuất đặc trưng không gian và thời gian…</p>
                </motion.div>
              )}

              {result && !isLoading && (
                <DetectVideoResultCard result={result} isFake={isFake} />
              )}
            </AnimatePresence>
          </motion.aside>
        </div>
      </div>
    </div>
  );
};

const DetectVideoResultCard = ({ result, isFake }) => {
  return (
    <motion.div
      key="result"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`detect-result`}
      style={{ border: isFake ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)' }}
    >
      <div className="detect-result__content relative z-10">
        {/* Mode Badge */}
        <div className="detect-mode-badge mb-4 flex justify-center">
          <span className={`text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full inline-flex items-center gap-2 text-surface-500 bg-surface-700/50`}>
            <Video size={14} /> Chế độ Video
          </span>
        </div>

        {/* Verdict */}
        <div className={`detect-verdict ${isFake ? 'is-fake' : 'is-real'}`}>
          <div className="detect-verdict__glow" />
          <div className="detect-verdict__icon">
            {isFake ? <ShieldAlert size={36} /> : <ShieldCheck size={36} />}
          </div>
          <span className="detect-verdict__label">Kết quả AI</span>
          <h3 className="detect-verdict__value">{result.label}</h3>
          <span className="detect-verdict__tag">
            {isFake ? 'Cảnh báo Video Deepfake' : 'Video nguyên bản'}
          </span>
        </div>

        {/* Confidence bar */}
        <div className="detect-confidence mt-6">
          <div className="detect-confidence__header">
            <span className="detect-confidence__label">Độ tin cậy tổng hợp</span>
            <div className="detect-confidence__value">
              <span className="detect-confidence__num">
                {(result.confidence * 100).toFixed(1)}
              </span>
              <span className="detect-confidence__pct">%</span>
            </div>
          </div>
          <div className="detect-confidence__track">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${result.confidence * 100}%` }}
              transition={{ duration: 1.5, ease: [0.25, 1, 0.5, 1] }}
              className={`detect-confidence__fill ${isFake ? 'is-fake' : 'is-real'}`}
            />
          </div>
        </div>

        {/* AI Reason */}
        {result.reason && (
          <div className={`detect-reason mt-6 p-4 rounded-xl border bg-surface-800 border-surface-700/50`}>
            <div className={`flex items-center gap-2 mb-2 text-surface-200`}>
              <Info size={16} className="text-accent" style={{ color: '#10b981' }} />
              <h4 className="text-sm font-bold">Báo cáo phân tích</h4>
            </div>
            <p className={`text-sm italic text-surface-400 leading-relaxed`}>"{result.reason}"</p>
          </div>
        )}

        {/* Score breakdown */}
        <div className="detect-scores mt-6">
          <h4 className="detect-scores__head text-surface-300">
            <Layers size={14} />
            Điểm bất thường (Anomaly Score)
          </h4>

          <div className="detect-score-row mt-4">
            <div className="detect-score-row__top">
              <span className="detect-score-row__name">Hình ảnh (Vi ảnh & Môi trường)</span>
              <span className="detect-score-row__val">{result.videoScore}</span>
            </div>
            <div className="detect-score-row__track bg-surface-700/50">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(result.videoScore * 100, 100)}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="detect-score-row__fill"
                style={{ background: result.videoScore > 0.5 ? '#ef4444' : '#10b981' }}
              />
            </div>
          </div>

          <div className="detect-score-row mt-3">
            <div className="detect-score-row__top">
              <span className="detect-score-row__name">Âm thanh (Phổ & Tần số)</span>
              <span className="detect-score-row__val">{result.audioScore}</span>
            </div>
            <div className="detect-score-row__track bg-surface-700/50">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(result.audioScore * 100, 100)}%` }}
                transition={{ duration: 1, delay: 0.7 }}
                className="detect-score-row__fill"
                style={{ background: result.audioScore > 0.5 ? '#ef4444' : '#10b981' }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DetectVideo;
