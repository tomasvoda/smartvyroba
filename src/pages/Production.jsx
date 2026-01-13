import React, { useState } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import {
  Plus, Search, SlidersHorizontal, LayoutGrid, List, Sparkles,
  Trash2, BrainCircuit, Rocket, ChevronRight, Wand2
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { applyAutoPlaning } from '../utils/aiPlanningService';

const STAGES = ['Zásobník', 'Příprava', 'Truhlárna', 'Lakovna', 'Expedice'];

const Production = ({ items, setItems, settings }) => {
  const [activeStageMobile, setActiveStageMobile] = useState('Zásobník');
  const [viewModeMobile, setViewModeMobile] = useState('compact');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isAiEnabled, setIsAiEnabled] = useState(true);
  const [visibleStages, setVisibleStages] = useState(['Zásobník', 'Příprava', 'Truhlárna', 'Lakovna']);
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false);

  const filteredItems = items.filter(item =>
    item.projectId.includes(searchTerm) ||
    item.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleStage = (stage) => {
    setVisibleStages(prev =>
      prev.includes(stage)
        ? prev.filter(s => s !== stage)
        : [...prev, stage].sort((a, b) => STAGES.indexOf(a) - STAGES.indexOf(b))
    );
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceStage = source.droppableId;
    const destStage = destination.droppableId;

    const itemsInSource = filteredItems.filter(i => i.stage === sourceStage);
    const itemsInDest = filteredItems.filter(i => i.stage === destStage);

    const [removed] = itemsInSource.splice(source.index, 1);
    removed.stage = destStage;
    removed.aiReason = null; // Clear AI reasoning on manual move

    const newItems = [...items];

    if (sourceStage === destStage) {
      itemsInSource.splice(destination.index, 0, removed);
    } else {
      itemsInDest.splice(destination.index, 0, removed);
    }

    setItems([...newItems]);
  };

  const handleGlobalAiPlan = () => {
    const planned = applyAutoPlaning(items, settings);
    setItems(planned);
  };

  const handleStageAiPlan = (stage) => {
    const planned = applyAutoPlaning(items, settings, stage);
    setItems(planned);
  };

  const clearAiReasoning = () => {
    setItems(prev => prev.map(i => ({ ...i, aiReason: null })));
  };

  return (
    <div className="h-full flex flex-col space-y-3 md:space-y-4 pt-1">

      {/* TOOLBAR FOR AI & ACTIONS */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md p-2 rounded-2xl border border-white dark:border-slate-700/50 relative z-50">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleGlobalAiPlan}
            className="flex items-center gap-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 rounded-xl text-xs font-bold border border-slate-900 dark:border-slate-100 hover:bg-white hover:text-black dark:hover:bg-slate-800 dark:hover:text-white transition-all active:scale-95 no-wrap-fix"
          >
            <BrainCircuit size={16} strokeWidth={2} /> <span className="hidden sm:inline">Smart AI Plánování</span>
          </button>
          <button
            onClick={clearAiReasoning}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all no-wrap-fix"
          >
            <Trash2 size={14} /> <span className="hidden sm:inline">Vyčistit AI</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-100 dark:border-slate-800 flex-1 md:flex-none justify-end">
          {/* SEARCH INTEGRATED */}
          <div className="relative mr-1.5 flex-1 min-w-[120px] max-w-[200px] hidden sm:block">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
            <input
              type="text"
              placeholder="Hledat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg text-[11px] font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all dark:text-white"
            />
          </div>

          <button
            onClick={() => setIsAiEnabled(!isAiEnabled)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isAiEnabled ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/30' : 'text-slate-400'}`}
          >
            AI {isAiEnabled ? 'ZAP' : 'VYP'}
          </button>
          <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1"></div>

          <div className="relative">
            <button
              onClick={() => setIsColumnSelectorOpen(!isColumnSelectorOpen)}
              className={`p-1.5 rounded-lg transition-all ${isColumnSelectorOpen ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              title="Výběr sloupců"
            >
              <SlidersHorizontal size={18} />
            </button>

            {isColumnSelectorOpen && (
              <>
                <div className="fixed inset-0 z-[60]" onClick={() => setIsColumnSelectorOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl z-[70] p-2 animate-in fade-in zoom-in-95 duration-200">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-1 mb-1">Zobrazit sloupce</p>
                  {STAGES.map(stage => (
                    <button
                      key={stage}
                      onClick={() => toggleStage(stage)}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors group"
                    >
                      <span className={`text-xs font-bold ${visibleStages.includes(stage) ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{stage}</span>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${visibleStages.includes(stage) ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                        {visibleStages.includes(stage) && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1"></div>
          <button onClick={() => setViewModeMobile('compact')} className={`p-1.5 rounded-lg ${viewModeMobile === 'compact' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'text-slate-400'}`}><LayoutGrid size={18} /></button>
          <button onClick={() => setViewModeMobile('full')} className={`p-1.5 rounded-lg ${viewModeMobile === 'full' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'text-slate-400'}`}><List size={18} /></button>
        </div>
      </div>

      {/* MOBILE STAGE TABS */}
      <div className="md:hidden flex gap-1 overflow-x-auto pb-2 custom-scrollbar">
        {STAGES.map(stage => (
          <button
            key={stage}
            onClick={() => setActiveStageMobile(stage)}
            className={`
              shrink-0 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all
              ${activeStageMobile === stage
                ? 'bg-slate-800 dark:bg-blue-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-700'}
            `}
          >
            {stage}
          </button>
        ))}
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 flex gap-3 min-h-0 overflow-x-auto overflow-y-hidden custom-scrollbar pb-6 px-1">
          {STAGES.filter(s => visibleStages.includes(s)).map(stage => (
            <div
              key={stage}
              className={`
                flex flex-col min-w-[280px] flex-1 h-full
                ${activeStageMobile !== stage ? 'hidden md:flex' : 'flex'}
              `}
            >
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tighter text-sm">{stage}</h3>
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full text-[10px] font-bold border border-slate-200 dark:border-slate-700">
                    {filteredItems.filter(i => i.stage === stage).length}
                  </span>
                </div>
                <button
                  onClick={() => handleStageAiPlan(stage)}
                  title="Optimalizovat tuto sekci pomocí AI"
                  className="p-1.5 text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors border border-transparent hover:border-purple-100 dark:hover:border-purple-800/50"
                >
                  <Wand2 size={16} strokeWidth={2.5} />
                </button>
              </div>

              <Droppable droppableId={stage}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`
                      flex-1 overflow-y-auto custom-scrollbar p-2 rounded-3xl transition-colors
                      ${snapshot.isDraggingOver ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'bg-slate-50/50 dark:bg-slate-900/20'}
                    `}
                  >
                    {filteredItems
                      .filter(item => item.stage === stage)
                      .map((item, index) => (
                        <div key={item.projectId} className={viewModeMobile === 'compact' ? 'scale-95 origin-top mb-[-10px]' : 'mb-1'}>
                          <GlassCard
                            item={item}
                            index={index}
                            showAiReason={isAiEnabled}
                            viewMode={viewModeMobile}
                          />
                        </div>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default Production;