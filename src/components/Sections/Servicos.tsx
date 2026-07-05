import { motion } from 'framer-motion';

const servicos = [
  {
    id: '01',
    title: 'Branding',
    headline: 'Forjando identidade.',
    text: 'Uma marca forte não é apenas vista. Ela é lembrada. Construímos identidades que comunicam propósito, autoridade e diferenciação.'
  },
  {
    id: '02',
    title: 'Websites',
    headline: 'Forjando presença digital.',
    text: 'Seu site deve ser mais do que um cartão de visitas. Ele deve trabalhar para sua empresa todos os dias. Criamos experiências digitais rápidas, modernas e orientadas para conversão.'
  },
  {
    id: '03',
    title: 'Marketing',
    headline: 'Forjando crescimento.',
    text: 'Transformamos visibilidade em oportunidade e oportunidade em resultado. Estratégias pensadas para atrair, engajar e vender.'
  },
  {
    id: '04',
    title: 'Conteúdo',
    headline: 'Forjando conexão.',
    text: 'Pessoas não se conectam com empresas. Se conectam com histórias. Criamos conteúdos que aproximam sua marca das pessoas certas.'
  }
];

export default function Servicos() {
  return (
    <section className="relative py-32 px-6 sm:px-12 md:px-24 bg-[#121212] z-10 border-t border-[#6F7682]/10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-sm uppercase tracking-[0.3em] text-[#C46A1A] mb-4">Nossas Especialidades</h2>
          <h3 className="text-4xl sm:text-5xl font-bold uppercase tracking-tight text-[#F5F2EC]">O que forjamos</h3>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
          {servicos.map((servico, index) => (
            <motion.div
              key={servico.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative border-t border-[#6F7682]/20 pt-8"
            >
              <div className="absolute top-0 left-0 w-0 h-[1px] bg-[#FF7A00] transition-all duration-500 group-hover:w-full"></div>
              
              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-sm font-mono text-[#6F7682]">{servico.id}</span>
                <h4 className="text-2xl font-bold uppercase tracking-wider text-[#F5F2EC] group-hover:text-[#FF7A00] transition-colors">{servico.title}</h4>
              </div>
              
              <h5 className="text-xl font-medium text-[#C46A1A] mb-4">{servico.headline}</h5>
              
              <p className="text-[#F5F2EC]/70 font-light leading-relaxed">
                {servico.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
