// --- KONFIGURACE GENERÁTORU ---
const FLUCTUATION = 0.2;

const PROBABILITY = {
  VIP: 0.05,
  OVERDUE: 0.1,
  ATYP: 0.12,
  RW: 0.03,
  EI: 0.02
};

const CLIENTS = [
  'Sky Park Rezidence', 'Hotel Hilton', 'Admin. budova Butterfly',
  'Bytový dům Žižkov', 'Vila Mrázovka', 'Logistický park D1',
  'Kanceláře Dock In', 'Rezidence Waltrovka', 'Škola Smíchov',
  'Nemocnice Motol', 'Byt Novák', 'Advokátní kancelář', 'Showroom Audi'
];

const PROJECT_MANAGERS = [
  'Ing. Marek Svoboda', 'Lucie Černá', 'Petr Novotný', 'Mgr. Anna Bílá'
];

const DOOR_TYPES = ['DURUS', 'FORTIUS', 'LIBERO'];

const FINISH_TYPES = {
  RAL_9003: { code: 'RAL 9003', cat: 'RAL' },
  RAL_7016: { code: 'RAL 7016', cat: 'RAL' },
  RAL_9005: { code: 'RAL 9005', cat: 'RAL' },
  RAL_7035: { code: 'RAL 7035', cat: 'RAL' },
  NCS_1: { code: 'NCS S 0502-Y', cat: 'NCS' },
  NCS_2: { code: 'NCS S 2005-Y20R', cat: 'NCS' },
  WOOD_OAK: { code: 'Dýha Dub', cat: 'WOOD' },
  WOOD_WALNUT: { code: 'Dýha Ořech', cat: 'WOOD' },
  HPL_CONCRETE: { code: 'HPL Beton', cat: 'HPL' },
  HPL_WHITE: { code: 'HPL Bílá', cat: 'HPL' }
};

const getWeightedFinish = () => {
  const randCat = Math.random();
  if (randCat < 0.03) return Math.random() > 0.5 ? FINISH_TYPES.HPL_CONCRETE : FINISH_TYPES.HPL_WHITE;
  if (randCat < 0.13) return Math.random() > 0.5 ? FINISH_TYPES.WOOD_OAK : FINISH_TYPES.WOOD_WALNUT;
  const randPaint = Math.random();
  if (randPaint < 0.70) return FINISH_TYPES.RAL_9003;
  if (randPaint < 0.80) return Math.random() > 0.5 ? FINISH_TYPES.NCS_1 : FINISH_TYPES.NCS_2;
  const r = Math.random();
  if (r < 0.33) return FINISH_TYPES.RAL_7016;
  if (r < 0.66) return FINISH_TYPES.RAL_9005;
  return FINISH_TYPES.RAL_7035;
};

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};
const formatDate = (date) => date.toISOString().split('T')[0];
const formatDeadline = (date) => `${date.getDate()}. ${date.getMonth() + 1}. ${date.getFullYear()}`;

const generateData = () => {
  const orders = [];
  let projectCounter = 1000;
  const TODAY = new Date();

  // Iterace přes měsíce od června 2025 do března 2026
  for (let year = 2025; year <= 2026; year++) {
    const startM = year === 2025 ? 5 : 0;
    const endM = year === 2025 ? 11 : 2;

    for (let m = startM; m <= endM; m++) {
      let currentMonthDoors = 0;
      const monthTarget = 160 * (1 + (Math.random() * FLUCTUATION - (FLUCTUATION / 2)));

      while (currentMonthDoors < monthTarget) {
        projectCounter++;
        const doorCount = randomInt(5, 20);
        currentMonthDoors += doorCount;

        const client = randomItem(CLIENTS);
        const finishObj = getWeightedFinish();
        const isVip = Math.random() < PROBABILITY.VIP;

        const backlogDays = randomInt(5, 10);
        const prepDays = 15;
        const carpDays = 10;
        const paintDays = 18;
        const dispatchDays = 5;

        const orderedDate = new Date(year, m, randomInt(1, 28));
        const startProductionDate = addDays(orderedDate, backlogDays);
        const prepDoneDate = addDays(startProductionDate, prepDays);
        const carpDoneDate = addDays(prepDoneDate, carpDays);
        const paintDoneDate = addDays(carpDoneDate, paintDays);
        const dispatchedDate = addDays(paintDoneDate, dispatchDays);

        let stage = 'Zásobník';
        let datesObj = { ordered: formatDate(orderedDate) };

        if (TODAY < startProductionDate) {
          stage = 'Zásobník';
        } else if (TODAY < prepDoneDate) {
          stage = 'Příprava';
        } else if (TODAY < carpDoneDate) {
          stage = 'Truhlárna';
          datesObj.prepDone = formatDate(prepDoneDate);
        } else if (TODAY < paintDoneDate) {
          stage = 'Lakovna';
          datesObj.prepDone = formatDate(prepDoneDate);
          datesObj.carpDone = formatDate(carpDoneDate);
        } else if (TODAY < dispatchedDate) {
          stage = 'Expedice';
          datesObj.prepDone = formatDate(prepDoneDate);
          datesObj.carpDone = formatDate(carpDoneDate);
          datesObj.paintDone = formatDate(paintDoneDate);
        } else {
          stage = 'Hotovo';
          datesObj.prepDone = formatDate(prepDoneDate);
          datesObj.carpDone = formatDate(carpDoneDate);
          datesObj.paintDone = formatDate(paintDoneDate);
          datesObj.dispatched = formatDate(dispatchedDate);
        }

        // Explicitly force some orders to be overdue if they are in active production
        let deadlineDays = 60;
        if (stage !== 'Zásobník' && stage !== 'Hotovo' && Math.random() < 0.15) {
          deadlineDays = 15; // Force overdue
        }
        const deadlineDate = addDays(orderedDate, deadlineDays);
        let isOverdue = stage !== 'Hotovo' && TODAY > deadlineDate;

        const items = Array.from({ length: doorCount }, (_, i) => ({
          id: `d-${projectCounter}-${i}`,
          dim: `${randomItem(['800', '700', '900'])}x1970`,
          finishCode: finishObj.code,
          isAtyp: Math.random() < PROBABILITY.ATYP,
          trait: Math.random() < 0.1 ? (Math.random() > 0.5 ? 'Rw' : 'EI') : null,
          type: randomItem(DOOR_TYPES),
          thickness: '40'
        }));

        orders.push({
          projectId: `25E${projectCounter}`,
          project: `25E${projectCounter}`,
          client,
          projectManager: randomItem(PROJECT_MANAGERS),
          stage,
          deadline: formatDeadline(deadlineDate),
          isVip,
          vip: isVip,
          isOverdue,
          finishCategory: finishObj.cat,
          dates: datesObj,
          items
        });
      }
    }
  }

  // Ensure at least two are overdue and at least one is VIP
  const activeOrders = orders.filter(o => o.stage !== 'Hotovo');
  if (activeOrders.length >= 2) {
    // Force first two active to be overdue
    activeOrders[0].isOverdue = true;
    activeOrders[0].deadline = '12. 1. 2026';
    activeOrders[1].isOverdue = true;
    activeOrders[1].deadline = '11. 1. 2026';

    // Force at least one VIP
    if (!activeOrders.some(o => o.isVip)) {
      activeOrders[0].isVip = true;
      activeOrders[0].vip = true;
    }
  }

  return orders.sort((a, b) => {
    if (a.stage === 'Hotovo' && b.stage !== 'Hotovo') return 1;
    if (a.stage !== 'Hotovo' && b.stage === 'Hotovo') return -1;
    return new Date(b.dates.ordered) - new Date(a.dates.ordered);
  });
};

export const initialOrders = generateData();
export const COLUMNS = { 'Příprava': { name: 'Příprava', items: [] }, 'Truhlárna': { name: 'Truhlárna', items: [] }, 'Lakovna': { name: 'Lakovna', items: [] }, 'Expedice': { name: 'Expedice', items: [] } };