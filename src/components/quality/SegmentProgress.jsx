import React from 'react';
import { Camera, Check, Clock } from 'lucide-react';

const glassChip = "rounded-xl border border-white/80 dark:border-slate-800/70 backdrop-blur bg-white/85 dark:bg-slate-900/80 shadow-sm";

export default function SegmentProgress({ segments, activeIndex }) {
    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Camera size={12} /> Postup Skenování (3 díly)
            </h3>

            <div className="space-y-3">
                {[0, 1, 2].map((idx) => {
                    const isDone = segments[idx];
                    const isActive = activeIndex === idx;

                    return (
                        <div
                            key={idx}
                            className={`p-3 rounded-2xl border transition-all flex items-center gap-4 ${isActive
                                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg'
                                    : isDone
                                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/40'
                                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 opacity-60'
                                }`}
                        >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-white/20' : isDone ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                                }`}>
                                {isDone ? <Check size={16} /> : <span className="text-[10px] font-black">{idx + 1}</span>}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-tight truncate">
                                    {idx === 0 ? 'Horní část' : idx === 1 ? 'Střední část' : 'Spodní část'}
                                </p>
                                <p className={`text-[8px] font-bold uppercase tracking-widest mt-0.5 ${isActive ? 'text-white/60' : 'text-slate-400'}`}>
                                    {isDone ? 'Zachyceno' : isActive ? 'Probíhá snímání' : 'Čeká se'}
                                </p>
                            </div>

                            {isDone && (
                                <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/20">
                                    <img src={segments[idx]} className="w-full h-full object-cover" alt="Segment preview" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
