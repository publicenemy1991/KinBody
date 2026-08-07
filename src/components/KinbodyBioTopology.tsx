import React from 'react';
import { motion } from 'motion/react';

interface KinbodyBioTopologyProps {
  className?: string;
  isReducedMotion?: boolean;
}

/**
 * KinbodyBioTopology: Bio-organic biological contour overlay component.
 *
 * Designed to evoke muscle fibers, fingerprint ridges, elevation contours,
 * and magnetic field lines with focal points behind the Kinbody logo (top-left)
 * and Log Food CTA (lower-right).
 */
export const KinbodyBioTopology: React.FC<KinbodyBioTopologyProps> = React.memo(({
  className = '',
  isReducedMotion = false,
}) => {
  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden z-0 select-none ${className}`}
      aria-hidden="true"
    >
      <motion.svg
        viewBox="0 0 400 850"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full text-[#00E8A6] opacity-[0.85]"
        animate={
          isReducedMotion
            ? { scale: 1, y: 0 }
            : {
                scale: [1, 1.025, 1],
                y: [0, -4, 0],
                rotate: [0, 0.4, 0],
              }
        }
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <defs>
          {/* Radial mask for top-left logo focal point */}
          <radialGradient id="topoLogoGlow" cx="15%" cy="8%" r="45%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.28" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
          </radialGradient>

          {/* Radial mask for Log Food CTA focal point */}
          <radialGradient id="topoCtaGlow" cx="80%" cy="52%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.32" />
            <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
          </radialGradient>

          {/* General background diagonal vignette mask */}
          <linearGradient id="topoDiagonalMask" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.22" />
            <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.08" />
            <stop offset="65%" stopColor="#FFFFFF" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.05" />
          </linearGradient>

          {/* Composite Mask combining focal points and vignette */}
          <mask id="bioTopoMask">
            <rect x="0" y="0" width="400" height="850" fill="url(#topoDiagonalMask)" />
            <rect
              x="0"
              y="0"
              width="400"
              height="850"
              fill="url(#topoLogoGlow)"
              style={{ mixBlendMode: 'screen' }}
            />
            <rect
              x="0"
              y="0"
              width="400"
              height="850"
              fill="url(#topoCtaGlow)"
              style={{ mixBlendMode: 'screen' }}
            />
          </mask>
        </defs>

        <g mask="url(#bioTopoMask)" stroke="currentColor" strokeWidth="1.2" fill="none">
          {/* FOCAL POINT 1: Logo Ripple Contour Rings (Top-Left, x=60, y=60) */}
          <path d="M 60 40 C 72 40, 80 48, 80 60 C 80 72, 72 80, 60 80 C 48 80, 40 72, 40 60 C 40 48, 48 40, 60 40 Z" opacity="0.35" />
          <path d="M 60 25 C 80 25, 95 40, 95 60 C 95 80, 80 95, 60 95 C 40 95, 25 80, 25 60 C 25 40, 40 25, 60 25 Z" opacity="0.30" />
          <path d="M 60 10 C 90 10, 112 32, 112 60 C 112 88, 90 110, 60 110 C 30 110, 8 88, 8 60 C 8 32, 30 10, 60 10 Z" opacity="0.25" />
          <path d="M 60 -6 C 102 -6, 130 22, 130 60 C 130 98, 102 126, 60 126 C 18 126, -10 98, -10 60 C -10 22, 18 -6, 60 -6 Z" opacity="0.20" />
          <path d="M 60 -22 C 114 -22, 148 12, 148 60 C 148 108, 114 142, 60 142 C 6 142, -28 108, -28 60 C -28 12, 6 -22, 60 -22 Z" opacity="0.15" />
          <path d="M 60 -38 C 126 -38, 166 2, 166 60 C 166 118, 126 158, 60 158 C -6 158, -46 118, -46 60 C -46 2, -6 -38, 60 -38 Z" opacity="0.10" />

          {/* BIOLOGICAL MUSCLE FIBER / DIAGONAL ELEVATION RIDGES (Top-Left to Mid-Right) */}
          <path d="M -50 120 Q 80 140 220 90 T 450 60" opacity="0.25" />
          <path d="M -50 142 Q 85 162 230 110 T 450 82" opacity="0.22" />
          <path d="M -50 165 Q 90 185 240 130 T 450 105" opacity="0.20" />
          <path d="M -50 188 Q 95 208 250 150 T 450 128" opacity="0.18" />
          <path d="M -50 212 Q 100 232 260 170 T 450 152" opacity="0.16" />
          <path d="M -50 236 Q 105 256 270 190 T 450 176" opacity="0.14" />
          <path d="M -50 260 Q 110 280 280 210 T 450 200" opacity="0.12" />

          {/* FOCAL POINT 2: Log Food CTA Ridge Hill / Fingerprint Contour Loops (Lower-Right, x=330, y=450) */}
          <path d="M 330 435 C 342 435, 350 442, 350 450 C 350 458, 342 465, 330 465 C 318 465, 310 458, 310 450 C 310 442, 318 435, 330 435 Z" opacity="0.32" />
          <path d="M 330 420 C 352 420, 366 432, 366 450 C 366 468, 352 480, 330 480 C 308 480, 294 468, 294 450 C 294 432, 308 420, 330 420 Z" opacity="0.28" />
          <path d="M 330 402 C 362 402, 384 420, 384 450 C 384 480, 362 498, 330 498 C 298 498, 276 480, 276 450 C 276 420, 298 402, 330 402 Z" opacity="0.24" />
          <path d="M 330 384 C 372 384, 402 408, 402 450 C 402 492, 372 516, 330 516 C 288 516, 258 492, 258 450 C 258 408, 288 384, 330 384 Z" opacity="0.20" />
          <path d="M 330 366 C 382 366, 420 396, 420 450 C 420 504, 382 534, 330 534 C 278 534, 240 504, 240 450 C 240 396, 278 366, 330 366 Z" opacity="0.16" />
          <path d="M 330 348 C 392 348, 438 384, 438 450 C 438 516, 392 552, 330 552 C 268 552, 222 516, 222 450 C 222 384, 268 348, 330 348 Z" opacity="0.12" />

          {/* LOWER BODY & MEALS FIELD CONTOUR RIPPLES (x=-30 to 450, y=560 to 850) */}
          <path d="M -40 560 C 60 540, 180 570, 290 530 C 360 505, 420 520, 450 510" opacity="0.22" />
          <path d="M -40 585 C 65 565, 185 595, 298 555 C 368 530, 425 545, 450 535" opacity="0.20" />
          <path d="M -40 610 C 70 590, 190 620, 306 580 C 376 555, 430 570, 450 560" opacity="0.18" />
          <path d="M -40 635 C 75 615, 195 645, 314 605 C 384 580, 435 595, 450 585" opacity="0.16" />
          <path d="M -40 660 C 80 640, 200 670, 322 630 C 392 605, 440 620, 450 610" opacity="0.14" />
          <path d="M -40 688 C 85 668, 205 698, 330 658 C 400 633, 445 648, 450 638" opacity="0.12" />
          <path d="M -40 716 C 90 696, 210 726, 338 686 C 408 661, 450 676, 450 666" opacity="0.10" />
          <path d="M -40 745 C 95 725, 215 755, 346 715 C 416 690, 450 705, 450 695" opacity="0.08" />
          <path d="M -40 775 C 100 755, 220 785, 354 745 C 424 720, 450 735, 450 725" opacity="0.06" />
          <path d="M -40 805 C 105 785, 225 815, 362 775 C 432 750, 450 765, 450 755" opacity="0.04" />
        </g>
      </motion.svg>
    </div>
  );
});
