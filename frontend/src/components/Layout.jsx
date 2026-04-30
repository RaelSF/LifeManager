import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100 selection:bg-indigo-500/30">
      
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <Topbar setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 w-full mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      
      <Toaster position="bottom-right" richColors theme="system" />
    </div>
  );
}
