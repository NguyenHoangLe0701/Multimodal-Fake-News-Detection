import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Image, Layers, Sparkles, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: FileText,
    step: '01',
    title: 'NLP Analysis',
    desc: 'Transformer-based AI processes article semantics to detect linguistic patterns common in misinformation.',
    color: 'from-blue-500 to-cyan-400'
  },
  {
    icon: Image,
    step: '02',
    title: 'Image Verification',
    desc: 'Deep neural networks analyze image authenticity, checking for manipulation artifacts and deepfakes.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: Layers,
    step: '03',
    title: 'Multimodal Fusion',
    desc: 'Signals are fused through a late-fusion architecture for an incredibly precise final authenticity verdict.',
    color: 'from-[#10b981] to-[#34d399]'
  },
];

const stats = [
  { value: '98.5%', label: 'Detection Accuracy' },
  { value: '< 2s', label: 'Processing Time' },
  { value: '100K+', label: 'Verified Sources' },
  { value: '2', label: 'Input Modalities' },
];

const Home = () => {
  return (
    <div className="relative overflow-hidden selection:bg-[#10b981] selection:text-black">
      {/* ── Hero ──────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20 pb-32">
        {/* Background glow elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#10b981]/20 rounded-full blur-[120px] pointer-events-none animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          {/* Tag */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8"
          >
            <Sparkles size={16} className="text-[#10b981]" />
            <span className="text-gray-300 text-sm font-medium">Next-Gen Multimodal AI Engine</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight mb-6 leading-tight"
          >
            Detect Fake News <br className="hidden md:block" />
            <span className="text-gradient">before it spreads.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Upload any news article — text and image — and get an instant, highly accurate AI-powered authenticity analysis to fight misinformation.
          </motion.p>

          {/* CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/detect" className="glow-button group flex items-center gap-2 px-8 py-4 bg-[#10b981] hover:bg-[#059669] text-black font-bold rounded-xl transition-all w-full sm:w-auto justify-center">
              Start Verification <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/about" className="flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl transition-all w-full sm:w-auto justify-center backdrop-blur-md">
              Learn how it works
            </Link>
          </motion.div>
        </div>
        
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
      </section>

      {/* ── Stats ─────────────────────────────── */}
      <section className="relative z-10 border-y border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/5">
            {stats.map((stat, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center px-4"
              >
                <p className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
                  {stat.value}
                </p>
                <p className="text-sm font-semibold text-[#10b981] uppercase tracking-widest">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────── */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-[#10b981] text-sm font-bold tracking-widest uppercase mb-3">Core Technology</h2>
            <h3 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
              Three layers of <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-500">Deep Analysis</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="glass-panel rounded-2xl p-8 relative overflow-hidden group hover:border-white/10 transition-colors"
              >
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${item.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
                
                <div className="flex items-center justify-between mb-8">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-white group-hover:scale-110 transition-transform`}>
                    <item.icon size={24} />
                  </div>
                  <span className="text-6xl font-black text-white/5 group-hover:text-white/10 transition-colors pointer-events-none">
                    {item.step}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────── */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#10b981]/5" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <ShieldCheck size={64} className="mx-auto text-[#10b981] mb-8 opacity-80" />
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Ready to uncover the truth?
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Paste news content and upload the accompanying image. Our multimodal AI will cross-reference the data in seconds.
          </p>
          <Link to="/detect" className="glow-button inline-flex items-center gap-2 px-10 py-5 bg-white text-black text-lg font-bold rounded-2xl hover:bg-gray-100 transition-all">
            Launch Detection Engine <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
