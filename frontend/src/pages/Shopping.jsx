import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Loader2, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { cn } from '../lib/utils';

export function Shopping() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pendentes'); // 'pendentes' | 'historico'

  // Form State
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState('');
  const [priority, setPriority] = useState('medium');

  // Load items
  useEffect(() => {
    async function load() {
      try {
        const data = await api.get('/shopping/');
        setItems(data);
      } catch (err) {
        toast.error('Erro ao carregar os itens');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const pendingItems = useMemo(() => items.filter(i => !i.is_purchased), [items]);
  const historyItems = useMemo(() => items.filter(i => i.is_purchased), [items]);

  const estimatedTotal = useMemo(() => {
    return pendingItems.reduce((acc, curr) => acc + ((curr.unit_price || 0) * curr.quantity), 0);
  }, [pendingItems]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const newItem = await api.post('/shopping/', {
        name,
        quantity: parseInt(quantity, 10),
        unit_price: price ? parseFloat(price) : null,
        priority
      });
      setItems(prev => [newItem, ...prev]);
      toast.success('Item adicionado à lista!');
      
      // Reset form
      setName('');
      setQuantity(1);
      setPrice('');
      setPriority('medium');
    } catch (err) {
      toast.error('Gatilho falhou ao criar item.');
    }
  };

  const markAsPurchased = async (id, currentPrice) => {
    try {
      const updatedItem = await api.post(`/shopping/${id}/purchase`, {
         unit_price: currentPrice
      });
      // Replace item in state
      setItems(prev => prev.map(i => i.id === id ? updatedItem : i));
      toast.success('Gasto registrado no Financeiro!', {
        description: `O item ${updatedItem.name} foi movido para o histórico.`
      });
    } catch (err) {
      toast.error('Erro ao registrar compra.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header and Total */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Lista de Compras</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Gerencie sua lista. Ao comprar, a despesa é gerada automaticamente.</p>
        </div>
        <div className="rounded-2xl bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 p-4 border border-indigo-500/20 sm:min-w-[200px] flex items-center justify-between">
          <span className="text-sm font-semibold">Total Estimado</span>
          <span className="text-xl font-bold">R$ {estimatedTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Add Form */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900/40 p-5 shadow-sm border border-zinc-200 dark:border-zinc-800/60 ring-1 ring-zinc-900/5 dark:ring-white/10">
        <form onSubmit={handleAddItem} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Nome do Item</label>
            <input 
              required
              value={name} onChange={e => setName(e.target.value)}
              className="w-full rounded-lg border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500" 
              placeholder="Ex: Leite Integral" />
          </div>
          <div className="w-full sm:w-24">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Qtd</label>
            <input 
              type="number" min="1"
              value={quantity} onChange={e => setQuantity(e.target.value)}
              className="w-full rounded-lg border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="w-full sm:w-32">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Valor Unitário</label>
            <div className="relative">
              <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
              <input 
                type="number" step="0.01"
                value={price} onChange={e => setPrice(e.target.value)}
                className="w-full rounded-lg border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 pl-8 pr-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500" 
                placeholder="0.00" />
            </div>
          </div>
          <div className="w-full sm:w-32">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Prioridade</label>
            <select 
              value={priority} onChange={e => setPriority(e.target.value)}
              className="w-full rounded-lg border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </select>
          </div>
          <button type="submit" className="w-full sm:w-auto flex shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-sm font-semibold text-white transition-colors">
            <Plus className="w-4 h-4" />
            Adicionar
          </button>
        </form>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-200 dark:border-zinc-800">
        <nav className="-mb-px flex space-x-8">
          {['pendentes', 'historico'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors relative",
                activeTab === tab 
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400" 
                  : "border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-300"
              )}
            >
              {tab === 'pendentes' ? `Pendentes (${pendingItems.length})` : `Histórico (${historyItems.length})`}
            </button>
          ))}
        </nav>
      </div>

      {/* List */}
      <div className="rounded-2xl overflow-hidden bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 ring-1 ring-zinc-900/5 dark:ring-white/10 min-h-[300px]">
        {loading ? (
          <div className="flex h-full min-h-[300px] items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
          </div>
        ) : (
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
            <AnimatePresence mode="popLayout">
              {(activeTab === 'pendentes' ? pendingItems : historyItems).map((item) => (
                <motion.li 
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between p-4 sm:px-6 hover:bg-zinc-50 dark:hover:bg-zinc-900/80 transition-colors"
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                    <span className={cn(
                      "text-base font-semibold",
                      item.is_purchased ? "text-zinc-400 line-through" : "text-zinc-900 dark:text-zinc-100"
                    )}>
                      {item.name}
                    </span>
                    <div className="flex items-center gap-3 text-xs font-medium">
                      <span className="text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                        {item.quantity}x
                      </span>
                      {/* Priority Badge */}
                      {!item.is_purchased && (
                        <span className={cn(
                          "px-2 py-0.5 rounded-full flex items-center gap-1",
                          item.priority === 'high' && "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
                          item.priority === 'medium' && "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
                          item.priority === 'low' && "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                        )}>
                          Prioridade {item.priority === 'high' ? 'Alta' : item.priority === 'medium' ? 'Média' : 'Baixa'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {item.total_price ? `R$ ${item.total_price.toFixed(2)}` : 'R$ 0,00'}
                      </span>
                      {item.unit_price && <span className="text-xs text-zinc-500 dark:text-zinc-500">R$ {item.unit_price.toFixed(2)}/un</span>}
                    </div>
                    
                    {!item.is_purchased && (
                      <button 
                        onClick={() => markAsPurchased(item.id, item.unit_price)}
                        title="Marcar como comprado"
                        className="p-2 ml-2 rounded-full text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 transition-colors"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>

            {(activeTab === 'pendentes' && pendingItems.length === 0) && !loading && (
              <div className="p-8 text-center text-zinc-500 py-12">Nenhum item pendente.</div>
            )}
            
            {(activeTab === 'historico' && historyItems.length === 0) && !loading && (
              <div className="p-8 text-center text-zinc-500 py-12">Histórico vazio.</div>
            )}
          </ul>
        )}
      </div>

    </div>
  );
}
