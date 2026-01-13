import React from 'react';
import {
   Ruler, Flame, Shield, Ear, Layers
} from 'lucide-react';

const CompactDoorCard = ({ door, index }) => {
   const isSplitFinish = door.finishA && door.finishB && door.finishA !== door.finishB;
   const mainFinish = door.finishCode || door.finishA;

   return (
      <div className="flex justify-between items-center bg-white/60 dark:bg-slate-800/60 px-3 py-2.5 rounded-lg border border-white/60 dark:border-slate-700/60 shadow-sm hover:bg-white dark:hover:bg-slate-700 transition-colors mb-1.5 last:mb-0">

         {/* 1. LEVÁ ČÁST: Pozice + Typ + Rozměr */}
         <div className="flex items-center gap-3">
            <div className="flex flex-col items-center justify-center w-6 h-6 rounded bg-slate-800 dark:bg-slate-900 text-white font-mono text-[10px] shadow-sm">
               #{index + 1}
            </div>

            <div>
               <div className="flex items-center gap-2">
                  <span className="font-black text-slate-800 dark:text-white text-xs">{door.type || 'Dveře'}</span>
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-1 rounded border border-slate-200 dark:border-slate-700">
                     {door.thickness || '40'}mm
                  </span>
               </div>
               <span className="font-bold text-slate-600 dark:text-slate-400 text-[10px] block mt-0.5">{door.dim}</span>
            </div>
         </div>

         {/* 2. STŘED: Povrchová úprava */}
         <div className="flex flex-col items-end mx-4 flex-1">
            {isSplitFinish ? (
               <div className="flex flex-col items-end gap-0.5 w-full">
                  <div className="flex justify-end items-center gap-1 text-[9px] w-full">
                     <span className="text-slate-400 dark:text-slate-500 font-bold text-[8px]">A:</span>
                     <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{door.finishA}</span>
                  </div>
                  <div className="flex justify-end items-center gap-1 text-[9px] w-full border-t border-slate-200/50 dark:border-slate-700/50 pt-0.5">
                     <span className="text-slate-400 dark:text-slate-500 font-bold text-[8px]">B:</span>
                     <span className="font-bold text-slate-600 dark:text-slate-400 truncate max-w-[120px]">{door.finishB}</span>
                  </div>
               </div>
            ) : (
               <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded border border-slate-200/60 dark:border-slate-700/60 transition-colors">
                  <Layers size={10} className="text-slate-400 dark:text-slate-500" />
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate max-w-[140px]">{mainFinish}</span>
               </div>
            )}
         </div>

         {/* 3. PRAVÁ ČÁST: Technické ikony */}
         <div className="flex gap-1 shrink-0">
            {door.isAtyp && <div title="ATYP" className="p-1 rounded bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 transition-colors"><Ruler size={12} strokeWidth={2.5} /></div>}
            {door.trait === 'EI' && <div title="Požární" className="p-1 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 transition-colors"><Flame size={12} strokeWidth={2.5} /></div>}
            {door.trait === 'Rw' && <div title="Akustické" className="p-1 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 transition-colors"><Ear size={12} strokeWidth={2.5} /></div>}
            {door.trait === 'RC' && <div title="Bezpečnostní" className="p-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"><Shield size={12} strokeWidth={2.5} /></div>}
         </div>
      </div>
   );
};

export default CompactDoorCard;