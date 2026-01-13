import React, { useState, Suspense, useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment, SoftShadows } from '@react-three/drei';
import {
    Map, RotateCcw, Box, Eye, Settings2, Sparkles, Shield, Flame, Volume2, RefreshCw, X, Plus, ChevronRight, ChevronDown, ChevronUp, Check, ArrowRight, ArrowLeft, FileText, Layers, Wrench, Info,
    Download, Table, Cpu, FileDown, Layout, Maximize, Maximize2, MousePointer2, ArrowDownCircle, Hash, Target, AlertTriangle, AlertCircle, Weight, DoorOpen, Puzzle, Scale
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import VariantCard from '../components/VariantCard';

import DoorModel from '../components/configurator/DoorModel';
import {
    PROFILE_PRESETS,
    STANDARD_WIDTHS_SINGLE,
    STANDARD_WIDTHS_DOUBLE,
    GAP_DEFAULTS,
    FINISH_PRESETS,
    HANDLE_OPTIONS,
    HANDLE_FINISH_OPTIONS,
    HINGE_OPTIONS,
    LOCK_OPTIONS,
    DROP_SEAL_OPTIONS,
    FINISH_CATEGORY_LABELS,
    clampNumber,
    getProfilePreset,
    getFinishById,
    calculateMaterialSummary
} from '../components/configurator/utils';

const ITEM_INFILLS = {
    'Voština': 'Voština',
    'Plná DTD': 'Plná DTD',
    'Akustická': 'Akustická'
};

// ManagedInput for numeric values to allow free typing
const ManagedInput = ({ value, onChange, min, max, placeholder, className }) => {
    const [localValue, setLocalValue] = useState(value);

    // Sync local value when external value changes (unless focused, handled implicitly by avoiding value override on change)
    // Actually simpler: reset on blur if invalid, or on external change if it differs significantly
    React.useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleBlur = () => {
        let val = parseInt(localValue);
        if (isNaN(val)) val = value; // revert if invalid
        // Clamp and notify parent
        const clamped = clampNumber(val, min, max);
        setLocalValue(clamped);
        onChange(clamped);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.target.blur();
        }
    };

    return (
        <input
            type="number"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={className}
        />
    );
};

class CanvasErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm p-8">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-red-100 dark:border-red-900/30">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500">
                            <Info size={32} />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">3D náhled se nepodařilo načíst</h3>
                        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                            {this.state.error && this.state.error.message}
                        </p>
                        <pre className="text-xs text-left bg-slate-100 p-2 rounded overflow-auto max-h-40 mb-4 text-red-600">
                            {this.state.error && this.state.error.stack}
                        </pre>
                        <button
                            onClick={() => {
                                this.setState({ hasError: false, error: null });
                                window.location.reload();
                            }}
                            className="bg-slate-900 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform w-full"
                        >
                            Zkusit znovu
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

class GlobalErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Global Error Caught:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-red-50 p-10 font-sans">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-2xl w-full border border-red-200">
                        <h1 className="text-3xl font-black text-red-600 mb-4">Critical Application Error</h1>
                        <p className="text-slate-600 mb-6 text-lg">The configurator encountered an unexpected error and could not render.</p>

                        <div className="bg-slate-900 text-slate-50 p-6 rounded-xl overflow-auto max-h-[400px] mb-6 text-sm font-mono shadow-inner">
                            <strong className="text-red-400 block mb-2">{this.state.error && this.state.error.toString()}</strong>
                            <div className="opacity-70 whitespace-pre-wrap">{this.state.errorInfo && this.state.errorInfo.componentStack}</div>
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold uppercase tracking-widest transition-colors shadow-lg shadow-red-500/30"
                        >
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// ControlButton component (remains in this file as it's a UI component for the configurator)
const ControlButton = ({ icon: Icon, onClick, active, tooltip, colorActive = 'bg-blue-600' }) => {
    const [hover, setHover] = useState(false);
    return (
        <div className="relative flex flex-col items-center">
            <button
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                onClick={onClick}
                className={`p-3 rounded-2xl shadow-lg border transition-all hover:scale-110 active:scale-95 flex items-center justify-center ${active ? `${colorActive} text-white border-transparent` : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-100 dark:border-slate-700'}`}
            >
                <Icon size={20} />
            </button>
            {hover && (
                <div className="absolute -top-10 bg-slate-800 text-white text-[9px] font-bold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap animate-in fade-in zoom-in duration-200 z-50">
                    {tooltip}
                </div>
            )}
        </div>
    );
};

// ViewIcon component for view mode selection (remains in this file as it's a UI component for the configurator)
const ViewIcon = ({ icon: Icon, active, onClick, tooltip }) => {
    const [hover, setHover] = useState(false);
    return (
        <div className="relative">
            <button
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                onClick={onClick}
                className={`p-2.5 rounded-xl transition-all ${active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                    } `}
            >
                <Icon size={18} />
            </button>
            {hover && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap z-50">
                    {tooltip}
                </div>
            )}
        </div>
    );
};



// Text Color Helper
const getTextColorForBackground = (color, label = '') => {
    const darkColors = [
        '#000000', '#111827', '#1f2937', '#2f3a40', '#5d4037', '#475569', // Black, Graphite, Anthracite, Walnut, Slate
        '#b45309', '#8b6b4e', '#5d4037', '#4a4a4a', '#333333', // Mosaz/Bronze, Smoked Oak, Walnut, Dark Grey
        'rgb(17, 24, 39)', // tailwind slate-900
    ];
    if (darkColors.includes(color)) return 'text-white';
    const lowerLabel = label.toLowerCase();
    // High contrast logic: White on dark, specific slate-900 on light.
    if (lowerLabel.includes('černá') || lowerLabel.includes('antracit') || lowerLabel.includes('tmav') || lowerLabel.includes('ořech') || lowerLabel.includes('kouřový') || lowerLabel.includes('břidlice') || lowerLabel.includes('grafit') || lowerLabel.includes('wenge') || lowerLabel.includes('eben') || lowerLabel.includes('dub') || lowerLabel.includes('palisandr')) return 'text-slate-200';
    return 'text-slate-900'; // Reverted to black from gray
};
const getTextColorForBackgroundSub = (color, label = '') => {
    const cls = getTextColorForBackground(color, label);
    return cls === 'text-white' ? 'text-white/60' : 'text-slate-900/60';
};

const formatFinishLabel = (label = '') => {
    if (!label) return label;
    const low = label.toLowerCase();
    if (low.includes('bez povrchové úpravy')) return 'Bez p. ú.';
    return label;
};

// --- Material Tab Components (Moved out to avoid re-creation on render) ---
const InfoRow = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest tabular-nums">{label}</span>
        <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 whitespace-nowrap tabular-nums">{value}</span>
    </div>
);

const PrismCuttingScheme = ({ bars, standardLength }) => {
    if (!bars || !Array.isArray(bars) || bars.length === 0) return null;
    const safeStandardLength = Number(standardLength) || 3000;

    return (
        <div className="space-y-3">
            {bars.map((bar, bIdx) => {
                const cuts = bar?.cuts || [];
                const remaining = Number(bar?.remaining) || 0;

                return (
                    <div key={bIdx} className="space-y-1">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest tabular-nums">Hranol #{bIdx + 1} ({safeStandardLength}mm)</span>
                            <span className="text-[8px] font-bold text-slate-400 tabular-nums">Využití: {(((safeStandardLength - remaining) / safeStandardLength) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="relative h-10 bg-slate-100/50 dark:bg-slate-800/70 rounded-2xl overflow-hidden border border-white/20 dark:border-slate-700/30 shadow-inner flex backdrop-blur-md">
                            {cuts.map((cut, cIdx) => (
                                <div
                                    key={cIdx}
                                    className="h-full border-r border-white/20 flex items-center justify-center overflow-hidden transition-all hover:brightness-110"
                                    style={{
                                        width: `${((Number(cut?.length) || 0) / safeStandardLength) * 100}%`,
                                        backgroundColor: `hsla(${(cIdx * 70) % 360}, 45%, 65%, 0.85)`
                                    }}
                                    title={`${cut?.name || 'Řez'}: ${cut?.length || 0}mm`}
                                >
                                    <span className="text-[11px] font-black text-white whitespace-nowrap px-1 drop-shadow-sm">{cut?.length || 0}</span>
                                </div>
                            ))}
                            {remaining > 0 && (
                                <div
                                    className="h-full flex items-center justify-center bg-white/5"
                                    style={{ width: `${(remaining / safeStandardLength) * 100}%` }}
                                    title={`Prořez: ${remaining}mm`}
                                >
                                    <span className="text-[9px] font-bold text-slate-400/50 tabular-nums">{Math.round(remaining)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const MDFCuttingScheme = ({ sheets }) => {
    if (!sheets || !Array.isArray(sheets) || sheets.length === 0) return null;

    return (
        <div className="space-y-6">
            {sheets.map((sheet, sIdx) => {
                if (!sheet?.format) return null;
                const { w, h, label } = sheet.format;
                const safeW = w || 2800;
                const safeH = h || 2070;
                const items = sheet.items || [];
                const efficiency = Number(sheet.efficiency) || 0;

                return (
                    <div key={sIdx} className="space-y-2">
                        <div className="flex justify-between items-end px-1">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest tabular-nums">Deska #{sIdx + 1}: {label} mm</span>
                                <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tighter">{sheet.thickness}</span>
                            </div>
                            <span className="text-[8px] font-bold text-slate-400 tabular-nums">Účinnost: {(efficiency * 100).toFixed(1)}%</span>
                        </div>
                        <div className="bg-white/30 dark:bg-slate-900/40 rounded-2xl p-4 border border-white/40 dark:border-slate-800/40 backdrop-blur-sm shadow-sm">
                            <div
                                className="relative border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg mx-auto shadow-inner overflow-hidden"
                                style={{
                                    width: '100%',
                                    aspectRatio: `${safeW}/${safeH}`,
                                    maxWidth: safeH > safeW ? '180px' : '300px'
                                }}
                            >
                                {items.map((item, iIdx) => {
                                    if (!item) return null;
                                    return (
                                        <div
                                            key={iIdx}
                                            className="absolute border border-white/20 flex items-center justify-center p-1 overflow-hidden transition-all hover:brightness-110 backdrop-blur-[2px] rounded-sm"
                                            style={{
                                                left: `${((item.x || 0) / safeW) * 100}%`,
                                                top: `${((item.y || 0) / safeH) * 100}%`,
                                                width: `${((item.w || 0) / safeW) * 100}%`,
                                                height: `${((item.h || 0) / safeH) * 100}%`,
                                                backgroundColor: `hsla(${(iIdx * 137) % 360}, 45%, 65%, 0.85)`,
                                            }}
                                            title={`${item.name || 'Díl'} (${item.thickness}): ${Math.round(item.origW || 0)}x${Math.round(item.origH || 0)}mm`}
                                        >
                                            <div className="flex flex-col items-center gap-0.5 pointer-events-none">
                                                <span className="text-[8px] font-black text-white uppercase tracking-tighter drop-shadow-sm leading-none">{(item.name || '').replace(' (v1)', '').replace(' (v2)', '')}</span>
                                                <span className="text-[7px] font-black text-white/95 tabular-nums leading-none mt-0.5">{Math.round(item.origW || 0)}×{Math.round(item.origH || 0)}</span>
                                                {item.rotated && <RotateCcw size={8} className="text-white mt-0.5 opacity-80" />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const CollapsibleSection = ({ id, title, icon: Icon, colorClass, summaryContent, expandedSection, setExpandedSection, buttonClassName, children }) => {
    const isExpanded = expandedSection === id;
    return (
        <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'mb-6' : 'mb-3'}`}>
            <button
                onClick={() => setExpandedSection(isExpanded ? null : id)}
                className={`w-full text-left flex items-center justify-between p-4 rounded-2xl border transition-all ${buttonClassName || ''} ${isExpanded
                    ? 'bg-white/90 dark:bg-slate-800/80 border-white dark:border-slate-700 shadow-sm'
                    : 'bg-white/70 dark:bg-slate-800/60 border-white/50 dark:border-slate-700/50 hover:bg-white/90'
                    }`}
            >
                <div className="flex items-center gap-4 flex-1 overflow-hidden">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
                        <Icon size={20} />
                    </div>
                    <div className="flex-1 flex items-center justify-between overflow-hidden">
                        <div className="flex flex-col items-start min-w-0">
                            {typeof title === 'string' ? (
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-white truncate">{title}</h4>
                            ) : (
                                title
                            )}
                            {!isExpanded && summaryContent && (
                                <div className="text-[10px] text-slate-500 font-medium mt-0.5 md:hidden">{summaryContent}</div>
                            )}
                        </div>
                        {!isExpanded && summaryContent && (
                            <div className="hidden md:block shrink-0 ml-4">
                                {summaryContent}
                            </div>
                        )}
                    </div>
                </div>
                <div className="text-slate-400">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
            </button>

            {isExpanded && (
                <div className="mt-4 px-1 animate-in slide-in-from-top-2 duration-300">
                    {children}
                </div>
            )}
        </div>
    );
};

// --- INITIAL CONFIGURATION ---
const INITIAL_CONFIG = {
    type: 'Libero',
    frameProfile: 'DURUS 45',
    frameVariant: 'standard',
    leafType: 'Jednokřídlé',
    atypicalSize: false,
    atypicalNote: '', // Automated reasons
    userAtypicalNote: '', // Manual user description
    specialNoteEnabled: false,
    thickness: 45,
    topPanelEnabled: false,
    topPanelType: 'Sklo',
    topPanelHeight: 400,
    glassType: 'transparent',
    glassThick: 8,
    width: 800,
    height: 1970,
    prisms: 3,
    infill: 'Voština',
    skin: 'HDF 3mm',
    hingesCount: 3,
    hingesType: 'TECTUS 340',
    lockType: 'Magnetický',
    handleType: 'handle-standard',
    handleFinish: 'nerez',
    rosette: false,
    dropSeal: false,
    cableGrommet: false,
    orientation: 'Levé dovnitř',
    direction: 'Dovnitř',
    openAngle: 0,
    unifiedFinish: true,
    finishSideA: 'dub-rustikal',
    finishSideB: 'dub-rustikal',
    finishEdge: 'dub-rustikal',
    finishTopPanel: 'dub-rustikal',
    colorSideA: '#eecfa1',
    colorSideB: '#eecfa1',
    colorEdge: '#eecfa1',
    colorTopPanel: '#ffff00',
    showMeasurements: true,
    showInternal: false,
    showShells: true,
    openPercent: 0,
    rebateType: 'Standardní falc 12/14 mm',
    rebateWidth: 14,
    rebateDepth: 12,
    isFlush: false,
    standardThickness: true,
    constructionType: 'Standard',
};

const ConfiguratorContent = () => {
    console.log("ConfiguratorContent Render Start");
    const [activeTab, setActiveTab] = useState('type');
    const [viewMode, setViewMode] = useState('leaf'); // leaf, xray
    const allowTechView = false;
    const effectiveViewMode = viewMode === 'xray' ? 'xray' : 'leaf';

    const [aiDraft, setAiDraft] = useState(null);
    const [appliedAiDraft, setAppliedAiDraft] = useState(null);
    const [surfaceTarget, setSurfaceTarget] = useState('sideA');
    const [surfaceCategory, setSurfaceCategory] = useState('all');
    const [handleCategory, setHandleCategory] = useState('handle'); // none, handle, bar
    const [finishSearch, setFinishSearch] = useState('');
    const [loadingFinish] = useState(false);
    const orbitControlsRef = useRef();

    const [config, setConfig] = useState(INITIAL_CONFIG);
    const lastValidDimsRef = useRef({
        width: INITIAL_CONFIG.width,
        height: INITIAL_CONFIG.height,
        thickness: INITIAL_CONFIG.thickness,
        topPanelHeight: INITIAL_CONFIG.topPanelHeight,
        openPercent: INITIAL_CONFIG.openPercent || 0,
    });

    // Force Infill to Voština if Top Panel is enabled
    // Removed restriction on infill when top panel is enabled as requested by user reporting inability to select DTD/Acoustic.

    // Finish Change Effect - Robust Texture Reload


    const [expandedSection, setExpandedSection] = useState('surfaces');

    const mdfSizes = [6, 4, 3];
    const getMdfCombination = (target) => {
        if (!Number.isFinite(target) || target <= 0) return null;
        const maxSum = Math.max(target + 6, target);
        const dp = Array(Math.ceil(maxSum) + 1).fill(null);
        dp[0] = [];
        for (let sum = 0; sum <= maxSum; sum++) {
            if (!dp[sum]) continue;
            for (const size of mdfSizes) {
                const next = sum + size;
                if (next <= maxSum && !dp[next]) {
                    dp[next] = [...dp[sum], size];
                }
            }
        }
        if (dp[target]) return { combo: dp[target], total: target, diff: 0 };
        let best = null;
        for (let sum = 0; sum <= maxSum; sum++) {
            if (!dp[sum]) continue;
            const diff = Math.abs(sum - target);
            // On tie, prefer the thicker one (so we can sand it down)
            if (!best || diff < best.diff || (diff === best.diff && sum > best.total)) {
                best = { combo: dp[sum], total: sum, diff };
            }
        }
        return best;
    };

    const getAIDraft = (targetThickness) => {
        const thicknessToUse = targetThickness || config.thickness;
        const profileStr = (config.frameProfile || '').toLowerCase();
        if (!profileStr.includes('durus') && !profileStr.includes('fortius')) return null;

        const preset = getProfilePreset(config.frameProfile);

        const isStandardThickness = thicknessToUse === preset.thickness;
        const isStandardRebate = config.rebateType === 'Standardní falc 12/14 mm';

        if (isStandardThickness && isStandardRebate) return null;

        const prism = profileStr.includes('fortius') ? 40 : 33;
        const totalMdfThickness = Math.max(0, thicknessToUse - prism);
        const sideMdfThickness = totalMdfThickness / 2;
        const sideCombo = getMdfCombination(sideMdfThickness);

        if (!sideCombo && totalMdfThickness > 0) {
            return {
                profile: preset.label,
                thickness: thicknessToUse,
                standardThickness: preset.thickness,
                prism,
                remaining: totalMdfThickness,
                error: "Skladbu nelze pro tuto tloušťku automaticky navrhnout."
            };
        }

        return {
            profile: preset.label,
            thickness: thicknessToUse,
            standardThickness: preset.thickness,
            prism,
            remaining: totalMdfThickness,
            sideMdf: sideMdfThickness,
            combo: sideCombo,
            needsCalibration: sideCombo ? (sideCombo.diff > 0.1 || !Number.isInteger(sideMdfThickness)) : true,
            isNonStandardRebate: !isStandardRebate,
        };
    };

    const handleGenerateAIDraft = (targetThickness) => {
        const thicknessToUse = targetThickness || config.thickness;
        const draft = getAIDraft(thicknessToUse);
        setAppliedAiDraft(draft); // Apply directly as requested
        setAiDraft(null); // Ensure modal doesn't show
    };

    // Auto-clear or update draft if standard thickness is toggled
    useEffect(() => {
        if (config.standardThickness) {
            setAiDraft(null);
            setAppliedAiDraft(null);
        }
    }, [config.standardThickness]);

    const constructionColors = {
        Standard: 'text-slate-700',
        RC: 'text-amber-600',
        EI: 'text-rose-600',
        RW: 'text-emerald-600',
    };

    const staticLimits = {
        thickness: { min: 30, max: 100 },
        prisms: { min: 2, max: 6 },
        hingesCount: { min: 2, max: 4 },
        rebateWidth: { min: 0, max: 30 },
        rebateDepth: { min: 0, max: 30 },
    };

    // UI Props
    const sceneBg = '#f8fafc';
    const environmentPreset = 'city';

    // Unified glass tokens
    const glassMain = "rounded-2xl border border-white/70 dark:border-slate-800/60 backdrop-blur-2xl bg-white/78 dark:bg-slate-900/78 shadow-[0_22px_70px_rgba(15,23,42,0.16)]";
    const glassSub = "rounded-2xl border border-white/70 dark:border-slate-800/60 backdrop-blur-2xl bg-white/60 dark:bg-slate-900/60 shadow-[0_16px_45px_rgba(15,23,42,0.1)]";
    const glassChip = "rounded-2xl border border-white/80 dark:border-slate-800/70 backdrop-blur bg-white/85 dark:bg-slate-900/80 shadow-[0_14px_36px_rgba(15,23,42,0.12)]";
    const panelGlass = "rounded-2xl border border-white/85 dark:border-slate-800/75 backdrop-blur-2xl bg-white/82 dark:bg-slate-900/80 shadow-[0_26px_80px_rgba(15,23,42,0.2)]";

    const sectionClass = `${glassSub} p-5`;
    const typeSectionClass = `${glassSub} p-4 transition-all hover:shadow-[0_20px_60px_rgba(15,23,42,0.14)]`;
    const sectionHeaderClass = "flex items-center justify-between pb-2 border-b border-slate-100/50 dark:border-slate-800/40 mb-2";
    const labelClass = "text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1";
    const fieldClass = "h-10 w-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl px-4 rounded-2xl font-bold text-sm outline-none border border-white/80 dark:border-slate-700/80 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 text-slate-700 dark:text-slate-200 transition-all";

    const constructionLabels = {
        Standard: 'Běžná konstrukce',
        RC: 'RC',
        EI: 'EI',
        RW: 'RW',
    };
    const activeDraft = appliedAiDraft || aiDraft;

    const numericSafe = useMemo(() => {
        const num = (v, fallback) => {
            if (v === '' || v === null || v === undefined) return fallback;
            const parsed = Number(v);
            return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
        };
        return {
            width: num(config.width, lastValidDimsRef.current.width),
            height: num(config.height, lastValidDimsRef.current.height),
            thickness: num(config.thickness, lastValidDimsRef.current.thickness),
            topPanelHeight: num(config.topPanelHeight, lastValidDimsRef.current.topPanelHeight),
            openPercent: num(config.openPercent, lastValidDimsRef.current.openPercent),
        };
    }, [config.width, config.height, config.thickness, config.topPanelHeight, config.openPercent]);

    useEffect(() => {
        if (numericSafe.width) lastValidDimsRef.current.width = numericSafe.width;
        if (numericSafe.height) lastValidDimsRef.current.height = numericSafe.height;
        if (numericSafe.thickness) lastValidDimsRef.current.thickness = numericSafe.thickness;
        if (numericSafe.topPanelHeight) lastValidDimsRef.current.topPanelHeight = numericSafe.topPanelHeight;
        if (numericSafe.openPercent !== undefined && numericSafe.openPercent !== null) {
            lastValidDimsRef.current.openPercent = numericSafe.openPercent;
        }
    }, [numericSafe.width, numericSafe.height, numericSafe.thickness, numericSafe.topPanelHeight, numericSafe.openPercent]);

    // Normalize view mode to supported values only (prevents accidental blank view)
    useEffect(() => {
        if (viewMode !== 'leaf' && viewMode !== 'xray') {
            setViewMode('leaf');
        }
    }, [viewMode]);

    // Camera Centering Logic (Memoized for performance)
    const cameraTarget = useMemo(() => {
        // HARDCODED SAFE VALUES FOR DEBUGGING
        return [0, 1, 0];
    }, []);

    const initialCameraY = 1;
    const baseCameraPos = useMemo(() => [2.5, 1, 3], []);

    const resetCamera = () => {
        if (orbitControlsRef.current) {
            orbitControlsRef.current.reset();
        }
    };

    const getProfilePreset = (profileId) => PROFILE_PRESETS.find((item) => item.id === profileId) || PROFILE_PRESETS[0];

    const getDimensionLimits = (nextConfig) => {
        // Relaxed limits for Atyp
        if (nextConfig.atypicalSize) {
            return {
                width: { min: 100, max: 3000 },
                height: { min: 100, max: 4000 },
            };
        }

        const preset = getProfilePreset(nextConfig.frameProfile);
        const hasTopPanel = nextConfig.frameVariant !== 'bez horního nadpraží';

        // Limits apply to LEAF size now
        // Max leaf size = Max structural-Gaps
        // But for simplicity, we use the preset max values as guideline leaf sizes approx

        let heightMax = preset.maxHeight;
        if (!hasTopPanel && preset.maxHeightNoTop) heightMax = preset.maxHeightNoTop;

        let widthMax = preset.maxWidth;
        if (nextConfig.leafType === 'Dvoukřídlé') widthMax = preset.maxWidthDouble || widthMax;
        if (!hasTopPanel && preset.maxWidthNoTop) widthMax = Math.min(widthMax, preset.maxWidthNoTop);

        return {
            width: { min: nextConfig.leafType === 'Dvoukřídlé' ? 1250 : 600, max: widthMax },
            height: { min: 1970, max: heightMax },
        };
    };

    const updateConfig = (patch) => {
        setConfig((prev) => {
            const next = { ...prev, ...patch };

            const STANDARD_WIDTHS = [600, 700, 800, 900, 1000];
            const STANDARD_HEIGHT = 1970;

            // Collect Atypical Reasons
            const reasons = [];
            const isNonStandardWidth = next.width && !STANDARD_WIDTHS.includes(Number(next.width));
            const isNonStandardHeight = next.height && Number(next.height) !== STANDARD_HEIGHT;

            if (isNonStandardWidth) reasons.push(`Šířka je mimo běžný rámec (${next.width} mm).`);
            if (isNonStandardHeight) reasons.push(`Výška je mimo běžný rámec (${next.height} mm).`);

            const preset = getProfilePreset(next.frameProfile);
            const isThicknessAtypical = next.thickness && Number(next.thickness) !== preset.thickness;
            if (isThicknessAtypical) {
                reasons.push(`Atypická tloušťka křídla (${next.thickness} mm).`);
            }

            // Auto-sync standardThickness flag based on value
            next.standardThickness = !isThicknessAtypical;

            if (next.rebateType === 'Atypický falc') {
                reasons.push(`Atypický falc křídla (Š:${next.rebateWidth} mm, H:${next.rebateDepth} mm).`);
            }

            if (reasons.length > 0) {
                next.atypicalSize = true;
                next.atypicalNote = reasons.map(r => `• ${r}`).join('\n');
            } else {
                next.atypicalSize = false;
                next.atypicalNote = '';
            }

            // Sync 'type' with 'frameProfile' for backward compatibility/logic
            if (patch.frameProfile) {
                next.type = patch.frameProfile === 'LIBERO' ? 'Libero' : 'Standard';

                // Prism automation
                if (patch.frameProfile === 'LIBERO' || patch.frameProfile === 'DURUS 45') {
                    next.prisms = 2;
                } else if (patch.frameProfile === 'FORTIUS 52') {
                    next.prisms = 3;
                }
            }

            // Libero Construction Restriction - check profile instead of 'type'
            if (next.frameProfile === 'LIBERO' && next.constructionType !== 'Standard') {
                next.constructionType = 'Standard';
            }

            // Update thickness from profile if profile changed
            if (patch.frameProfile) {
                const preset = getProfilePreset(next.frameProfile);
                next.thickness = preset.thickness;
            }
            if (patch.rebateType === 'Standardní falc 12/14 mm') {
                next.rebateWidth = 14;
                next.rebateDepth = 12;
            }
            if (next.frameVariant === 's nadsvětlíkem') {
                next.topPanelEnabled = true;
            }

            next.isFlush = next.rebateType === 'Bezfalcové (hladké)';

            const limits = getDimensionLimits(next);

            // Clamp dimensions
            next.width = clampNumber(next.width, limits.width.min, limits.width.max);
            next.height = clampNumber(next.height, limits.height.min, limits.height.max);
            next.topPanelHeight = clampNumber(next.topPanelHeight, 200, 800);
            return next;
        });
    };

    const preset = getProfilePreset(config.frameProfile);
    const limits = getDimensionLimits(config);
    const summary = useMemo(() => {
        try {
            return calculateMaterialSummary(config, appliedAiDraft);
        } catch (e) {
            console.error("Material Summary Calculation Failed:", e);
            return {
                paintGroups: [],
                mdf: {
                    totalArea: 0,
                    wastePercentage: 0,
                    sheets: [],
                    byThickness: {} // Correct structure
                },
                surfaces: [],
                unifiedSurface: { isUnified: config.unifiedFinish, label: 'Neznámý', totalArea: 0, totalPaintBase: 0, totalPaintTop: 0 },
                prisms: {
                    prismsNeeded: 0,
                    totalLengthMeters: 0,
                    pieces: [],
                    bars: [], // Correct structure
                    wastePercentage: 0
                },
                infill: { w: 0, h: 0, area: 0, weight: 0 }, // Correct structure
                weight: 0
            };
        }
    }, [config, appliedAiDraft]);

    const handleExportAIDraft = () => {
        if (!aiDraft) return;
        const data = {
            profile: aiDraft.profile,
            thickness: aiDraft.thickness,
            standardThickness: aiDraft.standardThickness,
            prism: aiDraft.prism,
            remaining: aiDraft.remaining,
            mdfCombo: aiDraft.combo?.combo || [],
            mdfTotal: aiDraft.combo?.total ?? null,
            diff: aiDraft.combo?.diff ?? null,
            needsCalibration: aiDraft.needsCalibration,
            deviation: aiDraft.combo?.diff,
            note: aiDraft.needsCalibration
                ? `Není přesná shoda(odchylka ${aiDraft.combo?.diff?.toFixed(2)} mm), nutná kalibrace.`
                : 'Přesná shoda bez kalibrace.',
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `skladba_navrh_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.remove();
    };

    const handleDownloadPDF = async () => {
        const specElement = document.getElementById('tech-specs-a4');
        if (!specElement) return;

        const captureDoorImage = async () => {
            const controls = orbitControlsRef.current;
            const doorCanvas = document.querySelector('#configurator-view canvas');
            if (!doorCanvas) return null;

            let restore = null;
            if (controls && controls.object && controls.target) {
                const cam = controls.object;
                const prevPos = cam.position.clone();
                const prevTarget = controls.target.clone();
                restore = () => {
                    controls.target.copy(prevTarget);
                    cam.position.copy(prevPos);
                    controls.update();
                };

                const [tx, ty, tz] = cameraTarget;
                const fovRad = (cam.fov || 35) * (Math.PI / 180);
                const heightM = (numericSafe.height || 0) / 1000 + (config.topPanelEnabled ? (numericSafe.topPanelHeight || 0) / 1000 : 0);
                const widthM = (numericSafe.width || 0) / 1000;
                const contentSize = Math.max(heightM, widthM);
                const desiredDistance = (contentSize / 2) / Math.tan(fovRad / 2) + 0.8;

                const dir = new THREE.Vector3(baseCameraPos[0] - tx, baseCameraPos[1] - ty, baseCameraPos[2] - tz).normalize();
                cam.position.set(tx + dir.x * desiredDistance, ty + dir.y * desiredDistance, tz + dir.z * desiredDistance);
                controls.target.set(tx, ty, tz);
                controls.update();
                await new Promise((res) => setTimeout(res, 140));
            }

            const dataUrl = doorCanvas.toDataURL('image/png');
            if (restore) restore();
            return dataUrl;
        };

        const cleanDoorImage = async (dataUrl) => {
            if (!dataUrl) return null;
            return new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const d = imageData.data;
                    for (let i = 0; i < d.length; i += 4) {
                        const r = d[i];
                        const g = d[i + 1];
                        const b = d[i + 2];
                        if (r > 245 && g > 245 && b > 245) {
                            d[i + 3] = 0;
                        }
                    }
                    ctx.putImageData(imageData, 0, 0);
                    resolve(canvas.toDataURL('image/png'));
                };
                img.onerror = () => resolve(dataUrl);
                img.src = dataUrl;
            });
        };

        const specCanvasPromise = html2canvas(specElement, { scale: 2 });
        const doorDataPromise = captureDoorImage();

        const [specCanvas, doorDataUrl] = await Promise.all([specCanvasPromise, doorDataPromise]);
        const specImg = specCanvas.toDataURL('image/png');
        const cleanedDoor = await cleanDoorImage(doorDataUrl);

        const pdf = new jsPDF('l', 'mm', 'a4'); // landscape
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const columnWidth = (pdfWidth - margin * 3) / 2;

        const specRatio = specCanvas.height / specCanvas.width;
        let specHeight = columnWidth * specRatio;
        if (specHeight > pdfHeight - 2 * margin) specHeight = pdfHeight - 2 * margin;

        pdf.addImage(specImg, 'PNG', margin, margin, columnWidth, specHeight);

        if (cleanedDoor) {
            const img = new Image();
            const loadPromise = new Promise((resolve) => {
                img.onload = () => resolve(true);
                img.onerror = () => resolve(false);
            });
            img.src = cleanedDoor;
            await loadPromise;
            const ratio = img.width ? (img.height / img.width) : 0.75;
            let doorHeight = pdfHeight - 2 * margin;
            let doorWidth = doorHeight / ratio;
            if (doorWidth > columnWidth) {
                doorWidth = columnWidth;
                doorHeight = doorWidth * ratio;
            }
            pdf.addImage(cleanedDoor, 'PNG', margin * 2 + columnWidth, margin, doorWidth, doorHeight);
        }

        pdf.save(`Specifikace-${config.type}-${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const handleGenerateCNC = () => {
        // Placeholder for CNC export (work in progress)
        console.info('CNC export is under construction.');
    };

    // Gaps needed for calculation
    const gapBottomMm = config.dropSeal ? GAP_DEFAULTS.bottomWithDropSeal : GAP_DEFAULTS.bottom;
    const gapSideMm = GAP_DEFAULTS.side;
    const gapTopMm = GAP_DEFAULTS.top;
    const meetingGapMm = config.leafType === 'Dvoukřídlé' ? GAP_DEFAULTS.meeting : 0;

    // Derived STRUCTURAL OPENING dimensions (for DoorModel and Summary)
    // Structure = Leaf + Gaps
    // Width: Leaf + 2 * Side (Single)
    // Width Double: 2 * Leaf + Meeting + 2 * Side ??
    // Usually user inputs Total Opening or Total Leaf. Let's assume Config.width = Total Leaf Width.
    // Opening = Total Leaf + 2 * Side + MeetingGap.

    const openingWidthComputed = numericSafe.width + 2 * gapSideMm + (config.leafType === 'Dvoukřídlé' ? meetingGapMm : 0);
    const openingHeightComputed = numericSafe.height + gapTopMm + gapBottomMm;
    const totalOpeningHeightComputed = config.topPanelEnabled ? openingHeightComputed + numericSafe.topPanelHeight : openingHeightComputed;

    // Derived config to pass to DoorModel (which expects Opening Dimensions)
    const openAngleForModel = config.doorOpen ? Math.round((numericSafe.openPercent || 0) * 1.2) : 0;
    const width = openingWidthComputed;
    const height = openingHeightComputed;
    const modelConfig = {
        ...config,
        width: numericSafe.width,
        height: numericSafe.height,
        topPanelHeight: numericSafe.topPanelHeight,
        thickness: numericSafe.thickness,
        openAngle: openAngleForModel
    };
    // Note: DoorModel adds TopPanelHeight to its internal calculations for wall, but expects 'height' to be clear opening height for door

    const handleConfigUpdate = (keyOrObj, val) => {
        if (typeof keyOrObj === 'object' && keyOrObj !== null) {
            updateConfig(keyOrObj);
            return;
        }
        const key = keyOrObj;

        // Automatic adjustments based on profile
        let autoPatch = {};
        if (key === 'frameProfile') {
            const profileStr = (val || '').toLowerCase();
            if (profileStr.includes('durus')) {
                autoPatch.prisms = 2;
                autoPatch.hingesType = 'TECTUS 340';
                autoPatch.hingesCount = 3;
            } else if (profileStr.includes('fortius')) {
                autoPatch.prisms = 3;
                autoPatch.hingesType = 'TECTUS 540';
                autoPatch.hingesCount = 4;
            } else if (profileStr.includes('libero')) {
                autoPatch.prisms = 2;
                autoPatch.hingesType = 'ANSELMI 160';
                autoPatch.hingesCount = 2;
            }

            const preset = getProfilePreset(val);
            autoPatch.thickness = preset.thickness;
        }

        if (config.unifiedFinish && (key === 'finishSideA' || key === 'finishSideB' || key === 'finishEdge' || key === 'finishTopPanel')) {
            autoPatch.finishSideA = val;
            autoPatch.finishSideB = val;
            autoPatch.finishEdge = val;
            if (config.topPanelEnabled) autoPatch.finishTopPanel = val;
        }

        if (key === 'unifiedFinish' && val === true) {
            autoPatch.finishSideB = config.finishSideA;
            autoPatch.finishEdge = config.finishSideA;
            if (config.topPanelEnabled) autoPatch.finishTopPanel = config.finishSideA;
        }

        const numericFields = ['width', 'height', 'thickness', 'prisms', 'hingesCount', 'topPanelHeight', 'openPercent', 'rebateWidth', 'rebateDepth'];
        if (numericFields.includes(key)) {
            const parsed = Number(val);
            if (!Number.isFinite(parsed)) {
                updateConfig({ [key]: val, ...autoPatch }); // Still update if it's not a number, e.g., empty string
                return;
            }

            const patch = { ...autoPatch };
            if (key === 'thickness') {
                patch.standardThickness = false;
                // Auto-trigger AI draft if thickness changes
                const preset = getProfilePreset(config.frameProfile);
                if (Number(val) !== preset.thickness) {
                    setTimeout(() => handleGenerateAIDraft(Number(val)), 0);
                }
            }

            if (['width', 'height', 'topPanelHeight', 'openPercent', 'rebateWidth', 'rebateDepth'].includes(key)) {
                updateConfig({ [key]: parsed, ...patch });
                return;
            }

            const limit = staticLimits[key];
            const finalVal = limit ? clampNumber(parsed, limit.min, limit.max) : parsed;
            updateConfig({ [key]: finalVal, ...patch });
            return;
        }
        if (key.startsWith('finish') && key !== 'finishSearch') {
            if (config.unifiedFinish) {
                // If unified, update all surfaces (Side A, B, Edge, Top Panel)
                updateConfig({
                    finishSideA: val,
                    finishSideB: val,
                    finishEdge: val,
                    finishTopPanel: val,
                    ...autoPatch
                });
            } else {
                updateConfig({ [key]: val, ...autoPatch });
            }
            return;
        }
        if (key.startsWith('color') && key !== 'colorSearch') {
            if (config.unifiedFinish) {
                updateConfig({
                    colorSideA: val,
                    colorSideB: val,
                    colorEdge: val,
                    colorTopPanel: val,
                });
            } else {
                updateConfig({ [key]: val, ...autoPatch });
            }
        }

        // Fallback for all other keys (generic updates)
        updateConfig({ [key]: val, ...autoPatch });
    };



    // Logic moved to handleConfigUpdate to avoid potential loops
    /*
    useEffect(() => {
        const profileStr = config.frameProfile || '';
        if (profileStr.toLowerCase().includes('durus')) {
            setConfig(prev => ({ ...prev, prisms: 2 }));
        } else if (profileStr.toLowerCase().includes('fortius')) {
            setConfig(prev => ({ ...prev, prisms: 3 }));
        }
    }, [config.frameProfile]);
    */

    const handleExportPDF = async () => {
        const input = document.getElementById('tech-specs-report');
        if (!input) return;

        const canvas = await html2canvas(input, {
            scale: 2, // Increase scale for better resolution
            useCORS: true, // If you have images from other domains
            windowWidth: input.scrollWidth,
            windowHeight: input.scrollHeight,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4'); // Portrait, millimeters, A4 size
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save(`technicka_specifikace_${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    const techData = [
        // 1) Rozměry
        { section: 'Rozměry', label: 'Šířka křídla', value: `${config.width} mm` },
        { section: 'Rozměry', label: 'Výška křídla', value: `${config.height} mm` },
        { section: 'Rozměry', label: 'Tloušťka křídla', value: `${config.thickness} mm` },
        { section: 'Rozměry', label: 'Atypické rozměry', value: config.atypicalSize ? 'Ano' : 'Ne' },
        ...(config.topPanelEnabled ? [{ section: 'Rozměry', label: 'Výška nadpanelu', value: `${config.topPanelEnabled ? config.topPanelHeight : 0} mm` }] : []),

        // 2) Konstrukce
        { section: 'Konstrukce', label: 'Orientace', value: config.orientation },
        { section: 'Konstrukce', label: 'Profil rámu', value: config.frameProfile },
        { section: 'Konstrukce', label: 'Typ konstrukce', value: constructionLabels[config.constructionType] || config.constructionType },
        // Verification Recording
        // ![Proces verifikace konstrukčních materiálů](/Users/tomasvoda/.gemini/antigravity/brain/72fce4ba-62c2-48bd-8ca5-be4424b3545a/verify_construction_cutting_schemes_final_1717862563996.webp)
        { section: 'Konstrukce', label: 'Výplň křídla', value: config.infill },
        { section: 'Konstrukce', label: 'Počet hranolů', value: config.prisms },
        { section: 'Konstrukce', label: 'Polodrážka (Falc)', value: config.rebateType },

        // 3) Povrchy
        { section: 'Povrch', label: 'Povrch Strana A', value: `${getFinishById(config.finishSideA)?.label || '—'} (${config.finishSideA})` },
        { section: 'Povrch', label: 'Povrch Strana B', value: config.unifiedFinish ? 'SHODNÝ S A' : `${getFinishById(config.finishSideB)?.label || '—'} (${config.finishSideB})` },
        { section: 'Povrch', label: 'Povrch Hrany', value: config.unifiedFinish ? 'SHODNÝ S A' : `${getFinishById(config.finishEdge)?.label || '—'} (${config.finishEdge})` },
        ...(config.topPanelEnabled ? [{ section: 'Povrch', label: 'Povrch Nadpanelu', value: config.unifiedFinish ? 'SHODNÝ S A' : `${getFinishById(config.finishTopPanel || config.finishSideA)?.label || '—'} (${config.finishTopPanel || config.finishSideA})` }] : []),

        // 4) Kování
        { section: 'Kování', label: 'Zámek', value: config.lockType },
        { section: 'Kování', label: 'Klika', value: config.handleType },
        { section: 'Kování', label: 'Povrch kliky', value: config.handleFinish },
        { section: 'Kování', label: 'Panty', value: `${config.hingesCount}x ${config.hingesType}` },
        { section: 'Kování', label: 'Rozeta', value: config.rosette ? 'Ano' : 'Ne' },
        { section: 'Kování', label: 'Padací práh', value: config.dropSeal ? 'Ano' : 'Ne' },
        { section: 'Kování', label: 'Kabelová průchodka', value: config.cableGrommet ? 'Ano' : 'Ne' },
    ];

    if (allowTechView && viewMode === 'tech') {
        // Group tech data by section
        const groupedTechData = techData.reduce((acc, item) => {
            if (!acc[item.section]) acc[item.section] = [];
            acc[item.section].push(item);
            return acc;
        }, {});

        return (
            <div className="flex-1 p-8 bg-slate-50 dark:bg-slate-950 overflow-y-auto">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Technická specifikace</h1>
                            <p className="text-slate-500 text-sm font-medium">Kompletní přehled parametrů vaší konfigurace</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setViewMode('leaf')}
                                className="bg-white hover:bg-slate-100 text-slate-700 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-200 transition-all flex items-center gap-2 group"
                            >
                                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                                Zpět do konfigurátoru
                            </button>
                            <button
                                onClick={handleExportPDF}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 group"
                            >
                                <FileDown size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                                Exportovat do PDF (A4)
                            </button>
                        </div>
                    </div>

                    <div id="tech-specs-report" className={`${glassMain} p-10 rounded-2xl`}>
                        <div className="flex justify-between items-start mb-10 pb-8 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <div className="text-3xl font-black text-blue-600 mb-1">SMART VÝROBA</div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Konfigurační protokol</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-black text-slate-500 uppercase">Datum generování</div>
                                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{new Date().toLocaleDateString('cs-CZ')}</div>
                            </div>
                        </div>

                        <div className="space-y-10">
                            {Object.entries(groupedTechData).map(([section, items]) => (
                                <div key={section}>
                                    <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-4 border-l-2 border-blue-500 pl-3">{section}</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
                                        {items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center py-2.5 border-b border-slate-50 dark:border-slate-800/50">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{item.label}</span>
                                                <span className="text-xs font-black text-slate-800 dark:text-slate-200">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Stav skladby jádra</h3>
                            {(appliedAiDraft || aiDraft) ? (
                                <div className="space-y-2">
                                    <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                        {(() => {
                                            const d = appliedAiDraft || aiDraft;
                                            return `Navržená skladba: ${d.combo ? d.combo.combo.join(' + ') + ' mm MDF (A) + ' : ''}${d.prism} mm střed ${d.combo ? ' + ' + d.combo.combo.join(' + ') + ' mm MDF (B)' : ''}`;
                                        })()}
                                    </div>
                                    <p className="text-[11px] text-slate-500 leading-relaxed italic">
                                        {(appliedAiDraft || aiDraft).needsCalibration ? '⚠️ Pozor: Nutná kalibrace na brusce pro přesnou tloušťku.' : '✓ Skladba odpovídá profilu bez nutnosti kalibrace.'}
                                    </p>
                                </div>
                            ) : (
                                <div className="text-sm font-bold text-slate-400">Standardní skladba profilu {config.frameProfile}</div>
                            )}
                        </div>

                        <div className="mt-10 text-[10px] text-slate-400 text-center leading-relaxed">
                            Tento dokument slouží jako technický podklad pro výrobu. Všechny rozměry jsou uvedeny v milimetrech.<br />
                            © Smart Výroba-{new Date().getFullYear()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col md:flex-row gap-3 animate-in fade-in duration-700 font-sans">

            {/* 3D VIEW */}
            <div id="configurator-view" className={`flex-1 min-h-[450px] relative overflow-hidden flex flex-col transition-all ${glassMain}`}>

                {/* Finish Loading Overlay */}
                {loadingFinish && (
                    <div className="absolute inset-0 z-[100] bg-white/40 dark:bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
                        <div className={`${glassMain} p-8 flex flex-col items-center gap-4`}>
                            <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                            <div className="flex flex-col items-center">
                                <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Generuji strukturu</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Aplikuji vybraný povrch...</span>
                            </div>
                        </div>
                    </div>
                )}
                {/* Top Info */}
                <div className="absolute top-4 left-4 z-10 hidden sm:flex pointer-events-none">
                    <div className={`${glassChip} px-3 py-1 flex items-center gap-2 origin-top-left transition-all h-11`}>
                        <Map size={16} className="text-blue-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-white leading-none">{(config.frameProfile || '').split(' ')[0]} | {config.constructionType} | {config.thickness}mm | {config.orientation}</span>
                    </div>
                </div>

                {/* Top Right Badges */}
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                    {config.constructionType && (
                        <div className={`${glassChip} px-3 py-1 flex items-center gap-2 h-11 ${constructionColors[config.constructionType] || constructionColors.Standard}`}>
                            <span className="w-5 h-5 flex items-center justify-center">
                                {config.constructionType === 'RC' && <Shield size={14} />}
                                {config.constructionType === 'EI' && <Flame size={14} />}
                                {config.constructionType === 'RW' && <Volume2 size={14} />}
                                {config.constructionType === 'Standard' && <Box size={14} />}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">{constructionLabels[config.constructionType] || config.constructionType}</span>
                        </div>
                    )}
                    {config.atypicalSize && (
                        <div className={`${glassChip} px-3 py-1 flex items-center gap-2 h-11 text-amber-600`}>
                            <span className="w-5 h-5 flex items-center justify-center">
                                <Settings2 size={14} />
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">ATYP</span>
                        </div>
                    )}
                </div>

                {/* Main Bottom Controls Layer - single compact card */}
                <div className="absolute bottom-4 left-4 z-10 hidden sm:flex pointer-events-none">
                    <div className={`${glassChip} px-3 py-1.5 flex items-center gap-3.5 pointer-events-auto h-[52px]`}>
                        <button
                            onClick={resetCamera}
                            className="h-9 w-9 flex items-center justify-center rounded-2xl border transition-all bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-600 hover:border-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.12)]"
                            title="Resetovat kameru"
                        >
                            <RotateCcw size={16} />
                        </button>
                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
                        <div className="flex gap-2">
                            {[
                                { id: 'leaf', icon: Box, label: '3D' },
                                { id: 'xray', icon: Cpu, label: 'X-Ray' },
                            ].map(mode => (
                                <button
                                    key={mode.id}
                                    onClick={() => setViewMode(mode.id)}
                                    className={`h-9 w-9 flex items-center justify-center rounded-2xl border transition-all ${effectiveViewMode === mode.id
                                        ? 'bg-white/85 dark:bg-slate-900/85 border-blue-400/60 shadow-[0_12px_32px_rgba(59,130,246,0.16)] ring-1 ring-blue-400/40 text-blue-600'
                                        : 'bg-white/70 dark:bg-slate-900/60 border-white/60 dark:border-slate-800/60 text-slate-500 hover:text-blue-600'}`}
                                    title={mode.label}
                                >
                                    <mode.icon size={16} />
                                </button>
                            ))}
                        </div>
                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
                        <div className="flex items-center gap-2">
                            <div className="flex gap-2">
                                {[
                                    { id: false, label: 'ZAV' },
                                    { id: true, label: 'OTEV' }
                                ].map(opt => (
                                    <button
                                        key={String(opt.id)}
                                        onClick={() => handleConfigUpdate('doorOpen', opt.id)}
                                        className={`h-9 px-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center border ${config.doorOpen === opt.id
                                            ? 'bg-white/85 dark:bg-slate-900/85 border-blue-400/60 shadow-[0_12px_32px_rgba(59,130,246,0.16)] ring-1 ring-blue-400/40 text-blue-600'
                                            : 'bg-white/70 dark:bg-slate-900/60 border-white/60 dark:border-slate-800/60 text-slate-400 hover:text-blue-600'}`}
                                        title={opt.label}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                            {config.doorOpen && (
                                <div className="flex items-center gap-2 w-28">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider w-10 text-right tabular-nums">{config.openPercent}%</span>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={config.openPercent || 0}
                                        onChange={(e) => handleConfigUpdate('openPercent', e.target.value)}
                                        disabled={!config.doorOpen}
                                        className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-blue-600 ${config.doorOpen ? 'bg-slate-200' : 'bg-slate-100 opacity-40 cursor-not-allowed'}`}
                                        title="Otevření"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {/* MAIN CONTENT AREA: Canvas or Tech Specs */}
                <div className="absolute inset-0 -z-10 bg-slate-50 dark:bg-slate-950/20 flex flex-col">
                    <div className="flex-1 min-h-0 relative pointer-events-auto z-10">
                        <Suspense fallback={
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-md z-[50]">
                                <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4" />
                                <div className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Sestavuji 3D model...</div>
                            </div>
                        }>
                            <CanvasErrorBoundary>
                                <Canvas
                                    shadows
                                    dpr={[1, 2]}
                                    camera={{ position: [2.5, initialCameraY, 3], fov: 35 }}
                                    gl={{
                                        antialias: true,
                                        powerPreference: "high-performance",
                                        alpha: true,
                                        preserveDrawingBuffer: true
                                    }}
                                    onCreated={({ gl }) => {
                                        // Keep viewer interactive even after tab switches
                                        if (gl.domElement) {
                                            gl.domElement.style.pointerEvents = 'auto';
                                            gl.domElement.style.touchAction = 'none';
                                        }
                                    }}
                                    style={{ height: '100%', width: '100%', touchAction: 'none', cursor: 'grab' }}
                                >
                                    <color attach="background" args={[sceneBg]} />
                                    <ambientLight intensity={0.5} />
                                    <directionalLight
                                        position={[4, 6, 3]}
                                        intensity={0.9}
                                        castShadow
                                        shadow-bias={-0.0001}
                                        shadow-mapSize={[4096, 4096]}
                                        shadow-camera-far={20}
                                        shadow-camera-left={-5}
                                        shadow-camera-right={5}
                                        shadow-camera-top={5}
                                        shadow-camera-bottom={-5}
                                    />
                                    <directionalLight
                                        position={[-4, 3, -2]}
                                        intensity={0.4}
                                        castShadow
                                        shadow-bias={-0.0001}
                                        shadow-mapSize={[2048, 2048]}
                                    />
                                    <ContactShadows
                                        position={[0, -0.3, 0]}
                                        opacity={0.65}
                                        scale={6}
                                        blur={3}
                                        far={1.5}
                                        resolution={2048}
                                        color="#000000"
                                    />
                                    <DoorModel
                                        config={modelConfig}
                                        showInternal={effectiveViewMode === 'xray'}
                                        showDrawing={false}
                                        showShells={effectiveViewMode !== 'xray'}
                                        showAccessories={true}
                                        showWall={false}
                                    />
                                    <Environment preset={environmentPreset} />
                                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.306, 0]} receiveShadow>
                                        <circleGeometry args={[1.6, 48]} />
                                        <meshStandardMaterial color="#e2e8f0" transparent opacity={0.75} roughness={0.9} />
                                    </mesh>
                                    <OrbitControls
                                        ref={orbitControlsRef}
                                        makeDefault
                                        target={cameraTarget}
                                        minPolarAngle={0}
                                        maxPolarAngle={Math.PI}
                                        enabled
                                        enableRotate
                                        enableZoom={true}
                                        enablePan={true}
                                        minDistance={1}
                                        maxDistance={6}
                                        enableDamping={true}
                                        dampingFactor={0.05}
                                        rotateSpeed={0.8}
                                    />
                                </Canvas>
                            </CanvasErrorBoundary>
                        </Suspense>
                    </div>

                    {/* Weight Floating Indicator - Bottom Right */}
                    <div className="absolute bottom-4 right-4 z-10 hidden sm:flex pointer-events-none">
                        <div className={`${glassChip} px-4 flex items-center gap-4 h-[52px]`}>
                            <div className="text-slate-400">
                                <Scale size={18} />
                            </div>
                            <div className="flex flex-col items-end min-w-[60px]">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 shadow-sm">Celková hmotnost</span>
                                <div className="text-[18px] font-black text-slate-900 dark:text-white tabular-nums tracking-tighter leading-none flex items-baseline gap-1">
                                    {Math.round(summary?.weight || 0)}
                                    <span className="text-[10px] font-bold text-slate-400">KG</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >

            {/* CONFIG PANEL */}
            <div className="w-full md:w-[480px] flex flex-col gap-2 overflow-hidden pb-24 md:pb-0 relative">

                {/* CONTENT + HEADER TABS */}
                <div className={`flex-1 p-4 pb-28 overflow-y-auto custom-scrollbar transition-all bg-white/40 dark:bg-slate-900/40 shadow-none relative`} >
                    <div className="sticky top-0 z-30 pb-4 bg-transparent backdrop-blur-md -mx-4 px-4 pt-1">
                        <div className="bg-slate-100/80 dark:bg-slate-800/80 flex w-full gap-1 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                            {[
                                { id: 'type', label: 'Typ', icon: Box },
                                { id: 'parts', label: 'Skladba', icon: Layers },
                                { id: 'finish', label: 'Povrch', icon: Box },
                                { id: 'accs', label: 'Kování', icon: Wrench },
                                { id: 'material', label: 'Materiál', icon: Table },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                                >
                                    <tab.icon size={13} className={activeTab === tab.id ? 'text-blue-600' : 'text-slate-400'} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {activeTab === 'type' && (
                        <div className="space-y-4 animate-in slide-in-from-right-4">
                            {/* 1) Profil zárubně - Grid of Cards */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 italic">Profil zárubně</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {PROFILE_PRESETS.map((profile) => (
                                        <button
                                            key={profile.id}
                                            onClick={() => handleConfigUpdate({ frameProfile: profile.id, thickness: profile.thickness })}
                                            className={`relative group flex flex-col items-center justify-center p-3 rounded-2xl transition-all h-24 ${config.frameProfile === profile.id
                                                ? 'bg-white dark:bg-slate-900 border border-blue-400/50 shadow-xl ring-1 ring-blue-400/30'
                                                : 'bg-transparent border border-transparent hover:bg-white/50 dark:hover:bg-slate-800/40'
                                                }`}
                                        >
                                            <span className={`text-[11px] font-black uppercase tracking-widest transition-colors ${config.frameProfile === profile.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                                {profile.label}
                                            </span>
                                            <span className="text-[9px] font-bold text-slate-400 mt-1">tl. {profile.thickness} mm</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 2) Typ konstrukce */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 italic">Typ konstrukce</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        { id: 'Standard', icon: Box },
                                        { id: 'RC', icon: Shield },
                                        { id: 'EI', icon: Flame },
                                        { id: 'RW', icon: Volume2 }
                                    ].map((item) => {
                                        const Icon = item.icon;
                                        const isActive = config.constructionType === item.id;
                                        const isLibero = config.frameProfile === 'LIBERO';
                                        const isDisabled = isLibero && item.id !== 'Standard';

                                        return (
                                            <button
                                                key={item.id}
                                                disabled={isDisabled}
                                                onClick={() => handleConfigUpdate('constructionType', item.id)}
                                                className={`relative flex flex-col items-center justify-center p-2 rounded-2xl transition-all h-24 ${isActive
                                                    ? 'bg-white dark:bg-slate-900 border border-blue-400/50 shadow-xl ring-1 ring-blue-400/30'
                                                    : 'bg-transparent border border-transparent hover:bg-white/50 dark:hover:bg-slate-800/40 opacity-50'
                                                    } ${isDisabled ? 'opacity-20 grayscale pointer-events-none' : ''}`}
                                            >
                                                <Icon size={20} className={`mb-2 transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`} />
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>
                                                    {item.id}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 3) Orientace - Single Row (4 cards) */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 italic">Orientace</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        { id: 'Levé dovnitř', label: 'Levé', sub: 'Dovnitř' },
                                        { id: 'Pravé dovnitř', label: 'Pravé', sub: 'Dovnitř' },
                                        { id: 'Levé ven', label: 'Levé', sub: 'Ven' },
                                        { id: 'Pravé ven', label: 'Pravé', sub: 'Ven' }
                                    ].map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => handleConfigUpdate('orientation', opt.id)}
                                            className={`relative p-2 rounded-2xl transition-all h-24 flex flex-col items-center justify-center ${config.orientation === opt.id
                                                ? 'bg-white dark:bg-slate-900 border border-blue-400/50 shadow-xl ring-1 ring-blue-400/30'
                                                : 'bg-transparent border border-transparent hover:bg-white/50 dark:hover:bg-slate-800/40 opacity-50'
                                                }`}
                                        >
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${config.orientation === opt.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>
                                                {opt.label}
                                            </span>
                                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-70">
                                                {opt.sub}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 4) Rozměry - Liquid Layout */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 italic">Rozměry křídla</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white dark:bg-slate-900 p-4 h-24 rounded-[32px] flex flex-col justify-center relative shadow-sm border border-slate-200/50 dark:border-slate-700/50 group">
                                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] absolute top-4 left-6">Šířka (mm)</div>
                                        <div className="flex items-center justify-between mt-3 px-2">
                                            <ManagedInput
                                                value={config.width}
                                                onChange={(val) => handleConfigUpdate('width', val)}
                                                min={limits.width.min}
                                                max={limits.width.max}
                                                placeholder="800"
                                                className="w-full bg-transparent border-none outline-none font-black text-3xl text-slate-900 dark:text-white pointer-events-auto"
                                            />
                                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ChevronUp className="text-slate-400" size={16} />
                                                <ChevronDown className="text-slate-400" size={16} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 p-4 h-24 rounded-[32px] flex flex-col justify-center relative shadow-sm border border-slate-200/50 dark:border-slate-700/50 group">
                                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] absolute top-4 left-6">Výška (mm)</div>
                                        <div className="flex items-center justify-between mt-3 px-2">
                                            <ManagedInput
                                                value={config.height}
                                                onChange={(val) => handleConfigUpdate('height', val)}
                                                min={limits.height.min}
                                                max={limits.height.max}
                                                placeholder="2200"
                                                className="w-full bg-transparent border-none outline-none font-black text-3xl text-slate-900 dark:text-white pointer-events-auto"
                                            />
                                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ChevronUp className="text-slate-400" size={16} />
                                                <ChevronDown className="text-slate-400" size={16} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 5) Horní nadpanel - Double Card Layout */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 italic">Horní nadpanel</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div
                                        onClick={() => handleConfigUpdate('topPanelEnabled', !config.topPanelEnabled)}
                                        className={`bg-white dark:bg-slate-900 border transition-all rounded-[32px] p-6 h-24 flex items-center justify-between cursor-pointer ${config.topPanelEnabled ? 'border-blue-400/50 ring-1 ring-blue-400/20 shadow-lg' : 'border-slate-200/50 dark:border-slate-700/50'}`}
                                    >
                                        <span className={`text-[11px] font-black uppercase tracking-widest ${config.topPanelEnabled ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>Aktivovat</span>
                                        <div className={`w-12 h-6 rounded-full relative transition-all ${config.topPanelEnabled ? 'bg-blue-500 shadow-lg shadow-blue-500/30' : 'bg-slate-200 dark:bg-slate-800'}`}>
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${config.topPanelEnabled ? 'left-7' : 'left-1'}`} />
                                        </div>
                                    </div>

                                    <div className={`bg-white dark:bg-slate-900 p-4 h-24 rounded-[32px] flex flex-col justify-center relative shadow-sm border border-slate-200/50 dark:border-slate-700/50 group ${!config.topPanelEnabled ? 'opacity-30' : ''}`}>
                                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] absolute top-4 left-6">Výška nadpanelu (mm)</div>
                                        <div className="flex items-center justify-between mt-3 px-2">
                                            <ManagedInput
                                                disabled={!config.topPanelEnabled}
                                                value={config.topPanelHeight}
                                                onChange={(val) => handleConfigUpdate('topPanelHeight', val)}
                                                min={200} max={800}
                                                placeholder="400"
                                                className="w-full bg-transparent border-none outline-none font-black text-3xl text-slate-900 dark:text-white pointer-events-auto"
                                            />
                                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ChevronUp className="text-slate-400" size={16} />
                                                <ChevronDown className="text-slate-400" size={16} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 6) Atypické provedení - Card with Toggle and Description */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 italic">Speciální úprava</label>
                                <div className="space-y-3">
                                    {/* Atypical Logic Pre-calculation */}
                                    {(() => {
                                        const STANDARD_WIDTHS = [600, 700, 800, 900, 1000];
                                        const STANDARD_HEIGHT = 1970;
                                        const preset = getProfilePreset(config.frameProfile);
                                        const isAutoAtypical = !STANDARD_WIDTHS.includes(Number(config.width)) ||
                                            Number(config.height) !== STANDARD_HEIGHT ||
                                            (config.thickness && Number(config.thickness) !== preset.thickness) ||
                                            (config.rebateType === 'Atypický falc');

                                        return (
                                            <>
                                                <div
                                                    className={`bg-white dark:bg-slate-900 border transition-all rounded-3xl p-6 h-28 flex items-center justify-between ${isAutoAtypical ? 'border-blue-400/50 shadow-lg' : 'border-slate-200/50 dark:border-slate-700/50'}`}
                                                >
                                                    <div className="flex flex-col">
                                                        <span className={`text-[12px] font-black uppercase tracking-widest ${isAutoAtypical ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}>Stav konstrukce</span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-70">
                                                            {isAutoAtypical ? 'Atypický rozměr detekován' : 'Standardní konstrukce'}
                                                        </span>
                                                    </div>
                                                    <div className={`w-14 h-7 rounded-full relative transition-all ${isAutoAtypical ? 'bg-blue-500 shadow-lg shadow-blue-500/30' : 'bg-slate-200 dark:bg-slate-800'}`}>
                                                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-sm ${isAutoAtypical ? 'left-8' : 'left-1'}`} />
                                                    </div>
                                                </div>

                                                {isAutoAtypical && (
                                                    <div className="px-6 py-5 bg-blue-50/80 dark:bg-blue-900/10 border border-blue-200/50 dark:border-blue-800/40 rounded-3xl space-y-2">
                                                        <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Automaticky detekováno</div>
                                                        <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 leading-relaxed list-disc">
                                                            {config.atypicalNote.split('\n').filter(Boolean).map((line, i) => (
                                                                <div key={i} className="flex items-center gap-2">
                                                                    <div className="w-1 h-1 bg-slate-400 rounded-full" />
                                                                    {line}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}

                                    <div
                                        onClick={() => handleConfigUpdate('specialNoteEnabled', !config.specialNoteEnabled)}
                                        className={`bg-white dark:bg-slate-900 border transition-all rounded-3xl p-6 h-24 flex items-center justify-between cursor-pointer ${config.specialNoteEnabled ? 'border-blue-400/50 shadow-lg' : 'border-slate-200/50 dark:border-slate-700/50'}`}
                                    >
                                        <div className="flex flex-col">
                                            <span className={`text-[12px] font-black uppercase tracking-widest ${config.specialNoteEnabled ? 'text-blue-600' : 'text-slate-600 dark:text-slate-400'}`}>
                                                Speciální úprava
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-70">
                                                Ruční poznámka k úpravě
                                            </span>
                                        </div>
                                        <div className={`w-14 h-7 rounded-full relative transition-all ${config.specialNoteEnabled ? 'bg-blue-500 shadow-lg shadow-blue-500/30' : 'bg-slate-200 dark:bg-slate-800'}`}>
                                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-sm ${config.specialNoteEnabled ? 'left-8' : 'left-1'}`} />
                                        </div>
                                    </div>
                                </div>
                                {(config.atypicalSize || config.specialNoteEnabled) && (
                                    <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
                                        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 rounded-[32px] p-6 min-h-[160px] flex flex-col shadow-sm">
                                            <div className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4 flex items-center justify-between">
                                                <span>{config.atypicalSize ? 'Poznámka k atypu' : 'Poznámka ke speciální úpravě'}</span>
                                                <span className="text-slate-300 dark:text-slate-600 normal-case font-black italic">Technický ředitel schvaluje</span>
                                            </div>
                                            <textarea
                                                value={config.userAtypicalNote}
                                                onChange={(e) => handleConfigUpdate('userAtypicalNote', e.target.value)}
                                                placeholder="Zadejte doplňující popis úpravy..."
                                                className="w-full bg-transparent border-none outline-none font-bold text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400/40 resize-none flex-1 custom-scrollbar leading-relaxed"
                                            />
                                        </div>
                                        <div className="flex items-start gap-4 p-5 bg-amber-50/80 dark:bg-amber-900/10 rounded-[24px] border border-amber-200/50 dark:border-amber-800/20 shadow-sm">
                                            <div className="w-10 h-10 bg-amber-400/20 rounded-xl flex items-center justify-center text-xl shrink-0">⚠️</div>
                                            <span className="text-[11px] font-black text-amber-900 dark:text-amber-400 leading-tight uppercase tracking-tight">
                                                Speciální úprava může ovlivnit cenu a termín dodání. Finální schválení konstrukce podléhá odsouhlasení technickému řediteli.
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {
                        activeTab === 'parts' && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 pb-12">
                                {/* 1) Tloušťka křídla */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 italic">Tloušťka křídla</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white dark:bg-slate-900 p-4 h-24 rounded-[32px] flex flex-col justify-center relative shadow-sm border border-slate-200/50 dark:border-slate-700/50 group">
                                            <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] absolute top-4 left-6">Tloušťka (mm)</div>
                                            <div className="flex items-center justify-between mt-3 px-2">
                                                <ManagedInput
                                                    value={config.thickness}
                                                    onChange={(val) => handleConfigUpdate('thickness', val)}
                                                    min={30} max={100}
                                                    placeholder="45"
                                                    className="w-full bg-transparent border-none outline-none font-black text-3xl text-slate-900 dark:text-white pointer-events-auto"
                                                />
                                                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ChevronUp className="text-slate-400" size={16} />
                                                    <ChevronDown className="text-slate-400" size={16} />
                                                </div>
                                            </div>
                                        </div>

                                        <div
                                            className={`bg-white dark:bg-slate-900 border transition-all rounded-[32px] p-6 h-24 flex items-center justify-center ${config.standardThickness
                                                ? 'border-slate-200/50 dark:border-slate-700/50 opacity-60'
                                                : 'border-blue-400/50 ring-1 ring-blue-400/20 shadow-lg'}`}
                                        >
                                            <div className="flex flex-col items-center">
                                                <span className={`text-[11px] font-black uppercase tracking-widest ${!config.standardThickness ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>
                                                    {config.standardThickness ? 'Standardní' : 'Atypická'}
                                                </span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-70">Konstrukce</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* AI Skladba Section */}
                                    {!config.standardThickness && (aiDraft || appliedAiDraft) && (
                                        <div className="mt-4 p-5 bg-blue-50/80 dark:bg-blue-900/10 border border-blue-200/50 dark:border-blue-800/40 rounded-3xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="flex items-center justify-between">
                                                <div className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                                                    {appliedAiDraft ? 'Aplikovaná skladba' : 'Návrh skladby'}
                                                </div>
                                                {((appliedAiDraft?.error || aiDraft?.error)) && <span className="text-[10px] font-bold text-rose-500 uppercase">Chyba</span>}
                                            </div>

                                            {(() => {
                                                const d = appliedAiDraft || aiDraft;
                                                if (!d) return null;
                                                if (d.error) return <div className="text-[11px] font-bold text-rose-500">{d.error}</div>;
                                                return (
                                                    <div className="space-y-4">
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                                                                <div className="text-slate-400 text-[8px] font-black uppercase tracking-widest mb-1">MDF Líc</div>
                                                                <div className="text-slate-900 dark:text-slate-100 font-black text-sm">{d.combo?.combo?.length ? d.combo.combo.map(v => `${v} mm`).join(' + ') : '-'}</div>
                                                            </div>
                                                            <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                                                                <div className="text-slate-400 text-[8px] font-black uppercase tracking-widest mb-1">MDF Rub</div>
                                                                <div className="text-slate-900 dark:text-slate-100 font-black text-sm">{d.combo?.combo?.length ? d.combo.combo.map(v => `${v} mm`).join(' + ') : '-'}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[11px] font-black text-slate-700 dark:text-slate-300 bg-white/40 dark:bg-slate-800/40 p-3 rounded-xl border border-white/60 dark:border-slate-700/60">
                                                            PŘÍPRAVNÝ HRANOL: <span className="text-blue-600">{d.prism} mm</span>
                                                        </div>
                                                        {d.needsCalibration && (
                                                            <div className={`text-[10px] font-bold rounded-2xl px-4 py-3 flex items-start gap-3 border ${d.combo && d.combo.total > d.sideMdf
                                                                ? 'text-amber-800 bg-amber-100/50 border-amber-200'
                                                                : 'text-rose-800 bg-rose-100/50 border-rose-200'
                                                                }`}>
                                                                <span className="text-lg">⚠️</span>
                                                                <span className="leading-tight mt-0.5">
                                                                    {d.combo && d.combo.total > d.sideMdf
                                                                        ? `Nutná kalibrace na brusce (zbrousit o ${(d.combo.total - d.sideMdf).toFixed(1)} mm na každé straně).`
                                                                        : `Skladba je o ${(d.sideMdf - (d.combo?.total || 0)).toFixed(1)} mm tenčí než cílová tloušťka.`}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {appliedAiDraft && (
                                                            <div className="text-[10px] text-emerald-600 font-black uppercase tracking-widest flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-xl border border-emerald-100 dark:border-emerald-800">
                                                                <Check size={14} strokeWidth={3} /> Skladba aplikována
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>

                                {/* 2) Polodrážka (Falc) */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 italic">Polodrážka (Falc)</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[
                                            { id: 'Standardní falc 12/14 mm', label: 'Standard', sub: '12/14 mm' },
                                            { id: 'Bez horního falce', label: 'Bez', sub: 'horního' },
                                            { id: 'Bezfalcové (hladké)', label: 'Bez', sub: 'falců' },
                                            { id: 'Atypický falc', label: 'Atyp', sub: 'falc' }
                                        ].map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => {
                                                    if (opt.id === 'Standardní falc 12/14 mm') {
                                                        handleConfigUpdate({ rebateType: opt.id, rebateWidth: 14, rebateDepth: 12 });
                                                    } else {
                                                        handleConfigUpdate({ rebateType: opt.id });
                                                    }
                                                }}
                                                className={`relative p-2 rounded-2xl transition-all h-24 flex flex-col items-center justify-center ${config.rebateType === opt.id
                                                    ? 'bg-white dark:bg-slate-900 border border-blue-400/50 shadow-xl ring-1 ring-blue-400/30 font-black text-blue-600'
                                                    : 'bg-transparent border border-transparent opacity-50 text-slate-500 hover:bg-white/50 dark:hover:bg-slate-800/40'
                                                    }`}
                                            >
                                                <span className="text-[10px] uppercase tracking-widest">{opt.label}</span>
                                                <span className="text-[8px] font-bold uppercase tracking-widest mt-1 opacity-70">{opt.sub}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 3) Výplň křídla */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 italic">Výplň jádra</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {Object.keys(ITEM_INFILLS).map(id => (
                                            <button
                                                key={id}
                                                onClick={() => handleConfigUpdate('infill', id)}
                                                className={`relative p-3 rounded-2xl transition-all h-24 flex flex-col items-center justify-center ${config.infill === id
                                                    ? 'bg-white dark:bg-slate-900 border border-blue-400/50 shadow-xl ring-1 ring-blue-400/30'
                                                    : 'bg-transparent border border-transparent opacity-50 hover:bg-white/50 dark:hover:bg-slate-800/40'
                                                    }`}
                                            >
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${config.infill === id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>
                                                    {ITEM_INFILLS[id]}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 4) Počet hranolů */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 italic">Počet hranolů</label>
                                    <div className="bg-white dark:bg-slate-900 p-4 h-24 rounded-[32px] flex flex-col justify-center relative shadow-sm border border-slate-200/50 dark:border-slate-700/50 group">
                                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] absolute top-4 left-6">Počet kusů</div>
                                        <div className="flex items-center justify-between mt-3 px-2">
                                            <ManagedInput
                                                value={config.prisms}
                                                onChange={(val) => handleConfigUpdate('prisms', val)}
                                                min={1} max={10}
                                                placeholder="2"
                                                className="w-full bg-transparent border-none outline-none font-black text-3xl text-slate-900 dark:text-white pointer-events-auto"
                                            />
                                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ChevronUp className="text-slate-400" size={16} />
                                                <ChevronDown className="text-slate-400" size={16} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    {
                        activeTab === 'finish' && (
                            <div className="space-y-4 animate-in slide-in-from-right-4">
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    {/* Unified Finish Toggle Card */}
                                    <div
                                        onClick={() => handleConfigUpdate('unifiedFinish', !config.unifiedFinish)}
                                        className={`${glassSub} border transition-all rounded-2xl p-4 h-24 flex flex-col justify-center cursor-pointer group ${config.unifiedFinish
                                            ? 'border-blue-400/60 ring-1 ring-blue-400/40 shadow-[0_16px_40px_rgba(59,130,246,0.14)]'
                                            : ''}`}
                                    >
                                        <div className="flex items-center justify-between h-full">
                                            <div className="flex flex-col justify-center">
                                                <span className={`text-[11px] font-black uppercase tracking-widest ${config.unifiedFinish ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>Jednotný povrch</span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-70">Všechny plochy shodné</span>
                                            </div>
                                            <div className={`w-10 h-5 rounded-full relative transition-all ${config.unifiedFinish ? 'bg-blue-600 shadow-[0_0_12px_rgba(59,130,246,0.4)]' : 'bg-slate-300 dark:bg-slate-700'}`}>
                                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${config.unifiedFinish ? 'left-6' : 'left-1'}`} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Indicator Card */}
                                    <div className={`${glassSub} border transition-all rounded-2xl p-4 h-24 flex flex-col justify-center ${config.unifiedFinish
                                        ? 'border-blue-400/60 ring-1 ring-blue-400/40 shadow-[0_16px_40px_rgba(59,130,246,0.14)]'
                                        : ''}`}>
                                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                            {config.unifiedFinish ? 'Vybraný povrch' : 'Individuální výběr'}
                                        </div>
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            {config.unifiedFinish && (
                                                <div className="w-8 h-8 rounded-lg border border-white shadow-sm flex-shrink-0" style={{ backgroundColor: getFinishById(config.finishSideA).color }} />
                                            )}
                                            {!config.unifiedFinish && (
                                                <div className="w-8 h-8 rounded-lg border border-white shadow-sm flex-shrink-0 bg-slate-100 flex items-center justify-center text-slate-400">
                                                    <Info size={16} />
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <div className={`text-[10px] font-black uppercase truncate ${config.unifiedFinish ? 'text-blue-600' : 'text-slate-700 dark:text-slate-200'}`}>
                                                    {config.unifiedFinish && formatFinishLabel(getFinishById(config.finishSideA).label)}
                                                    {!config.unifiedFinish && 'Různé povrchy'}
                                                </div>
                                                <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider truncate">
                                                    {config.unifiedFinish ? 'Aplikováno na všechny plochy' : 'Samostatné nastavení pro A/B/Hrany'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* If NOT Unified, show individual side selectors */}
                                {/* If NOT Unified, show individual side selectors */}
                                {!config.unifiedFinish && (
                                    <div className={`grid ${config.topPanelEnabled ? 'grid-cols-4' : 'grid-cols-3'} gap-2 mb-6 animate-in slide-in-from-top-2`}>
                                        {[
                                            { id: 'sideA', label: 'Strana A', cur: config.finishSideA },
                                            { id: 'sideB', label: 'Strana B', cur: config.finishSideB },
                                            { id: 'edge', label: 'Hrany', cur: config.finishEdge },
                                            ...(config.topPanelEnabled ? [{ id: 'topPanel', label: 'Nadpanel', cur: config.finishTopPanel }] : [])
                                        ].map(target => (
                                            <div
                                                key={target.id}
                                                onClick={() => setSurfaceTarget(target.id)}
                                                className={`transition-all rounded-2xl p-3 cursor-pointer flex flex-col items-center gap-2 h-28 justify-center border ${surfaceTarget === target.id
                                                    ? 'bg-white dark:bg-slate-900 border-blue-400/50 shadow-xl ring-1 ring-blue-400/30'
                                                    : 'bg-white/40 dark:bg-slate-800/20 border-white/40 dark:border-slate-700/30 opacity-60 hover:opacity-100 hover:bg-white/60'}`}
                                            >
                                                <div className="w-10 h-10 rounded-xl border border-white shadow-sm shrink-0" style={{ backgroundColor: getFinishById(target.cur).color }} />
                                                <div className="text-center min-w-0 w-full px-1">
                                                    <span className={`block text-[10px] font-black uppercase tracking-widest truncate ${surfaceTarget === target.id ? 'text-blue-600' : 'text-slate-500'}`}>{target.label}</span>
                                                    <span className="block text-[8px] font-bold text-slate-400 mt-0.5 opacity-70 truncate">{formatFinishLabel(getFinishById(target.cur).label)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Finish Type (Category) Selection Cards */}
                                <div className="space-y-3 mb-6 mt-4">
                                    <div className={sectionHeaderClass}>
                                        <label className={labelClass}>Kategorie povrchu</label>
                                    </div>
                                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                        {[
                                            { id: 'none', label: 'Bez', icon: X },
                                            { id: 'ral', label: 'RAL', icon: Settings2 },
                                            { id: 'ncs', label: 'NCS', icon: Layout },
                                            { id: 'hpl', label: 'HPL', icon: Box },
                                            { id: 'veneer', label: 'Dýha', icon: Layers }
                                        ].map(cat => (
                                            <div
                                                key={cat.id}
                                                onClick={() => {
                                                    setSurfaceCategory(cat.id);
                                                    if (cat.id === 'none') {
                                                        const key = config.unifiedFinish ? 'finishSideA' : (surfaceTarget === 'sideA' ? 'finishSideA' : (surfaceTarget === 'sideB' ? 'finishSideB' : (surfaceTarget === 'edge' ? 'finishEdge' : 'finishTopPanel')));
                                                        handleConfigUpdate(key, 'none');
                                                    }
                                                }}
                                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all cursor-pointer h-20 ${surfaceCategory === cat.id
                                                    ? 'bg-white/80 dark:bg-slate-900/80 border-blue-400/50 shadow-[0_12px_32px_rgba(59,130,246,0.16)] ring-1 ring-blue-400/40 text-blue-600'
                                                    : 'bg-white/50 dark:bg-slate-900/40 border-white/60 dark:border-slate-800/50 text-slate-500 hover:bg-white/70 dark:hover:bg-slate-800/60'}`}
                                            >
                                                <cat.icon size={16} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {surfaceCategory !== 'none' && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={finishSearch}
                                                onChange={(e) => setFinishSearch(e.target.value)}
                                                placeholder="Vyhledat RAL / NCS / dekor"
                                                className={fieldClass}
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-500">Hledat</span>
                                        </div>


                                        {/* FAVORITES SECTION for RAL */}
                                        {surfaceCategory === 'ral' && (
                                            <div className="mb-4">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2 opacity-70">Oblíbené</label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {FINISH_PRESETS.filter(p => ['ral-9003', 'ral-9016', 'ral-9005'].includes(p.id)).map(finish => (
                                                        <button
                                                            key={finish.id}
                                                            onClick={() => {
                                                                handleConfigUpdate(
                                                                    config.unifiedFinish ? 'finishSideA' : (surfaceTarget === 'sideA' ? 'finishSideA' : (surfaceTarget === 'sideB' ? 'finishSideB' : (surfaceTarget === 'edge' ? 'finishEdge' : 'finishTopPanel'))),
                                                                    finish.id
                                                                );
                                                            }}
                                                            className={`flex flex-col gap-2 p-3 rounded-2xl border transition-all h-20 justify-center group overflow-hidden relative ${(
                                                                config.unifiedFinish ? config.finishSideA : (surfaceTarget === 'sideA' ? config.finishSideA : (surfaceTarget === 'sideB' ? config.finishSideB : (surfaceTarget === 'edge' ? config.finishEdge : config.finishTopPanel)))
                                                            ) === finish.id
                                                                ? 'bg-white/85 dark:bg-slate-900/85 border-blue-400/60 ring-1 ring-blue-400/40 shadow-[0_16px_40px_rgba(59,130,246,0.18)]'
                                                                : 'bg-white/60 dark:bg-slate-900/50 border-white/60 dark:border-slate-800/50 hover:bg-white/70 dark:hover:bg-slate-800/60'}`}
                                                            style={{ backgroundColor: finish.color }}
                                                        >
                                                            <div className="relative z-10 w-full flex items-center gap-2">
                                                                <span className={`block text-[10px] font-black uppercase tracking-wide truncate ${(
                                                                    ['#000000', '#111827'].includes(finish.color) || finish.label.includes('Černá') ? 'text-white' : 'text-slate-900'
                                                                )}`}>{formatFinishLabel(finish.label)}</span>
                                                            </div>
                                                            <span className={`relative z-10 text-[8px] font-bold uppercase tracking-wider text-left pl-0.5 ${(
                                                                ['#000000', '#111827'].includes(finish.color) || finish.label.includes('Černá') ? 'text-white/60' : 'text-slate-900/60'
                                                            )}`}>{finish.id.toUpperCase().replace('-', ' ')}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-3 gap-2 pr-1 pb-2">
                                            {FINISH_PRESETS
                                                .filter(f => {
                                                    if (surfaceCategory === 'all') return true;
                                                    if (surfaceCategory === 'veneer') return f.label.toLowerCase().includes('dýha'); // Strict filter by Name
                                                    return f.category === surfaceCategory;
                                                })
                                                .filter((item) => {
                                                    const search = finishSearch.toLowerCase();
                                                    return item.label.toLowerCase().includes(search) || item.id.toLowerCase().includes(search);
                                                })
                                                .map((finish) => (
                                                    <button
                                                        key={finish.id}
                                                        onClick={() => {
                                                            handleConfigUpdate(
                                                                config.unifiedFinish
                                                                    ? 'finishSideA'
                                                                    : surfaceTarget === 'sideA'
                                                                        ? 'finishSideA'
                                                                        : surfaceTarget === 'sideB'
                                                                            ? 'finishSideB'
                                                                            : surfaceTarget === 'edge'
                                                                                ? 'finishEdge'
                                                                                : 'finishTopPanel',
                                                                finish.id
                                                            );
                                                        }}
                                                        className={`flex flex-col gap-2 p-3 rounded-2xl border transition-all h-20 justify-center overflow-hidden relative ${(
                                                            config.unifiedFinish
                                                                ? config.finishSideA
                                                                : surfaceTarget === 'sideA'
                                                                    ? config.finishSideA
                                                                    : surfaceTarget === 'sideB'
                                                                        ? config.finishSideB
                                                                        : surfaceTarget === 'edge'
                                                                            ? config.finishEdge
                                                                            : surfaceTarget === 'topPanel'
                                                                                ? config.finishTopPanel
                                                                                : ''
                                                        ) === finish.id
                                                            ? 'bg-white/85 dark:bg-slate-900/85 border-blue-400/60 shadow-[0_16px_40px_rgba(59,130,246,0.18)] ring-1 ring-blue-400/40'
                                                            : 'bg-white/60 dark:bg-slate-900/50 border-white/60 dark:border-slate-800/50 hover:bg-white/70 dark:hover:bg-slate-800/60'
                                                            }`}
                                                        style={{ backgroundColor: finish.color }}
                                                    >
                                                        <div className="relative z-10 w-full flex items-center gap-2">
                                                            <span className={`block text-[10px] font-black uppercase tracking-wide truncate ${getTextColorForBackground(finish.color, finish.label)}`}>{formatFinishLabel(finish.label)}</span>
                                                        </div>
                                                        <span className={`relative z-10 text-[8px] font-bold uppercase tracking-wider text-left pl-0.5 ${getTextColorForBackgroundSub(finish.color, finish.label)}`}>{finish.id.toUpperCase().replace('-', ' ')}</span>
                                                    </button>
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    }

                    {
                        activeTab === 'accs' && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 pb-12">
                                {/* 1. Hinges (Panty) */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 italic">Panty a kování</label>
                                    <div className="space-y-3">
                                        <div className="bg-white/80 dark:bg-slate-900/80 p-4 h-24 rounded-[32px] flex flex-col justify-center relative shadow-sm border border-slate-200/50 dark:border-slate-700/50 group">
                                            <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] absolute top-4 left-6">Počet pantů (ks)</div>
                                            <div className="flex items-center justify-between mt-3 px-2">
                                                <ManagedInput
                                                    value={config.hingesCount}
                                                    onChange={(val) => handleConfigUpdate('hingesCount', val)}
                                                    min={2} max={5}
                                                    placeholder="3"
                                                    className="w-full bg-transparent border-none outline-none font-black text-3xl text-slate-900 dark:text-white pointer-events-auto"
                                                />
                                                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ChevronUp className="text-slate-400" size={16} />
                                                    <ChevronDown className="text-slate-400" size={16} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { label: 'ANSELMI 160', load: 80 },
                                            { label: 'TECTUS 340', load: 80 },
                                            { label: 'TECTUS 540', load: 120 }
                                        ].map(hinge => (
                                            <button
                                                key={hinge.label}
                                                onClick={() => handleConfigUpdate('hingesType', hinge.label)}
                                                className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all h-20 text-center ${config.hingesType === hinge.label
                                                    ? 'bg-white dark:bg-slate-900 border border-blue-400/50 shadow-xl ring-1 ring-blue-400/30'
                                                    : 'bg-transparent border border-transparent opacity-50 hover:bg-white/50 dark:hover:bg-slate-800/40 text-slate-500'}`}
                                            >
                                                <span className={`text-[10px] font-black uppercase tracking-widest leading-tight ${config.hingesType === hinge.label ? 'text-blue-600' : ''}`}>
                                                    {hinge.label.split(' ')[0]}<br />{hinge.label.split(' ')[1]}
                                                </span>
                                                <span className="text-[8px] font-bold mt-1 uppercase tracking-widest opacity-60">
                                                    {hinge.load} kg
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 2. Ovládání dveří */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 italic">Ovládání a zámek</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: 'none', label: 'Bez', icon: X },
                                            { id: 'handle', label: 'Klika', icon: MousePointer2 },
                                            { id: 'bar', label: 'Madlo', icon: Maximize2 }
                                        ].map(cat => (
                                            <div
                                                key={cat.id}
                                                onClick={() => {
                                                    setHandleCategory(cat.id);
                                                    if (cat.id === 'none') {
                                                        handleConfigUpdate('handleType', 'Bez');
                                                        handleConfigUpdate('lockType', 'Bez');
                                                    } else if (cat.id === 'handle') {
                                                        handleConfigUpdate('handleType', 'handle-standard');
                                                    } else if (cat.id === 'bar') {
                                                        handleConfigUpdate('handleType', 'bar-600');
                                                    }
                                                }}
                                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all cursor-pointer h-24 ${handleCategory === cat.id
                                                    ? 'bg-white dark:bg-slate-900 border-blue-400/50 shadow-xl ring-1 ring-blue-400/40 text-blue-600'
                                                    : 'bg-transparent border-transparent opacity-50 hover:bg-white/50 dark:hover:bg-slate-800/40 text-slate-500'}`}
                                            >
                                                <cat.icon size={20} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {handleCategory === 'bar' && (
                                        <div className="bg-white dark:bg-slate-900 p-4 h-24 rounded-[32px] border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between px-6 animate-in slide-in-from-top-2">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black uppercase tracking-widest">Délka madla</span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">V milimetrech</span>
                                            </div>
                                            <div className="flex gap-2">
                                                {[300, 600, 900].map(len => (
                                                    <button
                                                        key={len}
                                                        onClick={() => handleConfigUpdate('handleType', `bar-${len}`)}
                                                        className={`px-4 py-2 rounded-xl border text-[10px] font-black transition-all ${config.handleType === `bar-${len}` ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'}`}
                                                    >
                                                        {len}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-4 pt-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 italic">Typ zámku</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { id: 'Mechanický', icon: Wrench },
                                                { id: 'Magnetický', icon: Target },
                                                { id: 'Elektrický', icon: Cpu }
                                            ].map(lock => (
                                                <button
                                                    key={lock.id}
                                                    onClick={() => handleConfigUpdate('lockType', lock.id)}
                                                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all h-24 ${config.lockType === lock.id
                                                        ? 'bg-white/80 dark:bg-slate-900/80 border-blue-400/50 shadow-xl ring-1 ring-blue-400/40 text-blue-600'
                                                        : 'bg-transparent border-transparent opacity-50 hover:bg-white/50 dark:hover:bg-slate-800/40 text-slate-500'}`}
                                                >
                                                    <lock.icon size={20} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{lock.id}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 italic">Povrch kování</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { id: 'nerez', label: 'Nerez', color: '#94a3b8' },
                                                { id: 'black', label: 'Černá', color: '#111827' },
                                                { id: 'gold', label: 'Mosaz', color: '#fbbf24' }
                                            ].map(opt => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => handleConfigUpdate('handleFinish', opt.id)}
                                                    className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${config.handleFinish === opt.id
                                                        ? 'bg-white/80 dark:bg-slate-900/80 border-blue-400/50 shadow-xl ring-1 ring-blue-400/40'
                                                        : 'bg-transparent border-transparent opacity-50 hover:bg-white/50 dark:hover:bg-slate-800/40'}`}
                                                >
                                                    <div className="w-6 h-6 rounded-full border border-white/20 shadow-sm shrink-0" style={{ backgroundColor: opt.color }} />
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${config.handleFinish === opt.id ? 'text-blue-600' : 'text-slate-500'}`}>
                                                        {opt.label}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Doplňky */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 italic">Doplňková výbava</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: 'rosette', label: 'Rozeta', icon: Target },
                                            { id: 'dropSeal', label: 'Práh', icon: ArrowDownCircle },
                                            { id: 'cableGrommet', label: 'Kabel', icon: Hash }
                                        ].map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => handleConfigUpdate(opt.id, !config[opt.id])}
                                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all h-24 ${config[opt.id]
                                                    ? 'bg-white dark:bg-slate-900 border-blue-400/50 shadow-xl ring-1 ring-blue-400/40 text-blue-600'
                                                    : 'bg-transparent border-transparent opacity-50 hover:bg-white/50 dark:hover:bg-slate-800/40 text-slate-500'}`}
                                            >
                                                <opt.icon size={20} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{opt.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    {activeTab === 'material' && (
                        <div className="pt-4 pb-72 max-w-2xl mx-auto space-y-4 relative h-full flex flex-col">

                            {/* SECTION 1: TECHNICKÉ SPECIFIKACE (Collapsible) */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 italic">Technické specifikace</label>
                                <CollapsibleSection
                                    id="tech_specs_main"
                                    title={
                                        <div className="flex flex-col items-start gap-1">
                                            <div className="text-[12px] font-black text-slate-900 dark:text-white leading-none uppercase tracking-tight">
                                                {config.frameProfile} <span className="text-slate-300 mx-1">|</span> {config.constructionType}
                                            </div>
                                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                {config.thickness} MM <span className="mx-1 opacity-50">/</span> {config.orientation}
                                            </div>
                                        </div>
                                    }
                                    icon={Settings2}
                                    colorClass="text-slate-400"
                                    expandedSection={expandedSection}
                                    setExpandedSection={setExpandedSection}
                                    buttonClassName="bg-white/90 dark:bg-slate-900/90 py-4 shadow-sm"
                                >
                                    <div className={`${glassSub} p-6 shadow-none flex flex-col gap-2 border-none`}>
                                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/50 mb-1">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Profil rámu</span>
                                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">{config.frameProfile}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/50 mb-1">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Varianta profilu</span>
                                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">{config.frameVariant}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/50 mb-1">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Typ křídla</span>
                                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">{config.leafType}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/50 mb-1">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Otevírání</span>
                                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">{config.direction} ({config.orientation})</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/50 mb-1">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Rozměry křídla</span>
                                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tabular-nums">{config.atypicalSize ? 'ATYP ' : ''}{config.width} × {config.height} mm</span>
                                        </div>

                                        {config.topPanelEnabled && (
                                            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/50 mb-1">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Nadpanel</span>
                                                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tabular-nums">{config.topPanelType} V= {config.topPanelHeight} mm</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/50 mb-1">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Povrch (A)</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: config.colorSideA }}></div>
                                                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">{config.finishSideA}</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/50 mb-1">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Povrch (B)</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: config.colorSideB }}></div>
                                                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">{config.finishSideB}</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/50 mb-1">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Hrana</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: config.colorEdge }}></div>
                                                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">{config.finishEdge}</span>
                                            </div>
                                        </div>


                                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/50 mb-1">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Skladba pláště</span>
                                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">{config.skin || 'MDF'} ({(summary?.mdf?.thickness || 'N/A').replace(' + ', '/')})</span>
                                        </div>

                                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/50 mb-1">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Jádro (Výplň)</span>
                                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">{config.infill}</span>
                                        </div>

                                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/50 mb-1">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Hranoly</span>
                                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">{config.prisms} KS</span>
                                        </div>

                                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/50 mb-1">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Panty</span>
                                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">{config.hingesCount}× {config.hingesType}</span>
                                        </div>

                                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/50 mb-1">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Polodrážka</span>
                                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">{config.isFlush ? 'Bezfalcové' : `${config.rebateDepth}/${config.rebateWidth} mm`}</span>
                                        </div>

                                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/50 mb-1">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Zámek</span>
                                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">{config.lockType === 'Bez' ? 'Bez zámku' : `${config.lockType} (${config.lockFinish})`}</span>
                                        </div>

                                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/50 mb-1">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Klika</span>
                                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">{config.handleType === 'Bez' ? 'Bez kování' : config.handleType} ({config.handleFinish})</span>
                                        </div>

                                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/50 mb-1">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Rozeta</span>
                                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">{config.rosette ? 'Ano' : 'Ne'}</span>
                                        </div>

                                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/50 mb-1">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Padací práh</span>
                                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">{config.dropSeal ? 'Ano' : 'Ne'}</span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Kabelová průchodka</span>
                                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">{config.cableGrommet ? 'Ano' : 'Ne'}</span>
                                        </div>
                                    </div>
                                </CollapsibleSection>
                            </div>

                            {/* SECTION 2: KONSTRUKČNÍ MATERIÁL */}
                            <div className="space-y-3 pb-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 italic">Konstrukční materiál</label>

                                <div className="space-y-2">
                                    {/* CARD: MDF PLÁŠTĚ */}
                                    <CollapsibleSection
                                        id="material_mdf_refined"
                                        title={
                                            <div className="flex flex-col items-start gap-1">
                                                <span className="text-sm font-black text-slate-900 dark:text-white uppercase leading-none">MDF Plášť</span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic leading-none">
                                                    {(summary?.mdf?.sheets || []).length} KS <span className="opacity-50 mx-0.5">|</span> {(summary?.mdf?.thickness || 'N/A').replace(' + ', '/')} MM
                                                </span>
                                            </div>
                                        }
                                        icon={Layers}
                                        colorClass="text-slate-400"
                                        expandedSection={expandedSection}
                                        setExpandedSection={setExpandedSection}
                                        summaryContent={
                                            <div className="flex flex-col items-end text-right">
                                                <div className="text-xs font-black text-slate-900 dark:text-white tabular-nums tracking-tighter uppercase whitespace-nowrap leading-none">
                                                    {(100 - (summary?.mdf?.wastePercentage || 0)).toFixed(1)}% <span className="text-[9px] opacity-30">Využití</span>
                                                </div>
                                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 leading-none">{(summary?.mdf?.totalArea || 0).toFixed(2)} m²</div>
                                            </div>
                                        }
                                        buttonClassName="bg-white/80 dark:bg-slate-900/80 border-white dark:border-slate-700 shadow-sm py-4"
                                    >
                                        <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                            <MDFCuttingScheme sheets={summary?.mdf?.sheets} />
                                        </div>
                                    </CollapsibleSection>

                                    {/* CARD: HRANOLY */}
                                    <CollapsibleSection
                                        id="material_prisms_refined"
                                        title={
                                            <div className="flex flex-col items-start gap-1">
                                                <span className="text-sm font-black text-slate-900 dark:text-white uppercase leading-none">Hranoly</span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic leading-none">
                                                    {summary?.prisms?.prismsNeeded || 0} KS <span className="opacity-50 mx-0.5">|</span> Smrk cink
                                                </span>
                                            </div>
                                        }
                                        icon={Wrench}
                                        colorClass="text-slate-400"
                                        expandedSection={expandedSection}
                                        setExpandedSection={setExpandedSection}
                                        summaryContent={
                                            <div className="flex flex-col items-end text-right">
                                                <div className="text-xs font-black text-slate-900 dark:text-white tabular-nums tracking-tighter uppercase whitespace-nowrap leading-none">
                                                    {(100 - (summary?.prisms?.wastePercentage || 0)).toFixed(1)}% <span className="text-[9px] opacity-30">Využití</span>
                                                </div>
                                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 leading-none">{(summary?.prisms?.totalLengthMeters || 0).toFixed(1)} m</div>
                                            </div>
                                        }
                                        buttonClassName="bg-white/80 dark:bg-slate-900/80 border-white dark:border-slate-700 shadow-sm py-4"
                                    >
                                        <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                            <PrismCuttingScheme
                                                bars={summary?.prisms?.bars}
                                                standardLength={summary?.prisms?.standardLength || 3000}
                                            />
                                        </div>
                                    </CollapsibleSection>

                                    {/* CARD: VÝPLŇ (Static) */}
                                    <div className="bg-white/70 dark:bg-slate-800/60 p-4 rounded-2xl border border-white/50 dark:border-slate-700/50 shadow-sm flex items-center justify-between group transition-all hover:bg-white/90 dark:hover:bg-slate-800/90 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-slate-700/30">
                                                <Puzzle size={20} />
                                            </div>
                                            <div className="flex-1 flex flex-col gap-1">
                                                <span className="text-sm font-black text-slate-900 dark:text-white uppercase leading-none">Výplň křídla</span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none italic">
                                                    1 KS <span className="opacity-50 mx-0.5">|</span> {summary?.infill?.name || 'Nezadáno'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex flex-col items-end text-right mr-2">
                                                <div className="text-xs font-black text-slate-900 dark:text-white tabular-nums tracking-tighter uppercase whitespace-nowrap">
                                                    {Math.round(summary?.infill?.w)}×{Math.round(summary?.infill?.h)} <span className="text-[9px] opacity-30">mm</span>
                                                </div>
                                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{(summary?.infill?.area || 0).toFixed(2)} m²</div>
                                            </div>
                                            <div className="w-5 shrink-0" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 3: POVRCHOVÉ ÚPRAVY */}
                            <div className="space-y-3 pb-8">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 italic">Povrchové úpravy</label>
                                <div className={`${glassSub} p-6 shadow-none space-y-4`}>
                                    {(summary?.paintGroups || []).filter(g => !g.isBase).length === 0 ? (
                                        <div className="text-center py-4">
                                            <div className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] italic">Bez povrchové úpravy</div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {(summary?.paintGroups || []).map((group, idx) => (
                                                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-3 rounded-2xl border border-white dark:border-slate-700 shadow-sm flex items-center justify-between group transition-all hover:bg-white/95 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl shadow-inner border border-white/40 shrink-0" style={{ backgroundColor: group.color }}></div>
                                                        <div className="flex-1 flex flex-col gap-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-black text-slate-900 dark:text-white truncate uppercase">{group.finishName}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 flex-wrap">
                                                                {config.unifiedFinish ? (
                                                                    <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-white/5 px-2 py-0.5 rounded border border-slate-100 dark:border-white/5">
                                                                        Kompletní konstrukce
                                                                    </span>
                                                                ) : (
                                                                    (group.usage || group.parts).map((partName, pIdx) => (
                                                                        <span key={pIdx} className="text-[7px] font-bold bg-slate-50 dark:bg-white/5 text-slate-400 px-1.5 py-0.5 rounded border border-slate-100 dark:border-white/5 uppercase tracking-tight">
                                                                            {partName}
                                                                        </span>
                                                                    ))
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="text-right shrink-0">
                                                            <div className="text-sm font-black text-slate-900 dark:text-white tabular-nums tracking-tighter leading-none">
                                                                {group.isBase ? ((group.baseGrams || 0) / 1000).toFixed(2) : ((group.topGrams || 0) / 1000).toFixed(2)} <span className="text-[10px] font-black opacity-30 uppercase">kg</span>
                                                            </div>
                                                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest tabular-nums leading-none mt-1">{(group.area || 0).toFixed(2)} m²</div>
                                                        </div>
                                                        <div className="w-5 shrink-0" /> {/* Space to match arrow align */}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ANCHORED FOOTER ACTION BAR - FIXED AT BOTTOM OF SIDEBAR */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-50 dark:from-slate-950/80 via-slate-50/80 dark:via-slate-950/40 to-transparent pointer-events-none">
                    <div className="max-w-[95%] mx-auto flex gap-3 pointer-events-auto pb-2">
                        {/* PDF Button */}
                        <div className="flex-1 group relative overflow-hidden rounded-[24px]">
                            <button
                                disabled
                                className="w-full h-20 flex flex-col items-center justify-center pt-2 gap-1 bg-white text-slate-400 cursor-not-allowed border border-slate-200/50 shadow-lg transition-all"
                            >
                                <FileText size={22} className="opacity-40" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Export PDF</span>
                                <div className="absolute inset-x-0 bottom-2 flex items-center justify-center">
                                    <span className="text-[7px] font-black uppercase tracking-tight text-slate-500">Připravujeme</span>
                                </div>
                            </button>
                        </div>

                        {/* CNC Button */}
                        <div className="flex-1 group relative overflow-hidden rounded-[24px]">
                            <button className="w-full h-20 flex flex-col items-center justify-center pt-2 gap-1 bg-white text-slate-400 cursor-not-allowed border border-slate-200/50 shadow-lg transition-all">
                                <Cpu size={22} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">CNC Data</span>
                                <div className="absolute inset-x-0 bottom-2 flex items-center justify-center">
                                    <span className="text-[7px] font-black uppercase tracking-tight text-slate-500">Připravujeme</span>
                                </div>
                            </button>
                        </div>

                        {/* Data Button */}
                        <div className="flex-1 group relative overflow-hidden rounded-[24px]">
                            <button className="w-full h-20 flex flex-col items-center justify-center pt-2 gap-1 bg-white text-slate-400 cursor-not-allowed border border-slate-200/50 shadow-lg transition-all">
                                <FileDown size={22} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Json Data</span>
                                <div className="absolute inset-x-0 bottom-2 flex items-center justify-center">
                                    <span className="text-[7px] font-black uppercase tracking-tight text-slate-500">Připravujeme</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Configurator = () => (
    <GlobalErrorBoundary>
        <ConfiguratorContent />
    </GlobalErrorBoundary>
);

export default Configurator;
