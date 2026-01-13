import React from 'react';
import {
    AlertTriangle, Check, X, ArrowRight, User,
    Calendar, Shield, Info, MoreVertical, Edit2, Trash2, Eye, Sparkles, RotateCcw, Ruler, Zap, HelpCircle
} from 'lucide-react';

const glassSub = "rounded-[24px] border border-white/50 dark:border-slate-800/40 backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 shadow-sm";
const glassChip = "rounded-xl border border-white/80 dark:border-slate-800/70 backdrop-blur bg-white/85 dark:bg-slate-900/80 shadow-sm";

export default function QualityInspectorPanel({ inspection, onVerdict, onDefectAction, onShowDetail, onDeleteDefect, onRunAI, isAiLoading, aiSummary }) {
    if (!inspection) return null;
    const defects = inspection.defects || [];

    return (
        <div className="h-full flex flex-col gap-6 overflow-hidden">
            {/* Context Info */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Informace o dílu</h3>
                    <div className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[8px] font-black uppercase tracking-widest border border-blue-100">
                        {inspection.scanMode === 'SINGLE' ? 'Standard' : 'Detail'}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Inspektor</p>
                        <div className="flex items-center gap-2">
                            <div className="w-5 min-w-[20px] h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[8px] font-black">VP</div>
                            <span className="text-[9px] font-black text-slate-700 dark:text-slate-200 uppercase">Václav P.</span>
                        </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Datum</p>
                        <div className="flex items-center gap-2">
                            <Calendar size={12} className="text-slate-400" />
                            <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase">Dnes 07:25</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Defects List */}
            <div className="flex-1 flex flex-col gap-3 min-h-0">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Seznam nálezů ({defects.length})</h3>


                {/* AI Summary Comment Card (Styled like measurement instructions) */}

                <div className="flex-1 overflow-y-auto px-4 -mx-4 space-y-3">
                    {defects.length === 0 ? (
                        <div className="py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-300">
                            <Shield size={32} strokeWidth={1} />
                            <p className="text-[10px] uppercase font-black tracking-widest mt-4">Žádné vady nebyly nalezeny</p>
                        </div>
                    ) : (
                        defects.map(d => (
                            <div
                                key={d.id}
                                className={`group p-3 rounded-2xl border transition-all ${d.status === 'O.K.' ? 'bg-gradient-to-r from-emerald-500/5 via-emerald-50/20 to-white dark:from-emerald-500/10 dark:to-slate-900 border-emerald-200/50' :
                                    d.status === 'Oprava' ? 'bg-gradient-to-r from-amber-500/5 via-amber-50/20 to-white dark:from-amber-500/10 dark:to-slate-900 border-amber-200/50' :
                                        d.status === 'LAKOVAT' ? 'bg-gradient-to-r from-red-500/5 via-red-50/20 to-white dark:from-red-500/10 dark:to-slate-900 border-red-200/50' :
                                            'bg-white dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'
                                    } hover:border-blue-400/30 shadow-sm`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${d.isManual ? 'bg-purple-500' : (d.isAi || d.isAiGenerated) ? 'bg-emerald-500' : 'bg-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.5)]'}`} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="text-[9px] font-black text-slate-700 dark:text-slate-200 uppercase truncate">{d.label || 'DEFEKT'}</span>
                                                {d.needsConsultation && (
                                                    <span className="px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[6px] font-black uppercase tracking-tighter">Konzultace</span>
                                                )}
                                                <span className="text-slate-300 dark:text-slate-600 font-light text-[8px]">|</span>
                                                {d.measurements?.size && d.measurements.size > 0 ? (
                                                    <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 tabular-nums">{d.measurements.size} mm</span>
                                                ) : (
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic leading-none">- neměřeno</span>
                                                )}
                                                {d.isAiGenerated && d.confidence && (
                                                    <span className="text-[7px] font-black text-blue-400/60 uppercase tracking-widest leading-none">[{d.confidence}%]</span>
                                                )}
                                                {d.needsConsultation && (
                                                    <HelpCircle size={10} className="text-amber-500 animate-pulse" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => onShowDetail && onShowDetail(d)}
                                            className="p-1.5 hover:bg-white dark:hover:bg-slate-800 hover:text-blue-600 rounded-lg text-slate-400 transition-colors shadow-sm"
                                            title="Zobrazit detail"
                                        >
                                            <Eye size={12} />
                                        </button>
                                        <button
                                            onClick={() => onDeleteDefect && onDeleteDefect(d.id)}
                                            className="p-1.5 hover:bg-rose-50 hover:text-rose-500 rounded-lg text-slate-400 transition-colors"
                                            title="Smazat vadu"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-1.5 bg-slate-100/50 dark:bg-slate-900/50 p-1 rounded-xl">
                                    {['O.K.', 'Oprava', 'LAKOVAT'].map(action => (
                                        <button
                                            key={action}
                                            onClick={() => onDefectAction && onDefectAction(d.id, action)}
                                            className={`flex-1 py-1.5 rounded-lg text-[7px] font-black uppercase tracking-widest transition-all border-2 ${d.status === action
                                                ? 'bg-white dark:bg-slate-800 border-blue-500 text-blue-600 shadow-md scale-[1.02]'
                                                : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'
                                                }`}
                                        >
                                            {action}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>


            {/* AI Analysis Trigger & Final Verdicts */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <button
                    disabled={isAiLoading}
                    className={`w-full group flex items-center gap-3 px-5 py-3 bg-white hover:bg-slate-50 text-slate-900 rounded-2xl shadow-xl transition-all border border-slate-200 ${isAiLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => onRunAI && onRunAI()}
                >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform ${isAiLoading ? 'bg-slate-100 animate-spin' : 'bg-blue-50 group-hover:scale-110'}`}>
                        {isAiLoading ? <RotateCcw size={16} className="text-blue-600" /> : <Sparkles size={16} className="text-blue-600" />}
                    </div>
                    <div className="flex flex-col items-start translate-y-[-1px]">
                        <span className="text-[10px] font-black uppercase tracking-[0.15em] leading-none">
                            {isAiLoading ? 'Probíhá analýza...' : 'Analýza AI'}
                        </span>
                        {!isAiLoading && <span className="text-[7px] font-bold text-slate-400 uppercase mt-1">Pokročilá analýza obrazu</span>}
                    </div>
                </button>

                {(() => {
                    const noDefects = defects.length === 0;
                    const allOk = defects.length > 0 && defects.every(d => d.status === 'O.K.');
                    const hasRepaint = defects.some(d => d.status === 'LAKOVAT');
                    const hasRepair = defects.some(d => d.status === 'Oprava');

                    let verdictLabel = "Nedefinováno";
                    let verdictColor = "bg-slate-500 shadow-slate-500/20";
                    let verdictType = "CONSULT";

                    if (noDefects || allOk) {
                        verdictLabel = "Schválit a uložit";
                        verdictType = "APPROVE";
                    } else if (hasRepaint) {
                        verdictLabel = "PŘELAKOVAT";
                        verdictType = "LAKOVAT";
                    } else if (hasRepair) {
                        verdictLabel = "Opravit a uložit";
                        verdictType = "OPRAVA";
                    }

                    // Standard brand blue for the save button
                    verdictColor = "bg-blue-600 shadow-blue-500/40 ring-4 ring-blue-500/20";

                    return (
                        <button
                            onClick={() => onVerdict && onVerdict(verdictType)}
                            className={`w-full h-14 ${verdictColor} text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95`}
                        >
                            <Check size={18} /> {verdictLabel}
                        </button>
                    );
                })()}
            </div>
        </div>
    );
}
