import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as THREE from 'three';

interface Ake3DCompanionProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  message?: string | React.ReactNode;
  submessage?: string;
  showBubble?: boolean;
  className?: string;
  interactive?: boolean;
  autoWave?: boolean;
  compact?: boolean; // if true, omits background particles/ground for tight spaces
}

export const Ake3DCompanion: React.FC<Ake3DCompanionProps> = ({
  size = 'lg',
  message,
  submessage,
  showBubble = true,
  className = '',
  interactive = true,
  autoWave = true,
  compact = false,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [isWaving, setIsWaving] = useState(false);

  // Size mapping for canvas dimensions
  const sizeMap = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-44 h-44 sm:w-52 sm:h-52',
    xl: 'w-56 h-56 sm:w-64 sm:h-64',
    full: 'w-full h-64 sm:h-80',
  };

  const canvasClass = sizeMap[size];

  // Ref to trigger wave programmatically
  const waveTriggerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    if (!compact) {
      scene.fog = new THREE.FogExp2(0x020403, 0.055);
    }

    const width = mount.clientWidth || 200;
    const height = mount.clientHeight || 200;

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 6.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Clear background to transparent
    renderer.setClearColor(0x000000, 0);

    mount.appendChild(renderer.domElement);

    // 2. Lighting
    const hemiLight = new THREE.HemisphereLight(0xbfffe9, 0x04100c, 2.2);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 4.5);
    keyLight.position.set(-3, 5, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x17e7a5, 18, 10, 2);
    rimLight.position.set(3.5, 1.5, 2.5);
    scene.add(rimLight);

    const underGlow = new THREE.PointLight(0x00e59b, 12, 5, 2);
    underGlow.position.set(0, -2, 1.5);
    scene.add(underGlow);

    // 3. Materials
    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0fe8a6,
      roughness: 0.42,
      metalness: 0.02,
      clearcoat: 0.28,
      clearcoatRoughness: 0.32,
      sheen: 0.5,
      sheenColor: new THREE.Color(0x78ffd5),
    });

    const eyeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x050706,
      roughness: 0.12,
      metalness: 0.05,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
    });

    const whiteMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.25,
    });

    const mouthMaterial = new THREE.MeshStandardMaterial({
      color: 0x07100d,
      roughness: 0.55,
    });

    const tongueMaterial = new THREE.MeshStandardMaterial({
      color: 0xff7f9f,
      roughness: 0.55,
    });

    // 4. Character Root
    const ake = new THREE.Group();
    ake.position.y = compact ? -0.1 : -0.2;
    scene.add(ake);

    // Deformed Sphere Body
    const bodyGeometry = new THREE.SphereGeometry(1.4, 64, 48);
    const pos = bodyGeometry.attributes.position;
    const v = new THREE.Vector3();

    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);

      const vertical = (v.y + 1.4) / 2.8;
      const lowerBulge = THREE.MathUtils.lerp(1.12, 0.82, vertical);
      v.x *= lowerBulge;
      v.z *= THREE.MathUtils.lerp(1.08, 0.9, vertical);

      if (v.y > 0.8) {
        const peak = (v.y - 0.8) / 0.6;
        v.x *= THREE.MathUtils.lerp(1, 0.42, peak);
        v.z *= THREE.MathUtils.lerp(1, 0.42, peak);
        v.y += peak * 0.4;
        v.x += peak * 0.15;
      }

      if (v.y < -0.6) {
        v.y *= 0.9;
      }

      pos.setXYZ(i, v.x, v.y, v.z);
    }

    bodyGeometry.computeVertexNormals();

    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    body.receiveShadow = true;
    ake.add(body);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.22, 32, 24);

    function createEye(x: number) {
      const eyeGroup = new THREE.Group();
      eyeGroup.position.set(x, 0.15, 1.22);

      const eyeball = new THREE.Mesh(eyeGeometry, eyeMaterial);
      eyeball.scale.set(0.82, 1.18, 0.6);
      eyeball.castShadow = true;
      eyeGroup.add(eyeball);

      const highlight = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 16, 12),
        whiteMaterial
      );
      highlight.position.set(-0.06, 0.08, 0.15);
      eyeGroup.add(highlight);

      return eyeGroup;
    }

    const leftEye = createEye(-0.4);
    const rightEye = createEye(0.4);
    ake.add(leftEye, rightEye);

    // Mouth
    const mouthGroup = new THREE.Group();
    mouthGroup.position.set(0, -0.42, 1.32);

    const mouthShape = new THREE.Shape();
    mouthShape.moveTo(-0.26, 0.08);
    mouthShape.quadraticCurveTo(0, -0.24, 0.26, 0.08);
    mouthShape.quadraticCurveTo(0, -0.05, -0.26, 0.08);

    const mouthMesh = new THREE.Mesh(
      new THREE.ShapeGeometry(mouthShape, 24),
      mouthMaterial
    );
    mouthGroup.add(mouthMesh);

    const tongue = new THREE.Mesh(
      new THREE.CircleGeometry(0.11, 24, 0, Math.PI),
      tongueMaterial
    );
    tongue.position.set(0, -0.1, 0.012);
    tongue.scale.y = 0.55;
    mouthGroup.add(tongue);

    ake.add(mouthGroup);

    // Rosy Cheeks
    const cheekMaterial = new THREE.MeshBasicMaterial({
      color: 0x7bffd7,
      transparent: true,
      opacity: 0.42,
    });

    function createCheek(x: number) {
      const cheek = new THREE.Mesh(
        new THREE.CircleGeometry(0.11, 24),
        cheekMaterial
      );
      cheek.position.set(x, -0.26, 1.33);
      return cheek;
    }

    ake.add(createCheek(-0.72), createCheek(0.72));

    // Arms
    function createArm(side: number) {
      const armPivot = new THREE.Group();
      armPivot.position.set(side * 1.15, -0.1, 0.15);

      const armGeometry = new THREE.CapsuleGeometry(0.22, 0.68, 8, 20);
      const arm = new THREE.Mesh(armGeometry, bodyMaterial);
      arm.rotation.z = side * -0.55;
      arm.position.set(side * 0.16, -0.2, 0.1);
      arm.castShadow = true;
      armPivot.add(arm);

      ake.add(armPivot);
      return armPivot;
    }

    const leftArm = createArm(-1);
    const rightArm = createArm(1);

    // Feet
    const footGeometry = new THREE.SphereGeometry(0.4, 32, 24);
    [-0.54, 0.54].forEach((x) => {
      const foot = new THREE.Mesh(footGeometry, bodyMaterial);
      foot.scale.set(1.15, 0.48, 1.35);
      foot.position.set(x, -1.22, 0.15);
      foot.castShadow = true;
      ake.add(foot);
    });

    // Ground and glow elements if not compact
    let particles: THREE.Points | null = null;
    let glowMesh: THREE.Mesh | null = null;

    if (!compact) {
      const ground = new THREE.Mesh(
        new THREE.CircleGeometry(3.8, 64),
        new THREE.MeshStandardMaterial({
          color: 0x07100d,
          roughness: 0.8,
          transparent: true,
          opacity: 0.82,
        })
      );
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -1.55;
      ground.receiveShadow = true;
      scene.add(ground);

      glowMesh = new THREE.Mesh(
        new THREE.CircleGeometry(2.2, 64),
        new THREE.MeshBasicMaterial({
          color: 0x00e59b,
          transparent: true,
          opacity: 0.12,
          depthWrite: false,
        })
      );
      glowMesh.rotation.x = -Math.PI / 2;
      glowMesh.position.y = -1.52;
      scene.add(glowMesh);

      // Floating particles
      const particleCount = 45;
      const particleGeometry = new THREE.BufferGeometry();
      const particlePositions = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        particlePositions[i * 3] = (Math.random() - 0.5) * 6;
        particlePositions[i * 3 + 1] = Math.random() * 4 - 1.5;
        particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 2.5;
      }

      particleGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(particlePositions, 3)
      );

      particles = new THREE.Points(
        particleGeometry,
        new THREE.PointsMaterial({
          color: 0x2affc4,
          size: 0.035,
          transparent: true,
          opacity: 0.7,
          depthWrite: false,
        })
      );
      scene.add(particles);
    }

    // 5. Interaction (Pointer Tracking & Tap to Wave)
    const pointer = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    let waveStrength = autoWave ? 1 : 0;
    let waveTime = 0;

    const triggerWave = () => {
      waveStrength = 1;
      waveTime = 0;
      setIsWaving(true);
      setTimeout(() => setIsWaving(false), 1200);
    };

    waveTriggerRef.current = triggerWave;

    const handlePointerMove = (e: PointerEvent) => {
      if (!interactive) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (!interactive) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObject(body);
      if (hits.length > 0 || size === 'sm' || size === 'md') {
        triggerWave();
      }
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('pointermove', handlePointerMove);
    domElem.addEventListener('pointerdown', handlePointerDown);

    // Auto-wave once on initial mount if enabled
    if (autoWave) {
      setTimeout(() => triggerWave(), 300);
    }

    // 6. Animation Loop
    const clock = new THREE.Clock();
    let nextBlink = 2 + Math.random() * 3;
    let blinkTime = 0;
    let blinking = false;
    let animFrameId = 0;

    const updateBlink = (delta: number) => {
      nextBlink -= delta;
      if (nextBlink <= 0 && !blinking) {
        blinking = true;
        blinkTime = 0;
      }

      if (blinking) {
        blinkTime += delta;
        const blink = Math.sin(Math.min(blinkTime / 0.16, 1) * Math.PI);
        const scaleY = Math.max(0.08, 1 - blink);

        leftEye.scale.y = scaleY;
        rightEye.scale.y = scaleY;

        if (blinkTime >= 0.16) {
          blinking = false;
          nextBlink = 2.2 + Math.random() * 4;
          leftEye.scale.y = 1;
          rightEye.scale.y = 1;
        }
      }
    };

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;

      updateBlink(delta);

      // Breathing and gentle float
      const breathe = 1 + Math.sin(elapsed * 2.2) * 0.025;
      body.scale.set(1 / breathe, breathe, 1 / breathe);
      ake.position.y = (compact ? -0.1 : -0.2) + Math.sin(elapsed * 1.65) * 0.05;

      // Pointer tracking smooth lerp
      const targetRotationY = pointer.x * 0.22;
      const targetRotationX = pointer.y * 0.12;
      ake.rotation.y += (targetRotationY - ake.rotation.y) * 0.05;
      ake.rotation.x += (targetRotationX - ake.rotation.x) * 0.05;

      // Eye tracking
      const eyeX = pointer.x * 0.04;
      const eyeY = pointer.y * 0.03;
      [leftEye, rightEye].forEach((eye) => {
        eye.children[0].rotation.y = eyeX;
        eye.children[0].rotation.x = -eyeY;
      });

      // Idle left arm movement
      leftArm.rotation.z = -0.08 + Math.sin(elapsed * 1.5) * 0.025;

      // Waving right arm
      if (waveStrength > 0.001) {
        waveTime += delta;
        waveStrength *= 0.972;

        rightArm.rotation.z =
          1.55 + Math.sin(waveTime * 12) * 0.45 * waveStrength;
        rightArm.rotation.x = -0.2;
      } else {
        rightArm.rotation.z += (0.08 - rightArm.rotation.z) * 0.08;
        rightArm.rotation.x += (0 - rightArm.rotation.x) * 0.08;
      }

      if (particles) {
        particles.rotation.y = elapsed * 0.025;
        particles.position.y = Math.sin(elapsed * 0.45) * 0.08;
      }

      if (glowMesh) {
        (glowMesh.material as THREE.MeshBasicMaterial).opacity =
          0.1 + Math.sin(elapsed * 2) * 0.025;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 7. Responsive Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      if (!mount) return;
      const newWidth = mount.clientWidth || 200;
      const newHeight = mount.clientHeight || 200;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    });

    resizeObserver.observe(mount);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animFrameId);
      domElem.removeEventListener('pointermove', handlePointerMove);
      domElem.removeEventListener('pointerdown', handlePointerDown);
      resizeObserver.disconnect();

      // Dispose Three.js objects
      scene.clear();
      renderer.dispose();
      bodyGeometry.dispose();
      bodyMaterial.dispose();
      eyeGeometry.dispose();
      eyeMaterial.dispose();
      whiteMaterial.dispose();
      mouthMaterial.dispose();
      tongueMaterial.dispose();
      cheekMaterial.dispose();

      if (mount.contains(domElem)) {
        mount.removeChild(domElem);
      }
    };
  }, [compact, interactive, size, autoWave]);

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {/* Optional Speech Bubble */}
      {showBubble && message && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative mb-2 max-w-xs bg-[#121614]/90 border border-white/10 rounded-2xl px-4 py-3 shadow-2xl text-center backdrop-blur-md z-20"
        >
          <div className="text-sm font-semibold text-white leading-snug">
            {message}
          </div>
          {submessage && (
            <div className="text-xs text-zinc-400 mt-1 leading-relaxed">
              {submessage}
            </div>
          )}
          {/* Subtle bubble tail */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#121614] border-r border-b border-white/10 rotate-45" />
        </motion.div>
      )}

      {/* 3D Canvas Container */}
      <div
        onClick={() => waveTriggerRef.current?.()}
        className={`relative ${canvasClass} flex items-center justify-center cursor-pointer group touch-none`}
      >
        <div ref={mountRef} className="w-full h-full" />

        {/* Tap indicator label if interactive */}
        {interactive && !compact && (
          <div className="absolute -bottom-2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-semibold tracking-wider text-emerald-400 bg-black/60 px-2 py-0.5 rounded-full border border-emerald-500/30 pointer-events-none">
            {isWaving ? 'Waving! 👋' : 'Tap to wave'}
          </div>
        )}
      </div>
    </div>
  );
};
