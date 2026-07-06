import React from 'react';

export default function Home() {
  return (
    <div className="relative h-screen w-full flex flex-col items-center justify-center bg-[#0c0c0c] overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 opacity-60 scale-105"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1624382497193-de32b368de64?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-transparent to-transparent"></div>
      </div>
      
      <div className="relative z-10 text-center px-6">
        <h1 className="text-3xl md:text-5xl font-light tracking-widest text-white/90 uppercase" style={{ fontFamily: 'var(--font-heading)' }}>
          Em construção
        </h1>
      </div>
    </div>
  );
}
