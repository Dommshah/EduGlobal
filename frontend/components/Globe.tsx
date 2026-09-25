"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface Arc {
  from: [number, number]; // lat, lng
  to: [number, number];
  color: string;
}

const DEMO_ARCS: Arc[] = [
  { from: [28.6, 77.2], to: [51.5, -0.1], color: "#fbbf24" }, // Delhi -> London
  { from: [28.6, 77.2], to: [43.65, -79.38], color: "#818cf8" }, // Delhi -> Toronto
  { from: [28.6, 77.2], to: [-33.87, 151.21], color: "#34d399" }, // Delhi -> Sydney
  { from: [19.07, 72.87], to: [40.71, -74.0], color: "#f472b6" }, // Mumbai -> NYC
  { from: [12.97, 77.59], to: [52.52, 13.4], color: "#38bdf8" }, // Bangalore -> Berlin
  { from: [28.6, 77.2], to: [1.35, 103.82], color: "#fbbf24" }, // Delhi -> Singapore
  { from: [19.07, 72.87], to: [48.86, 2.35], color: "#a78bfa" }, // Mumbai -> Paris
  { from: [28.6, 77.2], to: [25.2, 55.27], color: "#f59e0b" }, // Delhi -> Dubai
];

function latLngToVec3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function makeArc(from: [number, number], to: [number, number], color: string) {
  const R = 2;
  const start = latLngToVec3(from[0], from[1], R);
  const end = latLngToVec3(to[0], to[1], R);
  const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(R * 1.55);

  const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
  const points = curve.getPoints(64);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  const material = new THREE.LineDashedMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity: 0.8,
    dashSize: 0.22,
    gapSize: 0.1,
  });
  const line = new THREE.Line(geometry, material);
  line.computeLineDistances();
  return line;
}

export default function Globe({ className = "" }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hintVisible, setHintVisible] = useState(true);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0.6, 6.4);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return; // WebGL unavailable
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.cursor = "grab";

    // ---------- Globe ----------
    const globe = new THREE.Group();
    scene.add(globe);

    // Real Earth color map (NASA Blue Marble) with specular ocean glint
    const texLoader = new THREE.TextureLoader();
    const earthTex = texLoader.load("/textures/earth-blue-marble.jpg", (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
    });
    const globeMat = new THREE.MeshPhongMaterial({
      map: earthTex,
      emissive: new THREE.Color("#0b1030"),
      emissiveIntensity: 0.55,
      specular: new THREE.Color("#3b4a9e"),
      shininess: 18,
    });
    globe.add(new THREE.Mesh(new THREE.SphereGeometry(2, 64, 64), globeMat));

    // Soft inner rim so the night side never goes fully black
    globe.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(2.01, 48, 48),
        new THREE.MeshBasicMaterial({ color: 0x1b2660, transparent: true, opacity: 0.35, side: THREE.BackSide })
      )
    );

    // Atmosphere glow
    const glowMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.72 - dot(vNormal, vec3(0,0,1.0)), 2.2);
          gl_FragColor = vec4(0.42, 0.5, 1.0, 1.0) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    globe.add(new THREE.Mesh(new THREE.SphereGeometry(2.18, 48, 48), glowMat));

    // ---------- Flight arcs ----------
    const arcGroup = new THREE.Group();
    DEMO_ARCS.forEach((a) => arcGroup.add(makeArc(a.from, a.to, a.color)));
    globe.add(arcGroup);

    // City markers (pulsing)
    const markerGroup = new THREE.Group();
    DEMO_ARCS.forEach((a) => {
      [a.from, a.to].forEach(([lat, lng]) => {
        const m = new THREE.Mesh(
          new THREE.SphereGeometry(0.035, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0xfcd34d })
        );
        m.position.copy(latLngToVec3(lat, lng, 2.03));
        markerGroup.add(m);
      });
    });
    globe.add(markerGroup);

    // ---------- Stars (twinkling, multi-layer) ----------
    function makeStars(count: number, rMin: number, rMax: number, size: number, color: number, opacity: number) {
      const geo = new THREE.BufferGeometry();
      const pos: number[] = [];
      for (let i = 0; i < count; i++) {
        const r = rMin + Math.random() * (rMax - rMin);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        pos.push(r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
      }
      geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      return new THREE.Points(
        geo,
        new THREE.PointsMaterial({ color, size, transparent: true, opacity })
      );
    }
    const starsNear = makeStars(450, 12, 24, 0.055, 0xdbeafe, 0.8);
    const starsFar = makeStars(600, 24, 40, 0.05, 0xa5b4fc, 0.5);
    scene.add(starsNear, starsFar);

    // ---------- Orbit rings + satellites ----------
    const orbitGroup = new THREE.Group();
    orbitGroup.rotation.x = Math.PI / 2.6;
    orbitGroup.rotation.z = 0.4;
    function makeRing(radius: number, color: number, opacity: number) {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 128; i++) {
        const a = (i / 128) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
      }
      return new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity })
      );
    }
    orbitGroup.add(makeRing(3.05, 0xfcd34d, 0.32));
    orbitGroup.add(makeRing(3.45, 0x818cf8, 0.22));
    const satellite = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xfcd34d })
    );
    const satGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.35 })
    );
    satellite.add(satGlow);
    orbitGroup.add(satellite);
    const satellite2 = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xa5b4fc })
    );
    orbitGroup.add(satellite2);
    scene.add(orbitGroup);

    // ---------- Lights ----------
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const key = new THREE.DirectionalLight(0xffffff, 1.35);
    key.position.set(5, 3, 5);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xbfc9ff, 0.5);
    fill.position.set(-4, -1, 3);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xf59e0b, 0.3);
    rim.position.set(-5, -2, -4);
    scene.add(rim);

    // ---------- Interaction ----------
    let targetRotY = 0.6;
    let targetRotX = 0.18;
    let currentRotY = 0.6;
    let currentRotX = 0.18;
    let autoSpeed = 0.0028;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let userInteracted = false;

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      userInteracted = true;
      setHintVisible(false);
      lastX = e.clientX;
      lastY = e.clientY;
      renderer.domElement.style.cursor = "grabbing";
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      targetRotY += (e.clientX - lastX) * 0.005;
      targetRotX += (e.clientY - lastY) * 0.003;
      targetRotX = Math.max(-0.9, Math.min(0.9, targetRotX));
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onPointerUp = () => {
      dragging = false;
      renderer.domElement.style.cursor = "grab";
    };
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      userInteracted = true;
      camera.position.z = Math.max(4.2, Math.min(10, camera.position.z + e.deltaY * 0.004));
    };
    renderer.domElement.addEventListener("wheel", onWheel, { passive: false });

    // ---------- Resize ----------
    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    // ---------- Animate ----------
    let raf = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      if (!userInteracted) targetRotY += autoSpeed;
      currentRotY += (targetRotY - currentRotY) * 0.08;
      currentRotX += (targetRotX - currentRotX) * 0.08;
      globe.rotation.y = currentRotY;
      globe.rotation.x = currentRotX;

      starsNear.rotation.y = t * 0.01;
      starsFar.rotation.y = -t * 0.006;

      // Twinkle
      (starsNear.material as THREE.PointsMaterial).opacity = 0.65 + Math.sin(t * 1.7) * 0.18;
      (starsFar.material as THREE.PointsMaterial).opacity = 0.4 + Math.sin(t * 1.1 + 2) * 0.12;

      // Satellites
      const satA = t * 0.55;
      satellite.position.set(Math.cos(satA) * 3.05, 0, Math.sin(satA) * 3.05);
      const satB = -t * 0.38 + 2.2;
      satellite2.position.set(Math.cos(satB) * 3.45, 0, Math.sin(satB) * 3.45);

      // Pulse markers
      markerGroup.children.forEach((m, i) => {
        const s = 1 + Math.sin(t * 2.4 + i * 0.9) * 0.35;
        m.scale.setScalar(s);
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("wheel", onWheel);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className={`relative ${className}`} data-globe>
      <div ref={mountRef} className="h-full w-full" />
      {hintVisible && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full glass-dark px-4 py-1.5 text-xs text-white/80">
          🌍 Drag to spin · Scroll to zoom
        </div>
      )}
    </div>
  );
}
