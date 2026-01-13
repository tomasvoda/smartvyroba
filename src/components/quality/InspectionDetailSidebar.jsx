import { Shield, AlertTriangle, ChevronRight, Layout, Edit2, Eye, HelpCircle } from 'lucide-react';

const glassSub = "rounded-[24px] border border-white/50 dark:border-slate-800/40 backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 shadow-sm";

export default function InspectionDetailSidebar({ inspection, onDefectClick, onReturnToLab, activeDefectId }) {
    if (!inspection) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 opacity-50">
                <Shield size={48} strokeWidth={1} />
                <p className="text-[10px] font-black uppercase tracking-widest text-center">Vyberte záznam pro zobrazení detailu</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col gap-6 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Průběžný detail</h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{inspection.id} | {new Date(inspection.timestamp).toLocaleTimeString()}</p>
                </div>
                {inspection.dimensions && (
                    <div className="text-right">
                        <div className="text-[10px] font-black text-slate-800 uppercase tracking-tight">{inspection.dimensions.width} <span className="text-slate-400">×</span> {inspection.dimensions.height}</div>
                        <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">mm</div>
                    </div>
                )}
            </div>

            {/* Smaller Preview - Focused on first defect or neutral overview */}
            <div className="relative h-48 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl group bg-slate-100">
                {inspection.defects?.length > 0 ? (
                    <div className="w-full h-full relative">
                        <img
                            src={inspection.image}
                            alt="Scan preview"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            style={{
                                objectPosition: `${inspection.defects[0]?.box?.left || 50}% ${inspection.defects[0]?.box?.top || 50}%`
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-60" />
                    </div>
                ) : (
                    <img src={inspection.image} alt="Scan preview" className="w-full h-full object-cover" />
                )}

                {/* Status Badge */}
                <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-xl backdrop-blur-md ${inspection.action === 'APPROVE' ? 'bg-emerald-500/90 border-emerald-400 text-white' :
                    (inspection.action === 'REPAIR' || inspection.action === 'OPRAVA') ? 'bg-amber-500/90 border-amber-400 text-white' :
                        (inspection.action === 'REPAINT' || inspection.action === 'LAKOVAT') ? 'bg-red-600/90 border-red-500 text-white ring-2 ring-red-400/50' :
                            (inspection.action === 'DRAFT' || inspection.action === 'ROZPRACOVÁNO') ? 'bg-slate-400/90 border-slate-300 text-white' :
                                'bg-slate-500/90 border-slate-400 text-white'
                    }`}>
                    {inspection.action === 'APPROVE' ? 'Schváleno' :
                        (inspection.action === 'REPAIR' || inspection.action === 'OPRAVA') ? 'K opravě' :
                            (inspection.action === 'REPAINT' || inspection.action === 'LAKOVAT') ? 'Přelakovat' :
                                (inspection.action === 'DRAFT' || inspection.action === 'ROZPRACOVÁNO') ? 'Rozpracováno' :
                                    'Konzultace'}
                </div>

                <div className="absolute bottom-4 left-4">
                    <span className="text-[8px] font-black text-white/80 uppercase tracking-[0.2em] drop-shadow-md">Náhled kontroly</span>
                </div>
            </div>

            {/* High-density Defect List */}
            <div className="flex-1 flex flex-col gap-3 min-h-0">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Layout size={12} /> Nálezy ({inspection.defects?.length || 0})
                </h4>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                    {(!inspection.defects || inspection.defects.length === 0) ? (
                        <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/40 text-center">
                            <p className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest italic">Žádné vady</p>
                        </div>
                    ) : (
                        inspection.defects.map((d, idx) => (
                            <button
                                key={d.id || idx}
                                onClick={() => onDefectClick && onDefectClick(d)}
                                className={`w-full p-3 bg-white/40 dark:bg-slate-800/40 rounded-xl border flex items-center justify-between group transition-all shadow-sm text-left ${activeDefectId === d.id
                                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-md ring-1 ring-blue-500/20'
                                    : 'border-slate-100/50 dark:border-slate-800/50 hover:border-blue-400 hover:bg-white'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${activeDefectId === d.id ? 'bg-blue-500 animate-pulse' : (d.isManual ? 'bg-purple-500' : 'bg-emerald-500')}`} />
                                    <div>
                                        <div className="text-[10px] font-black text-slate-700 dark:text-white uppercase tracking-tight">{d.label || (d.type === 'SCRATCH' ? 'Škrábanec' : 'Nečistota')}</div>
                                        <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{d.severity || 'Základní'} • {d.isManual ? 'Manuální' : 'AI'}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {d.needsConsultation && <HelpCircle size={12} className="text-amber-500" />}
                                    <span className="text-[9px] font-black text-blue-600 group-hover:text-blue-500">{d.measurements?.size || 0}mm</span>
                                    <Eye size={12} className="text-blue-600" />
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>
            {/* Return to Lab Action */}
            <button
                onClick={onReturnToLab}
                className="w-full py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-100 dark:border-blue-800 font-black text-[10px] uppercase tracking-widest hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all flex items-center justify-center gap-2"
            >
                <Layout size={14} /> Revize v laboratoři
            </button>

            {/* Inspector info - Minimal style */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center text-[7px] font-black italic">VP</div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Václav P.</span>
                </div>
                <div className="flex items-center gap-1.5 opacity-40">
                    <Shield size={10} className="text-slate-400" />
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Verified</span>
                </div>
            </div>

            {/* System Engine Note - Advice Style */}
            <div className={`p-3 rounded-2xl border border-slate-100/60 bg-slate-50/20 flex items-center gap-3`}>
                <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
                    <Shield size={14} className="text-slate-400" />
                </div>
                <div className="flex-1">
                    <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-tight">Smart Factory QC Engine v3.0</p>
                    <p className="text-[7px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">Všechny parametry monitorovány.</p>
                </div>
            </div>
        </div>
    );
}
