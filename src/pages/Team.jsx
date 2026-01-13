import React, { useState } from 'react';
import {
  Users, CalendarDays, Plus, Search
} from 'lucide-react';

// Shared Utilities
import { getDaysDiff, getWeekDates } from '../utils/dateUtils';
import { DEPARTMENTS, DATA_START_DATE, HOLIDAYS } from '../data/teamData';

// Modular Components
import GlobalCapacityOverview from '../components/team/GlobalCapacityOverview';
import EmployeeCard from '../components/team/EmployeeCard';
import ShiftScheduler from '../components/team/ShiftScheduler';
import ShiftEditModal from '../components/team/ShiftEditModal';
import BulkActionModal from '../components/team/BulkActionModal';
import EmployeeDetailModal from '../components/team/EmployeeDetailModal';

const Team = ({ employees, setEmployees }) => {
  const [activeTab, setActiveTab] = useState('planner');
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);

  const [modalData, setModalData] = useState(null);
  const [bulkData, setBulkData] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Search & Filter state for Evidence tab
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');

  // Ochrana, pokud data ještě nejsou načtena
  if (!employees) {
    return <div className="p-10 text-center text-slate-400 dark:text-slate-600">Načítám data...</div>;
  }

  const currentViewDate = new Date(currentDate);
  const globalOffset = Math.max(0, getDaysDiff(currentViewDate, DATA_START_DATE));
  const weekDates = getWeekDates(currentViewDate, HOLIDAYS);

  const handleShiftSave = ({ type, hours }) => {
    if (!modalData) return;
    const { employee, dayIndex } = modalData;
    const globalIndex = globalOffset + dayIndex;

    setEmployees(prev => prev.map(emp => {
      if (emp.id !== employee.id) return emp;
      const newShifts = [...emp.shifts];
      if (globalIndex >= 0 && globalIndex < newShifts.length) {
        newShifts[globalIndex] = { type, hours };
      }
      return { ...emp, shifts: newShifts };
    }));
    setModalData(null);
  };

  const handleBulkSave = ({ type, scope }) => {
    if (!bulkData) return;
    const { employee } = bulkData;
    let hours = (type === 'R' || type === 'O') ? 8 : 0;

    setEmployees(prev => prev.map(emp => {
      if (emp.id !== employee.id) return emp;
      const newShifts = [...emp.shifts];

      let start = 0; let end = 14;
      if (scope === 'week1') end = 7;
      if (scope === 'week2') start = 7;

      for (let i = start; i < end; i++) {
        const globalIndex = globalOffset + i;
        if (globalIndex >= 0 && globalIndex < newShifts.length) {
          const shiftDateMs = DATA_START_DATE.getTime() + (globalIndex * 86400000);
          const d = new Date(shiftDateMs);
          const dateStr = d.toISOString().split('T')[0];
          const isWeekend = d.getDay() === 0 || d.getDay() === 6;
          const isHoliday = HOLIDAYS.includes(dateStr);

          if (!isWeekend && !isHoliday) {
            newShifts[globalIndex] = { type, hours };
          }
        }
      }
      return { ...emp, shifts: newShifts };
    }));
    setBulkData(null);
  };

  const handleEmployeeUpdate = (updatedData) => {
    setEmployees(prev => prev.map(e => e.id === updatedData.id ? updatedData : e));
  };

  return (
    <div className="h-full flex flex-col animate-in slide-in-from-bottom duration-500 pb-20 dark:bg-slate-900 transition-colors">

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 shrink-0 bg-white/20 dark:bg-slate-800/20 p-2 rounded-[24px] border border-white/50 dark:border-slate-700/50 backdrop-blur-md shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="bg-white/40 dark:bg-slate-800/40 p-1.5 rounded-2xl border border-white/50 dark:border-slate-700 backdrop-blur-md flex gap-1.5 shadow-sm w-full sm:w-auto">
            <button onClick={() => setActiveTab('planner')} className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'planner' ? 'bg-white/80 dark:bg-slate-700 shadow-md shadow-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 dark:border-blue-400/20 ring-1 ring-blue-500/10' : 'text-slate-500 hover:bg-white/20 dark:hover:bg-slate-700/50'}`}>
              <CalendarDays size={16} className="shrink-0" /> <span className="truncate text-[11px] uppercase tracking-wider">Plánovač</span>
            </button>
            <button onClick={() => setActiveTab('list')} className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'list' ? 'bg-white/80 dark:bg-slate-700 shadow-md shadow-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 dark:border-blue-400/20 ring-1 ring-blue-500/10' : 'text-slate-500 hover:bg-white/20 dark:hover:bg-slate-700/50'}`}>
              <Users size={16} className="shrink-0" /> <span className="truncate text-[11px] uppercase tracking-wider">Evidence</span>
            </button>
          </div>

          {activeTab === 'list' && (
            <div className="relative flex-1 w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Hledat..."
                className="w-full bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
          {activeTab === 'list' && (
            <div className="flex gap-1.5 bg-white/40 dark:bg-slate-900/40 p-1.5 rounded-2xl border border-white/20 dark:border-slate-700">
              <button
                onClick={() => setDeptFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${deptFilter === 'ALL' ? 'bg-white/80 dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md shadow-blue-500/10 border border-blue-500/20 ring-1 ring-blue-500/10' : 'text-slate-500 hover:bg-white dark:hover:bg-slate-800'}`}
              >
                Všechny
              </button>
              {Object.entries(DEPARTMENTS).map(([id, info]) => (
                <button
                  key={id}
                  onClick={() => setDeptFilter(id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${deptFilter === id ? 'bg-white/80 dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md shadow-blue-500/10 border border-blue-500/20 ring-1 ring-blue-500/10' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                  {info.label}
                </button>
              ))}
            </div>
          )}

          {activeTab === 'planner' && (
            <div className="flex items-center bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 px-3 py-1.5">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 mr-2">Od data:</span>
              <input
                type="date"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                className="text-sm font-bold text-slate-800 dark:text-white bg-transparent outline-none cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 -mx-1">
        {activeTab === 'planner' && (
          <div className="shrink-0 px-1">
            <GlobalCapacityOverview
              employees={employees}
              weekDates={weekDates}
              globalOffset={globalOffset}
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
          {activeTab === 'list' && (
            <div className="space-y-6 pb-10 px-1 animate-in fade-in duration-500">
              {/* SEARCH & FILTER TOOLBAR */}

              {/* FLATTENED LIST */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                {employees
                  .filter(emp => {
                    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      emp.role.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesDept = deptFilter === 'ALL' || emp.department === deptFilter;
                    return matchesSearch && matchesDept;
                  })
                  .map(emp => (
                    <EmployeeCard key={emp.id} employee={emp} onClick={() => setSelectedEmployee(emp)} />
                  ))
                }
              </div>
            </div>
          )}

          {activeTab === 'planner' && (
            <ShiftScheduler
              employees={employees}
              viewStartDate={currentViewDate}
              onShiftClick={(employee, dayIndex) => setModalData({ employee, dayIndex })}
              onBulkClick={(employee) => setBulkData({ employee })}
              hideOverview={true}
            />
          )}
        </div>
      </div>

      {modalData && (
        <ShiftEditModal
          employee={modalData.employee}
          currentShift={modalData.employee.shifts[globalOffset + modalData.dayIndex]}
          dateStr={`Den ${modalData.dayIndex + 1}`}
          onClose={() => setModalData(null)}
          onSave={handleShiftSave}
        />
      )}

      {bulkData && (
        <BulkActionModal
          employee={bulkData.employee}
          onClose={() => setBulkData(null)}
          onSave={handleBulkSave}
        />
      )}

      {selectedEmployee && (
        <EmployeeDetailModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          onUpdate={handleEmployeeUpdate}
        />
      )}

    </div>
  );
};

export default Team;