import { useState } from 'react';
import { Clock, ShieldCheck, ShieldAlert, Eye } from 'lucide-react';

const mockHistory = [
  {
    id: '1',
    text: 'Breaking: Scientists discover new species of whale in the Arctic ocean, marking a significant breakthrough in marine biology research...',
    label: 'REAL',
    confidence: 0.94,
    createdAt: '2026-06-15T14:30:00Z',
  },
  {
    id: '2',
    text: 'SHOCKING: Local man wins lottery 5 times in a row using this one weird trick that casinos HATE...',
    label: 'FAKE',
    confidence: 0.91,
    createdAt: '2026-06-14T09:15:00Z',
  },
  {
    id: '3',
    text: 'Government announces new infrastructure plan focusing on renewable energy and public transportation improvements across the country...',
    label: 'REAL',
    confidence: 0.87,
    createdAt: '2026-06-13T18:45:00Z',
  },
  {
    id: '4',
    text: 'Aliens spotted landing in downtown area, witnesses claim they saw bright lights and strange creatures emerging from a metallic craft...',
    label: 'FAKE',
    confidence: 0.96,
    createdAt: '2026-06-12T22:10:00Z',
  },
];

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

const History = () => {
  const [items] = useState(mockHistory);
  const [selectedId, setSelectedId] = useState(null);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <p style={{ color: 'var(--accent)', fontSize: 12, fontFamily: 'var(--font-code)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 4 }}>
            Records
          </p>
          <h1 style={{ color: 'var(--c-100)', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>Detection History</h1>
          <p style={{ color: 'var(--c-400)', fontSize: 14, marginTop: 4 }}>Review your past analyses and their results.</p>
        </div>
        <span style={{
          color: 'var(--c-500)', fontSize: 12, fontFamily: 'var(--font-code)',
          border: '1px solid var(--c-700)', borderRadius: 6, padding: '4px 8px',
        }}>
          {items.length} entries
        </span>
      </div>

      {/* Table */}
      <div style={{ borderRadius: 12, border: '1px solid var(--c-700)', background: 'var(--c-900)', overflow: 'hidden' }}>
        {/* Header row — desktop only */}
        <div className="hidden md:grid" style={{
          gridTemplateColumns: '3fr 1fr 1fr 1.5fr',
          gap: 16, padding: '12px 20px',
          borderBottom: '1px solid var(--c-800)', background: 'rgba(24,24,29,0.4)',
        }}>
          {['Content', 'Verdict', 'Confidence', 'Date'].map((h) => (
            <span key={h} style={{ color: 'var(--c-400)', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {items.map((item, i) => (
          <div
            key={item.id}
            onClick={() => setSelectedId(selectedId === item.id ? null : item.id)}
            style={{
              display: 'grid', gridTemplateColumns: '1fr',
              gap: 8, padding: '16px 20px', cursor: 'pointer',
              borderBottom: i < items.length - 1 ? '1px solid var(--c-800)' : 'none',
              background: selectedId === item.id ? 'rgba(24,24,29,0.4)' : 'transparent',
              transition: 'background 0.15s',
            }}
            className="md:!grid-cols-[3fr_1fr_1fr_1.5fr]"
            onMouseEnter={e => { if (selectedId !== item.id) e.currentTarget.style.background = 'rgba(24,24,29,0.3)'; }}
            onMouseLeave={e => { if (selectedId !== item.id) e.currentTarget.style.background = 'transparent'; }}
          >
            {/* Content */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <div style={{
                width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                background: item.label === 'FAKE' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {item.label === 'FAKE'
                  ? <ShieldAlert size={11} style={{ color: 'var(--danger-light)' }} />
                  : <ShieldCheck size={11} style={{ color: 'var(--accent-light)' }} />
                }
              </div>
              <p style={{ color: 'var(--c-200)', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.text}
              </p>
            </div>

            {/* Verdict */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{
                padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500,
                background: item.label === 'FAKE' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                color: item.label === 'FAKE' ? 'var(--danger-light)' : 'var(--accent-light)',
              }}>
                {item.label}
              </span>
            </div>

            {/* Confidence */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ color: 'var(--c-200)', fontSize: 14, fontFamily: 'var(--font-code)' }}>
                {(item.confidence * 100).toFixed(1)}%
              </span>
            </div>

            {/* Date */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={11} style={{ color: 'var(--c-500)' }} />
              <span style={{ color: 'var(--c-400)', fontSize: 12 }}>{formatDate(item.createdAt)}</span>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0', textAlign: 'center' }}>
            <Clock size={24} style={{ color: 'var(--c-600)', marginBottom: 12 }} />
            <p style={{ color: 'var(--c-400)', fontSize: 14, marginBottom: 4 }}>No history yet</p>
            <p style={{ color: 'var(--c-600)', fontSize: 12 }}>Your detection results will appear here.</p>
          </div>
        )}
      </div>

      {/* Expanded detail */}
      {selectedId && (() => {
        const item = items.find(i => i.id === selectedId);
        if (!item) return null;
        return (
          <div className="animate-fade-up" style={{
            marginTop: 16, borderRadius: 12, border: '1px solid var(--c-700)',
            background: 'var(--c-900)', padding: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ color: 'var(--c-100)', fontSize: 14, fontWeight: 600 }}>Full Content</h3>
              <button onClick={() => setSelectedId(null)} style={{
                background: 'transparent', border: 'none', color: 'var(--c-500)', cursor: 'pointer',
              }}>
                <Eye size={14} />
              </button>
            </div>
            <p style={{ color: 'var(--c-300)', fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>{item.text}</p>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 16, paddingTop: 16, borderTop: '1px solid var(--c-800)',
            }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: item.label === 'FAKE' ? 'var(--danger-light)' : 'var(--accent-light)' }}>
                {item.label}
              </span>
              <span style={{ color: 'var(--c-500)', fontSize: 12 }}>•</span>
              <span style={{ color: 'var(--c-400)', fontSize: 12, fontFamily: 'var(--font-code)' }}>
                {(item.confidence * 100).toFixed(1)}% confidence
              </span>
              <span style={{ color: 'var(--c-500)', fontSize: 12 }}>•</span>
              <span style={{ color: 'var(--c-400)', fontSize: 12 }}>{formatDate(item.createdAt)}</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default History;
