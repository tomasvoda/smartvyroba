import React, { useState, useRef, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Ruler, Check, AlertTriangle, ZoomIn, ZoomOut,
    Maximize2, Info, ChevronRight, Save, Trash2, Crosshair, Zap, HelpCircle
} from 'lucide-react';

const glassMain = "rounded-[32px] border border-white/70 dark:border-slate-800/60 backdrop-blur-2xl bg-white/78 dark:bg-slate-900/78 shadow-[0_22px_70px_rgba(15,23,42,0.16)]";
const glassChip = "rounded-xl border border-white/80 dark:border-slate-800/70 backdrop-blur bg-white/85 dark:bg-slate-900/80 shadow-sm";

import { useTransformContext } from 'react-zoom-pan-pinch';

// Internal component for better zoom tracking
const ZoomControls = ({ defect, onZoom, activeZoom, setActiveZoom }) => {
    const { transformState } = useTransformContext();

    // Sync active zoom if scale matches one of the presets but state is different
    // This handles cases where user pinches to a specific zoom
    useEffect(() => {
        [1, 3, 5, 10].forEach(z => {
            if (activeZoom !== z && Math.abs(transformState.scale - z) < 0.05) {
                setActiveZoom(z);
            }
        });
    }, [transformState.scale]);

    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
            <div className="flex items-center p-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl">
                <div className="flex items-center bg-slate-50 dark:bg-white/5 rounded-xl p-0.5">
                    {[1, 3, 5, 10].map(z => {
                        const isActive = activeZoom === z;
                        return (
                            <button
                                key={z}
                                onClick={() => {
                                    setActiveZoom(z);
                                    onZoom(z);
                                }}
                                className={`px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border-2 flex flex-col items-center gap-1 ${isActive
                                    ? 'bg-white dark:bg-slate-800 border-blue-500 text-blue-600 shadow-xl scale-[1.05] z-10'
                                    : 'bg-slate-50 border-transparent text-slate-400 hover:text-slate-900 hover:bg-white hover:border-slate-200'
                                    }`}
                            >
                                <span className="block">{z}x</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default function DefectDetailModal({ isOpen, onClose, defect, image, onSave }) {
    const transformRef = useRef(null);
    const [points, setPoints] = useState([]);
    const [distance, setDistance] = useState(0);
    const [activeZoom, setActiveZoom] = useState(5);
    const [selectedType, setSelectedType] = useState('SCRATCH');
    const [needsConsultation, setNeedsConsultation] = useState(false);

    // Reset when changing defect
    useEffect(() => {
        if (defect) {
            setSelectedType(defect.type || 'SCRATCH');
            setPoints(defect.measurements?.points || []);
            setDistance(defect.measurements?.size || 0);
            setNeedsConsultation(defect.needsConsultation || false);
        }
    }, [defect]);

    const handleCanvasClick = (e) => {
        if (points.length >= 2) {
            setPoints([]); // Reset
            return;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        const newPoints = [...points, { x, y }];
        setPoints(newPoints);

        if (newPoints.length === 2) {
            const dx = newPoints[1].x - newPoints[0].x;
            const dy = newPoints[1].y - newPoints[0].y;
            const dist = (Math.sqrt(dx * dx + dy * dy) * 1.64).toFixed(1);
            setDistance(dist);

            onSave && onSave({
                ...defect,
                type: selectedType,
                needsConsultation,
                measurements: { points: newPoints, size: dist }
            }, false);
        }
    };

    if (!isOpen || !defect) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className={`relative w-full max-w-6xl h-[85vh] flex overflow-hidden ${glassMain}`}
            >
                {/* Left: Intensive View */}
                <div className="flex-1 relative bg-slate-950 flex items-center justify-center overflow-hidden">
                    <TransformWrapper
                        ref={transformRef}
                        initialScale={4}
                        minScale={1}
                        maxScale={20}
                        onInit={(instance) => {
                            setTimeout(() => {
                                if (defect && defect.box) {
                                    const element = document.getElementById(`defect-rect-${defect.id}`);
                                    if (element) {
                                        instance.zoomToElement(element, 4);
                                    }
                                }
                            }, 300);
                        }}
                        centerZoomedOut={true}
                        limitToBounds={false}
                    >
                        {({ zoomIn, zoomOut, ...instance }) => (
                            <>
                                <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }} contentStyle={{ width: '100%', height: '100%' }}>
                                    <div
                                        className="relative inline-flex items-center justify-center cursor-crosshair"
                                        style={{ minWidth: 'fit-content', minHeight: 'fit-content' }}
                                        onClick={handleCanvasClick}
                                    >
                                        <img src={image} alt="Defect Detail" className="max-w-full h-auto opacity-80 block" />

                                        {/* Measurement Layer */}
                                        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                            <rect
                                                id={`defect-rect-${defect.id}`}
                                                x={defect.box?.left || 0} y={defect.box?.top || 0}
                                                width={defect.box?.width || 0} height={defect.box?.height || 0}
                                                fill="none"
                                                stroke={defect.isManual ? "#a855f7" : "#eab308"}
                                                strokeWidth="0.1"
                                            />

                                            {points.length > 0 && points.map((p, i) => (
                                                <g key={i}>
                                                    <circle cx={p.x} cy={p.y} r="0.04" fill="#3b82f6" stroke="white" strokeWidth="0.01" />
                                                </g>
                                            ))}

                                            {points.length === 2 && (
                                                <line x1={points[0].x} y1={points[0].y} x2={points[1].x} y2={points[1].y} stroke="#3b82f6" strokeWidth="0.06" />
                                            )}
                                        </svg>
                                    </div>
                                </TransformComponent>

                                {/* Floating Scale Info - Configurator Style */}
                                <div className="absolute top-8 left-8 z-20">
                                    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-4 py-2 rounded-2xl border border-slate-200 shadow-xl flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                                            ROZMĚR DEFEKTU | <span className="text-slate-900 dark:text-white">{distance > 0 ? `${distance} MM` : 'NEMĚŘENO'}</span>
                                        </span>
                                    </div>
                                </div>

                                <ZoomControls
                                    defect={defect}
                                    activeZoom={activeZoom}
                                    setActiveZoom={setActiveZoom}
                                    onZoom={(z) => {
                                        const element = document.getElementById(`defect-rect-${defect.id}`);
                                        if (element) {
                                            instance.zoomToElement(element, z);
                                        } else {
                                            instance.setTransform(0, 0, z);
                                        }
                                    }}
                                />

                                <div className="absolute top-8 right-8 flex items-center gap-2 p-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl z-20">
                                    <button onClick={() => instance.zoomIn()} className="p-2 text-slate-400 hover:text-blue-600 transition-colors hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg"><ZoomIn size={16} /></button>
                                    <button onClick={() => instance.zoomOut()} className="p-2 text-slate-400 hover:text-blue-600 transition-colors hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg"><ZoomOut size={16} /></button>
                                </div>
                            </>
                        )}
                    </TransformWrapper>
                </div>

                {/* Right: Controls */}
                <aside className="w-[420px] flex flex-col p-8 bg-white dark:bg-slate-900 overflow-y-auto custom-scrollbar">
                    <div className="flex items-start justify-between mb-8">
                        <div className="flex flex-col gap-4 flex-1 pr-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Detail Nálezu</h2>
                                <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"><X size={20} /></button>
                            </div>

                            <div className="flex items-center gap-2">
                                {defect.isManual && (
                                    <div className="w-fit px-2 py-0.5 rounded-full bg-purple-500 text-[7px] font-black text-white uppercase tracking-widest">Manuálně</div>
                                )}
                                {defect.isAiGenerated && (
                                    <div className="w-fit px-2 py-0.5 rounded-full bg-blue-500 text-[7px] font-black text-white uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-blue-500/20 border border-blue-400">
                                        <Zap size={8} fill="white" />
                                        AI Detekce {defect.confidence && `• ${defect.confidence}%`}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-1.5 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                                <div className="flex items-center gap-2">
                                    <Ruler size={12} className="text-blue-500" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 font-black">Návod pro měření</span>
                                </div>
                                <p className="text-[10px] text-blue-700/70 dark:text-blue-400/70 font-bold leading-relaxed">
                                    Pro přesné měření vady klikněte na dva body na obrázku. Výsledný rozměr se automaticky uloží k defektu.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8 flex-1">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Klasifikace vady</label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { id: 'SCRATCH', label: 'Škrábanec', icon: AlertTriangle },
                                    { id: 'DUST', label: 'Nečistota', icon: Info },
                                    { id: 'PAINT', label: 'Vada laku', icon: Zap },
                                    { id: 'OTHER', label: 'Ostatní', icon: HelpCircle }
                                ].map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => {
                                            const labelMap = {
                                                'SCRATCH': 'ŠKRÁBANEC',
                                                'DUST': 'NEČISTOTA',
                                                'PAINT': 'VADA LAKU',
                                                'OTHER': 'OSTATNÍ'
                                            };
                                            setSelectedType(type.id);
                                            // Trigger onSave immediately to persist label change to parent
                                            onSave({ ...defect, type: type.id, label: labelMap[type.id], needsConsultation }, false);
                                        }}
                                        className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${selectedType === type.id
                                            ? 'bg-white dark:bg-slate-800 border-blue-500 text-blue-600 shadow-lg scale-[1.02]'
                                            : 'bg-slate-50/50 border-slate-100 dark:bg-slate-800/40 dark:border-slate-800 text-slate-400 hover:border-slate-200'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedType === type.id ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-white dark:bg-slate-800 shadow-sm'}`}>
                                            <type.icon size={16} />
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-widest">{type.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Výsledek kontrola</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: 'O.K.', label: 'O.K.', icon: Check },
                                    { id: 'Oprava', label: 'Oprava', icon: Ruler },
                                    { id: 'LAKOVAT', label: 'LAKOVAT', icon: Zap }
                                ].map(res => {
                                    const isActive = defect.status === res.id;
                                    return (
                                        <button
                                            key={res.id}
                                            onClick={() => onSave({ ...defect, status: res.id, type: selectedType, needsConsultation }, false)}
                                            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all ${isActive
                                                ? 'bg-white dark:bg-slate-800 border-blue-500 text-blue-600 shadow-lg scale-[1.02]'
                                                : 'bg-slate-50/50 border-slate-100 dark:bg-slate-800/40 dark:border-slate-800 text-slate-400 hover:border-slate-200'}`}
                                        >
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isActive
                                                ? 'bg-blue-50 dark:bg-blue-900/30'
                                                : 'bg-white dark:bg-slate-800 shadow-sm'}`}>
                                                <res.icon size={14} />
                                            </div>
                                            <span className="text-[8px] font-black uppercase tracking-tight text-center">{res.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Vyžaduje konzultaci?</label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { id: false, label: 'NE' },
                                    { id: true, label: 'ANO' }
                                ].map(opt => (
                                    <button
                                        key={String(opt.id)}
                                        onClick={() => {
                                            setNeedsConsultation(opt.id);
                                            onSave({ ...defect, needsConsultation: opt.id, type: selectedType }, false);
                                        }}
                                        className={`py-3 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2 ${needsConsultation === opt.id
                                            ? 'bg-white dark:bg-slate-800 border-blue-500 text-blue-600 shadow-md scale-[1.02]'
                                            : 'bg-transparent border-transparent text-slate-400 hover:text-slate-500'}`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                        <button
                            onClick={() => {
                                if (window.confirm('Opravdu chcete tento nález odstranit?')) {
                                    onSave(null); // Assuming null or a specific signal for deletion
                                }
                            }}
                            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-slate-400 hover:text-rose-500 transition-all border border-slate-100 dark:border-slate-800"
                        >
                            <Trash2 size={20} />
                        </button>
                        <button
                            onClick={() => onSave({ ...defect, type: selectedType, needsConsultation, measurements: { points, size: distance } })}
                            className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
                        >
                            Uložit detail <Save size={16} />
                        </button>
                    </div>
                </aside>
            </motion.div>
        </div>
    );
}
