/* Relay Story Live · 고해상도 픽셀 그림 (assets/px/*.png)
   하늘, 해, 구름, 중앙대 빌딩, 가로수, 펜스, 도로, 신서중, 푸앙이 동작, 장애물·아이템.
   그림 한 칸 = 화면 픽셀 여러 개 (image-rendering:pixelated). 높이는 늘 240칸으로 그려요. */
(function (g) {
  const NAMES = ["sky", "sun", "cloud1", "cloud2", "cloud3", "cloud4", "cityfar", "city", "street", "fence", "road", "curb", "hedge",
    "cone", "barrier", "books", "puddle", "coin0", "coin1", "coin2", "coin3", "cube_heart", "cube_shield", "letters", "school", "cherry1", "cherry2",
    "gate_finish", "gate_start", "run0", "run1", "run2", "run3", "jump", "hurt", "stand", "blink", "wow", "cheer", "fish"];
  const base = (document.currentScript && document.currentScript.src.replace(/js\/pxart\.js.*$/, "")) || "";
  const IM = {};
  let left = NAMES.length;
  const PXA = { ok: false, IM, LH: 240 };
  PXA.ready = new Promise((res) => {
    NAMES.forEach((n) => {
      const im = new Image();
      im.onload = im.onerror = () => { if (--left === 0) { PXA.ok = NAMES.every((k) => IM[k].naturalWidth > 0); res(PXA.ok); } };
      im.src = base + "assets/px/" + n + ".png"; IM[n] = im;
    });
  });
  const rnd = (n) => { const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
  /* 가로로 이어 붙이기 (패럴랙스) */
  function tileX(x, im, y, off, W) {
    const w = im.width; let sx = -(((off % w) + w) % w);
    for (; sx < W; sx += w) x.drawImage(im, Math.round(sx), Math.round(y));
  }
  function sparkle(x, px, py, s, col) {
    x.fillStyle = col; x.fillRect(px, py - s, 1, s * 2 + 1); x.fillRect(px - s, py, s * 2 + 1, 1);
    if (s > 1) { x.fillStyle = "#ffffff"; x.fillRect(px, py, 1, 1); }
  }
  /* 배경 풍경 한 장 그리기. o = {off: 가로 이동(그림 칸), roadTop, school: x(그림 칸) 또는 null, t: ms, still} */
  PXA.drawScene = function (x, W, o) {
    o = o || {};
    const H = o.H || 240, off = o.off || 0, t = o.t || 0, rt = o.roadTop || 184, cy0 = Math.max(0, rt - 184);
    x.imageSmoothingEnabled = false;
    x.drawImage(IM.sky, 0, 0, W, H);
    x.drawImage(IM.sun, W - 128, -70);
    /* 반짝이: 하늘에 흩어진 작은 별과 파란 조각 */
    for (let i = 0; i < 26; i++) {
      const px = Math.round(rnd(i) * W), py = Math.round(8 + rnd(i + 40) * Math.max(40, rt - 120));
      const tw = o.still ? 1 : (Math.sin(t / 420 + i * 1.7) + 1) / 2;
      if (i % 3 === 0) { x.fillStyle = "#cfe3ff"; x.fillRect(px, py, 2, 2); }
      else sparkle(x, px, py, tw > 0.6 ? 2 : 1, tw > 0.3 ? "#eaf4ff" : "#9cc6f7");
    }
    /* 구름: 천천히 흘러가요 */
    const cl = [["cloud3", 0.02, 30, 0], ["cloud1", 0.035, 6, 0.33], ["cloud2", 0.05, 58, 0.62], ["cloud4", 0.03, 18, 0.85], ["cloud1", 0.025, 70, 0.12]];
    cl.forEach(([n, v, y, p], i) => {
      const im = IM[n], span = W + im.width + 40;
      const cx = (((p * span - (off * v + t * 0.004 * (i + 1))) % span) + span) % span - im.width;
      x.drawImage(im, Math.round(cx), y + Math.round(cy0 * 0.45));
    });
    tileX(x, IM.cityfar, rt - 26 - 90, off * 0.08 + 40, W);
    tileX(x, IM.city, rt - 19 - 112, off * 0.16, W);
    if (o.school != null) {
      const sx = Math.round(o.school - off * 0.16 * 0 - 0);
      x.drawImage(IM.cherry2, sx - 34, rt - 36 - 46 + 10); x.drawImage(IM.cherry1, sx + IM.school.width - 4, rt - 36 - 46 + 8);
      x.drawImage(IM.school, sx, rt - 36 - IM.school.height + 14);
    }
    tileX(x, IM.street, rt - 12 - 120, off * 0.4, W);
    tileX(x, IM.fence, rt - 36, off * 0.6, W);
    for (let yy = rt; yy < H; yy += 64) tileX(x, IM.road, yy, off, W);
    tileX(x, IM.curb, rt - 2, off, W);
  };
  PXA.puang = (pose) => IM[pose] || IM.stand;
  /* 움직이는 풍경 (첫 화면, 배경). 캔버스가 화면에서 사라지면 멈춰요 */
  PXA.live = function (cv, o) {
    o = Object.assign({ run: true, school: true, still: false }, o || {});
    const x = cv.getContext("2d");
    let t0 = performance.now();
    const frame = (now) => {
      if (!cv.isConnected) return;
      const ch = cv.clientHeight || 240, cw = cv.clientWidth || 400;
      const k = PXA.scale(cw, ch), W = Math.round(cw / k), H = Math.max(200, Math.round(ch / k));
      if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
      const t = o.still ? 0 : now - t0, off = o.still ? 0 : t * 0.03;
      const rt = H - (o.roadBottom || 56);
      PXA.drawScene(x, W, { H, off, t, roadTop: rt, school: o.school && W >= 430 ? W - IM.school.width - 18 : null, still: o.still });
      /* 도로 차선과 길가 덤불 */
      x.fillStyle = "#e9eef4";
      for (let i = -((off % 24) + 24); i < W; i += 24) x.fillRect(Math.round(i), rt + 21, 13, 2);
      tileX(x, IM.hedge, H - 22, off * 1.2, W);
      if (o.run) {
        const span = W + 140, px = o.still ? Math.round(W * 0.6) : Math.round(((t * 0.045) % span) - 70);
        const pose = o.still ? "run0" : ["run0", "run1", "run2", "run3"][Math.floor(t / 110) % 4];
        x.fillStyle = "rgba(10,25,60,.28)"; x.fillRect(px + 16, rt + 41, 30, 3);
        x.drawImage(IM[pose], px, rt + 44 - IM[pose].height); /* 발바닥은 그림 아래에서 4칸 위 */
        if (o.school && W < 430 && !o.still) { /* 좁은 화면: 학교 대신 빌딩 숲만 */ }
      }
      if (!o.still) requestAnimationFrame(frame);
    };
    PXA.ready.then((ok) => { if (ok) requestAnimationFrame(frame); });
  };
  /* 페이지 배경: 한 번만 그려서 고정 (움직이지 않아요) */
  /* 화면 픽셀 크기: 넓은 화면은 크게, 좁은 화면은 작게 (그림 한 칸 = 화면 2~4.5px) */
  PXA.scale = (cw, ch) => Math.max(2, Math.min(4, cw / 560, ch / 260));
  PXA.backdrop = function (cv) {
    const draw = () => {
      const cw = innerWidth, ch = innerHeight, k = PXA.scale(cw, ch), W = Math.round(cw / k), H = Math.max(200, Math.round(ch / k));
      cv.width = W; cv.height = H;
      const x = cv.getContext("2d");
      PXA.drawScene(x, W, { H, off: 0, t: 0, roadTop: H - 44, school: W >= 430 ? W - IM.school.width - 14 : null, still: true });
      tileX(x, IM.hedge, H - 22, 0, W);
    };
    PXA.ready.then((ok) => { if (!ok) return; draw(); let tm; addEventListener("resize", () => { clearTimeout(tm); tm = setTimeout(draw, 200); }); });
  };
  g.PXA = PXA;
})(window);
