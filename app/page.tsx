"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Clock, DollarSign, MapPin, Shield, Zap, Calendar, Phone,
  Search, Plus, Trash2, X, Check, ChevronRight, Menu,
  Settings, Wallet, Hammer, Package,
  MessageCircle, ArrowRight, Star, Award, Timer,
  Volume2, VolumeX, Bell, CheckCircle2, LogOut
} from 'lucide-react';
import heroImg from "/hero.jpg";
// hero image in public folder

type Service = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  time: string;
  active: boolean;
};
type Client = {
  id: string;
  nome: string;
  sobrenome: string;
  telefone: string;
  whatsapp: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  referencia: string;
};
type Appointment = {
  id: string;
  protocol: string;
  client: Client;
  items: { service: Service; qty: number; subtotal: number; isCombo?: boolean }[];
  total: number;
  subtotal: number;
  deslocamento: number;
  observacoes?: string;
  payment: 'PIX' | 'DINHEIRO';
  date: string;
  time: string;
  status: 'solicitacao_recebida' | 'recebida' | 'aguardando' | 'confirmado' | 'andamento' | 'concluido' | 'cancelado';
  address: string;
  createdAt: string;
};
type QuoteItem = { service: Service; qty: number; subtotal: number };
type Quote = {
  id: string;
  number: string;
  client: Client;
  items: QuoteItem[];
  deslocamento: number;
  desconto: number;
  acrescimo: number;
  observacoes: string;
  total: number;
  payment: 'PIX' | 'DINHEIRO';
  status: 'rascunho' | 'enviado' | 'aguardando' | 'aprovado' | 'recusado' | 'expirado';
  date: string;
};
type Config = { pixKey: string; pixName: string; pixBank: string; whatsappMsg: string; atendimento: string; };
type Review = { id: string; appointmentId: string; clientName: string; phone: string; rating: number; comment: string; date: string; serviceNames: string };

const INITIAL_REVIEWS: Review[] = [
  { id: 'r1', appointmentId: 'a1', clientName: 'João Silva', phone: '18991488302', rating: 5, comment: 'Profissional excelente! Montou meu guarda-roupa 6 portas com espelho rapidinho e perfeito. Super recomendo!', date: '2026-09-07', serviceNames: 'Guarda roupa 6 portas com espelho' },
  { id: 'r2', appointmentId: 'a2', clientName: 'Maria Oliveira', phone: '18999999999', rating: 5, comment: 'Atendimento nota 10! Veio no horário, muito caprichoso e limpo. Minha cozinha completa ficou linda.', date: '2026-09-06', serviceNames: 'Armário de cozinha completo grande' },
  { id: 'r3', appointmentId: 'a3', clientName: 'Carlos Pereira', phone: '18988888888', rating: 4, comment: 'Muito bom, rack com painel montado em 1h30. Profissional experiente.', date: '2026-09-05', serviceNames: 'Rack com painel grande' },
  { id: 'r4', appointmentId: 'a4', clientName: 'Ana Santos', phone: '18977777777', rating: 5, comment: 'Desmontagem + remontagem com 10% off valeu muito! Mudança tranquila.', date: '2026-09-04', serviceNames: 'Desmontagem + Remontagem' },
  { id: 'r5', appointmentId: 'a5', clientName: 'Fernanda Lima', phone: '18966666666', rating: 5, comment: 'Mesa gamer montada perfeita! Rápido e preço justo. Sem pagar nada antes.', date: '2026-09-03', serviceNames: 'Mesa gamer' },
];


const normalize = (str: string) => str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[,\.\-_]/g, ' ').replace(/\s+/g, ' ').trim();
const CATEGORIES = ["GUARDA ROUPAS","ARMÁRIOS DE COZINHA","RACK","PAINEL","BALCÃO","MESAS","NICHOS","PRATELEIRAS","DESMONTAGENS"];
const estimateTime = (price: number, isDesmontagem=false) => {
  if(isDesmontagem){ if(price<=80) return '45min'; if(price<=140) return '1h'; if(price<=200) return '1h30'; return '2h';}
  if(price<=80) return '45min'; if(price<=120) return '1h'; if(price<=180) return '1h30'; if(price<=250) return '2h30'; if(price<=350) return '3h30'; return '4h30';
};
type RawService = { name: string; category: string; price: number; description: string };
const MONTAGEM_RAW: RawService[] = [
  { name: 'Guarda roupa 2 portas', category: 'GUARDA ROUPAS', price: 120, description: 'Montagem completa de guarda roupa 2 portas' },
  { name: 'Guarda roupa 3 portas', category: 'GUARDA ROUPAS', price: 130, description: 'Montagem completa de guarda roupa 3 portas' },
  { name: 'Guarda roupa 4 portas', category: 'GUARDA ROUPAS', price: 160, description: 'Montagem completa de guarda roupa 4 portas' },
  { name: 'Guarda roupa 5 portas', category: 'GUARDA ROUPAS', price: 180, description: 'Montagem completa de guarda roupa 5 portas' },
  { name: 'Guarda roupa 6 portas', category: 'GUARDA ROUPAS', price: 200, description: 'Montagem completa de guarda roupa 6 portas' },
  { name: 'Guarda roupa 6 portas com espelho', category: 'GUARDA ROUPAS', price: 210, description: 'Montagem de guarda roupa 6 portas com espelho' },
  { name: 'Guarda roupa 8 portas', category: 'GUARDA ROUPAS', price: 230, description: 'Montagem de guarda roupa 8 portas - grande porte' },
  { name: 'Guarda roupa 2 portas de correr', category: 'GUARDA ROUPAS', price: 250, description: 'Montagem de guarda roupa 2 portas de correr' },
  { name: 'Guarda roupa 3 portas de correr e espelho', category: 'GUARDA ROUPAS', price: 280, description: 'Montagem de guarda roupa 3 portas de correr e espelho' },
  { name: 'Guarda roupa infantil', category: 'GUARDA ROUPAS', price: 150, description: 'Montagem de guarda roupa infantil' },
  { name: 'Guarda roupa grande com gavetas', category: 'GUARDA ROUPAS', price: 350, description: 'Montagem de guarda roupa grande com gavetas internas' },
  { name: 'Guarda roupa grande com espelho', category: 'GUARDA ROUPAS', price: 400, description: 'Montagem premium de guarda roupa grande com espelho' },
  { name: 'Armário aéreo 1 porta', category: 'ARMÁRIOS DE COZINHA', price: 90, description: 'Instalação de armário aéreo 1 porta na parede' },
  { name: 'Armário aéreo 2 portas', category: 'ARMÁRIOS DE COZINHA', price: 100, description: 'Instalação de armário aéreo 2 portas na parede' },
  { name: 'Armário aéreo 3 portas', category: 'ARMÁRIOS DE COZINHA', price: 120, description: 'Instalação de armário aéreo 3 portas' },
  { name: 'Armário aéreo 4 portas', category: 'ARMÁRIOS DE COZINHA', price: 130, description: 'Instalação de armário aéreo 4 portas' },
  { name: 'Armário aéreo com nicho', category: 'ARMÁRIOS DE COZINHA', price: 150, description: 'Instalação de armário aéreo com nicho' },
  { name: 'Armário de cozinha balcão 1 módulo', category: 'ARMÁRIOS DE COZINHA', price: 160, description: 'Montagem de armário de cozinha balcão 1 módulo' },
  { name: 'Armário de cozinha balcão 2 módulos', category: 'ARMÁRIOS DE COZINHA', price: 170, description: 'Montagem de armário de cozinha balcão 2 módulos' },
  { name: 'Armário de cozinha balcão 3 módulos', category: 'ARMÁRIOS DE COZINHA', price: 180, description: 'Montagem de armário de cozinha balcão 3 módulos' },
  { name: 'Balcão de cozinha 1 porta', category: 'ARMÁRIOS DE COZINHA', price: 100, description: 'Montagem de balcão de cozinha 1 porta' },
  { name: 'Balcão de cozinha 2 portas', category: 'ARMÁRIOS DE COZINHA', price: 120, description: 'Montagem de balcão de cozinha 2 portas' },
  { name: 'Balcão de cozinha 3 portas', category: 'ARMÁRIOS DE COZINHA', price: 130, description: 'Montagem de balcão de cozinha 3 portas' },
  { name: 'Balcão com gavetas', category: 'ARMÁRIOS DE COZINHA', price: 150, description: 'Montagem de balcão com gavetas' },
  { name: 'Armário torre de cozinha', category: 'ARMÁRIOS DE COZINHA', price: 170, description: 'Montagem de armário torre de cozinha - forno e micro' },
  { name: 'Armário de cozinha completo pequeno', category: 'ARMÁRIOS DE COZINHA', price: 250, description: 'Montagem de cozinha completa pequena' },
  { name: 'Armário de cozinha completo médio', category: 'ARMÁRIOS DE COZINHA', price: 280, description: 'Montagem de cozinha completa média' },
  { name: 'Armário de cozinha completo grande', category: 'ARMÁRIOS DE COZINHA', price: 350, description: 'Montagem de cozinha completa grande' },
  { name: 'Rack pequeno', category: 'RACK', price: 100, description: 'Montagem de rack pequeno para TV' },
  { name: 'Rack médio', category: 'RACK', price: 130, description: 'Montagem de rack médio para TV' },
  { name: 'Rack grande', category: 'RACK', price: 170, description: 'Montagem de rack grande' },
  { name: 'Rack com gavetas', category: 'RACK', price: 160, description: 'Montagem de rack com gavetas' },
  { name: 'Rack com portas', category: 'RACK', price: 160, description: 'Montagem de rack com portas' },
  { name: 'Rack suspenso', category: 'RACK', price: 150, description: 'Montagem de rack suspenso com fixação na parede' },
  { name: 'Rack com painel', category: 'RACK', price: 280, description: 'Montagem de rack com painel para TV' },
  { name: 'Rack com painel grande', category: 'RACK', price: 350, description: 'Montagem de rack com painel grande' },
  { name: 'Painel de TV pequeno', category: 'PAINEL', price: 150, description: 'Instalação de painel de TV pequeno' },
  { name: 'Painel de TV médio', category: 'PAINEL', price: 180, description: 'Instalação de painel de TV médio' },
  { name: 'Painel de TV grande', category: 'PAINEL', price: 220, description: 'Instalação de painel de TV grande' },
  { name: 'Painel ripado', category: 'PAINEL', price: 250, description: 'Instalação de painel ripado moderno' },
  { name: 'Painel com prateleira', category: 'PAINEL', price: 200, description: 'Instalação de painel com prateleira' },
  { name: 'Painel com nichos', category: 'PAINEL', price: 230, description: 'Instalação de painel com nichos' },
  { name: 'Painel com rack', category: 'PAINEL', price: 280, description: 'Montagem de painel com rack' },
  { name: 'Painel grande com rack e nichos', category: 'PAINEL', price: 350, description: 'Montagem completa painel grande com rack e nichos' },
  { name: 'Balcão pequeno', category: 'BALCÃO', price: 120, description: 'Montagem de balcão pequeno' },
  { name: 'Balcão médio', category: 'BALCÃO', price: 160, description: 'Montagem de balcão médio' },
  { name: 'Balcão grande', category: 'BALCÃO', price: 220, description: 'Montagem de balcão grande' },
  { name: 'Balcão com portas', category: 'BALCÃO', price: 180, description: 'Montagem de balcão com portas' },
  { name: 'Balcão com gavetas', category: 'BALCÃO', price: 200, description: 'Montagem de balcão com gavetas' },
  { name: 'Balcão de cozinha', category: 'BALCÃO', price: 180, description: 'Montagem de balcão de cozinha' },
  { name: 'Balcão de atendimento', category: 'BALCÃO', price: 250, description: 'Montagem de balcão de atendimento comercial' },
  { name: 'Mesa de centro pequena', category: 'MESAS', price: 80, description: 'Montagem de mesa de centro pequena' },
  { name: 'Mesa de centro média', category: 'MESAS', price: 100, description: 'Montagem de mesa de centro média' },
  { name: 'Mesa de centro grande', category: 'MESAS', price: 130, description: 'Montagem de mesa de centro grande' },
  { name: 'Mesa de escritório pequena', category: 'MESAS', price: 100, description: 'Montagem de mesa de escritório pequena' },
  { name: 'Mesa de escritório média', category: 'MESAS', price: 130, description: 'Montagem de mesa de escritório média' },
  { name: 'Mesa de escritório grande', category: 'MESAS', price: 180, description: 'Montagem de mesa de escritório grande em L' },
  { name: 'Mesa de jantar 4 lugares', category: 'MESAS', price: 120, description: 'Montagem de mesa de jantar 4 lugares' },
  { name: 'Mesa de jantar 6 lugares', category: 'MESAS', price: 150, description: 'Montagem de mesa de jantar 6 lugares' },
  { name: 'Mesa de jantar 8 lugares', category: 'MESAS', price: 190, description: 'Montagem de mesa de jantar 8 lugares' },
  { name: 'Mesa de jantar 10 lugares', category: 'MESAS', price: 230, description: 'Montagem de mesa de jantar 10 lugares' },
  { name: 'Mesa dobrável', category: 'MESAS', price: 100, description: 'Montagem de mesa dobrável' },
  { name: 'Mesa com gavetas', category: 'MESAS', price: 150, description: 'Montagem de mesa com gavetas' },
  { name: 'Mesa com tampo de vidro', category: 'MESAS', price: 160, description: 'Montagem de mesa com tampo de vidro' },
  { name: 'Mesa extensível', category: 'MESAS', price: 180, description: 'Montagem de mesa extensível' },
  { name: 'Mesa de computador', category: 'MESAS', price: 130, description: 'Montagem de mesa de computador' },
  { name: 'Mesa gamer', category: 'MESAS', price: 180, description: 'Montagem de mesa gamer com suporte' },
  { name: 'Mesa com cadeiras', category: 'MESAS', price: 200, description: 'Montagem de mesa com cadeiras' },
  { name: 'Nicho pequeno', category: 'NICHOS', price: 60, description: 'Instalação de nicho pequeno' },
  { name: 'Nicho médio', category: 'NICHOS', price: 80, description: 'Instalação de nicho médio' },
  { name: 'Nicho grande', category: 'NICHOS', price: 100, description: 'Instalação de nicho grande' },
  { name: 'Nicho quadrado', category: 'NICHOS', price: 70, description: 'Instalação de nicho quadrado decorativo' },
  { name: 'Nicho retangular', category: 'NICHOS', price: 80, description: 'Instalação de nicho retangular' },
  { name: 'Nicho com porta', category: 'NICHOS', price: 100, description: 'Instalação de nicho com porta' },
  { name: 'Nicho com 2 divisões', category: 'NICHOS', price: 100, description: 'Instalação de nicho com 2 divisões' },
  { name: 'Nicho com 3 divisões', category: 'NICHOS', price: 130, description: 'Instalação de nicho com 3 divisões' },
  { name: 'Conjunto com 3 nichos', category: 'NICHOS', price: 150, description: 'Instalação de conjunto com 3 nichos' },
  { name: 'Conjunto com 5 nichos', category: 'NICHOS', price: 220, description: 'Instalação de conjunto com 5 nichos' },
  { name: 'Prateleira pequena', category: 'PRATELEIRAS', price: 60, description: 'Instalação de prateleira pequena' },
  { name: 'Prateleira média', category: 'PRATELEIRAS', price: 80, description: 'Instalação de prateleira média' },
  { name: 'Prateleira grande', category: 'PRATELEIRAS', price: 100, description: 'Instalação de prateleira grande' },
  { name: 'Prateleira com suporte', category: 'PRATELEIRAS', price: 80, description: 'Instalação de prateleira com suporte reforçado' },
  { name: 'Prateleira flutuante', category: 'PRATELEIRAS', price: 90, description: 'Instalação de prateleira flutuante' },
  { name: 'Prateleira de parede', category: 'PRATELEIRAS', price: 80, description: 'Instalação de prateleira de parede' },
  { name: 'Conjunto com 2 prateleiras', category: 'PRATELEIRAS', price: 120, description: 'Instalação de conjunto com 2 prateleiras' },
  { name: 'Conjunto com 3 prateleiras', category: 'PRATELEIRAS', price: 150, description: 'Instalação de conjunto com 3 prateleiras' },
  { name: 'Conjunto com 4 prateleiras', category: 'PRATELEIRAS', price: 170, description: 'Instalação de conjunto com 4 prateleiras' },
  { name: 'Prateleira grande reforçada', category: 'PRATELEIRAS', price: 130, description: 'Instalação de prateleira grande reforçada' },
];
const buildServices = (): Service[] => {
  const montagem: Service[] = MONTAGEM_RAW.map((r, idx) => ({ id: `m-${idx+1}`, name: r.name, category: r.category, description: r.description, price: r.price, time: estimateTime(r.price,false), active: true }));
  const desmontagem: Service[] = MONTAGEM_RAW.map((r, idx) => {
    const desPrice = Math.max(40, r.price - 20);
    return { id: `d-${idx+1}`, name: `Desmontagem - ${r.name}`, category: 'DESMONTAGENS', description: `Desmontagem profissional de ${r.name.toLowerCase()} - preço montagem R$ ${r.price} - R$20`, price: desPrice, time: estimateTime(desPrice,true), active: true };
  });
  return [...montagem, ...desmontagem];
};
const DEFAULT_SERVICES: Service[] = buildServices();
const DEFAULT_CONFIG: Config = { pixKey: '18991488302', pixName: 'Sousa Montagens', pixBank: 'Nubank', whatsappMsg: 'Olá [NOME]. Aqui é da Sousa Montagens. Seu serviço agendado para [DATA] às [HORÁRIO].', atendimento: '08:00 às 18:00 - Segunda a Sábado' };
const SAMPLE_REVIEWS: Review[] = [
  { id:'1', appointmentId:'sample1', clientName:'Mariana S.', phone:'18999', rating:5, comment:'Serviço impecável! Montou meu guarda-roupa 6 portas super rápido e deixou tudo alinhado. Recomendo!', date:'2024-11-20', serviceNames:'Guarda roupa 6 portas' },
  { id:'2', appointmentId:'sample2', clientName:'Carlos Eduardo', phone:'18988', rating:5, comment:'Profissional pontual, atencioso e preço justo. Desmontagem + remontagem com 10% off valeu muito a pena.', date:'2024-11-18', serviceNames:'Desmontagem + Remontagem' },
  { id:'3', appointmentId:'sample3', clientName:'Ana Paula', phone:'18977', rating:5, comment:'Meu painel com rack ficou perfeito. Não paguei nada antes, só depois de conferir tudo. Transparência total.', date:'2024-11-10', serviceNames:'Painel com rack' },
];

export default function App(){
  const [services] = useState<Service[]>(() => DEFAULT_SERVICES);
  const [clients, setClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [reviews, setReviews] = useState<Review[]>(SAMPLE_REVIEWS);

  const [view, setView] = useState('inicio');
  const [isPro, setIsPro] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('TODOS');
  const [tipoFiltro, setTipoFiltro] = useState<'TODOS'|'MONTAGEM'|'DESMONTAGEM'>('TODOS');
  const [toast, setToast] = useState<string|null>(null);
  const [showRequest, setShowRequest] = useState(false);
  const [requestStep, setRequestStep] = useState(1);
  const [selectedServiceForRequest, setSelectedServiceForRequest] = useState<Service|null>(null);
  const [quoteBuilder, setQuoteBuilder] = useState<Quote|null>(null);
  const [showQuoteView, setShowQuoteView] = useState<Quote|null>(null);
  const [appointmentFilter, setAppointmentFilter] = useState('todos');
  const [financeFilterMonth, setFinanceFilterMonth] = useState(new Date().getMonth());
  const [selectedClient, setSelectedClient] = useState<Client|null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showReviewModal, setShowReviewModal] = useState<Appointment|null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [clientPhoneLookup, setClientPhoneLookup] = useState('');
  const [reqClient, setReqClient] = useState<Partial<Client>>({cidade:'Assis', estado:'SP'});
  const [reqItems, setReqItems] = useState<{service: Service; qty:number; isCombo?: boolean}[]>([]);
  const [reqPayment, setReqPayment] = useState<'PIX'|'DINHEIRO'>('PIX');
  const [reqDate, setReqDate] = useState('');
  const [reqTime, setReqTime] = useState('');
  const [reqSearch, setReqSearch] = useState('');
  const [reqDesloc, setReqDesloc] = useState<number>(0);
  const [reqObs, setReqObs] = useState('');
  const [requestSent, setRequestSent] = useState<{protocol:string}|null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const logoTapsRef = useRef<number[]>([]);
  const proViews = ['orcamentos','agendamentos','avaliacoes','financeiro','clientes','config'];

  useEffect(()=>{
    if(!isPro && proViews.includes(view)){
      setView('inicio');
    }
  },[isPro, view]);

  useEffect(()=>{
    try{
      const c = localStorage.getItem('sm_clients_v2'); if(c) setClients(JSON.parse(c));
      const a = localStorage.getItem('sm_appointments_v2'); if(a) setAppointments(JSON.parse(a));
      const q = localStorage.getItem('sm_quotes_v2'); if(q) setQuotes(JSON.parse(q));
      const cfg = localStorage.getItem('sm_config_v2'); if(cfg) setConfig(JSON.parse(cfg));
      const r = localStorage.getItem('sm_reviews_v2'); if(r) setReviews(JSON.parse(r));
      const se = localStorage.getItem('sm_sound'); if(se!==null) setSoundEnabled(se==='true');
    }catch{}
    if('Notification' in window && Notification.permission==='default'){ Notification.requestPermission().catch(()=>{}); }
  },[]);

  useEffect(()=>{
    try{
      if('serviceWorker' in navigator){
        navigator.serviceWorker.register('/sw.js').then(reg=>{
          console.log('SW registered', reg.scope);
        }).catch(err=> console.log('SW fail', err));
      }
    }catch{}
  },[]);

  useEffect(()=>{ localStorage.setItem('sm_clients_v2', JSON.stringify(clients)); },[clients]);
  useEffect(()=>{ localStorage.setItem('sm_appointments_v2', JSON.stringify(appointments)); },[appointments]);
  useEffect(()=>{ localStorage.setItem('sm_quotes_v2', JSON.stringify(quotes)); },[quotes]);
  useEffect(()=>{ localStorage.setItem('sm_config_v2', JSON.stringify(config)); },[config]);
  useEffect(()=>{ localStorage.setItem('sm_reviews_v2', JSON.stringify(reviews)); },[reviews]);
  useEffect(()=>{ localStorage.setItem('sm_sound', String(soundEnabled)); },[soundEnabled]);

  const showToast = (msg:string)=>{ setToast(msg); setTimeout(()=>setToast(null),3000); };

  const playBip = () => {
    if(!soundEnabled) return;
    try{
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if(!AudioCtx) return;
      const ctx = new AudioCtx();
      const beep = (freq:number, start:number, dur:number, vol=0.9) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        osc.connect(gain); gain.connect(ctx.destination);
        const t = ctx.currentTime + start;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(vol, t+0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t+dur);
        osc.start(t); osc.stop(t+dur+0.05);
      };
      beep(880,0,0.35); beep(880,0.45,0.35); beep(1320,0.9,0.6);
      setTimeout(()=>{ try{ ctx.close(); }catch{} }, 2000);
    }catch{}
    if('vibrate' in navigator){ try{ (navigator as any).vibrate([250,100,250,100,500]); }catch{} }
    if('Notification' in window && Notification.permission==='granted'){
      try{ new Notification('🔔 Novo orçamento! Sousa Montagens', { body: 'Cliente enviou solicitação via WhatsApp. Confira em Agendamentos.' }); }catch{}
    }
  };

  const filteredServices = useMemo(()=>{
    return services.filter(s=>{
      const matchActive = isPro || s.active;
      const matchTipo = tipoFiltro==='TODOS' ? true : tipoFiltro==='MONTAGEM' ? s.category!=='DESMONTAGENS' : s.category==='DESMONTAGENS';
      const matchCat = catFilter==='TODOS' || s.category===catFilter;
      const q = normalize(search);
      if(!q) return matchActive && matchCat && matchTipo;
      const matchSearch = normalize(s.name).includes(q) || normalize(s.category).includes(q) || normalize(s.description).includes(q);
      return matchActive && matchCat && matchTipo && matchSearch;
    });
  },[services, search, catFilter, tipoFiltro, isPro]);

  const filteredServicesForRequest = useMemo(()=>{
    const q = normalize(reqSearch);
    return services.filter(s=>{
      if(!s.active) return false;
      if(!q) return true;
      return normalize(s.name).includes(q) || normalize(s.category).includes(q) || normalize(s.description).includes(q);
    }).slice(0,10);
  },[reqSearch, services]);

  const calcItemSubtotal = (item:{service:Service; qty:number; isCombo?:boolean})=>{
    if(item.isCombo && item.service.category!=='DESMONTAGENS'){
      const mont = item.service.price;
      const desmont = Math.max(40, mont-20);
      const comboUnit = (mont + desmont) * 0.9;
      return comboUnit * item.qty;
    }
    return item.service.price * item.qty;
  };
  const totalRequestSubtotal = useMemo(()=> reqItems.reduce((acc,it)=> acc + calcItemSubtotal(it),0),[reqItems]);
  const totalRequest = useMemo(()=> totalRequestSubtotal + (reqDesloc||0),[totalRequestSubtotal, reqDesloc]);

  const times = ["08:00","09:00","10:00","11:00","13:00","14:00","15:00","16:00","17:00"];
  const isTimeOccupied = (date:string, time:string)=> appointments.some(a=> a.date===date && a.time===time && a.status!=='cancelado');

  const handleOpenRequest = (svc?: Service)=>{
    setSelectedServiceForRequest(svc||null);
    if(svc) setReqItems([{service:svc, qty:1}]);
    setShowRequest(true); setRequestStep(1); setRequestSent(null);
  };

  const buildWhatsAppMessage = (protocol:string)=>{
    const nome = `${reqClient.nome||''} ${reqClient.sobrenome||''}`.trim();
    const servLines = reqItems.map(it=>{
      const sub = calcItemSubtotal(it);
      const comboLabel = it.isCombo ? ' (Desmontagem + Remontagem 10% OFF)' : '';
      return `- ${it.service.name}${comboLabel} x${it.qty} = R$${sub.toFixed(2).replace('.',',')}`;
    }).join('\n');
    const msg = `Olá, Sousa Montagens! 🛠️\nQuero solicitar orçamento:\n\n👤 CLIENTE: ${nome}\n📱 Tel: ${reqClient.telefone||''} / Whats: ${reqClient.whatsapp||reqClient.telefone||''}\n\n📍 ENDEREÇO:\n${reqClient.endereco||''}, ${reqClient.numero||''} - ${reqClient.bairro||''}\n${reqClient.cidade||''}/${reqClient.estado||''} - CEP ${reqClient.cep||''}\nRef: ${reqClient.referencia||''}\nComplemento: ${reqClient.complemento||''}\n\n🪑 SERVIÇOS:\n${servLines}\nSubtotal: R$${totalRequestSubtotal.toFixed(2).replace('.',',')}\nDeslocamento: R$${(reqDesloc||0).toFixed(2).replace('.',',')}\nTOTAL: R$${totalRequest.toFixed(2).replace('.',',')}\n${reqObs?`\nObs: ${reqObs}\n`:''}\n📅 DATA: ${reqDate} às ${reqTime}\n💳 PAGAMENTO: ${reqPayment} - pagamento APÓS serviço\n\nProtocolo: ${protocol}`;
    return msg;
  };

  const handleSendWhatsApp = ()=>{
    if(!reqClient.nome || !reqClient.telefone || !reqClient.endereco || !reqDate || !reqTime || reqItems.length===0){
      showToast('Preencha todos os campos obrigatórios *'); return;
    }
    if(isTimeOccupied(reqDate, reqTime)){
      showToast('Horário já ocupado! Escolha outro.'); return;
    }
    const protocol = `SM-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(appointments.length+1).padStart(4,'0')}`;
    const clientId = Date.now().toString();
    const newClient: Client = {
      id: clientId,
      nome: reqClient.nome||'',
      sobrenome: reqClient.sobrenome||'',
      telefone: reqClient.telefone||'',
      whatsapp: reqClient.whatsapp||reqClient.telefone||'',
      cep: reqClient.cep||'',
      endereco: reqClient.endereco||'',
      numero: reqClient.numero||'',
      complemento: reqClient.complemento||'',
      bairro: reqClient.bairro||'',
      cidade: reqClient.cidade||'Assis',
      estado: reqClient.estado||'SP',
      referencia: reqClient.referencia||''
    };
    const appointment: Appointment = {
      id: Date.now().toString(),
      protocol,
      client: newClient,
      items: reqItems.map(i=>({ service:i.service, qty:i.qty, subtotal: calcItemSubtotal(i), isCombo: i.isCombo })),
      total: totalRequest,
      subtotal: totalRequestSubtotal,
      deslocamento: reqDesloc||0,
      observacoes: reqObs,
      payment: reqPayment,
      date: reqDate,
      time: reqTime,
      status: 'solicitacao_recebida',
      address: `${newClient.endereco}, ${newClient.numero} - ${newClient.bairro}, ${newClient.cidade}`,
      createdAt: new Date().toISOString()
    };
    setAppointments(prev=>[appointment, ...prev]);
    setClients(prev=>[newClient, ...prev]);

    const mensagem = buildWhatsAppMessage(protocol);
    try{
      window.open(`https://wa.me/5518991488302?text=${encodeURIComponent(mensagem)}`, '_blank');
    }catch{}
    playBip();
    setRequestSent({protocol});
    setRequestStep(7);
    showToast('Orçamento enviado! Abrindo WhatsApp...');
  };

  const financeData = useMemo(()=>{
    const monthApps = appointments.filter(a=> new Date(a.date).getMonth()===financeFilterMonth);
    const faturamento = monthApps.filter(a=> a.status!=='cancelado').reduce((s,a)=> s+a.total,0);
    const recebido = monthApps.filter(a=> a.status==='concluido').reduce((s,a)=> s+a.total,0);
    const aReceber = faturamento - recebido;
    const ticket = monthApps.length? faturamento/monthApps.length:0;
    const days: Record<string,number> = {};
    monthApps.forEach(a=>{ const d = new Date(a.date).getDate(); days[d]=(days[d]||0)+a.total; });
    const chart = Object.entries(days).sort((a,b)=> Number(a[0])-Number(b[0]));
    return { faturamento, recebido, aReceber, ticket, count: monthApps.length, chart, monthApps };
  },[appointments, financeFilterMonth]);

  const filteredAppointments = useMemo(()=>{
    const today = new Date().toISOString().slice(0,10);
    const tomorrow = new Date(Date.now()+86400000).toISOString().slice(0,10);
    return appointments.filter(a=>{
      if(appointmentFilter==='hoje') return a.date===today;
      if(appointmentFilter==='amanha') return a.date===tomorrow;
      if(appointmentFilter==='solicitacao_recebida') return a.status==='solicitacao_recebida';
      if(appointmentFilter==='pendentes') return ['recebida','aguardando','solicitacao_recebida'].includes(a.status);
      if(appointmentFilter==='confirmados') return a.status==='confirmado';
      if(appointmentFilter==='concluidos') return a.status==='concluido';
      if(appointmentFilter==='cancelados') return a.status==='cancelado';
      return true;
    });
  },[appointments, appointmentFilter]);

  const myAppointmentsLookup = useMemo(()=>{
    const q = clientPhoneLookup.replace(/\D/g,'');
    if(!q || q.length<4) return [];
    return appointments.filter(a=> a.client.telefone.replace(/\D/g,'').includes(q) || a.client.whatsapp.replace(/\D/g,'').includes(q));
  },[appointments, clientPhoneLookup]);

  const averageRating = useMemo(()=>{
    if(!reviews.length) return 0;
    return reviews.reduce((s,r)=> s+r.rating,0)/reviews.length;
  },[reviews]);

  const createNewQuote = ()=>{
    const newQuote: Quote = {
      id: Date.now().toString(),
      number: `ORC-${Date.now().toString().slice(-6)}`,
      client: { id:'', nome:'', sobrenome:'', telefone:'', whatsapp:'', cep:'', endereco:'', numero:'', complemento:'', bairro:'', cidade:'Assis', estado:'SP', referencia:'' },
      items: [], deslocamento:0, desconto:0, acrescimo:0, observacoes:'', total:0, payment:'PIX', status:'rascunho', date:new Date().toISOString().slice(0,10)
    };
    setQuoteBuilder(newQuote);
  };
  const calcQuoteTotal = (q:Quote)=> q.items.reduce((s,i)=> s+i.subtotal,0) + q.deslocamento - q.desconto + q.acrescimo;

  const handleLogoTap = ()=>{
    const now = Date.now();
    const recent = [...logoTapsRef.current, now].filter(t=> now - t < 3000);
    logoTapsRef.current = recent;
    if(recent.length>=5){
      logoTapsRef.current = [];
      setShowPasswordModal(true);
      setPasswordInput('');
      return;
    }
    if(recent.length===1){
      setView('inicio');
      window.scrollTo({top:0, behavior:'smooth'});
    }
  };
  const handlePasswordSubmit = ()=>{
    if(passwordInput==='20112024'){
      setIsPro(true);
      setShowPasswordModal(false);
      setPasswordInput('');
      setView('agendamentos');
      showToast('Modo profissional liberado');
    } else {
      showToast('Senha incorreta');
    }
  };
  const handleExitPro = ()=>{
    setIsPro(false);
    setView('inicio');
    setMobileMenu(false);
    showToast('Saiu do modo profissional');
  };

  const handleReviewSubmit = ()=>{
    if(!showReviewModal) return;
    if(!reviewComment.trim()){ showToast('Escreva como foi sua experiência'); return; }
    const rev: Review = {
      id: Date.now().toString(),
      appointmentId: showReviewModal.id,
      clientName: `${showReviewModal.client.nome} ${showReviewModal.client.sobrenome}`.trim() || showReviewModal.client.nome,
      phone: showReviewModal.client.telefone,
      rating: reviewRating,
      comment: reviewComment,
      date: new Date().toISOString().slice(0,10),
      serviceNames: showReviewModal.items.map(i=> i.service.name).join(', ')
    };
    setReviews(prev=>[rev, ...prev]);
    setShowReviewModal(null); setReviewComment(''); setReviewRating(5);
    showToast('Obrigado pela avaliação!');
  };

  const navClient = [
    {k:'inicio', l:'Início'},
    {k:'catalogo', l:'Catálogo'},
    {k:'meus-agendamentos', l:'Meus Agendamentos'},
  ];
  const navPro = [
    {k:'inicio', l:'Início'},
    {k:'catalogo', l:'Catálogo'},
    {k:'meus-agendamentos', l:'Meus Agend.'},
    {k:'orcamentos', l:'Orçamentos'},
    {k:'agendamentos', l:'Agendamentos'},
    {k:'avaliacoes', l:'Avaliações'},
    {k:'financeiro', l:'Financeiro'},
    {k:'clientes', l:'Clientes'},
    {k:'config', l:'Config'},
  ];
  const currentNav = isPro ? navPro : navClient;

  return (
    <div className="min-h-screen bg-[#080808] text-white selection:bg-[#d4af37]/30 font-[Inter,system-ui]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Syne:wght@700;800&display=swap');
        *{font-family:Inter,system-ui}
        .font-display{font-family:Syne,Inter,sans-serif}
        .gold-gradient{background:linear-gradient(100deg,#f5d76e 0%,#d4af37 45%,#b8941f 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .gold-bg{background:linear-gradient(100deg,#f5d76e,#d4af37)}
        .gold-border{border:1px solid rgba(212,175,55,0.25)}
        .glass{background:rgba(18,18,18,0.8);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}
        .card-glass{background:linear-gradient(180deg,rgba(28,28,28,0.9),rgba(14,14,14,0.9));border:1px solid rgba(212,175,55,0.18);box-shadow:0 10px 40px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.06)}
        .btn-gold{background:linear-gradient(100deg,#f5d76e,#d4af37);color:#0a0a0a;font-weight:800;letter-spacing:0.04em;transition:all .2s}
        .btn-gold:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(212,175,55,0.35)}
        ::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-thumb{background:#d4af37;border-radius:99px}
        @keyframes slideUp{from{transform:translate(-50%,20px);opacity:0}to{transform:translate(-50%,0);opacity:1}}
      `}</style>

      <header className="fixed top-0 inset-x-0 z-50 glass border-b border-white/[0.08]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 h-[68px] flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={handleLogoTap}>
            <div className="w-10 h-10 rounded-[10px] bg-[#111] gold-border flex items-center justify-center relative">
              <div className="absolute inset-[1px] rounded-[9px] bg-gradient-to-br from-[#222] to-[#0a0a0a]" />
              <Hammer className="w-5 h-5 text-[#d4af37] relative z-10" />
            </div>
            <div className="leading-none">
              <div className="font-display font-extrabold tracking-[0.12em] text-[15px]">SOUSA MONTAGENS</div>
              <div className="text-[10px] tracking-[0.18em] text-[#d4af37] font-bold mt-0.5">MONTADOR DE MÓVEIS</div>
            </div>
            {isPro && <span className="ml-2 hidden md:inline-flex text-[10px] px-2 py-1 rounded-full gold-bg text-black font-black tracking-widest">PRO</span>}
          </div>
          <nav className="hidden lg:flex items-center gap-1 bg-[#141414] rounded-full p-1 border border-white/10">
            {currentNav.map(i=>(
              <button key={i.k} onClick={()=>{ setView(i.k); window.scrollTo({top:0, behavior:'smooth'}); showToast(`${i.l} aberto`); }} className={`px-4 h-8 rounded-full text-[13px] font-medium transition ${view===i.k?'bg-white text-black':'text-white/70 hover:text-white'}`}>{i.l}</button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {isPro && (
              <>
                <button type="button" onClick={()=>{ setSoundEnabled(v=>!v); showToast(soundEnabled?'Som desativado':'Som ativado • BIP 3x'); }} className="hidden md:grid w-9 h-9 rounded-full bg-[#1a1a1a] gold-border place-items-center">
                  {soundEnabled? <Volume2 className="w-4 h-4 text-[#d4af37]" /> : <VolumeX className="w-4 h-4 text-white/50" />}
                </button>
                <button type="button" onClick={handleExitPro} className="hidden md:flex h-9 px-4 rounded-full bg-white text-black text-xs font-bold items-center gap-1"><LogOut className="w-3.5 h-3.5" />SAIR DO MODO PROFISSIONAL</button>
              </>
            )}
            <a href="https://wa.me/5518991488302?text=Ol%C3%A1!%20Vim%20pelo%20site%20Sousa%20Montagens" target="_blank" rel="noopener" className="hidden md:flex items-center gap-2 h-9 px-4 rounded-full gold-border bg-[#1a1a1a] text-sm font-semibold hover:bg-[#222] transition">
              <MessageCircle className="w-4 h-4 text-[#d4af37]" /> <span className="text-white/90">(18) 99148-8302</span>
            </a>
            <button onClick={()=>setMobileMenu(!mobileMenu)} className="lg:hidden w-9 h-9 rounded-full bg-[#1a1a1a] gold-border grid place-items-center"><Menu className="w-5 h-5" /></button>
          </div>
        </div>
        {mobileMenu && (
          <div className="lg:hidden border-t border-white/10 bg-[#0f0f0f] px-4 py-4 space-y-2">
            {currentNav.map(k=>(
              <button key={k.k} onClick={()=>{ setView(k.k); setMobileMenu(false); window.scrollTo({top:0, behavior:'smooth'}); showToast(`${k.l} aberto`); }} className={`w-full text-left px-4 h-11 rounded-xl text-sm font-medium capitalize ${view===k.k?'bg-white text-black':'bg-[#1a1a1a] text-white/80'}`}>{k.l}</button>
            ))}
            {isPro && (
              <div className="pt-3 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/50">Alerta sonoro BIP</span>
                  <button onClick={()=>setSoundEnabled(v=>!v)} className={`h-8 px-3 rounded-full text-xs font-bold ${soundEnabled?'gold-bg text-black':'bg-white/10 text-white/60'}`}>{soundEnabled?'ATIVADO':'DESATIVADO'}</button>
                </div>
                <button onClick={handleExitPro} className="w-full h-11 rounded-xl bg-white text-black text-sm font-bold flex items-center justify-center gap-2"><LogOut className="w-4 h-4" />SAIR DO MODO PROFISSIONAL</button>
              </div>
            )}
          </div>
        )}
      </header>

      <main className="pt-[68px]">
        {view==='inicio' && (
          <>
            <section className="relative min-h-[88vh] flex items-center overflow-hidden">
              <div className="absolute inset-0">
                <img src="/hero.jpg" alt="Sousa Montagens hero" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-[#080808]/85" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/80 to-[#080808]/30" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent" />
              </div>
              <div className="relative max-w-[1280px] mx-auto px-4 md:px-6 py-16 md:py-24 w-full grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1c1c1c] gold-border text-[11px] tracking-widest text-[#d4af37] font-bold mb-6">
                    <Star className="w-3.5 h-3.5" /> ATENDIMENTO PREMIUM EM ASSIS E REGIÃO
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 text-[11px] font-bold text-[#f5d76e] mb-4">
                    <CheckCircle2 className="w-4 h-4" /> ✓ Sem pagamento antecipado • Pague só após o serviço
                  </div>
                  <h1 className="font-display font-[900] leading-[0.92] text-[42px] md:text-[68px] tracking-tight">
                    <span className="block text-white">PRECISA</span>
                    <span className="block gold-gradient">MONTAR SEU</span>
                    <span className="block text-white">MÓVEL?</span>
                  </h1>
                  <p className="mt-5 text-[17px] md:text-[19px] text-white/70 max-w-[520px] leading-relaxed">
                    Solicite sua montagem de forma rápida, fácil e segura. Orçamento completo via WhatsApp, sem pagar nada antes.
                  </p>
                  <div className="mt-3 p-3 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/20 text-[13px] text-[#f5d76e] max-w-[520px]">
                    <strong>Você não paga nada antes.</strong> Pagamento somente após conclusão do serviço • PIX ou dinheiro
                  </div>
                  
                  <div className="mt-6 w-full max-w-[560px] relative overflow-hidden rounded-[20px] bg-gradient-to-br from-[#d4af37] via-[#f5d76e] to-[#b8941f] p-[1.5px]">
                    <div className="rounded-[18px] bg-[#0a0a0a] p-4 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#f5d76e] to-[#d4af37] grid place-items-center shrink-0 animate-pulse"><span className="text-2xl">📲</span></div>
                      <div className="flex-1 min-w-0"><div className="text-[11px] font-black tracking-[0.15em] text-[#d4af37]">BAIXE NOSSO APP E GANHE</div><div className="font-display font-black text-[22px] md:text-[26px] leading-none text-white">10% DE DESCONTO</div><div className="text-[11px] text-white/60 mt-0.5 truncate">em qualquer serviço • cupom liberado no app</div></div>
                      <button onClick={()=>{ const btn=document.getElementById('pwa-install-btn'); if(btn) btn.click(); }} className="shrink-0 h-10 px-5 rounded-full bg-white text-black text-[11px] font-black">BAIXAR APP</button>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <button onClick={()=>handleOpenRequest()} className="btn-gold h-[52px] px-8 rounded-full text-[14px] flex items-center gap-2">
                      SOLICITAR MONTAGEM <ArrowRight className="w-4 h-4" />
                    </button>
                    <button onClick={()=>setView('catalogo')} className="h-[52px] px-7 rounded-full bg-white/10 backdrop-blur border border-white/15 text-sm font-bold hover:bg-white/15 transition">VER CATÁLOGO • 176 SERVIÇOS</button>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2.5">
                    <button onClick={()=>setView('meus-agendamentos')} className="h-10 px-5 rounded-full bg-[#1a1a1a] gold-border text-[12px] font-bold tracking-wide hover:bg-[#222] transition">MEUS AGENDAMENTOS</button>
                    <a href="https://wa.me/5518991488302?text=Ol%C3%A1!%20Vim%20pelo%20site" target="_blank" rel="noopener" className="h-10 px-5 rounded-full bg-[#1a1a1a] gold-border text-[12px] font-bold tracking-wide hover:bg-[#222] transition flex items-center gap-2"><MessageCircle className="w-4 h-4 text-[#d4af37]" />FALAR COM MONTADOR</a>
                  </div>
                  <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-3 max-w-[560px]">
                    {[
                      {icon:Shield, t:'Sem pagamento antecipado'},
                      {icon:Zap, t:'Orçamento via WhatsApp'},
                      {icon:Calendar, t:'Data e horário'},
                      {icon:Wallet, t:'PIX ou dinheiro pós-serviço'},
                      {icon:MapPin, t:'Atendimento residencial'},
                      {icon:Award, t:'Desmontagem + 10% OFF'},
                    ].map(card=>(
                      <div key={card.t} className="card-glass rounded-[16px] p-3.5 flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full gold-bg grid place-items-center shrink-0"><card.icon className="w-4 h-4 text-black" /></div>
                        <div className="text-[12px] font-semibold leading-tight text-white/90">{card.t}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="hidden lg:block">
                  <div className="relative rounded-[28px] overflow-hidden card-glass p-2">
                    <img src="/hero.jpg" alt="Sousa Montagens" className="rounded-[20px] w-full aspect-[4/5] object-cover" />
                    <div className="absolute bottom-6 left-6 right-6 card-glass rounded-2xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[11px] tracking-widest text-[#d4af37] font-bold">WHATSAPP • ORÇAMENTO GRÁTIS</div>
                          <div className="font-display font-bold text-lg">(18) 99148-8302</div>
                          <div className="text-[10px] text-white/60">Pague só depois de pronto</div>
                        </div>
                        <div className="w-12 h-12 rounded-full gold-bg grid place-items-center"><Phone className="w-5 h-5 text-black" /></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Reviews carousel */}
            <section className="max-w-[1280px] mx-auto px-4 md:px-6 py-12">
              <div className="flex items-end justify-between gap-4 mb-6">
                <div>
                  <div className="text-[11px] tracking-[0.2em] text-[#d4af37] font-bold flex items-center gap-2"><Star className="w-3.5 h-3.5" /> AVALIAÇÕES REAIS • MÉDIA {averageRating.toFixed(1)} • {reviews.length} avaliações</div>
                  <h2 className="font-display text-3xl md:text-4xl font-extrabold mt-1">O que dizem nossos clientes</h2>
                </div>
                <div className="hidden md:flex items-center gap-1">
                  {[1,2,3,4,5].map(i=><Star key={i} className={`w-5 h-5 ${i<=Math.round(averageRating)?'fill-[#d4af37] text-[#d4af37]':'text-white/20'}`} />)}
                </div>
              </div>
              <div ref={carouselRef} className="grid md:grid-cols-3 gap-4">
                {reviews.slice(0,6).map(r=>(
                  <div key={r.id} className="card-glass rounded-[20px] p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex gap-1">{[1,2,3,4,5].map(s=><Star key={s} className={`w-4 h-4 ${s<=r.rating?'fill-[#d4af37] text-[#d4af37]':'text-white/20'}`} />)}</div>
                      <span className="text-[10px] text-white/40">{r.date}</span>
                    </div>
                    <div className="text-[14px] leading-relaxed text-white/90">"{r.comment}"</div>
                    <div className="mt-4 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-white/10 grid place-items-center text-xs font-bold">{r.clientName[0]}</div>
                      <div><div className="text-sm font-bold">{r.clientName}</div><div className="text-[11px] text-white/50">{r.serviceNames}</div></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="max-w-[1280px] mx-auto px-4 md:px-6 py-8 md:py-12">
              <div className="flex items-end justify-between gap-4 mb-6">
                <div>
                  <div className="text-[11px] tracking-[0.2em] text-[#d4af37] font-bold">CATÁLOGO PREMIUM • 88 MONTAGENS + 88 DESMONTAGENS + COMBO 10% OFF</div>
                  <h2 className="font-display text-3xl md:text-4xl font-extrabold mt-1">Serviços em destaque</h2>
                </div>
                <button onClick={()=>setView('catalogo')} className="h-10 px-5 rounded-full bg-white text-black text-sm font-bold">VER TUDO</button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {services.slice(0,8).map(s=>(
                  <div key={s.id} className="card-glass rounded-[20px] p-4 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] tracking-widest px-2.5 py-1 rounded-full font-bold border ${s.category==='DESMONTAGENS'?'bg-red-500/15 text-red-300 border-red-500/20':'bg-[#d4af37]/15 text-[#f5d76e] border-[#d4af37]/20'}`}>{s.category}</span>
                      <span className="text-[11px] text-white/50 flex items-center gap-1"><Timer className="w-3 h-3" />{s.time}</span>
                    </div>
                    <div className="font-bold text-[15px]">{s.name}</div>
                    <div className="text-[12px] text-white/60 mt-1 line-clamp-2">{s.description}</div>
                    <div className="mt-auto pt-4 flex items-center justify-between">
                      <div className="font-display font-extrabold text-xl">R$ {s.price.toFixed(2).replace('.',',')}</div>
                      <button onClick={()=>handleOpenRequest(s)} className="h-8 px-3 rounded-full gold-bg text-black text-[11px] font-extrabold">SOLICITAR</button>
                    </div>
                    {s.category!=='DESMONTAGENS' && <div className="mt-2 text-[10px] text-[#d4af37]/70 font-bold">DESMONTAGEM + REMONTAGEM • 10% OFF: R$ {((s.price + Math.max(40,s.price-20))*0.9).toFixed(0)}</div>}
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {view==='catalogo' && (
          <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-8">
            <div className="flex flex-wrap items-center gap-3 justify-between mb-4">
              <div>
                <h2 className="font-display text-3xl font-extrabold">Catálogo de Serviços</h2>
                <div className="text-[11px] tracking-[0.15em] text-[#d4af37] font-bold mt-1">88 MONTAGENS + 88 DESMONTAGENS • DESMONTAGEM + REMONTAGEM • 10% OFF • BUSCA INTELIGENTE SEM ACENTO • SEM PAGAMENTO ANTECIPADO</div>
                <div className="mt-2 inline-flex px-3 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 text-[11px] font-bold text-[#f5d76e]">✓ Você não paga nada antes. Pagamento somente após conclusão do serviço</div>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-[360px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder='Buscar: guarda-roupa, rack, aéreo, desmontagem...' className="w-full h-11 pl-10 pr-4 rounded-full bg-[#141414] border border-white/10 text-sm focus:outline-none focus:border-[#d4af37]/40" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 mb-3">
              {[{k:'TODOS',l:'Todos (176)'},{k:'MONTAGEM',l:'Montagem (88)'},{k:'DESMONTAGEM',l:'Desmontagem (88)'}].map(t=>(
                <button key={t.k} onClick={()=>setTipoFiltro(t.k as any)} className={`h-9 px-4 rounded-full text-xs font-bold border transition ${tipoFiltro===t.k?'gold-bg text-black border-transparent':'bg-[#141414] text-white/70 border-white/10'}`}>{t.l}</button>
              ))}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-3">
              <button onClick={()=>setCatFilter('TODOS')} className={`shrink-0 h-9 px-4 rounded-full text-xs font-bold border ${catFilter==='TODOS'?'bg-white text-black border-transparent':'bg-[#141414] text-white/70 border-white/10'}`}>TODAS</button>
              {CATEGORIES.map(c=>(
                <button key={c} onClick={()=>setCatFilter(c)} className={`shrink-0 h-9 px-4 rounded-full text-xs font-bold border whitespace-nowrap ${catFilter===c?'gold-bg text-black border-transparent':'bg-[#141414] text-white/70 border-white/10'}`}>{c}</button>
              ))}
            </div>
            <div className="mt-4 text-xs text-white/40">{filteredServices.length} serviços • Busca ignora acentos, vírgulas, hífens • DESMONTAGEM + REMONTAGEM • 10% OFF</div>
            <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredServices.map(s=>(
                <div key={s.id} className="card-glass rounded-[22px] p-5 flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <span className={`text-[10px] tracking-widest px-2.5 py-1 rounded-full font-bold border ${s.category==='DESMONTAGENS'?'bg-red-500/15 text-red-300 border-red-500/20':'bg-[#d4af37]/15 text-[#f5d76e] border-[#d4af37]/20'}`}>{s.category}</span>
                    <span className="text-[11px] text-white/50 flex items-center gap-1"><Clock className="w-3 h-3" />{s.time}</span>
                  </div>
                  <div className="mt-3 font-bold text-[16px] leading-tight">{s.name}</div>
                  <div className="mt-1 text-[13px] text-white/60">{s.description}</div>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-white/40">a partir de</div>
                      <div className="font-display font-extrabold text-[22px]">R$ {s.price.toFixed(2).replace('.',',')}</div>
                      {s.category==='DESMONTAGENS' ? <div className="text-[10px] text-red-300/70 font-bold">MONTAGEM - R$20 • MÍN R$40</div> : <div className="text-[10px] text-[#d4af37]/70">DESMONTAGEM + REMONTAGEM • 10% OFF</div>}
                    </div>
                    <button onClick={()=>handleOpenRequest(s)} className="h-10 px-5 rounded-full btn-gold text-[12px]">SOLICITAR MONTAGEM</button>
                  </div>
                </div>
              ))}
            </div>
            {filteredServices.length===0 && <div className="text-center py-12 text-white/40 text-sm">Nenhum serviço para "{search}"</div>}
          </div>
        )}

        {view==='meus-agendamentos' && (
          <div className="max-w-[900px] mx-auto px-4 md:px-6 py-8">
            <h2 className="font-display text-3xl font-extrabold">Meus Agendamentos</h2>
            <div className="mt-2 text-sm text-white/60">Digite seu telefone para ver seus pedidos. Após conclusão, você poderá avaliar de 1 a 5 estrelas.</div>
            <div className="mt-6 card-glass rounded-[20px] p-5">
              <div className="relative max-w-[400px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input value={clientPhoneLookup} onChange={e=>setClientPhoneLookup(e.target.value)} placeholder="Digite seu telefone / WhatsApp" className="w-full h-12 pl-10 pr-4 rounded-full bg-[#0f0f0f] border border-white/10 text-sm focus:border-[#d4af37]/40 outline-none" />
              </div>
              <div className="mt-2 text-[11px] text-white/40">Ex: 18991488302 • Mostra todos os serviços vinculados a este número</div>
              {clientPhoneLookup.length>=4 && (
                <div className="mt-6 space-y-3">
                  {myAppointmentsLookup.length===0 && <div className="text-sm text-white/50">Nenhum agendamento encontrado para este telefone.</div>}
                  {myAppointmentsLookup.map(a=>{
                    const alreadyReviewed = reviews.some(r=> r.appointmentId===a.id);
                    return (
                      <div key={a.id} className="bg-[#141414] rounded-2xl p-4 border border-white/5">
                        <div className="flex flex-wrap justify-between gap-2">
                          <div className="flex items-center gap-2"><span className="font-mono text-xs px-2 py-1 rounded-full bg-white/10">{a.protocol}</span><span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase border ${a.status==='concluido'?'bg-green-500/20 text-green-300 border-green-500/20': a.status==='solicitacao_recebida'?'bg-blue-500/20 text-blue-300 border-blue-500/20':'bg-[#d4af37]/20 text-[#d4af37] border-[#d4af37]/20'}`}>{a.status.replace('_',' ')}</span></div>
                          <div className="text-xs text-white/50">{a.date} às {a.time}</div>
                        </div>
                        <div className="mt-3 text-sm font-semibold">{a.items.map(i=> `${i.service.name}${i.isCombo?' (Combo 10% OFF)':''} x${i.qty}`).join(' • ')}</div>
                        <div className="mt-1 text-xs text-white/60">Total R$ {a.total.toFixed(2)} • {a.payment} • {a.address}</div>
                        <div className="mt-3 flex gap-2">
                          {a.status==='concluido' && !alreadyReviewed && (
                            <button onClick={()=>{ setShowReviewModal(a); setReviewRating(5); setReviewComment(''); }} className="h-9 px-4 rounded-full gold-bg text-black text-xs font-bold flex items-center gap-1"><Star className="w-4 h-4" /> AVALIAR SERVIÇO</button>
                          )}
                          {alreadyReviewed && <span className="h-9 px-4 rounded-full bg-green-500/20 text-green-300 text-xs font-bold flex items-center gap-1"><Check className="w-4 h-4" /> Avaliado • Obrigado!</span>}
                          {a.status!=='concluido' && <span className="text-[11px] text-white/40 py-2">Avaliação liberada após conclusão</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="mt-6 card-glass rounded-2xl p-4 text-xs text-white/60">
              <div className="font-bold text-white/80 flex items-center gap-2"><Shield className="w-4 h-4 text-[#d4af37]" /> Política de pagamento</div>
              <div className="mt-2">Você não paga nada antes. Pagamento somente após conclusão do serviço, conferência e sua satisfação. PIX ou dinheiro.</div>
            </div>
          </div>
        )}

        {isPro && view==='orcamentos' && (
          <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-3xl font-extrabold">Orçamentos</h2>
              <button onClick={createNewQuote} className="h-11 px-6 rounded-full btn-gold text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> NOVO ORÇAMENTO</button>
            </div>
            {quoteBuilder && (
              <div className="card-glass rounded-[24px] p-5 md:p-6 mb-8">
                <div className="flex items-center justify-between mb-5">
                  <div className="font-bold">Criar Orçamento • {quoteBuilder.number}</div>
                  <button onClick={()=>setQuoteBuilder(null)} className="w-8 h-8 rounded-full bg-white/10 grid place-items-center"><X className="w-4 h-4" /></button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <input placeholder="Nome cliente" value={quoteBuilder.client.nome} onChange={e=> setQuoteBuilder({...quoteBuilder, client:{...quoteBuilder.client, nome:e.target.value}})} className="h-11 px-4 rounded-xl bg-[#0f0f0f] border border-white/10 text-sm" />
                  <input placeholder="Telefone" value={quoteBuilder.client.telefone} onChange={e=> setQuoteBuilder({...quoteBuilder, client:{...quoteBuilder.client, telefone:e.target.value}})} className="h-11 px-4 rounded-xl bg-[#0f0f0f] border border-white/10 text-sm" />
                  <div className="md:col-span-2 relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input placeholder='Buscar serviço' value={reqSearch} onChange={e=>setReqSearch(e.target.value)} className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#0f0f0f] border border-white/10 text-sm" />
                    </div>
                    {reqSearch && (
                      <div className="mt-2 grid gap-2">
                        {filteredServicesForRequest.map(s=>(
                          <button key={s.id} onClick={()=>{
                            const exists = quoteBuilder.items.find(i=> i.service.id===s.id);
                            if(exists){ setQuoteBuilder({...quoteBuilder, items: quoteBuilder.items.map(i=> i.service.id===s.id? {...i, qty:i.qty+1, subtotal:(i.qty+1)*s.price}:i)}); }
                            else{ setQuoteBuilder({...quoteBuilder, items:[...quoteBuilder.items, {service:s, qty:1, subtotal:s.price}]}); }
                            setReqSearch('');
                          }} className="text-left p-3 rounded-xl bg-[#1a1a1a] border border-white/10 flex justify-between">
                            <span className="text-sm">{s.name}</span><span className="text-sm font-bold text-[#d4af37]">R$ {s.price}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {quoteBuilder.items.length>0 && (
                  <div className="mt-5 space-y-2">
                    {quoteBuilder.items.map((it,idx)=>(
                      <div key={idx} className="flex items-center justify-between bg-[#141414] rounded-xl px-4 h-12 border border-white/5">
                        <div className="text-sm">{it.service.name}</div>
                        <div className="flex items-center gap-2">
                          <button onClick={()=>{ setQuoteBuilder({...quoteBuilder, items: quoteBuilder.items.map((x,i)=> i===idx? {...x, qty:Math.max(1,x.qty-1), subtotal:Math.max(1,x.qty-1)*x.service.price}:x)}); }} className="w-7 h-7 rounded-full bg-white/10">-</button>
                          <span className="w-6 text-center text-sm">{it.qty}</span>
                          <button onClick={()=>{ setQuoteBuilder({...quoteBuilder, items: quoteBuilder.items.map((x,i)=> i===idx? {...x, qty:x.qty+1, subtotal:(x.qty+1)*x.service.price}:x)}); }} className="w-7 h-7 rounded-full bg-white/10">+</button>
                          <span className="text-sm font-bold ml-2">R$ {it.subtotal.toFixed(2)}</span>
                          <button onClick={()=> setQuoteBuilder({...quoteBuilder, items: quoteBuilder.items.filter((_,i)=> i!==idx)})} className="ml-2 w-7 h-7 rounded-full bg-red-500/20 grid place-items-center"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-6 grid md:grid-cols-3 gap-3">
                  <input type="number" placeholder="Taxa deslocamento" value={quoteBuilder.deslocamento||''} onChange={e=> setQuoteBuilder({...quoteBuilder, deslocamento:Number(e.target.value)||0})} className="h-11 px-4 rounded-xl bg-[#0f0f0f] border border-white/10 text-sm" />
                  <input type="number" placeholder="Desconto" value={quoteBuilder.desconto||''} onChange={e=> setQuoteBuilder({...quoteBuilder, desconto:Number(e.target.value)||0})} className="h-11 px-4 rounded-xl bg-[#0f0f0f] border border-white/10 text-sm" />
                  <input type="number" placeholder="Acréscimo" value={quoteBuilder.acrescimo||''} onChange={e=> setQuoteBuilder({...quoteBuilder, acrescimo:Number(e.target.value)||0})} className="h-11 px-4 rounded-xl bg-[#0f0f0f] border border-white/10 text-sm" />
                </div>
                <textarea placeholder="Observações" value={quoteBuilder.observacoes} onChange={e=> setQuoteBuilder({...quoteBuilder, observacoes:e.target.value})} className="mt-3 w-full h-20 p-3 rounded-xl bg-[#0f0f0f] border border-white/10 text-sm" />
                <div className="mt-6 card-glass rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-white/50">TOTAL DO ORÇAMENTO</div>
                    <div className="font-display text-2xl font-extrabold">R$ {calcQuoteTotal(quoteBuilder).toFixed(2).replace('.',',')}</div>
                  </div>
                  <button onClick={()=>{ const total=calcQuoteTotal(quoteBuilder); const final={...quoteBuilder, total}; setQuotes(prev=>[final,...prev]); setQuoteBuilder(null); setReqSearch(''); showToast('Orçamento salvo!'); }} className="h-11 px-6 rounded-full btn-gold text-sm font-bold">SALVAR ORÇAMENTO</button>
                </div>
              </div>
            )}
            <div className="grid gap-3">
              {quotes.map(q=>(
                <div key={q.id} className="card-glass rounded-[18px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2"><span className="font-bold">{q.number}</span><span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${q.status==='aprovado'?'bg-green-500/20 text-green-400':'bg-white/10 text-white/60'}`}>{q.status.toUpperCase()}</span></div>
                    <div className="text-sm text-white/70 mt-1">{q.client.nome||'Cliente'} • {q.items.length} itens • R$ {q.total.toFixed(2)}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>setShowQuoteView(q)} className="h-9 px-4 rounded-full bg-white text-black text-xs font-bold">VER</button>
                  </div>
                </div>
              ))}
              {quotes.length===0 && <div className="text-center py-12 text-white/40 text-sm">Nenhum orçamento ainda.</div>}
            </div>
          </div>
        )}

        {isPro && view==='agendamentos' && (
          <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="font-display text-3xl font-extrabold">Agendamentos</h2>
                <div className="text-xs text-white/50 flex items-center gap-2 mt-1"><Bell className="w-3.5 h-3.5 text-[#d4af37]" /> Alerta BIP alto 3x + notificação ao receber • <button onClick={()=>setSoundEnabled(v=>!v)} className="underline">{soundEnabled?'Som ligado':'Som desligado'}</button> • <button onClick={playBip} className="px-2 py-0.5 rounded-full bg-white/10">Testar BIP</button></div>
              </div>
              <button onClick={()=>handleOpenRequest()} className="h-11 px-6 rounded-full btn-gold text-sm font-bold flex items-center gap-2"><Plus className="w-4 h-4" /> NOVA SOLICITAÇÃO</button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[{k:'todos',l:'Todos'},{k:'solicitacao_recebida',l:'Solicitações'},{k:'hoje',l:'Hoje'},{k:'amanha',l:'Amanhã'},{k:'pendentes',l:'Pendentes'},{k:'confirmados',l:'Confirmados'},{k:'concluidos',l:'Concluídos'},{k:'cancelados',l:'Cancelados'}].map(f=>(
                <button key={f.k} onClick={()=>setAppointmentFilter(f.k)} className={`shrink-0 h-8 px-4 rounded-full text-xs font-bold border ${appointmentFilter===f.k?'gold-bg text-black border-transparent':'bg-[#141414] text-white/60 border-white/10'}`}>{f.l}</button>
              ))}
            </div>
            <div className="mt-6 grid gap-3">
              {filteredAppointments.map(a=>{
                const hasReview = reviews.some(r=> r.appointmentId===a.id);
                return (
                  <div key={a.id} className="card-glass rounded-[20px] p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs px-2 py-1 rounded-full bg-white/10 border border-white/10">{a.protocol}</span>
                          <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide border
                            ${a.status==='solicitacao_recebida'?'bg-blue-500/20 text-blue-300 border-blue-500/30':''}
                            ${a.status==='recebida'?'bg-blue-500/15 text-blue-300 border-blue-500/20':''}
                            ${a.status==='aguardando'?'bg-yellow-500/15 text-yellow-300 border-yellow-500/20':''}
                            ${a.status==='confirmado'?'bg-[#d4af37]/20 text-[#f5d76e] border-[#d4af37]/30':''}
                            ${a.status==='andamento'?'bg-purple-500/15 text-purple-300 border-purple-500/20':''}
                            ${a.status==='concluido'?'bg-green-500/15 text-green-300 border-green-500/20':''}
                            ${a.status==='cancelado'?'bg-red-500/15 text-red-300 border-red-500/20':''}
                          `}>{a.status.replace('_',' ')}</span>
                          {hasReview && <span className="text-[10px] px-2 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500/20 flex items-center gap-1"><Star className="w-3 h-3 fill-green-300" /> AVALIADO</span>}
                        </div>
                        <div className="mt-2 font-bold text-[15px]">{a.client.nome} {a.client.sobrenome} • {a.client.telefone}</div>
                        <div className="text-[13px] text-white/60 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{a.date} às {a.time}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{a.address}</span>
                          <span className="flex items-center gap-1"><Wallet className="w-3.5 h-3.5" />{a.payment} • R$ {a.total.toFixed(2)} (Sub R$ {a.subtotal.toFixed(2)} + Desloc R$ {a.deslocamento.toFixed(2)})</span>
                        </div>
                        <div className="mt-2 text-xs text-white/50">{a.items.map(i=> `${i.service.name}${i.isCombo?' (DESMONTAGEM + REMONTAGEM • 10% OFF)':''} x${i.qty}`).join(' • ')}</div>
                        {a.observacoes && <div className="mt-2 text-xs bg-[#141414] rounded-lg p-2 border border-white/5">Obs: {a.observacoes}</div>}
                      </div>
                      <div className="flex gap-2 items-center">
                        <a href={`https://wa.me/55${a.client.telefone.replace(/\D/g,'')}?text=${encodeURIComponent(config.whatsappMsg.replace('[NOME]', a.client.nome).replace('[DATA]', a.date).replace('[HORÁRIO]', a.time))}`} target="_blank" rel="noopener" className="w-9 h-9 rounded-full bg-[#1a1a1a] gold-border grid place-items-center"><MessageCircle className="w-4 h-4" /></a>
                        <select value={a.status} onChange={e=>{
                          const newStatus = e.target.value as Appointment['status'];
                          setAppointments(prev=> prev.map(x=> x.id===a.id? {...x, status:newStatus}:x));
                          if(newStatus==='concluido'){ showToast('Serviço concluído! Cliente pode avaliar. Link de avaliação liberado.'); }
                          else showToast(`Status ${newStatus}`);
                        }} className="h-9 rounded-full bg-[#141414] border border-white/10 text-xs px-3">
                          <option value="solicitacao_recebida">Solicitação recebida</option>
                          <option value="recebida">Recebida</option>
                          <option value="aguardando">Aguardando</option>
                          <option value="confirmado">Confirmado</option>
                          <option value="andamento">Em andamento</option>
                          <option value="concluido">Concluído → libera avaliação</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredAppointments.length===0 && <div className="text-center py-12 text-white/40 text-sm">Nenhum agendamento neste filtro.</div>}
            </div>
          </div>
        )}

        {isPro && view==='avaliacoes' && (
          <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-8">
            <h2 className="font-display text-3xl font-extrabold">Avaliações</h2>
            <div className="mt-4 grid md:grid-cols-3 gap-4">
              <div className="card-glass rounded-[20px] p-6 text-center">
                <div className="text-5xl font-display font-extrabold">{averageRating.toFixed(1)}</div>
                <div className="flex justify-center gap-1 mt-2">{[1,2,3,4,5].map(i=><Star key={i} className={`w-5 h-5 ${i<=Math.round(averageRating)?'fill-[#d4af37] text-[#d4af37]':'text-white/20'}`} />)}</div>
                <div className="text-xs text-white/50 mt-2">{reviews.length} avaliações</div>
              </div>
              <div className="md:col-span-2 card-glass rounded-[20px] p-6">
                <div className="text-sm font-bold mb-3">Distribuição</div>
                {[5,4,3,2,1].map(st=>{
                  const count = reviews.filter(r=> r.rating===st).length;
                  const pct = reviews.length? (count/reviews.length)*100:0;
                  return (
                    <div key={st} className="flex items-center gap-3 mb-2">
                      <span className="text-xs w-8">{st} ★</span>
                      <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full gold-bg" style={{width:`${pct}%`}} /></div>
                      <span className="text-xs w-8 text-white/50">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-8 grid gap-3">
              {reviews.map(r=>(
                <div key={r.id} className="card-glass rounded-[18px] p-5">
                  <div className="flex justify-between">
                    <div className="flex gap-1">{[1,2,3,4,5].map(s=><Star key={s} className={`w-4 h-4 ${s<=r.rating?'fill-[#d4af37] text-[#d4af37]':'text-white/20'}`} />)}</div>
                    <span className="text-[11px] text-white/40">{r.date} • {r.phone}</span>
                  </div>
                  <div className="mt-2 text-sm font-semibold">{r.clientName} • {r.serviceNames}</div>
                  <div className="mt-2 text-sm text-white/70">{r.comment}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isPro && view==='financeiro' && (
          <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-8">
            <h2 className="font-display text-3xl font-extrabold mb-6">Financeiro</h2>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
              {[
                {label:'Faturamento mês', value:`R$ ${financeData.faturamento.toFixed(2)}`, icon:DollarSign},
                {label:'Recebido', value:`R$ ${financeData.recebido.toFixed(2)}`, icon:Check},
                {label:'A receber', value:`R$ ${financeData.aReceber.toFixed(2)}`, icon:Wallet},
                {label:'Serviços', value:`${financeData.count}`, icon:Package},
                {label:'Ticket médio', value:`R$ ${financeData.ticket.toFixed(2)}`, icon:Award},
              ].map(c=>(
                <div key={c.label} className="card-glass rounded-[18px] p-4">
                  <div className="flex items-center justify-between"><div className="text-[11px] text-white/50 tracking-wide font-bold">{c.label.toUpperCase()}</div><c.icon className="w-4 h-4 text-[#d4af37]" /></div>
                  <div className="mt-2 font-display font-extrabold text-[18px]">{c.value}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mb-6">
              <select value={financeFilterMonth} onChange={e=> setFinanceFilterMonth(Number(e.target.value))} className="h-10 rounded-full bg-[#141414] border border-white/10 px-4 text-sm">
                {Array.from({length:12},(_,i)=><option key={i} value={i}>{new Date(0,i).toLocaleString('pt-BR',{month:'long'})}</option>)}
              </select>
            </div>
            <div className="card-glass rounded-[20px] p-5 mb-8">
              <div className="text-sm font-bold mb-4">Faturamento por dia</div>
              <div className="flex items-end gap-1 h-[120px]">
                {financeData.chart.length? financeData.chart.map(([day,val])=>{
                  const max = Math.max(...financeData.chart.map(([,v])=> v as number),1);
                  const h = Math.max(8,(Number(val)/max)*100);
                  return <div key={day} className="flex-1 flex flex-col items-center gap-1"><div className="w-full rounded-t-lg gold-bg" style={{height:`${h}%`}} /><span className="text-[10px] text-white/40">{day}</span></div>;
                }): <div className="text-xs text-white/40">Sem dados neste mês</div>}
              </div>
            </div>
            <div className="card-glass rounded-[20px] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#141414] text-white/50 text-[11px] tracking-widest"><tr><th className="text-left px-4 py-3">DATA</th><th className="text-left px-4 py-3">CLIENTE</th><th className="text-left px-4 py-3">SERVIÇO</th><th className="text-left px-4 py-3">VALOR</th><th className="text-left px-4 py-3">PAGTO</th><th className="text-left px-4 py-3">STATUS</th></tr></thead>
                  <tbody>
                    {financeData.monthApps.map(a=>(
                      <tr key={a.id} className="border-t border-white/5"><td className="px-4 py-3 text-white/70">{a.date}</td><td className="px-4 py-3 font-medium">{a.client.nome}</td><td className="px-4 py-3 text-white/60 max-w-[200px] truncate">{a.items.map(i=> i.service.name).join(', ')}</td><td className="px-4 py-3 font-bold">R$ {a.total.toFixed(2)}</td><td className="px-4 py-3">{a.payment}</td><td className="px-4 py-3"><span className={`text-[10px] px-2 py-1 rounded-full font-bold ${a.status==='concluido'?'bg-green-500/20 text-green-300':'bg-white/10 text-white/60'}`}>{a.status.toUpperCase()}</span></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {isPro && view==='clientes' && (
          <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-8">
            <h2 className="font-display text-3xl font-extrabold mb-6">Meus Clientes (PRO)</h2>
            <div className="relative max-w-[400px] mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar cliente por nome ou telefone" className="w-full h-11 pl-10 pr-4 rounded-full bg-[#141414] border border-white/10 text-sm" />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {clients.filter(c=>{
                const q = normalize(search); if(!q) return true; return normalize(`${c.nome} ${c.sobrenome} ${c.telefone}`).includes(q);
              }).map(c=>{
                const apps = appointments.filter(a=> a.client.id===c.id || a.client.telefone===c.telefone);
                const total = apps.reduce((s,a)=> s+a.total,0);
                return (
                  <div key={c.id} className="card-glass rounded-[18px] p-4">
                    <div className="flex items-start justify-between">
                      <div><div className="font-bold">{c.nome} {c.sobrenome}</div><div className="text-xs text-white/60 mt-1 flex items-center gap-1"><Phone className="w-3 h-3" />{c.telefone}</div><div className="text-xs text-white/40 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{c.endereco}, {c.numero} - {c.bairro}</div></div>
                      <button onClick={()=>setSelectedClient(c)} className="h-8 px-3 rounded-full bg-white text-black text-xs font-bold">HISTÓRICO</button>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                      <div className="bg-[#141414] rounded-xl p-2"><div className="text-[10px] text-white/40">SERVIÇOS</div><div className="font-bold text-sm">{apps.length}</div></div>
                      <div className="bg-[#141414] rounded-xl p-2"><div className="text-[10px] text-white/40">TOTAL GASTO</div><div className="font-bold text-sm">R$ {total.toFixed(0)}</div></div>
                      <div className="bg-[#141414] rounded-xl p-2"><div className="text-[10px] text-white/40">ÚLTIMO</div><div className="font-bold text-[11px]">{apps[0]?.date||'-'}</div></div>
                    </div>
                    <a href={`https://wa.me/55${c.telefone.replace(/\D/g,'')}?text=${encodeURIComponent(`Olá ${c.nome}! Aqui é Sousa Montagens.`)}`} target="_blank" rel="noopener" className="mt-3 w-full h-9 rounded-full bg-[#1a1a1a] gold-border grid place-items-center text-xs font-bold flex items-center gap-2 justify-center"><MessageCircle className="w-4 h-4 text-[#d4af37]" /> ABRIR WHATSAPP</a>
                  </div>
                );
              })}
            </div>
            {clients.length===0 && <div className="text-center py-16 text-white/30 text-sm">Nenhum cliente ainda.</div>}
          </div>
        )}

        {isPro && view==='config' && (
          <div className="max-w-[720px] mx-auto px-4 md:px-6 py-8">
            <h2 className="font-display text-3xl font-extrabold mb-6">Configurações (PRO)</h2>
            <div className="card-glass rounded-[20px] p-6 space-y-4">
              <div className="flex items-center gap-3 mb-2"><Settings className="w-5 h-5 text-[#d4af37]" /><span className="font-bold">Dados Profissional</span></div>
              <div className="grid md:grid-cols-2 gap-3">
                <div><label className="text-[11px] text-white/50 font-bold tracking-wide">CHAVE PIX</label><input value={config.pixKey} onChange={e=>setConfig({...config, pixKey:e.target.value})} className="mt-1 w-full h-11 px-4 rounded-xl bg-[#0f0f0f] border border-white/10 text-sm" /></div>
                <div><label className="text-[11px] text-white/50 font-bold tracking-wide">NOME PIX</label><input value={config.pixName} onChange={e=>setConfig({...config, pixName:e.target.value})} className="mt-1 w-full h-11 px-4 rounded-xl bg-[#0f0f0f] border border-white/10 text-sm" /></div>
                <div><label className="text-[11px] text-white/50 font-bold tracking-wide">BANCO</label><input value={config.pixBank} onChange={e=>setConfig({...config, pixBank:e.target.value})} className="mt-1 w-full h-11 px-4 rounded-xl bg-[#0f0f0f] border border-white/10 text-sm" /></div>
                <div><label className="text-[11px] text-white/50 font-bold tracking-wide">HORÁRIO ATENDIMENTO</label><input value={config.atendimento} onChange={e=>setConfig({...config, atendimento:e.target.value})} className="mt-1 w-full h-11 px-4 rounded-xl bg-[#0f0f0f] border border-white/10 text-sm" /></div>
              </div>
              <div><label className="text-[11px] text-white/50 font-bold tracking-wide">MENSAGEM WHATSAPP PADRÃO</label><textarea value={config.whatsappMsg} onChange={e=> setConfig({...config, whatsappMsg:e.target.value})} className="mt-1 w-full h-24 p-3 rounded-xl bg-[#0f0f0f] border border-white/10 text-sm" /></div>
              <button onClick={()=>showToast('Configurações salvas!')} className="h-11 px-6 rounded-full btn-gold text-sm font-bold">SALVAR CONFIGURAÇÕES</button>
            </div>
          </div>
        )}

        {!isPro && ['orcamentos','agendamentos','avaliacoes','financeiro','clientes','config'].includes(view) && (
          <div className="max-w-[600px] mx-auto px-4 py-20 text-center">
            <div className="card-glass rounded-[24px] p-8">
              <Lock className="w-10 h-10 mx-auto text-[#d4af37]" />
              <h3 className="font-display font-bold text-xl mt-4">Área Profissional Protegida</h3>
              <p className="text-sm text-white/60 mt-2">Esta área é exclusiva do montador. Use a senha para acessar.</p>
              <button onClick={handleAttemptPro} className="mt-6 h-11 px-8 rounded-full btn-gold text-sm font-bold">DIGITAR SENHA (8302)</button>
              <div className="mt-4"><button onClick={()=>setView('inicio')} className="text-xs text-white/50 underline">Voltar ao início</button></div>
            </div>
          </div>
        )}
      </main>

      {showRequest && (
        <div className="fixed inset-0 z-[80] flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-[6px]" onClick={()=>setShowRequest(false)} />
          <div className="relative w-full max-w-[760px] max-h-[96vh] md:max-h-[92vh] overflow-hidden rounded-t-[28px] md:rounded-[28px] bg-[#101010] border border-white/10 flex flex-col">
            <div className="p-5 md:p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="font-display font-extrabold text-xl">Solicitar Montagem</div>
                  <span className="px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/25 text-[10px] font-bold tracking-widest text-[#f5d76e]">✓ SEM PAGAMENTO ANTECIPADO</span>
                </div>
                <div className="text-xs text-white/50 mt-1">Passo {requestStep>6?6:requestStep} de 6 • {['Dados cliente','Endereço completo','Serviços + Combo 10% OFF','Pagamento pós-serviço','Data e horário','Resumo e envio'][Math.min(requestStep,6)-1]}</div>
                <div className="mt-3 flex gap-1.5">
                  {[1,2,3,4,5,6].map(s=> <div key={s} className={`h-1.5 rounded-full transition-all ${s <= (requestStep>6?6:requestStep) ? 'bg-[#d4af37] w-8':'bg-white/15 w-6'}`} />)}
                </div>
                <div className="mt-2 text-[11px] text-[#f5d76e]/80 bg-[#d4af37]/10 border border-[#d4af37]/15 rounded-lg px-2 py-1 inline-block">Você não paga nada antes. Pagamento somente após conclusão do serviço</div>
              </div>
              <button onClick={()=>setShowRequest(false)} className="w-9 h-9 rounded-full bg-white/10 grid place-items-center ml-3"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 md:p-6">
              {requestStep===1 && (
                <div className="grid md:grid-cols-2 gap-3">
                  <input placeholder="Nome *" value={reqClient.nome||''} onChange={e=>setReqClient({...reqClient, nome:e.target.value})} className="h-12 px-4 rounded-xl bg-[#181818] border border-white/10 text-sm focus:border-[#d4af37]/40 outline-none" />
                  <input placeholder="Sobrenome" value={reqClient.sobrenome||''} onChange={e=>setReqClient({...reqClient, sobrenome:e.target.value})} className="h-12 px-4 rounded-xl bg-[#181818] border border-white/10 text-sm" />
                  <input placeholder="Telefone * (ex: 18991488302)" value={reqClient.telefone||''} onChange={e=>setReqClient({...reqClient, telefone:e.target.value})} className="h-12 px-4 rounded-xl bg-[#181818] border border-white/10 text-sm" />
                  <input placeholder="WhatsApp" value={reqClient.whatsapp||''} onChange={e=>setReqClient({...reqClient, whatsapp:e.target.value})} className="h-12 px-4 rounded-xl bg-[#181818] border border-white/10 text-sm" />
                </div>
              )}
              {requestStep===2 && (
                <div className="grid md:grid-cols-2 gap-3">
                  <input placeholder="CEP *" value={reqClient.cep||''} onChange={e=>setReqClient({...reqClient, cep:e.target.value})} className="h-12 px-4 rounded-xl bg-[#181818] border border-white/10 text-sm" />
                  <input placeholder="Rua / Avenida *" value={reqClient.endereco||''} onChange={e=>setReqClient({...reqClient, endereco:e.target.value})} className="h-12 px-4 rounded-xl bg-[#181818] border border-white/10 text-sm md:col-span-2" />
                  <input placeholder="Número *" value={reqClient.numero||''} onChange={e=>setReqClient({...reqClient, numero:e.target.value})} className="h-12 px-4 rounded-xl bg-[#181818] border border-white/10 text-sm" />
                  <input placeholder="Bairro *" value={reqClient.bairro||''} onChange={e=>setReqClient({...reqClient, bairro:e.target.value})} className="h-12 px-4 rounded-xl bg-[#181818] border border-white/10 text-sm" />
                  <input placeholder="Complemento (apto, bloco)" value={reqClient.complemento||''} onChange={e=>setReqClient({...reqClient, complemento:e.target.value})} className="h-12 px-4 rounded-xl bg-[#181818] border border-white/10 text-sm" />
                  <input placeholder="Cidade *" value={reqClient.cidade||''} onChange={e=>setReqClient({...reqClient, cidade:e.target.value})} className="h-12 px-4 rounded-xl bg-[#181818] border border-white/10 text-sm" />
                  <input placeholder="Estado *" value={reqClient.estado||''} onChange={e=>setReqClient({...reqClient, estado:e.target.value})} className="h-12 px-4 rounded-xl bg-[#181818] border border-white/10 text-sm" />
                  <input placeholder="Ponto de referência" value={reqClient.referencia||''} onChange={e=>setReqClient({...reqClient, referencia:e.target.value})} className="h-12 px-4 rounded-xl bg-[#181818] border border-white/10 text-sm md:col-span-2" />
                </div>
              )}
              {requestStep===3 && (
                <div>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input value={reqSearch} onChange={e=>setReqSearch(e.target.value)} placeholder="Busca inteligente: guarda-roupa, rack, armario aereo, painel, desmontagem..." className="w-full h-12 pl-10 pr-4 rounded-xl bg-[#181818] border border-white/10 text-sm" />
                  </div>
                  <div className="text-[11px] text-white/40 mb-3">Busca ignora acento, vírgula e hífen • Ex: guarda roupa, armario aereo, rack com painel</div>
                  {reqSearch && (
                    <div className="grid gap-2 mb-4">
                      {filteredServicesForRequest.map(s=>{
                        const comboPrice = s.category!=='DESMONTAGENS' ? ((s.price + Math.max(40,s.price-20))*0.9) : null;
                        return (
                          <button key={s.id} onClick={()=>{
                            setReqItems(prev=>{
                              const ex = prev.find(p=> p.service.id===s.id && !p.isCombo);
                              if(ex) return prev.map(p=> p.service.id===s.id && !p.isCombo ? {...p, qty:p.qty+1}:p);
                              return [...prev, {service:s, qty:1}];
                            });
                            setReqSearch('');
                          }} className="text-left p-3 rounded-xl bg-[#1e1e1e] border border-white/10 flex justify-between hover:border-[#d4af37]/30 w-full">
                            <div><div className="text-sm font-semibold">{s.name}</div><div className="text-xs text-white/50">{s.category} • {s.time} {comboPrice?`• DESMONTAGEM + REMONTAGEM • 10% OFF R$ ${comboPrice.toFixed(0)}`:''}</div></div>
                            <div className="font-bold text-[#d4af37]">R$ {s.price}</div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <div className="space-y-2">
                    {reqItems.map((it,idx)=>(
                      <div key={idx} className="bg-[#181818] rounded-xl p-3 border border-white/10">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium pr-2">{it.service.name} {it.isCombo && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#f5d76e] ml-1">DESMONTAGEM + REMONTAGEM • 10% OFF</span>}</div>
                          <button onClick={()=> setReqItems(prev=> prev.filter((_,i)=> i!==idx))} className="w-8 h-8 rounded-full bg-red-500/20 grid place-items-center"><Trash2 className="w-4 h-4 text-red-400" /></button>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button onClick={()=> setReqItems(prev=> prev.map((p,i)=> i===idx? {...p, qty:Math.max(1,p.qty-1)}:p))} className="w-8 h-8 rounded-full bg-white/10">-</button>
                            <span className="w-8 text-center">{it.qty}</span>
                            <button onClick={()=> setReqItems(prev=> prev.map((p,i)=> i===idx? {...p, qty:p.qty+1}:p))} className="w-8 h-8 rounded-full bg-white/10">+</button>
                            <span className="ml-2 text-xs text-white/60">x QUANTIDADE</span>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-white/40">Subtotal: Qtd x Valor</div>
                            <div className="font-bold text-sm">R$ {calcItemSubtotal(it).toFixed(2).replace('.',',')}</div>
                          </div>
                        </div>
                        {it.service.category!=='DESMONTAGENS' && (
                          <label className="mt-2 flex items-center gap-2 text-xs cursor-pointer">
                            <input type="checkbox" checked={!!it.isCombo} onChange={e=> setReqItems(prev=> prev.map((p,i)=> i===idx? {...p, isCombo:e.target.checked}:p))} className="accent-[#d4af37]" />
                            <span className="text-[#d4af37] font-bold">DESMONTAGEM + REMONTAGEM • 10% OFF</span>
                            <span className="text-white/50">• R$ {((it.service.price + Math.max(40,it.service.price-20))*0.9*it.qty).toFixed(2)} ao invés de R$ {(it.service.price + Math.max(40,it.service.price-20))*it.qty}</span>
                          </label>
                        )}
                      </div>
                    ))}
                    {reqItems.length===0 && <div className="text-center py-8 text-white/40 text-sm">Nenhum serviço selecionado. Busque acima e adicione. Permite múltiplos itens.</div>}
                  </div>
                  <div className="mt-4 grid md:grid-cols-2 gap-3">
                    <input type="number" placeholder="Taxa deslocamento opcional (R$)" value={reqDesloc||''} onChange={e=> setReqDesloc(Number(e.target.value)||0)} className="h-11 px-4 rounded-xl bg-[#0f0f0f] border border-white/10 text-sm" />
                    <input placeholder="Observações (ex: tem elevador, 3º andar)" value={reqObs} onChange={e=>setReqObs(e.target.value)} className="h-11 px-4 rounded-xl bg-[#0f0f0f] border border-white/10 text-sm" />
                  </div>
                  {reqItems.length>0 && (
                    <div className="mt-4 card-glass rounded-xl p-3">
                      <div className="flex justify-between text-sm"><span className="text-white/50">Subtotal (Qtd x Valor)</span><span className="font-bold">R$ {totalRequestSubtotal.toFixed(2).replace('.',',')}</span></div>
                      <div className="flex justify-between text-sm mt-1"><span className="text-white/50">Deslocamento</span><span>R$ {(reqDesloc||0).toFixed(2).replace('.',',')}</span></div>
                      <div className="flex justify-between text-[16px] font-extrabold mt-2 pt-2 border-t border-white/10"><span>TOTAL GERAL</span><span className="gold-gradient">R$ {totalRequest.toFixed(2).replace('.',',')}</span></div>
                      <div className="text-[11px] text-white/40 mt-1">Cálculo automático QUANTIDADE x VALOR = SUBTOTAL • Total em tempo real</div>
                    </div>
                  )}
                </div>
              )}
              {requestStep===4 && (
                <div className="grid gap-3">
                  <div className="text-sm font-bold mb-1">FORMA DE PAGAMENTO • Apenas informativo, NÃO cobra agora</div>
                  <div className="p-3 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/20 text-xs text-[#f5d76e]">Você não paga nada antes. Pagamento somente após conclusão do serviço.</div>
                  {[
                    {k:'PIX', desc:`Chave: ${config.pixKey} • ${config.pixBank} • Pagamento APÓS serviço concluído`, icon:Wallet},
                    {k:'DINHEIRO', desc:'Pagamento no local após conclusão e conferência', icon:DollarSign},
                  ].map(o=>(
                    <button key={o.k} onClick={()=>setReqPayment(o.k as any)} className={`text-left p-4 rounded-2xl border flex items-center gap-3 transition ${reqPayment===o.k?'bg-[#d4af37]/10 border-[#d4af37]/40':'bg-[#181818] border-white/10'}`}>
                      <div className={`w-10 h-10 rounded-full grid place-items-center ${reqPayment===o.k?'gold-bg':'bg-white/10'}`}><o.icon className={`w-5 h-5 ${reqPayment===o.k?'text-black':'text-white/70'}`} /></div>
                      <div className="flex-1"><div className="font-bold text-sm">{o.k} - APÓS SERVIÇO</div><div className="text-xs text-white/60">{o.desc}</div></div>
                      {reqPayment===o.k && <Check className="w-5 h-5 text-[#d4af37]" />}
                    </button>
                  ))}
                </div>
              )}
              {requestStep===5 && (
                <div>
                  <div className="text-sm font-bold mb-3">DATA DO SERVIÇO *</div>
                  <input type="date" value={reqDate} onChange={e=>setReqDate(e.target.value)} min={new Date().toISOString().slice(0,10)} className="w-full h-12 px-4 rounded-xl bg-[#181818] border border-white/10 text-sm" />
                  <div className="text-sm font-bold mt-6 mb-3">HORÁRIO PREFERENCIAL *</div>
                  <div className="grid grid-cols-3 gap-2">
                    {times.map(t=>{
                      const occupied = reqDate && isTimeOccupied(reqDate, t);
                      return <button key={t} disabled={!!occupied} onClick={()=>setReqTime(t)} className={`h-12 rounded-xl border text-sm font-bold transition ${occupied?'bg-red-500/10 border-red-500/20 text-red-300/50 cursor-not-allowed': reqTime===t?'gold-bg text-black border-transparent':'bg-[#181818] border-white/10 hover:border-white/20'}`}>{t} {occupied && '• Ocupado'}</button>;
                    })}
                  </div>
                  <div className="mt-4 text-xs text-white/40">Calendário bloqueia horários já ocupados automaticamente • Atendimento {config.atendimento}</div>
                </div>
              )}
              {requestStep===6 && (
                <div className="space-y-4">
                  <div className="card-glass rounded-2xl p-4">
                    <div className="text-[11px] tracking-widest text-[#d4af37] font-bold mb-2">RESUMO COMPLETO • Conferência final</div>
                    <div className="space-y-3 text-sm">
                      <div><span className="text-white/50">CLIENTE:</span> <span className="font-semibold">{reqClient.nome} {reqClient.sobrenome} • Tel {reqClient.telefone} / Whats {reqClient.whatsapp||reqClient.telefone}</span></div>
                      <div><span className="text-white/50">ENDEREÇO COMPLETO:</span><div className="font-semibold mt-1 bg-[#0f0f0f] rounded-lg p-2">{reqClient.endereco}, {reqClient.numero} - {reqClient.bairro}<br/>{reqClient.cidade}/{reqClient.estado} - CEP {reqClient.cep}<br/>Comp: {reqClient.complemento} • Ref: {reqClient.referencia}</div></div>
                      <div><span className="text-white/50">SERVIÇOS:</span><div className="mt-2 space-y-1">{reqItems.map((it,i)=> <div key={i} className="flex justify-between bg-[#181818] rounded-lg px-3 py-2"><span>{it.service.name}{it.isCombo?' (Desm.+Remont. 10% OFF)':''} x{it.qty}</span><span className="font-bold">R$ {calcItemSubtotal(it).toFixed(2)}</span></div>)}</div>
                        <div className="mt-2 space-y-1 text-xs"><div className="flex justify-between"><span>Subtotal</span><span>R$ {totalRequestSubtotal.toFixed(2)}</span></div><div className="flex justify-between"><span>Deslocamento</span><span>R$ {(reqDesloc||0).toFixed(2)}</span></div><div className="flex justify-between font-bold text-base pt-1 border-t border-white/10"><span>TOTAL GERAL</span><span>R$ {totalRequest.toFixed(2)}</span></div></div>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-white/10"><span className="text-white/50">DATA/HORÁRIO:</span> <span className="font-bold">{reqDate} às {reqTime}</span></div>
                      <div className="flex justify-between"><span className="text-white/50">PAGAMENTO:</span> <span className="font-bold">{reqPayment} - APÓS serviço</span></div>
                      {reqObs && <div className="text-xs bg-[#0f0f0f] rounded-lg p-2">Obs: {reqObs}</div>}
                    </div>
                  </div>
                  <div className="bg-[#d4af37]/10 border border-[#d4af37]/20 rounded-xl p-3 text-xs text-[#f5d76e]">✓ Sem pagamento antecipado • Pagamento somente após conclusão • Você será direcionado ao WhatsApp do montador (18) 99148-8302</div>
                </div>
              )}
              {requestStep===7 && requestSent && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 rounded-full gold-bg mx-auto grid place-items-center"><CheckCircle2 className="w-10 h-10 text-black" /></div>
                  <div className="font-display font-extrabold text-2xl mt-6">Orçamento enviado!</div>
                  <div className="text-sm text-white/70 mt-3 max-w-[420px] mx-auto">O montador entrará em contato. Protocolo <span className="font-mono font-bold text-[#d4af37]">{requestSent.protocol}</span><br/>Você só paga após o serviço concluído.</div>
                  <div className="mt-6 flex gap-2 justify-center">
                    <button onClick={()=>{ setShowRequest(false); setView('meus-agendamentos'); setClientPhoneLookup(reqClient.telefone||''); }} className="h-11 px-6 rounded-full bg-white text-black text-sm font-bold">VER MEUS AGENDAMENTOS</button>
                    <button onClick={()=>setShowRequest(false)} className="h-11 px-6 rounded-full bg-[#1a1a1a] border border-white/10 text-sm font-bold">FECHAR</button>
                  </div>
                </div>
              )}
            </div>

            {requestStep<7 && (
              <div className="p-5 md:p-6 border-t border-white/10 flex justify-between gap-3">
                <button onClick={()=>setRequestStep(s=> Math.max(1,s-1))} disabled={requestStep===1} className="h-12 px-6 rounded-full bg-[#1a1a1a] border border-white/10 text-sm font-bold disabled:opacity-30">VOLTAR</button>
                {requestStep<6 ? (
                  <button onClick={()=>setRequestStep(s=> Math.min(6,s+1))} className="h-12 px-8 rounded-full btn-gold text-sm flex items-center gap-2">AVANÇAR <ChevronRight className="w-4 h-4" /></button>
                ) : (
                  <button onClick={handleSendWhatsApp} className="h-12 px-6 rounded-full btn-gold text-sm font-extrabold flex items-center gap-2"><MessageCircle className="w-5 h-5" /> ENVIAR PARA O MONTADOR VIA WHATSAPP</button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/80 backdrop-blur" onClick={()=>setShowPasswordModal(false)} />
          <div className="relative w-full max-w-[380px] rounded-[24px] bg-[#101010] border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-5"><div className="w-10 h-10 rounded-full gold-bg grid place-items-center"><Lock className="w-5 h-5 text-black" /></div><div><div className="font-bold">Acesso Profissional</div><div className="text-xs text-white/50">Digite a senha para acessar painel PRO</div></div></div>
            <input type="password" value={passwordInput} onChange={e=>setPasswordInput(e.target.value)} onKeyDown={e=> e.key==='Enter' && handlePasswordSubmit()} placeholder="Senha: 8302" className="w-full h-12 px-4 rounded-xl bg-[#181818] border border-white/10 text-sm focus:border-[#d4af37]/40 outline-none" autoFocus />
            <div className="mt-4 flex gap-2">
              <button onClick={handlePasswordSubmit} className="flex-1 h-11 rounded-full btn-gold text-sm font-bold">ENTRAR</button>
              <button onClick={()=>setShowPasswordModal(false)} className="h-11 px-5 rounded-full bg-[#1a1a1a] border border-white/10 text-sm">CANCELAR</button>
            </div>
            <div className="mt-3 text-[11px] text-white/30 text-center">Área escondida • Apenas montador</div>
          </div>
        </div>
      )}

      {showReviewModal && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur" onClick={()=>setShowReviewModal(null)} />
          <div className="relative w-full max-w-[520px] rounded-[24px] bg-[#101010] border border-white/10 p-6">
            <div className="flex justify-between items-start">
              <div><div className="font-bold text-lg flex items-center gap-2"><Star className="w-5 h-5 text-[#d4af37]" /> Avaliar Serviço</div><div className="text-xs text-white/50 mt-1">{showReviewModal.protocol} • {showReviewModal.items.map(i=> i.service.name).join(', ')}</div></div>
              <button onClick={()=>setShowReviewModal(null)} className="w-8 h-8 rounded-full bg-white/10 grid place-items-center"><X className="w-4 h-4" /></button>
            </div>
            <div className="mt-6">
              <div className="text-sm font-bold mb-3">Sua nota (1=ruim, 5=excelente)</div>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(st=>(
                  <button key={st} onClick={()=>setReviewRating(st)} className={`w-12 h-12 rounded-full border grid place-items-center transition ${reviewRating>=st?'gold-bg border-transparent':'bg-[#1a1a1a] border-white/10'}`}>
                    <Star className={`w-6 h-6 ${reviewRating>=st?'text-black fill-black':'text-white/30'}`} />
                  </button>
                ))}
              </div>
              <div className="mt-2 text-xs text-white/50">{reviewRating===1?'Ruim': reviewRating===2?'Regular': reviewRating===3?'Bom': reviewRating===4?'Muito bom':'Excelente'}</div>
            </div>
            <div className="mt-6">
              <div className="text-sm font-bold mb-2">Conte como foi sua experiência...</div>
              <textarea value={reviewComment} onChange={e=>setReviewComment(e.target.value)} placeholder="Ex: Profissional pontual, montagem perfeita, super recomendo..." className="w-full h-28 p-3 rounded-xl bg-[#0f0f0f] border border-white/10 text-sm resize-none focus:border-[#d4af37]/30 outline-none" />
            </div>
            <div className="mt-6 flex gap-2">
              <button onClick={handleReviewSubmit} className="flex-1 h-12 rounded-full btn-gold text-sm font-bold">ENVIAR AVALIAÇÃO</button>
              <button onClick={()=>setShowReviewModal(null)} className="h-12 px-6 rounded-full bg-[#1a1a1a] border border-white/10 text-sm">CANCELAR</button>
            </div>
          </div>
        </div>
      )}

      {showQuoteView && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur" onClick={()=>setShowQuoteView(null)} />
          <div className="relative w-full max-w-[720px] max-h-[90vh] overflow-auto rounded-[24px] bg-[#f9f6ef] text-[#0a0a0a] p-6 md:p-8">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3"><div className="w-12 h-12 rounded-xl bg-[#0a0a0a] grid place-items-center"><Hammer className="w-6 h-6 text-[#d4af37]" /></div><div><div className="font-display font-extrabold tracking-widest">SOUSA MONTAGENS</div><div className="text-[10px] tracking-[0.2em] font-bold text-[#b8941f]">MONTADOR DE MÓVEIS PREMIUM</div></div></div>
              <button onClick={()=>setShowQuoteView(null)} className="w-8 h-8 rounded-full bg-black/10 grid place-items-center"><X className="w-4 h-4" /></button>
            </div>
            <div className="mt-6 grid md:grid-cols-2 gap-6 text-sm">
              <div><div className="font-bold text-xs tracking-widest opacity-60">CLIENTE</div><div className="mt-1 font-semibold">{showQuoteView.client.nome} {showQuoteView.client.sobrenome}</div><div className="opacity-70">{showQuoteView.client.telefone}</div></div>
              <div className="text-right"><div className="font-bold">{showQuoteView.number}</div><div className="opacity-60 text-xs mt-1">{showQuoteView.date}</div><div className="mt-2 inline-flex px-3 py-1 rounded-full bg-black text-white text-[10px] font-bold">{showQuoteView.status.toUpperCase()}</div></div>
            </div>
            <div className="mt-6 border-t border-black/10 pt-4">
              {showQuoteView.items.map((it,i)=>(<div key={i} className="flex justify-between py-2.5 text-sm border-b border-black/5 last:border-0"><div><div className="font-semibold">{it.service.name}</div><div className="text-xs opacity-60">{it.service.category} • Qtd {it.qty}</div></div><div className="font-bold">R$ {it.subtotal.toFixed(2)}</div></div>))}
            </div>
            <div className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between"><span className="opacity-60">Deslocamento</span><span>R$ {showQuoteView.deslocamento.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="opacity-60">Desconto</span><span>- R$ {showQuoteView.desconto.toFixed(2)}</span></div>
              <div className="flex justify-between font-extrabold text-lg pt-2 border-t border-black/10"><span>TOTAL</span><span>R$ {showQuoteView.total.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      )}

      {selectedClient && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur" onClick={()=>setSelectedClient(null)} />
          <div className="relative w-full max-w-[640px] max-h-[85vh] overflow-auto rounded-[24px] bg-[#101010] border border-white/10 p-6">
            <div className="flex justify-between items-start"><div><div className="font-bold text-lg">{selectedClient.nome} {selectedClient.sobrenome}</div><div className="text-sm text-white/60">{selectedClient.telefone} • {selectedClient.endereco}</div></div><button onClick={()=>setSelectedClient(null)} className="w-8 h-8 rounded-full bg-white/10 grid place-items-center"><X className="w-4 h-4" /></button></div>
            <div className="mt-6 space-y-3">
              <div className="text-xs font-bold tracking-widest text-[#d4af37]">HISTÓRICO DE AGENDAMENTOS</div>
              {appointments.filter(a=> a.client.id===selectedClient.id || a.client.telefone===selectedClient.telefone).map(a=>(
                <div key={a.id} className="bg-[#181818] rounded-xl p-3 text-sm flex justify-between"><span>{a.date} {a.time} • {a.items.map(i=> i.service.name).join(', ')}</span><span className="font-bold">R$ {a.total}</span></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] px-5 h-12 rounded-full bg-white text-black text-sm font-bold shadow-[0_12px_40px_rgba(0,0,0,0.4)] flex items-center gap-2" style={{animation:'slideUp .3s ease'}}>
          <div className="w-6 h-6 rounded-full gold-bg grid place-items-center"><Check className="w-4 h-4 text-black" /></div>{toast}
        </div>
      )}


      {/* BOTAO FLUTUANTE DOWNLOAD APP - FIXO */}
      <div id="pwa-install-container" className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 items-end">
        <div id="pwa-bubble" className="hidden bg-[#101010] border border-[#d4af37]/30 text-white p-3 rounded-2xl text-[13px] max-w-[240px] shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="font-black text-[#d4af37] mb-1">📲 Instale nosso app!</div>
          <div className="opacity-80 text-xs leading-snug">Acesso rápido e ganhe 10% OFF no app!</div>
        </div>
        <button id="pwa-install-btn" className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-[#f5d76e] to-[#d4af37] border-none shadow-[0_8px_24px_rgba(212,175,55,0.4)] grid place-items-center cursor-pointer animate-pulse">
          <span className="text-[28px]">📲</span>
        </button>
      </div>

      <footer className="border-t border-white/10 py-8 text-center text-[11px] text-white/30 tracking-wide">
        SOUSA MONTAGENS • Montador Premium • Assis • Tarumã • Região • (18) 99148-8302 • Sem pagamento antecipado • Pague só após serviço • Design preto & dourado premium
      </footer>
    </div>
  );
}
