import React, { useEffect, useRef, useState, memo } from 'react';
import { motion } from 'motion/react';
import * as THREE from 'three';

interface Ake3DCompanionProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  message?: string | React.ReactNode;
  submessage?: string;
  showBubble?: boolean;
  className?: string;
  interactive?: boolean;
  autoWave?: boolean;
  alignBubble?: 'center' | 'left' | 'right';
  enableMotionBlur?: boolean;
}

export const Ake3DCompanion: React.FC<Ake3DCompanionProps> = memo(({
  size = 'lg',
  message,
  submessage,
  showBubble = true,
  className = '',
  interactive = true,
  autoWave = true,
  alignBubble = 'center',
  enableMotionBlur = false,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [isWaving, setIsWaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Locked container aspect ratio and responsive scaling bounds
  const sizeMap = {
    sm: 'w-24 h-24 max-w-[96px] aspect-square',
    md: 'w-36 h-36 max-w-[144px] aspect-square',
    lg: 'w-52 h-52 sm:w-60 sm:h-60 max-w-[240px] aspect-square',
    xl: 'w-64 h-64 sm:w-72 sm:h-72 max-w-[288px] aspect-square',
    full: 'w-full max-w-sm h-64 sm:h-80 aspect-square',
  };

  const canvasClass = sizeMap[size] || sizeMap.lg;
  const waveTriggerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Clean prior canvas elements if present to prevent duplicated WebGL contexts
    while (mount.firstChild) {
      mount.removeChild(mount.firstChild);
    }

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020805, 0.04);

    const width = mount.clientWidth || 220;
    const height = mount.clientHeight || 220;

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 7.2);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      premultipliedAlpha: false,
      powerPreference: 'high-performance',
    });

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mount.appendChild(renderer.domElement);

    // 3. Bioluminescent Lighting setup
    const ambient = new THREE.HemisphereLight(0xc3ffe8, 0x021a12, 2.6);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 4.2);
    keyLight.position.set(-3, 5, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0x00ffa8, 12, 12, 1.8);
    fillLight.position.set(3, 1.5, 3);
    scene.add(fillLight);

    const coreGlowLight = new THREE.PointLight(0x16e39b, 16, 6, 2);
    coreGlowLight.position.set(0, -0.4, 0.8);
    scene.add(coreGlowLight);

    const rimLight = new THREE.PointLight(0x00ffcc, 10, 8, 2);
    rimLight.position.set(0, 3, -1);
    scene.add(rimLight);

    // 4. Materials matching the reference bioluminescent jelly
    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x0de298),
      roughness: 0.32,
      metalness: 0.02,
      clearcoat: 0.65,
      clearcoatRoughness: 0.18,
      sheen: 0.8,
      sheenColor: new THREE.Color(0x7cffd8),
      transmission: 0.15, // Translucent jelly depth
      thickness: 0.5,
      ior: 1.35,
    });

    const eyeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x020403,
      roughness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
    });

    const whiteMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const mouthMaterial = new THREE.MeshStandardMaterial({
      color: 0x06110d,
      roughness: 0.45,
    });

    const tongueMaterial = new THREE.MeshStandardMaterial({
      color: 0xff6b8b,
      roughness: 0.4,
    });

    // 5. Character Group
    const ake = new THREE.Group();
    ake.position.y = -0.25;
    scene.add(ake);

    // Teardrop Body Geometry
    const bodyGeometry = new THREE.SphereGeometry(1.5, 96, 72);
    const position = bodyGeometry.attributes.position;
    const vertex = new THREE.Vector3();

    for (let i = 0; i < position.count; i++) {
      vertex.fromBufferAttribute(position, i);

      const vertical = (vertex.y + 1.5) / 3.0;

      // Lower body bulge
      const xScale = THREE.MathUtils.lerp(1.16, 0.82, vertical);
      const zScale = THREE.MathUtils.lerp(1.1, 0.88, vertical);

      vertex.x *= xScale;
      vertex.z *= zScale;

      // Smooth wide bottom base
      if (vertex.y < -0.6) {
        vertex.y *= 0.85;
      }

      // Curved teardrop peak
      if (vertex.y > 0.75) {
        const peak = (vertex.y - 0.75) / 0.75;
        vertex.x *= THREE.MathUtils.lerp(1, 0.35, peak);
        vertex.z *= THREE.MathUtils.lerp(1, 0.35, peak);
        vertex.y += peak * 0.55;
        vertex.x += peak * 0.16; // Gentle cute tilt
      }

      position.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    bodyGeometry.computeVertexNormals();

    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    body.receiveShadow = true;
    ake.add(body);

    // Eyes
    function makeEye(x: number) {
      const eyeGroup = new THREE.Group();
      eyeGroup.position.set(x, 0.15, 1.32);

      const eye = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 40, 32),
        eyeMaterial
      );
      eye.scale.set(0.85, 1.15, 0.55);
      eyeGroup.add(eye);

      // Large pupil highlight like reference
      const highlight = new THREE.Mesh(
        new THREE.SphereGeometry(0.065, 20, 16),
        whiteMaterial
      );
      highlight.position.set(-0.06, 0.08, 0.16);
      eyeGroup.add(highlight);

      // Smaller pupil sub-reflection
      const subHighlight = new THREE.Mesh(
        new THREE.SphereGeometry(0.03, 14, 10),
        whiteMaterial
      );
      subHighlight.position.set(0.06, -0.07, 0.15);
      eyeGroup.add(subHighlight);

      return eyeGroup;
    }

    const leftEye = makeEye(-0.43);
    const rightEye = makeEye(0.43);
    ake.add(leftEye, rightEye);

    // Mouth
    const mouthShape = new THREE.Shape();
    mouthShape.moveTo(-0.28, 0.08);
    mouthShape.quadraticCurveTo(0, -0.28, 0.28, 0.08);
    mouthShape.quadraticCurveTo(0, -0.06, -0.28, 0.08);

    const mouth = new THREE.Mesh(
      new THREE.ShapeGeometry(mouthShape, 32),
      mouthMaterial
    );
    mouth.position.set(0, -0.44, 1.41);
    ake.add(mouth);

    const tongue = new THREE.Mesh(
      new THREE.CircleGeometry(0.125, 32, 0, Math.PI),
      tongueMaterial
    );
    tongue.position.set(0, -0.55, 1.425);
    tongue.scale.y = 0.55;
    ake.add(tongue);

    // Rosy Pink Cheeks
    const cheekMaterial = new THREE.MeshBasicMaterial({
      color: 0xff7096,
      transparent: true,
      opacity: 0.45,
    });

    [-0.78, 0.78].forEach((x) => {
      const cheek = new THREE.Mesh(
        new THREE.CircleGeometry(0.13, 32),
        cheekMaterial
      );
      cheek.position.set(x, -0.26, 1.4);
      ake.add(cheek);
    });

    // Arms
    function makeArm(side: number) {
      const pivot = new THREE.Group();
      pivot.position.set(side * 1.18, -0.05, 0.18);

      const arm = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.23, 0.72, 12, 28),
        bodyMaterial
      );

      arm.position.set(side * 0.18, -0.2, 0.08);
      arm.rotation.z = side * -0.55;
      arm.castShadow = true;

      pivot.add(arm);
      ake.add(pivot);
      return pivot;
    }

    const leftArm = makeArm(-1);
    const rightArm = makeArm(1);

    // Feet
    [-0.56, 0.56].forEach((x) => {
      const foot = new THREE.Mesh(
        new THREE.SphereGeometry(0.42, 36, 26),
        bodyMaterial
      );
      foot.scale.set(1.12, 0.46, 1.3);
      foot.position.set(x, -1.3, 0.18);
      foot.castShadow = true;
      ake.add(foot);
    });

    // Floor Soft Glow Disc
    const glowDisc = new THREE.Mesh(
      new THREE.CircleGeometry(2.2, 64),
      new THREE.MeshBasicMaterial({
        color: 0x00ffb3,
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
      })
    );
    glowDisc.rotation.x = -Math.PI / 2;
    glowDisc.position.y = -1.55;
    scene.add(glowDisc);

    // Ambient Magic Particles
    const particleCount = 50;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 5.5;
      particlePositions[i * 3 + 1] = Math.random() * 4 - 1.5;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 2.5;
    }

    particleGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(particlePositions, 3)
    );

    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        color: 0x3dffc0,
        size: 0.04,
        transparent: true,
        opacity: 0.75,
        depthWrite: false,
      })
    );
    scene.add(particles);

    // 6. Interaction & Animation
    const pointer = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();

    let waveAmount = autoWave ? 1 : 0;
    let waveClock = 0;

    const triggerWave = () => {
      waveAmount = 1;
      waveClock = 0;
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
      const hits = raycaster.intersectObject(body, false);

      if (hits.length > 0 || size === 'sm' || size === 'md') {
        triggerWave();
      }
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('pointermove', handlePointerMove);
    domElem.addEventListener('pointerdown', handlePointerDown);

    if (autoWave) {
      setTimeout(() => triggerWave(), 200);
    }

    // Animation Loop
    const clock = new THREE.Clock();
    let blinkCountdown = 2 + Math.random() * 3;
    let blinking = false;
    let blinkClock = 0;
    let animFrameId = 0;
    let firstFrameRendered = false;

    function animateBlink(delta: number) {
      blinkCountdown -= delta;

      if (blinkCountdown <= 0 && !blinking) {
        blinking = true;
        blinkClock = 0;
      }

      if (!blinking) return;

      blinkClock += delta;
      const t = Math.min(blinkClock / 0.18, 1);
      const squash = Math.sin(t * Math.PI);
      const scaleY = Math.max(0.08, 1 - squash);

      leftEye.scale.y = scaleY;
      rightEye.scale.y = scaleY;

      if (t >= 1) {
        blinking = false;
        blinkCountdown = 2.2 + Math.random() * 4;
        leftEye.scale.y = 1;
        rightEye.scale.y = 1;
      }
    }

    function animate() {
      animFrameId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;

      animateBlink(delta);

      // Gentle breathing scale
      const breathing = 1 + Math.sin(elapsed * 2.1) * 0.024;
      body.scale.set(1 / breathing, breathing, 1 / breathing);

      // Soft float
      ake.position.y = -0.25 + Math.sin(elapsed * 1.55) * 0.05;

      // Pointer rotation tracking
      const targetY = pointer.x * 0.22;
      const targetX = pointer.y * 0.1;

      ake.rotation.y += (targetY - ake.rotation.y) * 0.05;
      ake.rotation.x += (targetX - ake.rotation.x) * 0.05;

      // Idle left arm
      leftArm.rotation.z = -0.05 + Math.sin(elapsed * 1.4) * 0.025;

      // Waving right arm
      if (waveAmount > 0.002) {
        waveClock += delta;
        waveAmount *= 0.975;

        const armAngle = 1.65 + Math.sin(waveClock * 12) * 0.45 * waveAmount;
        rightArm.rotation.z = armAngle;
        rightArm.rotation.x = -0.22;
        rightArm.scale.set(1, 1, 1);
      } else {
        rightArm.rotation.z += (0.05 - rightArm.rotation.z) * 0.08;
        rightArm.rotation.x += (0 - rightArm.rotation.x) * 0.08;
        rightArm.scale.set(1, 1, 1);
      }

      // Rotate magic particles & glow pulsing
      particles.rotation.y = elapsed * 0.03;
      glowDisc.material.opacity = 0.18 + Math.sin(elapsed * 2) * 0.04;

      renderer.render(scene, camera);

      if (!firstFrameRendered) {
        firstFrameRendered = true;
        setIsLoaded(true);
      }
    }

    animate();

    // Responsive Resize Observer with aspect ratio lock
    const resizeObserver = new ResizeObserver(() => {
      if (!mount) return;
      const newWidth = mount.clientWidth || 220;
      const newHeight = mount.clientHeight || 220;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    });

    resizeObserver.observe(mount);

    return () => {
      cancelAnimationFrame(animFrameId);
      domElem.removeEventListener('pointermove', handlePointerMove);
      domElem.removeEventListener('pointerdown', handlePointerDown);
      resizeObserver.disconnect();

      scene.clear();
      renderer.dispose();
      bodyGeometry.dispose();
      bodyMaterial.dispose();
      eyeMaterial.dispose();
      whiteMaterial.dispose();
      mouthMaterial.dispose();
      tongueMaterial.dispose();
      cheekMaterial.dispose();

      if (mount.contains(domElem)) {
        mount.removeChild(domElem);
      }
    };
  }, []);

  const bubbleTailAlignment = {
    center: 'left-1/2 -translate-x-1/2',
    left: 'left-8',
    right: 'right-8',
  }[alignBubble];

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {/* Speech Bubble */}
      {showBubble && message && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="relative mb-2 max-w-xs bg-[#101413]/95 border border-white/10 rounded-2xl px-4 py-3 shadow-2xl text-center backdrop-blur-md z-20"
        >
          <div className="text-sm font-semibold text-white leading-snug">
            {message}
          </div>
          {submessage && (
            <div className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
              {submessage}
            </div>
          )}
          {/* Speech Bubble Tail */}
          <div className={`absolute -bottom-1.5 ${bubbleTailAlignment} w-3 h-3 bg-[#101413] border-r border-b border-white/10 rotate-45`} />
        </motion.div>
      )}

      {/* 3D Canvas Container with Coordinated Crisp Fade-In */}
      <div
        onClick={() => waveTriggerRef.current?.()}
        className={`relative ${canvasClass} flex items-center justify-center cursor-pointer group touch-none transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div ref={mountRef} className="w-full h-full" />

        {interactive && (
          <div className="absolute -bottom-1 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-semibold tracking-wider text-emerald-400 bg-black/80 px-2 py-0.5 rounded-full border border-emerald-500/30 pointer-events-none">
            {isWaving ? 'Waving! 👋' : 'Tap to wave'}
          </div>
        )}
      </div>
    </div>
  );
});

Ake3DCompanion.displayName = 'Ake3DCompanion';
