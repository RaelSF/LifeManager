import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../lib/api';
import { Loader2, ArrowUpRight, ArrowDownRight, Plus, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export function Finance() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setModalOpen] = useState(false);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('income');
  const [category, setCategory] = useState('Geral');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await api.get('/transactions/');
      setTransactions(data.sort((a,b) => new Date(b.date) - new Date(a.date)));
    } catch(err) {
      toast.error("Erro ao carregar finanças");
    } finally {
      setLoading(false);
    }
  }

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!desc || !amount) return;

    try {
      const newTx = await api.post('/transactions/', {
        description: desc,
        amount: parseFloat(amount),
        type,
        category
      });
      setTransactions([newTx, ...transactions]);
      toast.success(type === 'income' ? 'Receita adicionada!' : 'Despesa registrada!');
      setModalOpen(false);
      setDesc(''); setAmount(''); setCategory('Geral'); setType('income');
    } catch(err) {
      toast.error("Falha ao registrar");
    }
  };

  const handleCancel = async (id) => {
    if(!window.confirm("Anular/Riscar esta transação?")) return;
    try {
      const updated = await api.patch(`/transactions/${id}`, {
        is_canceled: true
      });
      setTransactions(transactions.map(t => t.id === id ? updated : t));
      toast.success("Transação riscada!");
    } catch(err) {
      toast.error("Falha ao anular");
    }
  };

  const { income, expense, balance } = useMemo(() => {
    return transactions.reduce((acc, curr) => {
      if (curr.is_canceled) return acc;
      if (curr.type === 'income') {
        acc.income += curr.amount;
        acc.balance += curr.amount;
      } else {
        acc.expense += curr.amount;
        acc.balance -= curr.amount;
      }
      return acc;
    }, { income: 0, expense: 0, balance: 0 });
  }, [transactions]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header & Button */}
      <div className="flex justify-between items-center bg-white dark:bg-zinc-900/40 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800/60 shadow-sm">
         <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Caixa Geral</h2>
            <p className="text-sm text-zinc-500">Mantenha seu balanço em dia.</p>
         </div>
         <button 
           onClick={() => setModalOpen(true)}
           className="rounded-xl flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all active:scale-95 gap-2"
         >
           <Plus className="w-4 h-4"/> 
           Adicionar Registro
         </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-2xl bg-zinc-900 dark:bg-zinc-100 p-6 text-white dark:text-zinc-900 shadow-xl shadow-zinc-900/10 dark:shadow-white/5 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-sm font-medium opacity-80">Saldo Atual</h3>
            <p className={cn("mt-2 text-3xl font-bold tracking-tight", balance < 0 ? "text-rose-400 dark:text-rose-600" : "")}>
              R$ {balance.toFixed(2)}
            </p>
          </div>
          <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/10 dark:bg-zinc-900/10 rounded-full blur-2xl transform translate-x-8 translate-y-8" />
        </div>
        
        <div className="rounded-2xl bg-white dark:bg-zinc-900/40 p-6 border border-zinc-200 dark:border-zinc-800/60 flex flex-col justify-center">
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total de Receitas</h3>
          <p className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">R$ {income.toFixed(2)}</p>
        </div>
        
        <div className="rounded-2xl bg-white dark:bg-zinc-900/40 p-6 border border-zinc-200 dark:border-zinc-800/60 flex flex-col justify-center">
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total de Despesas</h3>
          <p className="mt-2 text-3xl font-bold text-rose-600 dark:text-rose-400">R$ {expense.toFixed(2)}</p>
        </div>
      </div>

      {/* Lista de Transações */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 overflow-hidden">
        <div className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Transações Recentes</h2>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Exibindo histórico</span>
        </div>
        
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
          </div>
        ) : (
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800/60 max-h-96 overflow-y-auto">
            {transactions.map(t => (
              <li key={t.id} className={cn("p-4 sm:px-6 hover:bg-zinc-50 dark:hover:bg-zinc-900/80 transition-colors flex items-center justify-between", t.is_canceled && "opacity-50")}>
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "flex shrink-0 items-center justify-center w-10 h-10 rounded-full",
                    t.type === 'income' ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
                    t.is_canceled && "grayscale opacity-50"
                  )}>
                    {t.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5"/>}
                  </div>
                  <div>
                    <span className={cn("block font-semibold text-zinc-900 dark:text-zinc-100", t.is_canceled && "line-through")}>
                       {t.description} 
                       {t.shopping_item_id && <span className="ml-2 text-[10px] uppercase font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full not-italic">Mercado</span>}
                       {t.is_canceled && <span className="ml-2 text-[10px] uppercase font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full not-italic">Anulado</span>}
                    </span>
                    <span className="text-xs text-zinc-500">{new Date(t.date).toLocaleDateString()} &middot; {t.category || "Sem Categoria"}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                   <div className={cn("font-bold text-right", t.type === 'income' ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400", t.is_canceled && "line-through opacity-70")}>
                     {t.type === 'income' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                   </div>
                   {!t.is_canceled && (
                      <button onClick={() => handleCancel(t.id)} className="p-1.5 rounded-md text-zinc-400 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-500/20 dark:hover:text-rose-400 transition-colors" title="Risar / Anular Transação">
                         <Trash2 className="w-4 h-4" />
                      </button>
                   )}
                </div>
              </li>
            ))}

            {transactions.length === 0 && (
              <div className="p-8 text-center text-zinc-500">
                Nenhuma transação financeira encontrada.
              </div>
            )}
          </ul>
        )}
      </div>

      {/* Modal Nova Transação */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800"
            >
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">Nova Operação</h2>
              
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl">
                   <button type="button" onClick={()=>setType('income')} className={cn("flex-1 text-sm font-semibold rounded-lg py-1.5 transition-colors", type === 'income' ? "bg-emerald-500 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300")}>
                      💳 Ganho
                   </button>
                   <button type="button" onClick={()=>setType('expense')} className={cn("flex-1 text-sm font-semibold rounded-lg py-1.5 transition-colors", type === 'expense' ? "bg-rose-500 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300")}>
                      💸 Gasto
                   </button>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-400 mb-1">Descrição</label>
                  <input required value={desc} onChange={e => setDesc(e.target.value)} placeholder={type === 'income' ? "Ex: Salário" : "Ex: Conta de Luz"} className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-zinc-900 dark:text-zinc-100"/>
                </div>
                <div className="flex gap-4">
                   <div className="flex-1">
                     <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-400 mb-1">Valor (R$)</label>
                     <input required type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-zinc-900 dark:text-zinc-100 "/>
                   </div>
                   <div className="flex-1">
                     <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-400 mb-1">Categoria (Opcional)</label>
                     <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Geral" className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-zinc-900 dark:text-zinc-100 "/>
                   </div>
                </div>
                <div className="flex gap-3 pt-6">
                  <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 transition-all active:scale-95">
                    Registrar
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
