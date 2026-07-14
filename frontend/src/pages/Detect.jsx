
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
  Info
} from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { predictNews } from '../services/api';


function useDetectLogic() {
  const [newsText, setNewsText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMode, setLoadingMode] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const [showTextPrompt, setShowTextPrompt] = useState(false);

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

  const handleSubmit = async (mode, skipPrompt = false) => {
    if (mode === 'multimodal' && !newsText.trim() && !imageFile) return;
    
    // Cảnh báo nếu nhập văn bản quá ngắn (dưới 15 ký tự) hoặc chưa nhập
    if (mode === 'multimodal' && imageFile && newsText.trim().length < 15 && !skipPrompt) {
      setShowTextPrompt(true);
      return;
    }
    
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
        semanticScore: data.semantic_score !== "N/A" ? Number(data.semantic_score) : "N/A",
        ocrMismatchScore: data.ocr_mismatch_score !== "N/A" ? Number(data.ocr_mismatch_score) : "N/A",
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

  const canSubmitMultimodal = imageFile !== null;
  const isFake = result?.label === 'FAKE';
  const isUncertain = result?.label === 'UNCERTAIN';

  return {
    newsText, setNewsText,
    imageFile, imagePreview,
    isLoading, loadingMode,
    result, error,
    fileInputRef, showTextPrompt, setShowTextPrompt,
    handleImageChange, removeImage, handleSubmit,
    canSubmitMultimodal, isFake, isUncertain
  };
}

const Detect = () => {
  const {
    newsText, setNewsText,
    imageFile, imagePreview,
    isLoading, loadingMode,
    result, error,
    fileInputRef, showTextPrompt, setShowTextPrompt,
    handleImageChange, removeImage, handleSubmit,
    canSubmitMultimodal, isFake, isUncertain
  } = useDetectLogic();

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
          <DetectInputForm 
            newsText={newsText}
            setNewsText={setNewsText}
            imageFile={imageFile}
            imagePreview={imagePreview}
            fileInputRef={fileInputRef}
            handleImageChange={handleImageChange}
            removeImage={removeImage}
            handleSubmit={handleSubmit}
            canSubmitMultimodal={canSubmitMultimodal}
            isLoading={isLoading}
            loadingMode={loadingMode}
            error={error}
          />

          {/* === RIGHT COLUMN: result === */}
          <motion.aside
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="detect-right"
          >
            <AnimatePresence mode="wait">
              {/* Empty state */}
              {!result && !isLoading && <DetectEmptyState />}
              {isLoading && <DetectLoadingState />}

              {result && !isLoading && (
                <DetectResultCard result={result} isFake={isFake} isUncertain={isUncertain} />
              )}
            </AnimatePresence>
          </motion.aside>
        </div>
      </div>

      {/* Text Prompt Modal */}
      <TextPromptModal 
        show={showTextPrompt} 
        onClose={() => setShowTextPrompt(false)} 
        onContinue={() => handleSubmit('multimodal', true)} 
      />
    </div>
  );
};

const ModeBadge = ({ mode, hasImage }) => {
  const isImageBg = hasImage ? 'text-white/90 bg-white/20 backdrop-blur-md' : 'text-surface-500 bg-surface-700/50';
  return (
    <div className="detect-mode-badge mb-4 flex justify-center">
      <span className={`text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full inline-flex items-center gap-2 ${isImageBg}`}>
        {mode === 'text' && <><FileText size={14} /> Chế độ Text-Only</>}
        {mode === 'image' && <><ImageIcon size={14} /> Chế độ Image-Only</>}
        {mode === 'multimodal' && <><Layers size={14} /> Chế độ Đa phương thức</>}
      </span>
    </div>
  );
};

const VerdictSection = ({ label, isFake, isUncertain, hasImage }) => {
  const statusClass = isFake ? 'is-fake' : isUncertain ? 'is-uncertain' : 'is-real';
  const transparentClass = hasImage ? 'is-transparent' : '';
  const statusTag = isFake ? 'Cảnh báo nội dung rác' : isUncertain ? 'Thiếu dữ kiện' : 'Nội dung tin cậy';
  
  return (
    <div className={`detect-verdict ${statusClass} ${transparentClass}`}>
      <div className="detect-verdict__glow" />
      <div className="detect-verdict__icon">
        {isFake ? <ShieldAlert size={36} /> : isUncertain ? <AlertTriangle size={36} /> : <ShieldCheck size={36} />}
      </div>
      <span className="detect-verdict__label">Kết quả AI</span>
      <h3 className="detect-verdict__value">{label}</h3>
      <span className="detect-verdict__tag">{statusTag}</span>
    </div>
  );
};

const ReasonSection = ({ reason, hasImage }) => {
  if (!reason) return null;
  const bgClass = hasImage ? 'bg-white/90 border-white/50 backdrop-blur-xl shadow-lg' : 'bg-surface-800 border-surface-700/50';
  const textClass = hasImage ? 'text-slate-800' : 'text-surface-200';
  const iconColor = hasImage ? 'text-emerald-600' : 'text-accent';
  const pClass = hasImage ? 'text-slate-600' : 'text-surface-400';

  return (
    <div className={`detect-reason mt-2 p-4 rounded-xl border ${bgClass}`}>
      <div className={`flex items-center gap-2 mb-2 ${textClass}`}>
        <Info size={16} className={iconColor} />
        <h4 className="text-sm font-bold">Lý do AI</h4>
      </div>
      <p className={`text-sm italic ${pClass}`}>"{reason}"</p>
    </div>
  );
};

const FactorBar = ({ icon, name, hint, value, delay, hasImage }) => {
  // value: 0..1 where higher = more risky/fake
  // "N/A" means this factor was not evaluated
  if (value === "N/A") return null;

  const numVal = Math.min(Math.max(Number(value), 0), 1);
  const pct = (numVal * 100).toFixed(0);

  // Dynamic color: low risk = green, mid = amber, high = red
  const getBarColor = (v) => {
    if (v < 0.35) return '#10b981'; // emerald-500
    if (v < 0.65) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  };

  const getRiskLabel = (v) => {
    if (v < 0.35) return 'Bình thường';
    if (v < 0.65) return 'Cần lưu ý';
    return 'Bất thường';
  };

  const barColor = getBarColor(numVal);
  const riskLabel = getRiskLabel(numVal);
  const textColorClass = hasImage ? 'factor-bar--on-image' : '';

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`factor-bar ${textColorClass}`}
    >
      <div className="factor-bar__header">
        <div className="factor-bar__label">
          <span className="factor-bar__icon">{icon}</span>
          <span className="factor-bar__name">{name}</span>
        </div>
        <div className="factor-bar__stats">
          <span className="factor-bar__risk" style={{ color: barColor }}>{riskLabel}</span>
          <span className="factor-bar__pct" style={{ color: barColor }}>{pct}%</span>
        </div>
      </div>
      <div className="factor-bar__track">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: numVal }}
          transition={{ duration: 1.2, delay: delay + 0.15, ease: [0.25, 1, 0.5, 1] }}
          className="factor-bar__fill"
          style={{ background: `linear-gradient(90deg, ${barColor}88, ${barColor})`, transformOrigin: 'left' }}
        />
      </div>
      <p className="factor-bar__hint">{hint}</p>
    </motion.div>
  );
};

const DetectResultCard = ({ result, isFake, isUncertain }) => {
  const hasImage = !!result.imageUrl;
  const statusClass = isFake ? 'is-fake' : isUncertain ? 'is-uncertain' : 'is-real';

  // Normalize CLIP semantic mismatch based on actual CLIP distribution:
  // CLIP cosine similarity typically ranges 0.10 (unrelated) to 0.40+ (very related)
  // We map this range to 0% (aligned) → 100% (mismatched)
  const semanticMismatch = result.semanticScore !== "N/A"
    ? Math.min(Math.max((0.40 - result.semanticScore) / 0.30, 0), 1).toFixed(4)
    : "N/A";

  return (
    <motion.div
      key="result"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`detect-result ${hasImage ? 'has-bg-image' : ''}`}
    >
      {hasImage && (
        <>
          <div className="detect-result__bg" style={{ backgroundImage: `url(${result.imageUrl})` }} />
          <div className="detect-result__overlay" />
        </>
      )}
      
      <div className="detect-result__content">
        <ModeBadge mode={result.mode} hasImage={hasImage} />
        
        <VerdictSection label={result.label} isFake={isFake} isUncertain={isUncertain} hasImage={hasImage} />

        {/* Confidence bar */}
        <div className="detect-confidence">
          <div className="detect-confidence__header">
            <span className="detect-confidence__label">Độ tin cậy</span>
            <div className="detect-confidence__value">
              <span className="detect-confidence__num">{(result.confidence * 100).toFixed(1)}</span>
              <span className="detect-confidence__pct">%</span>
            </div>
          </div>
          <div className="detect-confidence__track">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: result.confidence }}
              transition={{ duration: 1.5, ease: [0.25, 1, 0.5, 1] }}
              className={`detect-confidence__fill w-full origin-left ${statusClass}`}
            />
          </div>
        </div>

        <ReasonSection reason={result.reason} hasImage={hasImage} />

        {/* Factor Breakdown */}
        <div className="detect-factors">
          <h4 className="detect-factors__head">
            <Layers size={14} /> Phân tích từng yếu tố
          </h4>
          <p className="detect-factors__desc">
            Biểu đồ dưới đây cho thấy mức độ bất thường mà AI phát hiện trên từng khía cạnh.
            Thanh càng dài và đỏ nghĩa là yếu tố đó càng có dấu hiệu tin giả.
          </p>
          <div className="detect-factors__list">
            <FactorBar
              icon={<FileText size={15} />}
              name="Phân tích văn bản (NLP)"
              hint="Mô hình BERT đánh giá mức độ bất thường về ngữ pháp, giật tít, sai lệch thông tin"
              value={result.textScore}
              delay={0.3}
              hasImage={hasImage}
            />
            <FactorBar
              icon={<ImageIcon size={15} />}
              name="Phân tích hình ảnh (CNN)"
              hint="Mạng CNN nhận diện đặc trưng thị giác liên quan đến tin giả (meme, screenshot, cắt ghép)"
              value={result.imageScore}
              delay={0.5}
              hasImage={hasImage}
            />
            <FactorBar
              icon={<ScanSearch size={15} />}
              name="Tương quan ảnh — văn bản"
              hint="CLIP so sánh ngữ nghĩa: ảnh có đúng ngữ cảnh với nội dung văn bản không"
              value={semanticMismatch}
              delay={0.7}
              hasImage={hasImage}
            />
            <FactorBar
              icon={<AlertTriangle size={15} />}
              name="Đối chiếu chữ trong ảnh"
              hint="OCR trích xuất chữ từ ảnh và so sánh với nội dung bài viết để phát hiện mâu thuẫn"
              value={result.ocrMismatchScore}
              delay={0.9}
              hasImage={hasImage}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const DetectEmptyState = () => (
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
);

const DetectLoadingState = () => (
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
);

const TextPromptModal = ({ show, onClose, onContinue }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-6"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 24 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md bg-white rounded-[28px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] overflow-hidden"
        >
          <div className="h-1 w-full bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500" />
          <div className="px-8 pt-10 pb-8 flex flex-col items-center text-center">
            <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center mb-7 ring-1 ring-orange-200/60 shadow-sm">
              <AlertTriangle size={34} className="text-orange-500" strokeWidth={2} />
            </div>
            <h3 className="text-[22px] font-bold text-slate-900 mb-3 leading-tight">
              Thiếu ngữ cảnh văn bản
            </h3>
            <p className="text-[15px] text-slate-500 leading-[1.7] max-w-[340px]">
              Mô hình AI cần <span className="text-slate-700 font-semibold">cả hình ảnh lẫn văn bản</span> để đối chiếu chéo. Nhập quá ít chữ có thể cho kết quả không chính xác.
            </p>
          </div>
          <div className="px-8 pb-8 flex gap-3">
            <button
              type="button"
              onClick={onContinue}
              className="flex-1 h-12 rounded-2xl text-[15px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 active:bg-slate-200 transition-colors"
            >
              Bỏ qua
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 rounded-2xl text-[15px] font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:from-orange-600 active:to-amber-600 shadow-md shadow-orange-500/20 transition-colors flex items-center justify-center gap-2"
            >
              <FileText size={17} />
              Bổ sung văn bản
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default Detect;

const DetectInputForm = ({
  newsText, setNewsText,
  imageFile, imagePreview,
  fileInputRef, handleImageChange, removeImage,
  handleSubmit, canSubmitMultimodal, isLoading, loadingMode, error
}) => {
  return (
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
                <button type="button" onClick={removeImage} className="detect-preview__remove" aria-label="Xóa ảnh">
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
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="detect-error"
        >
          <AlertTriangle size={16} />
          {error}
        </motion.div>
      )}
    </motion.div>
  );
};
