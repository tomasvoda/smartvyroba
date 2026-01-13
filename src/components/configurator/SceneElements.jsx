import React from 'react';
import { Line, Html } from '@react-three/drei';

// --- TECHNICAL DIMENSION LINE COMPONENT ---
export const DimensionLine = ({ start, end, label, vertical = false }) => {
    const labelText = typeof label === 'string' ? label : `${label} mm`;
    return (
        <group>
            <Line points={[start, end]} color="#3b82f6" lineWidth={1} />
            <Line points={[[start[0], start[1] + (vertical ? 0 : 0.05), start[2]], [start[0], start[1] - (vertical ? 0 : 0.05), start[2]]]} color="#3b82f6" lineWidth={1} />
            <Line points={[[end[0], end[1] + (vertical ? 0 : 0.05), end[2]], [end[0], end[1] - (vertical ? 0 : 0.05), end[2]]]} color="#3b82f6" lineWidth={1} />
            <Html position={[(start[0] + end[0]) / 2, (start[1] + end[1]) / 2, (start[2] + end[2]) / 2]}>
                <div className="bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap border border-blue-400">
                    {labelText}
                </div>
            </Html>
        </group>
    );
};

// --- WALL COMPONENT (HIDDEN FRAME SYSTEM) ---
export const Wall = ({ height, width }) => {
    const h = height / 1000 + 0.6;

    return (
        <group position={[0, h / 2 - 0.3, -0.075]}>
            {/* Hidden Frame Aluminum Profiles - REMOVED AS REQUESTED */}
        </group>
    );
};
