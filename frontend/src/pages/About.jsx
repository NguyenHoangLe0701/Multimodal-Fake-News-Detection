import { motion } from 'framer-motion';
import { Layers, Database, Cpu, ShieldCheck } from 'lucide-react';

const sections = [
  {
    icon: Database,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50 border-blue-100',
    title: '1. NLP — Phân tích ngữ nghĩa',
    body: 'Sử dụng mô hình Transformer (BERT/RoBERTa) được fine-tune trên tập dữ liệu tin thật và tin giả. Hệ thống hiểu ngữ cảnh, cảm xúc, và các mẫu ngôn ngữ thường gặp trong clickbait hoặc thông tin sai lệch.',
  },
  {
    icon: Cpu,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-50 border-purple-100',
    title: '2. CNN — Phân tích hình ảnh',
    body: 'Hình ảnh thường bị chỉnh sửa hoặc sử dụng sai ngữ cảnh. Hệ thống dùng mạng CNN sâu để phát hiện deepfake, các dấu hiệu ghép ảnh, và sự bất nhất về ánh sáng/bóng mà mắt thường khó nhận ra.',
  },
  {
    icon: Layers,
    iconColor: 'text-accent',
    iconBg: 'bg-emerald-50 border-emerald-100',
    title: '3. Late Fusion — Kết hợp đa phương thức',
    body: 'Sức mạnh thực sự nằm ở fusion. Bằng cách đánh giá text và image độc lập, sau đó cross-reference feature vectors qua dense layer cuối cùng, hệ thống phát hiện được "Out of Context" fakes — nơi ảnh thật đi kèm caption sai lệch.',
    highlight: true,
  },
];

const About = () => {
  return (
    <div className="page-shell pb-20 pt-12 md:pb-24 md:pt-16">
      <div className="page-container max-w-4xl">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-header text-center"
        >
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-surface-700 bg-white shadow-sm">
            <ShieldCheck size={28} className="text-accent" />
          </div>
          <h1 className="page-title">
            Công nghệ đằng sau
            <br />
            <span className="text-gradient">AntiFakeNews</span>
          </h1>
          <p className="page-subtitle mx-auto">
            Kiến trúc AI đa phương thức kết hợp xử lý ngôn ngữ tự nhiên
            với thị giác máy tính để phát hiện tin giả.
          </p>
        </motion.header>

        <div className="space-y-8">
          {sections.map((section, i) => (
            <motion.article
              key={section.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`card card-padded md:p-10 ${
                section.highlight
                  ? 'border-emerald-200 bg-gradient-to-br from-white to-emerald-50/60'
                  : 'hover:shadow-md'
              }`}
            >
              <div className="mb-5 flex items-start gap-4">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${section.iconBg} ${section.iconColor}`}
                >
                  <section.icon size={22} />
                </div>
                <h2 className="pt-1 text-xl font-bold text-surface-50 md:text-2xl">
                  {section.title}
                </h2>
              </div>
              <p
                className={`text-base leading-relaxed md:text-[17px] ${
                  section.highlight ? 'text-surface-200' : 'text-surface-400'
                }`}
              >
                {section.body}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
