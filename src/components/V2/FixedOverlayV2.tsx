import React, { useState, useEffect } from 'react';
import gsap from 'gsap';
import { useLanguage } from '../../contexts/LanguageContext';
import MenuOverlay from './MenuOverlay';

export default function FixedOverlayV2() {
  const [timeDubai, setTimeDubai] = useState('');
  const [timeTokyo, setTimeTokyo] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, toggleLanguage, t } = useLanguage();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      
      // Format Sao Paulo time (BRT)
      const dubaiOptions: Intl.DateTimeFormatOptions = { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
      setTimeDubai(now.toLocaleTimeString('en-US', dubaiOptions).replace(/:/g, ' '));
      
      // Format Tokyo time (JST is UTC+9)
      const tokyoOptions: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
      setTimeTokyo(now.toLocaleTimeString('en-US', tokyoOptions).replace(/:/g, ' '));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <MenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      
      <div className="fixed inset-0 z-40 pointer-events-none p-6 md:p-10 flex flex-col justify-between mix-blend-difference text-[#F5F2EC]">
        
        {/* Top Bar */}
        <div className="flex justify-between items-start pointer-events-auto">
          {/* Logo */}
          <div className="flex flex-col items-center gap-2 cursor-pointer group">
            <img 
              src="https://static.wixstatic.com/media/fa9c68_1951c3f678894f529d14d736d43e70fe~mv2.png/v1/fill/w_278,h_66,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/fa9c68_1951c3f678894f529d14d736d43e70fe~mv2.png" 
              alt="Fábrica Logo" 
              className="h-8 md:h-10 object-contain transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Right Menu */}
          <div className="flex gap-12 md:gap-24 text-[10px] md:text-xs tracking-[0.15em] uppercase">
            <div 
              className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-70 transition-opacity"
              onClick={toggleLanguage}
            >
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="flex gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                <span className={language === 'PT' ? "opacity-100 font-bold" : "opacity-40"}>PT</span>
                <span className={language === 'EN' ? "opacity-100 font-bold" : "opacity-40"}>EN</span>
              </div>
            </div>
            
            <div 
              className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-70 transition-opacity"
              onClick={() => setIsMenuOpen(true)}
            >
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <span style={{ fontFamily: 'var(--font-heading)' }}>MENU</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex justify-between items-end text-[10px] md:text-xs tracking-[0.15em] font-sans uppercase pointer-events-auto">
          <div>&copy;2026</div>

          <div className="hidden md:flex gap-16">
            <div className="flex gap-2">
              <span className="whitespace-nowrap w-24">{timeDubai}</span>
              <span className="opacity-60 whitespace-nowrap">BRT, SÃO PAULO BRA</span>
            </div>
            <div className="flex gap-2">
              <span className="whitespace-nowrap w-24">{timeTokyo}</span>
              <span className="opacity-60 whitespace-nowrap">JST, TOKYO JPN</span>
            </div>
          </div>

          <div className="cursor-pointer hover:opacity-70 transition-opacity flex flex-col items-center">
            <div className="h-8 w-[1px] bg-white mb-2 origin-bottom animate-pulse"></div>
            <span style={{ fontFamily: 'var(--font-heading)' }}>SCROLL</span>
          </div>
        </div>
        
      </div>
    </>
  );
}
