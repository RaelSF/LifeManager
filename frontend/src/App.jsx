import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Notes } from './pages/Notes';
import { Kanban } from './pages/Kanban';
import { Shopping } from './pages/Shopping';
import { Finance } from './pages/Finance';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="notes" element={<Notes />} />
          <Route path="kanban" element={<Kanban />} />
          <Route path="shopping" element={<Shopping />} />
          <Route path="finance" element={<Finance />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
