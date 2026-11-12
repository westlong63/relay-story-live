/* Relay Story Live · 단어 달리기
   푸앙이가 중앙대에서 출발해 신서중 정문까지 3줄 길을 달려요.
   - 단어 문: 위에 나온 문제의 답이 적힌 줄로 지나가요
   - 철자 글자를 순서대로 모으면 FEVER (점수 2배, 장애물에 안 다쳐요)
   - 장애물은 줄을 바꾸거나 점프로 피해요. 하트 3개가 다 없어지면 처음부터 다시 달려요
   play.html이 문제·저장·전송을 맡고, 이 파일은 그림과 조작만 맡아요. */
(function (g) {
  "use strict";
  const LH = 120, LANE_Y = [70, 88, 106], PX0 = 14, LAP = 4000, GATE_GAP = 620, FEVER_MS = 7000;
  const rnd = (n) => { const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
  /* 3×5 글자 (간판, 글자 타일) */
  const F = { A: "010101111101101", B: "110101110101110", C: "011100100100011", D: "110101101101110", E: "111100110100111", F: "111100110100100", G: "011100101101011", H: "101101111101101",
    I: "111010010010111", J: "001001001101010", K: "101101110101101", L: "100100100100111", O: "010101101101010", P: "110101110100100", Q: "010101101110011", R: "110101110101101",
    S: "011100010001110", T: "111010010010010", U: "101101101101111", V: "101101101101010", X: "101101010101101", Y: "101101010010010", Z: "111001010100111", "-": "000000111000000", "!": "010010010000010", " ": "000000000000000" };
  const F5 = { M: "1000111011101011000110001", W: "1000110001101011101110001", N: "10011101101110011001" };
  function glyph(ch) { ch = ch.toUpperCase(); if (F5[ch]) { const s = F5[ch], w = s.length / 5; return { w, at: (i, j) => s[j * w + i] === "1" }; } const s = F[ch] || F[" "]; return { w: 3, at: (i, j) => s[j * 3 + i] === "1" }; }
  function textW(str, k) { return str.split("").reduce((a, ch) => a + (glyph(ch).w + 1) * k, -k); }
  function text(x, str, x0, y0, col, k) { k = k || 1; let cx = Math.round(x0); x.fillStyle = col; for (const ch of str) { const gl = glyph(ch); for (let j = 0; j < 5; j++) for (let i = 0; i < gl.w; i++) if (gl.at(i, j)) x.fillRect(cx + i * k, Math.round(y0) + j * k, k, k); cx += (gl.w + 1) * k; } }

  function WordRun(root, api) {
    this.api = api; this.root = root;
    root.innerHTML = `<div class="run">
      <div class="rhud pxt"><span class="rh"></span><span class="rsc"></span><span class="rgo"></span><span class="rtm"></span></div>
      <div class="rspell pxt"></div>
      <div class="rstage"><canvas class="rcv"></canvas><div class="rbanner"></div><div class="rsigns"></div><div class="rpops"></div><div class="rover"></div></div>
      <div class="rctl px"><div><button data-k="up" aria-label="위 줄로">▲<small>위로</small></button><button data-k="down" aria-label="아래 줄로">▼<small>아래로</small></button></div><button data-k="jump" class="jump">JUMP<small>점프</small></button></div>
    </div>`;
    const $ = (s) => root.querySelector(s);
    this.cv = $(".rcv"); this.x = this.cv.getContext("2d"); this.stage = $(".rstage");
    this.el = { hearts: $(".rh"), score: $(".rsc"), goal: $(".rgo"), time: $(".rtm"), spell: $(".rspell"), banner: $(".rbanner"), signs: $(".rsigns"), pops: $(".rpops"), over: $(".rover") };
    this.st = api.state;
    this.reset(true);
    /* 조작: 버튼은 누르는 순간 반응, 화면은 위아래로 밀면 줄 바꾸기, 톡 치면 점프, 키보드는 ↑ ↓ 스페이스 */
    root.querySelectorAll("[data-k]").forEach((b) => b.addEventListener("pointerdown", (e) => { e.preventDefault(); this.key(b.dataset.k); }));
    let sy = null, sx = null;
    this.stage.addEventListener("pointerdown", (e) => { if (e.target.closest("button")) return; sy = e.clientY; sx = e.clientX; });
    this.stage.addEventListener("pointerup", (e) => { if (sy == null || e.target.closest("button")) return; const dy = e.clientY - sy, dx = e.clientX - sx; sy = null; if (Math.abs(dy) > 24 && Math.abs(dy) > Math.abs(dx)) this.key(dy < 0 ? "up" : "down"); else this.key("jump"); });
    this.onKey = (e) => { if (!this.root.isConnected) return document.removeEventListener("keydown", this.onKey); const k = { ArrowUp: "up", ArrowDown: "down", " ": "jump", Spacebar: "jump" }[e.key]; if (k && !/INPUT|TEXTAREA|SELECT/.test((e.target || {}).tagName || "")) { e.preventDefault(); this.key(k); } };
    document.addEventListener("keydown", this.onKey);
    this.showStart();
    this.last = 0;
    const loop = (t) => { if (!this.cv.isConnected) { document.removeEventListener("keydown", this.onKey); return; } const dt = this.last ? Math.min(0.05, (t - this.last) / 1000) : 0; this.last = t; try { this.tick(dt, t); this.draw(t); } catch (e) { console.error(e); } requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }
  const P = WordRun.prototype;
  P.reset = function (first) {
    this.cam = 0; this.lane = 1; this.laneY = LANE_Y[1]; this.jumpT = -1; this.hearts = 3; this.shield = false; this.inv = 0; this.hurtT = 0; this.fever = 0;
    this.objs = []; this.gate = null; this.nextGateAt = 0; this.nextSpawn = 160; this.spell = null; this.nextSpellAt = 300; this.combo = 0; this.runPts = 0; this.lapsRun = 0;
    this.mode = first ? "start" : "run"; this.shake = 0;
    this.el.banner.innerHTML = ""; this.el.signs.innerHTML = ""; this.el.banner.className = "rbanner"; this.renderSpell(); this.hud();
  };
  P.showStart = function () {
    this.mode = "start";
    this.el.over.innerHTML = `<div class="rbox"><div class="pxt" style="font-size:24px;color:var(--navy)">WORD RUN</div><div class="dim" style="margin:-2px 0 8px">단어 달리기 · 중앙대 → 신서중 정문</div>
      <div class="rhow"><div><b class="pxt">▲ ▼</b> 줄 바꾸기 <span class="dim">(화면을 위아래로 밀어도 돼요)</span></div><div><b class="pxt">JUMP</b> 장애물 뛰어넘기 <span class="dim">(화면을 톡)</span></div>
      <div><b class="pxt">WORD GATE</b> 문제의 답이 적힌 줄로 지나가요</div><div><b class="pxt">FEVER</b> 철자를 순서대로 모으면 점수 2배!</div></div>
      <button class="go pxt" data-go="1">▶ 달리기 시작</button></div>`;
    this.el.over.querySelector("[data-go]").onclick = () => { this.el.over.innerHTML = ""; this.api.sfx("cast"); this.mode = "run"; this.last = 0; };
  };
  P.key = function (k) {
    if (this.mode !== "run") return;
    if (k === "up" && this.lane > 0) { this.lane--; this.api.sfx("tick"); }
    if (k === "down" && this.lane < 2) { this.lane++; this.api.sfx("tick"); }
    if (k === "jump" && this.jumpT < 0) { this.jumpT = 0; this.api.sfx("jump"); }
  };
  P.speed = function () { return Math.min(135, 64 + this.lapsRun * 12) * (this.fever > 0 ? 1.25 : 1); };
  P.add = function (pts, label, lane) {
    const v = Math.round(pts * (this.fever > 0 ? 2 : 1));
    this.st.earned += v; this.runPts += v; this.hud(); this.api.score();
    if (label) this.pop(`${label} +${v}`, lane == null ? this.lane : lane, v >= 50 ? "big" : "");
  };
  P.pop = function (txt, lane, cls) {
    const d = document.createElement("div"); d.className = "rpop pxt " + (cls || ""); d.textContent = txt;
    d.style.left = ((PX0 + 30) / this.LW) * 100 + "%"; d.style.top = ((LANE_Y[lane == null ? 1 : lane] - 30) / LH) * 100 + "%";
    this.el.pops.appendChild(d); setTimeout(() => d.remove(), 900);
  };
  P.hud = function () {
    const h = []; for (let i = 0; i < 3; i++) h.push(`<i class="hp ${i < this.hearts ? "on" : ""}"></i>`);
    this.el.hearts.innerHTML = h.join("") + (this.shield ? `<i class="sh"></i>` : "") + (this.fever > 0 ? `<b class="fv">FEVER ×2</b>` : "");
    this.el.score.innerHTML = `⭐ <b>${this.st.earned.toLocaleString()}</b>`;
    const left = Math.max(0, Math.ceil((LAP - (this.cam % LAP)) / 10));
    this.el.goal.innerHTML = `🏫 신서중까지 <b>${left}m</b>${this.st.laps ? ` · 완주 ${this.st.laps}번` : ""}`;
  };
  P.renderSpell = function () {
    const s = this.spell;
    if (!s) { this.el.spell.innerHTML = `<span class="dim">FEVER 글자가 곧 나와요</span>`; return; }
    this.el.spell.innerHTML = `<span class="lab">FEVER</span> ${s.word.split("").map((c, i) => `<span class="ch ${i < s.i ? "on" : i === s.i ? "next" : ""}">${i < s.i ? c : "_"}</span>`).join("")} <span class="ko">${this.api.esc(s.hint || "")}</span>`;
  };
  /* ---------- 움직임 ---------- */
  P.tick = function (dt, t) {
    const left = this.api.left();
    if (left != null && left <= 0 && this.mode !== "over-time") {
      this.mode = "over-time"; this.el.banner.innerHTML = ""; this.el.signs.innerHTML = "";
      this.el.over.innerHTML = `<div class="rbox"><div class="pxt" style="font-size:26px">⏰ TIME UP!</div><div style="margin:6px 0">달리기 끝! 선생님 화면에서 우리 모둠 순위를 확인해요.</div><div class="pxt" style="font-size:22px">⭐ ${this.st.earned.toLocaleString()} · 완주 ${this.st.laps}번</div></div>`;
    }
    if (this.el.time) this.el.time.textContent = left == null ? "" : `⏱ ${Math.floor(Math.max(0, left) / 60)}:${String(Math.max(0, left) % 60).padStart(2, "0")}`;
    if (this.el.time) this.el.time.classList.toggle("low", left != null && left <= 30);
    if (this.mode !== "run" || !dt) return;
    const v = this.speed(), prev = this.cam;
    this.cam += v * dt;
    this.laneY += (LANE_Y[this.lane] - this.laneY) * Math.min(1, dt * 18);
    if (this.jumpT >= 0) { this.jumpT += dt; if (this.jumpT > 0.62) this.jumpT = -1; }
    this.inv = Math.max(0, this.inv - dt); this.hurtT = Math.max(0, this.hurtT - dt); this.goalT = Math.max(0, (this.goalT || 0) - dt); this.shake = Math.max(0, this.shake - dt);
    if (this.fever > 0) { this.fever -= dt * 1000; if (this.fever <= 0) { this.fever = 0; this.hud(); } }
    /* 결승선: 신서중 정문 */
    if (Math.floor(this.cam / LAP) > Math.floor(prev / LAP)) {
      this.st.laps++; this.lapsRun++; this.goalT = 2.4; this.api.sfx("rare"); this.add(200, "신서중 도착!", 1); this.api.score({ kind: "goal" });
      this.el.over.innerHTML = `<div class="rgoal pxt">🏫 SINSEO MIDDLE SCHOOL<br><span>신서중 정문 도착! 다음 달리기는 더 빨라요</span></div>`;
      setTimeout(() => { if (this.mode === "run") this.el.over.innerHTML = ""; }, 2200);
    }
    const W = this.LW || 260, ahead = this.cam + W + 40;
    /* 단어 문 */
    if (!this.gate && this.cam >= this.nextGateAt) this.spawnGate(this.cam + W + 150);
    /* 장애물·동전·글자·아이템 (단어 문 앞뒤는 비워 둬요) */
    while (this.nextSpawn < ahead) {
      const at = this.nextSpawn, nearGate = this.gate && Math.abs(this.gate.x - at) < 110, lapPos = at % LAP;
      if (!nearGate && lapPos > 120 && lapPos < LAP - 140) this.spawnAt(at);
      this.nextSpawn += 120 + rnd(at) * 90 - Math.min(40, this.lapsRun * 10);
    }
    if (!this.spell && this.cam >= this.nextSpellAt) { this.spell = this.api.spell(); if (this.spell) { this.spell.i = 0; this.spell.wrong = 0; this.spell.nextAt = this.cam + 80; } this.renderSpell(); }
    if (this.spell && this.cam >= this.spell.nextAt && !this.objs.some((o) => o.k === "letter")) {
      const at = Math.max(this.cam + W + 20, this.gate ? this.gate.x + 120 : 0);
      if (!this.gate || at > this.gate.x + 100) {
        const ln = Math.floor(rnd(at * 1.3) * 3), need = this.spell.word[this.spell.i];
        this.objs = this.objs.filter((o) => !(o.k === "obst" && Math.abs(o.x - at) < 34));
        this.objs.push({ k: "letter", x: at, lane: ln, ch: need });
        if (rnd(at * 2.1) < 0.55) { const pool = "abcdefghijklmnoprstuwy".replace(need, ""), d = pool[Math.floor(rnd(at * 3.7) * pool.length)]; this.objs.push({ k: "letter", x: at, lane: (ln + 1 + Math.floor(rnd(at * 4.1) * 2)) % 3, ch: d }); }
        this.spell.nextAt = at - W + 60;
      }
    }
    /* 부딪힘 검사 */
    const air = this.jumpT >= 0 && this.jumpT > 0.06 && this.jumpT < 0.56, hx0 = PX0 + 9, hx1 = PX0 + 25;
    for (const o of this.objs) {
      const sx = o.x - this.cam;
      if (o.done) continue;
      if (sx < hx1 && sx + (o.w || 10) > hx0) {
        if (o.lane !== this.lane) continue;
        if (o.k === "obst") {
          if (air) { if (!o.jumped) { o.jumped = true; } continue; }
          o.done = true;
          if (this.fever > 0 || this.inv > 0) { if (this.fever > 0) { o.fly = 1; this.add(10, "SMASH", o.lane); } continue; }
          if (this.shield) { this.shield = false; o.fly = 1; this.inv = 0.8; this.api.sfx("tick"); this.pop("SHIELD!", o.lane); this.hud(); continue; }
          this.hit();
        } else if (o.k === "coin") { o.done = true; this.add(2); this.api.sfx("coin"); }
        else if (o.k === "heart") { o.done = true; this.hearts = Math.min(3, this.hearts + 1); this.api.sfx("catch"); this.pop("+❤", o.lane); this.hud(); }
        else if (o.k === "shield") { o.done = true; this.shield = true; this.api.sfx("catch"); this.pop("SHIELD", o.lane); this.hud(); }
        else if (o.k === "letter") { o.done = true; this.letter(o); }
      } else if (o.k === "obst" && o.jumped && !o.bonus && sx + (o.w || 10) < hx0) { o.bonus = true; this.add(10, "JUMP", o.lane); }
    }
    this.objs = this.objs.filter((o) => o.x - this.cam > -40 && !(o.done && o.k !== "obst"));
    if (this.gate && this.gate.x - this.cam < PX0 + 16 && !this.gate.passed) this.passGate();
    if (this.gate && this.gate.passed && this.gate.x - this.cam < -60) { this.gate = null; this.el.signs.innerHTML = ""; this.el.banner.className = "rbanner"; this.el.banner.innerHTML = ""; this.nextGateAt = this.cam + GATE_GAP - 620; }
    if (Math.floor(t / 250) !== this.hudT) { this.hudT = Math.floor(t / 250); this.hud(); }
  };
  P.spawnAt = function (at) {
    const r = rnd(at * 0.77), ln = Math.floor(rnd(at * 1.91) * 3);
    if (r < 0.52) {
      const kinds = ["cone", "hurdle", "books", "puddle"], k = kinds[Math.floor(rnd(at * 2.3) * kinds.length)];
      this.objs.push({ k: "obst", t: k, x: at, lane: ln, w: k === "puddle" ? 14 : 11 });
      if (this.lapsRun >= 1 && rnd(at * 5.3) < 0.35) this.objs.push({ k: "obst", t: "cone", x: at + 4, lane: (ln + 1 + Math.floor(rnd(at * 6.1) * 2)) % 3, w: 11 });
    } else if (r < 0.86) { for (let i = 0; i < 3; i++) this.objs.push({ k: "coin", x: at + i * 14, lane: ln, w: 7 }); }
    else if (r < 0.93 && this.hearts < 3) this.objs.push({ k: "heart", x: at, lane: ln, w: 8 });
    else if (!this.shield) this.objs.push({ k: "shield", x: at, lane: ln, w: 8 });
  };
  P.spawnGate = function (x) {
    const gq = this.api.gate(); if (!gq) { this.nextGateAt = this.cam + GATE_GAP; return; }
    /* 단어 문 자리에 이미 있던 장애물은 치워요 */
    this.objs = this.objs.filter((o) => Math.abs(o.x - x) > 70);
    this.gate = Object.assign(gq, { x, passed: false });
    this.el.banner.className = "rbanner on";
    this.el.banner.innerHTML = gq.banner;
    this.el.signs.innerHTML = gq.lanes.map((l, i) => `<div class="rsign ${l.ok == null ? "x" : ""}" data-l="${i}"><span class="${/[가-힣]/.test(l.t) ? "ko" : ""}">${this.api.esc(l.t)}</span></div>`).join("");
    if (gq.say) this.api.say(gq.say);
    this.api.sfx("bite");
  };
  P.passGate = function () {
    const G = this.gate, ok = !!(G.lanes[this.lane] && G.lanes[this.lane].ok);
    G.passed = true;
    const sg = this.el.signs.querySelectorAll(".rsign");
    sg.forEach((s, i) => s.classList.add(G.lanes[i].ok ? "right" : "wrong"));
    if (ok) {
      this.combo++; this.api.sfx("catch");
      this.add((G.first ? 30 : 15) + Math.min(5, this.combo - 1) * 5, this.combo >= 2 ? `${this.combo} COMBO` : "GOOD", this.lane);
    } else {
      this.combo = 0; this.api.sfx("miss"); this.pop("앗! 다음엔 맞혀요", this.lane);
      this.el.banner.innerHTML = G.banner + `<div class="ans">정답: <b>${this.api.esc(G.lanes.find((l) => l.ok).t)}</b></div>`;
    }
    this.api.gateDone(G, ok);
  };
  P.letter = function (o) {
    const s = this.spell; if (!s) return;
    if (o.ch === s.word[s.i]) {
      s.i++; this.api.sfx("coin"); this.add(5, o.ch.toUpperCase(), o.lane);
      this.objs = this.objs.filter((x) => x.k !== "letter");
      if (s.i >= s.word.length) {
        this.fever = FEVER_MS; this.api.sfx("rare"); this.api.spellDone(s, s.wrong === 0); this.add(50, s.word.toUpperCase() + "!", 1); this.api.score({ kind: "fever" });
        if (s.say) this.api.say(s.say);
        this.spell = null; this.nextSpellAt = this.cam + 700; this.hud();
      } else s.nextAt = this.cam + 40;
    } else { s.wrong++; this.api.sfx("miss"); this.pop("철자 순서가 달라요", o.lane); }
    this.renderSpell();
  };
  P.hit = function () {
    this.hearts--; this.inv = 1.3; this.hurtT = 0.45; this.shake = 0.3; this.combo = 0; this.api.sfx("miss");
    try { navigator.vibrate && navigator.vibrate(120); } catch (e) {}
    this.hud();
    if (this.hearts <= 0) {
      this.mode = "dead"; this.st.best = Math.max(this.st.best || 0, Math.round(this.cam / 10)); this.api.score();
      this.el.over.innerHTML = `<div class="rbox"><div class="pxt" style="font-size:26px;color:var(--red)">GAME OVER</div>
        <div style="margin:6px 0">이번에 달린 거리 <b class="pxt">${Math.round(this.cam / 10)}m</b> · 이번 점수 <b class="pxt">⭐ ${this.runPts}</b></div>
        <div class="dim" style="margin-bottom:8px">모은 점수는 그대로 남아요. 다시 중앙대에서 출발해요!</div><button class="go pxt" data-go="1">↻ 다시 달리기</button></div>`;
      this.el.over.querySelector("[data-go]").onclick = () => { this.el.over.innerHTML = ""; this.reset(false); this.last = 0; };
    }
  };
  /* ---------- 그림 ---------- */
  P.draw = function (t) { if (g.PXA && g.PXA.ok) this.drawHD(t); else this.drawLo(t); };
  /* 고해상도 그림 (assets/px): 게임 계산은 그대로 120칸, 그림은 2배(240칸)로 그려요 */
  P.drawHD = function (t) {
    const A = g.PXA.IM, K = 2, cv = this.cv, cw = cv.clientWidth || 300, ch = cv.clientHeight || 120;
    const LW = Math.max(150, Math.min(380, Math.round((LH * cw) / ch))), W = LW * K, H = LH * K;
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    this.LW = LW;
    const x = this.x, cam = this.cam, off = cam * K;
    const R = (i, j, w, h, c) => { x.fillStyle = c; x.fillRect(Math.round(i), Math.round(j), w, h); };
    x.imageSmoothingEnabled = false;
    x.save();
    if (this.shake > 0) x.translate(Math.round((rnd(t) - 0.5) * 6), 0);
    const RT = 59 * K; /* 도로 위쪽 */
    const lapStart = Math.floor(cam / LAP) * LAP, finX = (lapStart + LAP - cam + PX0 + 20) * K;
    g.PXA.drawScene(x, W, { off, t, roadTop: RT, school: finX > -260 && finX < W + 400 ? finX + 30 : null });
    /* 차선, 길가 덤불 */
    for (const ly of [79, 97]) for (let i = -((off % 48) + 48); i < W; i += 48) R(i, ly * K, 24, 2, "#e9eef4");
    for (let i = -((off * 1.0) % 256) - 256; i < W; i += 256) x.drawImage(A.hedge, Math.round(i), H - 12);
    /* 출발 아치(중앙대)와 결승 정문(신서중) */
    for (const gx of [lapStart, lapStart + LAP]) {
      const sx = Math.round((gx - cam + PX0 + 20) * K);
      if (sx < -200 || sx > W + 200) continue;
      for (let j = RT; j < 116 * K; j += 6) for (let k = 0; k < 2; k++) R(sx + k * 6, j, 6, 6, ((j - RT) / 6 + k) % 2 ? "#ffffff" : "#14233d");
      const im = gx > 0 ? A.gate_finish : A.gate_start;
      x.drawImage(im, sx - Math.round(im.width / 2) + 6, RT - im.height + 2);
    }
    if (this.goalT > 0) { const cols = ["#ff3b30", "#ffd84a", "#3fa45a", "#2c67be", "#ffffff", "#e58fb9"]; for (let n = 0; n < 90; n++) { const fx = rnd(n) * W, fy = ((rnd(n + 9) * 120 + (2.4 - this.goalT) * (80 + rnd(n + 3) * 100)) % 236); R(fx + Math.sin(t / 200 + n) * 6, fy, 4, 4, cols[n % cols.length]); } }
    /* 단어 문 기둥 */
    const G = this.gate;
    if (G) {
      const sx = (G.x - cam) * K;
      R(sx - 3, 64, 6, H - 64, "#22345c"); R(sx - 2, 64, 2, H - 64, "#5a7bb8"); R(sx - 14, 60, 28, 6, "#ffd23f"); R(sx - 14, 60, 28, 2, "#fff1a8");
      const signs = this.el.signs.children;
      for (let i = 0; i < signs.length; i++) { signs[i].style.left = (sx / W) * 100 + "%"; signs[i].style.top = ((LANE_Y[i] - 5) / LH) * 100 + "%"; signs[i].style.display = sx < W + 60 ? "" : "none"; }
    }
    /* 물건과 푸앙이를 위 줄부터 */
    const items = this.objs.filter((o) => !(o.done && !o.fly)).map((o) => ({ o, y: LANE_Y[o.lane] }));
    items.push({ me: true, y: this.laneY + 0.5 });
    items.sort((a, b) => a.y - b.y);
    const at = (im, cx, by) => x.drawImage(im, Math.round(cx - im.width / 2), Math.round(by - im.height));
    for (const it of items) {
      if (it.me) { this.drawMeHD(t); continue; }
      const o = it.o, sx = (o.x - cam) * K, gy = LANE_Y[o.lane] * K;
      if (o.fly) { o.fly += 0.08; x.globalAlpha = Math.max(0, 1 - o.fly / 3); }
      const fy = o.fly ? -o.fly * 16 : 0, bob = Math.floor(t / 280) % 2 ? 2 : 0;
      if (o.k === "obst") {
        if (o.t !== "puddle") { x.fillStyle = "rgba(10,25,60,.25)"; x.fillRect(Math.round(sx), gy - 2 + fy, 28, 3); }
        at(A[{ cone: "cone", hurdle: "barrier", books: "books", puddle: "puddle" }[o.t] || "cone"], sx + 12, gy + 2 + fy);
      } else if (o.k === "coin") at(A["coin" + (Math.floor(t / 120 + o.x) % 4)], sx + 7, gy - 6 + fy - bob);
      else if (o.k === "heart") at(A.cube_heart, sx + 8, gy - 6 + fy - bob);
      else if (o.k === "shield") at(A.cube_shield, sx + 8, gy - 6 + fy - bob);
      else if (o.k === "letter") {
        const next = this.spell && o.ch === this.spell.word[this.spell.i], li = o.ch.toUpperCase().charCodeAt(0) - 65, cx = Math.round(sx + 13 - 11), cy = Math.round(gy - 34 + fy - bob);
        if (next) { R(cx - 3, cy - 3, 28, 28, (Math.floor(t / 200) % 2) ? "#fff1a8" : "#ffd23f"); }
        if (li >= 0 && li < 26) x.drawImage(A.letters, li * 22, 0, 22, 22, cx, cy, 22, 22);
      }
      x.globalAlpha = 1;
    }
    x.restore();
  };
  P.drawMeHD = function (t) {
    const A = g.PXA.IM, K = 2, x = this.x, air = this.jumpT >= 0 ? Math.sin((this.jumpT / 0.62) * Math.PI) * 20 : 0;
    const pose = this.hurtT > 0 ? "hurt" : this.jumpT >= 0 ? "jump" : ["run0", "run1", "run2", "run3"][Math.floor(t / (this.fever > 0 ? 60 : 95)) % 4];
    const im = A[pose], base = Math.round(this.laneY * K), fy = Math.round(base - air * K), y = fy - (im.height - 4), px = PX0 * K - 6; /* 발바닥은 그림 아래에서 4칸 위 */
    x.fillStyle = "rgba(10,25,60,.28)"; x.fillRect(px + 16, base - 3, 30 - Math.round(air / 2), 4);
    if (this.fever > 0) { const cols = ["#ff3b30", "#ff9f1a", "#ffd84a", "#3fa45a", "#2c67be", "#8a6be6"]; cols.forEach((c, i) => { x.fillStyle = c; x.fillRect(px - 50 + (Math.floor(t / 60) % 2) * 2, fy - 34 + i * 4, 64, 4); }); }
    if (this.inv > 0 && this.fever <= 0 && Math.floor(t / 90) % 2) return;
    x.drawImage(im, px, y);
    if (this.shield) { x.strokeStyle = "rgba(140,200,255,.95)"; x.lineWidth = 2; x.beginPath(); x.arc(px + 32, fy - 40, 43, 0, Math.PI * 2); x.stroke(); }
  };
  P.drawLo = function (t) {
    const cv = this.cv, cw = cv.clientWidth || 300, ch = cv.clientHeight || 120;
    const LW = Math.max(150, Math.min(380, Math.round((LH * cw) / ch)));
    if (cv.width !== LW || cv.height !== LH) { cv.width = LW; cv.height = LH; this.sky = null; }
    this.LW = LW;
    const x = this.x, cam = this.cam, R = (i, j, w, h, c) => { x.fillStyle = c; x.fillRect(Math.round(i), Math.round(j), w, h); };
    x.imageSmoothingEnabled = false;
    x.save();
    if (this.shake > 0) x.translate(Math.round((rnd(t) - 0.5) * 3), 0);
    /* 하늘 */
    if (!this.sky) { const c = document.createElement("canvas"); c.width = LW; c.height = 60; const y = c.getContext("2d"); const cols = ["#3d8be8", "#5aa2ef", "#78b8f4", "#97ccf7", "#b7def9"]; for (let j = 0; j < 60; j++) for (let i = 0; i < LW; i++) { const k = Math.min(4, (j / 60) * 5 + ((i + j) % 2 ? 0.25 : -0.25)); y.fillStyle = cols[Math.max(0, Math.floor(k))]; y.fillRect(i, j, 1, 1); } this.sky = c; }
    x.drawImage(this.sky, 0, 0);
    [[0, 8, 0.02], [0.45, 16, 0.035], [0.75, 6, 0.025]].forEach(([o, cy, v]) => { const cx = ((((o * 997 - cam * v) % (LW + 40)) + LW + 40) % (LW + 40)) - 20; R(cx, cy, 16, 3, "#ffffff"); R(cx + 4, cy - 2, 8, 2, "#ffffff"); R(cx + 2, cy + 3, 12, 1, "#dcefff"); });
    /* 먼 건물: 출발은 중앙대(파란 유리 건물), 갈수록 동네와 언덕, 끝에 신서중 */
    const lapPos = (cam % LAP) / LAP, far = cam * 0.15, lapBase = Math.floor(cam / LAP) * LAP * 0.15;
    for (let b = Math.floor(far / 22) - 1; b < (far + LW) / 22 + 1; b++) {
      const bx = b * 22 - far, p = (b * 22 - lapBase) / (LAP * 0.15), r1 = rnd(b), r2 = rnd(b + 50);
      if (p < 0.55) {
        const h = 16 + Math.round(r1 * 18), w = 16 + Math.round(r2 * 5), top = 50 - h;
        R(bx, top, w, h, r1 > 0.5 ? "#2c5fb8" : "#3b6fc4"); R(bx, top, w, 1, "#9cc3f5");
        for (let j = top + 3; j < 48; j += 4) for (let i = bx + 2; i < bx + w - 2; i += 4) R(i, j, 2, 2, (i + j) % 3 ? "#9fd0ff" : "#d8ecff");
        if (rnd(b + 9) > 0.7) { R(bx + 3, top - 7, 12, 6, "#ffffff"); text(x, "CAU", bx + 4, top - 6, "#1c479a"); }
      } else {
        const h = 8 + Math.round(r1 * 8), w = 18;
        R(bx, 50 - h, w, h, ["#f3e6c8", "#e9d3b0", "#dfe7ef"][Math.floor(r2 * 3)]); R(bx - 1, 50 - h - 2, w + 2, 2, "#b5523b");
        for (let i = bx + 3; i < bx + w - 3; i += 5) R(i, 50 - h + 3, 3, 3, "#7fb2e0");
        if (r2 > 0.55) { R(bx + 19, 44, 1, 6, "#7a4a24"); R(bx + 16, 39, 7, 6, "#f6b8cf"); R(bx + 17, 38, 5, 1, "#f6b8cf"); R(bx + 18, 40, 2, 2, "#e58fb9"); }
      }
    }
    R(0, 50, LW, 6, "#6cbf5c"); R(0, 50, LW, 1, "#8fd07a");
    /* 길가 펜스 (가운데 층, 조금 빠르게) */
    const mid = cam * 0.6;
    for (let b = Math.floor(mid / 40) - 1; b < (mid + LW) / 40 + 1; b++) {
      const bx = b * 40 - mid, lab = ["CAU", "PUANG", "SINSEO", "WORD RUN"][((b % 4) + 4) % 4];
      R(bx, 44, 2, 13, "#8a93a6"); R(bx + 4, 46, 32, 9, lab === "SINSEO" ? "#ffffff" : "#1c479a"); R(bx + 4, 46, 32, 1, "#ffffff");
      text(x, lab, bx + 20 - textW(lab, 1) / 2, 48, lab === "SINSEO" ? "#1c479a" : "#ffffff");
    }
    R(0, 55, LW, 1, "#8a93a6");
    /* 도로 */
    R(0, 57, LW, 2, "#c9ccd3"); R(0, 59, LW, 57, "#5d6470"); R(0, 116, LW, 4, "#6cbf5c"); R(0, 115, LW, 1, "#c9ccd3");
    for (const ly of [79, 97]) for (let i = -((cam % 24) + 24); i < LW; i += 24) R(i, ly, 12, 1, "#e8ebf0");
    for (let i = 0; i < 40; i++) { const px = ((rnd(i) * 900 - cam) % 900 + 900) % 900; if (px < LW) R(px, 60 + rnd(i + 5) * 54, 1, 1, "#6a7280"); }
    /* 출발 아치(중앙대, 청룡)와 결승 정문(신서중) */
    const lapStart = Math.floor(cam / LAP) * LAP;
    for (const gx of [lapStart, lapStart + LAP]) {
      const sx = Math.round(gx - cam + PX0 + 20);
      if (sx < -60 || sx > LW + 60) continue;
      for (let j = 59; j < 116; j += 3) for (let k = 0; k < 2; k++) R(sx + k * 3, j, 3, 3, ((j - 59) / 3 + k) % 2 ? "#ffffff" : "#14233d");
      const fin = gx > 0, lab = fin ? "SINSEO MIDDLE SCHOOL" : "START  CAU", bw = textW(lab, 1) + 10, half = Math.ceil(bw / 2);
      for (const px of [sx - half + 2, sx + half - 9]) {
        R(px, 22, 7, 36, fin ? "#b5523b" : "#2c67be");
        for (let j = 24; j < 58; j += 3) R(px, j, 7, 1, fin ? "#8a3b2a" : "#1c479a");
        R(px - 1, 20, 9, 3, "#14233d");
        if (fin) { R(px + 2, 26, 3, 3, "#ffd84a"); }
      }
      R(sx - half, 11, bw, 11, "#14233d"); R(sx - half + 1, 12, bw - 2, 9, fin ? "#ffffff" : "#1c479a");
      text(x, lab, sx - half + 5, 14, fin ? "#1c479a" : "#ffffff");
      if (fin) { R(sx - 4, 2, 9, 9, "#14233d"); R(sx - 3, 3, 7, 7, "#ffffff"); R(sx, 4, 1, 3, "#14233d"); R(sx, 6, 3, 1, "#14233d"); }
      else if (g.PX) x.drawImage(g.PX.fish(2, 4), sx - 13, -3);
      if (fin) [[-half - 8, 44], [half + 2, 46]].forEach(([dx, ty]) => { R(sx + dx + 3, ty + 6, 1, 8, "#7a4a24"); R(sx + dx, ty, 8, 6, "#f6b8cf"); R(sx + dx + 1, ty - 1, 6, 1, "#f6b8cf"); R(sx + dx + 2, ty + 1, 2, 2, "#e58fb9"); });
    }
    if (this.goalT > 0) { const cols = ["#ff3b30", "#ffd84a", "#3fa45a", "#2c67be", "#ffffff", "#e58fb9"]; for (let n = 0; n < 70; n++) { const fx = rnd(n) * LW, fy = ((rnd(n + 9) * 60 + (2.4 - this.goalT) * (40 + rnd(n + 3) * 50)) % 118); R(fx + Math.sin(t / 200 + n) * 3, fy, 2, 2, cols[n % cols.length]); } }
    /* 단어 문: 기둥과 표지판 위치 */
    const G = this.gate;
    if (G) {
      const sx = G.x - cam;
      R(sx - 1, 34, 3, 82, "#14233d"); R(sx - 6, 33, 13, 3, "#ffd84a");
      const signs = this.el.signs.children;
      for (let i = 0; i < signs.length; i++) { signs[i].style.left = (sx / LW) * 100 + "%"; signs[i].style.top = ((LANE_Y[i] - 5) / LH) * 100 + "%"; signs[i].style.display = sx < LW + 30 ? "" : "none"; }
    }
    /* 물건과 푸앙이를 위 줄부터 그려요 */
    const items = this.objs.filter((o) => !(o.done && !o.fly)).map((o) => ({ o, y: LANE_Y[o.lane] }));
    items.push({ me: true, y: this.laneY + 0.5 });
    items.sort((a, b) => a.y - b.y);
    for (const it of items) {
      if (it.me) { this.drawMe(t); continue; }
      const o = it.o, sx = Math.round(o.x - cam), gy = LANE_Y[o.lane];
      if (o.fly) { o.fly += 0.08; x.globalAlpha = Math.max(0, 1 - o.fly / 3); }
      const fy = o.fly ? -o.fly * 8 : 0;
      if (o.k === "obst") this.drawObst(o.t, sx, gy + fy);
      else if (o.k === "coin") { const b = Math.floor(t / 150 + o.x) % 4; R(sx + (b === 2 ? 2 : 0), gy - 10, b === 2 ? 3 : 7, 7, "#e0a020"); R(sx + 1 + (b === 2 ? 1 : 0), gy - 9, b === 2 ? 1 : 5, 5, "#ffd84a"); if (b !== 2) R(sx + 2, gy - 8, 1, 2, "#fff6c2"); }
      else if (o.k === "heart") { const hy = gy - 12 + (Math.floor(t / 300) % 2); [[1, 0, 2], [5, 0, 2], [0, 1, 8], [0, 2, 8], [1, 3, 6], [2, 4, 4], [3, 5, 2]].forEach(([a, b, w]) => R(sx + a, hy + b, w, 1, "#ff3b5c")); R(sx + 1, hy + 1, 1, 1, "#ffd0d8"); }
      else if (o.k === "shield") { const hy = gy - 13 + (Math.floor(t / 300) % 2); R(sx, hy, 8, 6, "#e0a020"); R(sx + 1, hy + 1, 6, 5, "#2c67be"); R(sx + 1, hy + 6, 6, 1, "#e0a020"); R(sx + 2, hy + 7, 4, 1, "#e0a020"); R(sx + 3, hy + 8, 2, 1, "#e0a020"); R(sx + 3, hy + 2, 2, 3, "#ffffff"); }
      else if (o.k === "letter") {
        const hy = gy - 17 + (Math.floor(t / 260) % 2), next = this.spell && o.ch === this.spell.word[this.spell.i];
        R(sx - 1, hy - 1, 15, 17, "#14233d"); R(sx, hy, 13, 15, next ? "#fff2a8" : "#ffffff"); R(sx, hy + 13, 13, 2, next ? "#e0a020" : "#c9ccd3");
        const gl = glyph(o.ch), gw = gl.w * 2; text(x, o.ch.toUpperCase(), sx + Math.round((13 - gw) / 2), hy + 2, "#14233d", 2);
      }
      x.globalAlpha = 1;
    }
    x.restore();
  };
  P.drawObst = function (k, sx, gy) {
    const R = (i, j, w, h, c) => { this.x.fillStyle = c; this.x.fillRect(Math.round(i), Math.round(j), w, h); };
    if (k === "cone") { R(sx + 1, gy - 1, 10, 2, "#14233d"); for (let j = 0; j < 11; j++) { const w = 2 + Math.floor(j * 0.6); R(sx + 6 - w / 2, gy - 12 + j, w, 1, j > 3 && j < 6 ? "#ffffff" : "#ff7a1a"); } }
    if (k === "hurdle") { R(sx, gy - 11, 12, 3, "#ffffff"); R(sx + 3, gy - 11, 3, 3, "#ff3b30"); R(sx + 9, gy - 11, 3, 3, "#ff3b30"); R(sx + 1, gy - 8, 1, 8, "#14233d"); R(sx + 10, gy - 8, 1, 8, "#14233d"); R(sx, gy - 1, 3, 1, "#14233d"); R(sx + 9, gy - 1, 3, 1, "#14233d"); }
    if (k === "books") { [["#2c67be", 0], ["#ff7a1a", -4], ["#3fa45a", -8]].forEach(([c, dy], i) => { R(sx + (i % 2), gy - 4 + dy, 11, 4, "#14233d"); R(sx + 1 + (i % 2), gy - 3 + dy, 9, 2, c); R(sx + 8 + (i % 2), gy - 3 + dy, 2, 2, "#ffffff"); }); }
    if (k === "puddle") { R(sx + 2, gy - 3, 10, 1, "#3b6fc4"); R(sx, gy - 2, 14, 3, "#3b6fc4"); R(sx + 3, gy - 2, 4, 1, "#9fd0ff"); R(sx + 2, gy + 1, 10, 1, "#2c5fb8"); }
  };
  P.drawMe = function (t) {
    const x = this.x, air = this.jumpT >= 0 ? Math.sin((this.jumpT / 0.62) * Math.PI) * 20 : 0;
    const y = Math.round(this.laneY - 32 - air);
    x.fillStyle = "rgba(0,0,0,.25)"; x.fillRect(PX0 + 8, Math.round(this.laneY) - 2, 18 - Math.round(air / 3), 2);
    if (this.fever > 0) { const cols = ["#ff3b30", "#ff9f1a", "#ffd84a", "#3fa45a", "#2c67be", "#8a6be6"]; cols.forEach((c, i) => { x.fillStyle = c; x.fillRect(PX0 - 26 + (Math.floor(t / 60) % 2), y + 14 + i * 2, 30, 2); }); }
    if (this.inv > 0 && this.fever <= 0 && Math.floor(t / 90) % 2) return;
    const pose = this.hurtT > 0 ? "hurt" : this.jumpT >= 0 ? "jump" : Math.floor(t / (this.fever > 0 ? 80 : 120)) % 2 ? "run1" : "run2";
    if (g.PX) x.drawImage(g.PX.puang(pose), PX0, y);
    if (this.shield) { x.strokeStyle = "rgba(120,190,255,.9)"; x.lineWidth = 1; x.strokeRect(PX0 - 1.5, y + 0.5, 37, 35); }
  };
  g.WordRun = { mount: (root, api) => new WordRun(root, api), LAP, text, textW };
})(typeof window !== "undefined" ? window : globalThis);
