import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../lib/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Loader2, TrendingUp, AlertCircle, CheckCircle2, ShoppingCart, Info, TrendingDown, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

export function Dashboard() {
  const [data, setData] = useState({ transactions: [], kanban: [], shopping: [], notes: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAllData() {
      try {
        const [txRes, boardRes, shopRes, notesRes] = await Promise.all([
          api.get('/transactions/'),
          api.get('/kanban/boards'),
          api.get('/shopping/'),
          api.get('/notes/')
        ]);

        setData({
          transactions: txRes || [],
          kanban: boardRes?.length > 0 ? boardRes[0].cards || [] : [],
          shopping: shopRes || [],
          notes: notesRes || []
        });
      } catch (err) {
        console.error("Falha ao puxar os dados do Dashboard", err);
      } finally {
        setLoading(false);
      }
    }
    loadAllData();
  }, []);

  // --- Analíticas Computadas ---
  
  // 1. Financeiro
  const { balance, income, expense } = useMemo(() => {
    return data.transactions.reduce((acc, curr) => {
      if (curr.is_canceled) return acc;
      if (curr.type === 'income') {
        acc.income += curr.amount;
        acc.balance += curr.amount;
      } else {
        acc.expense += curr.amount;
        acc.balance -= curr.amount;
      }
      return acc;
    }, { balance: 0, income: 0, expense: 0 });
  }, [data.transactions]);

  // Transformar transações para o Gráfico
  const chartData = useMemo(() => {
    const validTx = data.transactions.filter(t => !t.is_canceled);
    const sorted = [...validTx].sort((a,b) => new Date(a.date) - new Date(b.date)).slice(-10);
    return sorted.map(t => ({
      name: new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      Receita: t.type === 'income' ? t.amount : 0,
      Despesa: t.type === 'expense' ? t.amount : 0
    }));
  }, [data.transactions]);

  // 2. Kanban
  const pendingTasksCount = data.kanban.filter(t => t.status === 'todo').length;
  const inProgressCount = data.kanban.filter(t => t.status === 'in_progress').length;

  // 3. Shopping
  const urgentShopping = data.shopping.filter(s => !s.is_purchased && s.priority === 'high');

  if (loading) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-zinc-400" /></div>;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300 } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 pb-12">
      
      {/* HEADER DE BOAS VINDAS */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Seu Resumo, Mestre! 🌩️</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Aqui está o pulso da sua vida hoje.</p>
        </div>
      </motion.div>

      {/* METRIC CARDS (TOPO) */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card Saldo */}
        <motion.div variants={itemVariants} className="rounded-2xl bg-zinc-900 dark:bg-zinc-100 p-6 text-white dark:text-zinc-900 shadow-xl shadow-zinc-900/10 dark:shadow-white/5 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start">
               <h3 className="text-sm font-medium opacity-80">Saldo Atual</h3>
               <TrendingUp className="w-5 h-5 opacity-50" />
            </div>
            <p className="mt-4 text-4xl font-bold tracking-tight">R$ {balance.toFixed(2)}</p>
            <p className="mt-2 text-xs opacity-70">
              +{income.toFixed(2)} Receitas | -{expense.toFixed(2)} Despesas
            </p>
          </div>
          <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/10 dark:bg-zinc-900/10 rounded-full blur-2xl transform translate-x-8 translate-y-8" />
        </motion.div>

        {/* Card Tarefas Pendentes */}
        <motion.div variants={itemVariants} className="rounded-2xl bg-white dark:bg-zinc-900/40 p-6 border border-zinc-200 dark:border-zinc-800/60 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start text-zinc-500 dark:text-zinc-400">
            <h3 className="text-sm font-medium">Tarefas na Fila</h3>
            <Clock className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="mt-4">
             <p className="text-4xl font-bold text-zinc-900 dark:text-white">{pendingTasksCount}</p>
             <p className="mt-2 text-xs text-zinc-500">+{inProgressCount} sendo feitas agora</p>
          </div>
        </motion.div>

        {/* Card Compras de Prioridade */}
        <motion.div variants={itemVariants} className="rounded-2xl bg-white dark:bg-zinc-900/40 p-6 border border-zinc-200 dark:border-zinc-800/60 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start text-zinc-500 dark:text-zinc-400">
            <h3 className="text-sm font-medium">Lista de Compras Crítica</h3>
            <AlertCircle className="w-5 h-5 text-rose-500" />
          </div>
          <div className="mt-4">
             <p className="text-4xl font-bold text-zinc-900 dark:text-white">{urgentShopping.length}</p>
             <p className="mt-2 text-xs text-zinc-500">Itens marcados com Prioridade Alta</p>
          </div>
        </motion.div>

        {/* Card Quantidade de Notas */}
        <motion.div variants={itemVariants} className="rounded-2xl bg-white dark:bg-zinc-900/40 p-6 border border-zinc-200 dark:border-zinc-800/60 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start text-zinc-500 dark:text-zinc-400">
            <h3 className="text-sm font-medium">Base de Conhecimento</h3>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="mt-4">
             <p className="text-4xl font-bold text-zinc-900 dark:text-white">{data.notes.length}</p>
             <p className="mt-2 text-xs text-zinc-500">Anotações salvas no seu acervo</p>
          </div>
        </motion.div>
      </div>

      {/* ÁREA GRÁFICA & ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GRÁFICO DE FLUXO FINANCEIRO */}
        <motion.div variants={itemVariants} className="lg:col-span-2 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">Receitas vs Despesas (Últimos Movimentos)</h3>
          
          <div className="h-72 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val}`} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.2} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#18181b', color: '#fff' }}
                    itemStyle={{ fontSize: 13, fontWeight: 500 }}
                  />
                  <Area type="monotone" dataKey="Receita" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                  <Area type="monotone" dataKey="Despesa" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-400 text-sm">
                Nenhum dado financeiro ainda para exibir o gráfico.
              </div>
            )}
          </div>
        </motion.div>

        {/* ALERTAS / URGÊNCIAS / RECENTES */}
        <motion.div variants={itemVariants} className="rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 shadow-sm p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">Radar de Foco</h3>
          
          <div className="flex-1 overflow-y-auto space-y-4">
             {/* Compras Urgentes */}
             {urgentShopping.length > 0 && urgentShopping.map(item => (
                <div key={`shop-${item.id}`} className="flex items-start gap-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20">
                  <div className="p-2 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <div>
                     <p className="text-sm font-medium text-rose-900 dark:text-rose-100">Falta comprar: {item.name}</p>
                     <p className="text-xs text-rose-700 dark:text-rose-300">Estimativa: R$ {item.total_price?.toFixed(2)}</p>
                  </div>
                </div>
             ))}

             {/* Tarefas Atrasadas ou Pendentes Antigas */}
             {data.kanban.filter(t => t.status==='todo').slice(0, 3).map(task => (
                <div key={`task-${task.id}`} className="flex items-start gap-3 p-3 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20">
                  <div className="p-2 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                     <p className="text-sm font-medium text-orange-900 dark:text-orange-100">Pêndencia: {task.title}</p>
                     <p className="text-xs text-orange-700 dark:text-orange-300">Aguardando início no Kanban</p>
                  </div>
                </div>
             ))}

             {urgentShopping.length === 0 && pendingTasksCount === 0 && (
                <div className="flex flex-col items-center justify-center pt-10 opacity-70 text-center">
                   <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3 text-zinc-400">
                      <CheckCircle2 className="w-6 h-6" />
                   </div>
                   <p className="text-sm text-zinc-600 dark:text-zinc-400">Você está zerado de urgências!</p>
                </div>
             )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
