import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Settings,
  Users,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Bell,
  CheckCircle2,
  Search,
  Box,
  Microscope,
  Cpu
} from 'lucide-react';

const SidebarLink = ({ to, icon: Icon, label, isCollapsed, onClick, className }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) => `
      flex items-center rounded-xl transition-all duration-300 group
      ${isCollapsed ? 'justify-center w-12 h-12 mx-auto' : 'px-4 py-3 gap-3'}
      ${isActive
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400'}
      ${className || ''}
    `}
  >
    <div className={`flex items-center justify-center shrink-0 ${isCollapsed ? 'w-full h-full' : ''}`}>
      <Icon size={20} className="transition-transform group-hover:scale-110" />
    </div>
    {!isCollapsed && <span className="font-bold text-sm tracking-wide">{label}</span>}
  </NavLink>
);

const BottomNavItem = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <NavLink
      to={to}
      className={({ isActive: linkActive }) => `
        flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all
        ${linkActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-600'}
      `}
    >
      <Icon size={22} className={isActive ? 'scale-110' : ''} strokeWidth={2.5} />
      <span className="text-[9px] font-black uppercase tracking-widest leading-none">{label}</span>
    </NavLink>
  );
};

const MainLayout = ({ children, settings }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [globalSearch, setGlobalSearch] = useState(searchParams.get('q') || '');

  // Sync search input if URL changes (e.g. from mobile search or direct navigation)
  React.useEffect(() => {
    const q = searchParams.get('q') || '';
    if (q !== globalSearch) setGlobalSearch(q);
  }, [searchParams]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setGlobalSearch(value);
    if (value.length >= 2) {
      navigate(`/order-detail?q=${encodeURIComponent(value)}`);
    } else if (value.length === 0) {
      navigate('/order-detail');
    }
  };

  const menuItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/production', icon: CalendarRange, label: 'Výroba' },
    { to: '/configurator', icon: Box, label: 'Konfigurátor' },
    { to: '/quality-control', icon: Microscope, label: 'Kontrola kvality' },
    { to: '/team', icon: Users, label: 'Tým' },
    { to: '/settings', icon: Settings, label: 'Nastavení' },
  ];
  const mobileMenuItems = menuItems;

  const pageTitle = menuItems.find(item => item.to === location.pathname)?.label || 'Smart Výroba';

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#eff2f6] dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 relative flex flex-col transition-colors duration-300">

      {/* MOBILE HEADER */}
      <header className="md:hidden h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 z-[60] shadow-sm transition-colors">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 -ml-2 text-slate-600 dark:text-slate-400 active:bg-slate-100 dark:active:bg-slate-800 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
        <span className="font-black text-blue-600 dark:text-blue-400 tracking-tighter text-lg uppercase italic">Smart Výroba</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/order-detail')}
            className="text-slate-400 dark:text-slate-600 p-1"
          >
            <Search size={20} />
          </button>
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="text-slate-400 dark:text-slate-600 p-1 relative"
            >
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-white dark:border-slate-900"></span>
            </button>
            <AnimatePresence>
              {isNotificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 5 }}
                  className="fixed top-16 right-4 left-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-[60] p-6 text-center"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-500">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">Vše je splněno</h4>
                      <p className="text-xs text-slate-500 mt-1">Aktuálně nemáte žádné notifikace ani úkoly.</p>
                    </div>
                    <button
                      onClick={() => setIsNotificationsOpen(false)}
                      className="mt-2 w-full py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300"
                    >
                      Zavřít
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 text-xs border border-slate-200 dark:border-slate-700 transition-colors">VP</div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative z-20">
        {/* SIDEBAR - DESKTOP */}
        <aside
          className={`
            hidden md:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-500 relative
            ${isCollapsed ? 'w-20' : 'w-72'}
          `}
        >
          {/* Logo Section */}
          <div className="h-20 flex items-center border-b border-slate-100 dark:border-slate-800/50 mb-4 shrink-0 overflow-hidden transition-colors">
            <div className={`flex items-center justify-center shrink-0 transition-all ${isCollapsed ? 'w-20' : 'pl-6 pr-3'}`}>
              <div className="w-12 h-12 flex items-center justify-center text-blue-600 dark:text-blue-400 transition-colors">
                <Cpu size={24} strokeWidth={1} />
              </div>
            </div>
            {!isCollapsed && <span className="font-black text-2xl tracking-tighter uppercase italic text-slate-800 dark:text-white truncate">Smart <span className="text-blue-600 dark:text-blue-400 transition-colors">Výroba</span></span>}
          </div>

          <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => (
              <SidebarLink
                key={item.to}
                {...item}
                isCollapsed={isCollapsed}
              />
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800/50 shrink-0 transition-colors">
            {isCollapsed ? (
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-md shadow-blue-500/20 border border-white/20">
                  VP
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center gap-3 border border-slate-100 dark:border-slate-700/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black transition-colors">VP</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate dark:text-white transition-colors">Václav P.</p>
                  <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider transition-colors">Vedoucí výroby</p>
                </div>
              </div>
            )}
          </div>

          {/* Collapse Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-24 w-6 h-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm transition-all hover:scale-110 z-30"
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </aside>

        {/* MOBILE SIDEBAR OVERLAY */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* MOBILE SIDEBAR */}
        <aside
          className={`
            md:hidden fixed top-0 bottom-0 left-0 w-80 bg-white dark:bg-slate-900 z-[101] shadow-2xl transition-transform duration-500 ease-in-out flex flex-col transition-colors
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50 transition-colors">
            <span className="font-black text-xl tracking-tighter uppercase italic dark:text-white transition-colors">Smart <span className="text-blue-600 dark:text-blue-400 transition-colors">Výroba</span></span>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 dark:text-slate-600"><X size={24} /></button>
          </div>
          <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
            {mobileMenuItems.map((item) => (
              <SidebarLink
                key={item.to}
                {...item}
                isCollapsed={false}
                onClick={() => setIsMobileMenuOpen(false)}
              />
            ))}
          </nav>
          <div className="p-6 border-t border-slate-100 dark:border-slate-800/50 flex items-center gap-4 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 border border-slate-200 dark:border-slate-700 transition-colors">VP</div>
            <div>
              <p className="font-bold dark:text-white transition-colors">Václav P.</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 transition-colors">Verze systému: 2.3-AI-Pro</p>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className={`
          flex-1 flex flex-col min-w-0 overflow-hidden relative shadow-2xl shadow-slate-200/50 dark:shadow-none transition-all duration-300
          bg-white dark:bg-slate-900
          ${isCollapsed ? 'md:m-3 md:rounded-[40px]' : 'md:m-3 md:rounded-[32px]'} 
          md:border md:border-slate-200 dark:md:border-slate-800
        `}>

          {/* HEADER - DESKTOP */}
          <header className="hidden md:flex h-20 items-center justify-between px-8 shrink-0 border-b border-slate-50 dark:border-slate-800/50 transition-colors">
            <div className="flex items-center gap-6">
              <h2 className="text-xl font-bold dark:text-white transition-colors">{pageTitle}</h2>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 transition-colors"></div>

              {/* GLOBAL SEARCH IN HEADER - Hidden on Team/Settings */}
              {location.pathname !== '/team' && location.pathname !== '/settings' ? (
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input
                    type="text"
                    placeholder="Vyhledat zakázku nebo klienta..."
                    className="bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 pl-10 pr-4 py-2.5 w-80 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer"
                    value={globalSearch}
                    onChange={handleSearch}
                    onFocus={() => {
                      if (location.pathname !== '/order-detail') {
                        navigate(globalSearch ? `/order-detail?q=${encodeURIComponent(globalSearch)}` : '/order-detail');
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="w-10 h-10 flex items-center justify-center text-slate-300 dark:text-slate-700">
                  <Box size={24} strokeWidth={1} />
                </div>
              )}

              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-800 transition-colors">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Systém: Aktivní
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className={`p-2.5 rounded-2xl border transition-all relative ${isNotificationsOpen ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                >
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                </button>

                <AnimatePresence>
                  {isNotificationsOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsNotificationsOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-[400px] bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.2)] z-[100] overflow-hidden"
                      >
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Oznámení</h3>
                          <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full">Systém v pořádku</span>
                        </div>
                        <div className="p-12 flex flex-col items-center text-center gap-6">
                          <div className="w-20 h-20 rounded-[2.5rem] bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-500 shadow-inner">
                            <CheckCircle2 size={40} />
                          </div>
                          <div>
                            <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Vše je splněno</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">Aktuálně nemáte žádné notifikace ani úkoly k vyřízení. Systém běží optimálně.</p>
                          </div>
                        </div>
                        <div className="p-4 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-center">
                          <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-500 transition-colors">Zobrazit celou historii</button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2 transition-colors"></div>
              <div className="flex items-center gap-3 pl-2">
                <p className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight transition-colors">
                  {new Date().toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </header>

          {/* CONTENT WITH SCROLLING FIX */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
              {children}
              {/* Spacer for Bottom Nav on mobile */}
              <div className="md:hidden h-24 shrink-0"></div>
            </div>
          </div>
        </main>
      </div>

      {/* BOTTOM NAVIGATION - MOBILE ONLY */}
      {settings.showBottomNav && (
        <nav className="md:hidden h-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800/50 fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] transition-colors">
          <BottomNavItem to="/" icon={LayoutDashboard} label="Home" />
          <BottomNavItem to="/production" icon={CalendarRange} label="Výroba" />
          <BottomNavItem to="/configurator" icon={Box} label="Konfig." />
          <BottomNavItem to="/team" icon={Users} label="Tým" />
          <BottomNavItem to="/settings" icon={Settings} label="Nastav." />
        </nav>
      )}

    </div>
  );
};

export default MainLayout;
