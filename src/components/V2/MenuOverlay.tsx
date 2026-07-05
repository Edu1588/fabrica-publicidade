import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useLanguage } from '../../contexts/LanguageContext';

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MenuOverlay({ isOpen, onClose }: MenuOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      gsap.to(overlayRef.current, {
        autoAlpha: 1,
        duration: 0.5,
        ease: 'power3.out'
      });
      gsap.fromTo(linksRef.current, 
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: 'power3.out', delay: 0.2 }
      );
    } else {
      gsap.to(overlayRef.current, {
        autoAlpha: 0,
        duration: 0.5,
        ease: 'power3.in'
      });
    }
  }, [isOpen]);

  const navLinks = [
    { pt: 'Início', en: 'Home', path: '/v2' },
    { pt: 'Filosofia', en: 'Philosophy', path: '#philosophy' },
    { pt: 'Serviços', en: 'Services', path: '#services' },
    { pt: 'Contato', en: 'Contact', path: '#contact' },
  ];

  return (
    <div 
      ref={overlayRef} 
      className="fixed inset-0 z-50 bg-[#0c0c0c] flex flex-col justify-center items-center text-[#F5F2EC] invisible opacity-0"
    >
      <button 
        onClick={onClose}
        className="absolute top-10 right-10 text-xs tracking-widest uppercase hover:opacity-70 transition-opacity"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {t('FECHAR', 'CLOSE')}
      </button>

      <nav className="flex flex-col items-center gap-12">
        {navLinks.map((link, i) => (
          <a
            key={i}
            href={link.path}
            ref={el => { linksRef.current[i] = el; }}
            onClick={(e) => {
              if (link.path.startsWith('#')) {
                e.preventDefault();
                // We'd add smooth scroll logic here later if needed
                onClose();
              } else {
                onClose();
              }
            }}
            className="text-4xl md:text-6xl font-light hover:text-[#C46A1A] transition-colors"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {t(link.pt, link.en)}
          </a>
        ))}
      </nav>
      
      <div className="absolute bottom-10 flex gap-10 text-xs tracking-widest opacity-60 uppercase font-sans">
        <span>Fábrica &copy; 2026</span>
        <Link to="/admin" className="hover:text-[#FF7A00] transition-colors">{t('Admin', 'Admin')}</Link>
      </div>
    </div>
  );
}
