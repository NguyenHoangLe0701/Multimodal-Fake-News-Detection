import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{ borderTop: '1px solid var(--c-800)', backgroundColor: 'var(--c-950)', marginTop: 'auto' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{
                width: 24, height: 24, borderRadius: 6,
                background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-code)', fontSize: 10, fontWeight: 500 }}>AF</span>
              </div>
              <span style={{ color: 'var(--c-200)', fontSize: 14, fontWeight: 600 }}>AntiFakeNews</span>
            </div>
            <p style={{ color: 'var(--c-400)', fontSize: 12, lineHeight: 1.7, maxWidth: 280 }}>
              Multimodal learning approach to detect fake news using both text content and images. A final year project.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 style={{ color: 'var(--c-300)', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
              Navigation
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { to: '/', label: 'Home' },
                { to: '/detect', label: 'Detection' },
                { to: '/history', label: 'History' },
                { to: '/about', label: 'About' },
              ].map((link) => (
                <Link key={link.to} to={link.to} style={{ color: 'var(--c-400)', fontSize: 14, transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = 'var(--c-200)'}
                  onMouseLeave={e => e.target.style.color = 'var(--c-400)'}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Tech */}
          <div>
            <h3 style={{ color: 'var(--c-300)', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
              Built With
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['React', 'Flask', 'PyTorch', 'Supabase', 'Tailwind'].map((tech) => (
                <span key={tech} style={{
                  padding: '2px 8px', borderRadius: 4,
                  background: 'var(--c-800)', color: 'var(--c-400)',
                  fontSize: 12, border: '1px solid var(--c-700)',
                }}>
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--c-800)',
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8,
        }}>
          <p style={{ color: 'var(--c-500)', fontSize: 12 }}>© {new Date().getFullYear()} AntiFakeNews. All rights reserved.</p>
          <p style={{ color: 'var(--c-500)', fontSize: 12, fontFamily: 'var(--font-code)' }}>v1.0.0</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
