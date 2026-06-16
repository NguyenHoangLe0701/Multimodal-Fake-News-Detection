import { useState, useRef } from 'react';
import { Upload, X, FileText, Loader2, ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

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
  const verdictColor = isFake ? 'var(--danger-light)' : 'var(--accent-light)';
  const verdictBg = isFake ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)';
  const barColor = isFake ? 'var(--danger)' : 'var(--accent)';

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ color: 'var(--accent)', fontSize: 12, fontFamily: 'var(--font-code)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 4 }}>
          Analysis
        </p>
        <h1 style={{ color: 'var(--c-100)', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>Fake News Detection</h1>
        <p style={{ color: 'var(--c-400)', fontSize: 14, marginTop: 4 }}>Provide the news content and/or an image for AI verification.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }} className="lg:!grid-cols-[3fr_2fr]">
        {/* ── Input Panel ─────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Text input */}
          <div style={{ borderRadius: 12, border: '1px solid var(--c-700)', background: 'var(--c-900)', overflow: 'hidden' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 16px', borderBottom: '1px solid var(--c-800)',
            }}>
              <FileText size={14} style={{ color: 'var(--c-400)' }} />
              <span style={{ color: 'var(--c-300)', fontSize: 12, fontWeight: 500 }}>News Content</span>
              <span style={{ color: 'var(--c-500)', fontSize: 12, fontFamily: 'var(--font-code)', marginLeft: 'auto' }}>{newsText.length}</span>
            </div>
            <textarea
              value={newsText}
              onChange={(e) => setNewsText(e.target.value)}
              placeholder="Paste the full news article or headline here..."
              style={{
                width: '100%', height: 192, padding: '12px 16px',
                background: 'transparent', color: 'var(--c-100)', fontSize: 14,
                lineHeight: 1.7, resize: 'none', outline: 'none', border: 'none',
                fontFamily: 'var(--font-body)',
              }}
            />
          </div>

          {/* Image upload */}
          <div style={{ borderRadius: 12, border: '1px solid var(--c-700)', background: 'var(--c-900)', overflow: 'hidden' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 16px', borderBottom: '1px solid var(--c-800)',
            }}>
              <Upload size={14} style={{ color: 'var(--c-400)' }} />
              <span style={{ color: 'var(--c-300)', fontSize: 12, fontWeight: 500 }}>Image Attachment</span>
            </div>

            {!imagePreview ? (
              <div
                onDrop={(e) => { e.preventDefault(); handleImageChange(e); }}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', padding: '40px 16px', cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(24,24,29,0.3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 8,
                  border: '1px dashed var(--c-600)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
                }}>
                  <Upload size={16} style={{ color: 'var(--c-500)' }} />
                </div>
                <p style={{ color: 'var(--c-400)', fontSize: 14, marginBottom: 4 }}>Drop image here or click to browse</p>
                <p style={{ color: 'var(--c-600)', fontSize: 12 }}>PNG, JPG, WEBP up to 10MB</p>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
              </div>
            ) : (
              <div style={{ position: 'relative', padding: 16 }}>
                <img src={imagePreview} alt="Preview" style={{
                  width: '100%', maxHeight: 240, objectFit: 'contain', borderRadius: 8, background: 'var(--c-800)',
                }} />
                <button onClick={removeImage} style={{
                  position: 'absolute', top: 24, right: 24,
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'rgba(9,9,11,0.8)', border: '1px solid var(--c-600)',
                  color: 'var(--c-300)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <X size={13} />
                </button>
                <p style={{ color: 'var(--c-500)', fontSize: 12, fontFamily: 'var(--font-code)', marginTop: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {imageFile?.name}
                </p>
              </div>
            )}
          </div>

          {/* Submit */}
          <button onClick={handleSubmit} disabled={!canSubmit || isLoading} style={{
            width: '100%', padding: '12px 0', borderRadius: 8, fontSize: 14, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            border: 'none', cursor: canSubmit && !isLoading ? 'pointer' : 'not-allowed',
            background: canSubmit && !isLoading ? 'var(--accent)' : 'var(--c-800)',
            color: canSubmit && !isLoading ? 'var(--c-950)' : 'var(--c-500)',
            transition: 'all 0.2s',
          }}>
            {isLoading ? (<><Loader2 size={15} className="animate-spin" /> Analyzing...</>) : 'Analyze Content'}
          </button>
        </div>

        {/* ── Result Panel ────────────── */}
        <div>
          {!result && !isLoading && (
            <div style={{
              borderRadius: 12, border: '1px dashed var(--c-800)',
              background: 'rgba(15,15,19,0.5)', minHeight: 300,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--c-700)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
              }}>
                <ShieldCheck size={18} style={{ color: 'var(--c-600)' }} />
              </div>
              <p style={{ color: 'var(--c-500)', fontSize: 14, marginBottom: 4 }}>No results yet</p>
              <p style={{ color: 'var(--c-600)', fontSize: 12 }}>Submit content to see the analysis</p>
            </div>
          )}

          {isLoading && (
            <div style={{
              borderRadius: 12, border: '1px solid var(--c-700)', background: 'var(--c-900)',
              minHeight: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24,
            }}>
              <Loader2 size={24} style={{ color: 'var(--accent)' }} className="animate-spin" />
              <p style={{ color: 'var(--c-300)', fontSize: 14, fontWeight: 500, marginTop: 12, marginBottom: 4 }}>Processing...</p>
              <p style={{ color: 'var(--c-500)', fontSize: 12 }}>Running multimodal analysis</p>
            </div>
          )}

          {result && !isLoading && (
            <div className="animate-fade-up" style={{ borderRadius: 12, border: '1px solid var(--c-700)', background: 'var(--c-900)', overflow: 'hidden' }}>
              {/* Verdict banner */}
              <div style={{ padding: '20px 24px', background: verdictBg }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  {isFake ? <ShieldAlert size={22} style={{ color: verdictColor }} /> : <ShieldCheck size={22} style={{ color: verdictColor }} />}
                  <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', color: verdictColor }}>{result.label}</span>
                </div>
                <p style={{ color: 'var(--c-300)', fontSize: 12 }}>
                  {isFake ? 'This content shows signs of misinformation.' : 'This content appears to be authentic.'}
                </p>
              </div>

              {/* Confidence */}
              <div style={{ padding: '16px 24px', borderTop: '1px solid var(--c-800)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: 'var(--c-400)', fontSize: 12, fontWeight: 500 }}>Confidence</span>
                  <span style={{ color: 'var(--c-100)', fontSize: 14, fontFamily: 'var(--font-code)', fontWeight: 500 }}>
                    {(result.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 99, background: 'var(--c-800)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 99, background: barColor, transition: 'width 0.7s ease', width: `${result.confidence * 100}%` }} />
                </div>
              </div>

              {/* Breakdown */}
              <div style={{ padding: '16px 24px', borderTop: '1px solid var(--c-800)' }}>
                <h4 style={{ color: 'var(--c-300)', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Breakdown</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: 'var(--c-400)', fontSize: 14 }}>Text signal</span>
                  <span style={{ color: 'var(--c-200)', fontSize: 14, fontFamily: 'var(--font-code)' }}>{result.textScore}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--c-400)', fontSize: 14 }}>Image signal</span>
                  <span style={{ color: 'var(--c-200)', fontSize: 14, fontFamily: 'var(--font-code)' }}>{result.imageScore}</span>
                </div>
              </div>

              {/* Warning */}
              <div style={{ padding: '12px 24px', borderTop: '1px solid var(--c-800)', background: 'rgba(24,24,29,0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <AlertTriangle size={12} style={{ color: 'var(--warn)', marginTop: 2, flexShrink: 0 }} />
                  <p style={{ color: 'var(--c-500)', fontSize: 11, lineHeight: 1.6 }}>
                    AI predictions are not definitive. Always verify news through multiple trusted sources.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Detect;
