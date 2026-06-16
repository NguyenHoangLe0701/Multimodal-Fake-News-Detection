import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Database, Cpu, ShieldCheck } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen pt-24 pb-20 relative overflow-hidden">
      {/* Glows */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#10b981]/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-6">
            <ShieldCheck size={32} className="text-[#10b981]" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">The Technology Behind <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10b981] to-[#06b6d4]">AntiFakeNews</span></h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto">
            Discover how our multimodal AI architecture combines natural language processing with computer vision to expose misinformation.
          </p>
        </motion.div>

        <div className="space-y-12">
          {/* Section 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#0f0f13]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                <Database size={24} />
              </div>
              <h2 className="text-2xl font-bold text-white">1. NLP for Text Semantics</h2>
            </div>
            <p className="text-gray-400 text-lg leading-relaxed mb-6">
              Our text engine leverages advanced Transformer models (like BERT or RoBERTa) fine-tuned on vast datasets of verified and fabricated news. It doesn't just look for keywords; it understands context, sentiment, and the linguistic patterns commonly used in clickbait or deceptive writing.
            </p>
          </motion.div>

          {/* Section 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#0f0f13]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                <Cpu size={24} />
              </div>
              <h2 className="text-2xl font-bold text-white">2. CNN for Image Forensics</h2>
            </div>
            <p className="text-gray-400 text-lg leading-relaxed mb-6">
              Images are often manipulated or taken out of context to support fake narratives. We use deep Convolutional Neural Networks (CNNs) to detect deepfakes, splice artifacts, and inconsistencies in lighting/shadows that the human eye might miss.
            </p>
          </motion.div>

          {/* Section 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#0f0f13] to-[#10b981]/10 border border-[#10b981]/20 rounded-3xl p-8 md:p-12 relative overflow-hidden"
          >
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="p-3 bg-[#10b981]/20 text-[#10b981] rounded-xl border border-[#10b981]/30">
                <Layers size={24} />
              </div>
              <h2 className="text-2xl font-bold text-white">3. Multimodal Late Fusion</h2>
            </div>
            <p className="text-gray-300 text-lg leading-relaxed relative z-10">
              The true power lies in fusion. By evaluating the text and image independently and then cross-referencing their feature vectors in a final dense layer, the system can identify "Out of Context" fakes — where a real image is paired with a misleading caption.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default About;
