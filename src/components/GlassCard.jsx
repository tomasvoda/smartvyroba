import React, { useState, memo } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import {
   ChevronDown, ChevronUp, Crown, Box, FileText,
   Flame, Shield, Ear, Ruler, AlertTriangle, Sparkles
} from 'lucide-react';
import CompactDoorCard from './CompactDoorCard';

const GlassCard = memo(({ item, index, showAiReason = true, viewMode = 'compact' }) => {
   const [isExpanded, setIsExpanded] = useState(false);

   const isListView = viewMode === 'full';

   const safeItems = item?.items || [];
   const safeDates = item?.dates || {};

   const hasAtyp = safeItems.some(i => i.isAtyp);
   const hasEI = safeItems.some(i => i.trait?.includes('EI'));
   const hasRw = safeItems.some(i => i.trait?.includes('Rw'));
   const hasRC = safeItems.some(i => i.trait?.includes('RC'));
   const totalDoors = safeItems.length;

   const getFinishCategory = (code) => {
      if (!code) return 'Jiný';
      const c = code.toUpperCase();
      if (c.includes('RAL')) return 'RAL';
      if (c.includes('NCS')) return 'NCS';
      if (c.includes('DÝHA') || c.includes('DUB') || c.includes('OŘECH')) return 'Dýha';
      if (c.includes('HPL')) return 'HPL';
      return 'Jiný';
   };
   const uniqueCategories = [...new Set(safeItems.map(i => getFinishCategory(i.finishCode || i.finishA)))];

   // Design with Dark Mode
   let cardStyleClass = 'bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 shadow-sm';

   if (item.vip && item.isOverdue) {
      cardStyleClass = 'bg-gradient-to-br from-rose-100 via-rose-50 to-amber-100 dark:from-rose-900/40 dark:via-slate-800/80 dark:to-amber-900/40 border border-rose-200/50 dark:border-rose-800/60 shadow-md shadow-rose-100/50 dark:shadow-none';
   } else if (item.vip) {
      cardStyleClass = 'bg-gradient-to-br from-amber-50 to-amber-100/80 dark:from-amber-900/30 dark:to-slate-800/80 border border-amber-200/60 dark:border-amber-800/60 shadow-md shadow-amber-100/40 dark:shadow-none';
   } else if (item.isOverdue) {
      cardStyleClass = 'bg-gradient-to-br from-rose-50 to-rose-100/80 dark:from-rose-900/30 dark:to-slate-800/80 border border-rose-200/60 dark:border-rose-800/60 shadow-md shadow-rose-100/40 dark:shadow-none';
   }

   // Progress Bar
   const renderProgressBar = (customHeight = "h-2") => {
      const stage = item.stage;
      let wBacklog = '0%', wPrep = '0%', wCarp = '0%', wPaint = '0%', wDisp = '0%';
      if (stage === 'Zásobník') { wBacklog = '100%'; }
      else if (stage === 'Příprava') { wBacklog = '20%'; wPrep = '60%'; }
      else if (stage === 'Truhlárna') { wBacklog = '10%'; wPrep = '25%'; wCarp = '50%'; }
      else if (stage === 'Lakovna') { wBacklog = '10%'; wPrep = '20%'; wCarp = '30%'; wPaint = '30%'; }
      else if (stage === 'Expedice') { wBacklog = '10%'; wPrep = '15%'; wCarp = '25%'; wPaint = '25%'; wDisp = '25%'; }

      return (
         <div className={`flex-1 ${customHeight} bg-black/5 dark:bg-white/5 rounded-full overflow-hidden flex transition-colors`}>
            <div style={{ width: wBacklog }} className="h-full bg-slate-400 opacity-60"></div>
            <div style={{ width: wPrep }} className="h-full bg-blue-500 opacity-80"></div>
            <div style={{ width: wCarp }} className="h-full bg-orange-500 opacity-80"></div>
            <div style={{ width: wPaint }} className="h-full bg-purple-500 opacity-80"></div>
            <div style={{ width: wDisp }} className="h-full bg-emerald-500 opacity-80"></div>
         </div>
      );
   };

   const dateCreated = safeDates.ordered ? new Date(safeDates.ordered).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' }) : '---';

   return (
      <Draggable draggableId={item.projectId} index={index}>
         {(provided, snapshot) => (
            <div
               ref={provided.innerRef}
               {...provided.draggableProps}
               {...provided.dragHandleProps}
               style={{ ...provided.draggableProps.style }}
               className={`
            group relative mb-3 rounded-2xl transition-all duration-300
            backdrop-blur-xl
            ${cardStyleClass}
            ${isListView ? 'hover:scale-[1.005]' : 'hover:scale-[1.01]'} hover:shadow-lg
            ${snapshot.isDragging ? 'shadow-2xl rotate-2 scale-105 z-50 bg-white dark:bg-slate-700 ring-4 ring-blue-400/20' : ''}
          `}
            >
               {/* AI REASON OVERLAY */}
               {showAiReason && item.aiReason && (
                  <div className="absolute -top-2 -right-2 z-30 bg-purple-600 text-white p-1.5 rounded-lg shadow-lg animate-bounce" title={item.aiReason}>
                     <Sparkles size={14} />
                  </div>
               )}

               {/* HLAVNÍ KARTA */}
               <div className={`${isListView ? 'p-3' : 'p-4'} cursor-pointer`} onClick={() => setIsExpanded(!isExpanded)}>

                  {/* Horní řádek */}
                  <div className="flex justify-between items-start mb-1 overflow-hidden">
                     <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 text-slate-800 dark:text-white transition-colors">
                           <span className={`${isListView ? 'text-base' : 'text-lg'} font-black tracking-tight leading-none truncate`}>{item.projectId}</span>

                           {/* Povrchy - V řádkovém zobrazení hned za ID */}
                           {isListView && (
                              <div className="flex gap-1">
                                 {uniqueCategories.map((cat) => (
                                    <span key={cat} className="text-[8px] px-1 py-0.5 rounded-md font-bold uppercase tracking-wide border bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 transition-colors">
                                       {cat}
                                    </span>
                                 ))}
                              </div>
                           )}

                           <div className="flex gap-1 shrink-0">
                              {hasAtyp && <div className="w-5 h-5 flex items-center justify-center rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50"><Ruler size={10} strokeWidth={2.5} /></div>}
                              {hasEI && <div className="w-5 h-5 flex items-center justify-center rounded-md bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-800/50"><Flame size={10} strokeWidth={2.5} /></div>}
                              {hasRw && <div className="w-5 h-5 flex items-center justify-center rounded-md bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800/50"><Ear size={10} strokeWidth={2.5} /></div>}
                              {hasRC && <div className="w-5 h-5 flex items-center justify-center rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600"><Shield size={10} strokeWidth={2.5} /></div>}
                           </div>
                        </div>
                        {isListView ? (
                           <div className="flex flex-col mt-0.5">
                              <span className="font-bold text-slate-700 dark:text-slate-200 text-xs truncate block max-w-[180px]">
                                 {item.client}
                              </span>
                              <span className={`text-[9px] font-black uppercase tracking-wider ${item.isOverdue ? 'text-rose-500' : 'text-slate-400'}`}>
                                 Termín: {item.deadline}
                              </span>
                           </div>
                        ) : (
                           <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 mt-0.5 ml-0.5 uppercase tracking-tighter">OBJ-{item.projectId}</span>
                        )}
                     </div>

                     <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="flex items-center gap-2">
                           {item.vip && (
                              <div title="VIP Priorita" className={`${isListView ? 'w-6 h-6' : 'w-7 h-7'} flex items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-amber-100 dark:border-amber-700 shadow-sm transition-colors`}>
                                 <Crown size={isListView ? 12 : 14} className="text-yellow-600 fill-yellow-200 dark:text-amber-400 dark:fill-amber-900/50" />
                              </div>
                           )}
                           {item.isOverdue && (
                              <div title="Zpoždění" className="animate-pulse filter drop-shadow-sm">
                                 <AlertTriangle size={isListView ? 16 : 18} className="text-rose-600 fill-rose-200 dark:text-rose-500 dark:fill-rose-900/50" />
                              </div>
                           )}
                           <div className="bg-white/60 dark:bg-slate-700/60 border border-white/50 dark:border-white/5 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm transition-colors">
                              <Box size={14} className="text-slate-400 dark:text-slate-500" />
                              <span className="text-xs font-black text-slate-700 dark:text-slate-200 leading-none">{totalDoors}</span>
                           </div>
                        </div>
                        {isListView && (
                           <button type="button" className="w-5 h-5 flex items-center justify-center rounded-full bg-white/50 dark:bg-slate-700/50 hover:bg-white dark:hover:bg-slate-600 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-all shadow-sm ring-1 ring-black/5 dark:ring-white/5 mt-0.5">
                              {isExpanded ? <ChevronUp size={14} strokeWidth={2.5} /> : <ChevronDown size={14} strokeWidth={2.5} />}
                           </button>
                        )}
                     </div>
                  </div>

                  {/* Klient - Pouze v dlaždicovém zobrazení (v řádkovém je pod ID) */}
                  {!isListView && (
                     <div className="mb-2">
                        <span className="font-bold text-slate-700 dark:text-slate-200 text-sm truncate block">{item.client}</span>
                     </div>
                  )}

                  {/* Povrchy - Pouze v dlaždicovém zobrazení */}
                  {!isListView && (
                     <div className="flex flex-wrap gap-1 mb-3">
                        {uniqueCategories.map((cat) => (
                           <span key={cat} className="text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wide border bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 transition-colors">
                              {cat}
                           </span>
                        ))}
                     </div>
                  )}

                  {/* Grid Data */}
                  {!isListView && (
                     <div className="grid grid-cols-3 gap-0 bg-white/40 dark:bg-slate-900/40 rounded-lg border border-white/40 dark:border-white/5 mb-3 overflow-hidden transition-colors">
                        <div className="flex flex-col items-center py-1">
                           <span className="text-[7px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wide">Vystaveno</span>
                           <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300">{dateCreated}</span>
                        </div>
                        <div className="flex flex-col items-center py-1 border-l border-white/40 dark:border-white/5 bg-white/20 dark:bg-white/5">
                           <span className="text-[7px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wide">Výroba</span>
                           <span className={`text-[9px] font-black ${item.isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-100'}`}>{item.deadline}</span>
                        </div>
                        <div className="flex flex-col items-center py-1 border-l border-white/40 dark:border-white/5">
                           <span className="text-[7px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wide">Předáno</span>
                           <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300">12/25</span>
                        </div>
                     </div>
                  )}

                  {/* Patička s rozbalením - Pouze v dlaždicovém zobrazení */}
                  {!isListView && (
                     <div className="flex items-center gap-3">
                        {renderProgressBar()}
                        <button type="button" className="w-6 h-6 flex items-center justify-center rounded-full bg-white/50 dark:bg-slate-700/50 hover:bg-white dark:hover:bg-slate-600 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-all shadow-sm ring-1 ring-black/5 dark:ring-white/5">
                           {isExpanded ? <ChevronUp size={16} strokeWidth={2.5} /> : <ChevronDown size={16} strokeWidth={2.5} />}
                        </button>
                     </div>
                  )}
               </div>

               {/* VNOŘENÉ KOMPAKTNÍ KARTY */}
               {isExpanded && (
                  <div className="bg-white/50 dark:bg-slate-900/30 border-t border-white/40 dark:border-white/5 px-3 py-3 text-xs animate-in slide-in-from-top-1 duration-200 rounded-b-2xl transition-colors">
                     <div className="space-y-1 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                        {safeItems.map((door, idx) => (
                           <CompactDoorCard key={door.id} door={door} index={idx} />
                        ))}
                     </div>
                  </div>
               )}
            </div>
         )}
      </Draggable>
   );
});

export default GlassCard;