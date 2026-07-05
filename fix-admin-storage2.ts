import fs from 'fs';

let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// 1. Import supabase
if (!content.includes("import { supabase }")) {
  content = content.replace("import { jsPDF } from 'jspdf';", "import { jsPDF } from 'jspdf';\nimport { supabase } from '../lib/supabase';");
}

const loadDataStr = `
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

// use regex to replace from "// Load Clients Data" to the end of the block
const regex = /\/\/ Load Clients Data[\s\S]*?(?=\n  };\n\n  \/\/ Download slide)/;
content = content.replace(regex, loadDataStr);

// 2. Fix saveClientsToStorage
content = content.replace(
  /localStorage\.setItem\('aforja_clients_list', JSON\.stringify\(updated\)\);/g,
  `updated.forEach(async (c) => {
      const descPayload = JSON.stringify({ text: c.description, detalhes: c.detalhes, anexos: c.anexos, corCliente: c.corCliente });
      const { error } = await supabase.from('clients').upsert({ id: c.id, name: c.name, description: descPayload, logourl: c.logoUrl, active: c.active });
      if (error) console.error('Error saving client:', error);
    });`
);

// 3. Fix saveSlidesToStorage
const saveSlidesRegex = /const saveSlidesToStorage = \(updatedSlides: CarouselSlide\[\]\) => {[\s\S]*?};\n/;
const newSaveSlides = `const saveSlidesToStorage = async (updatedSlides: CarouselSlide[]) => {
    setSlides(updatedSlides);
    
    // As per user request: "as dos cards que forem upadas do veiculo elas ficam só temporario"
    // "a imagem definida de capa e ultimo Slide devem ficar salvas no banco de dados"
    // Only upsert Capa and Final slides to DB, or upsert all but don't save imageUrl for veiculo.
    updatedSlides.forEach(async (s, index) => {
      let urlToSave = s.imageUrl;
      if (s.type === 'veiculo') urlToSave = '';
      
      const { error } = await supabase.from('slides').upsert({
        id: s.id,
        type: s.type,
        title: s.title,
        fabricante: s.fabricante,
        modelo: s.modelo,
        descricao: s.descricao,
        lojascapa: s.lojasCapa,
        imageurl: urlToSave,
        zoom: s.zoom,
        posx: s.posX,
        posy: s.posY,
        condicao1label: s.condicao1Label,
        condicao1val: s.condicao1Val,
        condicao2label: s.condicao2Label,
        condicao2val: s.condicao2Val,
        condicao3label: s.condicao3Label,
        condicao3val: s.condicao3Val,
        condicao4label: s.condicao4Label,
        condicao4val: s.condicao4Val,
        order_index: index
      });
      if (error) console.error('Error saving slide:', error);
    });
  };\n`;
content = content.replace(saveSlidesRegex, newSaveSlides);


fs.writeFileSync('src/pages/Admin.tsx', content);
