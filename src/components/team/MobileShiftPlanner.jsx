import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Wand2, Calendar } from 'lucide-react';
import { getWeekDates, getDaysDiff } from '../../utils/dateUtils';
import { DATA_START_DATE, HOLIDAYS, DEPARTMENTS } from '../../data/teamData';

const MobileShiftPlanner = ({ employees, onShiftClick, onBulkClick, viewStartDate }) => {
    const [selectedDateIdx, setSelectedDateIdx] = useState(0);
    const weekDates = getWeekDates(viewStartDate, HOLIDAYS);
    const globalOffset = Math.max(0, getDaysDiff(viewStartDate, DATA_START_DATE));

    const selectedDay = weekDates[selectedDateIdx];
    const currentGlobalIdx = globalOffset + selectedDateIdx;

    const getShiftColor = (type) => {
        switch (type) {
            case 'R': return 'bg-blue-600 text-white border-blue-600';
            case 'O': return 'bg-indigo-600 text-white border-indigo-600';
            case 'D': return 'bg-amber-500 text-white border-amber-500';
            case 'N': return 'bg-rose-500 text-white border-rose-500';
            default: return 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-700';
        }
    };

    return (
        <div className="flex flex-col gap-4 pb-20 px-2 lg:hidden transition-colors">
            {/* Date Selector */}
            <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Calendar size={18} className="text-blue-500" />
                        {selectedDay.dayName} {selectedDay.date}. {selectedDay.fullDate.toLocaleDateString('cs-CZ', { month: 'short' })}
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setSelectedDateIdx(Math.max(0, selectedDateIdx - 1))}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 active:bg-slate-100 dark:active:bg-slate-800 transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => setSelectedDateIdx(Math.min(13, selectedDateIdx + 1))}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 active:bg-slate-100 dark:active:bg-slate-800 transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {weekDates.map((day, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedDateIdx(idx)}
                            className={`
                    flex-shrink-0 w-12 py-2 rounded-xl border flex flex-col items-center gap-1 transition-all
                    ${selectedDateIdx === idx ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400'}
                  `}
                        >
                            <span className="text-[10px] uppercase font-bold">{day.dayName}</span>
                            <span className="text-sm font-black">{day.date}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Employees for selected day */}
            <div className="space-y-6">
                {Object.entries(DEPARTMENTS).map(([deptId, deptInfo]) => {
                    const deptStaff = employees.filter(e => e.department === deptId);
                    if (deptStaff.length === 0) return null;

                    return (
                        <div key={deptId} className="space-y-3">
                            <div className="flex items-center justify-between px-2">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${deptInfo.color}`}>
                                    {deptInfo.label}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-2">
                                {deptStaff.map(emp => {
                                    const shift = (emp.shifts && emp.shifts[currentGlobalIdx]) || { type: '-', hours: 0 };
                                    return (
                                        <div key={emp.id} className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500 dark:text-slate-400 transition-colors">
                                                    {emp.avatar}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 dark:text-white text-sm">{emp.name}</p>
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">{emp.role}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => onBulkClick(emp)}
                                                    className="p-2 text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                >
                                                    <Wand2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => onShiftClick(emp, selectedDateIdx)}
                                                    className={`w-12 h-10 rounded-xl flex flex-col items-center justify-center border font-bold transition-all active:scale-90 shadow-sm ${getShiftColor(shift.type)}`}
                                                >
                                                    <span className="text-sm">{shift.type}</span>
                                                    {shift.type !== '-' && <span className="text-[8px] opacity-80 leading-none">{shift.hours}h</span>}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MobileShiftPlanner;
