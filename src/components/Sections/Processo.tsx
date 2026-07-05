import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const etapas = [
  {
    num: '01',
    title: 'A Matéria-Prima',
    text: 'Conhecemos sua empresa, seus desafios e suas oportunidades.'
  },
  {
    num: '02',
    title: 'O Aquecimento',
    text: 'Definimos estratégias, posicionamento e objetivos.'
  },
  {
    num: '03',
    title: 'A Moldagem',
    text: 'Criamos sua identidade, campanhas e presença digital.'
  },
  {
    num: '04',
    title: 'O Acabamento',
    text: 'Refinamos cada detalhe para maximizar resultados.'
  },
  {
    num: '05',
    title: 'A Lâmina Pronta',
    text: 'Sua marca entra no mercado mais forte, mais clara e preparada para crescer.'
  }
];

export default function Processo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  return (
    <section ref={containerRef} className="relative py-32 px-6 sm:px-12 md:px-24 bg-[#121212] z-10 border-t border-[#6F7682]/10">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20 text-center"
        >
          <h2 className="text-4xl sm:text-5xl font-bold uppercase tracking-tight text-[#F5F2EC]">O processo da forja</h2>
        </motion.div>

        <div className="relative">
          {/* Progress Line Background */}
          <div className="absolute left-8 sm:left-12 top-0 bottom-0 w-[2px] bg-[#6F7682]/20"></div>
          
          {/* Active Progress Line */}
          <motion.div 
            className="absolute left-8 sm:left-12 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#FF7A00] to-[#C46A1A] origin-top"
            style={{ scaleY: scrollYProgress }}
          ></motion.div>

          <div className="space-y-16 sm:space-y-24">
            {etapas.map((etapa, index) => (
              <motion.div
                key={etapa.num}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="relative pl-24 sm:pl-32"
              >
                {/* Number Indicator */}
                <div className="absolute left-0 top-0 w-16 sm:w-24 flex justify-center bg-[#121212] py-2 z-10">
                  <span className="text-xl sm:text-2xl font-mono text-[#C46A1A] font-medium">{etapa.num}</span>
                </div>
                
                <div className="pt-2">
                  <h3 className="text-2xl sm:text-3xl font-bold uppercase tracking-wider text-[#F5F2EC] mb-4">{etapa.title}</h3>
                  <p className="text-[#F5F2EC]/70 font-light text-lg sm:text-xl leading-relaxed">{etapa.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
