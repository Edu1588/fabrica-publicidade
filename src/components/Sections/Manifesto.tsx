import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function Manifesto() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["20%", "-20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center justify-center py-32 px-6 overflow-hidden z-10">
      <div className="absolute inset-0 bg-[#121212]/80 backdrop-blur-sm -z-10"></div>
      
      <motion.div 
        style={{ y, opacity }}
        className="max-w-4xl mx-auto text-center space-y-12"
      >
        <div className="space-y-4 text-2xl sm:text-3xl md:text-4xl font-light text-[#6F7682] leading-tight">
          <p>Todo empreendedor conhece o calor da batalha.</p>
          <p>Os dias difíceis. As decisões arriscadas. As noites sem dormir.</p>
        </div>

        <div className="space-y-4 text-2xl sm:text-3xl md:text-4xl font-light text-[#F5F2EC] leading-tight">
          <p>Enquanto muitos enxergam obstáculos, <br className="hidden sm:block" /> nós enxergamos <span className="text-[#C46A1A] font-medium">matéria-prima</span>.</p>
          <p>Porque é justamente sob pressão que as empresas mais fortes são construídas.</p>
        </div>

        <div className="space-y-6 pt-12">
          <p className="text-xl sm:text-2xl text-[#6F7682]">A Forja nasceu da crença de que negócios extraordinários não surgem por acaso.</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-wider text-[#FF7A00]">
            <motion.span whileInView={{ opacity: 1, scale: 1 }} initial={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.5, delay: 0.1 }}>Moldados.</motion.span>
            <span className="hidden sm:block text-[#6F7682]/30">•</span>
            <motion.span whileInView={{ opacity: 1, scale: 1 }} initial={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.5, delay: 0.3 }}>Lapidados.</motion.span>
            <span className="hidden sm:block text-[#6F7682]/30">•</span>
            <motion.span whileInView={{ opacity: 1, scale: 1 }} initial={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.5, delay: 0.5 }}>Fortalecidos.</motion.span>
            <span className="hidden sm:block text-[#6F7682]/30">•</span>
            <motion.span whileInView={{ opacity: 1, scale: 1 }} initial={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.5, delay: 0.7 }} className="text-[#F5F2EC]">Forjados.</motion.span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
