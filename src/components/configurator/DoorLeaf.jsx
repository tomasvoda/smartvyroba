import { getHingePositions, getHandleFinishById, XRAY_COLORS } from './utils';

const DoorLeaf = ({
    leafW,
    leafH,
    leafYOffset,
    t,
    skinT,
    hingesCount,
    handleType,
    handleFinish,
    handleLength,
    frameProfile,
    rosette,
    dropSeal,
    cableGrommet,
    lockType,
    prisms,
    isNoTop,
    hingeSide,
    handleSide,
    showInternal,
    showAccessories,
    openAngle,
    materialSideA,
    materialSideB,
    materialEdge,
    showShells = true,
    rebateWidth,
    rebateDepth,
    isFlush,
    infillMaterial, // New prop for textured XRAY
    lockFinish, // Added lockFinish prop
    openDir = 1, // 1 = dovnitř (lip on Front), -1 = ven (lip on Back)
}) => {
    const handleInset = 0.06;
    const edgeProtrusion = 0.001;
    const hingePositions = getHingePositions(leafH, hingesCount);

    const handleH = Math.min(1.05, leafH - 0.1);
    const prismCount = Math.max(1, parseInt(prisms) || 1);
    const profileStr = (frameProfile || '').toLowerCase();
    const isFortius = profileStr.includes('fortius');
    const prismBand = isFortius ? 0.04 : 0.033;
    const prismDepthDesired = isFortius ? 0.033 : 0.04;
    const internalDepth = Math.max(0.001, t - 2 * skinT);
    const prismDepth = Math.min(internalDepth, prismDepthDesired);
    const edgeInset = 0.001;
    const prismOffsets = Array.from({ length: prismCount }, (_, i) => i * (prismBand));

    const rebateWidthM = Math.max(0, (rebateWidth || 0) / 1000);
    const rebateDepthM = Math.max(0, (rebateDepth || 0) / 1000);

    const matA = { ...materialSideA, roughness: 0.3 };
    const matB = { ...materialSideB, roughness: 0.3 };
    const matEdge = { ...materialEdge, roughness: 0.3 };

    // REBATE LOGIC: Body (inner) vs Lip (outer)
    // A standard rebate is typically 12-14mm on 3 sides (Left, Right, Top).
    // width: -12mm from each side = -24mm total
    // height: -12mm from top (bottom stays at 0)
    // Lip is the full size (ledge)
    const lipW = leafW;
    const lipH = leafH;

    // Body is the plug that enters the frame. 
    // It's smaller in Width and Height.
    // Width: subtract 12mm from left and 12mm from right = 24mm total.
    // Height: subtract 12mm from top.
    const bodyW = leafW - 0.024;
    // Rebate Logic Updates
    // Body Height: If No Top Rebate, Body is full height. Else, it's shortened by rebate depth (12mm).
    const bodyH = isNoTop ? leafH : leafH - 0.012;

    // Body Y Position:
    // If Standard: -0.006 (shifted down by half of 12mm rebate)
    // If No Top Rebate: 0 (centered)
    const bodyY = isNoTop ? 0 : -0.006;

    // Accessories Visibility: Hide in X-Ray (showInternal)
    const effectiveShowAccessories = showAccessories && !showInternal;

    const isLipOnFront = openDir === -1; // REVERSED: Lip is on the side it closes against
    // Body is the part that goes into frame. Lip is the overhang.
    // Body has reduced width/height. Lip has full width/height (minus top if isNoTop).

    // const bodyW = isFlush ? leafW : leafW - 2 * rebateWidthM; // Old definition
    // const bodyH = isFlush ? leafH : (isNoTop ? leafH : leafH - rebateWidthM); // Old definition
    // const lipW = leafW; // Old definition
    // const lipH = (isNoTop && !isFlush) ? leafH - rebateWidthM : leafH; // Old definition

    // Z positions: Lip is the ledge, Body is the part that enters frame.
    // To show the rebate STEP at the front, we align them at the BACK face.
    // Back face is at -t/2.
    // Body (thickness t) center at 0 covers [-t/2, t/2].
    // Lip (thickness t - d) center at -d/2 covers [-t/2, t/2 - d].
    // This creates a 'd' mm step at the front.

    // If openDir = 1 (opens towards user), ledge is on Front. Align at Back.
    // If openDir = -1 (opens away), ledge is on Back. Align at Front.
    const effectiveRebateDepthM = isFlush ? 0 : rebateDepthM;
    const lipT = Math.max(0.001, t - effectiveRebateDepthM);
    const bodyT = t;

    // Z positions: Align at the BACK face if Lip is on Front.
    // Back face is -t/2. 
    // Body (thickness t) is at [ -t/2, t/2 ], center 0.
    // Lip (thickness lipT) starts at -t/2, center is at -t/2 + lipT/2.
    // If Lip is on Front, it's at the POSITIVE Z side. Align at Back (-t/2).
    // Let's simplify: Body is the main part. Lip is the ledge.
    const lipZ = isLipOnFront ? (t - lipT) / 2 : -(t - lipT) / 2;
    const edgeCenterZ = isFlush ? 0 : lipZ;
    const bodyZ = 0;

    const angleSign = Math.sign(openAngle) || 1;
    const absAngle = Math.abs(openAngle);
    const limitedAbs = absAngle > 0.01 ? Math.max(absAngle, 0.26) : 0;
    const finalAngle = angleSign * limitedAbs;

    const ringDirection = handleSide || 1;
    const safeLockFinish = lockFinish ? (lockFinish === 'black' ? '#111827' : '#e2e8f0') : '#e2e8f0';

    // Materials for multi-material boxes
    const materialsBody = [
        matEdge, matEdge, matEdge, matEdge,
        matA, matB
    ];
    const materialsLip = [
        matEdge, matEdge, matEdge, matEdge,
        matA, matB
    ];

    return (
        <group position={[hingeSide * (leafW / 2), leafYOffset, -t / 2]} rotation={[0, finalAngle, 0]}>
            <group position={[-hingeSide * (leafW / 2), 0, 0]}>
                {/* 1) Internal Structure (Infill / Prisms) - ONLY IN XRAY */}
                {showInternal && (
                    <group>
                        {/* Infill */}
                        <mesh position={[0, 0, 0]}>
                            <boxGeometry args={[
                                Math.max(0.01, leafW - 2 * (edgeInset + prismCount * prismBand)),
                                Math.max(0.01, leafH - 2 * (edgeInset + prismCount * prismBand)),
                                prismDepth
                            ]} />
                            <meshStandardMaterial
                                color={infillMaterial?.map ? '#ffffff' : '#dcbfa3'}
                                map={infillMaterial?.map ? infillMaterial.map.clone() : null}
                                key={infillMaterial?.map?.uuid || 'no-map'}
                                transparent
                                opacity={infillMaterial?.map ? 0.9 : 0.95}
                                roughness={0.8}
                            />
                        </mesh>

                        {/* Prisms */}
                        {prismOffsets.map((offset, idx) => (
                            <group key={`prism-${idx}`}>
                                <mesh position={[0, leafH / 2 - edgeInset - prismBand / 2 - offset, 0]}>
                                    <boxGeometry args={[leafW - 2 * edgeInset, prismBand, prismDepth]} />
                                    <meshStandardMaterial color={XRAY_COLORS.prism} />
                                </mesh>
                                <mesh position={[0, -leafH / 2 + edgeInset + prismBand / 2 + offset, 0]}>
                                    <boxGeometry args={[leafW - 2 * edgeInset, prismBand, prismDepth]} />
                                    <meshStandardMaterial color={XRAY_COLORS.prism} />
                                </mesh>
                                <mesh position={[-leafW / 2 + edgeInset + prismBand / 2 + offset, 0, 0]}>
                                    <boxGeometry args={[prismBand, leafH - 2 * edgeInset, prismDepth]} />
                                    <meshStandardMaterial color={XRAY_COLORS.prism} />
                                </mesh>
                                <mesh position={[leafW / 2 - edgeInset - prismBand / 2 - offset, 0, 0]}>
                                    <boxGeometry args={[prismBand, leafH - 2 * edgeInset, prismDepth]} />
                                    <meshStandardMaterial color={XRAY_COLORS.prism} />
                                </mesh>
                            </group>
                        ))}

                        {/* MDF Shells for XRAY */}
                        <group>
                            <mesh position={[0, 0, prismDepth / 2 + 0.001]}>
                                <boxGeometry args={[leafW - 0.002, leafH - 0.002, 0.001]} />
                                <meshStandardMaterial color={XRAY_COLORS.mdf} transparent opacity={0.3} />
                            </mesh>
                            <mesh position={[0, 0, -(prismDepth / 2 + 0.001)]}>
                                <boxGeometry args={[leafW - 0.002, leafH - 0.002, 0.001]} />
                                <meshStandardMaterial color={XRAY_COLORS.mdf} transparent opacity={0.3} />
                            </mesh>
                        </group>
                    </group>
                )}

                {/* 2) Outer Shells (Visible Leaf) - HIDDEN IN XRAY */}
                {!showInternal && (
                    <group>
                        {isFlush ? (
                            <mesh castShadow receiveShadow>
                                <boxGeometry args={[leafW, leafH, t]} />
                                <meshStandardMaterial attach="material-0" {...matEdge} />
                                <meshStandardMaterial attach="material-1" {...matEdge} />
                                <meshStandardMaterial attach="material-2" {...matEdge} />
                                <meshStandardMaterial attach="material-3" {...matEdge} />
                                <meshStandardMaterial attach="material-4" {...matA} />
                                <meshStandardMaterial attach="material-5" {...matB} />
                            </mesh>
                        ) : (
                            /* REBATED DOOR */
                            <group>
                                {/* Body Part (The plug that enters the frame) */}
                                {/* Body Part (The plug that enters the frame) */}
                                <mesh position={[0, bodyY, bodyZ]} castShadow receiveShadow>
                                    <boxGeometry args={[bodyW, bodyH, bodyT]} />
                                    <meshStandardMaterial attach="material-0" {...matEdge} />
                                    <meshStandardMaterial attach="material-1" {...matEdge} />
                                    <meshStandardMaterial attach="material-2" {...matEdge} />
                                    <meshStandardMaterial attach="material-3" {...matEdge} />
                                    <meshStandardMaterial attach="material-4" {...matA} />
                                    <meshStandardMaterial attach="material-5" {...matB} />
                                </mesh>

                                {/* Lip Part (The full-size ledge) */}
                                <mesh position={[0, 0, lipZ]} castShadow receiveShadow>
                                    <boxGeometry args={[lipW, lipH, lipT]} />
                                    <meshStandardMaterial attach="material-0" {...matEdge} />
                                    <meshStandardMaterial attach="material-1" {...matEdge} />
                                    <meshStandardMaterial attach="material-2" {...matEdge} />
                                    <meshStandardMaterial attach="material-3" {...matEdge} />
                                    <meshStandardMaterial attach="material-4" {...matA} />
                                    <meshStandardMaterial attach="material-5" {...matB} />
                                </mesh>
                            </group>
                        )}
                    </group>
                )}

                {/* MDF Shells / Skins for XRAY toggling */}
                {/* We need to separate these if we want to hide them completely in xray mode instead of transparent */}
                {/* ACTUALLY, checking the code above, the skins are standard meshes. We can just control their visibility or existence. */}

                {/* ACCESSORIES - MOVED INSIDE THE LEAF GROUP */}
                <group visible={effectiveShowAccessories}>
                    {/* HANDLE / BAR LOGIC */}
                    {(() => {
                        const safeHandleType = handleType || 'none';
                        const isBar = safeHandleType.toLowerCase().includes('bar') || safeHandleType.toLowerCase().includes('madlo');
                        const normalizedHandleType = safeHandleType === 'Bez'
                            ? 'none'
                            : isBar
                                ? 'bar'
                                : safeHandleType.toLowerCase().includes('klika')
                                    ? 'handle'
                                    : safeHandleType;

                        const finish = getHandleFinishById(handleFinish);
                        const handleColor = finish.color;
                        // Parse bar length from string like "bar-300" or use default
                        const barMatch = (safeHandleType || '').match(/bar-(\d+)/i);
                        const barLengthVal = barMatch ? parseInt(barMatch[1]) : (handleLength || 600);
                        const barLength = barLengthVal / 1000;
                        const barRadius = 0.008;
                        const mountRadius = 0.007;
                        const spindleLength = 0.06;
                        const lockThickness = 0.001; // 1 mm proud of the edge
                        const lockFaceplateThickness = 0.002;
                        const lockEdgeWidth = 0.02;
                        const lockHeight = 0.14;
                        const rosetteRadius = 0.025;
                        const rosetteThickness = 0.005;
                        const HANDLE_REACH = 0.11;

                        // Bar Position adjustments
                        // Bar Center = handleH.
                        // Bar Top = handleH + barLength/2.
                        // Bar Bottom = handleH - barLength/2.
                        // Rosette Y aligned to bar axis for bars.
                        const rosetteY = handleH;

                        const renderHandleSide = (sideSign, zSign) => {
                            if (normalizedHandleType === 'none') return null;
                            if (isBar) {
                                return (
                                    <group position={[sideSign * (leafW / 2 - 0.14), handleH - leafH / 2, zSign * (t / 2 + 0.003)]}>
                                        {/* Top Mount - Extended to door */}
                                        <mesh position={[0, barLength / 2 - 0.06, zSign * 0.014]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                                            <cylinderGeometry args={[mountRadius, mountRadius, 0.04, 24]} />
                                            <meshStandardMaterial color={handleColor} metalness={0.92} roughness={0.08} />
                                        </mesh>
                                        {/* Bottom Mount - Extended to door */}
                                        <mesh position={[0, -barLength / 2 + 0.06, zSign * 0.014]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                                            <cylinderGeometry args={[mountRadius, mountRadius, 0.04, 24]} />
                                            <meshStandardMaterial color={handleColor} metalness={0.92} roughness={0.08} />
                                        </mesh>
                                        <mesh position={[0, 0, zSign * 0.03]} castShadow>
                                            <cylinderGeometry args={[barRadius, barRadius, barLength, 28]} />
                                            <meshStandardMaterial color={handleColor} metalness={0.92} roughness={0.08} />
                                        </mesh>
                                    </group>
                                );
                            }
                            const handleDirection = -sideSign;
                            // Unified Handle Component
                            // Handle moved 50mm (0.05) from surface as requested
                            // Unified Handle Component
                            // Handle moved 50mm (0.05) from surface as requested by USER
                            const handleZOffset = 0.05;
                            return (
                                <group
                                    position={[sideSign * (leafW / 2 - handleInset), handleH - leafH / 2, zSign * (t / 2 + handleZOffset)]}
                                    rotation={[0, 0, 0]}
                                >
                                    {/* Neck/Pivot - Connecting handle to rosette - EXTENDED TO REACH DOOR */}
                                    {/* HandleZOffset is 0.05. t/2 is the surface. We are at t/2 + handleZOffset. */}
                                    {/* We need a cylinder from local Z=0 (handle axis) back to local Z = -handleZOffset */}
                                    <mesh castShadow position={[0, 0, -zSign * (handleZOffset / 2)]} rotation={[Math.PI / 2, 0, 0]}>
                                        <cylinderGeometry args={[0.01, 0.01, handleZOffset, 16]} />
                                        <meshStandardMaterial color={handleColor} metalness={0.92} roughness={0.15} />
                                    </mesh>

                                    {/* Lever - The actual handle lever */}
                                    <group position={[0, 0, 0]}>
                                        <mesh castShadow position={[handleDirection * (HANDLE_REACH / 2 - 0.01), 0, 0]}>
                                            <boxGeometry args={[HANDLE_REACH, 0.018, 0.012]} />
                                            <meshStandardMaterial color={handleColor} metalness={0.92} roughness={0.15} />
                                        </mesh>
                                        {/* Grip detail at the end - FLAT/BEVELED CYLINDER (Not rounded) */}
                                        <mesh castShadow position={[handleDirection * (HANDLE_REACH - 0.01), 0, 0]} rotation={[zSign * Math.PI / 2, 0, 0]}>
                                            <cylinderGeometry args={[0.009, 0.009, 0.012, 6]} />
                                            <meshStandardMaterial color={handleColor} metalness={0.92} roughness={0.15} />
                                        </mesh>
                                    </group>
                                    {/* Rosette - Base (moved back towards door) - VISUALLY CONNECTED */}
                                    {/* It needs to sit at surface. Local Z is (t/2 + 0.05). Surface is at (t/2). Difference is 0.05. */}
                                    <mesh castShadow position={[0, 0, -zSign * (handleZOffset)]} rotation={[Math.PI / 2, 0, 0]}>
                                        <cylinderGeometry args={[rosetteRadius, rosetteRadius, rosetteThickness, 32]} />
                                        <meshStandardMaterial color={handleColor} metalness={0.92} roughness={0.15} />
                                    </mesh>
                                </group>
                            );
                        };

                        return (
                            <>
                                {renderHandleSide(handleSide, 1)}
                                {renderHandleSide(handleSide, -1)}

                                {/* Lock Mechanism (Internal) - Centered on Body thickness (Z=0) */}
                                {lockType !== 'Bez' && (
                                    <mesh
                                        position={[handleSide * (leafW / 2 + edgeProtrusion - lockThickness / 2), handleH - leafH / 2, edgeCenterZ]}
                                        castShadow={false}
                                        receiveShadow
                                    >
                                        <boxGeometry args={[lockThickness, lockHeight, lockEdgeWidth]} />
                                        <meshStandardMaterial
                                            color="#64748b"
                                            metalness={0.8}
                                            roughness={0.25}
                                            polygonOffset
                                            polygonOffsetFactor={-2}
                                        />
                                    </mesh>
                                )}

                                {/* Lock Faceplate - Centered on Body Edge */}
                                {lockType !== 'Bez' && (
                                    <mesh
                                        position={[handleSide * (leafW / 2 + edgeProtrusion - lockFaceplateThickness / 2), handleH - leafH / 2, edgeCenterZ]}
                                        castShadow={false}
                                        receiveShadow
                                    >
                                        <boxGeometry args={[lockFaceplateThickness, lockHeight + 0.04, lockEdgeWidth]} />
                                        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
                                    </mesh>
                                )}

                                {/* Lock Rosette (Keyhole/Thumbturn) - Moved 90mm down from handle */}
                                {rosette && normalizedHandleType !== 'none' && (
                                    <>
                                        <group position={[handleSide * (leafW / 2 - handleInset), handleH - leafH / 2 - 0.09, t / 2 + 0.0025]}>
                                            <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
                                                <cylinderGeometry args={[rosetteRadius, rosetteRadius, rosetteThickness, 32]} />
                                                <meshStandardMaterial color={handleColor} metalness={0.9} roughness={0.1} />
                                            </mesh>
                                        </group>
                                        <group position={[handleSide * (leafW / 2 - handleInset), handleH - leafH / 2 - 0.09, -t / 2 - 0.0025]}>
                                            <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
                                                <cylinderGeometry args={[rosetteRadius, rosetteRadius, rosetteThickness, 32]} />
                                                <meshStandardMaterial color={handleColor} metalness={0.9} roughness={0.1} />
                                            </mesh>
                                        </group>
                                    </>
                                )}
                            </>
                        );
                    })()}

                    {/* Hinges - Aligned to Body Edge, Centered on Body Thickness */}
                    {hingePositions.map((yPos, i) => {
                        const isLibero = (frameProfile || '').toUpperCase().includes('LIBERO');
                        const hingeThickness = isLibero ? 0.02 : 0.028;
                        const hingeEdgeWidth = hingeThickness;
                        return (
                            <group key={i} position={[hingeSide * (leafW / 2 + edgeProtrusion - hingeThickness / 2), yPos, edgeCenterZ]}>
                                <mesh>
                                    <boxGeometry args={[hingeThickness, 0.12, hingeEdgeWidth]} />
                                    <meshStandardMaterial color="#64748b" metalness={0.7} />
                            </mesh>
                        </group>
                        );
                    })}
                    {/* Lock Body - Conditional */}
                    {/* Lock Body - Conditional SAFEGUARDED */}
                    {/* Lock Body - Conditional SAFEGUARDED */}

                    {dropSeal && (
                        <mesh position={[0, -leafH / 2, edgeCenterZ]}>
                            <boxGeometry args={[leafW + 0.006, 0.004, 0.02]} />
                            <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.35} />
                        </mesh>
                    )}
                    {cableGrommet && (
                        <mesh position={[handleSide * (leafW / 2 - 0.1), -leafH / 2 + 0.2, 0]}>
                            <cylinderGeometry args={[0.02, 0.02, t + 0.02, 32]} rotation={[Math.PI / 2, 0, 0]} />
                            <meshStandardMaterial color="#cbd5e1" metalness={0.5} />
                        </mesh>
                    )}
                </group>
            </group>
        </group >

    );
};

export default DoorLeaf;
