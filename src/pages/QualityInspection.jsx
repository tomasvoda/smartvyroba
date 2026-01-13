import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { motion, AnimatePresence } from 'framer-motion';
import { Microscope, Layout, Camera, History, Settings, Search, Plus, ChevronRight, Target, Check, X, Sparkles, Shield, Video, Info, ChevronUp, ChevronDown, Eye, Trash2 } from 'lucide-react';
import QualityDashboard from '../components/quality/QualityDashboard';
import CaptureWizard from '../components/quality/CaptureWizard';
import QualityInspectionLab from '../components/quality/QualityInspectionLab';
import QualityInspectorPanel from '../components/quality/QualityInspectorPanel';
import DefectDetailModal from '../components/quality/DefectDetailModal';
import InspectionDetailSidebar from '../components/quality/InspectionDetailSidebar';
import SegmentProgress from '../components/quality/SegmentProgress';

// REPEATABLE DESIGN CONSTANTS (The "Smart-Vyroba" Design System)
const glassMain = "rounded-[32px] border border-white/70 dark:border-slate-800/60 backdrop-blur-2xl bg-white/78 dark:bg-slate-900/78 shadow-[0_22px_70px_rgba(15,23,42,0.16)]";
const glassSub = "rounded-[24px] border border-white/50 dark:border-slate-800/40 backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 shadow-sm";
const glassChip = "rounded-xl border border-white/80 dark:border-slate-800/70 backdrop-blur bg-white/85 dark:bg-slate-900/80 shadow-sm";

export default function QualityInspection({ settings }) {
    const [view, setView] = useState('DASHBOARD'); // DASHBOARD, CAPTURE, LAB
    const [scanMode, setScanMode] = useState('SINGLE'); // SINGLE, 3SEGMENTS

    // Placeholder for history - with initial mock data
    // Placeholder for history - with initial mock data for dashboard
    const [history, setHistory] = useState([
        {
            id: 'INS-7722',
            action: 'ROZPRACOVÁNO',
            defects: [],
            timestamp: new Date(Date.now() - 3600000 * 0.5), // 30 mins ago
            inspector: 'Václav P.',
            dimensions: { width: 800, height: 1970 },
            image: "/pending-1.jpg"
        },
        {
            id: 'INS-7721',
            action: 'ROZPRACOVÁNO',
            defects: [],
            timestamp: new Date(Date.now() - 3600000 * 1.5), // 1.5 hours ago
            inspector: 'Václav P.',
            dimensions: { width: 800, height: 1970 },
            image: "/pending-2.png"
        },
        // Mock data for today's stats
        {
            id: 'INS-7720',
            action: 'APPROVE',
            defects: [],
            timestamp: new Date(Date.now() - 3600000 * 3),
            inspector: 'Václav P.',
            dimensions: { width: 800, height: 1970 },
            image: "/pending-1.jpg"
        },
        {
            id: 'INS-7719',
            action: 'LAKOVAT',
            defects: [{ id: 1, status: 'LAKOVAT', type: 'DUST', label: 'NEČISTOTA', box: { left: 20, top: 30, width: 5, height: 5 } }],
            timestamp: new Date(Date.now() - 3600000 * 4),
            inspector: 'Václav P.',
            dimensions: { width: 800, height: 1970 },
            image: "/pending-2.png"
        },
        {
            id: 'INS-7718',
            action: 'APPROVE',
            defects: [],
            timestamp: new Date(Date.now() - 3600000 * 6),
            inspector: 'Václav P.',
            image: "/pending-1.jpg"
        },
        // Some older data for month stats
        {
            id: 'INS-7600',
            action: 'OPRAVA',
            defects: [{ id: 1, status: 'Oprava', type: 'SCRATCH', label: 'ŠKRÁBANEC', box: { left: 50, top: 50, width: 10, height: 2 } }],
            timestamp: new Date(Date.now() - 86400000 * 2), // 2 days ago
            inspector: 'Václav P.',
            image: "/pending-2.png"
        },
        {
            id: 'INS-7590',
            action: 'APPROVE',
            defects: [],
            timestamp: new Date(Date.now() - 86400000 * 3.5),
            inspector: 'Václav P.',
            image: "/pending-1.jpg"
        },
        {
            id: 'INS-7580',
            action: 'LAKOVAT',
            defects: [{ id: 1, status: 'LAKOVAT', type: 'PAINT', label: 'VADA LAKU', box: { left: 30, top: 40, width: 8, height: 8 } }],
            timestamp: new Date(Date.now() - 86400000 * 4.8),
            inspector: 'Václav P.',
            image: "/pending-2.png"
        },
        {
            id: 'INS-7570',
            action: 'OPRAVA',
            defects: [{ id: 1, status: 'Oprava', type: 'DUST', label: 'NEČISTOTA', box: { left: 10, top: 10, width: 4, height: 4 } }],
            timestamp: new Date(Date.now() - 86400000 * 6),
            inspector: 'Václav P.',
            dimensions: { width: 800, height: 1970 },
            image: "/pending-1.jpg"
        }
    ]);
    const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
    const [currentInspection, setCurrentInspection] = useState(null);
    const [selectedDefect, setSelectedDefect] = useState(null);
    const [activeDefectId, setActiveDefectId] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Capture settings
    const [isAiEnabled, setIsAiEnabled] = useState(false);
    const [dimensions, setDimensions] = useState({ width: 800, height: 1970 });

    // Segmented capture state
    const [currentSegments, setCurrentSegments] = useState([null, null, null]);
    const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiSummary, setAiSummary] = useState(null);
    const [aiInstructions, setAiInstructions] = useState("Proveď inspekci povrchu. Detekuj jasně patrné vady: 'Nečistota' (vystouplé zrnko) nebo 'Krátký škrábanec' (prohlubeň). Ignoruj jemnou texturu pomerančové kůry. Zaměř se na anomálie, které jsou viditelné na první pohled. Vrať pozice vad ve formátu JSON jako pole objektů s vlastnostmi [box_2d: [ymin, xmin, ymax, xmax], label]. Souřadnice normalizuj na 0-1000.");

    // Camera state (Lifted from CaptureWizard)
    const [cameras, setCameras] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState('');

    useEffect(() => {
        getCameras();
    }, []);

    const getCameras = async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ video: true }); // Request permission first
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            setCameras(videoDevices);

            // Priority: Continuity Camera -> Back Camera -> First available
            const continuityCamera = videoDevices.find(d => d.label.toLowerCase().includes('continuity') || d.label.toLowerCase().includes('iphone'));
            const backCamera = videoDevices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment'));

            if (continuityCamera) {
                setSelectedDeviceId(continuityCamera.deviceId);
            } else if (backCamera) {
                setSelectedDeviceId(backCamera.deviceId);
            } else if (videoDevices.length > 0) {
                setSelectedDeviceId(videoDevices[0].deviceId);
            }
        } catch (err) {
            console.error("Error listing cameras:", err);
        }
    };

    // Sync selected item with newest history
    React.useEffect(() => {
        if (history.length > 0 && !selectedHistoryItem) {
            setSelectedHistoryItem(history[0]);
        }
    }, [history]);

    const handleCapture = (image) => {
        setCurrentInspection({
            id: `INS-${Math.floor(Math.random() * 10000)}`,
            image,
            timestamp: new Date(),
            defects: [],
            scanMode,
            dimensions,
            inspector: 'Václav P.'
        });
        setView('LAB');
    };

    const handleRunAI = async () => {
        if (!currentInspection || !currentInspection.image) return;
        setIsAiLoading(true);

        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error("API_KEY_MISSING");
            }
            const genAI = new GoogleGenerativeAI(apiKey);
            // Reverting to 2.0 as requested (User refers to it as 2.5)
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

            // Prepare image for Gemini (remove data:image/jpeg;base64, prefix)
            const base64Data = currentInspection.image.split(',')[1];

            const prompt = `
                Instrukce pro analýzu:
                ${aiInstructions}
                
                DŮLEŽITÉ: Vrať POUZE validní JSON. 
                Příklad: [{"box_2d": [ymin, xmin, ymax, xmax], "label": "label_text"}]
                Souřadnice musí být normalizovány (0-1000).
                Pokud nebudou nalezeny žádné vady, vrať [].
            `;

            const result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: "image/jpeg"
                    }
                }
            ]);

            const response = await result.response;
            const text = response.text();

            // Extract JSON from text (in case there's markdown or extra text)
            const jsonMatch = text.match(/\[.*\]/s);
            const detections = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

            const newAiDefects = detections.map((det, i) => {
                const [ymin, xmin, ymax, xmax] = det.box_2d;
                const width = (xmax - xmin) / 10; // Map to 0-100% for UI
                const height = (ymax - ymin) / 10;
                const left = xmin / 10;
                const top = ymin / 10;

                return {
                    id: 'ai-' + Date.now() + '-' + i,
                    type: det.label.toLowerCase().includes('scratch') ? 'SCRATCH' : 'POLLUTION',
                    label: det.label.toUpperCase(),
                    severity: 'medium',
                    status: 'Nedefinováno',
                    box: { left, top, width, height },
                    isManual: false,
                    isAiGenerated: true,
                    confidence: 90 // Default if not provided
                };
            });

            setCurrentInspection(prev => ({
                ...prev,
                defects: [...prev.defects, ...newAiDefects]
            }));

            setAiSummary({
                title: "DETEKCE DOKONČENA",
                recommendation: newAiDefects.length > 0
                    ? `Nalezeno ${newAiDefects.length} potenciálních vad. Doporučuji provést vizuální kontrolu označených míst.`
                    : "Analýza obrázku neprokázala žádné jasně patrné vady povrchu.",
                confidence: 94
            });

        } catch (error) {
            console.error("AI Error:", error);
            setAiSummary({
                title: "CHYBA ANALÝZY",
                recommendation: "Došlo k vyčerpání předplaceného kreditu nebo chybě připojení. Zkontrolujte prosím nastavení systému.",
                confidence: 0,
                isError: true
            });
        } finally {
            setIsAiLoading(false);
        }
    };

    return (
        <div className="h-full flex gap-6 overflow-hidden animate-in fade-in duration-700">
            {/* LARGE INTERACTIVE AREA (Left 2/3) */}
            <div className="flex-1 overflow-hidden relative">

                <AnimatePresence mode="wait">
                    {view === 'DASHBOARD' && (
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            className="h-full"
                        >
                            <QualityDashboard
                                onNewInspection={() => setView('CAPTURE')}
                                onSelectHistory={(item) => setSelectedHistoryItem(item)}
                                historyEntries={history}
                                selectedHistoryItem={selectedHistoryItem}
                            />
                        </motion.div>
                    )}

                    {view === 'CAPTURE' && (
                        <motion.div
                            key="capture"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            className="h-full"
                        >
                            <CaptureWizard
                                scanMode={scanMode}
                                dimensions={dimensions}
                                isAiEnabled={isAiEnabled}
                                selectedDeviceId={selectedDeviceId}
                                onCapture={handleCapture}
                                onCancel={() => {
                                    setView('DASHBOARD');
                                    setCurrentSegments([null, null, null]);
                                    setActiveSegmentIndex(0);
                                }}
                                onSegmentUpdate={(segs, idx) => {
                                    setCurrentSegments(segs);
                                    setActiveSegmentIndex(idx);
                                }}
                            />
                        </motion.div>
                    )}
                    {view === 'LAB' && (
                        <motion.div
                            key="lab"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full"
                        >
                            <QualityInspectionLab
                                inspection={currentInspection}
                                aiSummary={aiSummary}
                                aiInstructions={aiInstructions}
                                activeDefectId={activeDefectId}
                                onSelectDefect={(id) => setActiveDefectId(id)}
                                onAddDefect={(newDefect) => {
                                    const updatedDefects = [...currentInspection.defects, newDefect];
                                    const updatedInspection = {
                                        ...currentInspection,
                                        defects: updatedDefects
                                    };
                                    setCurrentInspection(updatedInspection);

                                    // Sync with history
                                    setHistory(prev => prev.map(item =>
                                        item.id === currentInspection.id ? updatedInspection : item
                                    ));

                                    // Sync with sidebar if this item is selected
                                    if (selectedHistoryItem?.id === currentInspection.id) {
                                        setSelectedHistoryItem(updatedInspection);
                                    }
                                }}
                                onShowDetail={(defect) => {
                                    setSelectedDefect(defect);
                                    setIsDetailModalOpen(true);
                                }}
                                onDeleteDefect={(defectId) => {
                                    const updatedDefects = currentInspection.defects.filter(d => d.id !== defectId);
                                    const updatedInspection = {
                                        ...currentInspection,
                                        defects: updatedDefects
                                    };
                                    setCurrentInspection(updatedInspection);

                                    // Sync with history
                                    setHistory(prev => prev.map(item =>
                                        item.id === currentInspection.id ? updatedInspection : item
                                    ));

                                    // Sync with sidebar if this item is selected
                                    if (selectedHistoryItem?.id === currentInspection.id) {
                                        setSelectedHistoryItem(updatedInspection);
                                    }
                                }}
                                onDefectAction={(defectId, action) => {
                                    if (currentInspection) {
                                        setCurrentInspection({
                                            ...currentInspection,
                                            defects: currentInspection.defects.map(d =>
                                                d.id === defectId ? { ...d, status: action } : d
                                            )
                                        });
                                    }

                                    // Also update in history if this matches a historical item
                                    setHistory(prev => prev.map(item => {
                                        if (item.id === (currentInspection?.id || selectedHistoryItem?.id)) {
                                            return {
                                                ...item,
                                                defects: item.defects.map(d =>
                                                    d.id === defectId ? { ...d, status: action } : d
                                                )
                                            };
                                        }
                                        return item;
                                    }));
                                }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                <DefectDetailModal
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    defect={selectedDefect}
                    image={currentInspection?.image || selectedHistoryItem?.image}
                    onSave={(updatedDefect, shouldClose = true) => {
                        const targetId = currentInspection?.id || selectedHistoryItem?.id;

                        // Update current inspection (if in Lab)
                        if (currentInspection) {
                            setCurrentInspection({
                                ...currentInspection,
                                defects: currentInspection.defects.map(d =>
                                    d.id === updatedDefect.id ? { ...d, ...updatedDefect } : d
                                )
                            });
                        }

                        // Update history record
                        setHistory(prev => prev.map(item => {
                            if (item.id === targetId) {
                                return {
                                    ...item,
                                    defects: item.defects.map(d =>
                                        d.id === updatedDefect.id ? { ...d, ...updatedDefect } : d
                                    )
                                };
                            }
                            return item;
                        }));

                        // If not closing, we must update the selected defect reference
                        if (!shouldClose) {
                            setSelectedDefect(updatedDefect);
                        } else {
                            setIsDetailModalOpen(false);
                            setSelectedDefect(null);
                        }
                    }}
                />

                {/* Floating Action Button (Only on Dashboard) */}
                <AnimatePresence>
                    {view === 'DASHBOARD' && (
                        <motion.button
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            onClick={() => {
                                // Auto-Draft: Save current work if it exists
                                if (currentInspection && (currentInspection.image || currentInspection.defects.length > 0)) {
                                    setHistory(prev => {
                                        const exists = prev.some(item => item.id === currentInspection.id);
                                        if (exists) return prev; // Already in history (from Lab return)
                                        return [{ ...currentInspection, action: 'ROZPRACOVÁNO' }, ...prev];
                                    });
                                }
                                setView('CAPTURE');
                            }}
                            className="absolute bottom-6 right-6 px-6 py-4 bg-blue-600 text-white rounded-full shadow-[0_8px_30px_rgb(37,99,235,0.4)] flex items-center justify-center gap-3 border-4 border-white/20 transition-transform hover:scale-105 active:scale-95 z-50 group hover:pr-8"
                        >
                            <Plus size={24} strokeWidth={3} />
                            <span className="text-[12px] font-black uppercase tracking-widest whitespace-nowrap">
                                Nová kontrola
                            </span>
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* SIDE CONFIGURATION PANEL (Right 1/3) - The "Configurator" logic */}
            <aside className={`w-full md:w-[420px] shrink-0 flex flex-col gap-4 overflow-hidden ${glassMain} p-6`}>
                {view === 'LAB' ? (
                    <QualityInspectorPanel
                        inspection={currentInspection}
                        isAiLoading={isAiLoading}
                        aiSummary={aiSummary}
                        onRunAI={handleRunAI}
                        onShowDetail={(defect) => {
                            setSelectedDefect(defect);
                            setIsDetailModalOpen(true);
                        }}
                        onVerdict={(type) => {
                            // Save to history and return to dashboard
                            if (currentInspection) {
                                let action = type;
                                // Map old types for safety if they come from anywhere
                                if (action === 'REPAINT') action = 'LAKOVAT';
                                if (action === 'REPAIR') action = 'OPRAVA';
                                if (action === 'DRAFT') action = 'ROZPRACOVÁNO';

                                const finalInspection = { ...currentInspection, action };
                                setHistory(prev => {
                                    const existingIndex = prev.findIndex(item => item.id === currentInspection.id);
                                    if (existingIndex > -1) {
                                        const newHistory = [...prev];
                                        newHistory[existingIndex] = finalInspection;
                                        return newHistory;
                                    }
                                    return [finalInspection, ...prev];
                                });
                                setSelectedHistoryItem(finalInspection);
                            }
                            setView('DASHBOARD');
                            setCurrentInspection(null);
                        }}
                        onDeleteDefect={(defectId) => {
                            setCurrentInspection({
                                ...currentInspection,
                                defects: currentInspection.defects.filter(d => d.id !== defectId)
                            });
                        }}
                        onDefectAction={(defectId, action) => {
                            setCurrentInspection({
                                ...currentInspection,
                                defects: currentInspection.defects.map(d =>
                                    d.id === defectId ? { ...d, status: action } : d
                                )
                            });
                        }}
                    />
                ) : view === 'CAPTURE' ? (
                    <>
                        <div className="flex items-center gap-3 mb-4">
                            <Settings size={18} className="text-slate-400" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 font-black">Nastavení kontroly</h3>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar px-1 -mx-1 space-y-6">
                            {/* Advice Box - Moved to top */}
                            <div className="flex flex-col gap-3 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                                <div className="flex items-center gap-2">
                                    <Info size={12} className="text-blue-500" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-600">Doporučení pro skenování</span>
                                </div>
                                <p className="text-[9px] text-blue-700/70 dark:text-blue-400/70 font-bold leading-relaxed">
                                    Snímkování provádějte v klidném tempu. Pro maximální přesnost AI detekce zajistěte rovnoměrné nasvětlení plochy.
                                </p>
                            </div>

                            {/* Method Selection */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 italic">
                                    <Layout size={12} /> Metoda Skenování
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { id: 'SINGLE', label: 'Single', desc: 'Portrét' },
                                        { id: '3SEGMENTS', label: '3-Seg', desc: 'Landscape' }
                                    ].map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setScanMode(opt.id)}
                                            className={`p-3 rounded-2xl border text-left transition-all ${scanMode === opt.id
                                                ? 'bg-white dark:bg-slate-900 border-blue-500/50 text-blue-600 shadow-xl ring-1 ring-blue-400/30'
                                                : 'bg-white/50 border-slate-100 dark:bg-slate-800/50 dark:border-slate-800 text-slate-400 hover:bg-white'}`}
                                        >
                                            <div className="font-black text-[10px] uppercase tracking-tight">{opt.label}</div>
                                            <div className={`text-[8px] font-bold uppercase tracking-widest mt-1 opacity-60 ${scanMode === opt.id ? 'text-blue-500' : 'text-slate-400'}`}>{opt.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Dimensions - Configurator Style */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 italic">
                                    <Target size={12} /> Rozměry křídla
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white dark:bg-slate-900 p-4 h-24 rounded-[32px] flex flex-col justify-center relative shadow-sm border border-slate-200/50 dark:border-slate-700/50 group">
                                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] absolute top-4 left-6">Šířka (mm)</div>
                                        <div className="flex items-center justify-between mt-3 px-2">
                                            <input
                                                type="number"
                                                value={dimensions.width}
                                                onChange={(e) => setDimensions({ ...dimensions, width: e.target.value })}
                                                className="w-full bg-transparent border-none outline-none font-black text-3xl text-slate-900 dark:text-white"
                                            />
                                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ChevronUp className="text-slate-300" size={16} />
                                                <ChevronDown className="text-slate-300" size={16} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 p-4 h-24 rounded-[32px] flex flex-col justify-center relative shadow-sm border border-slate-200/50 dark:border-slate-700/50 group">
                                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] absolute top-4 left-6">Výška (mm)</div>
                                        <div className="flex items-center justify-between mt-3 px-2">
                                            <input
                                                type="number"
                                                value={dimensions.height}
                                                onChange={(e) => setDimensions({ ...dimensions, height: e.target.value })}
                                                className="w-full bg-transparent border-none outline-none font-black text-3xl text-slate-900 dark:text-white"
                                            />
                                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ChevronUp className="text-slate-300" size={16} />
                                                <ChevronDown className="text-slate-300" size={16} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* AI Toggle */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 italic">
                                    <Microscope size={12} /> AI Analýza povrchu
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { id: false, label: 'NE' },
                                        { id: true, label: 'ANO' }
                                    ].map(opt => (
                                        <button
                                            key={String(opt.id)}
                                            onClick={() => setIsAiEnabled(opt.id)}
                                            className={`py-3 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2 ${isAiEnabled === opt.id
                                                ? 'bg-white dark:bg-slate-800 border-blue-500 text-blue-600 shadow-md scale-[1.02]'
                                                : 'bg-transparent border-transparent text-slate-400 hover:text-slate-500'}`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Camera Selector */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 italic">
                                    <Camera size={12} /> Výběr snímače
                                </label>
                                <div className="grid grid-cols-1 gap-2">
                                    {cameras.length > 0 ? (
                                        cameras.map(device => {
                                            const isActive = selectedDeviceId === device.deviceId;
                                            return (
                                                <button
                                                    key={device.deviceId}
                                                    onClick={() => setSelectedDeviceId(device.deviceId)}
                                                    className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${isActive
                                                        ? 'bg-white dark:bg-slate-700 border-blue-500 text-blue-600 shadow-lg scale-[1.02]'
                                                        : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400 hover:border-slate-200'}`}
                                                >
                                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isActive ? 'bg-blue-50 dark:bg-blue-900/40' : 'bg-white dark:bg-slate-900 shadow-sm'}`}>
                                                        <Video size={14} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-[10px] font-black uppercase tracking-widest truncate max-w-[180px]">
                                                            {device.label || `Kamera ${cameras.indexOf(device) + 1}`}
                                                        </p>
                                                        <p className="text-[8px] font-bold opacity-60 uppercase tracking-tight">Připraveno</p>
                                                    </div>
                                                </button>
                                            );
                                        })
                                    ) : (
                                        <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hledám kamery...</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* AI Instructions Editor */}
                            <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 italic">
                                    <Sparkles size={12} className="text-blue-500" /> Pokyny pro vyhodnocení AI
                                </label>
                                <textarea
                                    value={aiInstructions}
                                    onChange={(e) => setAiInstructions(e.target.value)}
                                    placeholder="Napište instrukce pro upřesnění analýzy..."
                                    className="w-full h-24 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-3 py-3 text-[11px] font-medium text-slate-600 dark:text-slate-300 placeholder:text-slate-300 resize-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                            <div className="flex flex-col">
                                <span className="text-[7px] font-black text-slate-400/50 uppercase tracking-[0.2em]">SMART FACTORY QC ENGINE V3.0</span>
                                <span className="text-[7px] font-bold text-slate-400/30 uppercase tracking-tighter italic">VŠECHNY PARAMETRY JSOU MONITOROVÁNY V REÁLNÉM ČASE.</span>
                            </div>
                        </div>
                    </>
                ) : !selectedHistoryItem ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-40">
                        <Target size={32} className="text-slate-200 mb-4" strokeWidth={1} />
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Vyberte záznam pro detail</p>
                    </div>
                ) : (
                    <InspectionDetailSidebar
                        inspection={selectedHistoryItem}
                        activeDefectId={activeDefectId}
                        onDefectClick={(d) => {
                            setActiveDefectId(d.id);
                            setSelectedDefect(d);
                            setIsDetailModalOpen(true);
                        }}
                        onReturnToLab={() => {
                            if (selectedHistoryItem) {
                                setCurrentInspection(selectedHistoryItem);
                                setView('LAB');
                            }
                        }}
                    />
                )}
            </aside>
        </div>
    );
}
