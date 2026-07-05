import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-16 z-10 px-6 sm:px-12 md:px-24">
      <div className="max-w-5xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-8"
        >
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold uppercase tracking-tight text-white leading-[0.9]">
            Grandes marcas não <br className="hidden sm:block" /> nascem prontas. <br />
            <span className="text-[#FF7A00] mt-2 block">São forjadas.</span>
          </h1>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="max-w-2xl text-lg sm:text-xl text-[#F5F2EC]/80 font-light leading-relaxed border-l-2 border-[#C46A1A] pl-6"
          >
            <p className="mb-4">
              Sua empresa já possui o ingrediente mais importante: a vontade de crescer.
            </p>
            <p>
              Nós entramos no processo para moldar sua marca, fortalecer sua presença e transformar potencial em resultados concretos.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-8"
          >
            <button className="group relative px-8 py-4 bg-transparent overflow-hidden text-white font-medium uppercase tracking-wider text-sm transition-all hover:text-[#121212]">
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#FF7A00] to-[#C46A1A] transition-transform duration-300 origin-left scale-x-0 group-hover:scale-x-100 z-0"></span>
              <span className="absolute inset-0 w-full h-full border border-[#FF7A00]/50 z-0 group-hover:border-transparent"></span>
              <span className="relative z-10 flex items-center gap-2">
                Começar a forjar minha marca
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
