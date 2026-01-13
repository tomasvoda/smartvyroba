import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    History, AlertTriangle, CheckCircle, Clock, ChevronRight,
    ArrowRight, Microscope, Target, Sparkles, Filter, Calendar, ListFilter, RotateCcw
} from 'lucide-react';

const glassSub = "rounded-[24px] border border-white/50 dark:border-slate-800/40 backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 shadow-sm";
const glassChip = "rounded-xl border border-white/80 dark:border-slate-800/70 backdrop-blur bg-white/85 dark:bg-slate-900/80 shadow-sm";

// SVG Sparkline for mini-graphs
// Status Heat Map Bar
const StatusHeatMap = ({ stats }) => {
    const total = stats.total || 1;
    const segments = [
        { label: 'O.K.', value: stats.ok, color: 'bg-emerald-500' },
        { label: 'Oprava', value: stats.repair, color: 'bg-amber-400' },
        { label: 'Konzultace', value: stats.consult, color: 'bg-orange-500' },
        { label: 'Lakovat', value: stats.repaint, color: 'bg-red-600' },
        { label: 'Rozpracováno', value: stats.draft, color: 'bg-slate-300 dark:bg-slate-700' },
    ];

    return (
        <div className="flex flex-col gap-2">
            <div className="w-full h-2.5 flex rounded-full overflow-hidden bg-slate-100 dark:bg-white/5 border border-white/20 dark:border-white/5">
                {segments.map((seg, i) => (
                    seg.value > 0 && (
                        <div
                            key={i}
                            className={`${seg.color} h-full transition-all duration-700 ease-out border-r border-white/10 last:border-0`}
                            style={{ width: `${(seg.value / total) * 100}%` }}
                        />
                    )
                ))}
            </div>
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                {segments.map((seg, i) => (
                    seg.value > 0 && (
                        <div key={i} className="flex items-center gap-1.5 shrink-0">
                            <div className={`w-1.5 h-1.5 rounded-full ${seg.color}`} />
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">{seg.label}</span>
                        </div>
                    )
                ))}
            </div>
        </div>
    );
};

// Standardized Badge for Results
const ResultBadge = ({ action }) => {
    const styles = {
        'APPROVE': "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/40",
        'OPRAVA': "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/30 dark:border-orange-900/40",
        'LAKOVAT': "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/30 dark:border-rose-900/40",
        'CONSULT': "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-950/30 dark:border-orange-900/40",
        'ROZPRACOVÁNO': "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700"
    };
    const labels = {
        'APPROVE': 'O.K.',
        'OPRAVA': 'Oprava',
        'LAKOVAT': 'LAKOVAT',
        'CONSULT': 'Konzultace',
        'ROZPRACOVÁNO': 'ROZPRACOVÁNO'
    };

    return (
        <div className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${styles[action] || styles.APPROVE}`}>
            {labels[action] || action}
        </div>
    );
};

export default function QualityDashboard({ onNewInspection, onSelectHistory, historyEntries = [], selectedHistoryItem }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [inspectorFilter, setInspectorFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const inspectors = useMemo(() => {
        const unique = [...new Set(historyEntries.map(i => i.inspector))].filter(Boolean);
        return unique.sort();
    }, [historyEntries]);

    const statuses = [
        { id: 'APPROVE', label: 'O.K.' },
        { id: 'OPRAVA', label: 'Oprava' },
        { id: 'LAKOVAT', label: 'Lakovat' },
        { id: 'CONSULT', label: 'Konzultace' },
        { id: 'ROZPRACOVÁNO', label: 'Rozpracováno' }
    ];

    const filteredHistory = useMemo(() => {
        return historyEntries.filter(item => {
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch =
                item.id.toLowerCase().includes(searchLower) ||
                (item.inspector && item.inspector.toLowerCase().includes(searchLower)) ||
                (item.action && item.action.toLowerCase().includes(searchLower));

            const matchesInspector = inspectorFilter === 'ALL' || item.inspector === inspectorFilter;
            const matchesStatus = statusFilter === 'ALL' || item.action === statusFilter;

            return matchesSearch && matchesInspector && matchesStatus;
        });
    }, [historyEntries, searchQuery, inspectorFilter, statusFilter]);

    const displayHistory = filteredHistory;

    const getStats = (items) => {
        const total = items.length;
        const defects = items.reduce((acc, item) => acc + (item.defects?.length || 0), 0);
        const ok = items.filter(i => i.action === 'APPROVE').length;
        const repair = items.filter(i => i.action === 'OPRAVA' || i.action === 'REPAIR').length;
        const repaint = items.filter(i => i.action === 'LAKOVAT' || i.action === 'REPAINT').length;
        const consult = items.filter(i => i.action === 'CONSULT').length;
        const draft = items.filter(i => i.action === 'ROZPRACOVÁNO' || !i.action).length;
        const successRate = total > 0 ? Math.round((ok / total) * 100) : 100;

        return { total, defects, ok, repair, repaint, consult, draft, successRate };
    };

    const today = new Date().setHours(0, 0, 0, 0);
    const todayItems = historyEntries.filter(i => new Date(i.timestamp).setHours(0, 0, 0, 0) === today);
    const monthItems = historyEntries.filter(i => {
        const d = new Date(i.timestamp);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const statsToday = getStats(todayItems);
    const statsMonth = getStats(monthItems);

    // Last 100 mock stats
    const stats100 = {
        total: 100, defects: 142, ok: 94, repair: 4, repaint: 2, consult: 0, draft: 0, successRate: 94
    };

    const StatCard = ({ title, stats, icon: Icon, color }) => (
        <div className={`flex-1 p-5 ${glassSub} border-white/80 shadow-[0_15px_45px_rgba(0,0,0,0.04)] group relative overflow-hidden transition-all hover:scale-[1.01] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)]`}>
            {/* Background Icon Accent */}
            <div className="absolute -right-4 -bottom-4 opacity-[0.05] group-hover:opacity-[0.1] transition-all duration-700 group-hover:scale-110 rotate-12">
                <Icon size={120} className={color.replace('bg-', 'text-')} />
            </div>

            <div className="relative z-10 flex flex-col gap-4">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 italic flex items-center gap-2">
                    {title}
                </span>

                <div className="flex items-center gap-3">
                    <div className={`flex-1 p-3 rounded-2xl ${glassChip} border-white/60 shadow-sm flex flex-col items-center justify-center min-w-[80px]`}>
                        <p className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter leading-none">{stats.total}</p>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1.5">Kontrol</p>
                    </div>
                    <div className={`flex-1 p-3 rounded-2xl ${glassChip} border-white/60 shadow-sm flex flex-col items-center justify-center min-w-[80px]`}>
                        <p className="text-3xl font-black text-slate-800 dark:text-white/80 tracking-tighter leading-none">{stats.defects}</p>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1.5">Vad</p>
                    </div>
                </div>
            </div>

            {/* Heat Map Section */}
            <div className="my-4 relative z-10">
                <StatusHeatMap stats={stats} />
            </div>

            <div className="grid grid-cols-4 gap-4 pt-4 border-t border-slate-100/80 dark:border-white/5 relative z-10">
                <div className="space-y-1">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">O.K.</p>
                    <p className="text-lg font-black text-emerald-500 leading-none">{stats.ok}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Oprava</p>
                    <p className="text-lg font-black text-amber-500 leading-none">{stats.repair}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest font-black">Lakovat</p>
                    <p className="text-lg font-black text-red-600 leading-none">{stats.repaint}</p>
                </div>
                <div className="space-y-1 text-right border-l border-slate-100 dark:border-white/5 pl-4">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Kvalita</p>
                    <p className="text-lg font-black text-slate-800 dark:text-white leading-none">{stats.successRate}%</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col gap-8">
            {/* Stats Dashboard */}
            <div className="flex flex-col xl:flex-row gap-5">
                <StatCard title="Dnes" stats={statsToday} icon={Clock} color="bg-blue-500" sparkColor="#3b82f6" />
                <StatCard title="Měsíc" stats={statsMonth} icon={Calendar} color="bg-purple-500" sparkColor="#a855f7" />
                <StatCard title="Celkem (100)" stats={stats100} icon={Target} color="bg-emerald-500" sparkColor="#10b981" />
            </div>

            {/* History Section */}
            <div className="flex-1 flex flex-col gap-4 min-h-0">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2">
                    <div className="flex items-center gap-2">
                        <History size={16} className="text-slate-400" />
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Historie záznamů</h2>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto ml-auto">
                        <div className="relative flex-1 md:w-64 group">
                            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={12} />
                            <input
                                type="text"
                                placeholder="Hledat..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 rounded-xl text-[11px] font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all placeholder:text-slate-400 placeholder:italic"
                            />
                        </div>
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`p-2 rounded-xl border transition-all ${isFilterOpen
                                ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]'
                                : 'bg-white/40 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 text-slate-400 hover:text-blue-500'}`}
                        >
                            <ListFilter size={14} className={isFilterOpen ? 'scale-110' : ''} />
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {isFilterOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0, marginTop: -16 }}
                            animate={{ height: 'auto', opacity: 1, marginTop: 0 }}
                            exit={{ height: 0, opacity: 0, marginTop: -16 }}
                            className="overflow-hidden px-2 mb-2"
                        >
                            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-end gap-3 font-sans">
                                <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
                                    <label className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Kontrolor</label>
                                    <select
                                        value={inspectorFilter}
                                        onChange={(e) => setInspectorFilter(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-[10px] font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 tracking-wide"
                                    >
                                        <option value="ALL">Všichni Kontroloři</option>
                                        {inspectors.map(name => (
                                            <option key={name} value={name}>{name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
                                    <label className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Status</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-[10px] font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 tracking-wide"
                                    >
                                        <option value="ALL">Všechny Statusy</option>
                                        {statuses.map(s => (
                                            <option key={s.id} value={s.id}>{s.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    onClick={() => {
                                        setInspectorFilter('ALL');
                                        setStatusFilter('ALL');
                                        setSearchQuery('');
                                    }}
                                    className="h-[46px] px-6 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-100 dark:border-blue-800 font-black text-[10px] uppercase tracking-widest hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all flex items-center justify-center gap-2"
                                >
                                    <RotateCcw size={12} /> Resetovat filtry
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex-1 overflow-y-auto px-2 custom-scrollbar space-y-3">
                    {displayHistory.map((item) => {
                        const defectsCount = item.defects?.length || 0;
                        const isSelected = selectedHistoryItem && selectedHistoryItem.id === item.id;

                        return (
                            <div
                                key={item.id}
                                onClick={() => onSelectHistory && onSelectHistory(item)}
                                className={`group p-3 flex items-center gap-4 cursor-pointer transition-all border-2 ${isSelected
                                    ? 'bg-blue-50/20 dark:bg-blue-900/10 border-blue-500 shadow-lg rounded-[20px] z-10'
                                    : (item.action === 'APPROVE'
                                        ? 'bg-gradient-to-r from-emerald-500/10 via-white/5 via-20% to-white/30 dark:from-emerald-500/10 dark:to-slate-900/30 border-slate-100/40 dark:border-slate-800/30'
                                        : (item.action === 'OPRAVA' || item.action === 'REPAIR')
                                            ? 'bg-gradient-to-r from-amber-500/10 via-white/5 via-20% to-white/30 dark:from-amber-500/10 dark:to-slate-900/30 border-slate-100/40 dark:border-slate-800/30'
                                            : (item.action === 'LAKOVAT' || item.action === 'REPAINT')
                                                ? 'bg-gradient-to-r from-red-500/10 via-white/5 via-20% to-white/30 dark:from-red-500/10 dark:to-slate-900/30 border-slate-100/40 dark:border-slate-800/30'
                                                : 'bg-white/30 dark:bg-slate-900/30 border-slate-100/40 dark:border-slate-800/30')
                                    } backdrop-blur-xl rounded-[20px] hover:border-blue-400/20`}
                            >
                                {/* Thumbnail */}
                                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200/50 dark:border-slate-700/50">
                                    {item.image ? (
                                        <img src={item.image} className="w-full h-full object-cover" alt="Scan" />
                                    ) : (
                                        <Microscope size={24} className="text-slate-300" />
                                    )}
                                </div>

                                <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 items-center gap-4 min-w-0">
                                    <div className="space-y-0.5 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">#{item.id.split('-')[1]}</span>
                                            <ResultBadge action={item.action} />
                                        </div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic truncate">{item.inspector}</p>
                                    </div>

                                    <div className="space-y-0.5 min-w-0">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest opacity-60">Nálezy</p>
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <AlertTriangle size={10} className={defectsCount > 0 ? 'text-orange-500' : 'text-slate-300'} />
                                            <span className={`text-[10px] font-black truncate ${defectsCount > 0 ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400'}`}>
                                                {defectsCount} {defectsCount === 1 ? 'vada' : defectsCount >= 2 && defectsCount <= 4 ? 'vady' : 'vad'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-0.5 min-w-0 hidden lg:block">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest opacity-60">Rozměry</p>
                                        <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 truncate">
                                            {item.dimensions ? `${item.dimensions.width}×${item.dimensions.height}` : '---'}
                                        </span>
                                    </div>

                                    <div className="space-y-0.5 min-w-0 hidden sm:block">
                                        <div className="flex flex-col text-right">
                                            <span className="text-[9px] font-black text-slate-700 dark:text-slate-300 truncate">{new Date(item.timestamp).toLocaleDateString('cs-CZ')}</span>
                                            <span className="text-[8px] font-bold text-slate-400 truncate">{new Date(item.timestamp).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
