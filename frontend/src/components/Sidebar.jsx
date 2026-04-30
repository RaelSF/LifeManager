import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  StickyNote, 
  SquareKanban, 
  ShoppingCart, 
  Wallet,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Notas', path: '/notes', icon: StickyNote },
  { name: 'Kanban', path: '/kanban', icon: SquareKanban },
  { name: 'Lista de Compras', path: '/shopping', icon: ShoppingCart },
  { name: 'Financeiro', path: '/finance', icon: Wallet },
];

export function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-zinc-950/80 backdrop-blur-sm"
        />
      )}

      {/* Sidebar Container */}
      <motion.aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 flex flex-col pt-16 lg:pt-0 border-r transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block",
          "bg-white/70 border-zinc-200 dark:bg-zinc-950/70 dark:border-zinc-800 backdrop-blur-md",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile Close Button */}
        <button 
          onClick={() => setIsOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex h-16 shrink-0 items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 font-bold text-xl text-zinc-900 dark:text-zinc-50 tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              L
            </div>
            LifeManager
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors outline-none",
                  "hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-50",
                  isActive 
                    ? "text-indigo-600 dark:text-indigo-400" 
                    : "text-zinc-600 dark:text-zinc-400"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute inset-0 rounded-xl bg-indigo-50/50 dark:bg-indigo-500/10"
                    initial={false}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon className="w-5 h-5 relative z-10" />
                <span className="relative z-10">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-zinc-200 dark:border-zinc-800">
          {/* User Profile Hook placeholder */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50">
            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-sm font-semibold">
              R
            </div>
            <div className="flex flex-col flex-1 truncate text-xs">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">Usuário Mestre</span>
              <span className="text-zinc-500 truncate">Configurações</span>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
