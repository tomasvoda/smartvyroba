import React from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import GlassCard from '../components/GlassCard'; 
import DetailedDoorCard from '../components/DetailedDoorCard';
import CompactDoorCard from '../components/CompactDoorCard';

// MOCK DATA
const glassCardData = {
  projectId: '25E999',
  project: '25E999',
  client: 'Grand Hotel Pupp',
  stage: 'Truhlárna', 
  deadline: '19.11.',
  isVip: true,
  isOverdue: true,
  dates: { ordered: '2025-08-15' },
  items: [
    { id: 'd1', dim: '1100x2400', finishCode: 'RAL 9003', isAtyp: true, trait: null, type: 'DURUS', thickness: '42' },
    { id: 'd2', dim: '900x1970', finishA: 'Dýha Dub', finishB: 'RAL 9003', isAtyp: false, trait: 'EI', type: 'FORTIUS', thickness: '40' },
  ]
};

const detailedDoorData = {
   id: 'd1', type: 'DURUS', thickness: '42', dim: '1100x2400', opening: 'L',
   finishA: 'RAL 9003', finishB: 'Dýha Dub Americký', isAtyp: true, trait: 'EI',
   lock: 'Magnetický WC', rosette: true,
   hinges: 'Tectus 340 3D', hingesCount: 3,
   dropSeal: 'Padací lišta', dropSealType: 'Planet HS',
   closer: 'GEZE Boxer', accessories: 'Větrací mřížka Al'
};

const compactData = {
  id: 'd3', type: 'LIBERO', thickness: '40', dim: '800x1970',
  finishA: 'HPL Beton', finishB: 'HPL Beton', isAtyp: false, trait: 'Rw'
};

const TestCards = () => {
  const onDragEnd = () => {}; 

  return (
    // ZMĚNA: Použití h-full a overflow-y-auto pro správné skrolování
    <div className="h-full overflow-y-auto bg-slate-100 p-10 custom-scrollbar">
      <h1 className="text-3xl font-bold mb-2 text-slate-800">Test Komponent</h1>
      <p className="text-slate-500 mb-10">Přehled všech typů karet v systému.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start pb-20">
        
        {/* 1. GLASS CARD */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-blue-600">1. Hlavní Karta (Kanban)</h2>
          <div className="bg-slate-200/50 p-8 rounded-[32px] border border-slate-300/50 shadow-inner min-h-[300px]">
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="test-zone">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    <GlassCard item={glassCardData} index={0} />
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>

        {/* 2. a 3. OSTATNÍ KARTY */}
        <div className="space-y-12">
          
          <div>
            <h2 className="text-xl font-bold mb-4 text-slate-600">2. Detailní Karta</h2>
            <div className="bg-slate-200/50 p-8 rounded-[32px] border border-slate-300/50 shadow-inner">
               <DetailedDoorCard door={detailedDoorData} index={0} />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4 text-slate-600">3. Kompaktní Karta (Pro seznam)</h2>
            <div className="bg-slate-200/50 p-8 rounded-[32px] border border-slate-300/50 shadow-inner">
               <div className="bg-white/40 p-4 rounded-xl">
                 <CompactDoorCard door={compactData} index={2} />
               </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default TestCards;