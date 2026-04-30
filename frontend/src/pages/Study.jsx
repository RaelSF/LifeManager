import React, { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { Play, Pause, RotateCcw, Link as LinkIcon, Plus, BookOpen, Coffee, Check, Trash2, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const POMODORO_MINS = 25;
const BREAK_MINS = 5;

export function Study() {
  const [activeTab, setActiveTab] = useState('timer'); // 'timer' | 'materials'
  
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header and Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900/40 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800/60 shadow-sm">
         <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-500" /> Study Hub
            </h2>
            <p className="text-sm text-zinc-500">Mantenha o foco e gerencie seus materiais.</p>
         </div>
         <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl w-full sm:w-auto">
            <button 
              onClick={() => setActiveTab('timer')} 
              className={cn("flex-1 sm:px-6 text-sm font-semibold rounded-lg py-1.5 transition-all outline-none", activeTab === 'timer' ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300")}
            >
              Foco & Timer
            </button>
            <button 
              onClick={() => setActiveTab('materials')} 
              className={cn("flex-1 sm:px-6 text-sm font-semibold rounded-lg py-1.5 transition-all outline-none", activeTab === 'materials' ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300")}
            >
              Materiais
            </button>
         </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'timer' ? <StudyTimer /> : <StudyMaterials />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// -------------------------------------------------------------
// TIMER MODULE
// -------------------------------------------------------------
function StudyTimer() {
  const [mode, setMode] = useState('pomodoro'); // pomodoro | break
  const [timeLeft, setTimeLeft] = useState(POMODORO_MINS * 60);
  const [isActive, setIsActive] = useState(false);
  const [subject, setSubject] = useState('');
  
  const [sessions, setSessions] = useState([]);
  
  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    try {
      const dbSess = await api.get('/study/sessions');
      setSessions(dbSess);
    } catch(e) {}
  }

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(l => l - 1), 1000);
    } else if (isActive && timeLeft === 0) {
      handleComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleComplete = async () => {
    setIsActive(false);
    toast.success("Tempo Esgotado!", { icon: <Clock className="w-5 h-5"/> });
    
    // Save to DB if Pomodoro
    if (mode === 'pomodoro') {
      try {
        const title = subject.trim() || 'Estudo Geral';
        const newSess = await api.post('/study/sessions', {
          subject: title,
          minutes: POMODORO_MINS
        });
        setSessions([newSess, ...sessions]);
        toast.info(`Sessão de ${POMODORO_MINS}m salva! 🚀`);
      } catch(err) {
        toast.error("Erro ao salvar sessão de estudos");
      }
      switchMode('break');
    } else {
      switchMode('pomodoro');
    }
  };

  const switchMode = (m) => {
    setIsActive(false);
    setMode(m);
    setTimeLeft((m === 'pomodoro' ? POMODORO_MINS : BREAK_MINS) * 60);
  };

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft((mode === 'pomodoro' ? POMODORO_MINS : BREAK_MINS) * 60);
  };

  // Math for SVG Circle
  const totalSeconds = (mode === 'pomodoro' ? POMODORO_MINS : BREAK_MINS) * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;
  
  const radius = 110;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const s = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 flex flex-col items-center justify-center bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 p-10 rounded-2xl shadow-sm relative overflow-hidden">
         {/* Background Glows */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
         
         {/* Mode Toggles */}
         <div className="flex gap-4 mb-8 relative z-10">
            <button onClick={() => switchMode('pomodoro')} className={cn("px-4 py-1.5 rounded-full text-sm font-semibold transition-colors", mode === 'pomodoro' ? "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 ring-1 ring-cyan-500/50" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100")}>Foco</button>
            <button onClick={() => switchMode('break')} className={cn("px-4 py-1.5 rounded-full text-sm font-semibold transition-colors flex items-center gap-2", mode === 'break' ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/50" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100")}>
               Pausa <Coffee className="w-3.5 h-3.5" />
            </button>
         </div>
         
         {/* Focus Subject Input */}
         {mode === 'pomodoro' && (
           <input 
             value={subject} onChange={e => setSubject(e.target.value)} 
             placeholder="No que você vai focar agora?"
             className="mb-8 bg-transparent border-b border-dashed border-zinc-300 dark:border-zinc-700 text-center text-lg outline-none focus:border-cyan-500 transition-colors placeholder:text-zinc-400 max-w-sm w-full relative z-10"
           />
         )}

         {/* SVG Timer */}
         <div className="relative flex items-center justify-center mb-8">
            <svg width="280" height="280" className="rotate-[-90deg]">
              <circle cx="140" cy="140" r={radius} stroke="currentColor" strokeWidth={strokeWidth} className="text-zinc-100 dark:text-zinc-800" fill="transparent" />
              <circle cx="140" cy="140" r={radius} stroke="currentColor" strokeWidth={strokeWidth} 
                className={cn("transition-all duration-1000 ease-linear", mode === 'pomodoro' ? 'text-cyan-500' : 'text-emerald-500')} 
                fill="transparent" 
                strokeDasharray={circumference} 
                strokeDashoffset={strokeDashoffset} 
                strokeLinecap="round" 
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-6xl font-black tabular-nums tracking-tighter text-zinc-900 dark:text-white">
                {m}:{s}
              </span>
              <span className="text-sm font-medium uppercase tracking-widest text-zinc-400 mt-2">
                {mode === 'pomodoro' ? 'Foco Profundo' : 'Descanso'}
              </span>
            </div>
         </div>

         {/* Controls */}
         <div className="flex items-center gap-6 relative z-10">
            <button onClick={toggleTimer} className={cn("flex items-center justify-center w-16 h-16 rounded-full text-white shadow-lg transition-transform active:scale-95", mode === 'pomodoro' ? "bg-cyan-600 hover:bg-cyan-500 shadow-cyan-600/30" : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30")}>
               {isActive ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7" />}
            </button>
            <button onClick={resetTimer} className="flex items-center justify-center w-12 h-12 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
               <RotateCcw className="w-5 h-5" />
            </button>
         </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 p-6 flex flex-col">
         <h3 className="font-semibold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
            <Check className="w-4 h-4 text-cyan-500" /> Suas Sessões
         </h3>
         <div className="flex-1 overflow-y-auto space-y-3">
            {sessions.map(s => (
               <div key={s.id} className="flex flex-col bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50">
                  <span className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">{s.subject}</span>
                  <div className="flex justify-between items-center text-xs mt-1 text-zinc-500">
                     <span>{new Date(s.date).toLocaleDateString()} &middot; {new Date(s.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                     <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400">{s.minutes}m focado</span>
                  </div>
               </div>
            ))}
            {sessions.length === 0 && (
              <p className="text-zinc-500 text-sm text-center py-6">Nenhuma sessão registrada. Comece a estudar!</p>
            )}
         </div>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// MATERIALS MODULE
// -------------------------------------------------------------
function StudyMaterials() {
  const [materials, setMaterials] = useState([]);
  const [filter, setFilter] = useState('Todos');
  
  // Form State
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    load()
  }, []);

  async function load() {
    try {
      const data = await api.get('/study/materials');
      setMaterials(data.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch(e) { }
  }

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title || !link) return;
    try {
      const newMat = await api.post('/study/materials', { title, link, category });
      setMaterials([newMat, ...materials]);
      setTitle(''); setLink(''); setCategory('');
      toast.success("Material Adicionado!");
    } catch(err) {
      toast.error("Falha ao salvar material.");
    }
  };

  const handleRemove = async (id) => {
    if(!window.confirm("Remover este material?")) return;
    try {
      await api.delete(`/study/materials/${id}`);
      setMaterials(materials.filter(m => m.id !== id));
      toast.success("Removido!");
    } catch(e) {}
  };

  const categories = ['Todos', ...new Set(materials.map(m => m.category).filter(Boolean))];
  const filtered = filter === 'Todos' ? materials : materials.filter(m => m.category === filter);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      {/* Sidebar de Ações (Formulário) */}
      <div className="lg:col-span-1 space-y-6">
        <div className="rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 p-6">
           <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Adicionar Link</h3>
           <form onSubmit={handleAdd} className="space-y-4">
             <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1 block">Título</label>
                <input required value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ex: Tutorial React" className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500" />
             </div>
             <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1 block">URL (Link)</label>
                <input required type="url" value={link} onChange={e=>setLink(e.target.value)} placeholder="https://..." className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500" />
             </div>
             <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1 block">Categoria</label>
                <input value={category} onChange={e=>setCategory(e.target.value)} placeholder="Ex: Programação" className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500" />
             </div>
             <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg py-2 text-sm font-semibold shadow-md shadow-cyan-600/20 active:scale-95 transition-all">
                Salvar Material
             </button>
           </form>
        </div>

        {/* Filtros */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 p-4">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Categorias</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button 
                key={cat} onClick={() => setFilter(cat)}
                className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-colors", filter === cat ? "bg-cyan-500 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800")}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid de Materiais */}
      <div className="lg:col-span-3">
         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {filtered.map(mat => (
                <motion.div 
                  key={mat.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                  className="group relative rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/60 backdrop-blur-sm border border-zinc-200/80 dark:border-zinc-800/80 p-5 hover:border-cyan-500/50 dark:hover:border-cyan-500/30 transition-colors flex flex-col justify-between shadow-sm overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                  
                  <div className="relative z-10">
                     <div className="flex justify-between items-start mb-3">
                        {mat.category && (
                          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400">
                             {mat.category}
                          </span>
                        )}
                        <button onClick={() => handleRemove(mat.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-zinc-400 hover:text-rose-500">
                          <Trash2 className="w-4 h-4"/>
                        </button>
                     </div>
                     <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1 line-clamp-2">{mat.title}</h4>
                  </div>
                  
                  <a href={mat.link} target="_blank" rel="noreferrer" className="relative z-10 mt-6 flex items-center gap-2 text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300">
                     <LinkIcon className="w-4 h-4" /> Acessar Link
                  </a>
                </motion.div>
              ))}
            </AnimatePresence>
            {filtered.length === 0 && (
              <div className="col-span-full py-16 flex flex-col items-center justify-center text-zinc-500 bg-white/50 dark:bg-zinc-900/20 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                <BookOpen className="w-10 h-10 mb-3 opacity-20" />
                <p>Nenhum material encontrado nesta categoria.</p>
              </div>
            )}
         </div>
      </div>
    </div>
  )
}
