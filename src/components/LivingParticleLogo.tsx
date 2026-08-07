import React, { useEffect, useRef, memo } from 'react';

interface LivingParticleLogoProps {
  className?: string;
}

export const LivingParticleLogo: React.FC<LivingParticleLogoProps> = memo(({
  className = 'w-64 h-64',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = 300);
    let height = (canvas.height = 300);

    const numParticles = 240;
    const particles: {
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      baseAngle: number;
      radius: number;
      speed: number;
      size: number;
      alpha: number;
    }[] = [];

    // Generate initial particle locations forming a organic sphere/torus/Kinbody shape
    const centerX = width / 2;
    const centerY = height / 2;

    for (let i = 0; i < numParticles; i++) {
      const angle = (i / numParticles) * Math.PI * 2 + Math.random() * 0.1;
      const ringRadius = 70 + Math.sin(i * 0.1) * 15 + Math.random() * 12;
      particles.push({
        x: centerX + Math.cos(angle) * (ringRadius + (Math.random() - 0.5) * 40),
        y: centerY + Math.sin(angle) * (ringRadius + (Math.random() - 0.5) * 40),
        targetX: centerX + Math.cos(angle) * ringRadius,
        targetY: centerY + Math.sin(angle) * ringRadius,
        baseAngle: angle,
        radius: ringRadius,
        speed: 0.005 + Math.random() * 0.008,
        size: 1.2 + Math.random() * 2.2,
        alpha: 0.4 + Math.random() * 0.6,
      });
    }

    let time = 0;
    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.033);
      lastTime = now;
      time += dt * 1.2;

      ctx.clearRect(0, 0, width, height);

      // Radial background glow
      const glowGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        10,
        centerX,
        centerY,
        120
      );
      glowGrad.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
      glowGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.08)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw particle dots
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Breathing & Rotation physics
        const dynamicAngle = p.baseAngle + time * p.speed * 0.8;
        const pulseRadius =
          p.radius + Math.sin(time * 1.5 + p.baseAngle * 3) * 6;

        p.targetX = centerX + Math.cos(dynamicAngle) * pulseRadius;
        p.targetY = centerY + Math.sin(dynamicAngle) * pulseRadius;

        // Delta-adjusted smooth spring ease toward target
        const easeFactor = 1 - Math.pow(1 - 0.12, dt * 60);
        p.x += (p.targetX - p.x) * easeFactor;
        p.y += (p.targetY - p.y) * easeFactor;

        // Draw particle dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

        // Gradient color for dots: emerald bright to cyan green
        const isCore = i % 5 === 0;
        ctx.fillStyle = isCore
          ? `rgba(167, 243, 208, ${p.alpha})`
          : `rgba(16, 185, 129, ${p.alpha * 0.85})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className={`relative flex items-center justify-center gpu-accelerated ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full max-w-[300px] max-h-[300px] pointer-events-none"
      />
    </div>
  );
});

LivingParticleLogo.displayName = 'LivingParticleLogo';
