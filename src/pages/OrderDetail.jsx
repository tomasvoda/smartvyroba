import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, FileSearch, ArrowRight, ChevronDown, ChevronUp, X, ListFilter, Filter, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DetailedDoorCard from '../components/DetailedDoorCard';

const OrderDetail = ({ items = [] }) => {
   const [searchParams] = useSearchParams();
   const searchTerm = searchParams.get('q') || '';
   const [expandedId, setExpandedId] = useState(null);
   const [stageFilter, setStageFilter] = useState('ALL');
   const [pmFilter, setPmFilter] = useState('ALL');
   const [isFilterOpen, setIsFilterOpen] = useState(false);

   const stages = ['Zásobník', 'Příprava', 'Truhlárna', 'Lakovna', 'Expedice', 'Hotovo'];
   const managers = useMemo(() => {
      const unique = [...new Set(items.map(i => i.projectManager))].filter(Boolean);
      return unique.sort();
   }, [items]);

   // Helper for date parsing and sorting (D. M. YYYY)
   const parseDate = (dateStr) => {
      if (!dateStr) return 0;
      const parts = dateStr.split('. ');
      if (parts.length < 3) return 0;
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const year = parseInt(parts[2]);
      return new Date(year, month, day).getTime();
   };

   // Multiple results search logic
   const searchResults = useMemo(() => {
      let filtered = [...items];

      if (searchTerm && searchTerm.length >= 2) {
         const term = searchTerm.toLowerCase();
         filtered = filtered.filter(item =>
            item.projectId.toLowerCase().includes(term) ||
            item.client.toLowerCase().includes(term)
         );
      }

      if (stageFilter !== 'ALL') {
         filtered = filtered.filter(item => item.stage === stageFilter);
      }

      if (pmFilter !== 'ALL') {
         filtered = filtered.filter(item => item.projectManager === pmFilter);
      }

      // Sort by newest first (dates.ordered)
      return filtered.sort((a, b) => {
         const dateA = parseDate(a.dates?.ordered);
         const dateB = parseDate(b.dates?.ordered);
         return dateB - dateA;
      });
   }, [items, searchTerm, stageFilter, pmFilter]);

   return (
      <div className="h-full flex flex-col bg-[#f8fafc] dark:bg-slate-900 transition-colors">

         {/* HEADER */}
         <div className="px-4 md:px-8 pt-6 md:pt-8 pb-6 bg-white/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div className="flex items-center gap-3 text-slate-400">
                  <FileSearch size={24} className="text-blue-500" />
                  <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">Přehled zakázek</h1>
                  <div className="hidden sm:block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50 ml-2">
                     Celkem: {items.length}
                  </div>
               </div>

               <div className="flex items-center gap-2">
                  {searchTerm && (
                     <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl text-xs font-bold text-blue-600">
                        <Search size={14} /> "{searchTerm}"
                     </div>
                  )}
                  <button
                     onClick={() => setIsFilterOpen(!isFilterOpen)}
                     className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all ${isFilterOpen
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-400/50'}`}
                  >
                     <ListFilter size={14} /> Filtrovat
                  </button>
               </div>
            </div>

            <AnimatePresence>
               {isFilterOpen && (
                  <motion.div
                     initial={{ height: 0, opacity: 0, marginTop: 0 }}
                     animate={{ height: 'auto', opacity: 1, marginTop: 20 }}
                     exit={{ height: 0, opacity: 0, marginTop: 0 }}
                     className="overflow-hidden"
                  >
                     <div className="bg-white/80 dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex flex-wrap items-end gap-4">
                        <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Stav zakázky</label>
                           <select
                              value={stageFilter}
                              onChange={(e) => setStageFilter(e.target.value)}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
                           >
                              <option value="ALL">Všechny stavy</option>
                              {stages.map(s => <option key={s} value={s}>{s}</option>)}
                           </select>
                        </div>
                        <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Projektový manažer</label>
                           <select
                              value={pmFilter}
                              onChange={(e) => setPmFilter(e.target.value)}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
                           >
                              <option value="ALL">Všichni manažeři</option>
                              {managers.map(m => <option key={m} value={m}>{m}</option>)}
                           </select>
                        </div>
                        <button
                           onClick={() => {
                              setPmFilter('ALL');
                              setStageFilter('ALL');
                           }}
                           className="h-[42px] px-6 bg-slate-100 dark:bg-slate-900 text-slate-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
                        >
                           <RotateCcw size={14} /> Reset
                        </button>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>

         {/* CONTENT AREA */}
         <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 custom-scrollbar">

            {searchResults.length > 0 ? (
               <div className="space-y-4 max-w-4xl mx-auto pb-20">
                  {searchResults.map((order) => {
                     const isExpanded = expandedId === order.projectId;
                     return (
                        <div
                           key={order.projectId}
                           className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-all ${isExpanded ? 'ring-2 ring-blue-500/20' : 'hover:shadow-md'}`}
                        >
                           {/* List Item Header */}
                           <div
                              onClick={() => setExpandedId(isExpanded ? null : order.projectId)}
                              className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                           >
                              <div className="flex items-center gap-4 min-w-0">
                                 <div className="px-3 h-12 min-w-[72px] rounded-xl bg-blue-50 dark:bg-blue-900/30 flex flex-col items-center justify-center border border-blue-100 dark:border-blue-800/50 shrink-0">
                                    <span className="text-xs font-black text-blue-600 dark:text-blue-400 leading-none">{order.projectId}</span>
                                    <span className="text-[8px] font-bold text-blue-400 dark:text-blue-500/70 mt-1 uppercase tracking-widest">Obj</span>
                                 </div>
                                 <div className="min-w-0 flex-1">
                                    <h3 className="font-bold text-slate-800 dark:text-white leading-tight truncate">{order.client}</h3>
                                    <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1.5 truncate">
                                       <span className={order.isOverdue ? 'text-rose-500 font-black' : ''}>Termín: {order.deadline}</span>
                                       <span className="hidden sm:inline w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0"></span>
                                       <span className="hidden sm:inline">Stav: {order.stage}</span>
                                       <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0"></span>
                                       <span className="text-slate-500 dark:text-slate-300 font-black lowercase">{order.projectManager}</span>
                                    </div>
                                 </div>
                              </div>
                              <div className="flex items-center gap-6 shrink-0 ml-4">
                                 <div className="hidden lg:flex flex-col items-end text-right">
                                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-widest">{order.dates.ordered}</span>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Vytvořeno</span>
                                 </div>
                                 <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 transition-transform group-hover:bg-slate-100 dark:group-hover:bg-slate-800">
                                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                 </div>
                              </div>
                           </div>

                           {/* Detail View */}
                           {isExpanded && (
                              <div className="px-4 pb-6 border-t border-slate-100 dark:border-slate-700 animate-in slide-in-from-top-2 duration-300">
                                 <div className="py-6 space-y-6">
                                    <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm">
                                       <div>
                                          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Vytvořeno</p>
                                          <p className="font-medium dark:text-slate-200">{order.dates.ordered}</p>
                                       </div>
                                       <div>
                                          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Poznámka</p>
                                          <p className="font-medium dark:text-slate-200">{order.notes || "Bez poznámky"}</p>
                                       </div>
                                    </div>

                                    <div className="space-y-4">
                                       <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700 pb-2">
                                          Výrobní položky
                                       </h4>
                                       {order.items?.map((door, idx) => (
                                          <DetailedDoorCard key={door.id} door={door} index={idx} />
                                       ))}
                                    </div>
                                 </div>

                                 <div className="flex justify-end pt-4 border-t border-slate-50 dark:border-slate-700">
                                    <button className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold text-xs hover:underline">
                                       Otevřít plný detail <ArrowRight size={14} />
                                    </button>
                                 </div>
                              </div>
                           )}
                        </div>
                     );
                  })}
               </div>
            ) : (
               <div className="flex flex-col items-center justify-center h-64 text-rose-400 dark:text-rose-500 gap-4 animate-in shake duration-500">
                  <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
                     <X size={32} />
                  </div>
                  <p className="font-bold">Žádná zakázka neodpovídá zadání</p>
                  <button onClick={() => setSearchTerm('')} className="text-sm font-bold text-slate-500 underline decoration-dotted">Vymazat hledání</button>
               </div>
            )}
         </div>
      </div>
   );
};

export default OrderDetail;