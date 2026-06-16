import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Image, Layers } from 'lucide-react';

const features = [
  {
    icon: FileText,
    step: '01',
    title: 'Text Analysis',
    desc: 'Transformer-based NLP processes article semantics, detects linguistic patterns common in misinformation, and evaluates source credibility markers.',
  },
  {
    icon: Image,
    step: '02',
    title: 'Image Verification',
    desc: 'Convolutional neural networks analyze image authenticity — checking for manipulation artifacts, reverse-image context, and visual inconsistencies.',
  },
  {
    icon: Layers,
    step: '03',
    title: 'Multimodal Fusion',
    desc: 'Both signals are fused through a late-fusion architecture, cross-referencing text claims against visual evidence for a final verdict.',
  },
];

const stats = [
  { value: '95.2%', label: 'Accuracy' },
  { value: '< 3s', label: 'Response Time' },
  { value: '50K+', label: 'Training Samples' },
  { value: '2', label: 'Input Modalities' },
];

const Home = () => {
  return (
    <div>
      {/* ── Hero ──────────────────────────────── */}
      <section style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 400, background: 'rgba(16,185,129,0.04)',
          borderRadius: '50%', filter: 'blur(120px)', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '96px 24px', width: '100%' }}>
          <div style={{ maxWidth: 600 }}>
            {/* Tag */}
            <div className="animate-fade-up" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '4px 12px', borderRadius: 99,
              border: '1px solid var(--c-700)', background: 'var(--c-900)', marginBottom: 24,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
              <span style={{ color: 'var(--c-300)', fontSize: 12, fontWeight: 500 }}>Multimodal AI Detection System</span>
            </div>

            {/* Headline */}
            <h1 className="animate-fade-up delay-1" style={{
              color: 'var(--c-100)', fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
              fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 20,
            }}>
              Detect fake news<br />
              <span className="text-gradient">before it spreads.</span>
            </h1>

            <p className="animate-fade-up delay-2" style={{
              color: 'var(--c-300)', fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)',
              lineHeight: 1.7, marginBottom: 32, maxWidth: 500,
            }}>
              Upload any news article — text and image — and get an instant AI-powered
              authenticity analysis using multimodal deep learning.
            </p>

            {/* CTA */}
            <div className="animate-fade-up delay-3" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
              <Link to="/detect" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 20px', borderRadius: 8,
                background: 'var(--accent)', color: 'var(--c-950)',
                fontSize: 14, fontWeight: 600, transition: 'background 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-light)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
              >
                Start Detection <ArrowRight size={15} />
              </Link>
              <Link to="/about" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 20px', borderRadius: 8,
                border: '1px solid var(--c-700)', color: 'var(--c-300)',
                fontSize: 14, fontWeight: 500, transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--c-500)'; e.currentTarget.style.color = 'var(--c-100)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--c-700)'; e.currentTarget.style.color = 'var(--c-300)'; }}
              >
                Learn more
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────── */}
      <section style={{ borderTop: '1px solid var(--c-800)', padding: '80px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ marginBottom: 48 }}>
            <p style={{ color: 'var(--accent)', fontSize: 12, fontFamily: 'var(--font-code)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>
              How it works
            </p>
            <h2 style={{ color: 'var(--c-100)', fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)', fontWeight: 700, letterSpacing: '-0.02em' }}>
              Three layers of analysis
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3" style={{ border: '1px solid var(--c-700)', borderRadius: 12, overflow: 'hidden' }}>
            {features.map((item, i) => (
              <div key={i} style={{
                background: 'var(--c-900)', padding: 32,
                borderLeft: i > 0 ? '1px solid var(--c-700)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: 'var(--c-800)', border: '1px solid var(--c-700)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <item.icon size={16} style={{ color: 'var(--accent)' }} />
                  </div>
                  <span style={{ color: 'var(--c-600)', fontSize: 12, fontFamily: 'var(--font-code)' }}>{item.step}</span>
                </div>
                <h3 style={{ color: 'var(--c-100)', fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{item.title}</h3>
                <p style={{ color: 'var(--c-400)', fontSize: 13, lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────── */}
      <section style={{ borderTop: '1px solid var(--c-800)', padding: '64px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '16px 0' }}>
                <p style={{ color: 'var(--c-100)', fontSize: 'clamp(1.6rem, 3vw, 2rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
                  {stat.value}
                </p>
                <p style={{ color: 'var(--c-500)', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────── */}
      <section style={{ borderTop: '1px solid var(--c-800)', padding: '80px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--c-100)', fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 16 }}>
            Ready to verify?
          </h2>
          <p style={{ color: 'var(--c-400)', fontSize: 14, marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
            Paste news content and upload the accompanying image. Our AI will do the rest.
          </p>
          <Link to="/detect" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 24px', borderRadius: 8,
            background: 'var(--accent)', color: 'var(--c-950)',
            fontSize: 14, fontWeight: 600, transition: 'background 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-light)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
          >
            Go to Detection <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
