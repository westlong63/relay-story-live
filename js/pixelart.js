/* Relay Story Live · 픽셀아트 장면 그리기 (외부 그림 서비스 없이 브라우저에서 바로 그림)
   320×180으로 그린 뒤 크게 키워서 16비트 게임 느낌을 냅니다.
   PixelArt.compose(text, names, seed) → { canvas(320×180), big(1280×720), bg } */
(function (global) {
  "use strict";
  const W = 320, H = 180;
  const P = {
    NIGHT_TOP: [16, 18, 48], NIGHT_BOTTOM: [52, 44, 104], DAWN_TOP: [64, 72, 150], DAWN_BOTTOM: [255, 170, 120],
    DAY_TOP: [96, 160, 240], DAY_BOTTOM: [190, 226, 255], STAR: [255, 246, 200], MOON: [250, 240, 200], SUN: [255, 236, 150],
    WALL: [92, 84, 120], WALL_DARK: [66, 58, 92], ROOF: [60, 40, 70], WINDOW_DARK: [40, 44, 80], WINDOW_LIT: [255, 214, 120],
    MAGIC: [120, 255, 230], MAGIC_SOFT: [90, 200, 220], GROUND: [44, 40, 64], SIDEWALK: [78, 74, 100], GRASS: [70, 150, 90],
    SKIN: [255, 214, 180], BLUSH: [255, 160, 160], INK: [30, 24, 40], PAPER: [250, 244, 226], WOOD: [140, 92, 60],
    WOOD_DARK: [100, 64, 44], GOLD: [255, 204, 64], WHITE: [255, 255, 255],
  };
  const CHARACTERS = {
    Mina: { hair: [24, 22, 30], top: [255, 206, 60], top_dark: [220, 160, 30], pants: [52, 64, 120], shoes: [240, 240, 240], style: "bob", hood: true },
    Jun: { hair: [70, 44, 30], top: [70, 130, 230], top_dark: [44, 90, 180], pants: [90, 90, 100], shoes: [40, 40, 40], style: "spiky", glasses: true },
  };

  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i) * (i + 1)) >>> 0; return h; }

  /* ---------- 작은 래스터(픽셀 버퍼) ---------- */
  class R {
    constructor(w, h, bg) { this.w = w; this.h = h; this.d = new Uint8ClampedArray(w * h * 4); if (bg) this.rect(0, 0, w - 1, h - 1, bg); }
    px(x, y, c, a) {
      x = Math.round(x); y = Math.round(y);
      if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
      const i = (y * this.w + x) * 4, d = this.d;
      if (a == null || a >= 255) { d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255; return; }
      if (a <= 0) return;
      const t = a / 255;
      d[i] = d[i] + (c[0] - d[i]) * t; d[i + 1] = d[i + 1] + (c[1] - d[i + 1]) * t; d[i + 2] = d[i + 2] + (c[2] - d[i + 2]) * t;
      d[i + 3] = Math.max(d[i + 3], a);
    }
    rect(x0, y0, x1, y1, fill, outline, a) {
      if (x0 > x1) [x0, x1] = [x1, x0]; if (y0 > y1) [y0, y1] = [y1, y0];
      x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
      if (fill) for (let y = Math.max(0, y0); y <= Math.min(this.h - 1, y1); y++) for (let x = Math.max(0, x0); x <= Math.min(this.w - 1, x1); x++) this.px(x, y, fill, a);
      if (outline) { for (let x = x0; x <= x1; x++) { this.px(x, y0, outline); this.px(x, y1, outline); } for (let y = y0; y <= y1; y++) { this.px(x0, y, outline); this.px(x1, y, outline); } }
    }
    roundRect(x0, y0, x1, y1, r, fill) {
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        const cx = x < x0 + r ? x0 + r : x > x1 - r ? x1 - r : x, cy = y < y0 + r ? y0 + r : y > y1 - r ? y1 - r : y;
        if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r + 0.5) this.px(x, y, fill);
      }
    }
    ellipse(x0, y0, x1, y1, fill, outline, width, a) {
      const rx = (x1 - x0 + 1) / 2, ry = (y1 - y0 + 1) / 2, cx = x0 + rx - 0.5, cy = y0 + ry - 0.5, wd = width || 1;
      for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) for (let x = Math.floor(x0); x <= Math.ceil(x1); x++) {
        const v = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
        if (v > 1) continue;
        const inner = rx > wd && ry > wd ? ((x - cx) / (rx - wd)) ** 2 + ((y - cy) / (ry - wd)) ** 2 : 0;
        if (outline && inner > 1) this.px(x, y, outline, a);
        else if (fill) this.px(x, y, fill, a);
      }
    }
    polygon(pts, fill, a) {
      const ys = pts.map((p) => p[1]);
      for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) {
        const xs = [];
        for (let i = 0; i < pts.length; i++) {
          const [xa, ya] = pts[i], [xb, yb] = pts[(i + 1) % pts.length];
          if ((ya <= y && y < yb) || (yb <= y && y < ya)) xs.push(xa + ((y - ya) * (xb - xa)) / (yb - ya));
        }
        xs.sort((p, q) => p - q);
        for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.ceil(xs[k] - 0.01); x <= Math.floor(xs[k + 1] + 0.01); x++) this.px(x, y, fill, a);
      }
      if (a == null) for (let i = 0; i < pts.length; i++) this.line([pts[i], pts[(i + 1) % pts.length]], fill);
    }
    line(pts, c, width, a) {
      for (let i = 0; i + 1 < pts.length; i++) {
        let [x0, y0] = pts[i].map(Math.round), [x1, y1] = pts[i + 1].map(Math.round);
        const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
        let err = dx + dy;
        for (;;) {
          this.px(x0, y0, c, a);
          if (width > 1) { if (dx > -dy) this.px(x0, y0 + 1, c, a); else this.px(x0 + 1, y0, c, a); }
          if (x0 === x1 && y0 === y1) break;
          const e2 = 2 * err;
          if (e2 >= dy) { err += dy; x0 += sx; }
          if (e2 <= dx) { err += dx; y0 += sy; }
        }
      }
    }
    blit(src, dx, dy, scale, flip) {
      scale = scale || 1;
      for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) {
        const i = (y * src.w + x) * 4;
        if (src.d[i + 3] === 0) continue;
        const c = [src.d[i], src.d[i + 1], src.d[i + 2]], sxp = flip ? src.w - 1 - x : x;
        for (let yy = 0; yy < scale; yy++) for (let xx = 0; xx < scale; xx++) this.px(dx + sxp * scale + xx, dy + y * scale + yy, c);
      }
    }
    toCanvas() {
      const c = document.createElement("canvas"); c.width = this.w; c.height = this.h;
      c.getContext("2d").putImageData(new ImageData(this.d, this.w, this.h), 0, 0);
      return c;
    }
  }

  /* ---------- 공통 그리기 ---------- */
  function sky(d, top, bottom, y0 = 0, y1 = H, bands = 12) {
    const h = y1 - y0;
    for (let i = 0; i < bands; i++) {
      const t = i / (bands - 1), c = [0, 1, 2].map((k) => Math.round(top[k] + (bottom[k] - top[k]) * t));
      d.rect(0, y0 + Math.floor((h * i) / bands), W, y0 + Math.floor((h * (i + 1)) / bands), c);
    }
  }
  function stars(d, seed, n, yMax = 110) {
    const r = rng(seed);
    for (let i = 0; i < n; i++) {
      const x = Math.floor(r() * W), y = Math.floor(r() * yMax);
      d.px(x, y, P.STAR);
      if (r() < 0.15) for (const [ax, ay] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) d.px(x + ax, y + ay, [200, 200, 255]);
    }
  }
  function glow(d, x, y, r, c, strength = 150) {
    for (let yy = Math.floor(y - r); yy <= Math.ceil(y + r); yy++) for (let xx = Math.floor(x - r); xx <= Math.ceil(x + r); xx++) {
      const dist = Math.hypot(xx - x, yy - y);
      if (dist > r) continue;
      let i = r; while (i - 2 > 0 && dist <= i - 2) i -= 2;
      d.px(xx, yy, c, Math.round(strength * Math.pow(1 - i / r, 1.5)));
    }
  }
  function rays(d, x, y, len, c, n = 8, alpha = 110) {
    for (let k = 0; k < n; k++) { const a = (k * 2 * Math.PI) / n; d.line([[x, y], [x + len * Math.cos(a), y + len * Math.sin(a)]], c, 1, alpha); }
  }
  function school(d, x, y, w, h, lit, magic) {
    lit = lit || new Set(); magic = magic || new Set();
    d.rect(x, y, x + w, y + h, P.WALL);
    d.rect(x, y + h - 4, x + w, y + h, P.WALL_DARK);
    d.polygon([[x - 4, y], [x + w + 4, y], [x + w - 6, y - 8], [x + 6, y - 8]], P.ROOF);
    const cols = Math.max(1, Math.floor((w - 8) / 14)), rows = Math.max(1, Math.floor((h - 16) / 16));
    for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
      const wx = x + 6 + c * 14, wy = y + 6 + r * 16, k = c + "," + r;
      d.rect(wx, wy, wx + 8, wy + 9, magic.has(k) ? P.MAGIC : lit.has(k) ? P.WINDOW_LIT : P.WINDOW_DARK);
      d.line([[wx + 4, wy], [wx + 4, wy + 9]], P.WALL_DARK);
    }
  }
  function lamp(d, x, gy) {
    d.rect(x, gy - 46, x + 1, gy, [50, 50, 70]);
    d.rect(x - 3, gy - 50, x + 4, gy - 46, [70, 70, 90]);
    glow(d, x + 1, gy - 46, 22, [255, 220, 140], 120);
  }
  function envelope(d, x, y, w = 10, h = 7, c = P.PAPER) {
    d.rect(x, y, x + w, y + h, c, [200, 190, 170]);
    d.line([[x, y], [x + Math.floor(w / 2), y + Math.floor(h / 2)], [x + w, y]], [200, 190, 170]);
  }
  function tree(d, x, gy, s = 1) {
    d.rect(x - 2 * s, gy - 22 * s, x + 2 * s, gy, P.WOOD_DARK);
    d.ellipse(x - 14 * s, gy - 48 * s, x + 14 * s, gy - 18 * s, [60, 130, 80]);
    d.ellipse(x - 9 * s, gy - 44 * s, x + 5 * s, gy - 30 * s, [90, 170, 100]);
  }

  /* ---------- 등장인물 ---------- */
  function charStyle(name) {
    if (CHARACTERS[name]) return CHARACTERS[name];
    const r = rng(hash(name));
    const pick = (a) => a[Math.floor(r() * a.length)];
    const top = pick([[230, 90, 90], [90, 190, 120], [170, 110, 220], [250, 150, 60], [60, 180, 200], [240, 120, 170]]);
    CHARACTERS[name] = {
      hair: pick([[24, 22, 30], [70, 44, 30], [150, 90, 40], [200, 160, 80], [90, 60, 120]]), top, top_dark: top.map((c) => Math.round(c * 0.8)),
      pants: pick([[52, 64, 120], [90, 90, 100], [60, 50, 40]]), shoes: pick([[240, 240, 240], [40, 40, 40], [200, 60, 60]]),
      style: pick(["bob", "spiky", "long"]), glasses: r() < 0.3, robot: /robo|robot|bot\b|android|cyborg/i.test(name),
      alien: /alien|zork|zib|zoe\b|xo\b/i.test(name),
    };
    return CHARACTERS[name];
  }
  function kid(name, pose = "stand", mouth = "smile") {
    const c = charStyle(name);
    if (c.robot) return robot(pose);
    const s = new R(28, 46), o = 4;
    s.rect(o + 5, 33, o + 8, 42, c.pants); s.rect(o + 11, 33, o + 14, 42, c.pants);
    s.rect(o + 4, 43, o + 8, 45, c.shoes); s.rect(o + 11, 43, o + 15, 45, c.shoes);
    s.rect(o + 3, 18, o + 16, 33, c.top); s.rect(o + 3, 31, o + 16, 33, c.top_dark);
    if (c.hood) { s.rect(o + 5, 16, o + 14, 19, c.top_dark); s.line([[o + 8, 20], [o + 8, 24]], P.WHITE); s.line([[o + 11, 20], [o + 11, 24]], P.WHITE); }
    else { s.line([[o + 9, 18], [o + 9, 32]], c.top_dark); s.rect(o + 6, 17, o + 13, 18, [230, 230, 240]); }
    const skin = c.alien ? [150, 230, 170] : P.SKIN;
    s.rect(o + 0, 19, o + 2, 30, c.top); s.rect(o + 0, 30, o + 2, 32, skin);
    if (pose === "hold") { s.rect(o + 17, 21, o + 22, 23, c.top); s.rect(o + 22, 21, o + 23, 23, skin); }
    else if (pose === "wave") { s.rect(o + 17, 10, o + 19, 20, c.top); s.rect(o + 17, 8, o + 19, 10, skin); }
    else { s.rect(o + 17, 19, o + 19, 30, c.top); s.rect(o + 17, 30, o + 19, 32, skin); }
    s.roundRect(o + 4, 4, o + 15, 16, 3, skin);
    if (c.style === "bob") {
      s.rect(o + 3, 2, o + 16, 7, c.hair); s.rect(o + 3, 2, o + 5, 14, c.hair); s.rect(o + 14, 2, o + 16, 14, c.hair); s.rect(o + 6, 7, o + 9, 8, c.hair);
    } else if (c.style === "long") {
      s.rect(o + 3, 2, o + 16, 6, c.hair); s.rect(o + 2, 3, o + 4, 22, c.hair); s.rect(o + 15, 3, o + 17, 22, c.hair);
    } else {
      s.rect(o + 4, 2, o + 15, 6, c.hair);
      for (const sx of [4, 7, 10, 13]) s.polygon([[o + sx, 2], [o + sx + 2, -1], [o + sx + 3, 2]], c.hair);
      s.rect(o + 4, 2, o + 5, 9, c.hair); s.rect(o + 14, 2, o + 15, 9, c.hair);
    }
    if (c.alien) { s.line([[o + 6, 2], [o + 4, -2]], [150, 230, 170]); s.line([[o + 13, 2], [o + 15, -2]], [150, 230, 170]); s.px(o + 4, 0, P.MAGIC); s.px(o + 15, 0, P.MAGIC); }
    if (c.glasses) { s.rect(o + 5, 9, o + 9, 12, [205, 230, 255], [80, 70, 90]); s.rect(o + 10, 9, o + 14, 12, [205, 230, 255], [80, 70, 90]); }
    s.rect(o + 7, 10, o + 7, 11, P.INK); s.rect(o + 12, 10, o + 12, 11, P.INK);
    s.px(o + 6, 13, P.BLUSH); s.px(o + 13, 13, P.BLUSH);
    if (mouth === "o") s.rect(o + 9, 13, o + 10, 14, [160, 60, 70]); else s.line([[o + 9, 14], [o + 10, 14]], [160, 60, 70]);
    return s;
  }
  function robot(pose) {
    const s = new R(28, 46), o = 4, M = [170, 180, 200], MD = [120, 130, 160];
    s.line([[o + 9, 0], [o + 9, 3]], MD); s.px(o + 9, 0, P.MAGIC); s.px(o + 10, 0, P.MAGIC);
    s.rect(o + 3, 3, o + 16, 15, M, MD);
    s.rect(o + 5, 7, o + 14, 11, [30, 40, 70]); s.rect(o + 6, 8, o + 7, 9, P.MAGIC); s.rect(o + 12, 8, o + 13, 9, P.MAGIC);
    s.rect(o + 4, 17, o + 15, 33, M, MD); s.rect(o + 7, 21, o + 12, 26, [60, 80, 120]); s.px(o + 8, 23, P.GOLD); s.px(o + 11, 23, [255, 100, 120]);
    s.rect(o + 6, 34, o + 8, 43, MD); s.rect(o + 11, 34, o + 13, 43, MD); s.rect(o + 5, 43, o + 9, 45, [90, 90, 110]); s.rect(o + 10, 43, o + 14, 45, [90, 90, 110]);
    s.rect(o + 0, 19, o + 2, 30, MD);
    if (pose === "wave") s.rect(o + 17, 9, o + 19, 19, MD); else if (pose === "hold") s.rect(o + 17, 21, o + 23, 23, MD); else s.rect(o + 17, 19, o + 19, 30, MD);
    return s;
  }
  function putKid(d, name, x, foot, scale = 1, pose = "stand", flip = false, mouth = "smile") {
    const s = kid(name, pose, mouth);
    d.blit(s, Math.round(x - (s.w * scale) / 2), Math.round(foot - s.h * scale), scale, flip);
  }
  function key(d, x, y, scale = 1, glowing = true) {
    if (glowing) { glow(d, x, y, 18 * scale, P.MAGIC, 170); rays(d, x, y, 16 * scale, P.MAGIC, 12); }
    const k = new R(12, 6);
    k.ellipse(0, 0, 5, 5, null, P.GOLD, 2); k.rect(5, 2, 11, 3, P.GOLD); k.rect(9, 4, 9, 5, P.GOLD); k.rect(11, 4, 11, 5, P.GOLD);
    d.blit(k, Math.round(x - (k.w * scale) / 2), Math.round(y - (k.h * scale) / 2), scale);
  }
  function cat(d, x, foot, flip) {
    const s = new R(14, 10), C = [60, 56, 70];
    s.rect(1, 3, 10, 7, C); s.rect(9, 0, 13, 5, C); s.px(9, -1, C); s.polygon([[9, 0], [10, -2], [11, 0]], C); s.polygon([[11, 0], [12, -2], [13, 0]], C);
    s.px(10, 2, P.GOLD); s.px(12, 2, P.GOLD); s.rect(2, 8, 3, 9, C); s.rect(8, 8, 9, 9, C); s.line([[1, 4], [0, 1]], C);
    d.blit(s, Math.round(x - 14), Math.round(foot - 20), 2, flip);
  }

  /* ---------- 배경 ---------- */
  const BG = {
    street(d, day) {
      sky(d, day ? P.DAY_TOP : P.NIGHT_TOP, day ? P.DAY_BOTTOM : P.NIGHT_BOTTOM, 0, 130);
      if (day) d.ellipse(250, 16, 274, 40, P.SUN); else { stars(d, 1, 70); d.ellipse(250, 18, 270, 38, P.MOON); d.ellipse(256, 16, 274, 34, P.NIGHT_TOP); }
      school(d, 150, 70, 130, 60); d.rect(0, 128, W, 180, day ? [90, 96, 110] : P.GROUND);
      d.rect(0, 140, W, 152, P.SIDEWALK); for (let x = 0; x < W; x += 20) d.line([[x, 140], [x, 152]], P.GROUND);
      if (!day) lamp(d, 40, 140); else tree(d, 40, 140);
    },
    school(d, day) {
      sky(d, day ? P.DAY_TOP : P.NIGHT_TOP, day ? P.DAY_BOTTOM : P.NIGHT_BOTTOM, 0, 150);
      if (!day) stars(d, 2, 40, 40);
      school(d, 20, 30, 280, 120, day ? new Set(["2,1", "5,0", "8,3", "12,2"]) : null, day ? null : new Set(["9,2"]));
      if (!day) glow(d, 20 + 6 + 9 * 14 + 4, 30 + 6 + 2 * 16 + 4, 26, P.MAGIC, 140);
      d.rect(0, 150, W, 180, day ? P.GRASS : P.GROUND);
    },
    entrance(d) {
      d.rect(0, 0, W, H, P.WALL); d.rect(0, 150, W, H, [60, 56, 84]);
      d.rect(110, 20, 210, 150, P.WALL_DARK); d.rect(114, 24, 206, 150, [10, 10, 20]);
      d.polygon([[114, 24], [140, 30], [140, 150], [114, 150]], [150, 110, 80]);
    },
    hallway(d) {
      d.rect(0, 0, W, H, [70, 66, 100]); d.rect(0, 140, W, H, [96, 86, 110]);
      for (let i = 0; i < W; i += 22) { d.rect(i + 2, 50, i + 20, 140, [80, 110, 150], [50, 70, 100]); d.rect(i + 15, 90, i + 17, 96, [40, 50, 70]); }
    },
    classroom(d) {
      d.rect(0, 0, W, H, [120, 110, 150]); d.rect(0, 140, W, H, [140, 100, 70]);
      d.rect(60, 20, 260, 80, [40, 70, 60], P.WOOD_DARK);
      d.line([[80, 40], [140, 40]], [220, 230, 220]); d.line([[80, 52], [180, 52]], [220, 230, 220]);
      for (const x of [20, 100, 180, 260]) { d.rect(x, 118, x + 44, 124, P.WOOD); d.rect(x + 4, 124, x + 6, 140, P.WOOD_DARK); d.rect(x + 38, 124, x + 40, 140, P.WOOD_DARK); }
    },
    stairs(d) {
      d.rect(0, 0, W, H, [56, 52, 86]);
      for (let i = 0; i < 8; i++) { const x = 150 + i * 20, y = 150 - i * 16; d.rect(x, y, x + 20, H, [90 - i * 3, 82 - i * 3, 120 - i * 3]); d.line([[x, y], [x + 20, y]], [130, 120, 160]); }
    },
    rooftop(d, day, dawn) {
      if (dawn) { sky(d, P.DAWN_TOP, P.DAWN_BOTTOM, 0, 130); d.ellipse(140, 106, 180, 146, [255, 230, 150]); }
      else if (day) { sky(d, P.DAY_TOP, P.DAY_BOTTOM, 0, 130); d.ellipse(240, 20, 262, 42, P.SUN); }
      else { sky(d, P.NIGHT_TOP, P.NIGHT_BOTTOM, 0, 130); stars(d, 4, 80, 120); }
      const r = rng(7); let x = 0;
      while (x < W) { const w = 14 + Math.floor(r() * 16), h = 14 + Math.floor(r() * 26); d.rect(x, 130 - h, x + w, 130, dawn || day ? [90, 70, 110] : [30, 28, 56]); x += w + 2; }
      d.rect(0, 130, W, H, [80, 76, 104]); d.rect(0, 128, W, 132, [110, 104, 130]);
      for (let rx = 0; rx < W; rx += 12) d.line([[rx, 116], [rx, 130]], [110, 104, 130]);
      d.line([[0, 116], [W, 116]], [110, 104, 130]);
    },
    dawn(d) { BG.rooftop(d, false, true); },
    letters(d) {
      d.rect(0, 0, W, H, [70, 50, 60]); glow(d, 160, 40, 90, [255, 210, 140], 140);
      for (let sy = 20; sy < 140; sy += 28) {
        d.rect(20, sy + 20, 300, sy + 23, P.WOOD_DARK);
        for (let ex = 24; ex < 296; ex += 13) if ((ex + sy) % 5) envelope(d, ex, sy + 12, 10, 8, (Math.floor(ex / 13) + sy) % 3 ? P.PAPER : [255, 230, 200]);
      }
      for (const [fx, fy] of [[60, 150], [250, 145], [200, 160]]) envelope(d, fx, fy, 12, 8);
    },
    bedroom(d, day) {
      d.rect(0, 0, W, H, [96, 80, 120]); d.rect(0, 140, W, H, [120, 90, 70]);
      d.rect(30, 24, 96, 84, P.WOOD_DARK); sky(d, day ? P.DAY_TOP : P.NIGHT_TOP, day ? P.DAY_BOTTOM : P.NIGHT_BOTTOM, 0, 0, 1);
      for (let y = 28; y <= 80; y++) d.rect(34, y, 92, y, day ? (y < 54 ? P.DAY_TOP : P.DAY_BOTTOM) : (y < 54 ? P.NIGHT_TOP : P.NIGHT_BOTTOM));
      if (day) d.ellipse(70, 34, 84, 48, P.SUN); else { d.ellipse(70, 34, 82, 46, P.MOON); d.px(44, 40, P.STAR); d.px(52, 66, P.STAR); }
      d.line([[63, 28], [63, 80]], P.WOOD_DARK); d.line([[34, 54], [92, 54]], P.WOOD_DARK);
      d.rect(200, 100, 300, 128, [230, 230, 245]); d.rect(200, 92, 220, 110, P.WHITE); d.rect(196, 128, 304, 140, P.WOOD);
      d.rect(120, 96, 170, 102, P.WOOD); d.rect(124, 102, 127, 140, P.WOOD_DARK); d.rect(163, 102, 166, 140, P.WOOD_DARK);
      d.rect(138, 86, 152, 96, [40, 44, 60]); d.rect(140, 88, 150, 94, P.MAGIC);
    },
    park(d, day) {
      sky(d, day ? P.DAY_TOP : P.NIGHT_TOP, day ? P.DAY_BOTTOM : P.NIGHT_BOTTOM, 0, 130);
      if (day) d.ellipse(40, 16, 64, 40, P.SUN); else { stars(d, 5, 60); d.ellipse(40, 18, 60, 38, P.MOON); }
      d.rect(0, 128, W, H, day ? P.GRASS : [40, 70, 60]);
      for (const x of [30, 90, 250, 300]) tree(d, x, 132);
      d.rect(130, 120, 190, 124, P.WOOD); d.rect(134, 124, 136, 134, P.WOOD_DARK); d.rect(184, 124, 186, 134, P.WOOD_DARK);
    },
    space(d) {
      d.rect(0, 0, W, H, [8, 8, 26]); stars(d, 6, 160, H);
      d.ellipse(220, 20, 290, 90, [120, 90, 200]); d.ellipse(230, 30, 270, 60, [150, 120, 230]);
      d.line([[200, 62], [310, 50]], [230, 200, 120], 2);
      glow(d, 60, 40, 30, [120, 160, 255], 90);
      d.rect(0, 150, W, H, [70, 60, 100]); for (let x = 10; x < W; x += 40) d.ellipse(x, 156, x + 12, 162, [55, 48, 84]);
    },
    beach(d, day, dawn, low) {
      const storm = /storm|thunder/.test(low || "");
      sky(d, storm ? [40, 44, 70] : day ? P.DAY_TOP : P.NIGHT_TOP, storm ? [90, 96, 120] : day ? P.DAY_BOTTOM : P.NIGHT_BOTTOM, 0, 110);
      if (storm) { d.ellipse(20, 10, 120, 40, [70, 74, 96]); d.ellipse(150, 0, 290, 36, [64, 68, 90]); d.line([[200, 30], [190, 52], [204, 52], [192, 80]], P.GOLD, 2); }
      else if (day) d.ellipse(250, 14, 274, 38, P.SUN); else { stars(d, 8, 60, 90); d.ellipse(250, 18, 270, 38, P.MOON); }
      for (let y = 110; y < 140; y++) d.rect(0, y, W, y, y % 6 < 2 ? [90, 170, 220] : [60, 130, 200]);
      if (!storm) d.ellipse(170, 96, 300, 130, [80, 150, 90]);
      d.rect(0, 140, W, H, [236, 210, 150]);
      d.rect(40, 92, 43, 140, P.WOOD_DARK); for (const [ax, ay] of [[-14, -4], [14, -4], [-10, 6], [10, 6]]) d.line([[42, 92], [42 + ax, 92 + ay]], [60, 150, 90], 2);
      if (/boat/.test(low || "")) { d.polygon([[200, 128], [260, 128], [250, 138], [210, 138]], [170, 90, 60]); d.line([[230, 128], [230, 100]], P.WOOD_DARK); d.polygon([[231, 102], [250, 124], [231, 124]], P.WHITE); }
    },
    palace(d, day) {
      sky(d, day ? P.DAY_TOP : P.NIGHT_TOP, day ? P.DAY_BOTTOM : P.NIGHT_BOTTOM, 0, 140);
      if (!day) stars(d, 3, 50, 60);
      d.rect(30, 70, 290, 76, [60, 40, 40]); d.polygon([[10, 74], [310, 74], [280, 50], [40, 50]], [50, 54, 70]);
      d.line([[10, 74], [0, 66]], [50, 54, 70], 2); d.line([[310, 74], [319, 66]], [50, 54, 70], 2);
      d.rect(50, 76, 270, 130, [150, 60, 50]); for (let x = 56; x < 270; x += 30) { d.rect(x, 76, x + 4, 130, [120, 40, 40]); d.rect(x + 8, 84, x + 24, 120, [220, 200, 150], [120, 40, 40]); }
      d.rect(140, 96, 180, 130, [90, 40, 40]); d.rect(0, 130, W, H, [200, 180, 140]); d.rect(110, 130, 210, 140, [180, 160, 120]);
    },
    store(d) {
      d.rect(0, 0, W, H, [230, 236, 245]); d.rect(0, 140, W, H, [200, 205, 220]);
      const r = rng(21), cols = [[255, 120, 120], [120, 200, 255], [255, 220, 90], [140, 230, 140], [220, 140, 255]];
      for (let sy = 30; sy < 130; sy += 26) { d.rect(10, sy + 18, 200, sy + 20, [150, 150, 170]); for (let x = 14; x < 196; x += 9) { const h = 8 + Math.floor(r() * 8); d.rect(x, sy + 18 - h, x + 6, sy + 17, cols[Math.floor(r() * cols.length)]); } }
      d.rect(220, 96, 310, 140, [120, 150, 200]); d.rect(220, 92, 310, 96, [90, 110, 160]); d.rect(286, 78, 304, 92, [40, 44, 60]); d.rect(288, 80, 302, 88, P.MAGIC);
      glow(d, 100, 60, 40, P.MAGIC, 60); for (let i = 0; i < 12; i++) d.px(30 + r() * 170, 20 + r() * 100, P.GOLD);
    },
    game(d) {
      sky(d, [70, 120, 230], [150, 200, 255], 0, H);
      d.ellipse(30, 20, 70, 36, P.WHITE); d.ellipse(200, 30, 250, 46, P.WHITE);
      for (let x = 0; x < W; x += 16) { d.rect(x, 150, x + 15, H, [180, 110, 60], [120, 70, 40]); d.rect(x, 150, x + 15, 153, [90, 200, 90]); }
      for (const [bx, by] of [[90, 100], [106, 100], [122, 100], [230, 80], [246, 80]]) { d.rect(bx, by, bx + 15, by + 15, [230, 160, 60], [150, 90, 30]); d.rect(bx + 6, by + 5, bx + 9, by + 10, P.WHITE); }
      for (const [cx, cy] of [[60, 120], [180, 70], [196, 70], [280, 120]]) d.ellipse(cx, cy, cx + 6, cy + 8, P.GOLD, [200, 140, 30]);
      d.rect(296, 110, 312, 150, [60, 60, 80]); d.rect(299, 114, 309, 150, P.MAGIC);
    },
    stage(d) {
      d.rect(0, 0, W, H, [40, 20, 40]); d.rect(0, 130, W, H, [120, 70, 50]); d.rect(0, 126, W, 130, [160, 100, 70]);
      for (let x = 0; x < 50; x += 6) d.rect(x, 0, x + 4, 130, [170, 30, 60]); for (let x = 270; x < W; x += 6) d.rect(x, 0, x + 4, 130, [170, 30, 60]);
      d.rect(0, 0, W, 14, [190, 40, 70]); glow(d, 160, 110, 70, [255, 240, 190], 120);
      for (let x = 10; x < W; x += 22) d.ellipse(x, 168, x + 14, 184, [30, 20, 34]);
    },
    airport(d, day) {
      /* 큰 유리창 너머로 비행기가 보이는 공항 탑승구 */
      d.rect(0, 0, W, H, [210, 216, 228]); d.rect(0, 138, W, H, [176, 182, 196]);
      sky(d, day ? P.DAY_TOP : P.NIGHT_TOP, day ? P.DAY_BOTTOM : P.NIGHT_BOTTOM, 14, 112);
      if (!day) stars(d, 5, 40, 60);
      for (let x = 0; x <= W; x += 64) d.rect(x, 14, x + 3, 112, [120, 128, 146]);
      d.rect(0, 10, W, 14, [120, 128, 146]); d.rect(0, 112, W, 116, [120, 128, 146]);
      d.rect(0, 100, W, 112, [110, 112, 120]);
      const pl = [235, 238, 245], pd = [150, 160, 180];
      d.ellipse(150, 78, 262, 96, pl, pd); d.polygon([[196, 86], [228, 86], [206, 108], [190, 108]], pd);
      d.polygon([[242, 80], [262, 60], [270, 60], [262, 84]], [44, 90, 180]); d.ellipse(150, 82, 166, 92, pl, pd);
      for (let x = 170; x < 250; x += 8) d.rect(x, 84, x + 3, 87, [70, 110, 170]);
      d.rect(16, 24, 86, 52, [30, 34, 48], [80, 86, 100]);
      for (let i = 0; i < 4; i++) { d.rect(20, 28 + i * 6, 50, 30 + i * 6, P.GOLD); d.rect(56, 28 + i * 6, 82, 30 + i * 6, i === 1 ? [255, 90, 90] : [120, 230, 140]); }
      for (let x = 20; x < 300; x += 26) { d.rect(x, 146, x + 20, 150, [44, 90, 180]); d.rect(x, 150, x + 2, 160, [70, 70, 80]); d.rect(x + 18, 150, x + 20, 160, [70, 70, 80]); }
    },
    cinema(d) {
      /* 어두운 영화관, 빛나는 스크린과 좌석 */
      d.rect(0, 0, W, H, [18, 14, 26]);
      d.rect(40, 12, 280, 104, [230, 236, 250]); glow(d, 160, 58, 120, [200, 220, 255], 70);
      d.rect(40, 12, 280, 14, [60, 50, 70]); for (let x = 0; x < 40; x += 6) d.rect(x, 0, x + 4, 120, [120, 20, 40]); for (let x = 282; x < W; x += 6) d.rect(x, 0, x + 4, 120, [120, 20, 40]);
      for (let row = 0; row < 3; row++) { const y = 128 + row * 18; for (let x = 6 + row * 4; x < W; x += 20) d.ellipse(x, y, x + 15, y + 16, [70 - row * 10, 20, 40 - row * 6], [40, 10, 20]); }
    },
    sky(d, day) {
      sky(d, day ? P.DAY_TOP : P.NIGHT_TOP, day ? P.DAY_BOTTOM : P.NIGHT_BOTTOM, 0, H);
      if (!day) stars(d, 9, 120, H); d.rect(0, 150, W, H, day ? P.GRASS : P.GROUND);
    },
  };
  const BACKGROUNDS = [
    [["sunrise", "sun came", "dawn", "sun rose"], "dawn"],
    [["airport", "plane", "airplane", "flight", "passport", "suitcase", "boarding"], "airport"],
    [["cinema", "movie theater", "popcorn", "movie screen", "into the movie"], "cinema"],
    [["video game", "game world", "pixel", "level", "game"], "game"],
    [["stage", "concert", "festival", "audience", "perform", "show"], "stage"],
    [["palace", "king", "queen", "joseon", "hanok", "village"], "palace"],
    [["store", "shop", "convenience", "candy", "gum", "counter"], "store"],
    [["island", "ocean", "beach", "boat", "sea", "storm", "wave"], "beach"],
    [["planet", "space", "spaceship", "rocket", "alien", "galaxy", "ufo"], "space"],
    [["rooftop", "roof"], "rooftop"],
    [["letter", "envelope", "secret room", "shelf", "shelves", "library"], "letters"],
    [["bedroom", "bed", "my room", "his room", "her room", "phone", "message", "woke up"], "bedroom"],
    [["stairs", "stair", "upstairs"], "stairs"],
    [["hallway", "locker", "clock", "corridor", "museum"], "hallway"],
    [["classroom", "desk", "blackboard", "board", "class", "teacher", "lesson", "science fair", "lab"], "classroom"],
    [["park", "tree", "garden", "bench", "flower"], "park"],
    [["door", "entrance", "inside", "floor"], "entrance"],
    [["window", "building", "school", "gate"], "school"],
    [["street", "walk", "road", "home", "outside", "lamp", "town"], "street"],
  ];
  const DAY_WORDS = ["morning", "afternoon", "lunch", "sunny", "daytime", "bright", "breakfast", "day."];
  const has = (low, w) => (w.includes(" ") || w.length > 5 ? low.includes(w) : new RegExp("\\b" + w.replace(".", "\\.") + "s?\\b").test(low));

  function effects(d, low, seed) {
    const r = rng(seed + 99);
    if (/\bsnow/.test(low)) for (let i = 0; i < 90; i++) { const x = r() * W, y = r() * H; d.px(x, y, P.WHITE, 230); if (r() < 0.4) d.px(x + 1, y, P.WHITE, 160); }
    if (/\brain/.test(low)) for (let i = 0; i < 70; i++) { const x = r() * W, y = r() * H; d.line([[x, y], [x - 2, y + 6]], [170, 200, 255], 1, 150); }
    if (/\bmusic|\bsong|\bsing/.test(low)) for (let i = 0; i < 6; i++) { const x = 30 + r() * 260, y = 20 + r() * 60; d.ellipse(x, y + 5, x + 3, y + 8, P.GOLD); d.line([[x + 3, y + 6], [x + 3, y]], P.GOLD); d.line([[x + 3, y], [x + 6, y + 2]], P.GOLD); }
    if (/lights? (went|go|goes) out|\bdark\b|blackout/.test(low)) for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) d.px(x, y, [5, 5, 15], 120);
    if (/\bmap\b/.test(low)) { d.rect(236, 112, 262, 130, [240, 225, 180], [180, 150, 100]); d.line([[240, 118], [250, 124], [258, 116]], [200, 60, 60]); }
    if (/\bphoto|\bpicture/.test(low)) { d.rect(240, 108, 262, 126, P.WHITE, [120, 110, 130]); d.rect(243, 111, 259, 121, [120, 170, 220]); }
  }

  function compose(text, names, seed, opts) {
    const low = String(text || "").toLowerCase();
    let bg = "sky";
    for (const [keys, id] of BACKGROUNDS) if (keys.some((k) => has(low, k))) { bg = id; break; }
    const day = DAY_WORDS.some((w) => has(low, w.replace(".", ""))) && bg !== "dawn";
    const asset = opts && opts.asset ? opts.asset(bg, day) : null;
    const d = new R(W, H, asset ? null : [0, 0, 0]);
    if (!asset) BG[bg](d, day, false, low);
    const cast = (names || []).filter((n) => n && n !== "Narrator").slice(0, 3);
    if (!cast.length && /\brobot/.test(low)) cast.push("Robo");
    const slots = { 1: [130], 2: [100, 220], 3: [70, 160, 250] }[cast.length] || [];
    const r = rng(seed || 1);
    const holding = /\bkey\b|letter|flashlight|map\b|phone|photo/.test(low);
    const surprised = /surpris|suddenly|strange|\bwow\b|!|scared|shock/.test(low);
    cast.forEach((n, i) => {
      const pose = holding && i === 0 ? "hold" : /\bwave|hello|\bhi\b|goodbye|bye/.test(low) && i === cast.length - 1 ? "wave" : r() < 0.25 ? "wave" : "stand";
      putKid(d, n, slots[i], 176, 2, pose, i === cast.length - 1 && cast.length > 1, surprised ? "o" : "smile");
    });
    if (/\bkey\b/.test(low)) key(d, slots.length ? slots[0] + 24 : 160, 120, 2);
    if (/letter|envelope/.test(low) && bg !== "letters") envelope(d, 200, 100, 22, 15);
    if (/\bcats?\b|kitten/.test(low)) cat(d, slots.length ? slots[0] - 30 : 150, 178, false);
    effects(d, low, seed || 1);
    const small = d.toCanvas();
    const big = document.createElement("canvas"); big.width = W * 4; big.height = H * 4;
    const g = big.getContext("2d");
    if (asset) { // AI로 미리 만든 배경 그림이 있으면 그 위에 인물만 픽셀로 얹기
      const s = Math.max(big.width / asset.width, big.height / asset.height), w = asset.width * s, h = asset.height * s;
      g.imageSmoothingEnabled = true; g.drawImage(asset, (big.width - w) / 2, (big.height - h) / 2, w, h);
      const sg = small.getContext("2d"); sg.globalCompositeOperation = "destination-over"; sg.drawImage(big, 0, 0, W, H);
    }
    g.imageSmoothingEnabled = false; g.drawImage(d.toCanvas(), 0, 0, big.width, big.height);
    return { canvas: small, big, bg, day, ai: !!asset };
  }
  function starfield(seed) {
    const d = new R(W, H, [0, 0, 0]);
    sky(d, [14, 14, 40], [60, 46, 110], 0, H); stars(d, seed || 11, 120, H);
    const big = document.createElement("canvas"); big.width = W * 4; big.height = H * 4;
    const g = big.getContext("2d"); g.imageSmoothingEnabled = false; g.drawImage(d.toCanvas(), 0, 0, big.width, big.height);
    return big;
  }
  const BG_IDS = Object.keys(BG);
  global.PixelArt = { compose, starfield, W, H, charStyle, BG_IDS, pickBackground(text) { const low = String(text || "").toLowerCase(); for (const [keys, id] of BACKGROUNDS) if (keys.some((k) => has(low, k))) return { bg: id, day: DAY_WORDS.some((w) => has(low, w.replace(".", ""))) && id !== "dawn" }; return { bg: "sky", day: false }; } };
})(window);
