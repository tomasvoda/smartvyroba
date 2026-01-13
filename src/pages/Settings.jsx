import React from 'react';
import {
    Settings, Bot, Layout, Sliders, Save,
    Menu as MenuIcon, Eye, EyeOff, Sparkles, BrainCircuit
} from 'lucide-react';

const SettingsPage = ({ settings, setSettings }) => {
    const handleToggleNav = () => {
        setSettings(prev => ({ ...prev, showBottomNav: !prev.showBottomNav }));
    };

    const handleAiModeChange = (mode) => {
        setSettings(prev => ({ ...prev, aiMode: mode }));
    };

    const handlePriorityChange = (key, val) => {
        setSettings(prev => ({
            ...prev,
            aiPriorities: {
                ...prev.aiPriorities,
                [key]: parseInt(val)
            }
        }));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 transition-colors">

            {/* HEADER REMOVED */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* UI NASTAVENÍ */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Layout className="text-blue-500" size={20} />
                        <h3 className="font-bold text-slate-700 dark:text-slate-200">Uživatelské rozhraní</h3>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700 transition-colors">
                        <div className="flex items-center gap-3">
                            <MenuIcon size={18} className="text-slate-400" />
                            <div>
                                <p className="font-bold text-sm text-slate-700 dark:text-slate-200">Spodní navigace</p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Pro mobilní zařízení</p>
                            </div>
                        </div>
                        <button
                            onClick={handleToggleNav}
                            className={`w-12 h-6 rounded-full relative transition-colors ${settings.showBottomNav ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.showBottomNav ? 'right-1' : 'left-1'}`} />
                        </button>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/50 flex gap-4">
                        <Eye className="text-blue-500 shrink-0" size={20} />
                        <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                            Spodní navigace usnadňuje ovládání aplikace jednou rukou na mobilních telefonech. Doporučujeme nechat zapnuté.
                        </p>
                    </div>
                </div>

                {/* AI REŽIMY */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <BrainCircuit className="text-purple-500" size={20} />
                        <h3 className="font-bold text-slate-700 dark:text-slate-200">Režim AI plánování</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {[
                            { id: 'pure', label: 'Čistě AI', desc: 'Plánování pouze na základě vyhodnocení algoritmu.', icon: Bot, color: 'text-blue-500' },
                            { id: 'combined', label: 'Kombinovaný', desc: 'AI bere v úvahu algoritmus i priority ředitele.', icon: Sparkles, color: 'text-purple-500' },
                            { id: 'manual', label: 'Ruční / Mistr', desc: 'AI pouze navrhuje, rozhodující slovo má mistr.', icon: Sliders, color: 'text-amber-500' },
                        ].map(m => (
                            <button
                                key={m.id}
                                onClick={() => handleAiModeChange(m.id)}
                                className={`flex items-start gap-4 p-4 rounded-2xl border transition-all text-left ${settings.aiMode === m.id ? 'bg-white dark:bg-slate-700 border-blue-600 shadow-md ring-1 ring-blue-600/10' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-700 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'}`}
                            >
                                <div className={`p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm ${m.color}`}><m.icon size={18} /></div>
                                <div>
                                    <p className="font-bold text-sm text-slate-800 dark:text-white leading-none mb-1">{m.label}</p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{m.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* AI PRIORITIES (FULL WIDTH) */}
                <div className="md:col-span-2 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-8">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
                        <div className="flex items-center gap-3">
                            <Sliders className="text-emerald-500" size={20} />
                            <h3 className="font-bold text-slate-700 dark:text-slate-200">Váhy priorit výrobního ředitele</h3>
                        </div>
                        <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800/50">Aktivní režim: {settings.aiMode}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 px-2">
                        {[
                            { key: 'vipWeight', label: 'Váha VIP klientů', desc: 'Důležitost zakázek pro strategicé partnery.' },
                            { key: 'deadlineWeight', label: 'Váha termínu', desc: 'Jak moc má AI hlídat blížící se datum dodání.' },
                            { key: 'overdueWeight', label: 'Váha zpoždění', desc: 'Priorita zakázek, které již měly být hotové.' },
                            { key: 'complexityWeight', label: 'Váha náročnosti', desc: 'Upřednostnění jednodušších zakázek (flow).' },
                        ].map(p => (
                            <div key={p.key} className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="font-bold text-slate-700 dark:text-slate-200 text-sm leading-none">{p.label}</p>
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-1 uppercase tracking-tight">{p.desc}</p>
                                    </div>
                                    <span className="font-mono font-black text-blue-600 dark:text-blue-400 text-lg">{settings.aiPriorities[p.key]}%</span>
                                </div>
                                <div className="relative pt-1">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={settings.aiPriorities[p.key]}
                                        onChange={(e) => handlePriorityChange(p.key, e.target.value)}
                                        className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                    <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-1">
                                        <span>Nízká</span>
                                        <span>Střední</span>
                                        <span>Vysoká</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button className="flex items-center gap-2 bg-slate-800 dark:bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:shadow-lg transition-all active:scale-95 shadow-lg shadow-slate-900/20">
                            <Save size={18} /> Uložit konfiguraci
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SettingsPage;
