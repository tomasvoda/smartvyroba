import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TransformWrapper, TransformComponent, useTransformContext } from 'react-zoom-pan-pinch';
import {
    Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw,
    AlertTriangle, Check, X, Shield, Info, MousePointer2, Plus, Sparkles, Brain,
    ChevronDown, ChevronUp
} from 'lucide-react';

const glassChip = "rounded-xl border border-white/80 dark:border-slate-800/70 backdrop-blur bg-white/85 dark:bg-slate-900/80 shadow-sm";

// Internal component for markers to access context
const MarkersOverlay = ({ defects, selectedDefectId, onSelect }) => {
    const context = useTransformContext();
    if (!context) return null;

    const { transformState } = context;
    const scale = transformState.scale;

    const strokeWidth = 0.25 / scale;
    const selectedStrokeWidth = 0.4 / scale;
    const labelOffset = 5 / scale;
    const padding = 0.6 / scale;
    const radius = 0.15 / scale;

    const getColor = (d) => {
        if (d.status === 'O.K.' || d.status === 'o.k.') return "#10b981"; // Emerald
        if (d.status === 'Oprava') return "#f59e0b"; // Amber
        if (d.status === 'LAKOVAT') return "#dc2626"; // Red 600
        if (d.needsConsultation) return "#f59e0b"; // Amber
        return d.isManual ? "#a855f7" : (d.isAi || d.isAiGenerated) ? "#3b82f6" : "#eab308";
    };
    const getFill = (d, isSelected) => {
        let color = "234, 179, 8"; // Default Yellow
        if (d.status === 'O.K.' || d.status === 'o.k.') color = "16, 185, 129";
        else if (d.status === 'Oprava') color = "245, 158, 11";
        else if (d.status === 'LAKOVAT') color = "220, 38, 38"; // red
        else if (d.needsConsultation) color = "245, 158, 11";
        else if (d.isManual) color = "168, 85, 247";
        else if (d.isAi || d.isAiGenerated) color = "59, 130, 246";

        const alpha = isSelected ? 0.6 : 0.25;
        return `rgba(${color}, ${alpha})`;
    };

    return (
        <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
        >
            {defects.filter(d => d.box).map(d => (
                <g
                    key={d.id}
                    className="pointer-events-auto cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect(d.id);
                    }}
                >
                    <rect
                        x={d.box.left}
                        y={d.box.top}
                        width={d.box.width}
                        height={d.box.height}
                        fill={getFill(d, selectedDefectId === d.id)}
                        stroke={selectedDefectId === d.id ? "#3b82f6" : "rgba(148, 163, 184, 0.4)"}
                        strokeWidth={selectedDefectId === d.id ? selectedStrokeWidth : strokeWidth}
                        strokeDasharray="0"
                        rx={radius}
                    />
                    {selectedDefectId === d.id && (
                        <rect
                            x={d.box.left - 0.3 / scale}
                            y={d.box.top - 0.3 / scale}
                            width={d.box.width + 0.6 / scale}
                            height={d.box.height + 0.6 / scale}
                            fill="none"
                            stroke="white"
                            strokeWidth={0.1 / scale}
                            opacity="0.8"
                            rx={radius + 0.1 / scale}
                        />
                    )}
                    {/* Consultation Indicator */}
                    {d.needsConsultation && (
                        <g transform={`translate(${d.box.left + d.box.width}, ${d.box.top}) scale(${0.8 / scale})`}>
                            <circle r="0.4" fill="#f59e0b" stroke="white" strokeWidth="0.05" />
                            <text y="0.15" textAnchor="middle" fill="white" fontSize="0.5" fontWeight="900" style={{ userSelect: 'none', fontFamily: 'system-ui' }}>?</text>
                        </g>
                    )}
                </g>
            ))}
        </svg>
    );
};

export default function QualityInspectionLab({ inspection, onAddDefect, onShowDetail, onDeleteDefect, onDefectAction, aiSummary, aiInstructions, activeDefectId, onSelectDefect }) {
    const transformRef = useRef(null);
    const [isAiExpanded, setIsAiExpanded] = useState(false);

    if (!inspection) return null;
    const defects = inspection.defects || [];

    const handleImageClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        const newDefect = {
            id: `M-${Date.now()}`,
            type: 'MANUAL',
            label: 'DEFEKT',
            severity: 'medium',
            box: { left: x - 2, top: y - 2, width: 4, height: 4 },
            measurements: { points: [], size: 0 },
            isManual: true
        };

        onAddDefect && onAddDefect(newDefect);
        onSelectDefect && onSelectDefect(newDefect.id);
    };

    return (
        <div className="h-full flex flex-col gap-4">
            <div className="flex-1 relative bg-slate-100 dark:bg-slate-950 rounded-[32px] overflow-hidden border border-slate-200 dark:border-slate-800">
                <TransformWrapper
                    ref={transformRef}
                    initialScale={1}
                    minScale={0.5}
                    maxScale={10}
                    centerOnInit={true}
                    centerZoomedOut={true}
                    wheel={{ step: 0.1 }}
                    doubleClick={{ disabled: false }}
                    pinch={{ step: 5 }}
                >
                    {(utils) => (
                        <>
                            <TransformComponent
                                wrapperClass="w-full h-full"
                                contentClass="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-950"
                            >
                                <div
                                    className="relative inline-flex items-center justify-center cursor-crosshair shadow-2xl overflow-hidden"
                                    style={{ minWidth: 'fit-content', minHeight: 'fit-content' }}
                                    onClick={handleImageClick}
                                >
                                    <img
                                        src={inspection.image}
                                        alt="Inspection Lab"
                                        className="max-w-full max-h-full block pointer-events-none"
                                    />

                                    <MarkersOverlay
                                        defects={defects}
                                        selectedDefectId={activeDefectId}
                                        onSelect={(id) => {
                                            onSelectDefect && onSelectDefect(id);
                                            const defect = defects.find(d => d.id === id);
                                            if (defect) onShowDetail && onShowDetail(defect);
                                        }}
                                    />
                                </div>
                            </TransformComponent>

                            {/* DEFECTS INFO BAR */}
                            <div className="absolute top-6 left-6 z-20 flex items-center gap-2">
                                <div className={`px-4 py-2 ${glassChip} flex items-center gap-3 bg-white/95 shadow-xl border-blue-100`}>
                                    <div className="flex items-center gap-1.5">
                                        <AlertTriangle size={14} className="text-blue-500" />
                                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                                            Nálezy: {defects.length}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* AI RESULT CHIP */}
                            {aiSummary && (
                                <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
                                    <div className={`px-4 py-2 ${glassChip} flex items-center gap-3 bg-white/95 shadow-xl ${aiSummary.isError ? 'border-rose-200' : 'border-emerald-100'}`}>
                                        <div className="flex items-center gap-1.5">
                                            {aiSummary.isError ? (
                                                <X size={12} className="text-rose-500" />
                                            ) : (
                                                <Sparkles size={12} className="text-emerald-500" />
                                            )}
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${aiSummary.isError ? 'text-rose-600' : 'text-slate-800'}`}>
                                                {aiSummary.isError ? 'Chyba kreditu' : 'Analýza OK'}
                                            </span>
                                            {!aiSummary.isError && (
                                                <>
                                                    <span className="text-slate-200 text-[10px] font-light">|</span>
                                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">
                                                        {aiSummary.confidence}%
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </TransformWrapper>
            </div>

            <div className="px-4 py-2 flex items-center justify-between text-slate-400">
                <div className="flex items-center gap-2">
                    <MousePointer2 size={12} />
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em]">
                        Klikněte do obrazu pro přidání vady • Klikněte na vadu pro detail
                    </span>
                </div>
            </div>
        </div>
    );
}
