import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Mail, GitBranch } from 'lucide-react';
import { getAdminStats } from '../services/api';

const footerLinks = [
  { to: '/', label: 'Trang chủ' },
  { to: '/detect', label: 'Kiểm tra tin' },
  { to: '/history', label: 'Lịch sử' },
  { to: '/about', label: 'Công nghệ' },
];

const techStack = ['React', 'Flask', 'PyTorch', 'Supabase', 'Tailwind'];

const Footer = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  return (
    <footer className="site-footer">
      <div className="site-footer-cta">
        <div className="page-container">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
              <ShieldCheck size={28} className="text-emerald-300" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white md:text-4xl">
              Bảo vệ thông tin, bắt đầu từ hôm nay
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-slate-300 md:text-lg">
              Hệ thống AI đa phương thức giúp bạn xác minh tin tức nhanh chóng,
              chính xác và minh bạch.
            </p>
            <Link
              to="/detect"
              className="btn-primary btn-primary-lg group mt-2 bg-emerald-500 hover:bg-emerald-600"
            >
              Kiểm tra ngay
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="site-footer-main bg-white">
        <div className="page-container">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-5">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent shadow-sm">
                  <ShieldCheck size={22} className="text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold text-surface-50">AntiFakeNews</p>
                  <p className="text-sm text-surface-400">Multimodal AI Detection</p>
                </div>
              </div>
              <p className="max-w-md text-base leading-relaxed text-surface-400">
                Đồ án tốt nghiệp — Phát hiện tin giả bằng học đa phương thức,
                kết hợp phân tích văn bản và hình ảnh với kiến trúc late-fusion.
              </p>

              {stats && (
                <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-surface-700 bg-surface-900 px-4 py-5">
                    <p className="text-2xl font-bold text-surface-50">{stats.total_predictions}</p>
                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-surface-500">
                      Lượt kiểm tra
                    </p>
                  </div>
                  <div className="rounded-2xl border border-surface-700 bg-surface-900 px-4 py-5">
                    <p className="text-2xl font-bold text-danger">{stats.fake_count}</p>
                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-surface-500">
                      Tin giả
                    </p>
                  </div>
                  <div className="col-span-2 rounded-2xl border border-surface-700 bg-surface-900 px-4 py-5 sm:col-span-1">
                    <p className="text-2xl font-bold text-accent">{stats.real_count}</p>
                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-surface-500">
                      Tin thật
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-3">
              <h3 className="mb-6 text-sm font-bold uppercase tracking-[0.14em] text-surface-500">
                Điều hướng
              </h3>
              <div className="flex flex-col gap-4">
                {footerLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-base text-surface-300 transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to="/admin"
                  className="text-base text-surface-300 transition-colors hover:text-accent"
                >
                  Admin Panel
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4">
              <h3 className="mb-6 text-sm font-bold uppercase tracking-[0.14em] text-surface-500">
                Công nghệ
              </h3>
              <div className="flex flex-wrap gap-3">
                {techStack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-surface-700 bg-surface-900 px-4 py-2 text-sm font-medium text-surface-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <div className="mt-10 space-y-4">
                <p className="text-sm font-semibold uppercase tracking-wide text-surface-500">
                  Liên hệ
                </p>
                <a
                  href="mailto:contact@antifakenews.dev"
                  className="flex items-center gap-3 text-base text-surface-300 transition-colors hover:text-accent"
                >
                  <Mail size={18} className="text-surface-400" />
                  contact@antifakenews.dev
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-base text-surface-300 transition-colors hover:text-accent"
                >
                  <GitBranch size={18} className="text-surface-400" />
                  GitHub Repository
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="site-footer-bottom">
        <div className="page-container flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="text-sm text-surface-500">
            © {new Date().getFullYear()} AntiFakeNews. All rights reserved.
          </p>
          <p className="font-mono text-sm text-surface-500">v1.0.0 · Flask + React</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
