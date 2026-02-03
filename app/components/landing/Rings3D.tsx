'use client';

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { EffectComposer, RenderPass, UnrealBloomPass } from "../../lib/threePostprocessing";

export default function Rings3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const hoveredRing = useRef<THREE.Group | null>(null);
  const raycaster = useRef(new THREE.Raycaster()); // ← Yeh add kiya (error fix)

  const isDragging = useRef(false);
  const prevX = useRef(0);
  const prevY = useRef(0);
  const rotationXTarget = useRef(15);
  const rotationYTarget = useRef(0);
  const rotationX = useRef(15);
  const rotationY = useRef(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 300;
    let height = container.clientHeight || 300;

    if (width === 0 || height === 0) return;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 8; // ← Badhaya taake glow/box feel kam ho (glow canvas edge se door rahega)

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.appendChild(renderer.domElement);

    // Composer – bloom ko soft banaya (no sharp box)
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.8,   // strength kam kiya (less aggressive glow)
      0.2,   // radius kam (glow tight aur soft)
      0.9    // threshold thoda high (sirf bright areas pe bloom)
    );
    composer.addPass(bloomPass);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.6)); // thoda kam ambient
    const pointLight = new THREE.PointLight(0xffffff, 1.8, 12);
    pointLight.position.set(-2, 2, 5); // thoda door rakha taake spread ho
    scene.add(pointLight);

    const group = new THREE.Group();
    group.rotation.order = "YXZ";
    scene.add(group);

    // Materials & Rings
    const green = new THREE.Color(0x10b981);
    const darkGreen = new THREE.Color(0x064f3a);

    const createRing = (radius: number, opacity: number, emissiveIntensity: number) => {
      const inner = radius - 0.22;
      const mat = new THREE.MeshStandardMaterial({
        color: green,
        transparent: true,
        opacity,
        roughness: 0.15, // thoda zyada roughness taake less sharp shine
        metalness: 0.85,
        emissive: green,
        emissiveIntensity,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(new THREE.RingGeometry(inner, radius, 128), mat);
      const g = new THREE.Group();
      g.add(mesh);
      g.rotation.x = THREE.MathUtils.degToRad(70);
      group.add(g);
      return g;
    };

    const ringA = createRing(1.9, 0.88, 0.3);
    ringA.rotation.z = THREE.MathUtils.degToRad(18);

    const ringB = createRing(1.45, 0.94, 0.35);
    ringB.rotation.z = THREE.MathUtils.degToRad(72);

    const ringC = createRing(0.9, 0.78, 0.25);
    ringC.rotation.z = THREE.MathUtils.degToRad(-8);

    // Core & Aura – soft banaya
    const ballRadius = 0.38;
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(ballRadius, 64, 64),
      new THREE.MeshStandardMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.92,
        roughness: 0.4,
        metalness: 0.7,
        emissive: darkGreen,
        emissiveIntensity: 0.15,
      })
    );
    scene.add(ball);

    const aura = new THREE.Mesh(
      new THREE.SphereGeometry(ballRadius * 1.6, 32, 32), // size badhaya taake glow natural lage
      new THREE.MeshBasicMaterial({
        color: green,
        transparent: true,
        opacity: 0.6, // opacity kam taake sharp na lage
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    ball.add(aura);

    // --- SMOOTH ANIMATION LOOP ---
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.1); // cap delta for no jumps
      const time = clock.getElapsedTime();

      // Rotations
      ringA.rotation.y += (Math.PI * 2 / 8.2) * delta;
      ringB.rotation.y -= (Math.PI * 2 / 9.6) * delta;
      ringC.rotation.y += (Math.PI * 2 / 11.8) * delta * -1;

      // Pulse – smoother curve
      const cos = Math.cos(time * Math.PI * 2 / 4.6);
      const scaleCore = 1.025 - 0.025 * cos;
      ball.scale.setScalar(scaleCore);
      const scaleGlow = 1.005 - 0.005 * cos;
      aura.scale.setScalar(scaleGlow);
      (aura.material as THREE.MeshBasicMaterial).opacity = 0.6 - 0.1 * cos;

      // Mouse drag lerp
      rotationX.current = THREE.MathUtils.lerp(rotationX.current, rotationXTarget.current, 0.12);
      rotationY.current = THREE.MathUtils.lerp(rotationY.current, rotationYTarget.current, 0.12);
      group.rotation.x = THREE.MathUtils.degToRad(rotationX.current);
      group.rotation.y = THREE.MathUtils.degToRad(rotationY.current);

      composer.render();
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);

    // Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      width = container.clientWidth;
      height = container.clientHeight;
      if (width === 0 || height === 0) return;

      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      composer.setSize(width, height);
    });
    resizeObserver.observe(container);

    // Mouse interaction with raycaster
    const mouse = new THREE.Vector2();

    const onMouseMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(mouse, camera);
      const intersects = raycaster.current.intersectObjects([ringA, ringB, ringC], true);
      const hit = intersects[0]?.object.parent as THREE.Group;

      if (hit !== hoveredRing.current) {
        if (hoveredRing.current) {
          gsap.to(hoveredRing.current.scale, { x: 1, y: 1, z: 1, duration: 0.5, ease: "power2.out" });
          gsap.to((hoveredRing.current.children[0] as THREE.Mesh).material, { emissiveIntensity: 0.35, duration: 0.5 });
        }
        if (hit) {
          hoveredRing.current = hit;
          gsap.to(hit.scale, { x: 1.15, y: 1.15, z: 1.15, duration: 0.5, ease: "back.out(1.7)" });
          gsap.to((hit.children[0] as THREE.Mesh).material, { emissiveIntensity: 1.2, duration: 0.5 });
          container.style.cursor = "pointer";
        } else {
          hoveredRing.current = null;
          container.style.cursor = "grab";
        }
      }
    };

    // Touch + Mouse events
    container.addEventListener("mousemove", onMouseMove);

    const handleStart = (clientX: number, clientY: number) => {
      isDragging.current = true;
      prevX.current = clientX;
      prevY.current = clientY;
      container.style.cursor = "grabbing";
    };

    const handleMove = (clientX: number, clientY: number) => {
      if (!isDragging.current) return;
      const deltaX = clientX - prevX.current;
      const deltaY = clientY - prevY.current;
      prevX.current = clientX;
      prevY.current = clientY;
      rotationYTarget.current += deltaX * 0.5;
      rotationXTarget.current -= deltaY * 0.5;
    };

    const handleEnd = () => {
      isDragging.current = false;
      container.style.cursor = "grab";
    };

    const onMouseDown = (e: MouseEvent) => handleStart(e.clientX, e.clientY);
    const onMouseMoveDrag = (e: MouseEvent) => { handleMove(e.clientX, e.clientY); onMouseMove(e); };
    const onMouseUp = () => handleEnd();
    const onTouchStart = (e: TouchEvent) => { if (e.touches.length === 1) handleStart(e.touches[0].clientX, e.touches[0].clientY); };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchEnd = () => handleEnd();

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMoveDrag);
    window.addEventListener("mouseup", onMouseUp);
    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchmove", onTouchMove, { passive: true });
    container.addEventListener("touchend", onTouchEnd);

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animate as any);
      composer.dispose();
      renderer.dispose();
      const gl = renderer.getContext();
      if (gl) gl.getExtension("WEBGL_lose_context")?.loseContext();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-[300px] w-[300px] sm:h-[360px] sm:w-[360px] md:h-[450px] md:w-[450px] overflow-hidden"
    />
  );
}