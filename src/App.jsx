import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout
import MainLayout from './layouts/MainLayout';

// Stránky
import Dashboard from './pages/Dashboard';
import Production from './pages/Production';
import Team from './pages/Team';
import OrderDetail from './pages/OrderDetail'; // Nová stránka
import SettingsPage from './pages/Settings';     // Stránka nastavení
import Configurator from './pages/Configurator'; // 3D Konfigurátor
import QualityInspection from './pages/QualityInspection'; // NOVÝ MODUL KVALITY
import TestCards from './pages/TestCards';     // Testovací stránka

// Import dat (Mock data)
import { initialOrders } from './data/mockData';
import { initialEmployees } from './data/teamData';

export default function App() {
  // State pro data (aby byla sdílená napříč aplikací)
  const [items, setItems] = useState(initialOrders || []);
  const [employees, setEmployees] = useState(initialEmployees || []);

  // Globální nastavení AI a UI
  const [settings, setSettings] = useState({
    showBottomNav: true,
    aiMode: 'combined', // 'pure', 'combined', 'manual'
    aiPriorities: {
      vipWeight: 50,
      deadlineWeight: 40,
      overdueWeight: 30,
      complexityWeight: 10
    }
  });

  return (
    <BrowserRouter>
      <MainLayout settings={settings}>
        <Routes>
          {/* Hlavní Dashboard */}
          <Route path="/" element={<Dashboard items={items} />} />

          {/* Dispečink výroby (Kanban) */}
          <Route path="/production" element={<Production items={items} setItems={setItems} settings={settings} />} />

          {/* Detail zakázky (Vyhledávání) */}
          <Route path="/order-detail" element={<OrderDetail items={items} />} />

          {/* Tým a docházka */}
          <Route path="/team" element={<Team employees={employees} setEmployees={setEmployees} />} />

          {/* Nastavení */}
          <Route path="/settings" element={<SettingsPage settings={settings} setSettings={setSettings} />} />

          {/* 3D Konfigurátor */}
          <Route path="/configurator" element={<Configurator />} />

          {/* AI Kontrola Kvality */}
          <Route path="/quality-control" element={<QualityInspection settings={settings} />} />

          {/* Testovací laboratoř komponent */}
          <Route path="/test" element={<TestCards />} />

          {/* Fallback - přesměrování na dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}