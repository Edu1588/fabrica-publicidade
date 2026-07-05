import { motion } from 'framer-motion';

const diferenciais = [
  {
    icon: '🔥',
    title: 'Estratégia',
    text: 'Toda peça começa com um projeto. Toda marca começa com uma direção.'
  },
  {
    icon: '⚒️',
    title: 'Construção',
    text: 'Transformamos ideias em experiências reais.'
  },
  {
    icon: '🛡️',
    title: 'Fortalecimento',
    text: 'Criamos marcas preparadas para competir e crescer.'
  },
  {
    icon: '🚀',
    title: 'Expansão',
    text: 'Quando a base é sólida, o crescimento acontece naturalmente.'
  }
];

export default function Diferenciais() {
  return (
    <section className="relative py-32 px-6 sm:px-12 md:px-24 bg-[#121212] z-10 border-t border-[#6F7682]/10 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C46A1A] opacity-[0.03] blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl sm:text-5xl font-bold uppercase tracking-tight text-[#F5F2EC]">
            O que acontece <br className="hidden sm:block" />
            <span className="text-[#6F7682]">dentro da forja</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {diferenciais.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-[#1A1A1A] border border-[#6F7682]/20 p-8 hover:border-[#C46A1A]/50 transition-colors group flex flex-col h-full"
            >
              <div className="text-4xl mb-6 grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110 origin-left">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold uppercase tracking-wider text-[#F5F2EC] mb-4">{item.title}</h3>
              <p className="text-[#F5F2EC]/60 font-light text-sm flex-grow">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
