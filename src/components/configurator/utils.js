import ralData from './ral.json';
import ncsData from './ncs.json';

export const GAP_DEFAULTS = {
    side: 3,
    top: 3,
    bottom: 5,
    bottomWithDropSeal: 8,
    meeting: 3,
};

export const PROFILE_PRESETS = [
    {
        id: 'LIBERO',
        label: 'LIBERO',
        thickness: 40,
        maxHeight: 2100,
        maxHeightNoTop: 2100,
        maxWidth: 1200,
        maxWidthNoTop: 1200,
        maxWidthDouble: 1600,
        description: 'Odlehčený systém pro moderní interiéry'
    },
    {
        id: 'DURUS 45',
        label: 'DURUS 45',
        thickness: 45,
        maxHeight: 2400,
        maxHeightNoTop: 2400,
        maxWidth: 1200,
        maxWidthNoTop: 1200,
        maxWidthDouble: 1600,
        description: 'Základní systém pro standardní dveře'
    },
    {
        id: 'FORTIUS 52',
        label: 'FORTIUS 52',
        thickness: 52,
        maxHeight: 3100,
        maxHeightNoTop: 3100,
        maxWidth: 1200,
        maxWidthNoTop: 1200,
        maxWidthDouble: 2000,
        description: 'Pokročilý systém pro vysoké dveře'
    }
];

export const STANDARD_WIDTHS_SINGLE = [600, 700, 800, 900, 1000];
export const STANDARD_WIDTHS_DOUBLE = [1250, 1450, 1600];

const RAL_PRESETS = (ralData.items || []).map((item) => {
    const key = item.obj.key.replace('RAL_', 'RAL ');
    const code = key.replace('RAL ', '');
    return {
        id: `ral-${code}`,
        label: key,
        color: item.obj.value,
        roughness: 0.6,
        metalness: 0.05,
        category: 'ral',
    };
});

export const getProfilePreset = (id) => PROFILE_PRESETS.find(p => p.id === id) || PROFILE_PRESETS[0];

const NCS_PRESETS = (ncsData.items || []).map((item) => {
    const key = item.obj.key.replace('NCS_', 'NCS ');
    const code = key.replace('NCS ', '');
    return {
        id: `ncs-${code}`.toLowerCase(),
        label: key,
        color: item.obj.value,
        roughness: 0.6,
        metalness: 0.05,
        category: 'ncs',
    };
});

export const FINISH_PRESETS = [
    { id: 'none', label: 'Bez povrchové úpravy', color: '#e2e8f0', roughness: 0.85, metalness: 0.05, category: 'none' },
    ...RAL_PRESETS,
    ...NCS_PRESETS,
    // HPL dekory
    { id: 'hpl-concrete', label: 'HPL Beton', color: '#9ca3af', roughness: 0.9, metalness: 0.02, category: 'hpl' },
    { id: 'hpl-slate', label: 'HPL Břidlice', color: '#475569', roughness: 0.85, metalness: 0.05, category: 'hpl' },
    { id: 'hpl-graphite', label: 'HPL Grafit', color: '#1f2937', roughness: 0.8, metalness: 0.05, category: 'hpl' },
    { id: 'hpl-ivory', label: 'HPL Slonová kost', color: '#eee7d6', roughness: 0.75, metalness: 0.05, category: 'hpl' },
    { id: 'hpl-oak', label: 'HPL Dub', color: '#c1a06d', roughness: 0.8, metalness: 0.03, category: 'hpl' },
    { id: 'hpl-anthracite', label: 'HPL Antracit', color: '#2f3a40', roughness: 0.8, metalness: 0.04, category: 'hpl' },
    { id: 'hpl-white', label: 'HPL Bílá', color: '#f5f5f5', roughness: 0.7, metalness: 0.02, category: 'hpl' },
    { id: 'hpl-sand', label: 'HPL Písková', color: '#d8c6a1', roughness: 0.75, metalness: 0.03, category: 'hpl' },
    { id: 'hpl-ash', label: 'HPL Jasan', color: '#cabba1', roughness: 0.78, metalness: 0.03, category: 'hpl' },
    { id: 'hpl-black', label: 'HPL Černá', color: '#111827', roughness: 0.7, metalness: 0.04, category: 'hpl' },
    { id: 'hpl-linen', label: 'HPL Lněná', color: '#e8e2d3', roughness: 0.8, metalness: 0.02, category: 'hpl' },
    // Dýhy
    { id: 'veneer-oak', label: 'Dýha Dub přírodní', color: '#c4a574', roughness: 0.7, metalness: 0, category: 'veneer' },
    { id: 'veneer-walnut', label: 'Dýha Ořech', color: '#5d4037', roughness: 0.7, metalness: 0, category: 'veneer' },
    { id: 'veneer-ash', label: 'Dýha Jasan bílý', color: '#e8e4d9', roughness: 0.7, metalness: 0, category: 'veneer' },
    { id: 'veneer-beech', label: 'Dýha Buk', color: '#d4a574', roughness: 0.65, metalness: 0, category: 'veneer' },
    { id: 'veneer-oak-smoked', label: 'Dýha Dub kouřový', color: '#8b6b4e', roughness: 0.7, metalness: 0, category: 'veneer' },
    { id: 'veneer-oak-rustic', label: 'Dýha Dub rustikální', color: '#b08a5a', roughness: 0.7, metalness: 0, category: 'veneer' },
    { id: 'veneer-teak', label: 'Dýha Teak', color: '#9b6b3d', roughness: 0.7, metalness: 0, category: 'veneer' },
    { id: 'veneer-cherry', label: 'Dýha Třešeň', color: '#b05d3e', roughness: 0.7, metalness: 0, category: 'veneer' },
    { id: 'veneer-maple', label: 'Dýha Javor', color: '#d9c3a1', roughness: 0.7, metalness: 0, category: 'veneer' },
    { id: 'veneer-elm', label: 'Dýha Jilm', color: '#a97a53', roughness: 0.7, metalness: 0, category: 'veneer' },
    { id: 'veneer-mahogany', label: 'Dýha Mahagon', color: '#8c4b3a', roughness: 0.7, metalness: 0, category: 'veneer' },
    { id: 'veneer-rosewood', label: 'Dýha Palisandr', color: '#6b3f32', roughness: 0.7, metalness: 0, category: 'veneer' },
];

export const HANDLE_FINISH_OPTIONS = [
    { id: 'stainless', label: 'Nerez', color: '#e2e8f0' },
    { id: 'black', label: 'Černá', color: '#111827' },
    { id: 'brass', label: 'Mosaz', color: '#b45309' },
    { id: 'gold', label: 'Zlatá', color: '#d4af37' },
];

export const BAR_LENGTH_OPTIONS = [300, 600, 900];

export const HINGE_OPTIONS = [
    { id: 'anselmi-160', label: 'ANSELMI 160', type: 'hidden', load: 80 },
    { id: 'tectus-340', label: 'TECTUS 340', type: 'hidden', load: 80 },
    { id: 'tectus-540', label: 'TECTUS 540', type: 'hidden', load: 120 },
];

export const HANDLE_OPTIONS = [
    { id: 'handle-standard', label: 'Klika Standard', type: 'handle', finish: 'Nerez' },
    { id: 'handle-black', label: 'Klika Černá', type: 'handle', finish: 'Černá' },
    { id: 'handle-minimal', label: 'Klika Minimal', type: 'handle', finish: 'Nerez' },
    { id: 'bar-600', label: 'Madlo 600 mm', type: 'bar', length: 600, finish: 'Nerez' },
    { id: 'bar-800', label: 'Madlo 800 mm', type: 'bar', length: 800, finish: 'Nerez' },
    { id: 'bar-1000', label: 'Madlo 1000 mm', type: 'bar', length: 1000, finish: 'Nerez' },
    { id: 'none', label: 'Bez', type: 'none' },
];

export const LOCK_OPTIONS = [
    { id: 'magnetic', label: 'Magnetický', type: 'magnetic' },
    { id: 'mechanical', label: 'Mechanický', type: 'mechanical' },
    { id: 'electronic', label: 'Elektronický', type: 'electronic' },
    { id: 'none', label: 'Bez', type: 'none' },
];

export const DROP_SEAL_OPTIONS = [
    { id: 'none', label: 'Bez', active: false },
    { id: 'standard', label: 'Standardní', height: 8, type: 'standard' },
    { id: 'acoustic', label: 'Akustický', height: 10, type: 'acoustic' },
    { id: 'fire', label: 'Protipožární', height: 12, type: 'fire' },
];

export const FINISH_CATEGORY_LABELS = {
    none: 'Bez povrchu',
    ral: 'RAL',
    ncs: 'NCS',
    hpl: 'HPL',
    veneer: 'Dýha',
};

export const XRAY_COLORS = {
    mdf: '#deb887', // BurlyWood
    prism: '#8b4513', // SaddleBrown
    honeycomb: '#ffdead', // NavajoWhite
    calibration: '#f0e68c', // Khaki
};

export const clampNumber = (value, min, max) => Math.min(Math.max(value, min), max);

export const getFinishType = (finishId) => {
    const finish = FINISH_PRESETS.find((item) => item.id === finishId) || FINISH_PRESETS[0];
    return finish.category || 'none';
};

export const getFinishById = (finishId) => FINISH_PRESETS.find((item) => item.id === finishId) || FINISH_PRESETS[0];

export const getHandleFinishById = (finishId) => HANDLE_FINISH_OPTIONS.find((item) => item.id === finishId) || HANDLE_FINISH_OPTIONS[0];

export const getFinishMaterialProps = (finish, colorOverride) => ({
    color: colorOverride || finish.color,
    roughness: finish.roughness ?? 0.6,
    metalness: finish.metalness ?? 0.1,
    clearcoat: finish.clearcoat ?? 0,
    transmission: finish.transmission ?? 0,
    transparent: (finish.opacity ?? 1) < 1 || (finish.transmission ?? 0) > 0,
    opacity: finish.opacity ?? 1,
});

export const calculateMaterialSummary = (config, appliedAiDraft = null) => {
    try {
        const {
            width, height, thickness: configThickness,
            topPanelEnabled, topPanelHeight,
            unifiedFinish, finishSideA, finishSideB, finishEdge, finishTopPanel,
            prisms: configPrisms,
            skin
        } = config;

        const thickness = appliedAiDraft ? appliedAiDraft.thickness : configThickness;
        const safeFinishSideA = finishSideA || FINISH_PRESETS[0].id;

        // 1) SURFACE BREAKDOWN & PAINT
        const sideArea = (width * height) / 1000000;
        const edgeArea = ((width * 2 + height * 2) * thickness) / 1000000;
        const topArea = (width * (topPanelHeight || 0)) / 1000000;
        const topEdgeArea = ((width * 2 + (topPanelHeight || 0) * 2) * 20) / 1000000; // Top panel always 20mm

        const surfaces = [
            { name: 'Přední strana (A)', id: safeFinishSideA, area: sideArea, overspray: !['hpl', 'none'].includes(getFinishType(safeFinishSideA)) },
            { name: 'Zadní strana (B)', id: unifiedFinish ? safeFinishSideA : (finishSideB || safeFinishSideA), area: sideArea, overspray: !['hpl', 'none'].includes(getFinishType(unifiedFinish ? safeFinishSideA : (finishSideB || safeFinishSideA))) },
            { name: 'Hrany křídla', id: unifiedFinish ? safeFinishSideA : (finishEdge || safeFinishSideA), area: edgeArea, overspray: !['hpl', 'none'].includes(getFinishType(unifiedFinish ? safeFinishSideA : (finishEdge || safeFinishSideA))) }
        ];

        if (topPanelEnabled) {
            const topFinishId = unifiedFinish ? safeFinishSideA : (finishTopPanel || safeFinishSideA);
            // Top panel painted only from one side (Side A)
            surfaces.push({ name: 'Nadpanel - plocha (A)', id: topFinishId, area: topArea, overspray: !['hpl', 'none'].includes(getFinishType(topFinishId)) });
            surfaces.push({ name: 'Nadpanel - hrany', id: topFinishId, area: topEdgeArea, overspray: !['hpl', 'none'].includes(getFinishType(topFinishId)) });
        }

        const surfaceSummary = surfaces.map(s => {
            try {
                const finish = getFinishById(s.id);
                const areaWithOverspray = s.overspray ? s.area * 1.9 : s.area;
                return {
                    ...s,
                    label: finish?.label || 'Neznámý',
                    category: finish?.category || 'none',
                    areaWithOverspray,
                    paintBaseGrams: s.overspray ? areaWithOverspray * 200 : 0,
                    paintTopGrams: s.overspray ? areaWithOverspray * 160 : 0
                };
            } catch (e) {
                console.warn("Failed to calculate surface summary for", s.name, e);
                return { ...s, label: 'Chyba', areaWithOverspray: 0, paintBaseGrams: 0, paintTopGrams: 0 };
            }
        });

        const totalAreaWithOverspray = surfaceSummary.reduce((sum, s) => sum + s.areaWithOverspray, 0);
        const totalPaintBase = surfaceSummary.reduce((sum, s) => sum + s.paintBaseGrams, 0);
        const totalPaintTop = surfaceSummary.reduce((sum, s) => sum + s.paintTopGrams, 0);

        // Group paint by finish for mixed configurations
        const paintGroups = [];
        surfaceSummary.forEach(s => {
            if (!s.overspray || s.areaWithOverspray <= 0) return;
            let group = paintGroups.find(g => g.finishName === s.label);
            if (!group) {
                group = { finishName: s.label, color: getFinishById(s.id)?.color || '#cccccc', baseGrams: 0, topGrams: 0, area: 0, parts: [], usage: [] };
                paintGroups.push(group);
            }
            group.baseGrams += s.paintBaseGrams;
            group.topGrams += s.paintTopGrams;
            group.area += s.areaWithOverspray;
            group.parts.push(s.name);
            if (!group.usage.includes(s.name)) {
                group.usage.push(s.name);
            }
        });

        // Add Base Paint as a separate group for UI completeness
        const totalBaseGrams = surfaceSummary.reduce((sum, s) => sum + (s.paintBaseGrams || 0), 0);
        if (totalBaseGrams > 0) {
            paintGroups.unshift({
                finishName: 'Základ (Bílá)',
                color: '#f8fafc', // Slate-50 (White-ish)
                baseGrams: totalBaseGrams,
                topGrams: 0,
                area: surfaceSummary.filter(s => s.overspray).reduce((sum, s) => sum + s.areaWithOverspray, 0),
                parts: ['Celý povrch'],
                usage: ['Podkladový nástřik'],
                isBase: true
            });
        }

        // 2) PRISM OPTIMIZATION (Bin Packing - First Fit Decreasing)
        const prismLength = 3000;
        const reserve = 10; // Reserve per cut
        const prismWidth = config.prismWidth || 33;

        // Define the required pieces - Perimetr based as requested
        const prismMultiplier = configPrisms || 2;
        const prismPieces = [
            { name: 'Křídlo - boky', count: 2 * prismMultiplier, length: height },
            { name: 'Křídlo - horní/spodní', count: 2 * prismMultiplier, length: width }
        ];

        // Top panel has no prisms (solid 20mm)

        // Flatten all required pieces into a single array of lengths
        let allPieces = [];
        prismPieces.forEach(p => {
            for (let i = 0; i < p.count; i++) {
                allPieces.push({ name: p.name, length: p.length, lengthWithReserve: p.length + reserve });
            }
        });

        // Sort by length descending (FFD heuristic)
        allPieces.sort((a, b) => b.lengthWithReserve - a.lengthWithReserve);

        const prismBars = [];

        allPieces.forEach(piece => {
            // Try to find a bar where this piece fits
            let fitted = false;
            for (let bar of prismBars) {
                if (bar.remaining >= piece.lengthWithReserve) {
                    bar.cuts.push(piece);
                    bar.remaining -= piece.lengthWithReserve;
                    fitted = true;
                    break;
                }
            }
            // If not fitted, start a new bar
            if (!fitted) {
                prismBars.push({
                    cuts: [piece],
                    remaining: prismLength - piece.lengthWithReserve,
                    capacity: prismLength
                });
            }
        });

        const usedLength = prismBars.reduce((sum, bar) => sum + (bar.capacity - bar.remaining), 0);
        const totalStockLength = prismBars.length * prismLength;
        const totalWasteMeters = (totalStockLength - usedLength) / 1000;
        const netLengthMeters = allPieces.reduce((acc, p) => acc + p.length, 0) / 1000;

        const prismSummary = {
            pieces: prismPieces,
            bars: prismBars,
            totalLengthMeters: totalStockLength / 1000,
            netLengthMeters: netLengthMeters,
            prismsNeeded: prismBars.length,
            standardLength: prismLength,
            totalWaste: totalWasteMeters,
            wastePercentage: totalStockLength > 0 ? (totalWasteMeters / (totalStockLength / 1000)) * 100 : 0
        };

        // 3) MDF LAYERS & LAYOUT
        const mdfCombo = appliedAiDraft && appliedAiDraft.combo ? appliedAiDraft.combo.combo : [];
        const layersPerSide = mdfCombo.length || 1;

        const sheetFormats = [
            { w: 2800, h: 2070, label: '2800x2070' },
            { w: 930, h: 2070, label: '930x2070' },
            { w: 2800, h: 1035, label: '2800x1035' }
        ];

        // Group pieces by thickness
        const piecesByThickness = {};
        const addMdfPiece = (name, w, h, thickness) => {
            if (!piecesByThickness[thickness]) piecesByThickness[thickness] = [];
            piecesByThickness[thickness].push({
                name,
                w: Math.round(w),
                h: Math.round(h),
                area: (w * h) / 1000000,
                thickness
            });
        };

        if (layersPerSide > 1) {
            mdfCombo.forEach((t, idx) => {
                const thicknessLabel = `${t} mm`;
                addMdfPiece(`Křídlo A (v${idx + 1})`, width, height, thicknessLabel);
                addMdfPiece(`Křídlo B (v${idx + 1})`, width, height, thicknessLabel);
                if (topPanelEnabled) {
                    const tH = topPanelHeight || 400;
                    addMdfPiece(`Nadp. A (v${idx + 1})`, width, tH, thicknessLabel);
                    addMdfPiece(`Nadp. B (v${idx + 1})`, width, tH, thicknessLabel);
                }
            });
        } else {
            const thicknessLabel = skin ? skin.replace('HDF ', '').replace('MDF ', '') : '6 mm';
            addMdfPiece('Křídlo A', width, height, thicknessLabel);
            addMdfPiece('Křídlo B', width, height, thicknessLabel);
            if (topPanelEnabled) {
                const tH = topPanelHeight || 400;
                addMdfPiece('Nadp. A', width, tH, thicknessLabel);
                addMdfPiece('Nadp. B', width, tH, thicknessLabel);
            }
        }

        const sheets = [];
        const kerf = 4;

        // Run optimization for each thickness separately
        const thicknessSummary = {};

        for (const thickness in piecesByThickness) {
            let remainingPieces = [...piecesByThickness[thickness]];
            thicknessSummary[thickness] = { sheets: 0, area: 0, labels: [] };

            while (remainingPieces.length > 0) {
                let bestSheetCase = null;

                for (const format of sheetFormats) {
                    // Shelf Packing Algorithm
                    let testItems = [];
                    let currentPieces = [...remainingPieces];
                    let packedIndices = [];

                    // Shelves logic
                    let shelves = [];
                    let currentY = 0;

                    while (currentPieces.length > 0) {
                        let shelfHeight = 0;
                        let currentX = 0;
                        let shelfPackedIndices = [];
                        let shelfItems = [];

                        for (let i = 0; i < currentPieces.length; i++) {
                            const piece = currentPieces[i];
                            if (!piece) continue;

                            let pw = piece.w;
                            let ph = piece.h;
                            let rotated = false;

                            // Try normal
                            if (pw + kerf <= format.w && currentY + ph + kerf <= format.h) {
                                // Fits normal
                            } else if (ph + kerf <= format.w && currentY + pw + kerf <= format.h) {
                                // Fits rotated
                                pw = piece.h;
                                ph = piece.w;
                                rotated = true;
                            } else {
                                continue;
                            }

                            // Can we add to current shelf?
                            if (currentX + pw + kerf <= format.w) {
                                shelfItems.push({
                                    ...piece,
                                    w: pw,
                                    h: ph,
                                    origW: piece.w,
                                    origH: piece.h,
                                    rotated,
                                    x: currentX,
                                    y: currentY
                                });
                                currentX += pw + kerf;
                                shelfHeight = Math.max(shelfHeight, ph);
                                shelfPackedIndices.push(i);
                            }
                        }

                        if (shelfItems.length > 0) {
                            testItems.push(...shelfItems);
                            // Remove packed from temporal list
                            shelfPackedIndices.sort((a, b) => b - a).forEach(idx => {
                                const pIdx = remainingPieces.indexOf(currentPieces[idx]);
                                if (pIdx !== -1) packedIndices.push(pIdx);
                                currentPieces.splice(idx, 1);
                            });
                            currentY += shelfHeight + kerf;
                        } else {
                            break; // Cannot fit more shelves
                        }
                    }

                    if (testItems.length > 0) {
                        const netArea = testItems.reduce((sum, it) => sum + it.area, 0);
                        const formatArea = (format.w * format.h) / 1000000;
                        const efficiency = netArea / formatArea;

                        if (!bestSheetCase || efficiency > bestSheetCase.efficiency || (efficiency === bestSheetCase.efficiency && testItems.length > bestSheetCase.items.length)) {
                            bestSheetCase = { format, items: testItems, packedIndices, efficiency };
                        }
                    }
                }

                if (!bestSheetCase) {
                    // Fallback for oversized piece
                    const piece = remainingPieces[0];
                    const sheet = {
                        format: sheetFormats[0],
                        items: [{ ...piece, x: 0, y: 0, rotated: false, w: piece.w, h: piece.h, origW: piece.w, origH: piece.h }],
                        efficiency: piece.area / ((sheetFormats[0].w * sheetFormats[0].h) / 1000000),
                        thickness
                    };
                    sheets.push(sheet);
                    thicknessSummary[thickness].sheets++;
                    thicknessSummary[thickness].labels.push(sheet.format.label);
                    remainingPieces.splice(0, 1);
                } else {
                    const sheet = {
                        format: bestSheetCase.format,
                        items: bestSheetCase.items,
                        efficiency: bestSheetCase.efficiency,
                        thickness
                    };
                    sheets.push(sheet);
                    thicknessSummary[thickness].sheets++;
                    thicknessSummary[thickness].labels.push(sheet.format.label);
                    // Remove packed pieces
                    bestSheetCase.packedIndices.sort((a, b) => b - a).forEach(idx => {
                        remainingPieces.splice(idx, 1);
                    });
                }
            }
        }

        const mdfTotalArea = sheets.reduce((sum, s) => sum + (s.format.w * s.format.h) / 1000000, 0);
        const mdfNetArea = Object.values(piecesByThickness).flat().reduce((sum, p) => sum + p.area, 0);
        const mdfWasteArea = mdfTotalArea - mdfNetArea;
        const mdfWastePercentage = mdfTotalArea > 0 ? (mdfWasteArea / mdfTotalArea) * 100 : 0;

        const mdfSummary = {
            sheets,
            totalArea: mdfTotalArea,
            netArea: mdfNetArea,
            wasteArea: mdfWasteArea,
            wastePercentage: mdfWastePercentage,
            thickness: Object.keys(piecesByThickness).join(' + '),
            byThickness: thicknessSummary
        };

        // 4) INFILL (VÝPLŇ)
        // Between prisms
        const frameW = prismWidth * prismMultiplier;
        const infillW = Math.max(0, width - 2 * frameW);
        const infillH = Math.max(0, height - 2 * frameW);
        const infillArea = (infillW * infillH) / 1000000;

        const infillSummary = {
            name: config.infill || 'Voština',
            w: infillW,
            h: infillH,
            area: infillArea,
            weight: (calculateDoorWeight(config, sideArea, prismSummary.netLengthMeters) - 10) * 0.4 // Purely indicative weight of infill component
        };

        return {
            surfaces: surfaceSummary,
            paintGroups,
            unifiedSurface: {
                isUnified: unifiedFinish,
                label: getFinishById(safeFinishSideA)?.label || 'Neznámý',
                totalArea: totalAreaWithOverspray,
                totalPaintBase,
                totalPaintTop
            },
            prisms: prismSummary,
            mdf: mdfSummary,
            infill: infillSummary,
            weight: calculateDoorWeight(config, sideArea, prismSummary.netLengthMeters)
        };

    } catch (e) {
        console.error("Critical error in calculateMaterialSummary:", e);
        return {
            surfaces: [],
            paintGroups: [],
            unifiedSurface: { isUnified: false, label: 'Chyba', totalArea: 0, totalPaintBase: 0, totalPaintTop: 0 },
            prisms: { pieces: [], bars: [], totalLengthMeters: 0, netLengthMeters: 0, prismsNeeded: 0, standardLength: 3000, totalWaste: 0, wastePercentage: 0 },
            mdf: { sheets: [], totalArea: 0, netArea: 0, wasteArea: 0, wastePercentage: 0, thickness: 'N/A', byThickness: {} },
            infill: { name: 'Chyba', w: 0, h: 0, area: 0, weight: 0 },
            weight: 0
        };
    }
};

export const calculateDoorWeight = (config, area, prismLength) => {
    // 1) MDF Skins weight
    // Area is roughly leafW * leafH. We have 2 skins.
    // thickness is config.sideMdf (e.g. 6mm)
    const mdfThicknessM = (config.sideMdf || 6) / 1000;
    const mdfDensity = 750; // kg/m^3
    const weightMDF = 2 * area * mdfThicknessM * mdfDensity;

    // 2) Prisms Frame weight
    // prismLength is in meters. Section is config.prism (e.g. 33) x prismThickness (e.g. 40)
    // Actually config.prism is the "internal depth" or width of prism?
    // Based on calculateMaterialSummary: prismThickness = (config.thickness - 2*sideMdf)
    const sideMdf = config.sideMdf || 6;
    const prismThkM = (config.thickness - 2 * sideMdf) / 1000;
    const prismWidthM = (config.prismWidth || 33) / 1000; // default 33 or 40
    const spruceDensity = 500; // kg/m^3
    const weightPrisms = prismLength * prismThkM * prismWidthM * spruceDensity;

    // 3) Infill weight
    // Density (kg/m^3)
    let infillDensity = 0;
    if (config.infill === 'Plná DTD') infillDensity = 650;
    else if (config.infill === 'Akustická') infillDensity = 400;
    else if (config.infill === 'Voština') infillDensity = 10; // Honeycomb is light

    // Area occupied by infill is roughly total area minus frame area.
    // Frame area = prismLength * prismWidthM.
    const infillArea = Math.max(0, area - (prismLength * prismWidthM));
    const weightInfill = infillArea * prismThkM * infillDensity;

    // 4) Hardware/Accessories constant
    const weightHardware = 2.5; // kg (lock, handle, hinges)

    return Math.round((weightMDF + weightPrisms + weightInfill + weightHardware) * 10) / 10;
};

export const getHingePositions = (leafH, hingesCount) => {
    const count = Math.max(0, parseInt(hingesCount) || 0);
    if (!count) return [];
    const maxOffset = Math.max(0.05, leafH / 2 - 0.05);
    const topOffset = Math.min(0.25, maxOffset);
    const bottomOffset = Math.min(0.25, maxOffset);
    const topY = leafH / 2 - topOffset;
    const bottomY = -leafH / 2 + bottomOffset;
    if (count === 1) return [0];
    if (count === 2) return [bottomY, topY];
    const step = (topY - bottomY) / (count - 1);
    return Array.from({ length: count }, (_, i) => bottomY + step * i);
};
