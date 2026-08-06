import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface KinbodyParticleIntroProps {
  onComplete: () => void;
  isReducedMotion?: boolean;
}

interface ParticlePoint {
  id: number;
  // Starting random 3D orb position (normalized -1 to 1)
  orbX: number;
  orbY: number;
  orbScale: number;
  // Target position on Kinbody Logo (0..100 viewBox space)
  logoX: number;
  logoY: number;
  size: number;
  alpha: number;
}

export const KinbodyParticleIntro: React.FC<KinbodyParticleIntroProps> = ({
  onComplete,
  isReducedMotion = false,
}) => {
  const [stage, setStage] = useState<'orb' | 'forming'>('orb');
  const [particles, setParticles] = useState<ParticlePoint[]>([]);

  useEffect(() => {
    if (isReducedMotion) {
      onComplete();
      return;
    }

    // Generate ~75 particles mapped to the Kinbody Logo silhouette
    const pts: ParticlePoint[] = [];
    let count = 0;

    // 1. Vertical bar (rect x=18, y=16, w=20, h=68, rx=10) -> ~30 particles
    for (let i = 0; i < 30; i++) {
      const u = Math.random();
      const v = Math.random();
      const lx = 18 + u * 20;
      const ly = 16 + v * 68;

      // Orb distribution around center (50, 50)
      const angle = Math.random() * Math.PI * 2;
      const radius = 25 + Math.random() * 25;
      const ox = 50 + Math.cos(angle) * radius;
      const oy = 50 + Math.sin(angle) * radius;

      pts.push({
        id: count++,
        orbX: ox,
        orbY: oy,
        orbScale: 0.8 + Math.random() * 0.4,
        logoX: lx,
        logoY: ly,
        size: 2.2 + Math.random() * 1.5,
        alpha: 0.6 + Math.random() * 0.4,
      });
    }

    // 2. Diagonal bar (rotate -42 deg at (36,16)) -> ~30 particles
    const rad = (-42 * Math.PI) / 180;
    const cosR = Math.cos(rad);
    const sinR = Math.sin(rad);

    for (let i = 0; i < 30; i++) {
      const u = Math.random();
      const v = Math.random();
      const rx = u * 20;
      const ry = v * 54;

      // Transform rotated point relative to origin (36, 16)
      const lx = 36 + (rx * cosR - ry * sinR);
      const ly = 16 + (rx * sinR + ry * cosR);

      const angle = Math.random() * Math.PI * 2;
      const radius = 25 + Math.random() * 25;
      const ox = 50 + Math.cos(angle) * radius;
      const oy = 50 + Math.sin(angle) * radius;

      pts.push({
        id: count++,
        orbX: ox,
        orbY: oy,
        orbScale: 0.8 + Math.random() * 0.4,
        logoX: lx,
        logoY: ly,
        size: 2.2 + Math.random() * 1.5,
        alpha: 0.6 + Math.random() * 0.4,
      });
    }

    // 3. Lower circle dot (cx=72, cy=72, r=12) -> ~15 particles
    for (let i = 0; i < 15; i++) {
      const r = Math.sqrt(Math.random()) * 11;
      const a = Math.random() * Math.PI * 2;
      const lx = 72 + Math.cos(a) * r;
      const ly = 72 + Math.sin(a) * r;

      const angle = Math.random() * Math.PI * 2;
      const radius = 25 + Math.random() * 25;
      const ox = 50 + Math.cos(angle) * radius;
      const oy = 50 + Math.sin(angle) * radius;

      pts.push({
        id: count++,
        orbX: ox,
        orbY: oy,
        orbScale: 0.8 + Math.random() * 0.4,
        logoX: lx,
        logoY: ly,
        size: 2.4 + Math.random() * 1.2,
        alpha: 0.7 + Math.random() * 0.3,
      });
    }

    setParticles(pts);

    // Timeline:
    // 0 -> 900ms: Orb rotating/breathing
    // 900ms: forming stage (particles converge into logo silhouette)
    // 1600ms (700ms convergence): complete -> trigger clean logo replacement
    const timer1 = setTimeout(() => {
      setStage('forming');
    }, 900);

    const timer2 = setTimeout(() => {
      onComplete();
    }, 1600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isReducedMotion, onComplete]);

  if (isReducedMotion) return null;

  return (
    <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center select-none">
      {/* Subtle outer glow */}
      <div className="absolute inset-0 bg-[#16E39B]/20 rounded-full blur-2xl animate-pulse" />

      {/* Rotating particle container */}
      <motion.svg
        viewBox="0 0 100 100"
        className="w-full h-full relative z-10 filter drop-shadow(0 0 12px rgba(22,227,155,0.5))"
        animate={
          stage === 'orb'
            ? {
                rotate: [0, 180, 360],
                scale: [0.95, 1.03, 0.95],
              }
            : {
                rotate: 360,
                scale: 1,
              }
        }
        transition={
          stage === 'orb'
            ? {
                rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
                scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
              }
            : {
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
              }
        }
      >
        <defs>
          <radialGradient id="particleDotGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7AF2C4" />
            <stop offset="100%" stopColor="#16E39B" />
          </radialGradient>
        </defs>

        {particles.map((p) => {
          const cx = stage === 'orb' ? p.orbX : p.logoX;
          const cy = stage === 'orb' ? p.orbY : p.logoY;

          return (
            <motion.circle
              key={p.id}
              initial={{ cx: p.orbX, cy: p.orbY, r: p.size }}
              animate={{ cx, cy, r: stage === 'forming' ? p.size * 0.9 : p.size }}
              transition={{
                duration: stage === 'forming' ? 0.7 : 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
              fill="url(#particleDotGrad)"
              opacity={p.alpha}
            />
          );
        })}
      </motion.svg>
    </div>
  );
};
