
import { useState, useRef, useEffect } from 'react';
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
  Image as ImageIcon,
  ScanSearch,
  CheckCircle2,
  FileSearch,
  Info
} from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { predictNews } from '../services/api';

const Detect = () => {
  const [newsText, setNewsText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMode, setLoadingMode] = useState(null);
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

  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (mode) => {
    if (mode === 'text' && !newsText.trim()) return;
    if (mode === 'multimodal' && !newsText.trim() && !imageFile) return;
    
    setIsLoading(true);
    setLoadingMode(mode);
    setResult(null);
    setError(null);

    try {
      const savedUser = localStorage.getItem('user:v1') || localStorage.getItem('user');
      const user = savedUser ? JSON.parse(savedUser) : null;
      const data = await predictNews(newsText, imageFile, user?.email, mode);
      setResult({
        label: data.label,
        confidence: data.confidence,
        textScore: data.text_score !== "N/A" ? Number(data.text_score).toFixed(2) : "N/A",
        imageScore: data.image_score !== "N/A" ? Number(data.image_score).toFixed(2) : "N/A",
        reason: data.reason,
        mode: data.mode,
        textModelAvailable: data.text_model_available,
        originalText: data.original_text,
        translatedText: data.translated_text,
        extractedText: data.extracted_text,
        imageUrl: data.image_url || imagePreview
      });
    } catch (err) {
      setError(err.message || 'Không thể kết nối backend. Hãy kiểm tra server.');
    } finally {
      setIsLoading(false);
      setLoadingMode(null);
    }
  };

  const canSubmitText = newsText.trim().length > 10;
  const canSubmitMultimodal = imageFile !== null;
  const isFake = result?.label === 'FAKE';

  return (
    <div className="detect-page">
      <div className="detect-ambient">
        <div className="detect-blob detect-blob--1" />
        <div className="detect-blob detect-blob--2" />
        <div className="detect-blob detect-blob--3" />
      </div>

      <div className="page-container detect-container">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="detect-header"
        >
          <div className="detect-badge">
            <ScanSearch size={14} />
            AI Verification Engine
          </div>
          <h1 className="detect-title">
            Kiểm tra <span className="detect-title-accent">tin giả</span>
          </h1>
          <p className="detect-subtitle">
            Hệ thống phân tích đa phương thức kết hợp NLP và Computer Vision
            để phát hiện tin giả với độ chính xác cao nhất.
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
            {/* Card: Text Input */}
            <div className="detect-card">
              <div className="detect-card__glow detect-card__glow--emerald" />
              <div className="detect-card__inner">
                <div className="detect-card__head">
                  <div className="detect-card__icon detect-card__icon--emerald">
                    <FileText size={22} />
                  </div>
                  <div>
                    <h2 className="detect-card__title">Nội dung bài viết</h2>
                    <p className="detect-card__desc">Dán nội dung văn bản cần kiểm chứng</p>
                  </div>
                </div>

                <div className="detect-textarea-wrap">
                  <textarea
                    aria-label="Nội dung bài viết cần kiểm tra"
                    value={newsText}
                    onChange={(e) => setNewsText(e.target.value)}
                    placeholder="Dán nội dung tin tức, bài đăng mạng xã hội hoặc bất kỳ đoạn văn bản nào bạn nghi ngờ..."
                    className="detect-textarea"
                    maxLength={5000}
                  />
                  <span className={`detect-textarea-count ${newsText.length > 0 ? 'is-active' : ''}`}>
                    {newsText.length} / 5000
                  </span>
                </div>
                
                {/* Submit Text Only */}
                <button
                  type="button"
                  onClick={() => handleSubmit('text')}
                  disabled={!canSubmitText || isLoading}
                  className={`detect-submit detect-submit--text mt-6 ${canSubmitText && !isLoading ? 'is-ready' : ''}`}
                >
                  <span className="detect-submit__content">
                    {isLoading && loadingMode === 'text' ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Đang phân tích NLP…
                      </>
                    ) : (
                      <>
                        <FileSearch size={18} />
                        Kiểm tra Văn bản
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>

            {/* Card: Image Input */}
            <div className="detect-card">
              <div className="detect-card__glow detect-card__glow--teal" />
              <div className="detect-card__inner">
                <div className="detect-card__head">
                  <div className="detect-card__icon detect-card__icon--teal">
                    <ImageIcon size={22} />
                  </div>
                  <div>
                    <h2 className="detect-card__title">Hình ảnh đính kèm</h2>
                    <p className="detect-card__desc">Hình ảnh minh họa cho bài viết (Tùy chọn)</p>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {!imagePreview ? (
                    <motion.div
                      key="upload"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onDrop={(e) => { e.preventDefault(); handleImageChange(e); }}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => fileInputRef.current?.click()}
                      className="detect-dropzone"
                    >
                      <div className="detect-dropzone__icon">
                        <Upload size={26} />
                      </div>
                      <p className="detect-dropzone__text">
                        Kéo thả ảnh hoặc{' '}
                        <span className="detect-dropzone__link">duyệt qua máy tính</span>
                      </p>
                      <p className="detect-dropzone__hint">PNG, JPG, WEBP — Tối đa 10 MB</p>
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
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="detect-preview"
                    >
                      <img src={imagePreview} alt="Preview" className="detect-preview__img" />
                      <div className="detect-preview__overlay" />
                      <button type="button" onClick={removeImage} className="detect-preview__remove">
                        <X size={16} />
                      </button>
                      <div className="detect-preview__meta">
                        <p className="detect-preview__name">{imageFile?.name}</p>
                        <p className="detect-preview__size">{(imageFile?.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Submit Multimodal */}
            <button
              type="button"
              onClick={() => handleSubmit('multimodal')}
              disabled={!canSubmitMultimodal || isLoading}
              className={`detect-submit ${canSubmitMultimodal && !isLoading ? 'is-ready' : ''}`}
            >
              {canSubmitMultimodal && !isLoading && <div className="detect-submit__shimmer" />}
              <span className="detect-submit__content">
                {isLoading && loadingMode === 'multimodal' ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Đang phân tích Đa phương thức…
                  </>
                ) : (
                  <>
                    <Layers size={20} />
                    Kiểm tra Đa phương thức
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
                  <div className="detect-result-empty__glow" />
                  <div className="detect-result-empty__icon">
                    <ShieldCheck size={40} strokeWidth={1.4} />
                  </div>
                  <h3 className="detect-result-empty__title">Chờ nội dung</h3>
                  <p className="detect-result-empty__desc">
                    Hệ thống đã sẵn sàng. Hãy nhập dữ liệu ở bên trái
                    để AI tiến hành phân tích và đối chiếu.
                  </p>
                  <div className="detect-result-empty__steps">
                    <div className="detect-result-empty__step">
                      <FileText size={14} />
                      <span>Nhập văn bản</span>
                    </div>
                    <div className="detect-result-empty__step">
                      <ImageIcon size={14} />
                      <span>Đính kèm ảnh</span>
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
                  <div className="detect-result-loading__pulse" />
                  <div className="detect-result-loading__spinner">
                    <div className="detect-spinner-ring detect-spinner-ring--outer" />
                    <div className="detect-spinner-ring detect-spinner-ring--inner" />
                    <Sparkles size={24} className="detect-spinner-icon" />
                  </div>
                  <h3 className="detect-result-loading__title">Đang quét AI</h3>
                  <p className="detect-result-loading__desc">Đang xử lý mạng neural đa phương thức…</p>
                </motion.div>
              )}

              {result && !isLoading && (
                <DetectResultCard result={result} isFake={isFake} />
              )}
            </AnimatePresence>
          </motion.aside>
        </div>
      </div>
    </div>
  );
};

const DetectResultCard = ({ result, isFake }) => {
  return (
    <motion.div
      key="result"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`detect-result ${result.imageUrl ? 'has-bg-image' : ''}`}
    >
      {result.imageUrl && (
        <>
          <div 
            className="detect-result__bg" 
            style={{ backgroundImage: `url(${result.imageUrl})` }}
          />
          <div className="detect-result__overlay" />
        </>
      )}
      
      <div className="detect-result__content">
        {/* Mode Badge */}
        <div className="detect-mode-badge mb-4 flex justify-center">
          <span className={`text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full inline-flex items-center gap-2 ${result.imageUrl ? 'text-white/90 bg-white/20 backdrop-blur-md' : 'text-surface-500 bg-surface-700/50'}`}>
            {result.mode === 'text' && <><FileSearch size={14} /> Chế độ Text-Only</>}
            {result.mode === 'image' && <><ImageIcon size={14} /> Chế độ Image-Only</>}
            {result.mode === 'multimodal' && <><Layers size={14} /> Chế độ Đa phương thức</>}
          </span>
        </div>

        {/* Verdict */}
        <div className={`detect-verdict ${isFake ? 'is-fake' : 'is-real'} ${result.imageUrl ? 'is-transparent' : ''}`}>
          <div className="detect-verdict__glow" />
          <div className="detect-verdict__icon">
            {isFake ? <ShieldAlert size={36} /> : <ShieldCheck size={36} />}
          </div>
          <span className="detect-verdict__label">Kết quả AI</span>
          <h3 className="detect-verdict__value">{result.label}</h3>
          <span className="detect-verdict__tag">
            {isFake ? 'Cảnh báo nội dung rác' : 'Nội dung tin cậy'}
          </span>
        </div>

        {/* Confidence bar */}
        <div className="detect-confidence">
          <div className="detect-confidence__header">
            <span className="detect-confidence__label">Độ tin cậy</span>
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
          <div className={`detect-reason mt-2 p-4 rounded-xl border ${result.imageUrl ? 'bg-white/10 border-white/20 backdrop-blur-md' : 'bg-surface-800 border-surface-700/50'}`}>
            <div className={`flex items-center gap-2 mb-2 ${result.imageUrl ? 'text-white' : 'text-surface-200'}`}>
              <Info size={16} className={result.imageUrl ? 'text-white' : 'text-accent'} />
              <h4 className="text-sm font-bold">Lý do AI</h4>
            </div>
            <p className={`text-sm italic ${result.imageUrl ? 'text-white/90 shadow-black' : 'text-surface-400'}`} style={result.imageUrl ? {textShadow: '0 1px 3px rgba(0,0,0,0.8)'} : {}}>"{result.reason}"</p>
          </div>
        )}

        {/* Score breakdown */}
        <div className="detect-scores">
          <h4 className="detect-scores__head">
            <Layers size={14} />
            Phân tích chi tiết
          </h4>

          {result.textScore !== "N/A" && (
            <div className="detect-score-row">
              <div className="detect-score-row__top">
                <span className="detect-score-row__name">Text (NLP)</span>
                <span className="detect-score-row__val">{result.textScore}</span>
              </div>
              <div className="detect-score-row__track">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(Math.abs(result.textScore) * 10, 100)}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="detect-score-row__fill"
                />
              </div>
            </div>
          )}

          {result.imageScore !== "N/A" && (
            <div className="detect-score-row">
              <div className="detect-score-row__top">
                <span className="detect-score-row__name">Visual (CNN)</span>
                <span className="detect-score-row__val">{result.imageScore}</span>
              </div>
              <div className="detect-score-row__track">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(Math.abs(result.imageScore) * 10, 100)}%` }}
                  transition={{ duration: 1, delay: 0.7 }}
                  className="detect-score-row__fill"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Detect;
