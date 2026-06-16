import { useState, useRef } from 'react';
import { Upload, X, FileText, Loader2, ShieldCheck, ShieldAlert, AlertTriangle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Detect = () => {
  const [newsText, setNewsText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
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
    await new Promise((r) => setTimeout(r, 2200));
    const isFake = Math.random() > 0.45;
    setResult({
      label: isFake ? 'FAKE' : 'REAL',
      confidence: isFake ? 0.78 + Math.random() * 0.15 : 0.82 + Math.random() * 0.12,
      textScore: (0.6 + Math.random() * 0.35).toFixed(2),
      imageScore: (0.5 + Math.random() * 0.4).toFixed(2),
    });
    setIsLoading(false);
  };

  const canSubmit = newsText.trim().length > 10 || imageFile;
  const isFake = result?.label === 'FAKE';

  return (
    <div className="min-h-screen pt-24 pb-20 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#10b981]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 mb-4">
            <Sparkles size={14} className="text-[#10b981]" />
            <span className="text-[#10b981] text-xs font-bold uppercase tracking-wider">AI Verification Engine</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">Fake News Detection</h1>
          <p className="text-gray-400 text-lg">Provide the news content or an image for deep multimodal analysis.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 items-start">
          {/* ── Input Panel ─────────────── */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col gap-6"
          >
            {/* Text input */}
            <div className="bg-[#0f0f13]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden group focus-within:border-[#10b981]/50 transition-colors shadow-2xl">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                <FileText size={16} className="text-gray-400" />
                <span className="text-gray-300 text-sm font-semibold">News Content</span>
                <span className="text-gray-500 text-xs font-mono ml-auto">{newsText.length} chars</span>
              </div>
              <textarea
                value={newsText}
                onChange={(e) => setNewsText(e.target.value)}
                placeholder="Paste the full news article or headline here..."
                className="w-full h-48 p-4 bg-transparent text-gray-200 placeholder-gray-600 resize-none outline-none focus:ring-0"
              />
            </div>

            {/* Image upload */}
            <div className="bg-[#0f0f13]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl transition-colors hover:border-white/20">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                <Upload size={16} className="text-gray-400" />
                <span className="text-gray-300 text-sm font-semibold">Image Attachment</span>
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
                    className="flex flex-col items-center justify-center py-16 px-6 cursor-pointer hover:bg-white/[0.02] transition-colors group"
                  >
                    <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-gray-600 flex items-center justify-center mb-4 group-hover:border-[#10b981] group-hover:bg-[#10b981]/10 transition-colors">
                      <Upload size={24} className="text-gray-500 group-hover:text-[#10b981] transition-colors" />
                    </div>
                    <p className="text-gray-300 font-medium mb-1">Drop image here or click to browse</p>
                    <p className="text-gray-500 text-xs">Supports PNG, JPG, WEBP up to 10MB</p>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="preview"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative p-4"
                  >
                    <div className="relative rounded-xl overflow-hidden bg-black/50 border border-white/10">
                      <img src={imagePreview} alt="Preview" className="w-full h-auto max-h-[300px] object-contain" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                      <button 
                        onClick={removeImage} 
                        className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-red-500/80 backdrop-blur-md rounded-full text-white transition-colors"
                      >
                        <X size={16} />
                      </button>
                      <p className="absolute bottom-4 left-4 text-white text-sm font-medium truncate max-w-[80%]">
                        {imageFile?.name}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Submit */}
            <button 
              onClick={handleSubmit} 
              disabled={!canSubmit || isLoading} 
              className={`w-full py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
                canSubmit && !isLoading 
                  ? 'bg-[#10b981] hover:bg-[#059669] text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]' 
                  : 'bg-white/5 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <><Loader2 size={20} className="animate-spin" /> Running AI Analysis...</>
              ) : (
                <><Sparkles size={20} /> Analyze Content</>
              )}
            </button>
          </motion.div>

          {/* ── Result Panel ────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="sticky top-24"
          >
            <AnimatePresence mode="wait">
              {!result && !isLoading && (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-[#0f0f13]/40 backdrop-blur-sm border border-dashed border-white/10 rounded-2xl min-h-[400px] flex flex-col items-center justify-center p-8 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                    <ShieldCheck size={24} className="text-gray-500" />
                  </div>
                  <h3 className="text-gray-300 font-medium text-lg mb-2">Awaiting Content</h3>
                  <p className="text-gray-500 text-sm max-w-xs">Submit text or an image on the left to see the AI verification results here.</p>
                </motion.div>
              )}

              {isLoading && (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-[#0f0f13]/80 backdrop-blur-xl border border-white/10 rounded-2xl min-h-[400px] flex flex-col items-center justify-center p-8 text-center shadow-2xl"
                >
                  <div className="relative w-20 h-20 flex items-center justify-center mb-6">
                    <div className="absolute inset-0 border-4 border-[#10b981]/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-[#10b981] rounded-full border-t-transparent animate-spin" />
                    <Sparkles size={24} className="text-[#10b981] animate-pulse" />
                  </div>
                  <h3 className="text-gray-200 font-bold text-xl mb-2">Analyzing Networks</h3>
                  <p className="text-gray-400 text-sm">Cross-referencing multimodal datasets...</p>
                </motion.div>
              )}

              {result && !isLoading && (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#0f0f13]/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative"
                >
                  {/* Glow backdrop based on result */}
                  <div className={`absolute -top-32 -right-32 w-64 h-64 rounded-full blur-[80px] pointer-events-none opacity-30 ${isFake ? 'bg-red-500' : 'bg-[#10b981]'}`} />

                  {/* Verdict banner */}
                  <div className={`p-8 border-b border-white/5 ${isFake ? 'bg-red-500/10' : 'bg-[#10b981]/10'}`}>
                    <div className="flex items-center gap-4 mb-3">
                      <div className={`p-3 rounded-xl ${isFake ? 'bg-red-500/20 text-red-400' : 'bg-[#10b981]/20 text-[#10b981]'}`}>
                        {isFake ? <ShieldAlert size={28} /> : <ShieldCheck size={28} />}
                      </div>
                      <span className={`text-4xl font-black tracking-tight ${isFake ? 'text-red-400' : 'text-[#10b981]'}`}>
                        {result.label}
                      </span>
                    </div>
                    <p className="text-gray-300 font-medium">
                      {isFake ? 'This content exhibits strong signs of manipulation and misinformation.' : 'This content appears to be authentic with high reliability.'}
                    </p>
                  </div>

                  <div className="p-8">
                    {/* Confidence */}
                    <div className="mb-8">
                      <div className="flex items-end justify-between mb-3">
                        <span className="text-gray-400 font-medium uppercase tracking-wider text-xs">AI Confidence</span>
                        <span className="text-3xl font-mono font-bold text-white leading-none">
                          {(result.confidence * 100).toFixed(1)}<span className="text-lg text-gray-500">%</span>
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${result.confidence * 100}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full rounded-full ${isFake ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-[#10b981] shadow-[0_0_10px_rgba(16,185,129,0.8)]'}`} 
                        />
                      </div>
                    </div>

                    {/* Breakdown */}
                    <div className="bg-white/5 rounded-xl p-5 mb-6">
                      <h4 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Multimodal Breakdown</h4>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-gray-300 font-medium">Text Semantics</span>
                        <span className="text-[#10b981] font-mono font-medium">{result.textScore}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 font-medium">Visual Artifacts</span>
                        <span className="text-[#10b981] font-mono font-medium">{result.imageScore}</span>
                      </div>
                    </div>

                    {/* Warning */}
                    <div className="flex items-start gap-3 bg-white/5 rounded-xl p-4 border border-white/5">
                      <AlertTriangle size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                      <p className="text-gray-400 text-xs leading-relaxed">
                        AI predictions are probabilistic and not definitive. Please verify sensitive news through multiple official trusted sources.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Detect;
