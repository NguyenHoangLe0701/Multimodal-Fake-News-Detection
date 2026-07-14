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
import { predictVideo } from '../services/api';

const FactorBar = ({ icon, name, hint, value, delay }) => {
  if (value === "N/A") return null;

  const numVal = Math.min(Math.max(Number(value), 0), 1);
  const pct = (numVal * 100).toFixed(0);

  const getBarColor = (v) => {
    if (v < 0.35) return '#10b981'; // emerald-500
    if (v < 0.65) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  };

  const getRiskLabel = (v) => {
    if (v < 0.35) return 'BÌNH THƯỜNG';
    if (v < 0.65) return 'CẦN LƯU Ý';
    return 'BẤT THƯỜNG';
  };

  const barColor = getBarColor(numVal);
  const riskLabel = getRiskLabel(numVal);

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      className="mb-2 mt-4"
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-3 text-slate-800 font-bold text-[14px]">
          <span className="text-slate-600 bg-slate-100 p-2 rounded-lg flex items-center justify-center shadow-sm border border-slate-200/50">{icon}</span>
          <span className="leading-tight">{name}</span>
        </div>
        <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-100">
          <span className="font-bold text-[11px] tracking-widest" style={{ color: barColor }}>{riskLabel}</span>
          <span className="font-black text-[14px]" style={{ color: barColor }}>{pct}%</span>
        </div>
      </div>
      
      <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner mb-3">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: numVal }}
          transition={{ duration: 1.2, delay: delay + 0.15, ease: [0.25, 1, 0.5, 1] }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${barColor}88, ${barColor})`, transformOrigin: 'left' }}
        />
      </div>
      
      <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-100 mt-2">
        <p className="text-[13px] text-slate-500 italic leading-relaxed">{hint}</p>
      </div>
    </motion.div>
  );
};

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

    try {
      const savedUser = localStorage.getItem('user:v1') || localStorage.getItem('user');
      const user = savedUser ? JSON.parse(savedUser) : null;
      
      const data = await predictVideo(videoFile, user?.email);
      setResult({
        label: data.label,
        confidence: data.confidence,
        videoScore: data.videoScore !== undefined ? Number(data.videoScore).toFixed(2) : "N/A",
        reason: data.reason,
        mode: data.mode || 'video'
      });
    } catch (err) {
      setError(err.message || 'Không thể kết nối backend. Vui lòng thử lại sau.');
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
                        aria-label="Xóa video"
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
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
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

      {/* === CORE TECHNOLOGY SECTION (GIỐNG TRANG CHỦ) === */}
      <section className="section-block border-t border-surface-700 bg-surface-900 mt-20 w-full">
        <div className="page-container mx-auto">
          <div className="section-head text-center">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
              Core Technology
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-surface-50 md:text-4xl">
              Ba bước phân tích chuyên sâu
            </h2>
          </div>

          <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-8 lg:gap-10 mt-6">
            {/* Đường solid đen đứt đoạn qua các thẻ */}
            <div className="absolute top-1/2 left-[18%] right-[18%] hidden h-[3px] bg-slate-900 md:block -translate-y-1/2 z-0" />
            
            {[
              {
                icon: Video,
                step: '01',
                title: 'Frame Extraction',
                desc: 'Hệ thống tự động phân rã video thành các khung hình rời rạc, trích xuất chính xác 30 frame đại diện trải đều theo toàn bộ thời lượng.',
                accent: 'text-blue-600',
                iconBg: 'bg-blue-50',
                hoverBorder: 'hover:border-blue-200',
              },
              {
                icon: Layers,
                step: '02',
                title: 'Spatio-Temporal CNN',
                desc: 'Mạng 3D ResNet (r3d_18) phân tích không gian từng điểm ảnh và sự liên kết chuyển động mượt mà (temporal) giữa các frame.',
                accent: 'text-purple-600',
                iconBg: 'bg-purple-50',
                hoverBorder: 'hover:border-purple-200',
              },
              {
                icon: ShieldCheck,
                step: '03',
                title: 'Video Verification',
                desc: 'Tổng hợp các điểm bất thường vi mô không thể thấy bằng mắt thường, đánh giá xác suất giả mạo để xuất ra báo cáo (Confidence Score).',
                accent: 'text-emerald-600',
                iconBg: 'bg-emerald-50',
                hoverBorder: 'hover:border-emerald-200',
              },
            ].map((item, i) => (
              <div key={item.title} className="relative h-full">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`card card-padded relative z-10 flex h-full flex-col transition-all duration-300 ${item.hoverBorder} hover:-translate-y-2 hover:shadow-2xl bg-white`}
                >
                  <div className="mb-8 flex items-start justify-between gap-6">
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${item.iconBg} ${item.accent} shadow-md border border-white/50 ring-4 ring-white`}>
                      <item.icon size={26} strokeWidth={2.5} />
                    </div>
                    <span className="select-none pr-1 text-5xl font-black leading-none text-surface-200/50">
                      {item.step}
                    </span>
                  </div>

                  <h3 className="mb-3 text-[19px] font-extrabold text-surface-100">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-surface-400 md:text-[15px]">{item.desc}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>
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
              initial={{ scaleX: 0 }}
              animate={{ scaleX: result.confidence }}
              transition={{ duration: 1.5, ease: [0.25, 1, 0.5, 1] }}
              className={`detect-confidence__fill w-full origin-left ${isFake ? 'is-fake' : 'is-real'}`}
            />
          </div>
        </div>

        {/* AI Reason */}
        {result.reason && (
          <div className="mt-6 p-5 rounded-xl border border-white/60 bg-white/80 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-2 mb-2 text-slate-800">
              <Info size={16} className="text-emerald-500" />
              <h4 className="text-[15px] font-bold">Lý do AI</h4>
            </div>
            <p className="text-[14px] italic text-slate-700 leading-relaxed font-medium">"{result.reason}"</p>
          </div>
        )}

        {/* Factor Breakdown */}
        <div className="mt-6 p-5 rounded-xl border border-white/60 bg-white/80 shadow-sm backdrop-blur-md">
          <h4 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            <Layers size={14} /> Phân tích từng yếu tố
          </h4>
          <p className="text-[13px] text-slate-500 mb-6 leading-relaxed">
            Biểu đồ dưới đây cho thấy mức độ bất thường mà AI phát hiện qua từng khía cạnh.
            Thanh càng dài và đỏ nghĩa là yếu tố đó càng có dấu hiệu tin giả.
          </p>
          <div className="flex flex-col gap-2">
            <FactorBar
              icon={<Video size={16} />}
              name="Không gian & Thời gian (3D-CNN)"
              hint="Mạng 3D ResNet phát hiện viền ghép nối, sự thiếu tự nhiên về ánh sáng và độ mượt mà giữa các khung hình liên tiếp."
              value={result.videoScore}
              delay={0.3}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DetectVideo;
