import React from 'react';
import { MoreHorizontal, Phone, Mail } from 'lucide-react';
import { ROLES, DEPARTMENTS } from '../../data/teamData';

const EmployeeCard = ({ employee, onClick }) => {
    const roleInfo = ROLES[employee.role] || { label: employee.role, color: 'text-slate-600 bg-slate-100' };

    return (
        <div
            onClick={onClick}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 hover:shadow-lg dark:hover:shadow-blue-900/10 hover:border-blue-300 dark:hover:border-blue-700 hover:-translate-y-1 transition-all group cursor-pointer relative overflow-hidden"
        >
            <div className={`absolute top-0 left-0 w-1 h-full ${DEPARTMENTS[employee.department]?.color.split(' ')[0] || 'bg-slate-200 dark:bg-slate-700'}`}></div>
            <div className="flex items-center justify-between mb-3 pl-2">
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${roleInfo.color.includes('bg-white') ? 'bg-slate-50 dark:bg-slate-700' : roleInfo.color}`}>{roleInfo.label}</span>
                <MoreHorizontal size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400" />
            </div>
            <div className="flex items-center gap-4 pl-2 mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-lg font-bold text-slate-500 shadow-sm group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {employee.avatar}
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-base">{employee.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{DEPARTMENTS[employee.department]?.label}</p>
                </div>
            </div>
            <div className="pl-2 space-y-1.5 border-t border-slate-50 dark:border-slate-700/50 pt-3">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"><Phone size={12} className="text-slate-400 dark:text-slate-600" /> {employee.phone}</div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"><Mail size={12} className="text-slate-400 dark:text-slate-600" /> {employee.email}</div>
            </div>
        </div>
    );
};

export default EmployeeCard;
