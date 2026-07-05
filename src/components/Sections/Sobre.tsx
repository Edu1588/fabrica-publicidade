import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function Sobre() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <section ref={containerRef} className="relative py-32 px-6 sm:px-12 md:px-24 bg-[#121212] z-10 border-t border-[#6F7682]/10">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
        
        <div className="w-full lg:w-1/2">
          <motion.h2 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold uppercase tracking-tight text-[#F5F2EC] leading-none"
          >
            Somos artesãos <br/>
            <span className="text-[#FF7A00]">do crescimento.</span>
          </motion.h2>
          
          <motion.div 
            initial={{ opacity: 0, scaleY: 0 }}
            whileInView={{ opacity: 1, scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="h-24 w-[2px] bg-gradient-to-b from-[#C46A1A] to-transparent mt-8 ml-2 origin-top"
          />
        </div>

        <div className="w-full lg:w-1/2 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg sm:text-xl text-[#F5F2EC]/80 font-light leading-relaxed space-y-6"
          >
            <p>
              Não acreditamos em soluções genéricas. Cada empresa possui sua própria história, seus próprios desafios e seu próprio caminho.
            </p>
            <p>
              Por isso mergulhamos no seu negócio para construir estratégias, identidades e experiências que fortaleçam sua marca e ampliem seus resultados.
            </p>
            <p className="text-2xl font-medium text-[#C46A1A] border-l-2 border-[#C46A1A] pl-6 py-2 mt-8">
              Nosso trabalho é fornecer as ferramentas.<br/>
              <span className="text-[#F5F2EC]">O sucesso é a obra que construímos juntos.</span>
            </p>
          </motion.div>
        </div>
        
      </div>
    </section>
  );
}
