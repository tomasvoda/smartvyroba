import React, { useState } from 'react';
import { 
  Calendar, MoreHorizontal, AlertTriangle, Crown, 
  ChevronDown, ChevronUp, Box, FileText, CheckCircle2
} from 'lucide-react';

const OrderCard = ({ order, onDragStart }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Barvy podle fáze
  const getBorderColor = (stage) => {
    switch(stage) {
      case 'Příprava': return 'border-l-blue-500';
      case 'Truhlárna': return 'border-l-orange-500';
      case 'Lakovna': return 'border-l-purple-500';
      case 'Expedice': return 'border-l-emerald-500';
      default: return 'border-l-slate-300';
    }
  };

  const getProgressColor = (stage) => {
    switch(stage) {
      case 'Příprava': return 'bg-blue-500';
      case 'Truhlárna': return 'bg-orange-500';
      case 'Lakovna': return 'bg-purple-500';
      case 'Expedice': return 'bg-emerald-500';
      default: return 'bg-slate-300';
    }
  };

  // Data pro zobrazení
  const totalDoors = order.items.length;
  const mainMaterial = order.items[0]?.finishCode || 'Standard';
  
  // Vizuální výpočet progresu (jen pro efekt, v reálu by se počítalo z dat)
  const progressWidth = 
    order.stage === 'Příprava' ? '25%' :
    order.stage === 'Truhlárna' ? '50%' :
    order.stage === 'Lakovna' ? '75%' :
    '100%';

  return (
    <div 
      draggable
      onDragStart={(e) => onDragStart(e, order.projectId)}
      className={`
        bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 
        cursor-grab active:cursor-grabbing group relative mb-3 overflow-hidden 
        border border-slate-100 border-l-[4px] ${getBorderColor(order.stage)}
      `}
    >
      {/* --- HLAVNÍ ČÁST KARTY (Vždy viditelná) --- */}
      <div className="p-3" onClick={() => setIsExpanded(!isExpanded)}>
        
        {/* 1. Řádek: ID a Indikátory */}
        <div className="flex justify-between items-start mb-1">
           <div className="flex items-center gap-2">
              <span className="font-black text-slate-800 text-sm tracking-tight">{order.projectId}</span>
              {order.isVip && (
                <div className="bg-indigo-50 border border-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-1">
                   <Crown size={10} fill="currentColor"/> VIP
                </div>
              )}
              {order.isOverdue && (
                 <div className="bg-rose-50 border border-rose-100 text-rose-600 px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-1">
                    <AlertTriangle size={10} /> ZPOŽDĚNÍ
                 </div>
              )}
           </div>
           {/* Menu tečky (zatím jen vizuální) */}
           <button className="text-slate-300 hover:text-slate-600 transition-colors">
              <MoreHorizontal size={16} />
           </button>
        </div>

        {/* 2. Řádek: Klient */}
        <p className="text-xs text-slate-500 font-medium mb-3 truncate">{order.client}</p>

        {/* 3. Řádek: Štítky (Materiál + Počet) */}
        <div className="flex justify-between items-center mb-3">
           <div className="flex gap-1.5">
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold border border-slate-200">
                 {mainMaterial}
              </span>
              <span className="text-[10px] bg-white text-slate-500 px-2 py-1 rounded font-bold border border-slate-200 flex items-center gap-1">
                 <Box size={10}/> {totalDoors} ks
              </span>
           </div>
           
           {/* Datum */}
           <div className={`text-[10px] font-bold flex items-center gap-1 ${order.isOverdue ? 'text-rose-600' : 'text-slate-400'}`}>
              <Calendar size={12}/> {order.deadline}
           </div>
        </div>

        {/* 4. Řádek: Progress Bar & Toggle */}
        <div className="flex items-center gap-3">
           <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${getProgressColor(order.stage)}`} 
                style={{ width: progressWidth }}
              ></div>
           </div>
           <button 
             className="text-slate-300 hover:text-blue-600 transition-colors transform hover:scale-110"
             onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
           >
              {isExpanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
           </button>
        </div>
      </div>

      {/* --- ROZBALOVACÍ DETAIL (Položky) --- */}
      {isExpanded && (
        <div className="bg-slate-50/80 border-t border-slate-100 p-3 text-xs animate-in slide-in-from-top-1 duration-200">
           <div className="flex justify-between items-center mb-2">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Seznam dveří</h5>
              <span className="text-[9px] text-slate-400">{totalDoors} položek</span>
           </div>
           
           <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
              {order.items.map((door, idx) => (
                 <div key={door.id} className="flex justify-between items-center bg-white p-2 rounded border border-slate-200/60 shadow-sm">
                    <div className="flex items-center gap-2">
                       <span className="font-mono text-slate-300 text-[9px] w-4">#{idx + 1}</span>
                       <span className="font-bold text-slate-700">{door.dim}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-slate-500 text-[10px]">{door.finishCode}</span>
                       {door.isAtyp && (
                          <span className="text-[8px] bg-amber-50 text-amber-600 px-1 rounded border border-amber-100 font-bold">ATYP</span>
                       )}
                    </div>
                 </div>
              ))}
           </div>

           <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between items-center">
              <span className="text-[10px] text-slate-400">ID: {order.items[0]?.id} ...</span>
              <button className="text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline">
                 <FileText size={12}/> Detail zakázky
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default OrderCard;