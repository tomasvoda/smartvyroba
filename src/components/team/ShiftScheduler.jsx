import React from 'react';
import { Wand2 } from 'lucide-react';
import GlobalCapacityOverview from './GlobalCapacityOverview';
import MobileShiftPlanner from './MobileShiftPlanner';
import { getWeekDates, getDaysDiff } from '../../utils/dateUtils';
import { DEPARTMENTS, DATA_START_DATE, HOLIDAYS } from '../../data/teamData';

const ShiftScheduler = ({ employees, onShiftClick, onBulkClick, viewStartDate, hideOverview }) => {
    const weekDates = getWeekDates(viewStartDate, HOLIDAYS);

    const getShiftColor = (type) => {
        switch (type) {
            case 'R': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50';
            case 'O': return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50';
            case 'D': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50';
            case 'N': return 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50';
            case '-': return 'bg-slate-50 dark:bg-slate-900/30 text-slate-300 dark:text-slate-600 border-slate-100 dark:border-slate-800 opacity-50';
            default: return 'bg-white dark:bg-slate-800 text-slate-300 dark:text-slate-600 border-slate-100 dark:border-slate-700';
        }
    };

    const groupedEmployees = {};
    Object.keys(DEPARTMENTS).forEach(dept => groupedEmployees[dept] = []);

    if (employees && Array.isArray(employees)) {
        employees.forEach(emp => {
            if (groupedEmployees[emp.department]) groupedEmployees[emp.department].push(emp);
        });
    }

    const globalOffset = Math.max(0, getDaysDiff(viewStartDate, DATA_START_DATE));

    return (
        <>
            {/* MOBILE VIEW */}
            <MobileShiftPlanner
                employees={employees}
                onShiftClick={onShiftClick}
                onBulkClick={onBulkClick}
                viewStartDate={viewStartDate}
            />

            {/* DESKTOP VIEW */}
            <div className="hidden lg:flex flex-col flex-1 overflow-x-auto pb-20 transition-colors">
                {!hideOverview && <GlobalCapacityOverview employees={employees} weekDates={weekDates} globalOffset={globalOffset} />}

                {Object.entries(DEPARTMENTS).map(([deptId, deptInfo]) => {
                    const deptStaff = groupedEmployees[deptId];
                    if (!deptStaff || deptStaff.length === 0) return null;

                    return (
                        <div key={deptId} className="mb-8 last:mb-0 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
                            <div className="p-3 bg-slate-50/30 dark:bg-slate-900/40 border-b border-slate-200/50 dark:border-slate-700/50 flex justify-between items-center transition-colors">
                                <h4 className={`text-[11px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${deptInfo.color}`}>
                                    {deptInfo.label}
                                </h4>
                                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">{deptStaff.length} zaměstnanců</div>
                            </div>

                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/20 dark:bg-slate-900/10 transition-colors">
                                            <th className="p-2 pl-3 font-bold text-slate-600 dark:text-slate-400 text-xs w-48 sticky left-0 bg-white dark:bg-slate-800 z-20 border-r border-slate-100 dark:border-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] transition-colors">Jméno</th>
                                            {weekDates.map((day, i) => (
                                                <th key={i} className={`p-1 font-bold text-[10px] text-center min-w-[40px] border-l border-slate-50 dark:border-slate-700 ${day.isWeekend || day.isHoliday ? 'bg-slate-50 dark:bg-slate-900/50 text-rose-400 dark:text-rose-500' : 'text-slate-500 dark:text-slate-400'}`}>
                                                    {day.dayName}<br /><span className="opacity-50">{day.date}</span>
                                                </th>
                                            ))}
                                            <th className="p-2 font-bold text-slate-600 dark:text-slate-400 text-xs text-center w-20 border-l border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/30 transition-colors">Suma</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                        {deptStaff.map(emp => {
                                            let totalHours = 0;
                                            for (let i = 0; i < 14; i++) {
                                                const shiftIndex = globalOffset + i;
                                                if (emp.shifts && shiftIndex < emp.shifts.length) {
                                                    const shift = emp.shifts[shiftIndex];
                                                    if (shift) totalHours += (shift.hours || 0);
                                                }
                                            }

                                            return (
                                                <tr key={emp.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-700/30 transition-colors group">
                                                    <td className="p-2 pl-4 sticky left-0 bg-white dark:bg-slate-800 z-20 border-r border-slate-100 dark:border-slate-700 transition-colors">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-7 h-7 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 transition-colors">
                                                                {emp.avatar}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-bold text-slate-700 dark:text-slate-200 text-xs truncate max-w-[100px]">{emp.name}</p>
                                                            </div>
                                                            <button type="button" onClick={() => onBulkClick(emp)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-500 dark:text-blue-400 rounded transition-all"><Wand2 size={12} /></button>
                                                        </div>
                                                    </td>
                                                    {weekDates.map((day, i) => {
                                                        const shiftIndex = globalOffset + i;
                                                        const shift = (shiftIndex >= 0 && emp.shifts && shiftIndex < emp.shifts.length) ? emp.shifts[shiftIndex] : { type: '-', hours: 0 };
                                                        const isOff = day.isWeekend || day.isHoliday;

                                                        return (
                                                            <td key={i} className={`p-1 text-center border-l border-slate-50 dark:border-slate-700 ${isOff ? 'bg-slate-50/50 dark:bg-slate-900/50' : ''}`}>
                                                                <div className="flex justify-center">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => onShiftClick(emp, i)}
                                                                        className={`w-8 h-8 rounded-lg flex flex-col items-center justify-center border transition-all hover:scale-105 active:scale-95 ${getShiftColor(shift.type)}`}
                                                                    >
                                                                        <span className="text-[10px] font-bold">{shift.type}</span>
                                                                        {shift.type !== '-' && shift.hours > 0 && <span className="text-[7px] font-normal opacity-80 leading-none -mt-0.5">{shift.hours}h</span>}
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        )
                                                    })}
                                                    <td className="p-2 text-center border-l border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/30 transition-colors">
                                                        <span className="font-mono font-bold text-slate-600 dark:text-slate-400 text-xs bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">{totalHours}</span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
};

export default ShiftScheduler;
