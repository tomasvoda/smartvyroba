import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarRange, Activity } from 'lucide-react';

// Hooks & Utils
import { useDashboardStats } from '../hooks/useDashboardStats';

// Components
import ProductionBalanceCard from '../components/dashboard/ProductionBalanceCard';
import {
   LeadTimeCard,
   UnifiedDepartmentsCard,
   WipFunnelCard,
   SurfacesCard,
   ListCard
} from '../components/dashboard/DashboardWidgets';

const Dashboard = ({ items }) => {
   const navigate = useNavigate();
   // V reálné aplikaci by toto bylo new Date() nebo z kontextu
   const TODAY = React.useMemo(() => new Date(), []);

   const stats = useDashboardStats(items, TODAY);

   if (!stats) return (
      <div className="flex flex-col items-center justify-center p-20 text-slate-400 dark:text-slate-600 gap-4">
         <div className="w-12 h-12 border-4 border-blue-100 dark:border-blue-900/30 border-t-blue-500 rounded-full animate-spin"></div>
         <p className="font-bold">Načítám data z výroby...</p>
      </div>
   );

   return (
      <div className="space-y-6 animate-in fade-in zoom-in duration-500 pb-20 pt-2 transition-colors">

         {/* HEADER - REMOVED TITLE/KPI AS REQUESTED */}
         <div className="h-2" />

         {/* --- GRID SYSTEM --- */}
         <div className="grid grid-cols-12 gap-4 md:gap-6">
            {/* Hlavní grafy */}
            <div className="col-span-12 xl:col-span-8 flex flex-col gap-4 md:gap-6">
               <div className="h-[350px] md:h-[400px] w-full">
                  <ProductionBalanceCard data={stats.productionBalance} />
               </div>
               <div className="h-[350px] md:h-[400px] w-full">
                  <UnifiedDepartmentsCard
                     prepData={stats.weeklyData.prep} prepAvg={stats.weeklyAverages.prep}
                     carpData={stats.weeklyData.carp} carpAvg={stats.weeklyAverages.carp}
                     paintData={stats.weeklyData.paint} paintAvg={stats.weeklyAverages.paint}
                  />
               </div>
            </div>

            {/* Boční widgety */}
            <div className="col-span-12 xl:col-span-4 flex flex-col sm:grid sm:grid-cols-2 xl:flex xl:flex-col gap-4 md:gap-6">
               <div className="h-64 sm:h-auto xl:h-64 w-full">
                  <LeadTimeCard times={stats.leadTimes} />
               </div>
               <div className="flex-1 min-h-[300px] sm:min-h-0 xl:min-h-[400px]">
                  <WipFunnelCard wip={stats.currentWIP} />
               </div>
            </div>
         </div>

         {/* --- SPODNÍ GRID --- */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
            <div className="h-80 bg-white dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
               <ListCard title="VIP Priority" items={stats.vipOrders} type="vip" navigate={navigate} />
            </div>
            <div className="h-80 bg-white dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
               <ListCard title="V ohrožení" items={stats.riskOrders} type="risk" navigate={navigate} />
            </div>
            <div className="h-80 bg-white dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
               <SurfacesCard surfacesData={stats.surfacesData} />
            </div>
         </div>
      </div>
   );
};

export default Dashboard;