import React, { useState } from 'react';

const ShiftEditModal = ({ employee, dateStr, currentShift, onClose, onSave }) => {
    const [type, setType] = useState(currentShift?.type || '-');
    const [hours, setHours] = useState(currentShift?.hours || 0);

    const handleTypeChange = (newType) => {
        setType(newType);
        if (newType === 'R' || newType === 'O') setHours(8);
        else setHours(0);
    };

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-72 animate-in zoom-in duration-200">
                <h3 className="font-bold text-slate-800 mb-1">{employee.name}</h3>
                <p className="text-xs text-slate-500 mb-4">{dateStr}</p>
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-bold text-slate-500 block mb-1">Typ směny</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['R', 'O', 'D', 'N', '-'].map(t => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => handleTypeChange(t)}
                                    className={`py-1.5 rounded-lg text-sm font-bold border transition-all ${type === t ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 block mb-1">Odpracované hodiny</label>
                        <input
                            type="number"
                            step="0.5"
                            value={hours}
                            onChange={(e) => setHours(parseFloat(e.target.value) || 0)}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-bold outline-none focus:border-blue-500 text-center text-lg"
                        />
                    </div>
                </div>
                <div className="flex gap-2 mt-6">
                    <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg text-slate-500 hover:bg-slate-100 font-medium text-sm">Zrušit</button>
                    <button type="button" onClick={() => onSave({ type, hours })} className="flex-1 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-bold text-sm shadow-sm">Uložit</button>
                </div>
            </div>
        </div>
    );
};

export default ShiftEditModal;
