export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-[#6F7682]/10 py-12 px-6 sm:px-12 md:px-24 z-10 relative">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center">
          <img 
            src="https://static.wixstatic.com/media/fa9c68_1951c3f678894f529d14d736d43e70fe~mv2.png/v1/fill/w_278,h_66,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/fa9c68_1951c3f678894f529d14d736d43e70fe~mv2.png" 
            alt="Fábrica Logo" 
            className="h-6 object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
          />
        </div>
        
        <div className="text-[#6F7682] text-sm flex gap-8">
          <a href="#" className="hover:text-[#F5F2EC] transition-colors">Instagram</a>
          <a href="#" className="hover:text-[#F5F2EC] transition-colors">LinkedIn</a>
          <a href="#" className="hover:text-[#F5F2EC] transition-colors">Behance</a>
        </div>
        
        <div className="text-[#6F7682] text-sm">
          &copy; {new Date().getFullYear()} Fábrica. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
