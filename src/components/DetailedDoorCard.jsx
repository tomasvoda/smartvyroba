import React from 'react';
import {
   Ruler, Flame, Shield, Ear, Key,
   DoorOpen, ScanLine, ArrowDownToLine, Settings, CheckCircle2
} from 'lucide-react';

const DetailedDoorCard = ({ door, index }) => {
   return (
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/60 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all mb-4 relative overflow-hidden group">

         {/* Dekorativní pozadí */}
         <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 dark:bg-white/5 rounded-bl-full -z-10 transition-colors" />

         {/* --- HLAVIČKA KARTY --- */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5 border-b border-slate-100 dark:border-slate-700/50 pb-4">

            <div className="flex items-center gap-4">
               {/* Číslo pozice */}
               <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-800 dark:bg-slate-900 text-white font-mono text-xl font-bold shadow-lg shadow-slate-300 dark:shadow-none transition-all">
                  #{index + 1}
               </div>

               <div>
                  <div className="flex items-center gap-2">
                     <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">{door.type || 'Dveře'}</h3>
                     <span className="text-slate-400 dark:text-slate-500 font-medium text-sm border-l border-slate-300 dark:border-slate-700 pl-2 ml-1">tl. {door.thickness || '40'}mm</span>

                     {/* Tagy */}
                     <div className="flex gap-1 ml-2">
                        {door.isAtyp && <span className="bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors"><Ruler size={10} /> ATYP</span>}
                        {door.trait && <span className="bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors"><Flame size={10} /> {door.trait}</span>}
                     </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm mt-1.5">
                     <span className="font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">{door.dim}</span>
                     <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium transition-colors">
                        <ArrowDownToLine size={14} />
                        Otevírání: <span className="text-slate-800 dark:text-slate-200 font-bold">{door.opening === 'L' ? 'Levé' : 'Pravé'}</span>
                     </span>
                  </div>
               </div>
            </div>

            {/* Povrchová úprava (Box) */}
            <div className="flex gap-1 bg-slate-100/80 dark:bg-slate-900/50 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-all">
               <div className="px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 min-w-[100px] transition-colors">
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider block mb-0.5">Strana A</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{door.finishA || door.finishCode}</span>
               </div>
               <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-800/50 rounded-lg border border-transparent min-w-[100px] transition-colors">
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider block mb-0.5">Strana B</span>
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{door.finishB || door.finishCode}</span>
               </div>
            </div>
         </div>

         {/* --- TECHNICKÁ SPECIFIKACE (GRID) --- */}
         <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

            {/* 1. Zámek */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/60 dark:bg-blue-900/20 border border-blue-100/80 dark:border-blue-800/30 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
               <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-blue-600 dark:text-blue-400 shadow-sm shrink-0 transition-colors"><Key size={18} /></div>
               <div className="overflow-hidden">
                  <span className="text-[10px] uppercase font-bold text-blue-400 dark:text-blue-500 block mb-0.5">Zámek & Kování</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block truncate">{door.lock || 'Standard'}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">{door.rosette ? '+ Rozeta' : 'Bez rozety'}</span>
               </div>
            </div>

            {/* 2. Panty */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-900/20 border border-indigo-100/80 dark:border-indigo-800/30 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">
               <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-indigo-600 dark:text-indigo-400 shadow-sm shrink-0 transition-colors"><DoorOpen size={18} /></div>
               <div className="overflow-hidden">
                  <span className="text-[10px] uppercase font-bold text-indigo-400 dark:text-indigo-500 block mb-0.5">Panty</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block truncate">{door.hinges || 'Standard'}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">{door.hingesCount || '3'} kusy</span>
               </div>
            </div>

            {/* 3. Práh */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-900/20 border border-emerald-100/80 dark:border-emerald-800/30 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors">
               <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-emerald-600 dark:text-emerald-400 shadow-sm shrink-0 transition-colors"><ScanLine size={18} /></div>
               <div className="overflow-hidden">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 dark:text-emerald-500 block mb-0.5">Spodní hrana</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block truncate">{door.dropSeal || 'Bez úpravy'}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">{door.dropSealType || '---'}</span>
               </div>
            </div>

            {/* 4. Příslušenství */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/60 dark:bg-amber-900/20 border border-amber-100/80 dark:border-amber-800/30 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors">
               <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-amber-600 dark:text-amber-400 shadow-sm shrink-0 transition-colors"><Settings size={18} /></div>
               <div className="overflow-hidden">
                  <span className="text-[10px] uppercase font-bold text-amber-400 dark:text-amber-500 block mb-0.5">Doplňky</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block truncate">{door.closer || '---'}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate" title={door.accessories}>{door.accessories || 'Žádné'}</span>
               </div>
            </div>

         </div>

         <div className="absolute bottom-5 right-5 opacity-10 group-hover:opacity-100 transition-opacity">
            <CheckCircle2 size={24} className="text-emerald-500" />
         </div>
      </div>
   );
};

export default DetailedDoorCard;