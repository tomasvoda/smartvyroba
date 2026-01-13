import React from 'react';
import {
   Box, Hammer, PaintBucket, Crown, AlertCircle, Activity, Layers,
   Clock
} from 'lucide-react';

// --- 1. PRŮBĚŽNÁ DOBA (TIME TRAIN) ---
export const LeadTimeCard = ({ times }) => {
   if (!times) return null;
   const totalDays = Object.values(times).reduce((a, b) => a + b, 0);
   const totalWeeks = (totalDays / 5).toFixed(1);

   const stages = [
      { id: 'backlog', label: 'Zásobník', val: times.backlog, short: 'ZÁS', color: 'bg-slate-300 dark:bg-slate-600' },
      { id: 'prep', label: 'Příprava', val: times.prep, short: 'PŘÍP', color: 'bg-sky-400 dark:bg-sky-500' },
      { id: 'carp', label: 'Truhlárna', val: times.carp, short: 'TRUH', color: 'bg-amber-400 dark:bg-amber-500' },
      { id: 'paint', label: 'Lakovna', val: times.paint, short: 'LAK', color: 'bg-violet-400 dark:bg-violet-500' },
      { id: 'dispatch', label: 'Expedice', val: times.dispatch, short: 'EXP', color: 'bg-emerald-400 dark:bg-emerald-500' },
   ];

   return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-full relative overflow-hidden transition-colors">
         <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
               <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl transition-colors">
                  <Clock size={20} strokeWidth={2} />
               </div>
               <div>
                  <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wide">Průběžná doba</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Dny ve výrobě</p>
               </div>
            </div>
            <div className="text-right">
               <span className="block text-3xl font-black text-slate-800 dark:text-white leading-none">{totalDays}</span>
               <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 block">{totalWeeks} prac. týdnů</span>
            </div>
         </div>

         <div className="flex-1 flex flex-col justify-center">
            <div className="flex w-full h-12 rounded-lg overflow-hidden gap-0.5 shadow-inner bg-slate-100 dark:bg-slate-900 transition-colors">
               {stages.map((s) => (
                  <div
                     key={s.id}
                     className={`h-full ${s.color} relative group transition-all hover:brightness-95`}
                     style={{ width: `${(s.val / totalDays) * 100}%` }}
                     title={`${s.label}: ${s.val} dní`}
                  >
                  </div>
               ))}
            </div>

            <div className="flex justify-between mt-4 px-1">
               {stages.map((s) => {
                  const weeks = (s.val / 5).toFixed(1);
                  return (
                     <div key={s.id} className="flex flex-col items-center text-center">
                        <div className={`w-2 h-2 rounded-full mb-1.5 ${s.color}`}></div>
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">{s.short}</span>
                        <span className="text-sm font-black text-slate-700 dark:text-slate-200 leading-none">{s.val}</span>
                        <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">{weeks}t</span>
                     </div>
                  );
               })}
            </div>
         </div>
      </div>
   );
};

// --- 2. SJEDNOCENÁ KARTA STŘEDISEK ---
export const UnifiedDepartmentsCard = ({ prepData, carpData, paintData, prepAvg, carpAvg, paintAvg }) => {
   const safePrepData = prepData || [];
   const safeCarpData = carpData || [];
   const safePaintData = paintData || [];

   const depts = [
      { title: 'Příprava', icon: Box, data: safePrepData, avg: prepAvg, color: 'text-sky-600 dark:text-sky-400', bar: 'bg-sky-200 dark:bg-sky-600/50' },
      { title: 'Truhlárna', icon: Hammer, data: safeCarpData, avg: carpAvg, color: 'text-amber-600 dark:text-amber-400', bar: 'bg-amber-200 dark:bg-amber-600/50' },
      { title: 'Lakovna', icon: PaintBucket, data: safePaintData, avg: paintAvg, color: 'text-violet-600 dark:text-violet-400', bar: 'bg-violet-200 dark:bg-violet-600/50' },
   ];

   const allValues = [...safePrepData, ...safeCarpData, ...safePaintData].map(d => d.val);
   const maxVal = Math.max(...allValues) * 1.1 || 10;

   return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-full overflow-hidden transition-colors">
         <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg transition-colors"><Activity size={18} /></div>
            <div>
               <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wide">Výkonnost středisek</h3>
               <p className="text-xs text-slate-400 dark:text-slate-500">Týdenní produkce (ks)</p>
            </div>
         </div>

         <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-10 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-700">
            {depts.map((d, idx) => {
               const Icon = d.icon;
               return (
                  <div key={idx} className={`flex flex-col h-full relative ${idx > 0 ? 'pt-6 md:pt-0 md:pl-10' : ''}`}>
                     <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-2">
                           <Icon size={16} className={d.color} strokeWidth={2.5} />
                           <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{d.title}</span>
                        </div>
                        <div className="text-right">
                           <span className="block text-2xl font-bold text-slate-800 dark:text-white leading-none">{d.avg || 0}</span>
                           <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wide">Ø Týden</span>
                        </div>
                     </div>

                     <div className="flex-1 relative h-full">
                        <div className="absolute inset-0 flex items-end justify-between gap-1.5 z-10">
                           {d.data.map((item, i) => (
                              <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                                 <div
                                    className={`w-full ${d.bar} rounded-sm transition-all relative group-hover:brightness-90`}
                                    style={{ height: `${(item.val / maxVal) * 100}%` }}
                                 >
                                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-800 dark:bg-slate-950 text-white text-[9px] px-1.5 py-0.5 rounded transition-opacity whitespace-nowrap z-50 shadow-xl ring-1 ring-white/10">
                                       {item.val}
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               )
            })}
         </div>
      </div>
   );
};

// --- 3. WIP FUNNEL ---
export const WipFunnelCard = ({ wip }) => {
   if (!wip) return null;
   const total = Object.values(wip).reduce((a, b) => a + b, 0);
   const stages = [
      { label: 'Zásobník', val: wip.backlog, color: 'bg-slate-200 dark:bg-slate-600' },
      { label: 'Příprava', val: wip.prep, color: 'bg-sky-400 dark:bg-sky-500' },
      { label: 'Truhlárna', val: wip.carp, color: 'bg-amber-400 dark:bg-amber-500' },
      { label: 'Lakovna', val: wip.paint, color: 'bg-violet-400 dark:bg-violet-500' },
      { label: 'Expedice', val: wip.dispatch, color: 'bg-emerald-400 dark:bg-emerald-500' },
   ];

   return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 h-full flex flex-col transition-colors">
         <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg transition-colors"><Layers size={18} /></div>
            <div>
               <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wide">Tok výroby</h3>
               <p className="text-xs text-slate-400 dark:text-slate-500">Aktuální stav (ks)</p>
            </div>
         </div>

         <div className="flex-1 flex flex-col justify-center gap-4 relative pl-4">
            <div className="absolute left-[19px] top-4 bottom-4 w-px bg-slate-100 dark:bg-slate-700 transition-colors"></div>

            {stages.map((s, i) => (
               <div key={i} className="flex items-center gap-4 relative z-10 group">
                  <div className={`w-2.5 h-2.5 rounded-full ${s.color} ring-4 ring-white dark:ring-slate-800 transition-all`}></div>

                  <div className="flex-1 min-w-0">
                     <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{s.label}</span>
                        <span className="font-bold text-slate-800 dark:text-white text-sm">{s.val}</span>
                     </div>
                     <div className="h-1.5 w-full bg-slate-50 dark:bg-slate-900 rounded-full overflow-hidden transition-colors">
                        <div className={`h-full rounded-full ${s.color} opacity-80`} style={{ width: `${Math.max(2, (s.val / total) * 100)}%` }}></div>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
};

// --- 4. POVRCHY ---
export const SurfacesCard = ({ surfacesData }) => {
   if (!surfacesData) return null;

   return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 h-full flex flex-col transition-colors">
         <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg transition-colors"><PaintBucket size={18} /></div>
            <div>
               <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wide">Povrchové úpravy</h3>
            </div>
         </div>

         <div className="flex-1 flex flex-col justify-center gap-5">
            <div>
               <div className="flex justify-between mb-1.5 items-end">
                  <span className="font-semibold text-xs text-slate-700 dark:text-slate-300">Materiálový mix</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase">{surfacesData.totals.global} ks celkem</span>
               </div>

               <div className="flex h-2.5 w-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-900 transition-colors">
                  {surfacesData.row1.map(item => (
                     <div key={item.name} style={{ width: `${item.percent}%` }} className={`h-full ${item.color}`}></div>
                  ))}
               </div>

               <div className="grid grid-cols-3 gap-2 mt-2">
                  {surfacesData.row1.map(item => (
                     <div key={item.name} className="flex flex-col">
                        <div className="flex items-center gap-1.5 mb-0.5">
                           <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.color}`}></div>
                           <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase truncate">{item.name}</span>
                        </div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">
                           {item.percent}% <span className="text-[9px] text-slate-400 dark:text-slate-500 font-normal ml-0.5">({item.val})</span>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            <div className="h-px bg-slate-50 dark:bg-slate-700 w-full transition-colors"></div>

            <div>
               <div className="flex justify-between mb-1.5 items-end">
                  <span className="font-semibold text-xs text-slate-700 dark:text-slate-300">Detail lakování</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase">{surfacesData.totals.painted} ks lak</span>
               </div>

               <div className="flex h-2.5 w-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-900 transition-colors">
                  {surfacesData.row2.map(item => (
                     <div key={item.name} style={{ width: `${item.percent}%` }} className={`h-full ${item.color}`}></div>
                  ))}
               </div>

               <div className="grid grid-cols-3 gap-2 mt-2">
                  {surfacesData.row2.map(item => (
                     <div key={item.name} className="flex flex-col">
                        <div className="flex items-center gap-1.5 mb-0.5">
                           <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.color.includes('border') ? 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600' : item.color}`}></div>
                           <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase truncate">{item.name}</span>
                        </div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">
                           {item.percent}% <span className="text-[9px] text-slate-400 dark:text-slate-500 font-normal ml-0.5">({item.val})</span>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
   );
};

// --- 5. SEZNAM ---
export const ListCard = ({ title, items, type, navigate }) => {
   const isVip = type === 'vip';
   const Icon = isVip ? Crown : AlertCircle;

   return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-full transition-colors">
         <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400`}>
               <Icon size={18} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wide">{title}</h3>
            <span className="ml-auto text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-700 px-2 py-1 rounded-md transition-colors">{items ? items.length : 0}</span>
         </div>

         <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {items && items.map(item => (
               <div
                  key={item.id}
                  onClick={() => navigate('/production')}
                  className="group p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-sm transition-all cursor-pointer flex flex-col gap-2 bg-white dark:bg-slate-800"
               >
                  <div className="flex justify-between items-start">
                     <span className="font-bold text-slate-800 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.project}</span>
                     {isVip && <Crown size={12} className="text-amber-400 fill-amber-400" />}
                     {!isVip && <span className="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/30 px-1.5 py-0.5 rounded border border-rose-100 dark:border-rose-800/50 transition-colors">{item.deadline}</span>}
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                     <span className="truncate max-w-[120px]">{item.client}</span>
                     <div className="flex items-center gap-3">
                        <span className="bg-slate-50 dark:bg-slate-900 px-1.5 rounded text-[10px] font-medium text-slate-400 dark:text-slate-500 transition-colors">{item.items ? item.items.length : 0} ks</span>
                        {isVip && <span className="font-medium text-amber-600 dark:text-amber-400">{item.deadline}</span>}
                     </div>
                  </div>
               </div>
            ))}
            {(!items || items.length === 0) && (
               <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
                  <span className="text-xs">Žádné položky</span>
               </div>
            )}
         </div>
      </div>
   );
};