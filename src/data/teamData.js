// src/data/teamData.js

// Definice oddělení
export const DEPARTMENTS = {
  VEDENI: { id: 'VEDENI', label: 'Vedení výroby', color: 'bg-slate-100 text-slate-700' },
  PRIPRAVA: { id: 'PRIPRAVA', label: 'Příprava výroby', color: 'bg-blue-50 text-blue-700' },
  TRUHLARNA: { id: 'TRUHLARNA', label: 'Truhlárna', color: 'bg-orange-50 text-orange-700' },
  LAKOVNA: { id: 'LAKOVNA', label: 'Lakovna', color: 'bg-purple-50 text-purple-700' },
};

// Definice rolí
export const ROLES = {
  MISTR: { label: 'Mistr výroby', color: 'text-indigo-700 bg-indigo-100 border-indigo-200' },
  PRIPRAVAR: { label: 'Přípravář', color: 'text-blue-700 bg-blue-100 border-blue-200' },
  TRUHLAR: { label: 'Truhlář', color: 'text-orange-700 bg-orange-100 border-orange-200' },
  LAKYRNIK: { label: 'Lakýrník', color: 'text-purple-700 bg-purple-100 border-purple-200' },
  POMOCNIK: { label: 'Pomocník', color: 'text-emerald-700 bg-emerald-100 border-emerald-200' },
};

// --- DŮLEŽITÉ: EXPORT DATA STARTU ---
// 1. Června 2025 (Start dat dle požadavku). Používáme UTC pro stabilitu.
export const DATA_START_DATE = new Date(Date.UTC(2025, 5, 1));

// Svátky v roce 2025
export const HOLIDAYS = ['2025-09-28', '2025-10-28', '2025-11-17', '2025-12-24', '2025-12-25', '2025-12-26'];

// Generátor směn (150 dní)
const generateRealShifts = (defaultType = 'R') => {
  const shifts = [];
  const startMs = DATA_START_DATE.getTime();

  let sickRemaining = 0;
  let vacationRemaining = 0;

  // Generujeme cca 330 dní (pokrytí od června 2025 do dubna 2026)
  for (let i = 0; i < 330; i++) {
    // Přičítáme dny k UTC startu
    const currentDate = new Date(startMs + i * 86400000);
    const dateStr = currentDate.toISOString().split('T')[0];

    // 1.9.2025 je Pondělí (index 0)
    const dayIndex = i % 7;
    const isWeekend = dayIndex === 5 || dayIndex === 6;
    const isHoliday = HOLIDAYS.includes(dateStr);

    let shift = { type: defaultType, hours: 8 };

    if (isWeekend || isHoliday) {
      shift = { type: '-', hours: 0 };
    }
    else if (sickRemaining > 0) {
      shift = { type: 'N', hours: 0 };
      sickRemaining--;
    }
    else if (vacationRemaining > 0) {
      shift = { type: 'D', hours: 0 };
      vacationRemaining--;
    }
    else {
      const rand = Math.random();
      if (rand < 0.015) {
        sickRemaining = Math.floor(Math.random() * 4) + 1;
        shift = { type: 'N', hours: 0 };
      }
      else if (rand < 0.035) {
        vacationRemaining = Math.floor(Math.random() * 2) + 1;
        shift = { type: 'D', hours: 0 };
      }
    }
    shifts.push(shift);
  }
  return shifts;
};

// Seznam zaměstnanců
export const initialEmployees = [
  { id: 'M1', name: 'Petr Novák', role: 'MISTR', department: 'VEDENI', avatar: 'PN', phone: '777123456', email: 'mistr@dorsis.cz', startDate: '2020-01-01', status: 'active', shifts: generateRealShifts('R') },
  { id: 'PR1', name: 'Jana Malá', role: 'PRIPRAVAR', department: 'PRIPRAVA', avatar: 'JM', phone: '777222111', email: 'priprava1@dorsis.cz', startDate: '2021-05-01', status: 'active', shifts: generateRealShifts('R') },
  { id: 'PR2', name: 'Karel Hruška', role: 'PRIPRAVAR', department: 'PRIPRAVA', avatar: 'KH', phone: '777222222', email: 'priprava2@dorsis.cz', startDate: '2023-02-15', status: 'active', shifts: generateRealShifts('R') },
  { id: 'T1', name: 'Josef Svoboda', role: 'TRUHLAR', department: 'TRUHLARNA', avatar: 'JS', phone: '777333001', email: '---', startDate: '2019-01-01', status: 'active', shifts: generateRealShifts('R') },
  { id: 'T2', name: 'Milan Dvořák', role: 'TRUHLAR', department: 'TRUHLARNA', avatar: 'MD', phone: '777333002', email: '---', startDate: '2020-06-01', status: 'active', shifts: generateRealShifts('R') },
  { id: 'T3', name: 'David Černý', role: 'TRUHLAR', department: 'TRUHLARNA', avatar: 'DČ', phone: '777333003', email: '---', startDate: '2021-09-01', status: 'active', shifts: generateRealShifts('R') },
  { id: 'T4', name: 'Roman Kříž', role: 'TRUHLAR', department: 'TRUHLARNA', avatar: 'RK', phone: '777333004', email: '---', startDate: '2022-03-01', status: 'active', shifts: generateRealShifts('R') },
  { id: 'T5', name: 'Lukáš Novotný', role: 'TRUHLAR', department: 'TRUHLARNA', avatar: 'LN', phone: '777333005', email: '---', startDate: '2023-01-10', status: 'active', shifts: generateRealShifts('O') },
  { id: 'T6', name: 'Filip Marek', role: 'TRUHLAR', department: 'TRUHLARNA', avatar: 'FM', phone: '777333006', email: '---', startDate: '2024-01-01', status: 'active', shifts: generateRealShifts('O') },
  { id: 'L1', name: 'Martin Kovář', role: 'LAKYRNIK', department: 'LAKOVNA', avatar: 'MK', phone: '777444001', email: '---', startDate: '2018-11-01', status: 'active', shifts: generateRealShifts('R') },
  { id: 'L2', name: 'Pavel Veselý', role: 'LAKYRNIK', department: 'LAKOVNA', avatar: 'PV', phone: '777444002', email: '---', startDate: '2022-05-01', status: 'active', shifts: generateRealShifts('R') },
  { id: 'P1', name: 'Adam Rychlý', role: 'POMOCNIK', department: 'LAKOVNA', avatar: 'AR', phone: '777555001', email: '---', startDate: '2023-08-01', status: 'active', shifts: generateRealShifts('R') },
  { id: 'P2', name: 'Tomáš Tichý', role: 'POMOCNIK', department: 'LAKOVNA', avatar: 'TT', phone: '777555002', email: '---', startDate: '2024-02-15', status: 'active', shifts: generateRealShifts('R') },
];