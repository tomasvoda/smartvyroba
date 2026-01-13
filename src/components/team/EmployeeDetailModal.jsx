import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getDaysDiff } from '../../utils/dateUtils';
import { DATA_START_DATE, HOLIDAYS } from '../../data/teamData';

const EmployeeDetailModal = ({ employee, onClose }) => {
    const [currentMonthDate, setCurrentMonthDate] = useState(new Date(2025, 10, 1));

    const getMonthDays = () => {
        const year = currentMonthDate.getFullYear();
        const month = currentMonthDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayIndex = new Date(year, month, 1).getDay();
        const offset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

        const days = [];
        for (let i = 0; i < offset; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) {
            const d = new Date(year, month, i);
            const dateStr = d.toISOString().split('T')[0];
            const diffDays = getDaysDiff(d, DATA_START_DATE);

            days.push({
                day: i,
                date: d,
                isWeekend: d.getDay() === 0 || d.getDay() === 6,
                isHoliday: HOLIDAYS.includes(dateStr),
                shiftIndex: (diffDays >= 0 && diffDays < employee.shifts.length) ? diffDays : null
            });
        }
        return days;
    };

    const monthName = currentMonthDate.toLocaleString('cs-CZ', { month: 'long', year: 'numeric' });

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-lg h-[80vh] flex flex-col overflow-hidden animate-in zoom-in duration-200">
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center font-bold text-slate-600">{employee.avatar}</div>
                        <h2 className="text-xl font-bold text-slate-800">{employee.name}</h2>
                    </div>
                    <button type="button" onClick={onClose}><X size={20} className="text-slate-400" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-700 capitalize">{monthName}</h3>
                        <div className="flex gap-2 bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                            <button type="button" onClick={() => setCurrentMonthDate(new Date(currentMonthDate.setMonth(currentMonthDate.getMonth() - 1)))} className="p-1 rounded hover:bg-slate-100"><ChevronLeft /></button>
                            <button type="button" onClick={() => setCurrentMonthDate(new Date(currentMonthDate.setMonth(currentMonthDate.getMonth() + 1)))} className="p-1 rounded hover:bg-slate-100"><ChevronRight /></button>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
                            {['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'].map(d => <div key={d} className="text-center text-[10px] font-bold text-slate-400 py-2">{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7">
                            {getMonthDays().map((dayData, i) => {
                                if (!dayData) return <div key={i} className="aspect-square border-b border-r border-slate-100 bg-slate-50/30"></div>;

                                const shift = dayData.shiftIndex !== null ? employee.shifts[dayData.shiftIndex] : null;
                                const isOff = dayData.isWeekend || dayData.isHoliday;

                                return (
                                    <div key={i} className={`aspect-square border-b border-r border-slate-100 p-1 flex flex-col justify-between ${isOff ? 'bg-slate-50/50' : 'bg-white'}`}>
                                        <span className={`text-[10px] font-bold ${isOff ? 'text-rose-400' : 'text-slate-600'}`}>{dayData.day}</span>

                                        {!isOff && shift && (
                                            <div className={`text-center py-1 rounded text-[9px] font-bold ${shift.type === 'R' ? 'bg-blue-100 text-blue-700' : shift.type === 'O' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400'}`}>
                                                {shift.type}
                                            </div>
                                        )}
                                        {dayData.isHoliday && <div className="text-[8px] text-center text-rose-500 font-bold bg-rose-50 rounded">SV</div>}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDetailModal;
