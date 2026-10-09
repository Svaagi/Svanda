// <svanda-stage> — intro pixels → wordmark swarm → 3D jukebox, driven by document scroll.
// Publishes progress as CSS vars on :root (--sv-vp, --sv-hero, --sv-nav, --sv-menu, --sv-logo)
// and dispatches window 'svanda' events ({type:'ready'} | {type:'page', page}).
(function () {
  if (customElements.get('svanda-stage')) return;
  const BITMAP = [
    ".###..#...#...##...#...#..###....##.",
    "#.....#...#..#..#..##..#..#..#..#..#",
    ".##....#.#...####..#.#.#..#..#..####",
    "...#...#.#...#..#..#..##..#..#..#..#",
    "###.....#....#..#..#...#..###...#..#"];
  const BW = BITMAP[0].length, BH = BITMAP.length;
  const letterOfCol = []; { let li = -1, prev = true; for (let x = 0; x < BW; x++) { const e = BITMAP.every(r => r[x] === '.'); if (!e && prev) li++; letterOfCol.push(e ? -1 : li); prev = e; } }
  const PAL = ["#5ff5e0", "#ff4fd8", "#ff9a3c", "#b6ff4d", "#7a5cff", "#3ee6ff", "#ff2d6b"];
  const LETTER_COLORS = ["#b6ff4d", "#3ee6ff", "#ff9a3c", "#ff4fd8", "#7a5cff", "#5ff5e0"];
  const LOGO = []; for (let by = 0; by < BH; by++) for (let bx = 0; bx < BW; bx++) if (BITMAP[by][bx] === '#') LOGO.push({ bx, by, letter: letterOfCol[bx] });
  const finalColor = c => LETTER_COLORS[c.letter % LETTER_COLORS.length];

  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hash(a, b, c) { let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const easeInOut = p => p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
  const easeOut = p => 1 - Math.pow(1 - p, 3);
  const easeOutBack = p => { const c1 = 1.2, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
  const lerp = (a, b, p) => a + (b - a) * p;
  function vnoise(x, y, z) {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), fx = x - xi, fy = y - yi, fz = z - zi;
    const sm = v => v * v * (3 - 2 * v), u = sm(fx), v = sm(fy), w = sm(fz);
    const h = (a, b, c) => hash(a * 3 + 1, b * 5 + 2, c * 7 + 3), l = (a, b, p) => a + (b - a) * p;
    return l(l(l(h(xi, yi, zi), h(xi + 1, yi, zi), u), l(h(xi, yi + 1, zi), h(xi + 1, yi + 1, zi), u), v),
      l(l(h(xi, yi, zi + 1), h(xi + 1, yi, zi + 1), u), l(h(xi, yi + 1, zi + 1), h(xi + 1, yi + 1, zi + 1), u), v), w);
  }
  const POP = {
    A(gx, gy, t) { if (hash(gx, gy, 1) > 0.34) return 0; const period = 2.5 + hash(gx, gy, 2) * 5, off = hash(gx, gy, 3) * period, ph = (t + off) % period; return ph < 0.08 ? ph / 0.08 : ph < 1.1 ? Math.pow(1 - (ph - 0.08) / 1.02, 2) : 0; },
    B(gx, gy, t, rows) { let a = 0; for (let k = 0; k < 2; k++) { if (hash(gx, k, 11) > 0.55) continue; const speed = 3 + hash(gx, k, 12) * 5, tail = 5 + Math.floor(hash(gx, k, 13) * 6); const head = Math.floor((t * speed + hash(gx, k, 14) * 60) % (rows + tail + 8)) - 4, d = head - gy; if (d >= 0 && d <= tail) a = Math.max(a, d === 0 ? 1 : 0.55 * (1 - d / tail)); } return a; },
    C(gx, gy, t) { const ts = Math.floor(t * 5) / 5, v = vnoise(gx * 0.13, gy * 0.13, ts * 0.45) * 0.7 + vnoise(gx * 0.4 + 9, gy * 0.4, ts * 0.9) * 0.3; return v > 0.56 ? clamp((v - 0.56) / 0.14, 0, 1) : 0; }
  };

  const INTRO_END = 3.2, NAV_H = 64, HERO_T = 4.6, READY_T = 6.5, LOGO_LAND = INTRO_END + 1.72, PRODUCT_T = 4.75;
  const SPIN = [1, 0, 1, 0], YAW = [-0.45, -0.45, 0.45, 0, 0], SCALE_L = [1.3, 1.5, 1.5, 1.43, 1.3], SCALE_P = [1.35, 1.3, 1.3, 0.8, 0.8], PAGES = 5;   // model grows 50 % once the hero is left
  const loadScript = src => new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  let libsP = null;
  const ensureLibs = () => libsP || (libsP = (async () => { if (!window.THREE) await loadScript('./three.min.js'); if (!window.THREE.OBJLoader) await loadScript('./OBJLoader.js'); })());

  class SvandaStage extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      if (!this.style.position) this.style.position = 'relative';
      this.style.cssText += ';display:block;width:100%;height:100%;overflow:hidden';
      this.cv = [0, 1, 2].map(() => { const c = document.createElement('canvas'); c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block'; this.appendChild(c); return c; });
      this.bctx = this.cv[0].getContext('2d'); this.ctx = this.cv[2].getContext('2d');
      this.W = 0; this.H = 0; this.vp = 0; this.animFrom = 0; this.animTo = 0; this.animStart = -1; this.ready = false; this.ready3D = false; this.page = 0;
      this.pointer = { x: 0, y: 0, tx: 0, ty: 0, active: false }; this.prevVars = {};
      this.wrap = this.closest('[data-sv-wrap]');
      const mode = this.getAttribute('intro-mode') || 'always';
      let skip = mode === 'skip';
      if (mode === 'session') { try { skip = !!sessionStorage.getItem('svanda-intro-seen'); sessionStorage.setItem('svanda-intro-seen', '1'); } catch (e) { } }
      this.t0 = performance.now() - (skip ? (READY_T + 0.2) * 1000 : 0);
      if (!skip) { document.documentElement.style.overflow = 'hidden'; window.scrollTo(0, 0); }
      this.layout();
      this.ro = new ResizeObserver(() => this.layout()); this.ro.observe(this);
      this._onScroll = () => this.onScroll(); this._onWheel = e => this.onWheel(e); this._onMove = e => this.onMove(e); this._onLeave = () => { this.pointer.active = false; };
      // touch: the finger drives the same pixel torch as the mouse, fades out shortly after lift-off
      this._onTouch = e => { const tt = e.touches && e.touches[0]; if (!tt) return; clearTimeout(this._touchOff); const first = !this.pointer.active; this.onMove(tt); if (first) { this.pointer.x = this.pointer.tx; this.pointer.y = this.pointer.ty; } };
      this._onTouchEnd = () => { clearTimeout(this._touchOff); this._touchOff = setTimeout(() => { this.pointer.active = false; }, 700); };
      window.addEventListener('scroll', this._onScroll, { passive: true });
      window.addEventListener('wheel', this._onWheel, { passive: false });
      window.addEventListener('pointermove', this._onMove, { passive: true });
      document.addEventListener('pointerleave', this._onLeave);
      window.addEventListener('touchstart', this._onTouch, { passive: true }); window.addEventListener('touchmove', this._onTouch, { passive: true });
      window.addEventListener('touchend', this._onTouchEnd, { passive: true }); window.addEventListener('touchcancel', this._onTouchEnd, { passive: true });
      this.tick = this.tick.bind(this); this.raf = requestAnimationFrame(this.tick);
      ensureLibs().then(() => fetch('./jukebox.obj')).then(r => r.text()).then(txt => { this.setup3D(txt); this.layout3D(); this.ready3D = true; }).catch(e => console.error('svanda-stage: 3D failed', e));
    }
    disconnectedCallback() {
      cancelAnimationFrame(this.raf); this.ro && this.ro.disconnect(); clearTimeout(this._touchOff);
      window.removeEventListener('touchstart', this._onTouch); window.removeEventListener('touchmove', this._onTouch); window.removeEventListener('touchend', this._onTouchEnd); window.removeEventListener('touchcancel', this._onTouchEnd);
      window.removeEventListener('scroll', this._onScroll); window.removeEventListener('wheel', this._onWheel); window.removeEventListener('pointermove', this._onMove); document.removeEventListener('pointerleave', this._onLeave);
      document.documentElement.style.overflow = '';
    }

    // ---- layout (re-derived from the element's size) ----
    layout() {
      const W = Math.max(1, Math.floor(this.clientWidth)), H = Math.max(1, Math.floor(this.clientHeight));
      if (W === this.W && H === this.H) return; this.W = W; this.H = H;
      for (const c of this.cv) { c.width = W; c.height = H; }
      this.CELL = Math.max(8, Math.min(24, Math.floor((W - 40) / BW)));
      this.SMALL = W < 720 ? 4 : 5;
      this.GW = Math.ceil(W / this.CELL); this.GH = Math.ceil(H / this.CELL);
      this.OX = Math.floor((this.GW - BW) / 2); this.OY = Math.floor((this.GH - BH) / 2);
      this.NAV_LOGO_X = Math.round((W - BW * this.SMALL) / 2); this.NAV_LOGO_Y = (NAV_H - BH * this.SMALL) / 2;
      const rnd = mulberry32(7); this.cells = [];
      for (let y = 0; y < this.GH; y++) for (let x = 0; x < this.GW; x++) {
        const bx = x - this.OX, by = y - this.OY, inLogo = bx >= 0 && bx < BW && by >= 0 && by < BH && BITMAP[by][bx] === '#';
        this.cells.push({ x, y, bx, by, inLogo, letter: inLogo ? letterOfCol[bx] : -1, lock: 1.35 + rnd() * 1.1 + (inLogo ? 0 : 0.15), seed: rnd(), s2: rnd(), s3: rnd() });
      }
      this.logoCells = this.cells.filter(c => c.inLogo);
      this.portrait = H > W;
      this.BGC = Math.max(6, Math.min(this.CELL + 4, Math.floor((W - (this.portrait ? 8 : 40)) / BW)));   // portrait: wordmark ~15 % wider (fills the width)
      this.BG_COLS = Math.ceil(W / this.BGC) + 1; this.BG_ROWS = Math.ceil(H / this.BGC) + 1;
      this.WMC = this.portrait ? this.BGC : this.BGC * 2;
      if (!this.portrait && this.WMC * BW > W - 16) { this.BGC = Math.max(4, Math.floor((W - 16) / (BW * 2))); this.WMC = this.BGC * 2; this.BG_COLS = Math.ceil(W / this.BGC) + 1; this.BG_ROWS = Math.ceil(H / this.BGC) + 1; }
      this.WM_X0 = Math.round((W - BW * this.WMC) / 2); this.WM_Y0 = Math.round(this.portrait ? H * 0.4 - BH * this.WMC / 2 : (H - BH * this.WMC) / 2 + 20);   // portrait: centred on the model
      this.WM_X0 -= this.WM_X0 % this.BGC; this.WM_Y0 -= this.WM_Y0 % this.BGC;   // snap onto the background grid
      this.gridOffX = 0; this.gridOffY = 0;
      this.wmSet = new Set(LOGO.map(c => c.bx + ',' + c.by));
      this.layout3D();
    }
    layout3D() {
      if (!this.renderer) return;
      const aspect = this.W / this.H, tanH = Math.tan(14 * Math.PI / 180);
      this.renderer.setSize(this.W, this.H, false); this.cam.aspect = aspect;
      this.cam.position.z = Math.max(1560, (this.portrait ? 300 : 700) / (tanH * aspect));
      this.cam.lookAt(0, 0, 0); this.cam.updateProjectionMatrix();
      this.JX = this.portrait ? [0, 0, 0, 0, 0] : [0, 400, -400, 0, 0];
      this.JY = this.portrait ? [150, 20, 20, 20, -1400] : [20, -20, -20, -134, -1100]; this.SCALE = (this.portrait ? SCALE_P : SCALE_L).slice(); this.fitCustom();
    }

    // ---- three.js product (materials, env, displays) ----
    fitCustom() {   // custom page: whole model on screen, room for the switches above its display
      if (!this.bbox || !this.cam || !this.JY) return;
      const H = this.clientHeight || window.innerHeight, visH = 2 * this.cam.position.z * Math.tan(this.cam.fov * Math.PI / 360), k = visH / H, half = visH / 2;
      const top = this.bbox.max.y, bot = this.bbox.min.y, scrTop = 226.3, pad = 1.06;   // pad: the face sits nearer the camera than z = 0
      const s = Math.min(1.43, (visH - (this.portrait ? 160 : 96) * k) / ((top - bot) * pad), (visH - (this.portrait ? 228 : 164) * k) / ((scrTop - bot) * pad));
      const lo = -half + (this.portrait ? 80 : 16) * k - bot * s * pad, hi = Math.min(half - 80 * k - top * s * pad, half - 148 * k - scrTop * s * pad);
      this.SCALE[3] = s; this.JY[3] = (lo + hi) / 2;
      if (!this.portrait) {   // desktop karaoke / jukebox: the main display fills its half of the page, cabinet runs off the bottom
        const visW = visH * (this.W / H), sy0 = -120.5, sy1 = 226.3, ss = Math.min((visH - 64 * k) * 0.8 / ((sy1 - sy0) * pad), visW * 0.36 / (200.5 * pad));
        const yc = -32 * k - (sy0 + sy1) / 2 * ss * 1.15 * pad;
        this.SCALE[1] = this.SCALE[2] = ss * 1.15; this.JY[1] = this.JY[2] = yc; this.JX[1] = visW / 4; this.JX[2] = -visW / 4;
      }
      this.JY[0] = -(top + bot) / 2 * this.SCALE[0] - 32 * k;   // hero: model centred in the area below the nav
      if (this.portrait) {   // portrait: karaoke / jukebox model centred between the heading and the body text
        const r0 = this.getBoundingClientRect();
        [[1, 'Karaoke'], [2, 'Jukebox']].forEach(([i, lbl]) => {
          const h2 = document.querySelector('[data-screen-label="' + lbl + '"] h2'), txt = h2 && h2.parentElement.lastElementChild;
          if (!h2 || txt === h2) return;
          const a = h2.getBoundingClientRect().bottom - r0.top, b = txt.getBoundingClientRect().top - r0.top;
          if (b - a > 80) this.JY[i] = half - (a + b) / 2 * k - (top + bot) / 2 * this.SCALE[i] * pad;
        });
      }
      if (this.portrait) {   // portrait: centred between the nav and the hero text
        const hero = document.querySelector('[data-screen-label="Hero"]');
        if (hero) {
          const r0 = this.getBoundingClientRect(), tt = hero.getBoundingClientRect().top - r0.top;
          if (tt > 120) {
            this.JY[0] = half - (64 + tt) / 2 * k - (top + bot) / 2 * this.SCALE[0] * pad;
            const wy = Math.round((64 + tt) / 2 - BH * this.WMC / 2); this.WM_Y0 = wy - wy % this.BGC;   // wordmark centred on the model
          }
        } else if (!this._heroRetry) { this._heroRetry = true; setTimeout(() => { this.fitCustom(); }, 400); }
      }
    }
    setup3D(objText) {
      const T = window.THREE;
      const renderer = this.renderer = new T.WebGLRenderer({ canvas: this.cv[1], antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(1); renderer.outputEncoding = T.sRGBEncoding; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
      const scene = this.scene = new T.Scene();
      this.cam = new T.PerspectiveCamera(28, 16 / 9, 50, 8000); this.cam.position.set(0, 40, 1560);
      const product = new T.OBJLoader().parse(objText);
      const pmrem = new T.PMREMGenerator(renderer);
      const es = new T.Scene(); es.background = new T.Color(0x0a0a0d);
      const panel = (w, h, col, i, x, y, z, rx, ry) => { const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: col })); m.material.color.multiplyScalar(i); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); es.add(m); };
      panel(30, 12, 0xffffff, 3.2, 0, 14, 4, Math.PI / 2, 0); panel(10, 24, 0xe8f4ff, 1.1, -16, 2, 0, 0, Math.PI / 2); panel(10, 24, 0xfff0f8, 0.9, 16, 2, 0, 0, -Math.PI / 2); panel(40, 6, 0xffffff, 0.8, 0, -10, 10, -Math.PI / 2.4, 0); panel(14, 8, 0xffffff, 2.2, 0, 6, -18, 0, 0);
      scene.environment = pmrem.fromScene(es, 0.04).texture;
      const shell = new T.MeshPhysicalMaterial({ color: 0x030304, metalness: 0.25, roughness: 0.45, clearcoat: 1.0, clearcoatRoughness: 0.12, envMapIntensity: 0.55 });
      const glass = new T.MeshPhysicalMaterial({ color: 0x030305, metalness: 0.7, roughness: 0.12, clearcoat: 1, envMapIntensity: 1.2 });
      product.traverse(m => { if (m.isMesh) { m.geometry.computeVertexNormals(); m.material = m.name.startsWith("Display") ? glass : shell; } });
      const SCREEN = { x0: -101.5, x1: 99, y0: -120.5, y1: 226.3, z: 44.9 };
      const sc = this.sc = document.createElement('canvas'); sc.width = 380; sc.height = 657; this.sctx = sc.getContext('2d');
      this.screenTex = new T.CanvasTexture(sc); this.screenTex.encoding = T.sRGBEncoding; this.screenTex.generateMipmaps = false; this.screenTex.minFilter = T.LinearFilter; this.screenTex.magFilter = T.LinearFilter;
      // polygonOffset + slight lift: the screen planes sit on the glass Display meshes and would z-fight (visible flicker at small scales)
      const screenMesh = new T.Mesh(new T.PlaneGeometry(SCREEN.x1 - SCREEN.x0, SCREEN.y1 - SCREEN.y0), new T.MeshBasicMaterial({ map: this.screenTex, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }));
      screenMesh.position.set((SCREEN.x0 + SCREEN.x1) / 2, (SCREEN.y0 + SCREEN.y1) / 2, SCREEN.z + 1); product.add(screenMesh); this.screenMesh = screenMesh; this.screenSize = [SCREEN.x1 - SCREEN.x0, SCREEN.y1 - SCREEN.y0];
      const CHIN = { x0: -34.6, x1: 34.2, y0: -203.7, y1: -133.7, z: 44.9 };
      const cc = this.cc = document.createElement('canvas'); cc.width = 200; cc.height = 204; this.cctx = cc.getContext('2d');
      this.chinTex = new T.CanvasTexture(cc); this.chinTex.encoding = T.sRGBEncoding; this.chinTex.generateMipmaps = false; this.chinTex.minFilter = T.LinearFilter; this.chinTex.magFilter = T.LinearFilter;
      const chinMesh = new T.Mesh(new T.PlaneGeometry(CHIN.x1 - CHIN.x0, CHIN.y1 - CHIN.y0), new T.MeshBasicMaterial({ map: this.chinTex, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }));
      chinMesh.position.set((CHIN.x0 + CHIN.x1) / 2, (CHIN.y0 + CHIN.y1) / 2, CHIN.z + 1); product.add(chinMesh);
      this.pivot = new T.Group(); this.pivot.add(product); scene.add(this.pivot); this.bbox = new T.Box3().setFromObject(product); this.fitCustom();
      scene.add(new T.HemisphereLight(0xffffff, 0x101018, 0.15));
      const key = new T.DirectionalLight(0xffffff, 0.55); key.position.set(400, 700, 600); scene.add(key);
      const rimL = new T.DirectionalLight(0xd8ffe0, 0.7); rimL.position.set(-700, 250, -200); scene.add(rimL);
      const rimR = new T.DirectionalLight(0xffd0f0, 0.5); rimR.position.set(700, -150, -300); scene.add(rimR);
      const fill = new T.DirectionalLight(0x3ee6ff, 0.12); fill.position.set(-300, -400, 500); scene.add(fill);
      this.cursorLight = new T.PointLight(0xffffff, 0, 1400, 1.6); scene.add(this.cursorLight);
      this.cursorTint = new T.PointLight(0xffffff, 0, 900, 2); scene.add(this.cursorTint);
      this.emptyScene = new T.Scene();
      
    }
    drawScreen(t) {
      const s = this.sctx, sc = this.sc;
      {   // pages 1–3 get the live configurator UI laid over the display; the texture itself stays dark
        const cover = (im, alpha) => { if (alpha <= 0) return; s.globalAlpha = alpha; s.drawImage(im, 0, 0, 380, 657); s.globalAlpha = 1; };   // stretch to the display, never crop
        const f = clamp(this.vp - 1.2, 0, 0.6) / 0.6;   // 0 = Karaoke screen, 1 = Jukebox screen
        const intro = 1 - clamp(this.vp / 0.6, 0, 1);   // hero page: just the pixel "S" from the wordmark
        s.fillStyle = "#08080b"; s.fillRect(0, 0, 380, 657);
        
        if (intro > 0) {
          const cell = 30, x0 = Math.round((380 - 4 * cell) / 2), y0 = Math.round((657 - 5 * cell) / 2);
          s.globalAlpha = intro; s.fillStyle = "#08080b"; s.globalAlpha = intro * 0.85; s.fillRect(0, 0, 380, 657); s.globalAlpha = intro;
          for (const k of LOGO) if (k.letter === 0) { const step = Math.floor(t * 1.25 + hash(k.bx, k.by, 3) * 4), col = LETTER_COLORS[Math.floor(hash(k.bx, k.by, step) * LETTER_COLORS.length)]; s.fillStyle = col; s.globalAlpha = intro; s.fillRect(x0 + k.bx * cell + 2, y0 + k.by * cell + 2, cell - 4, cell - 4); }
          s.globalAlpha = 1;
        }
        return;
      }
      s.fillStyle = "#08080b"; s.fillRect(0, 0, 380, 657);
      const cell = 8, x0 = Math.round((380 - BW * cell) / 2), y0 = 150;
      for (const c of LOGO) { const col = finalColor(c); s.fillStyle = col; s.fillRect(x0 + c.bx * cell + 1, y0 + c.by * cell + 1, cell - 2, cell - 2); }
      s.shadowBlur = 0;
      s.fillStyle = "#7ff06d"; s.font = "600 13px system-ui, sans-serif"; s.textAlign = "center"; s.fillText("KARAOKE", 190, 240);
      s.fillStyle = "#e8e8ee"; s.font = "500 18px system-ui, sans-serif"; s.fillText("Vyber si skladbu", 190, 270);
      s.fillStyle = "#1a1a22"; for (let i = 0; i < 4; i++) { s.beginPath(); s.roundRect(30, 310 + i * 52, 320, 40, 8); s.fill(); }
      s.fillStyle = "#3a3a46"; for (let i = 0; i < 4; i++) s.fillRect(50, 326 + i * 52, 140 + (i * 37) % 90, 8);
      for (let i = 0; i < 24; i++) { const v = 0.5 + 0.3 * Math.sin(t * 1.1 + i * 0.55) + 0.2 * Math.sin(t * 0.7 + i * 1.3); const h = 8 + Math.round(v * 26); s.fillStyle = PAL[i % PAL.length]; s.fillRect(30 + i * 14, 636 - h, 9, h); }
      s.textAlign = "left";
    }
    drawChin(t) {
      const c = this.cctx, cc = this.cc;
      c.fillStyle = "#08080b"; c.fillRect(0, 0, 200, 204);
      c.shadowBlur = 0;
      const level = 5.5 + 2.5 * Math.sin(t * 0.9) + 1.2 * Math.sin(t * 1.7); for (let i = 0; i < 10; i++) { const lit = Math.max(0, Math.min(1, level - i)); c.fillStyle = "#1a1a22"; c.fillRect(22 + i * 16, 91, 11, 22); if (lit > 0) { c.globalAlpha = lit; c.fillStyle = PAL[i % PAL.length]; c.fillRect(22 + i * 16, 91, 11, 22); c.globalAlpha = 1; } }
    }

    // ---- scroll → page ----
    vh() { return this.wrap ? this.wrap.clientHeight / PAGES : window.innerHeight; }
    onScroll() {
      if (!this.ready) return;
      const raw = window.scrollY / this.vh(), target = clamp(Math.round(raw), 0, PAGES - 1), page = Math.min(PAGES, Math.round(raw));
      if (target !== this.animTo) { this.animFrom = this.vp; this.animTo = target; this.animStart = performance.now(); }
      if (page !== this.page) { this.page = page; window.dispatchEvent(new CustomEvent('svanda', { detail: { type: 'page', page } })); }
    }
    onWheel(e) {
      if (!this.ready) { e.preventDefault(); return; }
      const vh = this.vh(), cur = Math.round(window.scrollY / vh), dir = Math.sign(e.deltaY);
      const now = performance.now(), sinceLast = now - (this.lastWheel || 0); this.lastWheel = now;   // every event counts as gesture activity, even tiny inertia ticks
      if (!dir) return;
      if (cur >= PAGES && (dir > 0 || window.scrollY > PAGES * vh + 2)) return;   // inside the contact section: native scroll
      e.preventDefault();
      // one gesture = one page: only a fresh gesture (≥ 500 ms of silence before it) can turn a page, and never mid-transition
      if (sinceLast < 500 || now - (this.wheelAt || 0) < 1500) return;
      this.wheelAt = now;
      const next = clamp(cur + dir, 0, PAGES); if (next !== cur) window.scrollTo({ top: next * vh, behavior: 'smooth' });
    }
    onMove(e) {
      const r = this.getBoundingClientRect(); if (!r.width) return;
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1, ny = -(((e.clientY - r.top) / r.height) * 2 - 1);
      const inside = nx >= -1 && nx <= 1 && ny >= -1 && ny <= 1; this.pointer.active = inside;
      if (inside) { this.pointer.tx = nx; this.pointer.ty = ny; }
    }
    currentVp() { if (this.animStart >= 0) { const p = clamp((performance.now() - this.animStart) / 1100, 0, 1); this.vp = lerp(this.animFrom, this.animTo, easeInOut(p)); } return this.vp; }
    pageState(vp) {
      const k = Math.min(3, Math.floor(vp)), f = clamp(vp - k, 0, 1);
      return { k, f, jx: lerp(this.JX[k], this.JX[k + 1], f), jy: lerp(this.JY[k], this.JY[k + 1], easeInOut(f)), yaw: lerp(YAW[k], YAW[k + 1], f), scale: lerp(this.SCALE[k], this.SCALE[k + 1], easeInOut(f)), spin: Math.PI * 2 * (SPIN.slice(0, k).reduce((a, b) => a + b, 0) + SPIN[k] * f) };
    }

    // ---- drawing ----
    blockSize(t) { return t < 1.0 ? 3 : t < 1.7 ? 2 : 1; }
    noiseColor(c, t) { const bs = this.blockSize(t), bx = Math.floor(c.x / bs), by = Math.floor(c.y / bs), step = Math.floor(t * 7 + hash(bx, by, 9) * 3); if (hash(bx, by, step * 3 + 1) >= 0.48) return null; return PAL[Math.floor(hash(bx, by, step * 3 + 2) * PAL.length)]; }
    drawCell(x, y, size, col, alpha = 1, glow = 5, gap = 1) { const ctx = this.ctx; ctx.globalAlpha = alpha; ctx.fillStyle = col; ctx.fillRect(x + gap, y + gap, size - 2 * gap, size - 2 * gap); ctx.globalAlpha = 1; }
    drawIntro(t, hideLogo) {
      const ctx = this.ctx, CELL = this.CELL;
      for (const c of this.cells) {
        if (t < c.lock) {
          const density = t < 1.3 ? 1 : Math.max(0.15, 1 - (t - 1.3) / 1.4), n = this.noiseColor(c, t), bs = this.blockSize(t);
          if (n && hash(Math.floor(c.x / bs), Math.floor(c.y / bs), 77) < density + 0.05) {
            const gx = (c.x % bs === 0) ? 1 : 0, gy = (c.y % bs === 0) ? 1 : 0, gx2 = (c.x % bs === bs - 1) ? 1 : 0, gy2 = (c.y % bs === bs - 1) ? 1 : 0;
            ctx.fillStyle = n; ctx.fillRect(c.x * CELL + gx, c.y * CELL + gy, CELL - gx - gx2, CELL - gy - gy2);
          }
        } else if (c.inLogo && !hideLogo) this.drawCell(c.x * CELL, c.y * CELL, CELL, t - c.lock < 0.12 ? (this.light ? "#14141a" : "#fff") : finalColor(c));
        else if (!c.inLogo) { const dt = t - c.lock; if (dt < 0.25) { const n = this.noiseColor(c, c.lock); if (n) this.drawCell(c.x * CELL, c.y * CELL, CELL, n, 1 - dt / 0.25, 0); } }
      }
    }
    drawSwarm(t) {
      const CELL = this.CELL, SMALL = this.SMALL;
      for (const c of this.logoCells) {
        const delay = 0.55 * (c.bx / BW) + c.seed * 0.3, p = clamp((t - INTRO_END - delay) / 0.85, 0, 1), e = easeInOut(p);
        const sx = c.x * CELL, sy = c.y * CELL, ex = this.NAV_LOGO_X + c.bx * SMALL, ey = this.NAV_LOGO_Y + c.by * SMALL;
        const cx = lerp(sx, ex, 0.5) + (c.s2 - 0.5) * 320, cy = Math.min(sy, ey) - 140 - c.s3 * 260;
        const bez = q => [(1 - q) * (1 - q) * sx + 2 * (1 - q) * q * cx + q * q * ex, (1 - q) * (1 - q) * sy + 2 * (1 - q) * q * cy + q * q * ey];
        const [x, y] = bez(e);
        if (p > 0 && p < 1) for (let k = 1; k <= 3; k++) { const eb = easeInOut(clamp(p - k * 0.04, 0, 1)), [tx, ty] = bez(eb); this.drawCell(tx, ty, lerp(CELL, SMALL, eb), finalColor(c), 0.25 / k, 0); }
        this.drawCell(x, y, lerp(CELL, SMALL, e), finalColor(c), 1, p < 1 ? 4 : 0, p < 1 ? 1 : 0.5);
      }
    }
    isWordmark(gx, gy) { return this.wmSet.has((gx - (this.WM_X0 - this.gridOffX) / this.BGC) + ',' + (gy - (this.WM_Y0 - this.gridOffY) / this.BGC)); }
    drawHeroBg(p, t) {
      const b = this.bctx, { W, H, BGC } = this;
      b.clearRect(0, 0, W, H); if (p <= 0) return;
      const pop = POP[this.bgVariant], wmA = p * 0.95 * (1 - clamp(this.vp * 1.6, 0, 1));
      for (let gy = 0; gy < this.BG_ROWS; gy++) for (let gx = 0; gx < this.BG_COLS; gx++) {
        const x = gx * BGC + this.gridOffX - BGC, y = gy * BGC + this.gridOffY - BGC;
        if (y + BGC < NAV_H) continue;
        const a = pop(gx, gy, t, this.BG_ROWS);
        if (a > 0.02) {
          const g = this.light ? 0xdc - Math.round(0x26 * hash(gx, gy, 5)) : 0x22 + Math.round(0x26 * hash(gx, gy, 5));
          b.globalAlpha = p * a * 0.85; b.fillStyle = `rgb(${g},${g},${g + 3})`; b.fillRect(x + 1, y + 1, BGC - 2, BGC - 2);
        }
      }
      const WMC = this.WMC;
      const sub = Math.round(WMC / BGC);
      for (const k of LOGO) for (let sy = 0; sy < sub; sy++) for (let sx = 0; sx < sub; sx++) {
        const x = this.WM_X0 + k.bx * WMC + sx * BGC, y = this.WM_Y0 + k.by * WMC + sy * BGC;
        const gx = Math.round(x / BGC), gy = Math.round(y / BGC), a = pop(gx, gy, t, this.BG_ROWS);
        const grad = k.bx / BW, v = this.light ? Math.max(0, 0xc6 - Math.round(0x12 * grad) - Math.round(70 * a)) : Math.min(255, 0x2c + Math.round(0x12 * grad) + Math.round(70 * a));
        b.globalAlpha = wmA; b.fillStyle = `rgb(${v},${v},${v + 4})`; b.fillRect(x + 1, y + 1, BGC - 2, BGC - 2);
      }
      if (this.pointer.active) {
        // pixel torch: grid cells light up in 4 stepped intensities around the cursor
        const cx = (this.pointer.x + 1) / 2 * W, cy = (1 - this.pointer.y) / 2 * H, R = 240, gxc = Math.round((cx - this.gridOffX) / BGC), gyc = Math.round((cy - this.gridOffY) / BGC), n = Math.ceil(R / BGC);
        for (let gy = gyc - n; gy <= gyc + n; gy++) for (let gx = gxc - n; gx <= gxc + n; gx++) {
          const x = gx * BGC + this.gridOffX, y = gy * BGC + this.gridOffY; if (y + BGC < NAV_H) continue;
          const d = Math.hypot(x + BGC / 2 - cx, y + BGC / 2 - cy); if (d > R) continue;
          const a = Math.ceil(Math.pow(1 - d / R, 1.6) * 4) / 4;
          if (hash(gx, gy, 21) > 0.35 + a) continue;
          b.globalAlpha = p * a * (this.light ? 0.16 : 0.22); b.fillStyle = this.light ? "#14141a" : "#ffffff"; b.fillRect(x + 1, y + 1, BGC - 2, BGC - 2);
        }
      }
      const sh = this.shadow;
      if (sh && sh.a > 0.02 && sh.hull.length > 2) {   // pixel shadow on the imaginary floor, snapped to the background grid
        const hl = sh.hull, xs = hl.map(p => p[0]), ys = hl.map(p => p[1]);
        const inside = (px, py) => { let o = false; for (let i = 0, j = hl.length - 1; i < hl.length; j = i++) { const [xi, yi] = hl[i], [xj, yj] = hl[j]; if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) o = !o; } return o; };
        const g0 = Math.floor((Math.min(...xs) - this.gridOffX) / BGC), g1 = Math.ceil((Math.max(...xs) - this.gridOffX) / BGC);
        const r0 = Math.floor((Math.min(...ys) - this.gridOffY) / BGC), r1 = Math.ceil((Math.max(...ys) - this.gridOffY) / BGC);
        b.fillStyle = this.light ? '#14141a' : '#ffffff';
        b.globalAlpha = p * sh.a * (this.light ? 0.28 : 0.2);
        for (let gy = r0; gy <= r1; gy++) for (let gx = g0; gx <= g1; gx++) {
          const x = gx * BGC + this.gridOffX, y = gy * BGC + this.gridOffY;
          if (y + BGC >= NAV_H && inside(x + BGC / 2, y + BGC / 2)) b.fillRect(x + 1, y + 1, BGC - 2, BGC - 2);
        }
      }
      b.globalAlpha = 1;
    }
    updateCursorLight(heroP) {
      const pt = this.pointer; pt.x += (pt.tx - pt.x) * 0.12; pt.y += (pt.ty - pt.y) * 0.12;
      const lx = pt.x * 520, ly = pt.y * 330 + 20, on = (pt.active ? 1 : 0) * heroP;
      this.cursorLight.position.set(lx, ly, 330); this.cursorTint.position.set(lx, ly, 260);
      this.cursorLight.intensity = 2.6 * on; this.cursorTint.intensity = 0.7 * on;
      return { rx: -pt.y * 0.06 * on, ry: pt.x * 0.12 * on };
    }
    drawProduct(t) {
      if (!this.ready3D) return;
      const p = clamp((t - PRODUCT_T) / 1.3, 0, 1), r = this.renderer;
      if (p <= 0) { r.setClearColor(0x000000, 0); r.clear(); r.render(this.emptyScene, this.cam); return; }
      this.drawScreen(t); this.screenTex.needsUpdate = true; this.drawChin(t); this.chinTex.needsUpdate = true;
      const rise = easeOutBack(p), ps = this.pageState(this.vp), pv = this.pivot;
      pv.position.set(ps.jx, lerp(-900, ps.jy, rise), 0);
      const idle = Math.sin((t - PRODUCT_T) * 0.9) * 0.06, par = this.updateCursorLight(p);
      const calm = 1 - clamp(Math.abs(this.vp - 3) * 2, 0, 1), wob = 1 - calm;   // custom page: model stands still, face-on, so the live UI can sit on its display
      pv.rotation.set((0.12 + par.rx) * wob + (1 - rise) * 0.35, ps.yaw + (1 - easeOut(p)) * 1.4 + (idle + par.ry) * wob + ps.spin, 0.03 * wob);
      const s = lerp(0.85, 1, rise) * ps.scale; pv.scale.set(s, s, s);
      r.render(this.scene, this.cam);
      {   // cabinet base footprint + its copy pushed along the ground by a light from 135° (upper-left) → convex hull on screen
        const T = window.THREE, bb = this.bbox; pv.updateMatrixWorld(true);
        const wc = [];
        for (const x of [bb.min.x, bb.max.x]) for (const z of [bb.min.z, bb.max.z]) wc.push(new T.Vector3(x, bb.min.y, z).applyMatrix4(pv.matrixWorld));
        const span = Math.max(...wc.map(v => v.x)) - Math.min(...wc.map(v => v.x)), off = span * 0.16;
        const pts = [];
        wc.forEach(v => [[0, 0], [off, off * 0.7]].forEach(([dx, dz]) => {
          const q = v.clone(); q.x += dx; q.z += dz; q.project(this.cam);
          pts.push([(q.x + 1) / 2 * this.W, (1 - q.y) / 2 * this.H]);
        }));
        pts.sort((p, q) => p[0] - q[0] || p[1] - q[1]);
        const cr = (o, p, q) => (p[0] - o[0]) * (q[1] - o[1]) - (p[1] - o[1]) * (q[0] - o[0]), lo = [], up = [];
        for (const p of pts) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
        for (const p of pts.slice().reverse()) { while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
        this.shadow = { hull: lo.slice(0, -1).concat(up.slice(0, -1)), a: rise };
      }
      this.emitScreen(calm);
    }
    emitScreen(calm) {
      const T = window.THREE, m = this.screenMesh; if (!m) return;
      m.updateMatrixWorld(true); const cr = this.cv[1].getBoundingClientRect(), [w, h] = this.screenSize;
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; const pts = [];
      for (const [a, b] of [[-1, 1], [1, 1], [1, -1], [-1, -1]]) { const v = new T.Vector3(a * w / 2, b * h / 2, 0).applyMatrix4(m.matrixWorld).project(this.cam); const px = cr.left + (v.x + 1) / 2 * cr.width, py = cr.top + (1 - v.y) / 2 * cr.height; pts.push([Math.round(px * 10) / 10, Math.round(py * 10) / 10]); x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py); }
      const d = { type: 'screen', x: Math.round(x0), y: Math.round(y0), w: Math.round(x1 - x0), h: Math.round(y1 - y0), calm: +calm.toFixed(2), vp: +this.vp.toFixed(3), pts }, k = [d.x, d.y, d.w, d.h, d.calm, d.vp, pts.join()].join();
      if (k !== this.lastScreen) { this.lastScreen = k; this.screenRect = d; window.dispatchEvent(new CustomEvent('svanda', { detail: d })); }
    }
    render(t) {
      const ctx = this.ctx, { W, H } = this;
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = this.bg;
      const heroP = clamp((t - HERO_T) / 0.9, 0, 1);
      const moving = this.animStart >= 0 && performance.now() - this.animStart < 1150;
      if (moving || this.pointer.active || t < LOGO_LAND + 1 || t - (this._bgT || 0) > 0.05) { this._bgT = t; this.drawHeroBg(heroP, t); }   // idle background at 20 fps
      if (t < HERO_T) ctx.fillRect(0, 0, W, H); else if (heroP < 1) { ctx.globalAlpha = 1 - heroP; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
      if (t < INTRO_END) { this.drawIntro(t); this.drawProduct(t); return; }
      if (t < INTRO_END + 0.3) this.drawIntro(INTRO_END, true);
      if (t < LOGO_LAND) this.drawSwarm(t);
      this.drawProduct(t);
    }
    setVars(t) {
      const v = { '--sv-vp': this.vp.toFixed(4), '--sv-hero': clamp((t - 5.6) / 0.7, 0, 1).toFixed(3), '--sv-nav': clamp((t - INTRO_END - 0.6) / 0.5, 0, 1).toFixed(3), '--sv-menu': clamp((t - INTRO_END - 1.2) / 0.8, 0, 1).toFixed(3), '--sv-logo': t >= LOGO_LAND ? '1' : '0' };
      const rs = document.documentElement.style;
      for (const k in v) if (this.prevVars[k] !== v[k]) { rs.setProperty(k, v[k]); this.prevVars[k] = v[k]; }
    }
    tick(now) {
      this.raf = requestAnimationFrame(this.tick);
      const t = (now - this.t0) / 1000;
      if (!this.ready && t >= READY_T) { this.ready = true; document.documentElement.style.overflow = ''; window.dispatchEvent(new CustomEvent('svanda', { detail: { type: 'ready' } })); this.onScroll(); }
      const bv = this.getAttribute('bg') || 'A'; this.bgVariant = POP[bv] ? bv : 'A'; this.light = this.getAttribute('theme') === 'light'; this.bg = this.light ? '#f5f5f2' : '#050507'; if (this.style.background !== this.bg) this.style.background = this.bg;
      this.currentVp();
      const wr = this.wrap && this.wrap.getBoundingClientRect();
      const idle = this.ready && !(this.animStart >= 0 && now - this.animStart < 1150) && !this.pointer.active;
      if ((!wr || wr.bottom > 0) && (!idle || now - (this._rT || 0) > 31)) { this._rT = now; this.render(t); }   // full rate while moving, 30 fps idle   // skip all drawing while scrolled past the stage (contact section)
      this.setVars(t);
    }
  }
  customElements.define('svanda-stage', SvandaStage);
})();
