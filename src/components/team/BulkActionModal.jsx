import React, { useState } from 'react';
import { Check } from 'lucide-react';

const BulkActionModal = ({ employee, onClose, onSave }) => {
    const [type, setType] = useState('R');
    const [scope, setScope] = useState('week1');

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-80 animate-in zoom-in duration-200">
                <h3 className="font-bold text-slate-800 text-lg mb-1">Hromadná změna</h3>
                <p className="text-sm text-slate-500 mb-6">{employee.name}</p>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 block mb-2">Vyberte směnu</label>
                        <div className="grid grid-cols-5 gap-1">
                            {['R', 'O', 'D', 'N', '-'].map(t => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setType(t)}
                                    className={`py-2 rounded-lg text-sm font-bold border transition-all ${type === t ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 block mb-2">Pro období</label>
                        <div className="flex flex-col gap-2">
                            <button type="button" onClick={() => setScope('week1')} className={`px-3 py-2 rounded-lg text-sm font-medium border text-left flex justify-between ${scope === 'week1' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'}`}><span>1. týden zobrazení</span>{scope === 'week1' && <Check size={16} />}</button>
                            <button type="button" onClick={() => setScope('week2')} className={`px-3 py-2 rounded-lg text-sm font-medium border text-left flex justify-between ${scope === 'week2' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'}`}><span>2. týden zobrazení</span>{scope === 'week2' && <Check size={16} />}</button>
                            <button type="button" onClick={() => setScope('all')} className={`px-3 py-2 rounded-lg text-sm font-medium border text-left flex justify-between ${scope === 'all' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'}`}><span>Celých 14 dní</span>{scope === 'all' && <Check size={16} />}</button>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 mt-6 pt-4 border-t border-slate-100">
                    <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg text-slate-500 hover:bg-slate-100 font-medium text-sm">Zrušit</button>
                    <button type="button" onClick={() => onSave({ type, scope })} className="flex-1 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-bold text-sm shadow-sm">Potvrdit</button>
                </div>
            </div>
        </div>
    );
};

export default BulkActionModal;
