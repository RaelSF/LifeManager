import React, { useState } from 'react';
import { Menu, User, Bell, Sun, Moon } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const routeTitles = {
  '/': 'Bem-vindo ao LifeManager',
  '/notes': 'Minhas Notas',
  '/kanban': 'Quadro Kanban',
  '/shopping': 'Lista de Compras',
  '/finance': 'Controle Financeiro',
  '/study': 'Study Hub',
};

export function Topbar({ setSidebarOpen }) {
  const location = useLocation();
  const currentTitle = routeTitles[location.pathname] || 'LifeManager';

  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleTheme = () => {
    const isNowDark = !isDark;
    setIsDark(isNowDark);
    if (isNowDark) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-zinc-200 bg-white/70 backdrop-blur-md px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 dark:border-zinc-800 dark:bg-zinc-950/70">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-zinc-700 dark:text-zinc-300 lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Abrir sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separator for mobile */}
      <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 items-center justify-between gap-x-4 self-stretch lg:gap-x-6">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {currentTitle}
        </h1>

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <button type="button" onClick={toggleTheme} className="-m-2.5 p-2.5 text-zinc-400 hover:text-indigo-500 dark:text-zinc-500 dark:hover:text-indigo-400 transition-colors">
            <span className="sr-only">Trocar Tema</span>
            {isDark ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
          </button>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-zinc-200 dark:lg:bg-zinc-800" aria-hidden="true" />
          
          <button type="button" className="-m-2.5 p-2.5 text-zinc-400 hover:text-zinc-500 dark:text-zinc-500 dark:hover:text-zinc-400 transition-colors">
            <span className="sr-only">Ver notificações</span>
            <Bell className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-zinc-200 dark:lg:bg-zinc-800" aria-hidden="true" />

          {/* Profile dropdown Placeholder */}
          <div className="relative">
            <button className="flex items-center gap-x-2 bg-transparent border-0 outline-none hover:opacity-80 transition-opacity">
              <span className="sr-only">Menu do usuário</span>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium shadow-md shadow-indigo-500/20">
                <User className="h-4 w-4" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
