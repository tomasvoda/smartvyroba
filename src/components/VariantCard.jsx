import React from 'react';
import { Check } from 'lucide-react';

const VariantCard = ({ title, description, active, onClick, image, previewColor, compact = false }) => {
    return (
        <button
            onClick={onClick}
            className={`
                group relative flex flex-col items-start text-left w-full
                border transition-all duration-300 overflow-hidden backdrop-blur-md
                ${compact ? 'rounded-2xl' : 'rounded-3xl'}
                ${active
                    ? 'bg-white/80 dark:bg-slate-800/80 border-blue-500/50 shadow-[0_10px_25px_rgba(59,130,246,0.15)] scale-[1.02] z-10'
                    : 'bg-white/40 dark:bg-slate-800/20 border-white/60 dark:border-slate-700/50 hover:border-blue-500/30 hover:bg-white/60 dark:hover:bg-slate-800/40 hover:shadow-lg'
                }
            `}
        >
            <div className={`flex w-full gap-3 ${compact ? 'p-2' : 'p-3'}`}>
                {/* Preview / Icon Area */}
                <div
                    className={`
                        rounded-xl shrink-0 flex items-center justify-center font-bold
                        ${compact ? 'w-10 h-10 text-base' : 'w-12 h-12 text-lg'}
                        ${active
                            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }
                    `}
                    style={previewColor ? { backgroundColor: previewColor } : undefined}
                >
                    {image ? (
                        <img src={image} alt={title} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                        <span>{title.charAt(0)}</span>
                    )}
                </div>

                {/* Content Area */}
                <div className="flex-1 min-w-0 py-0.5">
                    <div className="flex justify-between items-start gap-2">
                        <span className={`${compact ? 'text-[10px]' : 'text-xs'} font-black uppercase tracking-wide truncate pr-4 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}>
                            {title}
                        </span>
                        {active && (
                            <div className="absolute top-3 right-3 text-blue-500">
                                <Check size={14} strokeWidth={3} />
                            </div>
                        )}
                    </div>
                    {description && (
                        <p className={`${compact ? 'text-[9px]' : 'text-[10px]'} text-slate-400 font-medium leading-tight mt-0.5 pr-2`}>
                            {description}
                        </p>
                    )}
                </div>
            </div>
        </button>
    );
};

export default VariantCard;
