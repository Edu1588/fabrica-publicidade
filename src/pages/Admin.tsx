import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Lock, 
  LogOut, 
  Plus, 
  Trash2, 
  Users, 
  ArrowLeft, 
  ChevronRight, 
  Image as ImageIcon, 
  Upload, 
  Download, 
  FolderOpen,
  Sliders,
  Settings,
  Grid,
  FileText
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { supabase } from '../lib/supabase';

// Carousel Item definition
interface AppClient {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  active: boolean;
  detalhes?: string;
  anexos?: string;
  corCliente?: string;
}

interface CarouselSlide {
  id: string;
  type: 'capa' | 'veiculo' | 'final';
  
  // Header / text fields
  title: string;          // slide display label in menu
  fabricante?: string;    // manufacturer (VEICULO)
  modelo?: string;        // model (VEICULO)
  descricao?: string;     // description / subtitle (VEICULO/CAPA)
  
  // Capa exclusive fields
  lojasCapa?: string;     // store locations for cover slide

  // Image controls
  imageUrl: string;
  imageFileName?: string;
  zoom: number;
  posX: number;
  posY: number;

  // Conditions
  condicao1Label: string;
  condicao1Val: string;
  condicao2Label: string;
  condicao2Val: string;
  condicao3Label: string;
  condicao3Val: string;
  condicao4Label: string;
  condicao4Val: string;

  // Footer
  website: string;
}

export default function Admin() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '1234') {
      setIsAuthenticated(true);
      sessionStorage.setItem('aforja_admin_authenticated', 'true');
      setErrorMsg('');
    } else {
      setErrorMsg('PIN INCOMPATÍVEL');
      setPassword('');
    }
  };

  const handleKeyPress = (num: string) => {
    if (password.length < 8) {
      setPassword(prev => prev + num);
      setErrorMsg('');
    }
  };

  const handleClear = () => {
    setPassword('');
    setErrorMsg('');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('aforja_admin_authenticated');
    setPassword('');
  };

  // Unified Workflow
  const [activeTab, setActiveTab] = useState<'clientes' | 'config'>('clientes');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showCarrosseis, setShowCarrosseis] = useState(false);
  const [activeEditor, setActiveEditor] = useState<'destaque' | 'ofertas' | null>(null);
  const [showEditClient, setShowEditClient] = useState(false);
  
  // Clients List State
  const [clients, setClients] = useState<AppClient[]>([]);
  const [newClientName, setNewClientName] = useState('');

  const selectedClientData = clients.find(c => c.id === selectedClientId) || clients[0];

  const updateSelectedClient = (data: Partial<AppClient>) => {
    if (!selectedClientId) return;
    const updated = clients.map(c => c.id === selectedClientId ? { ...c, ...data } : c);
    setClients(updated);
    
    const clientToUpdate = updated.find(c => c.id === selectedClientId);
    if (clientToUpdate) {
      const descPayload = JSON.stringify({ text: clientToUpdate.description, detalhes: clientToUpdate.detalhes, anexos: clientToUpdate.anexos, corCliente: clientToUpdate.corCliente });
      supabase.from('clients').upsert({ id: clientToUpdate.id, name: clientToUpdate.name, description: descPayload, logourl: clientToUpdate.logoUrl, active: clientToUpdate.active })
        .then(({ error }) => {
          if (error) console.error('Error saving client:', error);
        });
    }
  };

  // Slides State
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  const handleAddSlide = (type: 'veiculo' | 'capa' | 'final') => {
    const newSlide: CarouselSlide = {
      id: crypto.randomUUID(),
      type,
      title: type === 'veiculo' ? 'NOVO VEÍCULO' : type === 'capa' ? 'NOVA CAPA' : 'NOVO FINAL',
      fabricante: '',
      modelo: '',
      descricao: '',
      imageUrl: '',
      zoom: 1,
      posX: 0,
      posY: 0,
      condicao1Label: '', condicao1Val: '',
      condicao2Label: '', condicao2Val: '',
      condicao3Label: '', condicao3Val: '',
      condicao4Label: '', condicao4Val: '',
      lojasCapa: '',
      website: ''
    };
    const updated = [...slides, newSlide];
    setSlides(updated);
    setActiveSlideIndex(updated.length - 1);
  };

  const handleDeleteSlide = (index: number) => {
    const slideToDelete = slides[index];
    if (slideToDelete.type === 'capa' || slideToDelete.type === 'final') {
      showToast('Capa e Final não podem ser removidos.', 'error');
      return;
    }
    const updated = slides.filter((_, idx) => idx !== index);
    setSlides(updated);
    if (activeSlideIndex >= updated.length) {
      setActiveSlideIndex(Math.max(0, updated.length - 1));
    }
  };
  
  const activeSlide = slides[activeSlideIndex];

  const updateActiveSlideField = (field: keyof CarouselSlide, value: any) => {
    setSlides(slides.map((s, idx) => idx === activeSlideIndex ? { ...s, [field]: value } : s));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          updateActiveSlideField('imageUrl', ev.target.result.toString());
          updateActiveSlideField('imageFileName', file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Scraping State
  const [scraping, setScraping] = useState(false);
  const [scrapeQuery, setScrapeQuery] = useState('');

  const handleScrape = async () => {
    if (!scrapeQuery) return;
    setScraping(true);
    try {
      const res = await fetch('/api/scrape-vehicle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ search: scrapeQuery })
      });
      const data = await res.json();
      if (data.success && data.data) {
        updateActiveSlideField('fabricante', data.data.montadora || '');
        updateActiveSlideField('modelo', data.data.modelo || '');
        updateActiveSlideField('descricao', data.data.descricao || '');
        setToast({ message: 'Dados importados com sucesso!', type: 'success' });
        setScrapeQuery('');
      } else {
        setToast({ message: data.error || 'Erro ao importar.', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Erro de comunicação.', type: 'error' });
    } finally {
      setScraping(false);
    }
  };

  // Image Input Ref for file upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Load configuration and authentication
  useEffect(() => {
    const auth = sessionStorage.getItem('aforja_admin_authenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
    
    
    const loadData = async () => {
      const { data: clientsData } = await supabase.from('clients').select('*');
      if (clientsData && clientsData.length > 0) {
        setClients(clientsData.map(c => {
          let extra: any = {};
          try { if (c.description && c.description.startsWith('{')) extra = JSON.parse(c.description); } catch(e){}
          return {
            id: c.id,
            name: c.name,
            description: extra.text !== undefined ? extra.text : (c.description || ''),
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
          condicao4Val: s.condicao4val || '',
          website: s.website || '',
          imageFileName: s.imagefilename || ''
        })));
      }
    };
    loadData();
  }, []);

  // Download slide as PNG
  const handleDownloadPNG = async () => {
    if (!previewRef.current || !activeSlide) return;
    
    showToast('Processando download de imagem...');
    try {
      const canvas = await html2canvas(previewRef.current, {
        useCORS: true,
        scale: 3, // Very high crisp resolution!
        backgroundColor: '#012d6a',
        logging: false
      });
      
      const fileFriendlyTitle = activeSlide.title.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      const filename = `unimais_carrossel_${fileFriendlyTitle}.png`;
      
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('PNG baixado com sucesso!');
      
      // Feature request: Reset image after download if it's a vehicle slide (temporary)
      if (activeSlide.type === 'veiculo') {
        setTimeout(() => {
          updateActiveSlideField('imageUrl', '');
          updateActiveSlideField('imageFileName', '');
        }, 1000); // clear after short delay to let download start properly
      }
    } catch (err) {
      console.error(err);
      showToast('Erro ao exportar PNG.', 'error');
    }
  };

  // Download slide as PDF
  const handleDownloadPDF = async () => {
    if (!previewRef.current || !activeSlide) return;
    
    showToast('Gerando documento PDF...');
    try {
      const canvas = await html2canvas(previewRef.current, {
        useCORS: true,
        scale: 3,
        backgroundColor: '#012d6a',
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const width = canvas.width;
      const height = canvas.height;
      
      // Create high res standard page PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [width / 3, height / 3] // scaled to match CSS rendering scale
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, width / 3, height / 3);
      
      const fileFriendlyTitle = activeSlide.title.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      const filename = `unimais_carrossel_${fileFriendlyTitle}.pdf`;
      pdf.save(filename);
      showToast('PDF baixado com sucesso!');
      
      // Reset image after download if it's a vehicle slide (temporary)
      if (activeSlide.type === 'veiculo') {
        setTimeout(() => {
          updateActiveSlideField('imageUrl', '');
          updateActiveSlideField('imageFileName', '');
        }, 1000);
      }
    } catch (err) {
      console.error(err);
      showToast('Erro ao exportar PDF.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-[#F5F2EC] flex flex-col selection:bg-[#C46A1A]/40">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[999] max-w-sm flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border transition-all duration-300 ${
          toast.type === 'success' 
            ? 'bg-[#0f1d14] border-[#1e5230] text-[#a4efb9]' 
            : 'bg-[#200e0e] border-[#5a1b1b] text-[#efa4a4]'
        }`}>
          <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
          <p className="text-xs font-mono uppercase tracking-wider">{toast.message}</p>
        </div>
      )}

      {/* 1. LOCK SCREEN / ACCESS GATE */}
      {!isAuthenticated ? (
        <div className="flex-1 flex flex-col justify-center items-center p-6 relative">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#C46A1A]/5 rounded-full blur-[100px] pointer-events-none"></div>

          {/* Navigation Back */}
          <div className="absolute top-8 left-8 z-20">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-xs tracking-widest text-[#F5F2EC]/60 hover:text-white transition-colors uppercase font-mono"
            >
              <ArrowLeft className="w-4 h-4" />
              Retornar ao Site
            </Link>
          </div>

          <div className="w-full max-w-md bg-[#0c0c0f] border border-white/5 rounded-2xl p-8 relative z-10 shadow-2xl backdrop-blur-md">
            
            {/* Lock Header */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="mb-6 flex justify-center">
                <img src="https://static.wixstatic.com/media/fa9c68_1951c3f678894f529d14d736d43e70fe~mv2.png/v1/fill/w_278,h_66,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/fa9c68_1951c3f678894f529d14d736d43e70fe~mv2.png" alt="Fábrica Logo" className="h-8 object-contain" />
              </div>
              <h1 className="text-xl tracking-[0.2em] uppercase font-light" style={{ fontFamily: 'var(--font-admin-heading)' }}>
                ADMIN
              </h1>
              <p className="text-[10px] tracking-widest font-mono text-white/40 uppercase mt-2">
                Acesse o núcleo estratégico de controle
              </p>
            </div>

            {/* Password input */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="password"
                    maxLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite o PIN de acesso"
                    className="w-full bg-[#111116] border border-white/10 rounded-xl py-4 px-5 text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:border-[#C46A1A] transition-colors placeholder:text-sm placeholder:tracking-wider placeholder:text-white/20 text-[#F5F2EC]"
                    autoFocus
                  />
                </div>
                {errorMsg && (
                  <p className="text-xs font-mono text-red-400 text-center uppercase tracking-wide">
                    {errorMsg}
                  </p>
                )}
              </div>

              {/* Virtual Keypad */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleKeyPress(num)}
                    className="bg-[#121218] hover:bg-[#1b1b24] active:bg-[#C46A1A]/20 border border-white/5 text-lg font-mono rounded-xl py-4 transition-all duration-150 flex items-center justify-center cursor-pointer hover:border-white/15"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleClear}
                  className="bg-[#161212] hover:bg-[#2c1a1a] text-xs font-mono tracking-widest uppercase rounded-xl py-4 border border-red-950/20 text-red-400 cursor-pointer transition-colors"
                >
                  Limpar
                </button>
                <button
                  type="button"
                  onClick={() => handleKeyPress('0')}
                  className="bg-[#121218] hover:bg-[#1b1b24] text-lg font-mono rounded-xl py-4 border border-white/5 cursor-pointer transition-all"
                >
                  0
                </button>
                <button
                  type="submit"
                  className="bg-[#1a1410] hover:bg-[#C46A1A] text-[#F5F2EC] hover:text-black text-xs font-mono tracking-widest uppercase rounded-xl py-4 border border-[#C46A1A]/30 cursor-pointer transition-all duration-300 flex items-center justify-center"
                >
                  Entrar
                </button>
              </div>
            </form>

          </div>
        </div>
      ) : (
        
        // 2. MAIN ADMIN DASHBOARD (Authenticated)
        <div className="flex-1 flex flex-col md:flex-row">
          
          {/* A. Sidebar Navigation - STRICTLY CLIENTS ONLY */}
          <aside className="w-full md:w-64 bg-[#0a0a0f] border-b md:border-b-0 md:border-r border-white/5 flex flex-col justify-between shrink-0">
            
            <div className="p-6">
              
              {/* Brand Title */}
              <div className="flex items-center gap-3 mb-8">
                <div className="flex items-center justify-center">
                  <img src="https://static.wixstatic.com/media/fa9c68_1951c3f678894f529d14d736d43e70fe~mv2.png/v1/fill/w_278,h_66,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/fa9c68_1951c3f678894f529d14d736d43e70fe~mv2.png" alt="Fábrica Logo" className="h-6 object-contain" />
                </div>
                <div>
                  <p className="text-[9px] tracking-widest text-[#C46A1A] font-mono uppercase">
                    Admin Panel
                  </p>
                </div>
              </div>

              {/* Navigation Tabs */}
              <nav className="space-y-2 font-mono text-xs uppercase tracking-wider">
                <button
                  onClick={() => {
                    setActiveTab('clientes');
                    setSelectedClientId(null);
                    setShowCarrosseis(false);
                    setActiveEditor(null);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                    activeTab === 'clientes' 
                      ? 'bg-[#18120e] text-[#FF7A00] border-l-2 border-[#C46A1A]' 
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Clientes
                </button>
                <button
                  onClick={() => {
                    setActiveTab('config');
                    setSelectedClientId(null);
                    setShowCarrosseis(false);
                    setActiveEditor(null);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                    activeTab === 'config' 
                      ? 'bg-[#18120e] text-[#FF7A00] border-l-2 border-[#C46A1A]' 
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  Configurações
                </button>
              </nav>

            </div>

            {/* Sidebar Footer */}
            <div className="p-6 border-t border-white/5 space-y-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-[#200e0e] hover:bg-red-950 text-red-400 text-[10px] uppercase font-mono tracking-widest py-2.5 rounded-lg cursor-pointer transition-all border border-red-950/20"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sair Painel
              </button>
            </div>

          </aside>

          {/* B. Main Area */}
          <main className="flex-1 bg-[#07070a] p-6 md:p-8 overflow-y-auto max-h-screen">
            
            {/* Header Area */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5 mb-6">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#C46A1A]">
                  Central de Ativos / Gestão de Carrosséis
                </span>
                <h1 className="text-2xl md:text-3xl font-light tracking-wide uppercase mt-1" style={{ fontFamily: 'var(--font-admin-heading)' }}>
                  {activeTab === 'config' ? 'Configurações' : showCarrosseis ? (activeEditor === 'destaque' ? `Carrossel Destaque ${selectedClientData?.name || ''}` : activeEditor === 'ofertas' ? `Carrossel de Ofertas ${selectedClientData?.name || ''}` : `Gestão de Carrosséis - ${selectedClientData?.name || ''}`) : 'Gerenciamento de Clientes'}
                </h1>
              </div>
              
              <div className="flex items-center gap-3 bg-[#0a0a0f] border border-white/5 px-4 py-2 rounded-xl">
                <div className="w-2.5 h-2.5 bg-[#C46A1A] rounded-full animate-pulse"></div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/60">
                  Operador Autorizado
                </span>
              </div>
            </header>

            {/* STEP 1: Clientes List */}
            {activeTab === 'clientes' && !selectedClientId && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-[#0c0c10] border border-white/5 rounded-2xl p-8 max-w-4xl">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-[#C46A1A] mb-4">
                    Selecione o Cliente para Configurar
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                    {clients.filter(c => c.active).map(client => (
                    <div 
                      key={client.id}
                      onClick={() => setSelectedClientId(client.id)}
                      className={`bg-[#111116] hover:bg-[#161620] border border-white/5 rounded-xl p-6 cursor-pointer transition-all duration-300 group relative overflow-hidden client-card-${client.id}`}
                    >
                      <style>{`
                        .client-card-${client.id}:hover {
                          border-color: ${client.corCliente ? `${client.corCliente}60` : '#C46A1A60'} !important;
                        }
                        .client-card-${client.id}:hover .client-name-${client.id} {
                          color: ${client.corCliente || '#FF7A00'} !important;
                        }
                        .client-card-${client.id}:hover .client-blur-${client.id} {
                          background-color: ${client.corCliente ? `${client.corCliente}15` : '#C46A1A15'} !important;
                        }
                      `}</style>
                      <div className={`absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl transition-colors pointer-events-none client-blur-${client.id}`}></div>
                      
                      <span className="text-[9px] font-mono bg-white/10 text-white/70 px-2 py-0.5 rounded uppercase tracking-wider">
                        Ativo
                      </span>
                      
                      <h4 className={`text-2xl font-light tracking-wide uppercase mt-4 mb-2 text-[#F5F2EC] transition-colors client-name-${client.id}`} style={{ fontFamily: 'var(--font-admin-heading)' }}>
                        {client.name || 'Sem Nome'}
                      </h4>
                      
                      <p className="text-xs text-white/50 font-light leading-relaxed mb-6">
                        {client.description || 'Sem descrição cadastrada.'}
                      </p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-white/5 font-mono text-[10px] uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">
                        <span>Acessar Cliente</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Selected Client -> Show Option: "Carrossel" */}
            {activeTab === 'clientes' && selectedClientId && !showCarrosseis && !showEditClient && (
              <div className="space-y-6 animate-fade-in">
                
                <button 
                  onClick={() => setSelectedClientId(null)}
                  className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para lista de clientes
                </button>

                <div className="bg-[#0c0c10] border border-white/5 rounded-2xl p-8 max-w-4xl">
                  
                  <div className="flex items-center gap-4 border-b border-white/5 pb-6 mb-8">
                    {selectedClientData?.logoUrl ? (
                      <img src={selectedClientData.logoUrl} alt="Logo Cliente" className="w-12 h-12 rounded-xl object-contain bg-white/5 p-1" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-[#18120e] border border-[#C46A1A]/30 flex items-center justify-center text-[#FF7A00] text-xl font-bold font-mono">
                        {selectedClientData?.name ? selectedClientData.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-light tracking-wide uppercase text-white" style={{ fontFamily: 'var(--font-admin-heading)' }}>
                        {selectedClientData?.name || 'Cliente'}
                      </h3>
                      <p className="text-xs font-mono text-white/40 uppercase tracking-widest mt-1">
                        Selecione a opção do cliente
                      </p>
                    </div>
                  </div>

                  {selectedClientData?.name?.toLowerCase().includes('unimais') ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Option: Card Carrosseis */}
                      <div 
                        onClick={() => setShowCarrosseis(true)}
                        className="bg-[#111116] hover:bg-[#161620] border border-white/5 hover:border-[#C46A1A]/40 rounded-xl p-6 cursor-pointer transition-all duration-300 group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-[#FF7A00] mb-4 group-hover:bg-[#C46A1A]/10 transition-colors">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                        
                        <h4 className="text-lg font-light tracking-wide uppercase text-white group-hover:text-[#FF7A00] transition-colors" style={{ fontFamily: 'var(--font-admin-heading)' }}>
                          Card Carrosseis
                        </h4>
                        
                        <p className="text-xs text-white/50 font-light leading-relaxed mt-2 mb-6">
                          Selecione entre o Carrossel Destaque e o Carrossel Ofertas para realizar as edições.
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5 font-mono text-[10px] uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">
                          <span>Acessar Carrosseis</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center border border-white/5 bg-white/[0.02] rounded-xl border-dashed">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <div className="w-1.5 h-1.5 bg-[#C46A1A] rounded-full animate-pulse" />
                      </div>
                      <h4 className="text-sm font-light uppercase tracking-widest text-white mb-2" style={{ fontFamily: 'var(--font-admin-heading)' }}>
                        Sem Conteúdo
                      </h4>
                      <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                        Nenhum módulo ativo para este cliente no momento.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3.1: Carrosseis Menu Options */}
            {activeTab === 'clientes' && selectedClientId && showCarrosseis && !activeEditor && (
              <div className="space-y-6 animate-fade-in">
                <button 
                  onClick={() => setShowCarrosseis(false)}
                  className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para opções de {selectedClientData?.name || 'Cliente'}
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div 
                    onClick={() => setActiveEditor('destaque')}
                    className="bg-[#111116] hover:bg-[#161620] border border-white/5 hover:border-[#C46A1A]/40 rounded-xl p-6 cursor-pointer transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-[#FF7A00] mb-4 group-hover:bg-[#C46A1A]/10 transition-colors">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <h4 className="text-lg font-light tracking-wide uppercase text-white group-hover:text-[#FF7A00] transition-colors" style={{ fontFamily: 'var(--font-admin-heading)' }}>
                      Carrossel Destaque
                    </h4>
                    <p className="text-xs text-white/50 font-light leading-relaxed mt-2 mb-6">
                      Carrossel principal com 3 opções de cards.
                    </p>
                  </div>

                  <div 
                    onClick={() => setActiveEditor('ofertas')}
                    className="bg-[#111116] hover:bg-[#161620] border border-white/5 hover:border-[#C46A1A]/40 rounded-xl p-6 cursor-pointer transition-all duration-300 group opacity-50"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-[#FF7A00] mb-4 group-hover:bg-[#C46A1A]/10 transition-colors">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <h4 className="text-lg font-light tracking-wide uppercase text-white group-hover:text-[#FF7A00] transition-colors" style={{ fontFamily: 'var(--font-admin-heading)' }}>
                      Carrossel de Ofertas
                    </h4>
                    <p className="text-xs text-white/50 font-light leading-relaxed mt-2 mb-6">
                      (Em breve) Carrossel secundário focado em lista de ofertas.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3.2: Unified Editor Split Layout */}
            {activeTab === 'clientes' && selectedClientId && showCarrosseis && activeEditor === 'destaque' && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Back to Unimais menu */}
                <button 
                  onClick={() => setActiveEditor(null)}
                  className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para opções de Unimais
                </button>

                {/* Grid Split: Left = Controls, Right = Live Preview & Slides list */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* LEFT COLUMN: Data Config (45%) */}
                  <div className="lg:col-span-5 bg-[#0c0c10] border border-white/5 rounded-2xl p-6 space-y-6">
                    
                    <div className="border-b border-white/5 pb-4">
                      <span className="text-[9px] font-mono text-[#C46A1A] uppercase tracking-widest">
                        Painel de Controle
                      </span>
                      <h3 className="text-lg font-light uppercase text-white mt-0.5" style={{ fontFamily: 'var(--font-admin-heading)' }}>
                        Dados do Slide Ativo
                      </h3>
                    </div>

                    {activeSlide ? (
                      <div className="space-y-5 text-xs font-mono">
                        
                        {/* Slide Title (Local reference) */}
                        <div className="space-y-1.5">
                          <label className="text-white/60 uppercase text-[9px] tracking-wider block">Identificador do Slide (Uso Interno)</label>
                          <input
                            type="text"
                            value={activeSlide.title}
                            onChange={e => updateActiveSlideField('title', e.target.value)}
                            className="w-full bg-[#111116] border border-white/10 rounded-xl py-2.5 px-4 focus:outline-none focus:border-[#C46A1A] text-white"
                          />
                        </div>

                        {/* Slide Type Switcher */}
                        <div className="space-y-1.5">
                          <label className="text-white/60 uppercase text-[9px] tracking-wider block">Tipo de Slide</label>
                          <div className="grid grid-cols-3 gap-2 bg-[#121218] p-1 rounded-xl border border-white/5">
                            <button
                              type="button"
                              onClick={() => updateActiveSlideField('type', 'capa')}
                              className={`py-2 text-[10px] uppercase tracking-wider rounded-lg transition-colors ${
                                activeSlide.type === 'capa'
                                  ? 'bg-[#C46A1A] text-black font-bold'
                                  : 'text-white/40 hover:text-white'
                              }`}
                            >
                              Capa
                            </button>
                            <button
                              type="button"
                              onClick={() => updateActiveSlideField('type', 'veiculo')}
                              className={`py-2 text-[10px] uppercase tracking-wider rounded-lg transition-colors ${
                                activeSlide.type === 'veiculo'
                                  ? 'bg-[#C46A1A] text-black font-bold'
                                  : 'text-white/40 hover:text-white'
                              }`}
                            >
                              Veículo (Placa)
                            </button>
                            <button
                              type="button"
                              onClick={() => updateActiveSlideField('type', 'final')}
                              className={`py-2 text-[10px] uppercase tracking-wider rounded-lg transition-colors ${
                                activeSlide.type === 'final'
                                  ? 'bg-[#C46A1A] text-black font-bold'
                                  : 'text-white/40 hover:text-white'
                              }`}
                            >
                              Final
                            </button>
                          </div>
                        </div>

                        {/* CONDITIONAL CONTROLS BASED ON TYPE */}
                        {activeSlide.type === 'capa' ? (
                          // COVER SLIDE EDITABLES
                          <div className="space-y-4 pt-2 border-t border-white/5 text-center text-white/50 text-xs font-mono">
                            A Capa utiliza apenas configuração de imagem.
                          </div>
                        ) : activeSlide.type === 'veiculo' ? (
                          // VEHICLE SLIDE EDITABLES
                          <div className="space-y-4 pt-2 border-t border-white/5">
                            <div className="flex flex-col sm:flex-row items-end gap-3 mb-2 bg-[#C46A1A]/10 p-3 rounded-xl border border-[#C46A1A]/30">
                              <div className="flex-1 w-full space-y-1.5">
                                <label className="text-[#C46A1A] text-[9px] font-mono tracking-wider block">Importar Dados (Placa ou Modelo)</label>
                                <input
                                  type="text"
                                  value={scrapeQuery}
                                  onChange={e => setScrapeQuery(e.target.value)}
                                  onKeyDown={e => e.key === 'Enter' && handleScrape()}
                                  placeholder="Ex: ESR7C02"
                                  className="w-full bg-[#111116] border border-white/10 rounded-lg py-2 px-3 focus:outline-none focus:border-[#C46A1A] text-white text-xs"
                                />
                              </div>
                              <button
                                onClick={handleScrape}
                                disabled={scraping || !scrapeQuery}
                                className="bg-[#C46A1A] text-black text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-white disabled:opacity-50 transition-colors w-full sm:w-auto h-8 flex items-center justify-center shrink-0"
                              >
                                {scraping ? 'Buscando...' : 'Importar'}
                              </button>
                            </div>

                            <span className="text-[10px] text-[#C46A1A] uppercase tracking-wider block mt-4">Campos do Veículo</span>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-white/50 text-[9px] tracking-wider block">Fabricante (ex: PEUGEOT)</label>
                                <input
                                  type="text"
                                  value={activeSlide.fabricante || ''}
                                  onChange={e => updateActiveSlideField('fabricante', e.target.value)}
                                  className="w-full bg-[#111116] border border-white/10 rounded-xl py-2.5 px-4 focus:outline-none focus:border-[#C46A1A] text-white"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-white/50 text-[9px] tracking-wider block">Modelo (ex: 2008)</label>
                                <input
                                  type="text"
                                  value={activeSlide.modelo || ''}
                                  onChange={e => updateActiveSlideField('modelo', e.target.value)}
                                  className="w-full bg-[#111116] border border-white/10 rounded-xl py-2.5 px-4 focus:outline-none focus:border-[#C46A1A] text-white"
                                />
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-white/50 text-[9px] tracking-wider block">Descrição Detalhada / Versão</label>
                              <input
                                type="text"
                                value={activeSlide.descricao || ''}
                                onChange={e => updateActiveSlideField('descricao', e.target.value)}
                                placeholder="1.6 16V FLEX ALLURE 4P AUTOMÁTICO"
                                className="w-full bg-[#111116] border border-white/10 rounded-xl py-2.5 px-4 focus:outline-none focus:border-[#C46A1A] text-white"
                              />
                            </div>
                          </div>
                        ) : (
                          // FINAL SLIDE EDITABLES (Static)
                          <div className="space-y-4 pt-2 border-t border-white/5 text-center text-white/50 text-xs font-mono">
                            O Card Final utiliza apenas configuração de imagem.
                          </div>
                        )}

                        {/* IMAGE SETTINGS (SHARED) */}
                        <div className="space-y-4 pt-4 border-t border-white/5">
                          <span className="text-[10px] text-[#C46A1A] uppercase tracking-wider block">Upload & Posicionamento da Imagem</span>
                          
                          {/* File input and manual URL option */}
                          <div className="space-y-3">
                            <div className="flex gap-2">
                              {/* Trigger file input */}
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex-1 bg-[#1a1410] hover:bg-[#C46A1A]/20 text-[#FF7A00] border border-[#C46A1A]/30 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer font-bold"
                              >
                                <Upload className="w-4 h-4" />
                                Upload de Imagem
                              </button>
                              <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                accept="image/*"
                                className="hidden"
                              />
                            </div>

                            {activeSlide.imageFileName && (
                              <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                                <span className="text-green-400 font-mono text-[8px] uppercase tracking-wider">SEO Otimizado:</span>
                                <span className="text-white text-[9px] truncate">{activeSlide.imageFileName}</span>
                              </div>
                            )}

                            {/* Manual URL link */}
                            <div className="space-y-1">
                              <label className="text-white/40 text-[8px] uppercase">Ou cole uma URL direta</label>
                              <input
                                type="text"
                                value={activeSlide.imageUrl}
                                onChange={e => updateActiveSlideField('imageUrl', e.target.value)}
                                placeholder="https://..."
                                className="w-full bg-[#111116] border border-white/10 rounded-lg p-2 text-[10px] text-white/80"
                              />
                            </div>
                          </div>

                          {/* Zoom & Position controls */}
                          <div className="space-y-4 bg-[#111116] p-4 rounded-xl border border-white/5">
                            
                            {/* ZOOM slider */}
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="text-white/60">Zoom da Imagem</span>
                                <span className="text-cyan-400 font-bold">{(activeSlide.zoom * 100).toFixed(0)}%</span>
                              </div>
                              <input
                                type="range"
                                min="0.5"
                                max="3.5"
                                step="0.05"
                                value={activeSlide.zoom}
                                onChange={e => updateActiveSlideField('zoom', parseFloat(e.target.value))}
                                className="w-full accent-[#C46A1A]"
                              />
                            </div>

                            {/* POSITION X slider */}
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="text-white/60">Posição X (Horizontal)</span>
                                <span className="text-cyan-400 font-bold">{activeSlide.posX}px</span>
                              </div>
                              <input
                                type="range"
                                min="-300"
                                max="300"
                                step="1"
                                value={activeSlide.posX}
                                onChange={e => updateActiveSlideField('posX', parseInt(e.target.value))}
                                className="w-full accent-[#C46A1A]"
                              />
                            </div>

                            {/* POSITION Y slider */}
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="text-white/60">Posição Y (Vertical)</span>
                                <span className="text-cyan-400 font-bold">{activeSlide.posY}px</span>
                              </div>
                              <input
                                type="range"
                                min="-300"
                                max="300"
                                step="1"
                                value={activeSlide.posY}
                                onChange={e => updateActiveSlideField('posY', parseInt(e.target.value))}
                                className="w-full accent-[#C46A1A]"
                              />
                            </div>

                            {/* Reset Adjustments button */}
                            <button
                              type="button"
                              onClick={() => {
                                updateActiveSlideField('zoom', 1.0);
                                updateActiveSlideField('posX', 0);
                                updateActiveSlideField('posY', 0);
                                showToast('Ajustes redefinidos!');
                              }}
                              className="text-[9px] uppercase tracking-wider text-white/40 hover:text-white transition-colors flex items-center gap-1 mx-auto mt-1"
                            >
                              <Sliders className="w-3 h-3" />
                              Resetar Ajustes
                            </button>

                          </div>
                        </div>

                        {/* WEBSITE FOOTER URL */}
                        <div className="space-y-1.5 pt-4 border-t border-white/5">
                          <label className="text-white/50 text-[9px] tracking-wider block">Website no Rodapé</label>
                          <input
                            type="text"
                            value={activeSlide.website}
                            onChange={e => updateActiveSlideField('website', e.target.value)}
                            className="w-full bg-[#111116] border border-white/10 rounded-xl py-2.5 px-4 focus:outline-none focus:border-[#C46A1A] text-white"
                          />
                        </div>

                      </div>
                    ) : (
                      <div className="py-12 text-center text-white/30 text-xs">
                        Nenhum slide selecionado.
                      </div>
                    )}

                  </div>

                  {/* RIGHT COLUMN: Live View & Downloads & Carousel Slide Strip (55%) */}
                  <div className="lg:col-span-7 flex flex-col items-center gap-6">
                    
                    {/* DOWNLOAD ACTIONS PANEL */}
                    {activeSlide && (
                      <div className="w-full bg-[#0c0c10] border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <div className="text-center sm:text-left">
                          <span className="text-[9px] font-mono uppercase text-white/40 tracking-wider">Exportar Ativo Final</span>
                          <h4 className="text-xs font-mono font-bold text-white uppercase mt-0.5 max-w-[200px] truncate">{activeSlide.title}</h4>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                          <button
                            onClick={handleDownloadPNG}
                            className="flex-1 sm:flex-none bg-[#C46A1A] hover:bg-[#FF7A00] text-black font-mono font-bold text-xs uppercase tracking-widest py-3 px-5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#C46A1A]/10"
                          >
                            <Download className="w-4 h-4" />
                            Baixar PNG
                          </button>
                          <button
                            onClick={handleDownloadPDF}
                            className="flex-1 sm:flex-none bg-[#111116] hover:bg-white/5 text-white border border-white/10 font-mono font-bold text-xs uppercase tracking-widest py-3 px-5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <FileText className="w-4 h-4" />
                            Baixar PDF
                          </button>
                        </div>
                      </div>
                    )}

                    {/* LIVE VIEW STAGE */}
                    {activeSlide && (
                      <div className="w-full flex justify-center items-center py-4 bg-[#09090d] rounded-2xl border border-white/5 relative group">
                        
                        {/* Aspect Ratio bounding container to fit precisely 1080x1350 */}
                        <div 
                          id="slide-preview-container"
                          ref={previewRef}
                          className="w-[360px] h-[450px] relative overflow-hidden bg-black flex flex-col justify-between shadow-2xl select-none"
                          style={{ minWidth: '360px', minHeight: '450px' }}
                        >
                          
                          {/* CONDITIONAL RENDERING OF THE TEMPLATE BODY */}
                          {activeSlide.type === 'capa' ? (
                            
                            // A. COVER LAYOUT (FIXED IMAGE)
                            <div className="flex-1 w-full h-full relative">
                              <img 
                                src="https://res.cloudinary.com/djw0tqmiw/image/upload/v1783274799/odxwrvzl99npzp7kqi5d.png" 
                                alt="Capa" 
                                className="absolute inset-0 w-full h-full object-cover" 
                                crossOrigin="anonymous" 
                              />
                            </div>

                          ) : activeSlide.type === 'veiculo' ? (
                            
                            // B. VEHICLE AD TEMPLATE (PNG OVERLAY STYLE)
                            <div className="flex-1 flex flex-col justify-between relative overflow-hidden bg-black">
                              
                              {/* Background Car Photo */}
                              {activeSlide.imageUrl && (
                                <img
                                  src={activeSlide.imageUrl}
                                  alt="Carro Oferta"
                                  className="absolute max-w-none origin-center z-0"
                                  style={{
                                    transform: `translate(${activeSlide.posX}px, ${activeSlide.posY}px) scale(${activeSlide.zoom})`,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                  }}
                                  referrerPolicy="no-referrer"
                                  crossOrigin="anonymous"
                                />
                              )}

                              {/* FIXED PNG OVERLAY */}
                              <img 
                                src="https://res.cloudinary.com/djw0tqmiw/image/upload/v1783274796/ujijynb4i1ovomlekkrj.png" 
                                alt="Base Frame" 
                                className="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none" 
                                crossOrigin="anonymous" 
                              />
                                
                              {/* Header Texts (Transparent background) */}
                              <div className="p-5 relative flex flex-col justify-end h-[125px] z-20 pointer-events-none">
                                <div className="relative leading-none mt-4">
                                  <div className="text-[#005cbf] font-extrabold text-2xl italic tracking-wide uppercase leading-none drop-shadow-md">
                                    {activeSlide.fabricante || 'FABRICANTE'}
                                  </div>
                                  <div className="text-[#012d6a] font-black text-4xl italic tracking-tighter uppercase mt-1 leading-none drop-shadow-md">
                                    {activeSlide.modelo || 'MODELO'}
                                  </div>
                                  <div className="text-gray-700 font-bold text-[10px] italic tracking-wider uppercase mt-1.5 leading-none drop-shadow-sm bg-white/60 inline-block px-1 py-0.5 rounded">
                                    {activeSlide.descricao || 'DESCRIÇÃO COMPLETA'}
                                  </div>
                                </div>
                              </div>

                              <div className="flex-1 z-20 pointer-events-none"></div>

                              {/* Bottom 4 conditions cards (Transparent background) */}
                              <div className="text-white py-3.5 px-1.5 grid grid-cols-4 z-20 pointer-events-none mb-[32px]">
                                <div className="flex flex-col items-center justify-center text-center px-1">
                                  <span className="text-[7px] tracking-tight font-medium text-white uppercase drop-shadow-md">{activeSlide.condicao1Label}</span>
                                  <span className="text-sm font-black italic text-cyan-400 mt-0.5 uppercase drop-shadow-md">{activeSlide.condicao1Val}</span>
                                </div>
                                <div className="flex flex-col items-center justify-center text-center px-1">
                                  <span className="text-[7px] tracking-tight font-medium text-white uppercase drop-shadow-md">{activeSlide.condicao2Label}</span>
                                  <span className="text-sm font-black italic text-cyan-400 mt-0.5 uppercase drop-shadow-md">{activeSlide.condicao2Val}</span>
                                </div>
                                <div className="flex flex-col items-center justify-center text-center px-1">
                                  <span className="text-[7px] tracking-tight font-medium text-white uppercase drop-shadow-md">{activeSlide.condicao3Label}</span>
                                  <span className="text-sm font-black italic text-cyan-400 mt-0.5 uppercase drop-shadow-md">{activeSlide.condicao3Val}</span>
                                </div>
                                <div className="flex flex-col items-center justify-center text-center px-1">
                                  <span className="text-[7px] tracking-tight font-medium text-white uppercase drop-shadow-md">{activeSlide.condicao4Label}</span>
                                  <span className="text-sm font-black italic text-cyan-400 mt-0.5 uppercase text-center drop-shadow-md">{activeSlide.condicao4Val}</span>
                                </div>
                              </div>

                            </div>
                          ) : (
                            // C. FINAL TEMPLATE (FIXED IMAGE)
                            <div className="flex-1 w-full h-full relative">
                              <img 
                                src="https://res.cloudinary.com/djw0tqmiw/image/upload/v1783274796/rhd5ngpu9rhntpkqeh7v.png" 
                                alt="Final" 
                                className="absolute inset-0 w-full h-full object-cover" 
                                crossOrigin="anonymous" 
                              />
                            </div>
                          )}

                          {/* GLOBALLY SHARED WEB FOOTER BAR - Only show if not capa or final, or overlay it? Actually, if capa and final are fixed full-height images, they probably contain the footer. We will only render it for veiculo if the PNG doesn't have it. We'll render it absolutely at the bottom for veiculo. */}
                          {activeSlide.type === 'veiculo' && (
                            <div className="absolute bottom-0 left-0 right-0 bg-[#012d6a] text-white py-2 flex items-center justify-center gap-1 text-[8px] font-mono tracking-widest uppercase border-t border-cyan-400/10 z-20">
                              <svg className="w-3 h-3 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="2" y1="12" x2="22" y2="12"></line>
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                              </svg>
                              <span>{activeSlide.website || 'UNIMAISVEICULOS.COM.BR'}</span>
                            </div>
                          )}

                        </div>                      </div>
                    )}

                    {/* SLIDES STRIP / SELECT PANEL */}
                    <div className="w-full bg-[#0c0c10] border border-white/5 rounded-2xl p-6 space-y-4">
                      
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <span className="text-xs font-mono text-white/40 uppercase tracking-widest">
                          Slides do Carrossel ({slides.length})
                        </span>
                        
                        {/* Slide creation trigger */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAddSlide('veiculo')}
                            className="bg-[#18120e] hover:bg-[#C46A1A] text-[#FF7A00] hover:text-black border border-[#C46A1A]/30 font-mono text-[10px] uppercase tracking-widest px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 font-bold cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            + Veículo
                          </button>
                        </div>
                      </div>

                      {/* Grid list of slides */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {slides.map((slide, idx) => (
                          <div
                            key={slide.id}
                            onClick={() => setActiveSlideIndex(idx)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all shrink-0 w-[140px] flex flex-col justify-between h-[120px] ${
                              activeSlideIndex === idx
                                ? 'bg-[#18120e] border-[#C46A1A] text-[#FF7A00]'
                                : 'bg-[#111116] border-white/5 text-white/60 hover:border-white/20'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <span className="text-[9px] font-mono uppercase bg-black/40 px-1.5 py-0.5 rounded text-white/70">
                                #{idx + 1}
                              </span>
                              
                              {slide.type !== 'capa' && slide.type !== 'final' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSlide(idx);
                                  }}
                                  className="p-1 hover:text-red-400 transition-colors"
                                  title="Excluir slide"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            <div className="mt-2 text-left">
                              <p className="text-[8px] font-mono text-white/30 uppercase tracking-wider leading-none">
                                {slide.type === 'capa' ? 'Capa' : slide.type === 'final' ? 'Final' : 'Veículo'}
                              </p>
                              <h5 className="text-[11px] font-semibold tracking-wide text-white line-clamp-1 mt-1">
                                {slide.title}
                              </h5>
                              <p className="text-[9px] text-white/40 line-clamp-1 mt-0.5 font-light leading-none">
                                {slide.type === 'veiculo' ? `${slide.fabricante} ${slide.modelo}` : slide.type === 'final' ? 'Layout Final' : slide.descricao}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* STEP 4: Client Edit Layout */}
            {activeTab === 'config' && selectedClientId && showEditClient && selectedClientData && (
              <div className="space-y-6 animate-fade-in">
                
                <button 
                  onClick={() => {
                    setShowEditClient(false);
                    setSelectedClientId(null);
                  }}
                  className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para Configurações
                </button>

                <div className="bg-[#0c0c10] border border-white/5 rounded-2xl p-8 max-w-2xl">
                  
                  <div className="border-b border-white/5 pb-4 mb-6">
                    <span className="text-[9px] font-mono text-[#C46A1A] uppercase tracking-widest">
                      Configurações Globais
                    </span>
                    <h3 className="text-lg font-light uppercase text-white mt-0.5" style={{ fontFamily: 'var(--font-admin-heading)' }}>
                      Editar Dados do Cliente
                    </h3>
                  </div>

                  <div className="space-y-5 text-xs font-mono">
                    <div className="space-y-1.5">
                      <label className="text-white/60 uppercase text-[9px] tracking-wider block">Nome do Cliente</label>
                      <input
                        type="text"
                        value={selectedClientData.name}
                        onChange={(e) => updateSelectedClient({ name: e.target.value })}
                        className="w-full bg-[#111116] border border-white/10 rounded-xl py-2.5 px-4 focus:outline-none focus:border-[#C46A1A] text-white"
                        placeholder="Ex: Unimais Veículos"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-white/60 uppercase text-[9px] tracking-wider block">Descrição</label>
                      <textarea
                        value={selectedClientData.description}
                        onChange={(e) => updateSelectedClient({ description: e.target.value })}
                        rows={3}
                        className="w-full bg-[#111116] border border-white/10 rounded-xl py-2.5 px-4 focus:outline-none focus:border-[#C46A1A] text-white resize-none"
                        placeholder="Descrição curta sobre a loja"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-white/60 uppercase text-[9px] tracking-wider block">URL do Logotipo (Opcional)</label>
                      <input
                        type="text"
                        value={selectedClientData.logoUrl}
                        onChange={(e) => updateSelectedClient({ logoUrl: e.target.value })}
                        className="w-full bg-[#111116] border border-white/10 rounded-xl py-2.5 px-4 focus:outline-none focus:border-[#C46A1A] text-white"
                        placeholder="https://exemplo.com/logo.png"
                      />
                      <p className="text-[9px] text-white/30 uppercase mt-1 leading-relaxed">
                        Cole uma URL de imagem válida para substituir o logo padrão na plataforma.
                      </p>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-white/60 uppercase text-[9px] tracking-wider block">Detalhes</label>
                      <textarea
                        value={selectedClientData.detalhes || ''}
                        onChange={(e) => updateSelectedClient({ detalhes: e.target.value })}
                        rows={3}
                        className="w-full bg-[#111116] border border-white/10 rounded-xl py-2.5 px-4 focus:outline-none focus:border-[#C46A1A] text-white resize-none"
                        placeholder="Detalhes adicionais sobre o cliente"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-white/60 uppercase text-[9px] tracking-wider block">Anexos</label>
                      <input
                        type="text"
                        value={selectedClientData.anexos || ''}
                        onChange={(e) => updateSelectedClient({ anexos: e.target.value })}
                        className="w-full bg-[#111116] border border-white/10 rounded-xl py-2.5 px-4 focus:outline-none focus:border-[#C46A1A] text-white"
                        placeholder="URLs de anexos (separados por vírgula)"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-white/60 uppercase text-[9px] tracking-wider block">Cor do Cliente (Hex)</label>
                      <div className="flex gap-4 items-center">
                        <div className="relative w-[46px] h-[46px] shrink-0 rounded-xl overflow-hidden border border-white/10 focus-within:border-[#C46A1A] transition-colors">
                          <input
                            type="color"
                            value={selectedClientData.corCliente || '#FF7A00'}
                            onChange={(e) => updateSelectedClient({ corCliente: e.target.value })}
                            className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer bg-transparent border-0"
                          />
                        </div>
                        <input
                          type="text"
                          value={selectedClientData.corCliente || ''}
                          onChange={(e) => updateSelectedClient({ corCliente: e.target.value })}
                          className="flex-1 bg-[#111116] border border-white/10 rounded-xl py-2.5 px-4 focus:outline-none focus:border-[#C46A1A] text-white uppercase"
                          placeholder="Ex: #FF7A00"
                        />
                      </div>
                      
                      <div className="mt-4 p-4 bg-[#111116] border border-white/10 rounded-xl flex items-center justify-center group cursor-default">
                        <span className="text-[10px] text-white/40 uppercase tracking-widest mr-4">Preview:</span>
                        <h4 
                          className="text-2xl font-light tracking-wide uppercase transition-colors duration-300" 
                          style={{ 
                            fontFamily: 'var(--font-admin-heading)',
                            color: '#F5F2EC'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = selectedClientData.corCliente || '#FF7A00'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#F5F2EC'}
                        >
                          {selectedClientData.name || 'Nome do Cliente'}
                        </h4>
                      </div>
                      
                      <p className="text-[9px] text-white/30 uppercase mt-1 leading-relaxed">
                        Esta cor será usada no efeito hover ao passar o mouse sobre o nome do cliente.
                      </p>
                    </div>
                    
                    {selectedClientData.logoUrl && (
                      <div className="mt-4 p-4 bg-[#111116] border border-white/10 rounded-xl flex flex-col items-center justify-center">
                        <span className="text-white/40 uppercase text-[9px] mb-3">Preview do Logo</span>
                        <img 
                          src={selectedClientData.logoUrl} 
                          alt="Logo Preview" 
                          className="max-w-[200px] max-h-[80px] object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '';
                            setToast({ message: 'URL de imagem inválida', type: 'error' });
                          }}
                        />
                      </div>
                    )}

                    <div className="pt-6 border-t border-white/5 mt-6">
                      <button
                        onClick={() => {
                          setToast({ message: 'Dados do cliente salvos!', type: 'success' });
                          setTimeout(() => setToast(null), 3000);
                          setShowEditClient(false);
                          setSelectedClientId(null);
                        }}
                        className="w-full bg-[#18120e] border border-[#C46A1A] hover:bg-[#C46A1A] text-[#FF7A00] hover:text-black font-mono text-[10px] uppercase tracking-widest py-3 rounded-xl transition-all cursor-pointer font-bold"
                      >
                        Salvar Configurações
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: CONFIG VIEW */}
            {activeTab === 'config' && !showEditClient && (
              <div className="space-y-6 animate-fade-in max-w-4xl">
                
                {/* Configurar Clientes Card */}
                <div className="bg-[#0c0c10] border border-white/5 rounded-2xl p-8">
                  <div className="border-b border-white/5 pb-4 mb-8">
                    <span className="text-[9px] font-mono text-[#C46A1A] uppercase tracking-widest">
                      Gerenciamento do Sistema
                    </span>
                    <h3 className="text-xl font-light uppercase text-white mt-0.5" style={{ fontFamily: 'var(--font-admin-heading)' }}>
                      Configurar Clientes
                    </h3>
                  </div>

                  <div className="space-y-8">
                    {/* Cadastrar Cliente */}
                    <div>
                      <h4 className="text-[10px] font-mono uppercase tracking-widest text-white/60 mb-4">Cadastrar Novo Cliente</h4>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <input
                          type="text"
                          value={newClientName}
                          onChange={(e) => setNewClientName(e.target.value)}
                          className="flex-1 bg-[#111116] border border-white/10 rounded-xl py-2.5 px-4 focus:outline-none focus:border-[#C46A1A] text-white text-sm"
                          placeholder="Nome do cliente"
                        />
                        <button
                          onClick={() => {
                            if (!newClientName.trim()) return;
                            const newClient: AppClient = {
                              id: crypto.randomUUID(),
                              name: newClientName.trim(),
                              description: '',
                              logoUrl: '',
                              active: true
                            };
                            const updated = [...clients, newClient];
                            setClients(updated);
                            
                            const descPayload = JSON.stringify({ text: newClient.description, detalhes: '', anexos: '', corCliente: '' });
                            supabase.from('clients').upsert({ id: newClient.id, name: newClient.name, description: descPayload, logourl: newClient.logoUrl, active: newClient.active })
                              .then(({ error }) => {
                                if (error) console.error('Error saving client:', error);
                              });
                            
                            setNewClientName('');
                            setToast({ message: 'Cliente cadastrado!', type: 'success' });
                            setTimeout(() => setToast(null), 3000);
                          }}
                          className="bg-[#18120e] border border-[#C46A1A] hover:bg-[#C46A1A] text-[#FF7A00] hover:text-black font-mono text-[10px] uppercase tracking-widest px-6 py-2.5 rounded-xl transition-all cursor-pointer font-bold shrink-0"
                        >
                          Cadastrar
                        </button>
                      </div>
                    </div>

                    {/* Gerenciar Clientes */}
                    <div className="pt-8 border-t border-white/5">
                      <h4 className="text-[10px] font-mono uppercase tracking-widest text-white/60 mb-4">Gerenciar Clientes</h4>
                      <div className="space-y-3">
                        {clients.map(client => (
                          <div key={client.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111116] border border-white/5 p-4 rounded-xl hover:border-[#C46A1A]/30 transition-colors">
                            <div>
                              <span className="text-sm text-white font-medium block">{client.name}</span>
                              <span className={`text-[9px] font-mono uppercase tracking-widest mt-1 block ${client.active ? 'text-green-500/70' : 'text-red-500/70'}`}>
                                Status: {client.active ? 'Ativo' : 'Desativado'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedClientId(client.id);
                                  setShowEditClient(true);
                                }}
                                className="text-[10px] font-mono uppercase tracking-widest px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-all"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => {
                                  const toggledClient = { ...client, active: !client.active };
                                  const updated = clients.map(c => c.id === client.id ? toggledClient : c);
                                  setClients(updated);
                                  
                                  const descPayload = JSON.stringify({ text: toggledClient.description, detalhes: toggledClient.detalhes, anexos: toggledClient.anexos, corCliente: toggledClient.corCliente });
                                  supabase.from('clients').upsert({ id: toggledClient.id, name: toggledClient.name, description: descPayload, logourl: toggledClient.logoUrl, active: toggledClient.active })
                                    .then(({ error }) => {
                                      if (error) console.error('Error saving client:', error);
                                    });
                                }}
                                className={`text-[10px] font-mono uppercase tracking-widest px-4 py-2 rounded-lg border transition-all ${client.active ? 'border-red-900/50 text-red-400 hover:bg-red-900/20' : 'border-[#C46A1A]/50 text-[#C46A1A] hover:bg-[#C46A1A]/20'}`}
                              >
                                {client.active ? 'Desativar' : 'Ativar'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}

          </main>

        </div>
      )}

    </div>
  );
}
