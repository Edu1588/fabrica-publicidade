import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-[#121212] flex flex-col items-center justify-center text-[#F5F2EC]">
          <button 
            className="absolute top-10 right-10 text-sm tracking-widest uppercase hover:text-[#C46A1A] transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Fechar
          </button>
          <nav className="flex flex-col gap-8 text-4xl font-light uppercase tracking-wider text-center">
            <a href="#manifesto" onClick={() => setIsMenuOpen(false)} className="hover:text-[#FF7A00] transition-colors">Manifesto</a>
            <a href="#sobre" onClick={() => setIsMenuOpen(false)} className="hover:text-[#FF7A00] transition-colors">Sobre</a>
            <a href="#servicos" onClick={() => setIsMenuOpen(false)} className="hover:text-[#FF7A00] transition-colors">Serviços</a>
            <a href="#processo" onClick={() => setIsMenuOpen(false)} className="hover:text-[#FF7A00] transition-colors">Processo</a>
          </nav>
        </div>
      )}
      
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 px-6 sm:px-12 py-6 flex justify-between items-center mix-blend-difference text-[#F5F2EC]"
      >
        <div className="flex items-center">
          <img 
            src="https://static.wixstatic.com/media/fa9c68_1951c3f678894f529d14d736d43e70fe~mv2.png/v1/fill/w_278,h_66,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/fa9c68_1951c3f678894f529d14d736d43e70fe~mv2.png" 
            alt="Fábrica Logo" 
            className="h-8 object-contain"
          />
        </div>
        
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="text-sm font-medium uppercase tracking-widest hover:text-[#C46A1A] transition-colors pointer-events-auto"
        >
          Menu
        </button>
      </motion.nav>
    </>
  );
}
