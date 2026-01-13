import React from 'react';
import { BarChart3 } from 'lucide-react';

const ProductionBalanceCard = ({ data }) => {
   if (!data || !Array.isArray(data) || data.length === 0) {
      return (
         <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
            <BarChart3 size={24} className="mb-2 opacity-20" />
            <span className="text-xs">Žádná data k dispozici</span>
         </div>
      );
   }

   const maxVal = Math.max(...data.map(d => Math.max(d.ordered, d.finished))) * 1.2 || 10;

   return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden h-full flex flex-col transition-colors">

         {/* Hlavička */}
         <div className="flex justify-between items-start mb-6 z-10">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg transition-colors">
                  <BarChart3 size={18} />
               </div>
               <div>
                  <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wide">Výrobní bilance</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Posledních 6 měsíců</p>
               </div>
            </div>

            {/* Legenda */}
            <div className="flex gap-4 text-[10px] font-semibold uppercase tracking-wider bg-slate-50 dark:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-600 transition-colors">
               <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <div className="w-2.5 h-2.5 bg-slate-200 dark:bg-slate-600 rounded-sm"></div> Obj.
               </div>
               <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
                  <div className="w-2.5 h-2.5 bg-blue-600 dark:bg-blue-500 rounded-sm"></div> Vyr.
               </div>
            </div>
         </div>

         {/* Graf */}
         <div className="flex-1 flex items-end justify-between gap-3 relative z-10 px-1 pb-1">
            {/* Mřížka */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-30 dark:opacity-10">
               <div className="w-full h-px bg-slate-100 dark:bg-slate-500"></div>
               <div className="w-full h-px bg-slate-100 dark:bg-slate-500"></div>
               <div className="w-full h-px bg-slate-100 dark:bg-slate-500"></div>
            </div>

            {data.map((m, i) => (
               <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group relative">

                  {/* Sloupce */}
                  <div className="w-full flex justify-center items-end gap-1 h-full pb-8">
                     {/* Objednáno */}
                     <div
                        className="w-1/3 bg-slate-200 dark:bg-slate-600 rounded-t-sm relative group-hover:bg-slate-300 dark:group-hover:bg-slate-500 transition-colors min-h-[4px]"
                        style={{ height: `${(m.ordered / maxVal) * 100}%` }}
                     ></div>
                     {/* Vyrobeno */}
                     <div
                        className="w-1/3 bg-blue-600 dark:bg-blue-500 rounded-t-sm relative group-hover:bg-blue-700 dark:group-hover:bg-blue-400 transition-colors min-h-[4px]"
                        style={{ height: `${(m.finished / maxVal) * 100}%` }}
                     ></div>
                  </div>

                  {/* Popisek */}
                  <span className="absolute bottom-0 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{m.name}</span>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-800 dark:bg-slate-900 text-white text-[10px] px-2 py-1.5 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 whitespace-nowrap">
                     <div className="font-semibold mb-0.5">{m.fullName}</div>
                     <div className="flex gap-2">
                        <span className="text-slate-300 dark:text-slate-400">Obj: {m.ordered}</span>
                        <span className="text-blue-200 dark:text-blue-300">Vyr: {m.finished}</span>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
};

export default ProductionBalanceCard;