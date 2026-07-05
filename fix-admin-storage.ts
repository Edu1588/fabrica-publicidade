import fs from 'fs';

let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// 1. Import supabase
if (!content.includes("import { supabase }")) {
  content = content.replace("import { jsPDF } from 'jspdf';", "import { jsPDF } from 'jspdf';\nimport { supabase } from '../lib/supabase';");
}

// 2. Change the useEffect loading clients and slides
const useEffectOld = `
    // Load Clients Data
    const savedClients = localStorage.getItem('aforja_clients_list');
    if (savedClients) {
      setClients(JSON.parse(savedClients));
    } else {
      const defaultClients: AppClient[] = [
        {
          id: 'unimais',
          name: 'Unimais',
          description: 'Plataforma integrada de veículos e e-commerce premium com foco em design automotivo e ofertas.',
          logoUrl: '',
          active: true
        },
        {
          id: 'azul',
          name: 'Azul',
          description: '',
          logoUrl: '',
          active: true
        },
        {
          id: 'meta_veiculos',
          name: 'Meta Veículos',
          description: '',
          logoUrl: '',
          active: true
        }
      ];
      setClients(defaultClients);
      localStorage.setItem('aforja_clients_list', JSON.stringify(defaultClients));
    }

    // Load Slides or seed default
    const savedSlides = localStorage.getItem('aforja_unimais_slides');
    if (savedSlides) {
      setSlides(JSON.parse(savedSlides));
    } else {
      const defaultSlides: CarouselSlide[] = [
        {
          id: 'slide-1',
          type: 'capa',
          title: 'Capa de Ofertas',
          imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800&auto=format&fit=crop',
          zoom: 1.0,
          posX: 0,
          posY: 0,
          condicao1Label: '',
          condicao1Val: '',
          condicao2Label: '',
          condicao2Val: '',
          condicao3Label: '',
          condicao3Val: '',
          condicao4Label: '',
          condicao4Val: ''
        },
        {
          id: 'slide-2',
          type: 'veiculo',
          title: 'Veículo 1',
          fabricante: 'VOLKSWAGEN',
          modelo: 'POLO HIGHLINE',
          descricao: '1.0 TSI / 2024',
          imageUrl: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=800&auto=format&fit=crop',
          zoom: 1.0,
          posX: 0,
          posY: 0,
          condicao1Label: 'ENTRADA DE',
          condicao1Val: 'R$ 15.000',
          condicao2Label: 'PARCELAS DE',
          condicao2Val: 'R$ 1.299',
          condicao3Label: 'TAXA',
          condicao3Val: '0,99%',
          condicao4Label: 'BÔNUS',
          condicao4Val: 'SUPER'
        },
        {
          id: 'slide-3',
          type: 'final',
          title: 'Card Final',
          imageUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=800&auto=format&fit=crop',
          zoom: 1.0,
          posX: 0,
          posY: 0,
          condicao1Label: '',
          condicao1Val: '',
          condicao2Label: '',
          condicao2Val: '',
          condicao3Label: '',
          condicao3Val: '',
          condicao4Label: '',
          condicao4Val: ''
        }
      ];
      setSlides(defaultSlides);
      localStorage.setItem('aforja_unimais_slides', JSON.stringify(defaultSlides));
    }`;

const useEffectNew = `
    const loadData = async () => {
      const { data: clientsData } = await supabase.from('clients').select('*');
      if (clientsData && clientsData.length > 0) {
        setClients(clientsData.map(c => {
          let extra = {};
          try { if (c.description && c.description.startsWith('{')) extra = JSON.parse(c.description); } catch(e){}
          return {
            id: c.id,
            name: c.name,
            description: extra.text || c.description || '',
            logoUrl: c.logourl || '',
            active: c.active,
            detalhes: extra.detalhes || '',
            anexos: extra.anexos || '',
            corCliente: extra.corCliente || ''
          };
        }));
      }

      const { data: slidesData } = await supabase.from('slides').select('*').order('order_index', { ascending: true });
      if (slidesData && slidesData.length > 0) {
        setSlides(slidesData.map(s => ({
          id: s.id,
          type: s.type,
          title: s.title,
          fabricante: s.fabricante || '',
          modelo: s.modelo || '',
          descricao: s.descricao || '',
          lojasCapa: s.lojascapa || '',
          imageUrl: s.imageurl || '',
          zoom: s.zoom || 1,
          posX: s.posx || 0,
          posY: s.posy || 0,
          condicao1Label: s.condicao1label || '',
          condicao1Val: s.condicao1val || '',
          condicao2Label: s.condicao2label || '',
          condicao2Val: s.condicao2val || '',
          condicao3Label: s.condicao3label || '',
          condicao3Val: s.condicao3val || '',
          condicao4Label: s.condicao4label || '',
          condicao4Val: s.condicao4val || ''
        })));
      }
    };
    loadData();
`;
content = content.replace(useEffectOld, useEffectNew);


fs.writeFileSync('src/pages/Admin.tsx', content);
console.log('Replaced load effect');
