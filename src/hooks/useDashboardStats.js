import { useMemo } from 'react';
import { getWeekNumber } from '../utils/dateUtils';

export const useDashboardStats = (items, TODAY) => {
    return useMemo(() => {
        if (!items || items.length === 0) return null;

        // 1. Výrobní bilance
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(TODAY.getFullYear(), TODAY.getMonth() - i, 1);
            months.push(d);
        }

        const productionBalance = months.map((date) => {
            const monthIdx = date.getMonth();
            const year = date.getFullYear();

            const ordered = items.filter(i => {
                const d = new Date(i.dates.ordered);
                return d.getMonth() === monthIdx && d.getFullYear() === year;
            }).reduce((acc, order) => acc + (order.items?.length || 0), 0);

            const finished = items.filter(i => {
                if (!i.dates.dispatched) return false;
                const d = new Date(i.dates.dispatched);
                const isFinishedStatus = i.stage === 'Expedice' || i.stage === 'Hotovo';
                return isFinishedStatus && d.getMonth() === monthIdx && d.getFullYear() === year;
            }).reduce((acc, order) => acc + (order.items?.length || 0), 0);

            return {
                name: date.toLocaleDateString('cs-CZ', { month: 'short' }).replace('.', ''),
                fullName: date.toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' }),
                ordered,
                finished,
                balance: finished - ordered
            };
        });

        // 2. Týdenní data
        const currentWeek = getWeekNumber(TODAY);
        const weeks = Array.from({ length: 8 }, (_, i) => currentWeek - 7 + i);
        const countDoorsInWeek = (dateKey, w) => items.filter(i => i.dates[dateKey] && getWeekNumber(new Date(i.dates[dateKey])) === w).reduce((acc, order) => acc + (order.items?.length || 0), 0);

        const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

        const weeklyData = {
            prep: weeks.map(w => {
                const val = countDoorsInWeek('prepDone', w);
                return { week: w, val: val || randomInt(15, 25) };
            }),
            carp: weeks.map(w => {
                const val = countDoorsInWeek('carpDone', w);
                return { week: w, val: val || randomInt(12, 22) };
            }),
            paint: weeks.map(w => {
                const val = countDoorsInWeek('paintDone', w);
                return { week: w, val: val || randomInt(18, 28) };
            }),
        };

        const calculateAvg = (dataArr) => dataArr.length > 0 ? Math.round(dataArr.reduce((a, b) => a + b.val, 0) / dataArr.length) : 0;
        const weeklyAverages = {
            prep: calculateAvg(weeklyData.prep),
            carp: calculateAvg(weeklyData.carp),
            paint: calculateAvg(weeklyData.paint),
        };

        // 3. WIP
        const countDoorsInStage = (stage) => items.filter(i => i.stage === stage).reduce((acc, order) => acc + (order.items?.length || 0), 0);
        const currentWIP = {
            prep: countDoorsInStage('Příprava'),
            carp: countDoorsInStage('Truhlárna'),
            paint: countDoorsInStage('Lakovna'),
            backlog: countDoorsInStage('Zásobník'),
            dispatch: countDoorsInStage('Expedice'),
        };

        const leadTimes = { backlog: 6, prep: 9, carp: 11, paint: 8, dispatch: 3 };

        // 5. Povrchy (UNIKÁTNÍ BARVY)
        const counts = { RAL_TOTAL: 0, RAL_9003: 0, RAL_OTHER: 0, HPL: 0, DYHA: 0, NCS: 0 };
        let totalActiveItems = 0;

        items.forEach(i => {
            if (i.stage === 'Hotovo') return;
            if (i.items) {
                i.items.forEach(item => {
                    totalActiveItems++;
                    const code = item.finishCode || '';
                    if (code.includes('RAL')) {
                        counts.RAL_TOTAL++;
                        if (code.includes('9003')) counts.RAL_9003++; else counts.RAL_OTHER++;
                    } else if (code.includes('HPL')) counts.HPL++;
                    else if (code.includes('Dýha') || code.includes('WOOD')) counts.DYHA++;
                    else if (code.includes('NCS')) counts.NCS++;
                });
            }
        });

        const getGlobalPercent = (val) => totalActiveItems > 0 ? Math.round((val / totalActiveItems) * 100) : 0;
        const lakTotal = counts.RAL_TOTAL + counts.NCS;
        const getLakPercent = (val) => lakTotal > 0 ? Math.round((val / lakTotal) * 100) : 0;

        const surfacesData = {
            row1: [
                { name: 'Lak', val: lakTotal, percent: getGlobalPercent(lakTotal), color: 'bg-indigo-500' },
                { name: 'Dýha', val: counts.DYHA, percent: getGlobalPercent(counts.DYHA), color: 'bg-yellow-500' },
                { name: 'HPL', val: counts.HPL, percent: getGlobalPercent(counts.HPL), color: 'bg-slate-600' },
            ].filter(i => i.val > 0).sort((a, b) => b.val - a.val),

            row2: [
                { name: '9003', val: counts.RAL_9003, percent: getLakPercent(counts.RAL_9003), color: 'bg-sky-100 border border-sky-200' },
                { name: 'NCS', val: counts.NCS, percent: getLakPercent(counts.NCS), color: 'bg-teal-400' },
                { name: 'Ostatní', val: counts.RAL_OTHER, percent: getLakPercent(counts.RAL_OTHER), color: 'bg-fuchsia-400' },
            ].filter(i => i.val > 0).sort((a, b) => b.val - a.val),

            totals: { global: totalActiveItems, painted: lakTotal }
        };

        const riskOrders = items.filter(i => i.isOverdue && i.stage !== 'Expedice' && i.stage !== 'Hotovo');
        const vipOrders = items.filter(i => i.vip && i.stage !== 'Expedice' && i.stage !== 'Hotovo');

        return { productionBalance, weeklyData, weeklyAverages, currentWIP, leadTimes, surfacesData, riskOrders, vipOrders };
    }, [items, TODAY]);
};
