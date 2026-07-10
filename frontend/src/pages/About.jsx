import { m as motion } from 'framer-motion';
import { Layers, Video, Image as ImageIcon, FileText, Sparkles, Network, ShieldCheck, ArrowRight, BrainCircuit } from 'lucide-react';


const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const newsFeatures = [
  {
    icon: FileText,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50 border-blue-100',
    glowClass: 'bg-blue-300',
    title: 'NLP & OCR',
    body: 'Trích xuất văn bản từ ảnh bằng Tesseract, kết hợp dịch thuật Deep Translator và mô hình Transformer (BERT) để phân tích sâu sắc ngữ nghĩa ngôn ngữ.',
  },
  {
    icon: ImageIcon,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-50 border-purple-100',
    glowClass: 'bg-purple-300',
    title: 'Computer Vision',
    body: 'Sử dụng OpenCV Inpainting làm sạch văn bản nhiễu trên ảnh gốc. Sau đó quét qua mạng CNN (ResNet50) để trích xuất đặc trưng không gian 2D.',
  },
  {
    icon: Network,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50 border-emerald-100',
    glowClass: 'bg-emerald-300',
    title: 'CLIP Semantic Fusion',
    body: 'Sức mạnh cốt lõi. Áp dụng mô hình CLIP (ViT-B/32) để tính Cosine Similarity giữa chữ và ảnh, chặn đứng thủ đoạn "ảnh thật nhưng ghép sai ngữ cảnh".',
  },
];

const videoFeatures = [
  {
    icon: Video,
    iconColor: 'text-teal-600',
    iconBg: 'bg-teal-50 border-teal-100',
    glowClass: 'bg-teal-300',
    title: 'Frame Extraction (OpenCV)',
    body: 'Hệ thống tự động phân rã video thành các khung hình rời rạc, lọc nhiễu và trích xuất chính xác 30 frame đại diện trải đều theo toàn bộ thời lượng video.',
  },
  {
    icon: Layers,
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-50 border-indigo-100',
    glowClass: 'bg-indigo-300',
    title: 'Spatio-Temporal (3D CNN)',
    body: 'Mạng 3D ResNet (r3d_18) phân tích đồng thời không gian từng điểm ảnh (spatial) và sự liên kết chuyển động mượt mà (temporal) giữa các frame liên tiếp.',
  },
  {
    icon: ShieldCheck,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50 border-emerald-100',
    glowClass: 'bg-emerald-300',
    title: 'Video Verification',
    body: 'Khớp nối kết quả, tổng hợp các điểm bất thường vi mô không thể thấy bằng mắt thường, đánh giá xác suất giả mạo và xuất ra mức độ tin cậy (Confidence Score).',
  },
];

const About = () => {
  return (
    <div className="relative min-h-screen bg-surface-900 pb-20">
      {/* Background Ambient Blobs (Pure Tailwind) */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-emerald-200/50 blur-[120px]" />
        <div className="absolute top-[30%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-teal-200/40 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[30vw] h-[30vw] rounded-full bg-blue-200/30 blur-[120px]" />
      </div>
      
      {/* FORCE FLEX COLUMN LAYOUT TO PREVENT OVERLAP */}
      <div className="page-container relative z-10 pt-28 pb-40 flex flex-col gap-28">
        
        {/* HEADER */}
        <motion.header
          initial="hidden"
          animate="show"
          className="flex flex-col items-center justify-center text-center w-full"
        >
          <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-white/70 backdrop-blur-md text-emerald-700 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm">
            <Sparkles size={14} className="text-emerald-500" /> AI Verification Engine
          </motion.div>
          
          <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-surface-50 mb-6 leading-tight">
            Công nghệ đằng sau <br/>
            <span className="text-gradient">AntiFakeNews</span>
          </motion.h1>
          
          <motion.p variants={fadeUp} custom={2} className="max-w-2xl text-lg text-surface-400 leading-relaxed mx-auto">
            Kiến trúc AI đa phương thức tiên tiến. Sự kết hợp hoàn hảo giữa xử lý ngôn ngữ tự nhiên và thị giác máy tính để bảo vệ tính toàn vẹn của thông tin.
          </motion.p>
        </motion.header>

        {/* SECTION 1: TEXT & IMAGE */}
        <div className="flex flex-col gap-12 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col lg:flex-row items-center gap-10"
          >
            <div className="flex-1 text-center lg:text-left">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-4 border border-blue-100">
                 Phase 1
               </div>
               <h2 className="text-2xl md:text-3xl font-bold text-surface-50 mb-4">Phân tích Tin Tức (Multimodal)</h2>
               <p className="text-surface-400 text-base md:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Đối với bài báo và mạng xã hội, tin giả thường là sự kết hợp giữa một bức ảnh thật và nội dung bị bóp méo. Kiến trúc phân tích độc lập từng phần và tổng hợp lại để phát hiện sự phi logic này.
               </p>
            </div>
            <div className="flex-1 flex justify-center lg:justify-end w-full">
               <div className="inline-flex items-center gap-2 md:gap-4 bg-white/80 backdrop-blur-xl border border-white/90 px-6 py-5 rounded-2xl shadow-xl shadow-surface-500/5">
                 <div className="flex flex-col items-center gap-1">
                   <div className="p-3 bg-blue-50 rounded-xl text-blue-500"><FileText size={22} /></div>
                   <span className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mt-1">Text</span>
                 </div>
                 <span className="text-surface-300 font-bold mx-1">+</span>
                 <div className="flex flex-col items-center gap-1">
                   <div className="p-3 bg-purple-50 rounded-xl text-purple-500"><ImageIcon size={22} /></div>
                   <span className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mt-1">Image</span>
                 </div>
                 <ArrowRight className="text-surface-300 mx-2" size={20} />
                 <div className="flex flex-col items-center gap-1">
                   <div className="p-3 bg-emerald-50 rounded-xl text-emerald-500"><Network size={22} /></div>
                   <span className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mt-1">Fusion</span>
                 </div>
               </div>
            </div>
          </motion.div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-4">
            {/* Đường solid nối */}
            <div className="absolute top-1/2 left-[18%] right-[18%] hidden h-[3px] bg-slate-900 md:block -translate-y-1/2 z-0" />

            {newsFeatures.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative bg-white/80 backdrop-blur-xl border border-white/90 p-8 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden z-10"
              >
                <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-30 transition-transform duration-500 group-hover:scale-150 ${feat.glowClass}`} />
                <div className="relative z-10 flex flex-col gap-3">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-110 shadow-sm mb-3 ${feat.iconBg} ${feat.iconColor}`}>
                    <feat.icon size={26} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-[19px] font-bold text-surface-50">{feat.title}</h3>
                  <p className="text-surface-400 text-[15px] leading-relaxed">{feat.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* SECTION 2: VIDEO DEEPFAKE */}
        <div className="flex flex-col gap-12 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col lg:flex-row items-center gap-10"
          >
            <div className="flex-1 text-center lg:text-left">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-600 text-xs font-bold uppercase tracking-wider mb-4 border border-teal-100 shadow-sm">
                 <Sparkles size={12} /> Tính năng mới
               </div>
               <h2 className="text-2xl md:text-3xl font-bold text-surface-50 mb-4">Phát hiện Deepfake Video</h2>
               <p className="text-surface-400 text-base md:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Công nghệ mạo danh khuôn mặt đang phát triển vũ bão. Động cơ phân tích video của chúng tôi dùng cấu trúc 3D CNN r3d_18 để soi chiếu các luân chuyển nhỏ nhất trên từng mili-giây thời gian.
               </p>
            </div>
            <div className="flex-1 flex justify-center lg:justify-end w-full">
               <div className="inline-flex items-center gap-2 md:gap-4 bg-white/80 backdrop-blur-xl border border-white/90 px-6 py-5 rounded-2xl shadow-xl shadow-surface-500/5">
                 <div className="flex flex-col items-center gap-1">
                   <div className="p-3 bg-teal-50 rounded-xl text-teal-500"><Video size={22} /></div>
                   <span className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mt-1">Frames</span>
                 </div>
                 <ArrowRight className="text-surface-300 mx-2" size={20} />
                 <div className="flex flex-col items-center gap-1">
                   <div className="p-3 bg-indigo-50 rounded-xl text-indigo-500"><BrainCircuit size={22} /></div>
                   <span className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mt-1">3D CNN</span>
                 </div>
                 <ArrowRight className="text-surface-300 mx-2" size={20} />
                 <div className="flex flex-col items-center gap-1">
                   <div className="p-3 bg-emerald-50 rounded-xl text-emerald-500"><ShieldCheck size={22} /></div>
                   <span className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mt-1">Verify</span>
                 </div>
               </div>
            </div>
          </motion.div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-4">
            {/* Đường solid nối */}
            <div className="absolute top-1/2 left-[18%] right-[18%] hidden h-[3px] bg-slate-900 md:block -translate-y-1/2 z-0" />

            {videoFeatures.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative bg-white/80 backdrop-blur-xl border border-white/90 p-8 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden z-10"
              >
                <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-30 transition-transform duration-500 group-hover:scale-150 ${feat.glowClass}`} />
                <div className="relative z-10 flex flex-col gap-3">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-110 shadow-sm mb-3 ${feat.iconBg} ${feat.iconColor}`}>
                    <feat.icon size={26} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-[19px] font-bold text-surface-50">{feat.title}</h3>
                  <p className="text-surface-400 text-[15px] leading-relaxed">{feat.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* GUARANTEED SPACER */}
        <div style={{ height: '100px', width: '100%' }}></div>

      </div>
    </div>
  );
};

export default About;
