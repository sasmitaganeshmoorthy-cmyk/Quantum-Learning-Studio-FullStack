'use client';

import { useId, useState } from 'react';
import { Info } from 'lucide-react';

interface BlochSphereProps {
  theta?: number; // 0 to Math.PI (radians)
  phi?: number;   // 0 to 2*Math.PI (radians)
  showControls?: boolean;
}

export function BlochSphere({ theta = 0, phi = 0, showControls = false }: BlochSphereProps) {
  const [activeTheta, setActiveTheta] = useState(theta);
  const [activePhi, setActivePhi] = useState(phi);
  const arrowId = useId().replaceAll(':', '');

  // Compute Cartesian coordinates for the sphere vector
  const x = Math.sin(activeTheta) * Math.cos(activePhi);
  const y = Math.sin(activeTheta) * Math.sin(activePhi);
  const z = Math.cos(activeTheta);

  // Convert radians to degrees for displaying values
  const thetaDeg = Math.round((activeTheta * 180) / Math.PI);
  const phiDeg = Math.round((activePhi * 180) / Math.PI);

  // SVG parameters for plotting sphere axes projection
  // Center is (100, 100), radius is 80
  const cx = 100;
  const cy = 100;
  const r = 70;

  // Project 3D vector coordinates onto a 2D isometric projection plane
  // Projection matrix variables: isometric angle offset
  const isoX = cx + r * (x * 0.7 - y * 0.4);
  const isoY = cy - r * (z * 0.8 + x * 0.2 - y * 0.2);

  return (
    <div className="p-4 rounded-large bg-surface border border-border-color shadow-xs flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full border-b border-border-color pb-2">
        <span className="text-caption font-bold text-text-secondary tracking-wider uppercase">Bloch Sphere Visualizer</span>
        <span className="text-[11px] text-primary-color bg-primary-color/10 px-2 py-0.5 rounded-pill font-semibold">2D Projections</span>
      </div>

      {/* SVG Sphere Projection */}
      <div className="relative w-48 h-48 flex items-center justify-center bg-background rounded-pill border border-border-color/50">
        <svg className="w-full h-full" viewBox="0 0 200 200" role="img" aria-labelledby={`${arrowId}-title ${arrowId}-description`}>
          <title id={`${arrowId}-title`}>Bloch sphere state visualization</title>
          <desc id={`${arrowId}-description`}>Qubit vector at theta {thetaDeg} degrees and phi {phiDeg} degrees.</desc>
          {/* Main sphere boundary outline */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" className="text-border-color" strokeWidth="1.5" />
          
          {/* Latitudinal equator ellipse projection */}
          <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.25} fill="none" stroke="currentColor" className="text-border-color/50" strokeWidth="1" strokeDasharray="3,3" />

          {/* Coordinate axes lines (X, Y, Z) */}
          {/* Z Axis (Vertical - ground to excited state) */}
          <line x1={cx} y1={cy - r - 10} x2={cx} y2={cy + r + 10} stroke="currentColor" className="text-text-secondary/40" strokeWidth="1.5" />
          <text x={cx - 10} y={cy - r} className="fill-text-secondary text-[10px] font-mono font-bold">|0⟩ (+z)</text>
          <text x={cx - 10} y={cy + r + 8} className="fill-text-secondary text-[10px] font-mono font-bold">|1⟩ (-z)</text>

          {/* Y Axis (Diagonal left) */}
          <line x1={cx - r * 0.5} y1={cy + r * 0.25} x2={cx + r * 0.5} y2={cy - r * 0.25} stroke="currentColor" className="text-text-secondary/40" strokeWidth="1" strokeDasharray="2,2" />
          <text x={cx + r * 0.5} y={cy - r * 0.25 - 4} className="fill-text-secondary text-[10px] font-mono">+y</text>

          {/* X Axis (Diagonal right) */}
          <line x1={cx - r * 0.8} y1={cy - r * 0.1} x2={cx + r * 0.8} y2={cy + r * 0.1} stroke="currentColor" className="text-text-secondary/40" strokeWidth="1.5" />
          <text x={cx + r * 0.8 + 2} y={cy + r * 0.1 + 8} className="fill-text-secondary text-[10px] font-mono font-bold">+x</text>

          {/* Plotted Qubit State Vector arrow */}
          <line
            x1={cx}
            y1={cy}
            x2={isoX}
            y2={isoY}
            stroke="var(--primary-color)"
            strokeWidth="3.5"
            strokeLinecap="round"
            markerEnd={`url(#${arrowId})`}
          />
          {/* Vector head dot */}
          <circle cx={isoX} cy={isoY} r="4" fill="var(--primary-color)" />

          {/* Markers config */}
          <defs>
            <marker id={arrowId} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--primary-color)" />
            </marker>
          </defs>
        </svg>
      </div>

      {/* Accessible Coordinates State Table */}
      <div className="w-full text-caption border border-border-color rounded-medium overflow-hidden">
        <div className="grid grid-cols-3 bg-surface-hover font-semibold p-1.5 border-b border-border-color text-center">
          <span>Coordinate</span>
          <span>Degrees</span>
          <span>Cartesian</span>
        </div>
        <div className="divide-y divide-border-color">
          <div className="grid grid-cols-3 p-1.5 text-center font-mono">
            <span>θ (theta)</span>
            <span>{thetaDeg}°</span>
            <span>{z.toFixed(3)} (z)</span>
          </div>
          <div className="grid grid-cols-3 p-1.5 text-center font-mono">
            <span>φ (phi)</span>
            <span>{phiDeg}°</span>
            <span>x: {x.toFixed(2)}, y: {y.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Interactive Controls (Slider updates) */}
      {showControls && (
        <div className="w-full space-y-3 pt-2 border-t border-border-color">
          <div className="space-y-1">
            <div className="flex justify-between text-body-small">
              <span className="font-semibold">Theta (Latitude)</span>
              <span className="font-mono text-caption text-text-secondary">{thetaDeg}°</span>
            </div>
            <label htmlFor={`${arrowId}-theta`} className="sr-only">Theta angle in radians</label>
            <input
              id={`${arrowId}-theta`}
              type="range"
              min="0"
              max={Math.PI}
              step="0.05"
              value={activeTheta}
              onChange={(e) => setActiveTheta(parseFloat(e.target.value))}
              className="w-full min-h-11 bg-border-color rounded-pill accent-primary-color cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-body-small">
              <span className="font-semibold">Phi (Longitude)</span>
              <span className="font-mono text-caption text-text-secondary">{phiDeg}°</span>
            </div>
            <label htmlFor={`${arrowId}-phi`} className="sr-only">Phi angle in radians</label>
            <input
              id={`${arrowId}-phi`}
              type="range"
              min="0"
              max={2 * Math.PI}
              step="0.05"
              value={activePhi}
              onChange={(e) => setActivePhi(parseFloat(e.target.value))}
              className="w-full min-h-11 bg-border-color rounded-pill accent-primary-color cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Helper Warning */}
      <div className="flex gap-2 items-start text-[10px] text-text-secondary bg-surface-hover p-2 rounded-medium border border-border-color/50">
        <Info size={14} className="shrink-0 mt-0.5 text-primary-color" />
        <p>The vector shrinks toward the origin when qubits are entangled, representing correlation entropy.</p>
      </div>
    </div>
  );
}
