import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Image, Layers, Sparkles, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: FileText,
    step: '01',
    title: 'NLP Analysis',
    desc: 'Mô hình Transformer phân tích ngữ nghĩa bài viết, phát hiện các mẫu ngôn ngữ phổ biến trong tin sai lệch.',
    accent: 'text-blue-600',
    iconBg: 'bg-blue-50',
    hoverBorder: 'hover:border-blue-200',
  },
  {
    icon: Image,
    step: '02',
    title: 'Image Verification',
    desc: 'Mạng CNN phân tích tính xác thực của hình ảnh, kiểm tra dấu hiệu chỉnh sửa và deepfake.',
    accent: 'text-purple-600',
    iconBg: 'bg-purple-50',
    hoverBorder: 'hover:border-purple-200',
  },
  {
    icon: Layers,
    step: '03',
    title: 'Multimodal Fusion',
    desc: 'Tín hiệu từ text và image được kết hợp qua kiến trúc late-fusion để đưa ra kết luận chính xác nhất.',
    accent: 'text-accent',
    iconBg: 'bg-emerald-50',
    hoverBorder: 'hover:border-emerald-200',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const Home = () => {
  return (
    <div className="relative overflow-hidden">
      <section className="hero-section relative overflow-hidden bg-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, #000 40%, transparent 100%)',
          }}
        />
        <div className="pointer-events-none absolute -right-24 top-1/4 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-1/4 h-80 w-80 rounded-full bg-teal-400/10 blur-3xl" />

        <div className="page-container relative z-10 flex w-full justify-center">
          <div className="hero-inner">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="section-label"
            >
              <Sparkles size={14} />
              Multimodal Fake News Detection
            </motion.div>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={1}
              className="mb-6 mt-2 text-4xl font-extrabold leading-[1.12] tracking-tight text-surface-50 sm:text-5xl md:mb-8 md:text-6xl"
            >
              Phát hiện tin giả
              <br />
              <span className="text-gradient">bằng AI đa phương thức</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={2}
              className="mb-12 max-w-2xl text-base leading-relaxed text-surface-400 md:mb-14 md:text-lg"
            >
              Kết hợp phân tích văn bản và hình ảnh để xác minh tính xác thực
              của tin tức — đồ án tốt nghiệp sử dụng kiến trúc multimodal late-fusion.
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={3}
              className="flex w-full flex-col items-center justify-center gap-5 sm:w-auto sm:flex-row sm:gap-6"
            >
              <Link to="/detect" className="btn-primary btn-primary-lg group w-full sm:w-auto">
                Bắt đầu kiểm tra
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link to="/about" className="btn-secondary btn-primary-lg w-full sm:w-auto">
                Tìm hiểu công nghệ
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section-block border-t border-surface-700 bg-surface-900">
        <div className="page-container">
          <div className="section-head text-center">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
              Core Technology
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-surface-50 md:text-4xl">
              Ba lớp phân tích chuyên sâu
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-8 lg:gap-10">
            {features.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`card card-padded flex h-full flex-col transition-all duration-200 ${item.hoverBorder} hover:shadow-md`}
              >
                <div className="mb-8 flex items-start justify-between gap-6">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.iconBg} ${item.accent}`}>
                    <item.icon size={22} />
                  </div>
                  <span className="select-none pr-1 text-3xl font-black leading-none text-surface-700 md:text-4xl">
                    {item.step}
                  </span>
                </div>

                <h3 className="mb-3 text-lg font-bold text-surface-100">{item.title}</h3>
                <p className="text-sm leading-relaxed text-surface-400 md:text-[15px]">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-block border-t border-surface-700 bg-white">
        <div className="page-container">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 text-center md:gap-10">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
              <ShieldCheck size={32} className="text-accent" />
            </div>

            <div className="space-y-5">
              <h2 className="text-2xl font-bold tracking-tight text-surface-50 md:text-3xl">
                Sẵn sàng kiểm tra tin tức?
              </h2>
              <p className="mx-auto max-w-lg text-base leading-relaxed text-surface-400 md:text-lg">
                Dán nội dung bài viết và upload hình ảnh đi kèm. Hệ thống AI sẽ
                phân tích và đưa ra kết quả trong vài giây.
              </p>
            </div>

            <Link to="/detect" className="btn-primary btn-primary-lg group mt-1 bg-surface-50 hover:bg-surface-100">
              Khởi chạy Detection Engine
              <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
