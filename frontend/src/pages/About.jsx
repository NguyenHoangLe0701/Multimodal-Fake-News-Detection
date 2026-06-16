import { ExternalLink } from 'lucide-react';

const techStack = [
  {
    category: 'Frontend',
    items: [
      { name: 'React', desc: 'Component-based UI library' },
      { name: 'Vite', desc: 'Fast build tooling' },
      { name: 'Tailwind CSS', desc: 'Utility-first styling' },
      { name: 'React Router', desc: 'Client-side routing' },
    ],
  },
  {
    category: 'Backend',
    items: [
      { name: 'Flask', desc: 'Lightweight Python web framework' },
      { name: 'Flask Blueprint', desc: 'Modular route organization' },
      { name: 'Flask CORS', desc: 'Cross-origin resource sharing' },
    ],
  },
  {
    category: 'AI / ML',
    items: [
      { name: 'PyTorch', desc: 'Deep learning framework' },
      { name: 'Transformers', desc: 'Pre-trained NLP models' },
      { name: 'OpenCV', desc: 'Image processing library' },
      { name: 'Scikit-learn', desc: 'ML utilities and metrics' },
    ],
  },
  {
    category: 'Data',
    items: [
      { name: 'Supabase', desc: 'PostgreSQL + Auth + Storage' },
    ],
  },
];

const teamMembers = [
  { name: 'Member 1', role: 'Full-stack Developer', initials: 'M1' },
  { name: 'Member 2', role: 'AI/ML Engineer', initials: 'M2' },
  { name: 'Member 3', role: 'Data & Research', initials: 'M3' },
];

const pipeline = [
  { step: '1', label: 'Input', desc: 'Text + Image' },
  { step: '2', label: 'API', desc: 'Flask Server' },
  { step: '3', label: 'Text Model', desc: 'Transformer' },
  { step: '4', label: 'Image Model', desc: 'CNN / ViT' },
  { step: '5', label: 'Fusion', desc: 'Late Fusion' },
  { step: '6', label: 'Output', desc: 'Fake / Real' },
];

const cardStyle = {
  borderRadius: 12, border: '1px solid var(--c-700)', background: 'var(--c-900)', padding: 20,
};

const sectionLabel = {
  color: 'var(--c-300)', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16,
};

const About = () => {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 48 }}>
        <p style={{ color: 'var(--accent)', fontSize: 12, fontFamily: 'var(--font-code)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 4 }}>
          About
        </p>
        <h1 style={{ color: 'var(--c-100)', fontSize: 'clamp(1.5rem, 3vw, 1.9rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 12 }}>
          Anti Fake News Detection
        </h1>
        <p style={{ color: 'var(--c-400)', fontSize: 20, fontWeight: 400, marginBottom: 12 }}>
          Using Multimodal Learning
        </p>
        <p style={{ color: 'var(--c-400)', fontSize: 14, lineHeight: 1.7, maxWidth: 600 }}>
          This is a final year capstone project that leverages deep learning to combat misinformation.
          By analyzing both textual and visual content simultaneously, our system provides a more robust
          assessment of news authenticity than single-modality approaches.
        </p>
      </div>

      {/* Pipeline */}
      <section style={{ marginBottom: 64 }}>
        <h2 style={{ color: 'var(--c-200)', fontSize: 18, fontWeight: 600, marginBottom: 24 }}>System Overview</h2>
        <div style={{ ...cardStyle, padding: '24px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 8, overflowX: 'auto' }}>
            {pipeline.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 100 }}>
                <div style={{
                  flex: 1, borderRadius: 8, border: '1px solid var(--c-700)',
                  background: 'var(--c-800)', padding: '12px 16px', textAlign: 'center',
                }}>
                  <span style={{ color: 'var(--accent)', fontSize: 10, fontFamily: 'var(--font-code)', fontWeight: 500, display: 'block', marginBottom: 4 }}>
                    {item.step}
                  </span>
                  <p style={{ color: 'var(--c-100)', fontSize: 14, fontWeight: 500 }}>{item.label}</p>
                  <p style={{ color: 'var(--c-500)', fontSize: 11 }}>{item.desc}</p>
                </div>
                {i < pipeline.length - 1 && (
                  <span style={{ color: 'var(--c-600)', fontSize: 12, flexShrink: 0 }}>→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section style={{ marginBottom: 64 }}>
        <h2 style={{ color: 'var(--c-200)', fontSize: 18, fontWeight: 600, marginBottom: 24 }}>Technology Stack</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {techStack.map((group) => (
            <div key={group.category} style={cardStyle}>
              <h3 style={sectionLabel}>{group.category}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {group.items.map((item) => (
                  <div key={item.name}>
                    <p style={{ color: 'var(--c-100)', fontSize: 14, fontWeight: 500 }}>{item.name}</p>
                    <p style={{ color: 'var(--c-500)', fontSize: 12 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section style={{ marginBottom: 64 }}>
        <h2 style={{ color: 'var(--c-200)', fontSize: 18, fontWeight: 600, marginBottom: 24 }}>Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {teamMembers.map((member) => (
            <div key={member.name} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'var(--c-800)', border: '1px solid var(--c-600)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <span style={{ color: 'var(--c-300)', fontSize: 12, fontFamily: 'var(--font-code)', fontWeight: 500 }}>
                  {member.initials}
                </span>
              </div>
              <div>
                <p style={{ color: 'var(--c-100)', fontSize: 14, fontWeight: 500 }}>{member.name}</p>
                <p style={{ color: 'var(--c-500)', fontSize: 12 }}>{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Resources */}
      <section>
        <h2 style={{ color: 'var(--c-200)', fontSize: 18, fontWeight: 600, marginBottom: 24 }}>Resources</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {[
            { label: 'GitHub Repository', href: '#' },
            { label: 'Project Report', href: '#' },
            { label: 'Dataset Reference', href: '#' },
          ].map((link) => (
            <a key={link.label} href={link.href} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 16px', borderRadius: 8,
              border: '1px solid var(--c-700)', background: 'var(--c-900)',
              color: 'var(--c-300)', fontSize: 14, transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--c-500)'; e.currentTarget.style.color = 'var(--c-100)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--c-700)'; e.currentTarget.style.color = 'var(--c-300)'; }}
            >
              {link.label}
              <ExternalLink size={12} />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};

export default About;
