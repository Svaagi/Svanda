import { useEffect, useRef } from 'react';
import * as THREE from 'three';

import styles from './hero3d.module.css';

const MIC_SCALE = 0.62;

// Resting orientation — mic lies on its side, head end slightly raised
// (sphere radius > handle radius, so head lifts the end it rests on)
const REST_Q = new THREE.Quaternion().setFromEuler(
  new THREE.Euler(0.08, 0.45, Math.PI / 2 - 0.1)
);

const Hero3D = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const W = window.innerWidth;
    const H = window.innerHeight;

    // ── Renderer ─────────────────────────────
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.cssText =
      'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;';
    mount.appendChild(renderer.domElement);

    // ── Scene & camera ────────────────────────
    const scene  = new THREE.Scene();
    const CAM_Z  = 6;
    const FOV    = 30;
    const camera = new THREE.PerspectiveCamera(FOV, W / H, 0.1, 100);
    camera.position.z = CAM_Z;

    // ── World-space helpers ───────────────────
    const vFov        = (FOV / 180) * Math.PI;
    const worldH      = 2 * Math.tan(vFov / 2) * CAM_Z;
    const worldW      = worldH * (W / H);
    const toWorld     = (dx: number, dy: number) =>
      [dx * (worldW / W), -dy * (worldH / H)] as const;

    const WORLD_BOTTOM = -(worldH / 2);   // absolute floor in world units
    const CEILING      =  (worldH / 2) - 1.64 * MIC_SCALE;
    const BOUND_X      =  (worldW / 2) - 0.5;

    // ── Lights ────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const sun = new THREE.DirectionalLight(0xffffff, 1.8);
    sun.position.set(4, 6, 5);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xddeeff, 0.5);
    fill.position.set(-4, 2, 3);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffffff, 0.3);
    rim.position.set(0, -4, 2);
    scene.add(rim);

    // ── Materials ─────────────────────────────
    const darkMetal = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.90, roughness: 0.20 });
    const grilleMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.40, roughness: 0.90 });
    const ringMat   = new THREE.MeshStandardMaterial({ color: 0x303030, metalness: 0.95, roughness: 0.10 });
    const wireMat   = new THREE.MeshBasicMaterial({ color: 0x555555, wireframe: true, transparent: true, opacity: 0.18 });

    // ── Mic geometry ──────────────────────────
    const mic = new THREE.Group();
    mic.scale.setScalar(MIC_SCALE);
    scene.add(mic);

    const addPart = (geo: THREE.BufferGeometry, mat: THREE.Material, y: number) => {
      geo.computeBoundingBox(); // needed for Box3.setFromObject
      const m = new THREE.Mesh(geo, mat);
      m.position.y = y;
      mic.add(m);
    };

    addPart(new THREE.SphereGeometry(0.46, 48, 48), grilleMat, 1.18);
    addPart(new THREE.SphereGeometry(0.468, 16, 10), wireMat, 1.18);
    addPart(new THREE.CylinderGeometry(0.28, 0.28, 0.14, 40), ringMat, 0.66);
    addPart(new THREE.CylinderGeometry(0.215, 0.215, 1.62, 40), darkMetal, -0.16);
    addPart(new THREE.CylinderGeometry(0.235, 0.195, 0.14, 40), ringMat, -1.0);

    mic.quaternion.setFromEuler(new THREE.Euler(-0.18, 0.42, 0));
    mic.position.x = worldW * 0.28;

    // ── Physics state ─────────────────────────
    const s = {
      dragging:    false,
      everDragged: false,
      pvx: 0, pvy: 0,
      rotAxis:  new THREE.Vector3(1, 0, 0),
      rotSpeed: 0,
      lastX: 0, lastY: 0,
      lastWX: 0, lastWY: 0,
    };

    const GRAVITY = 0.005;

    // Reused Box3 — no allocation per frame
    const box3 = new THREE.Box3();

    // Push mic up so its lowest geometry point is exactly WORLD_BOTTOM.
    // Returns true if the mic is now resting on the floor.
    const clampFloor = (): boolean => {
      box3.setFromObject(mic);
      if (box3.min.y < WORLD_BOTTOM) {
        mic.position.y += WORLD_BOTTOM - box3.min.y;
        return true;
      }
      return box3.min.y <= WORLD_BOTTOM + 0.02;
    };

    // ── Animation loop ────────────────────────
    let animId: number;
    let prev = performance.now();
    const tmpQ = new THREE.Quaternion();

    const tick = () => {
      animId = requestAnimationFrame(tick);
      const now = performance.now();
      const dt  = Math.min((now - prev) / 1000, 0.05);
      prev = now;

      if (!s.dragging) {
        if (!s.everDragged) {
          // Levitation — pure vertical bob
          mic.position.y = Math.sin(now * 0.0008) * 0.14;

        } else {
          // ── Gravity & movement ────────────────
          s.pvy -= GRAVITY;
          mic.position.x += s.pvx;
          mic.position.y += s.pvy;
          s.pvx *= Math.pow(0.88, dt * 60);

          // Ceiling
          if (mic.position.y > CEILING) {
            mic.position.y = CEILING;
            if (s.pvy > 0) s.pvy = -s.pvy * 0.18;
          }

          // Side walls
          if (mic.position.x >  BOUND_X) { mic.position.x =  BOUND_X; s.pvx = -Math.abs(s.pvx) * 0.35; }
          if (mic.position.x < -BOUND_X) { mic.position.x = -BOUND_X; s.pvx =  Math.abs(s.pvx) * 0.35; }

          // ── Floor — exact bounding box ────────
          const onFloor = clampFloor();
          if (onFloor && s.pvy < 0) {
            s.pvy      = -s.pvy * 0.18;
            s.pvx     *= 0.65;
            s.rotSpeed *= 0.35;
            if (Math.abs(s.pvy) < 0.005) s.pvy = 0;
          }

          // ── Spin ──────────────────────────────
          if (Math.abs(s.rotSpeed) > 0.0001) {
            tmpQ.setFromAxisAngle(s.rotAxis, s.rotSpeed);
            mic.quaternion.premultiply(tmpQ);
            s.rotSpeed *= Math.pow(onFloor ? 0.80 : 0.90, dt * 60);
          }

          // ── Settle flat — slerp + re-clamp each frame ─
          // clampFloor() after slerp keeps mic pinned to floor
          // even as geometry lowest-point changes with orientation.
          if (onFloor && s.pvy === 0) {
            mic.quaternion.slerp(REST_Q, 0.25);
            clampFloor();
          }
        }
      }

      renderer.render(scene, camera);
    };
    tick();

    // ── Pointer events ────────────────────────
    const onDown = (e: PointerEvent) => {
      s.dragging    = true;
      s.everDragged = true;
      s.lastX    = e.clientX;
      s.lastY    = e.clientY;
      s.lastWX   = 0;
      s.lastWY   = 0;
      s.pvx      = 0;
      s.pvy      = 0;
      s.rotSpeed = 0;
      mount.setPointerCapture(e.pointerId);
      mount.style.cursor = 'grabbing';
    };

    const onMove = (e: PointerEvent) => {
      if (!s.dragging) return;
      const dx = e.clientX - s.lastX;
      const dy = e.clientY - s.lastY;
      s.lastX = e.clientX;
      s.lastY = e.clientY;

      const [wx, wy] = toWorld(dx, dy);
      s.lastWX = wx;
      s.lastWY = wy;

      mic.position.x = Math.max(-BOUND_X, Math.min(BOUND_X, mic.position.x + wx));
      mic.position.y += wy;
      clampFloor(); // hard clamp — no part goes through floor during drag

      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 6) {
        s.rotAxis.set(-dy / dist, dx / dist, 0).normalize();
        s.rotSpeed = dist * 0.004;
        tmpQ.setFromAxisAngle(s.rotAxis, s.rotSpeed);
        mic.quaternion.premultiply(tmpQ);
      }
    };

    const onUp = () => {
      s.dragging = false;
      box3.setFromObject(mic);
      const atFloor = box3.min.y <= WORLD_BOTTOM + 0.02;
      s.pvx = s.lastWX * 0.5;
      s.pvy = (atFloor && s.lastWY < 0) ? 0 : s.lastWY * 0.5;
      mount.style.cursor = 'grab';
    };

    mount.addEventListener('pointerdown', onDown);
    mount.addEventListener('pointermove', onMove);
    mount.addEventListener('pointerup', onUp);
    mount.addEventListener('pointercancel', onUp);

    return () => {
      cancelAnimationFrame(animId);
      mount.removeEventListener('pointerdown', onDown);
      mount.removeEventListener('pointermove', onMove);
      mount.removeEventListener('pointerup', onUp);
      mount.removeEventListener('pointercancel', onUp);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div ref={mountRef} className={styles.scene}>
      <span className={styles.hint}>drag · toss · spin</span>
    </div>
  );
};

export default Hero3D;
