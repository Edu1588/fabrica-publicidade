import { motion } from 'framer-motion';

export default function CTA() {
  return (
    <section className="relative py-40 px-6 sm:px-12 md:px-24 bg-[#121212] z-10 overflow-hidden flex items-center justify-center text-center">
      {/* Background visual elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-[#6F7682]/20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-full bg-[#6F7682]/20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-[#FF7A00]/5 to-[#C46A1A]/10 blur-[150px] rounded-full"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto relative z-10 flex flex-col items-center"
      >
        <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold uppercase tracking-tight text-[#F5F2EC] leading-none mb-10">
          Sua empresa já enfrentou o fogo.<br/>
          <span className="text-[#C46A1A] block mt-4 text-3xl sm:text-4xl md:text-5xl">Agora é hora de transformar esforço em autoridade.</span>
        </h2>
        
        <p className="text-xl sm:text-2xl text-[#F5F2EC]/80 font-light leading-relaxed max-w-2xl mb-16">
          Enquanto muitas marcas tentam chamar atenção, as marcas fortes conquistam respeito.<br className="hidden sm:block" /> Vamos forjar a próxima fase do seu negócio.
        </p>

        <button className="group relative px-12 py-5 bg-[#C46A1A] text-white font-bold uppercase tracking-widest text-lg overflow-hidden transition-all shadow-[0_0_40px_rgba(196,106,26,0.3)] hover:shadow-[0_0_60px_rgba(255,122,0,0.5)]">
          <span className="absolute inset-0 w-full h-full bg-[#FF7A00] transition-transform duration-300 origin-bottom scale-y-0 group-hover:scale-y-100 z-0"></span>
          <span className="relative z-10 flex items-center gap-3">
            Entrar na Forja
            <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
        </button>
      </motion.div>
    </section>
  );
}
