import React from 'react';
import {
    Calendar, BrainCircuit, Wrench, Sparkles, Activity,
    ChevronRight, AlertCircle, CheckCircle2, Info
} from 'lucide-react';
import { DEPARTMENTS } from '../../data/teamData';

const getStatusInfo = (percent) => {
    if (percent > 95) return {
        label: 'Kritické',
        color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/40 border-rose-100 dark:border-rose-800',
        icon: AlertCircle,
        advice: 'Přetížené oddělení'
    };
    if (percent > 85) return {
        label: 'Vysoké vytížení',
        color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/40 border-amber-100 dark:border-amber-800',
        icon: Activity,
        advice: 'Téměř plná kapacita'
    };
    if (percent < 50) return {
        label: 'Volná kapacita',
        color: 'text-sky-600 bg-sky-50 dark:bg-sky-900/40 border-sky-100 dark:border-sky-800',
        icon: Info,
        advice: 'Možnost přidat práci'
    };
    return {
        label: 'Optimální',
        color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/40 border-emerald-100 dark:border-emerald-800',
        icon: CheckCircle2,
        advice: 'Ideální stav'
    };
};

const getDeptIcon = (deptId) => {
    switch (deptId) {
        case 'VEDENI': return BrainCircuit;
        case 'PRIPRAVA': return Info;
        case 'TRUHLARNA': return Wrench;
        case 'LAKOVNA': return Sparkles;
        default: return Activity;
    }
};

const CapacityCard = ({ deptLabel, current, max, barColor, deptId, isTotal = false }) => {
    const percent = max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0;
    const status = getStatusInfo(percent);
    const Icon = isTotal ? Activity : getDeptIcon(deptId);
    const StatusIcon = status.icon;

    return (
        <div className={`group relative bg-white/50 dark:bg-slate-800/50 p-2.5 rounded-[20px] border border-slate-200/60 dark:border-slate-700/60 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-200/40 dark:hover:shadow-none hover:-translate-y-0.5 flex flex-col justify-between h-full ${isTotal ? 'ring-2 ring-blue-500/20 shadow-blue-500/5' : ''}`}>
            <div className="flex justify-between items-start mb-2.5">
                <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isTotal ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                        <Icon size={18} />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest leading-none mb-1.5">{deptLabel}</h4>
                        <div className="flex items-center gap-1.5">
                            <span className="text-lg font-black text-slate-800 dark:text-white leading-none">{percent}%</span>
                            <span className={`text-[8px] px-1 py-0.5 rounded-full font-black border flex items-center gap-1 ${status.color}`}>
                                <StatusIcon size={9} /> {status.label}
                            </span>
                        </div>
                    </div>
                </div>
                {!isTotal && (
                    <div className="text-right flex flex-col items-end">
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 leading-none mb-1">Využito</span>
                        <span className="text-[11px] font-black text-slate-700 dark:text-slate-200">{current} <span className="text-[9px] text-slate-400 font-bold tracking-tight">/ {max}h</span></span>
                    </div>
                )}
            </div>

            <div className="space-y-1.5">
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden transition-colors relative">
                    <div
                        className={`absolute h-full ${barColor} transition-all duration-1000 shadow-[0_0_8px_rgba(0,0,0,0.1)]`}
                        style={{ width: `${percent}%` }}
                    ></div>
                </div>
                <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-wider">
                    <span className="text-slate-400 dark:text-slate-500">{status.advice}</span>
                    <span className="text-slate-300 dark:text-slate-600">Max: {max}h</span>
                </div>
            </div>
        </div>
    );
};

const getBarColor = (idx) => {
    const palette = ['bg-blue-500', 'bg-amber-500', 'bg-orange-500', 'bg-purple-500'];
    return palette[idx % palette.length];
};

const GlobalCapacityOverview = ({ employees = [], weekDates = [], globalOffset = 0 }) => {
    const workingDays = weekDates.filter(d => !d.isWeekend && !d.isHoliday).length || 1;

    const cards = Object.entries(DEPARTMENTS)
        .filter(([deptId]) => deptId !== 'VEDENI')
        .map(([deptId, deptInfo], idx) => {
            const staff = employees.filter(e => e.department === deptId);
            const max = staff.length * workingDays * 8;
            let current = 0;

            weekDates.forEach((_, dayIdx) => {
                const shiftIndex = globalOffset + dayIdx;
                staff.forEach(emp => {
                    const shift = emp.shifts?.[shiftIndex];
                    if (shift && shift.hours) current += shift.hours;
                });
            });

            return {
                deptId,
                deptLabel: deptInfo.label,
                current: Math.round(current),
                max: Math.round(max),
                barColor: getBarColor(idx),
            };
        });

    const totals = cards.reduce((acc, c) => {
        acc.current += c.current;
        acc.max += c.max;
        return acc;
    }, { current: 0, max: 0 });

    return (
        <div className="mb-4 animate-in fade-in slide-in-from-top-4 duration-500 sticky top-0 z-30 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md py-3 rounded-b-[32px] -mt-4 transition-colors">
            {/* Header / Summary row */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-3.5 items-stretch">
                {/* Total utilization summary widget */}
                <div className="lg:col-span-2 h-full">
                    <CapacityCard
                        deptLabel="Celkový Load Fabriky"
                        current={totals.current}
                        max={totals.max}
                        barColor="bg-blue-600"
                        isTotal={true}
                    />
                </div>

                {/* Individual Departments - 3 columns for 3 depts */}
                <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-stretch">
                    {cards.map((card) => (
                        <div key={card.deptId} className="h-full">
                            <CapacityCard {...card} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GlobalCapacityOverview;
