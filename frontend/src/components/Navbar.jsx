import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/detect', label: 'Detect' },
  { to: '/history', label: 'History' },
  { to: '/about', label: 'About' },
];

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        borderBottom: '1px solid var(--c-800)',
        backgroundColor: 'rgba(9,9,11,0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 6,
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-code)', fontSize: 11, fontWeight: 500 }}>AF</span>
            </div>
            <span style={{ color: 'var(--c-100)', fontSize: 14, fontWeight: 600, letterSpacing: '-0.02em' }}>
              AntiFakeNews
            </span>
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="hidden md:flex">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500,
                    color: isActive ? 'var(--c-100)' : 'var(--c-400)',
                    backgroundColor: isActive ? 'var(--c-800)' : 'transparent',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { if (!isActive) { e.target.style.color = 'var(--c-200)'; e.target.style.backgroundColor = 'rgba(24,24,29,0.5)'; } }}
                  onMouseLeave={(e) => { if (!isActive) { e.target.style.color = 'var(--c-400)'; e.target.style.backgroundColor = 'transparent'; } }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden"
            style={{
              padding: 6, borderRadius: 6, border: 'none', cursor: 'pointer',
              background: 'transparent', color: 'var(--c-400)',
            }}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden"
          style={{ borderTop: '1px solid var(--c-800)', background: 'rgba(9,9,11,0.95)', backdropFilter: 'blur(16px)' }}
        >
          <nav style={{ display: 'flex', flexDirection: 'column', padding: '12px 24px', gap: 4 }}>
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    padding: '8px 12px', borderRadius: 6, fontSize: 14, fontWeight: 500,
                    color: isActive ? 'var(--c-100)' : 'var(--c-400)',
                    backgroundColor: isActive ? 'var(--c-800)' : 'transparent',
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
