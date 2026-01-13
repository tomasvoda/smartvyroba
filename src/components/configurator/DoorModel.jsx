import React, { useMemo } from 'react';
import * as THREE from 'three';
import DoorLeaf from './DoorLeaf';
import { Wall, DimensionLine } from './SceneElements';
import { GAP_DEFAULTS, getFinishById, getFinishMaterialProps, XRAY_COLORS } from './utils';

// --- PROCEDURAL TEXTURES (Defined outside to ensure stability) ---

const createVeneerTexture = (hex) => {
    // Use seeded random based on hex color to ensure deterministic texture per material
    const base = hex.replace('#', '');
    const seed = parseInt(base, 16) % 1000 || 1;
    const rand = (() => {
        let x = seed;
        return () => {
            x = (x * 1664525 + 1013904223) % 4294967296;
            return x / 4294967296;
        };
    })();

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024; // Vertical grain
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = hex;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Parse base color for adjustments
    const rExact = parseInt(base.substring(0, 2), 16);
    const gExact = parseInt(base.substring(2, 4), 16);
    const bExact = parseInt(base.substring(4, 6), 16);

    // Vertical grain lines
    for (let x = 0; x < canvas.width; x += 1) {
        const noise = rand() * 0.15;
        const wave = Math.sin((x / 60) + rand() * 2) * 15;

        // Subtle dark grain lines
        if (rand() > 0.92) {
            const darkened = 0.85 - rand() * 0.1;
            ctx.fillStyle = `rgb(${Math.min(255, rExact * darkened)}, ${Math.min(255, gExact * darkened)}, ${Math.min(255, bExact * darkened)})`;
            ctx.fillRect(x, 0, 1 + rand() * 2, canvas.height);
        }

        // General fiber variations
        const factor = 0.9 + noise + (Math.sin(x / 5) * 0.05);
        ctx.fillStyle = `rgba(${rExact}, ${gExact}, ${bExact}, 0.15)`;
        ctx.fillRect(x, 0, 1, canvas.height);
    }

    // Overlay pores
    for (let i = 0; i < 2000; i++) {
        const px = rand() * canvas.width;
        const py = rand() * canvas.height;
        const pl = 2 + rand() * 10;
        ctx.fillStyle = `rgba(0,0,0,0.08)`;
        ctx.fillRect(px, py, 1, pl);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    texture.anisotropy = 16;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
};

const createHplTexture = (hex) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = hex;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const base = hex.replace('#', '');
    const seed = parseInt(base, 16) % 1000;
    const rand = (() => {
        let x = seed;
        return () => {
            x = (x * 1103515245 + 12345) % 2147483647;
            return x / 2147483647;
        };
    })();

    for (let i = 0; i < 4000; i += 1) {
        const x = rand() * canvas.width;
        const y = rand() * canvas.height;
        const alpha = rand() * 0.06;
        ctx.fillStyle = `rgba(0,0,0,${alpha})`;
        ctx.fillRect(x, y, 1, 1);
    }
    for (let i = 0; i < 1200; i += 1) {
        const x = rand() * canvas.width;
        const y = rand() * canvas.height;
        const alpha = rand() * 0.04;
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fillRect(x, y, 1, 1);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2.5, 2.5);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
};

const createHoneycombTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffdead';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = '#d2b48c';
    ctx.lineWidth = 3;
    const step = 40;
    for (let i = -512; i < 1024; i += step) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 512, 512);
        ctx.stroke();
    }
    for (let i = -512; i < 1024; i += step) {
        ctx.beginPath();
        ctx.moveTo(i + 512, 0);
        ctx.lineTo(i, 512);
        ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 8);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
};

const createDtdTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#deb887';
    ctx.fillRect(0, 0, 512, 512);
    let x_seed = 12345;
    const rand = () => {
        x_seed = (x_seed * 1103515245 + 12345) % 2147483647;
        return x_seed / 2147483647;
    };
    for (let i = 0; i < 20000; i++) {
        ctx.fillStyle = rand() > 0.5 ? '#cd853f' : '#f5deb3';
        const s = 1 + rand() * 3;
        ctx.fillRect(rand() * 512, rand() * 512, s, s);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
};

const createAcousticTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f0e68c';
    ctx.fillRect(0, 0, 512, 512);
    let x_seed = 98765;
    const rand = () => {
        x_seed = (x_seed * 1103515245 + 12345) % 2147483647;
        return x_seed / 2147483647;
    };
    ctx.fillStyle = '#8b4513';
    const dist = 32;
    for (let y = 0; y < 512; y += dist) {
        for (let x = 0; x < 512; x += dist) {
            if (rand() > 0.1) {
                ctx.beginPath();
                ctx.arc(x + (y % 64 ? 16 : 0), y, 6, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 4);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
};

const DoorModel = ({ config, showInternal, showDrawing, showWall, showShells, showAccessories }) => {
    const {
        thickness = 45, height = 1970, width = 800,
        colorSideA = '#ffffff', colorSideB = '#ffffff', colorEdge = '#ffffff', colorTopPanel = '#ffffff',
        prisms = 2, infill = 'Voština',
        hingesType = 'TECTUS 340', hingesCount = 3, handleType = 'handle-standard',
        handleFinish = 'nerez', handleLength = 600,
        rosette = false, dropSeal = false, orientation = 'Levé dovnitř', rebateType = 'Standardní falc 12/14 mm', cableGrommet = false,
        topPanelEnabled = false, topPanelHeight = 400,
        lockType = 'Magnetický',
        finishSideA = 'none', finishSideB = 'none', finishEdge = 'none', finishTopPanel = 'none',
        rebateWidth = 14, rebateDepth = 12
    } = config || {};

    const clearH = height / 1000;
    const clearW = width / 1000;
    const t = thickness / 1000;
    const skinT = 0.003;

    const orientationStr = orientation || 'Levé dovnitř';
    const isRight = orientationStr.includes('Pravé');
    const hingeSide = isRight ? 1 : -1;
    const handleSide = -hingeSide;
    const isDouble = config.leafType === 'Dvoukřídlé';

    const isFlush = config.isFlush;
    const isNoTop = config.rebateType === 'Bez horního falce';

    const gapSide = GAP_DEFAULTS.side / 1000;
    const gapTop = (topPanelEnabled ? 0 : GAP_DEFAULTS.top) / 1000;
    const gapBottom = (dropSeal ? GAP_DEFAULTS.bottomWithDropSeal : GAP_DEFAULTS.bottom) / 1000;
    const meetingGap = isDouble ? GAP_DEFAULTS.meeting / 1000 : 0;

    const leafW = Math.max(0.2, clearW - 2 * gapSide);
    const leafH = clearH - gapTop - gapBottom;
    const leafSingleW = isDouble ? Math.max(0.2, (leafW - meetingGap) / 2) : leafW;

    const topPanelH = topPanelEnabled ? (topPanelHeight || 400) / 1000 : 0;

    // Position everything relative to the center of the total assembly
    const panelGap = 0.005; // 5mm gap requested
    const totalHeight = leafH + gapBottom + (topPanelEnabled ? (panelGap + topPanelH) : 0);

    // floor is at -0.3 in SceneElements.jsx Wall component
    // keep 5mm visual gap above floor for clearance
    const doorGroupY = -0.3 - gapBottom + 0.005;

    // Leaf center relative to group center
    const leafYOffset = gapBottom + leafH / 2;

    // Top panel center relative to group center
    const panelY = gapBottom + leafH + panelGap + topPanelH / 2;

    const leafWidthMm = Math.round(leafW * 1000);
    const leafSingleWidthMm = Math.round(leafSingleW * 1000);
    const leafHeightMm = Math.round(leafH * 1000);
    const totalClearH = clearH + (topPanelEnabled ? topPanelH : 0);



    const openDir = orientationStr.includes('ven') ? -1 : 1;
    const openAngleValue = Number.isFinite(config.openAngle) ? config.openAngle : 12;
    const baseOpenAngle = showDrawing ? 0 : (openAngleValue || 0) * (Math.PI / 180);
    const getOpenAngle = (side) => baseOpenAngle * openDir * (side === 1 ? -1 : 1);
    const finishA = getFinishById(finishSideA);
    const finishB = getFinishById(finishSideB);
    const finishE = getFinishById(finishEdge);
    const finishP = getFinishById(config.unifiedFinish ? finishSideA : (finishTopPanel || finishSideA));




    const veneerMapA = useMemo(() => (finishA.category === 'veneer' ? createVeneerTexture(finishA.color) : null), [finishA.category, finishA.color]);
    const veneerMapB = useMemo(() => (finishB.category === 'veneer' ? createVeneerTexture(finishB.color) : null), [finishB.category, finishB.color]);
    const veneerMapE = useMemo(() => (finishE.category === 'veneer' ? createVeneerTexture(finishE.color) : null), [finishE.category, finishE.color]);
    const veneerMapP = useMemo(() => (finishP.category === 'veneer' ? createVeneerTexture(finishP.color) : null), [finishP.category, finishP.color]);
    const hplMapA = useMemo(() => (finishA.category === 'hpl' ? createHplTexture(finishA.color) : null), [finishA.category, finishA.color]);
    const hplMapB = useMemo(() => (finishB.category === 'hpl' ? createHplTexture(finishB.color) : null), [finishB.category, finishB.color]);
    const hplMapE = useMemo(() => (finishE.category === 'hpl' ? createHplTexture(finishE.color) : null), [finishE.category, finishE.color]);
    const hplMapP = useMemo(() => (finishP.category === 'hpl' ? createHplTexture(finishP.color) : null), [finishP.category, finishP.color]);

    const infillMaterialProps = useMemo(() => {
        if (!showInternal) return null;

        const infillLower = (infill || '').toLowerCase();

        if (infillLower.includes('voštin') || infillLower === 'honeycomb') {
            return { map: createHoneycombTexture() };
        }
        if (infillLower.includes('dtd') || infillLower.includes('plná')) {
            return { map: createDtdTexture() };
        }
        if (infillLower.includes('akustick')) {
            return { map: createAcousticTexture() };
        }

        // Default honeycomb
        return { map: createHoneycombTexture() };
    }, [infill, showInternal]);

    const materialSideA = { ...getFinishMaterialProps(finishA, (veneerMapA || hplMapA) ? '#ffffff' : (finishSideA === 'custom' ? colorSideA : undefined)), map: veneerMapA || hplMapA };
    const materialSideB = { ...getFinishMaterialProps(finishB, (veneerMapB || hplMapB) ? '#ffffff' : (finishSideB === 'custom' ? colorSideB : undefined)), map: veneerMapB || hplMapB };
    const materialEdge = { ...getFinishMaterialProps(finishE, (veneerMapE || hplMapE) ? '#ffffff' : (finishEdge === 'custom' ? colorEdge : undefined)), map: veneerMapE || hplMapE };
    const panelMaterial = { ...getFinishMaterialProps(finishP, (veneerMapP || hplMapP) ? '#ffffff' : (finishTopPanel === 'custom' ? colorTopPanel : undefined)), map: veneerMapP || hplMapP };
    const profileStr = (config.frameProfile || '').toLowerCase();
    const isFortius = profileStr.includes('fortius');
    const panelPrismBand = isFortius ? 0.04 : 0.033;
    const panelPrismDepthDesired = isFortius ? 0.033 : 0.04;
    const panelPrismDepth = Math.min(Math.max(0.001, t - 2 * skinT), panelPrismDepthDesired);
    const panelInset = 0.001;


    return (
        <group>
            {showWall && <Wall height={topPanelEnabled ? height + topPanelHeight : height} width={width} />}

            <group position={[0, doorGroupY, 0]}>
                <DoorLeaf
                    leafW={leafW}
                    leafH={leafH}
                    leafYOffset={leafYOffset}
                    t={t}
                    skinT={skinT}
                    hingesType={hingesType}
                    hingesCount={hingesCount} // Default recommendation handled in UI
                    handleType={handleType}
                    handleFinish={handleFinish}
                    handleLength={handleLength}
                    frameProfile={config.frameProfile}
                    rosette={rosette}
                    dropSeal={dropSeal}
                    cableGrommet={cableGrommet}
                    lockType={lockType}
                    lockFinish={config.lockFinish} // Pass lockFinish
                    prisms={prisms}
                    infill={infill}
                    isFlush={isFlush}
                    isNoTop={isNoTop}
                    hingeSide={hingeSide}
                    handleSide={handleSide}
                    showInternal={showInternal}
                    showAccessories={showAccessories}
                    openAngle={getOpenAngle(hingeSide)}
                    materialSideA={materialSideA}
                    materialSideB={materialSideB}
                    materialEdge={materialEdge}
                    showShells={showShells}
                    rebateDepth={rebateDepth}
                    infillMaterial={infillMaterialProps}
                    openDir={openDir}
                />

                {topPanelEnabled && (
                    <group position={[0, panelY, -t / 2]}>
                        {!showInternal ? (
                            <mesh receiveShadow castShadow>
                                <boxGeometry args={[clearW, topPanelH, t]} />
                                <meshStandardMaterial {...panelMaterial} />
                            </mesh>
                        ) : (
                            <group>
                                {/* Top Panel Perimeter Prisms */}
                                {/* Top */}
                                <mesh position={[0, topPanelH / 2 - panelPrismBand / 2, 0]}>
                                    <boxGeometry args={[clearW, panelPrismBand, panelPrismDepth]} />
                                    <meshStandardMaterial color={XRAY_COLORS.prism} />
                                </mesh>
                                {/* Bottom */}
                                <mesh position={[0, -topPanelH / 2 + panelPrismBand / 2, 0]}>
                                    <boxGeometry args={[clearW, panelPrismBand, panelPrismDepth]} />
                                    <meshStandardMaterial color={XRAY_COLORS.prism} />
                                </mesh>
                                {/* Left */}
                                <mesh position={[-clearW / 2 + panelPrismBand / 2, 0, 0]}>
                                    <boxGeometry args={[panelPrismBand, topPanelH - 2 * panelPrismBand, panelPrismDepth]} />
                                    <meshStandardMaterial color={XRAY_COLORS.prism} />
                                </mesh>
                                {/* Right */}
                                <mesh position={[clearW / 2 - panelPrismBand / 2, 0, 0]}>
                                    <boxGeometry args={[panelPrismBand, topPanelH - 2 * panelPrismBand, panelPrismDepth]} />
                                    <meshStandardMaterial color={XRAY_COLORS.prism} />
                                </mesh>

                                {/* Honeycomb Infill (always) */}
                                <mesh>
                                    <boxGeometry args={[
                                        Math.max(0.01, clearW - 2 * panelPrismBand),
                                        Math.max(0.01, topPanelH - 2 * panelPrismBand),
                                        panelPrismDepth
                                    ]} />
                                    <meshStandardMaterial
                                        color={infillMaterialProps?.map ? '#ffffff' : XRAY_COLORS.honeycomb}
                                        map={infillMaterialProps?.map || null}
                                        transparent
                                        opacity={infillMaterialProps?.map ? 0.9 : 0.6}
                                    />
                                </mesh>
                            </group>
                        )}
                    </group>
                )}
            </group>



            {showDrawing && (
                <group position={[0, 0, t + 0.1]}>
                    <DimensionLine
                        start={[-clearW / 2, totalClearH / 2 + 0.12, 0]}
                        end={[clearW / 2, totalClearH / 2 + 0.12, 0]}
                        label={`Světlost ${width} mm`}
                    />
                    <DimensionLine
                        start={[-leafW / 2, totalClearH / 2 + 0.07, 0]}
                        end={[leafW / 2, totalClearH / 2 + 0.07, 0]}
                        label={`Křídlo ${isDouble ? `2x ${leafSingleWidthMm}` : leafWidthMm} mm`}
                    />
                    <DimensionLine
                        start={[clearW / 2 + 0.1, doorGroupY, 0]}
                        end={[clearW / 2 + 0.1, doorGroupY + totalHeight, 0]}
                        label={`Celkem ${Math.round(totalHeight * 1000)} mm`}
                        vertical
                    />
                    <DimensionLine
                        start={[clearW / 2 + 0.16, doorGroupY + gapBottom, 0]}
                        end={[clearW / 2 + 0.16, doorGroupY + gapBottom + leafH, 0]}
                        label={`Křídlo ${leafHeightMm} mm`}
                        vertical
                    />
                    <DimensionLine
                        start={[clearW / 2 + 0.28, -totalClearH / 2, t / 2]}
                        end={[clearW / 2 + 0.28, -totalClearH / 2, -t / 2]}
                        label={`Tloušťka ${thickness} mm`}
                    />
                    {topPanelEnabled && topPanelH > 0 && (
                        <DimensionLine
                            start={[clearW / 2 + 0.22, doorGroupY + totalHeight - topPanelH, 0]}
                            end={[clearW / 2 + 0.22, doorGroupY + totalHeight, 0]}
                            label={`Nadpanel ${topPanelHeight} mm`}
                            vertical
                        />
                    )}
                </group>
            )}
        </group>
    );
};

export default DoorModel;
