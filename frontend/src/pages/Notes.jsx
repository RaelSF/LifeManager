import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Plus, Search, Trash2, Save, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function Notes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [activeNote, setActiveNote] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // States for active Note copy
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    async function loadNotes() {
      try {
        const data = await api.get('/notes/');
        setNotes(data.sort((a,b) => new Date(b.updated_at) - new Date(a.updated_at)));
      } catch(err) {
        toast.error("Erro ao carregar as notas.");
      } finally {
        setLoading(false);
      }
    }
    loadNotes();
  }, []);

  const openNote = (note) => {
    setActiveNote(note);
    setTitle(note.title);
    setContent(note.content || '');
  };

  const handleCreateNote = async () => {
    try {
      const newNote = await api.post('/notes/', {
        title: 'Nova Nota',
        content: '',
        color: '#ffffff'
      });
      setNotes([newNote, ...notes]);
      openNote(newNote);
      toast.success("Nota criada com sucesso!");
    } catch(err) {
      toast.error("Erro ao criar nova nota.");
    }
  };

  const handleSave = async () => {
    if (!activeNote) return;
    setIsSaving(true);
    try {
      const updated = await api.patch(`/notes/${activeNote.id}`, {
        title,
        content
      });
      setNotes(notes.map(n => n.id === updated.id ? updated : n));
      setActiveNote(updated);
      toast.success("Alterações salvas.");
    } catch(err) {
      toast.error("Falha ao salvar as modificações.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Certeza que deseja escluir esta nota?")) return;
    
    try {
      await api.delete(`/notes/${id}`);
      setNotes(notes.filter(n => n.id !== id));
      if (activeNote?.id === id) {
        setActiveNote(null);
      }
      toast.success("Nota excluída permanente.");
    } catch(err) {
      toast.error("Falha ao excluir.");
    }
  };

  const filteredNotes = notes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/60 rounded-2xl h-[calc(100vh-10rem)] shadow-sm ring-1 ring-zinc-900/5 dark:ring-white/10 overflow-hidden">
      
      {/* Sidebar List */}
      <div className="w-1/3 min-w-[250px] border-r border-zinc-200 dark:border-zinc-800/60 flex flex-col bg-zinc-50/50 dark:bg-zinc-900/20">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800/60">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">Anotações</h2>
            <button 
              onClick={handleCreateNote}
              className="p-2 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-full transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <input 
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 pl-9 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-zinc-900 dark:text-zinc-100"
              placeholder="Buscar notas..."
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
             <div className="flex items-center justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-zinc-400" /></div>
          ) : filteredNotes.length === 0 ? (
             <div className="text-center text-zinc-500 py-10 text-sm">Nenhuma nota encontrada.</div>
          ) : (
            <ul className="p-2 space-y-1">
              <AnimatePresence>
                {filteredNotes.map(note => (
                  <motion.li 
                    layout
                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                    key={note.id}
                  >
                    <button 
                      onClick={() => openNote(note)}
                      className={cn(
                        "w-full text-left p-3 rounded-xl transition-all border border-transparent",
                        activeNote?.id === note.id 
                          ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20 shadow-sm" 
                          : "hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                      )}
                    >
                      <h4 className={cn(
                        "font-semibold text-sm truncate",
                        activeNote?.id === note.id ? "text-indigo-700 dark:text-indigo-400" : "text-zinc-900 dark:text-zinc-100"
                      )}>
                        {note.title}
                      </h4>
                      <span className="text-xs text-zinc-500 mt-1 block">
                         {new Date(note.updated_at).toLocaleDateString()}
                      </span>
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-zinc-950/40 relative">
        {activeNote ? (
          <>
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800/60">
              <input 
                 value={title} onChange={e => setTitle(e.target.value)}
                 className="text-xl font-bold bg-transparent outline-none text-zinc-900 dark:text-zinc-50 w-full px-2"
                 placeholder="Título da Nota"
              />
              <div className="flex items-center gap-2 shrink-0 px-2">
                <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30 transition-colors font-medium text-sm">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Salvar
                </button>
                <button onClick={() => handleDelete(activeNote.id)} className="p-1.5 rounded-lg bg-zinc-100 hover:bg-rose-100 text-zinc-500 hover:text-rose-600 dark:bg-zinc-900 dark:hover:bg-rose-500/10 dark:text-zinc-400 dark:hover:text-rose-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto">
              <textarea 
                 value={content} onChange={e => setContent(e.target.value)}
                 className="w-full h-full min-h-[400px] resize-none bg-transparent outline-none text-zinc-700 dark:text-zinc-300 leading-relaxed"
                 placeholder="Comece a escrever seus pensamentos aqui..."
              />
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
               <FileText className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">Selecione uma nota</h3>
            <p className="text-zinc-500 text-sm mt-1 max-w-sm">Escolha uma anotação na barra lateral ou crie uma nova para começar a editar.</p>
          </div>
        )}
      </div>

    </div>
  );
}
