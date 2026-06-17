import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, ChevronLeft, Globe, Zap } from 'lucide-react';

const AuthLayout = ({ children, title, subtitle, illustration = 'ai' }) => {
  return (
    <div className="flex min-h-screen w-full bg-[#F8FAFC]">
      {/* Left Pane: Hero Section (Hidden on Mobile) */}
      <div className="relative hidden w-1/2 flex-col justify-center items-center overflow-hidden bg-[#1E293B] p-12 lg:flex xl:p-16">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E293B] via-slate-900 to-[#2563EB]/40"></div>
        
        {/* Abstract Shapes */}
        <div className="absolute -top-32 -left-32 w-[30rem] h-[30rem] rounded-full bg-[#2563EB]/20 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] rounded-full bg-[#3B82F6]/10 blur-[150px]"></div>
        
        {/* Dot Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] bg-[size:32px_32px] opacity-30"></div>

        {/* Logo - Absolutely positioned */}
        <div className="absolute top-12 left-12 xl:top-16 xl:left-16 z-20">
          <Link to="/" className="inline-flex items-center gap-3 transition-transform hover:scale-105 w-fit">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#2563EB] shadow-lg shadow-blue-900/50">
              <ShieldCheck size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              AntiFake<span className="text-[#3B82F6]">News</span>
            </span>
          </Link>
        </div>

        {/* Main Content - Centered */}
        <div className="relative z-10 flex flex-col items-center text-center w-full my-auto">
          <h2 className="text-4xl font-bold leading-tight text-white xl:text-5xl">
            Bảo vệ sự thật.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Ngăn chặn tin giả.
            </span>
          </h2>
          <p className="mt-10 mb-20 max-w-md text-lg text-slate-300 xl:text-xl font-medium leading-relaxed">
            Hệ thống phân tích đa phương thức ứng dụng trí tuệ nhân tạo để mang lại môi trường thông tin minh bạch.
          </p>

          {/* Illustration Mockup - High Tech Dashboard */}
          <div className="relative w-full max-w-lg rounded-2xl bg-white/5 border border-white/10 overflow-hidden backdrop-blur-md shadow-2xl">
            {/* Window Header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/10">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              <div className="ml-4 px-3 py-1 rounded-md bg-white/5 text-xs text-slate-300 flex items-center gap-2 font-mono">
                <Zap size={12} className="text-cyan-400" />
                <span>system_analysis_active</span>
              </div>
            </div>
            
            {/* Window Body */}
            <div className="p-6 relative">
              {/* Background glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl"></div>
              
              <div className="relative z-10 flex flex-col gap-5">
                {/* Simulated Article Scan */}
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center shadow-lg shrink-0">
                    <Globe className="text-white" size={24} />
                  </div>
                  <div className="flex-1 space-y-3 py-1">
                    <div className="h-2.5 w-3/4 bg-white/20 rounded-full overflow-hidden relative">
                      <motion.div 
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-y-0 left-0 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                      />
                    </div>
                    <div className="h-2 w-1/2 bg-white/10 rounded-full"></div>
                    <div className="h-2 w-5/6 bg-white/10 rounded-full"></div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-colors"
                  >
                    <div className="p-2.5 rounded-lg bg-emerald-500/20">
                      <ShieldCheck size={20} className="text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-400 mb-0.5">Độ tin cậy</div>
                      <div className="text-base font-bold text-white tracking-tight">98.5%</div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-colors"
                  >
                    <div className="p-2.5 rounded-lg bg-blue-500/20">
                      <Zap size={20} className="text-blue-400" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-400 mb-0.5">Tốc độ xử lý</div>
                      <div className="text-base font-bold text-white tracking-tight">0.42s</div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer removed per user request */}
      </div>

      {/* Right Pane: Form Area */}
      <div className="flex w-full flex-col justify-center items-center px-6 py-12 sm:px-12 lg:w-1/2 lg:px-20 xl:px-32 relative">
        <Link to="/" className="absolute top-8 left-6 md:left-12 flex items-center gap-2 text-slate-500 hover:text-[#1E293B] font-semibold transition-colors">
          <ChevronLeft size={20} /> <span className="hidden sm:inline">Về trang chủ</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md mx-auto"
        >
          <div className="mb-10 text-center mt-8 lg:mt-0">
            <div className="flex justify-center lg:hidden mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#2563EB] shadow-xl">
                <ShieldCheck size={28} className="text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight xl:text-4xl">
              {title}
            </h1>
            <p className="mt-2 text-slate-500 text-base font-medium">
              {subtitle}
            </p>
          </div>

          {children}

        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
