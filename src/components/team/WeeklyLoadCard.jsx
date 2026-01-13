import React from 'react';
import { AlertCircle } from 'lucide-react';

const WeeklyLoadCard = ({ weekNumber, percent, hours, max, barColor, isCurrent }) => {
    const safePercent = isNaN(percent) ? 0 : percent;
    const isOverload = safePercent > 100;

    const safeBarColor = barColor || 'bg-slate-500';
    const fillColor = isOverload ? 'bg-rose-100' : safeBarColor.replace('text-', 'bg-').replace('600', '100').replace('700', '100');
    const textColor = isOverload ? 'text-rose-600' : 'text-slate-700';
    const borderClass = isCurrent ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200';

    return (
        <div className={`relative overflow-hidden rounded-xl border ${borderClass} bg-white h-20 flex flex-col justify-between p-2 shadow-sm group hover:border-blue-300 transition-all w-full`}>
            <div className={`absolute bottom-0 left-0 w-full transition-all duration-1000 ease-out ${fillColor}`} style={{ height: `${Math.min(safePercent, 100)}%` }} />
            <div className="relative z-10 flex justify-between items-start">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        {weekNumber}. Týden
                        {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">{hours || 0}h / {max || 0}h</span>
                </div>
                {isOverload && <AlertCircle size={14} className="text-rose-500 animate-pulse" />}
            </div>
            <div className="relative z-10 flex items-end justify-end">
                <span className={`text-xl font-black tracking-tight ${textColor}`}>
                    {safePercent}<span className="text-[10px] font-bold opacity-60 ml-0.5">%</span>
                </span>
            </div>
        </div>
    );
};

export default WeeklyLoadCard;
