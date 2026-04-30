import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, X, SquareKanban, MoreHorizontal, Loader2, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { cn } from '../lib/utils';

const COLUMNS = {
  todo: { id: 'todo', title: 'Pendentes' },
  in_progress: { id: 'in_progress', title: 'Em Progresso' },
  done: { id: 'done', title: 'Concluídas' }
};

export function Kanban() {
  const [boardId, setBoardId] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');

  useEffect(() => {
    async function loadBoard() {
      try {
        let boards = await api.get('/kanban/boards');
        if (boards.length === 0) {
          // Auto-create board
          const newBoard = await api.post('/kanban/boards', { name: "Meu Quadro Principal", description: "" });
          boards = [newBoard];
        }
        setBoardId(boards[0].id);
        setCards(boards[0].cards || []);
      } catch (err) {
        toast.error("Erro ao carregar Quadro Kanban.");
      } finally {
        setLoading(false);
      }
    }
    loadBoard();
  }, []);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Optimistic UI update
    const cardId = parseInt(draggableId, 10);
    const updatedStatus = destination.droppableId;
    
    // Find the item and its current state to revert if API fails
    const movingCard = cards.find(c => c.id === cardId);
    if (!movingCard) return;

    const previousCards = [...cards];
    
    // Calculate new position array
    const sourceColCards = cards.filter(c => c.status === source.droppableId).sort((a,b)=>a.position - b.position);
    const destColCards = cards.filter(c => c.status === destination.droppableId).sort((a,b)=>a.position - b.position);

    // Remove from source array
    const currentList = Array.from(source.droppableId === destination.droppableId ? sourceColCards : destColCards);
    if (source.droppableId === destination.droppableId) {
      currentList.splice(source.index, 1);
      currentList.splice(destination.index, 0, movingCard);
    }

    // Apply basic status change optimistically
    const optimisticallyUpdated = cards.map(c => 
      c.id === cardId ? { ...c, status: updatedStatus, position: destination.index } : c
    );
    setCards(optimisticallyUpdated);

    try {
      // Background Patch
      await api.patch(`/kanban/cards/${cardId}`, {
        status: updatedStatus,
        position: destination.index
      });
    } catch(err) {
      // Revert if error
      setCards(previousCards);
      toast.error('Erro ao mover a tarefa. Sincronização falhou.');
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !boardId) return;

    try {
      const card = await api.post('/kanban/cards', {
        title: newTaskTitle,
        description: newTaskDesc,
        status: 'todo',
        position: cards.filter(c => c.status === 'todo').length,
        board_id: boardId
      });
      setCards(prev => [...prev, card]);
      setModalOpen(false);
      setNewTaskTitle('');
      setNewTaskDesc('');
      toast.success('Tarefa criada com sucesso!');
    } catch(err) {
      toast.error('Erro ao criar tarefa.');
    }
  };

  const handleDeleteTask = async (cardId) => {
    try {
       await api.delete(`/kanban/cards/${cardId}`);
       setCards(prev => prev.filter(c => c.id !== cardId));
       toast.success("Tarefa deletada.");
    } catch(err) {
       toast.error("Falha ao deletar tarefa.");
    }
  };

  if (loading) {
    return <div className="flex h-[400px] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-zinc-400" /></div>;
  }

  // Grupos por coluna
  const getCardsByColumn = (statusId) => cards.filter(c => c.status === statusId).sort((a,b) => a.position - b.position);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-2">
            Quadro Kanban
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Arraste os cartões entre as colunas. Tudo é salvo magicamente.</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="rounded-lg bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-sm font-semibold text-white transition-colors shadow-lg shadow-indigo-600/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nova Tarefa
        </button>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-6 h-full pb-6 w-max">
            {Object.values(COLUMNS).map((column) => {
               const columnCards = getCardsByColumn(column.id);

               return (
                <div key={column.id} className="w-80 flex flex-col rounded-2xl bg-zinc-200/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/60 p-4 h-full max-h-[calc(100vh-14rem)]">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                       {column.id === 'todo' && <div className="w-2 h-2 rounded-full bg-rose-500" />}
                       {column.id === 'in_progress' && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                       {column.id === 'done' && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                       {column.title}
                    </h3>
                    <span className="text-xs font-semibold bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 py-1 px-2.5 rounded-full">
                      {columnCards.length}
                    </span>
                  </div>
                  
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          "flex-1 overflow-y-auto space-y-3 rounded-lg p-1 transition-colors",
                          snapshot.isDraggingOver ? "bg-zinc-100 dark:bg-zinc-800/30" : ""
                        )}
                      >
                        {columnCards.map((card, index) => (
                          <Draggable key={card.id} draggableId={card.id.toString()} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={provided.draggableProps.style}
                                className={cn(
                                  "group relative rounded-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-4 shadow-sm border border-zinc-200 dark:border-zinc-700/60 ring-1 ring-zinc-900/5 dark:ring-white/10",
                                  snapshot.isDragging && "shadow-xl ring-2 ring-indigo-500 rotate-2 z-50 opacity-90",
                                  column.id === 'done' && "opacity-75"
                                )}
                              >
                                <button 
                                  onClick={() => handleDeleteTask(card.id)}
                                  className="absolute top-3 right-3 text-zinc-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Deletar Tarefa"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                                
                                <h4 className={cn("font-medium text-sm text-zinc-900 dark:text-zinc-100 mb-1 pr-6", column.id==='done' && "line-through")}>
                                  {card.title}
                                </h4>
                                {card.description && (
                                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                                    {card.description}
                                  </p>
                                )}
                                
                                <div className="flex items-center gap-2 mt-4 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                                   <SquareKanban className="w-3.5 h-3.5" />
                                   <span>#Task-{card.id}</span>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>

      {/* Modal - Nova Tarefa */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800"
            >
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Criar Nova Tarefa</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Esta tarefa será adicionada à coluna de Pendentes no seu Kanban.</p>

              <form onSubmit={handleAddTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Título <span className="text-rose-500">*</span></label>
                  <input 
                    required autoFocus
                    value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-zinc-900 dark:text-zinc-100"
                    placeholder="O que precisa ser feito?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Descrição <span className="text-zinc-400 font-normal">(Opcional)</span></label>
                  <textarea 
                    rows={3}
                    value={newTaskDesc} onChange={(e) => setNewTaskDesc(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-zinc-900 dark:text-zinc-100 resize-none"
                    placeholder="Adicione detalhes..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 transition-all active:scale-95">
                    Criar Tarefa
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
