export const getDaysDiff = (date1, date2) => {
    if (!date1 || !date2) return 0;
    const d1 = new Date(Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate()));
    const d2 = new Date(Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate()));
    const diffTime = d1 - d2;
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

export const getWeekNumber = (d) => {
    if (!d) return 0;
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

export const getWeekDates = (startDate, holidays = []) => {
    const weekDates = [];
    const start = startDate ? new Date(startDate) : new Date();

    for (let i = 0; i < 14; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const dateString = d.toISOString().split('T')[0];
        weekDates.push({
            date: d.getDate(),
            dayName: ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'][d.getDay()],
            fullDate: d,
            dateString: dateString,
            isWeekend: d.getDay() === 0 || d.getDay() === 6,
            isHoliday: holidays.includes(dateString)
        });
    }
    return weekDates;
};
