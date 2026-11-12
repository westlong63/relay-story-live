/* Relay Story Live · 영상 재생기
   이야기(film) → 장면 그림 + 자막 + 브라우저 AI 음성 + 배경음악을 캔버스에서 바로 재생합니다.
   서버에서 영상을 만들지 않으니 기다릴 필요도, 비용도 없습니다. (음성은 엣지 브라우저가 가장 자연스러워요) */
(function (global) {
  "use strict";
  const CW = 1280, CH = 720, GOLD = "#ffd648";
  const FONT = '"Pretendard","Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",system-ui,sans-serif';
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const lighten = (hex, k) => { const m = /^#?([0-9a-f]{6})$/i.exec(hex || ""); if (!m) return hex; const n = parseInt(m[1], 16);
    const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (255 - v) * k)); return "#" + c.map((v) => v.toString(16).padStart(2, "0")).join(""); };
  const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  /* ---------- 미리 만든 AI 배경 그림 (assets/bg) ---------- */
  const assetCache = {};
  function loadImg(url) {
    if (!(url in assetCache)) assetCache[url] = new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = url; });
    return assetCache[url];
  }
  /* assets/bg/list.json 에 적힌 그림만 씁니다 (없으면 픽셀 그림만). 예: ["classroom.png", "night/rooftop_day.jpg"] */
  let bgList = null;
  function listBg() {
    if (!bgList) bgList = fetch("assets/bg/list.json", { cache: "no-cache" }).then((r) => (r.ok ? r.json() : [])).then((a) => new Set(Array.isArray(a) ? a : [])).catch(() => new Set());
    return bgList;
  }
  async function findAsset(topicId, bg, day) {
    const have = await listBg(); if (!have.size) return null;
    const names = day ? [bg + "_day", bg] : [bg];
    for (const dir of [topicId ? topicId + "/" : null, ""]) if (dir != null) for (const n of names) for (const ext of [".png", ".jpg", ".webp"]) {
      if (have.has(dir + n + ext)) { const im = await loadImg("assets/bg/" + dir + n + ext); if (im) return im; }
    }
    return null;
  }

  /* ---------- 목소리 ---------- */
  const F_RE = /female|aria|jenny|\bana\b|sonia|libby|michelle|emma|ava\b|samantha|karen|moira|tessa|zira|susan|hazel|serena|victoria|allison|amy|joanna|salli|kimberly|ivy|kendra|nicole|olivia|natasha|clara|emily|catherine|linda|heather|eva\b|jane|nancy|sara|maisie|mia\b|ana /i;
  const M_RE = /\bmale|guy|christopher|eric|ryan|brian|andrew|roger|steffan|daniel|alex\b|fred|david|mark|george|james|thomas|\btom\b|arthur|oliver|aaron|matthew|justin|joey|liam|william|davis|tony|jason|ethan/i;
  const Voice = {
    voices: [],
    ready() {
      if (!("speechSynthesis" in global)) return Promise.resolve([]);
      const get = () => (this.voices = speechSynthesis.getVoices().filter((v) => /^en[-_]/i.test(v.lang) || /^en$/i.test(v.lang)));
      if (get().length) return Promise.resolve(this.voices);
      return new Promise((res) => {
        const done = () => res(get());
        speechSynthesis.addEventListener("voiceschanged", done, { once: true });
        setTimeout(done, 1500);
      });
    },
    score(v) { return (/natural|neural|online/i.test(v.name) ? 20 : 0) + (/google/i.test(v.name) ? 8 : 0) + (/en[-_](US|GB)/i.test(v.lang) ? 2 : 0); },
    gender(v) { return F_RE.test(v.name) ? "f" : M_RE.test(v.name) ? "m" : "?"; },
    cast(characters, voiceCast) {
      const vs = this.voices.slice().sort((a, b) => this.score(b) - this.score(a));
      const map = {};
      if (!vs.length) return map;
      const fem = vs.filter((v) => this.gender(v) === "f"), mal = vs.filter((v) => this.gender(v) === "m");
      const gb = fem.find((v) => /GB/i.test(v.lang)) || fem[0] || vs[0];
      map.Narrator = { voice: gb, pitch: 1, rate: 0.92 };
      if (!voiceCast) return map;
      const used = new Set([gb]);
      const take = (list, prefer) => { const v = (prefer && list.find((x) => prefer.test(x.name) && !used.has(x))) || list.find((x) => !used.has(x)) || list[0] || vs[0]; used.add(v); return v; };
      let pf = 1.08, pm = 1.0, k = 0;
      for (const [name, c] of Object.entries(characters || {})) {
        if (name === "Narrator") continue;
        const g = c.gender || "?";
        if (g === "robot") map[name] = { voice: take(mal.length ? mal : vs), pitch: 0.4, rate: 0.85 };
        else if (g === "f") { map[name] = { voice: take(fem.length ? fem : vs, /\bana\b|child|kid/i), pitch: pf, rate: 0.95 }; pf += 0.06; }
        else if (g === "m") { map[name] = { voice: take(mal.length ? mal : vs), pitch: pm, rate: 0.95 }; pm -= 0.08; }
        else { const pool = k % 2 ? mal : fem; map[name] = { voice: take(pool.length ? pool : vs), pitch: 1 + ((k % 3) - 1) * 0.12, rate: 0.95 }; k++; }
      }
      return map;
    },
    speak(text, spec, isCancelled, fast) {
      const est = 900 + text.length * 80;
      if (!spec || !spec.voice || !("speechSynthesis" in global)) return sleep((1400 + text.length * 55) * (fast ? 0.7 : 1));
      return new Promise((res) => {
        let done = false;
        const fin = () => { if (!done) { done = true; clearTimeout(t); clearInterval(iv); res(); } };
        const u = new SpeechSynthesisUtterance(text);
        u.voice = spec.voice; u.lang = spec.voice.lang; u.pitch = spec.pitch || 1; u.rate = spec.rate || 0.92; u.volume = 1;
        u.onend = fin; u.onerror = fin;
        const t = setTimeout(fin, est * 2.5 + 2500);
        const iv = setInterval(() => { if (isCancelled && isCancelled()) { speechSynthesis.cancel(); fin(); } }, 120);
        speechSynthesis.speak(u);
      });
    },
  };

  /* ---------- 배경음악 (직접 만든 오르골 멜로디, 저작권 걱정 없음) ---------- */
  class MusicBox {
    start() {
      try { this.ctx = new (global.AudioContext || global.webkitAudioContext)(); } catch (e) { return; }
      const ctx = this.ctx;
      this.master = ctx.createGain(); this.master.gain.value = 0.05; this.master.connect(ctx.destination);
      const notes = [72, 76, 79, 76, 74, 77, 81, 77, 72, 76, 79, 84, 83, 79, 76, 74], bass = [48, 53, 55, 48], beat = 0.55;
      let i = 0, t0 = ctx.currentTime + 0.1;
      const hz = (n) => 440 * Math.pow(2, (n - 69) / 12);
      const tone = (f, at, dur, vol, partials) => {
        const g = ctx.createGain(); g.connect(this.master);
        g.gain.setValueAtTime(vol, at); g.gain.exponentialRampToValueAtTime(0.0008, at + dur);
        partials.forEach(([mul, amp]) => { const o = ctx.createOscillator(), og = ctx.createGain(); o.frequency.value = f * mul; og.gain.value = amp; o.connect(og); og.connect(g); o.start(at); o.stop(at + dur + 0.05); });
      };
      this.timer = setInterval(() => {
        while (t0 + i * beat < ctx.currentTime + 1.2) {
          const at = t0 + i * beat;
          tone(hz(notes[i % notes.length]), at, 1.6, 0.9, [[1, 1], [2, 0.35], [3, 0.12]]);
          if (i % 4 === 0) tone(hz(bass[(i / 4) % bass.length]), at, beat * 4, 0.6, [[1, 1]]);
          i++;
        }
      }, 200);
    }
    stop() { clearInterval(this.timer); try { this.ctx && this.ctx.close(); } catch (e) {} this.ctx = null; }
  }

  /* ---------- 그리기 도우미 ---------- */
  function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function wrap(g, tokens, maxW) {
    const lines = []; let cur = [], w = 0;
    const sp = g.measureText(" ").width;
    for (const t of tokens) {
      const tw = g.measureText(t.t).width;
      if (cur.length && w + sp + tw > maxW) { lines.push(cur); cur = []; w = 0; }
      w += (cur.length ? sp : 0) + tw; cur.push(t);
    }
    if (cur.length) lines.push(cur);
    return lines;
  }
  function drawSubtitle(g, speaker, text, words, color, ko) {
    const ef = 44; /* 영어 자막이 주인공: 크게 */
    g.font = `700 ${ef}px ${FONT}`;
    const pats = (words || []).map((w) => new RegExp("^" + escRe(w) + "\\w*$", "i"));
    const tokens = text.split(/\s+/).filter(Boolean).map((t) => { const m = t.match(/^(.*?)([^\w']*)$/); return { t, core: m[1], tail: m[2], hit: pats.some((p) => p.test(m[1].replace(/^[^\w]+/, ""))) }; });
    const lines = wrap(g, tokens, 1040), lh = 58;
    let kl = [];
    if (ko) { g.font = `500 22px ${FONT}`; kl = wrap(g, ko.split(/\s+/).filter(Boolean).map((t) => ({ t })), 1040).slice(0, 2); g.font = `700 ${ef}px ${FONT}`; }
    const kh = kl.length ? 8 + 30 * kl.length : 0, boxH = 30 + lh * lines.length + kh, y0 = CH - 34 - boxH;
    g.fillStyle = "rgba(14,12,30,0.80)"; rr(g, 90, y0, CW - 180, boxH, 22); g.fill();
    if (speaker && speaker !== "Narrator") {
      g.font = `800 28px ${FONT}`;
      const tw = g.measureText(speaker).width;
      g.fillStyle = color || "#ffffff"; rr(g, 120, y0 - 26, tw + 36, 42, 16); g.fill();
      g.fillStyle = "#141224"; g.fillText(speaker, 138, y0 + 4);
      g.font = `700 ${ef}px ${FONT}`;
    }
    const sp = g.measureText(" ").width;
    lines.forEach((ln, i) => {
      const full = ln.map((t) => t.t).join(" ");
      let x = (CW - g.measureText(full).width) / 2;
      const y = y0 + 15 + ef + i * lh;
      for (const t of ln) {
        if (t.hit && t.core) {
          const pre = t.core.match(/^[^\w]*/)[0], core = t.core.slice(pre.length);
          g.fillStyle = "#fff"; g.fillText(pre, x, y); const px = x + g.measureText(pre).width;
          g.fillStyle = GOLD; g.fillText(core, px, y); const cw = g.measureText(core).width;
          g.fillRect(px, y + 7, cw, 4);
          g.fillStyle = "#fff"; g.fillText(t.tail, px + cw, y);
        } else { g.fillStyle = "#fff"; g.fillText(t.t, x, y); }
        x += g.measureText(t.t).width + sp;
      }
    });
    if (kl.length) {
      g.font = `500 22px ${FONT}`; g.fillStyle = "rgba(207,224,255,0.85)";
      const yk = y0 + 15 + lh * lines.length + 8;
      kl.forEach((ln, i) => { const t = ln.map((x) => x.t).join(" "); g.fillText(t, (CW - g.measureText(t).width) / 2, yk + 26 + i * 30); });
    }
  }
  function drawCard(g, bg, rows, t) {
    g.drawImage(bg, 0, 0, CW, CH);
    g.fillStyle = "rgba(10,8,30,0.35)"; g.fillRect(0, 0, CW, CH);
    const total = rows.reduce((n, r) => n + (r.gap || r.size * 1.35), 0);
    let y = (CH - total) / 2;
    g.textAlign = "center";
    rows.forEach((r, i) => {
      const a = Math.max(0, Math.min(1, (t - i * 160) / 400));
      g.globalAlpha = a;
      g.font = `${r.weight || 800} ${r.size}px ${FONT}`;
      y += r.gap || r.size * 1.35;
      if (r.chips) {
        g.font = `800 ${r.size}px ${FONT}`;
        const pad = 18, ws = r.chips.map((c) => g.measureText(c.t).width + pad * 2), tot = ws.reduce((a2, b) => a2 + b, 0) + 14 * (ws.length - 1);
        let x = (CW - tot) / 2;
        r.chips.forEach((c, k) => { g.fillStyle = c.on ? GOLD : "rgba(255,255,255,0.18)"; rr(g, x, y - r.size - 6, ws[k], r.size + 22, 16); g.fill(); g.fillStyle = c.on ? "#1d1b33" : "#e9e6ff"; g.fillText(c.t, x + ws[k] / 2, y + 2); x += ws[k] + 14; });
      } else { g.fillStyle = r.color || "#ffffff"; g.fillText(r.text, CW / 2, y); }
    });
    g.globalAlpha = 1; g.textAlign = "left";
  }

  /* "범인은 누구?" 카드와 정답 카드 (사건 카드로 쓴 이야기만) */
  function fit(g, text, maxW, size, weight) { let z = size; do { g.font = `${weight} ${z}px ${FONT}`; z -= 2; } while (g.measureText(text).width > maxW && z > 14); }
  function drawGuess(g, s, t, ko, note, tap) {
    const C = s.clue, n = C.options.length, w = 262, gap = 22, x0 = (CW - (w * n + gap * (n - 1))) / 2, y0 = 268, h = 258;
    g.drawImage(s.bg, 0, 0, CW, CH); g.fillStyle = "rgba(10,8,30,0.45)"; g.fillRect(0, 0, CW, CH);
    g.textAlign = "center";
    g.globalAlpha = Math.min(1, t / 400);
    g.fillStyle = GOLD; g.font = `800 84px ${FONT}`; g.fillText("WHO DID IT?", CW / 2, 118);
    g.fillStyle = "#fff"; fit(g, C.q, CW - 160, 38, 700); g.fillText(C.q, CW / 2, 176);
    if (ko) { g.fillStyle = "rgba(207,224,255,0.9)"; g.font = `500 24px ${FONT}`; g.fillText(C.qKo, CW / 2, 216); }
    C.options.forEach((o, i) => {
      const a = Math.max(0, Math.min(1, (t - 500 - i * 220) / 400)), x = x0 + i * (w + gap);
      g.globalAlpha = a;
      g.fillStyle = "rgba(255,255,255,0.12)"; rr(g, x, y0, w, h, 18); g.fill();
      g.strokeStyle = "rgba(255,214,72,0.7)"; g.lineWidth = 3; rr(g, x, y0, w, h, 18); g.stroke();
      g.fillStyle = "#fff"; g.font = `72px ${FONT}`; g.fillText(o.emoji, x + w / 2, y0 + 92);
      g.fillStyle = GOLD; fit(g, o.name, w - 24, 34, 800); g.fillText(o.name, x + w / 2, y0 + 146);
      g.fillStyle = "#e9e6ff"; fit(g, o.role, w - 24, 22, 600); g.fillText(o.role, x + w / 2, y0 + 180);
      if (ko) { g.fillStyle = "rgba(207,224,255,0.85)"; fit(g, `${o.ko} · ${o.roleKo}`, w - 20, 19, 500); g.fillText(`${o.ko} · ${o.roleKo}`, x + w / 2, y0 + 210); }
      g.fillStyle = "rgba(255,255,255,0.75)"; fit(g, o.trait, w - 20, 18, 500); g.fillText(o.trait, x + w / 2, y0 + 238);
    });
    g.globalAlpha = Math.max(0, Math.min(1, (t - 1600) / 400));
    g.fillStyle = "#fff"; g.font = `700 30px ${FONT}`; g.fillText(note || "Think about the clues!", CW / 2, 604);
    if (ko) { g.fillStyle = "rgba(207,224,255,0.9)"; g.font = `500 22px ${FONT}`; g.fillText("영상에 나온 단서를 떠올려 봐요. 디벗에서 범인을 골라요!", CW / 2, 644); }
    if (tap) { g.fillStyle = "rgba(255,255,255,0.55)"; g.font = `500 18px ${FONT}`; g.fillText("선생님: 화면을 누르면 투표를 마감하고 마지막 화가 시작돼요", CW / 2, 692); }
    g.globalAlpha = 1; g.textAlign = "left";
  }
  function drawAnswer(g, s, t, ko) {
    const C = s.clue, c = C.options[C.answer], show = (ms) => Math.max(0, Math.min(1, (t - ms) / 450));
    g.drawImage(s.bg, 0, 0, CW, CH); g.fillStyle = "rgba(10,8,30,0.45)"; g.fillRect(0, 0, CW, CH);
    g.textAlign = "center";
    g.globalAlpha = show(0); g.fillStyle = GOLD; g.font = `800 84px ${FONT}`; g.fillText("CASE CLOSED!", CW / 2, 120);
    g.globalAlpha = show(700); g.fillStyle = "#fff"; g.font = `110px ${FONT}`; g.fillText(c.emoji, CW / 2, 262);
    g.fillStyle = "#fff"; fit(g, `It was ${c.name}, ${c.role}!`, CW - 160, 50, 800); g.fillText(`It was ${c.name}, ${c.role}!`, CW / 2, 340);
    if (ko) { g.fillStyle = "rgba(207,224,255,0.9)"; g.font = `500 24px ${FONT}`; g.fillText(`범인은 ${c.ko} (${c.roleKo})`, CW / 2, 378); }
    const rows = [[`${C.item.emoji}  Clue: ${C.item.en}`, `단서: ${C.item.ko}`], [`${C.where.emoji}  Found ${C.where.prep || "in"} ${C.where.en}`, `찾은 곳: ${C.where.ko}`], [`💬  "${C.why}"`, C.whyKo]];
    rows.forEach(([en, k2], i) => {
      g.globalAlpha = show(1500 + i * 700);
      const y = 446 + i * (ko ? 78 : 62);
      g.fillStyle = i === 2 ? GOLD : "#e9e6ff"; fit(g, en, CW - 200, 32, 700); g.fillText(en, CW / 2, y);
      if (ko) { g.fillStyle = "rgba(207,224,255,0.85)"; fit(g, k2, CW - 200, 21, 500); g.fillText(k2, CW / 2, y + 30); }
    });
    g.globalAlpha = 1; g.textAlign = "left";
  }

  /* ---------- 이야기 → 장면 목록 ---------- */
  function sceneNames(film, sc) {
    const names = [], text = sc.screen + " " + sc.lines.map((l) => l[1]).join(" ");
    for (const [sp] of sc.lines) if (sp !== "Narrator" && !names.includes(sp)) names.push(sp);
    for (const n of Object.keys(film.characters)) if (n !== "Narrator" && new RegExp("\\b" + escRe(n) + "\\b").test(text) && !names.includes(n)) names.push(n);
    return names.slice(0, 3);
  }
  const ICON = { bgm: "🎵 Music", voice_cast: "🎙️ Voice cast", bonus_scene: "✨ Bonus scene" };
  async function prepare(film, opts) {
    opts = opts || {};
    const topicId = opts.topicId || "", shots = [], thumbs = [];
    const bg = PixelArt.starfield(7);
    /* 사건 카드로 쓴 이야기: 마지막 화(범인 밝히기) 앞에서 멈추고 "범인은 누구?"를 묻고, 끝에 정답 카드를 보여 줘요 */
    const C = film.clue || null, guess = C ? { kind: "guess", hold: true, bg, clue: C, say: "Who did it?" } : null;
    shots.push({ kind: "card", dur: C ? 5200 : 4200, say: `${film.team} presents. ${film.title}.`, rows: [
      { text: `${film.team} presents`, size: 30, color: lighten(film.teamColor || "#aaa6d6", 0.45), weight: 700 },
      { text: film.title, size: film.title.length > 24 ? 60 : 76, color: GOLD, gap: 110 },
      ...(C ? [{ text: `🔎 ${C.q}`, size: 34, color: "#ffffff", weight: 700, gap: 76 }] : []),
      { text: `A relay story by ${film.writers.join(", ")}`, size: 28, color: "#e9e6ff", weight: 600, gap: 70 },
      { text: film.topic, size: 24, color: "#aaa6d6", weight: 600, gap: 50 }], bg });
    let n = 0, asked = false;
    for (const [i, ep] of film.episodes.entries()) {
      if (guess && ep.role === "solve" && !asked) { shots.push(guess); asked = true; }
      shots.push({ kind: "card", dur: 3000, bg, rows: [
        { text: `EPISODE ${i + 1}`, size: 30, color: "#aaa6d6", weight: 700 },
        { text: ep.title, size: 60, color: GOLD, gap: 90 },
        { text: `written by ${ep.writer}`, size: 30, color: "#e9e6ff", weight: 600, gap: 64 },
        { chips: ep.mission.map((w) => ({ t: w, on: (ep.used || []).includes(w) })), size: 28, gap: 84 }] });
      for (const sc of ep.scenes) {
        const text = sc.screen + " " + sc.lines.map((l) => l[1]).join(" ");
        const pick = PixelArt.pickBackground(text, sc.screen);
        const asset = await findAsset(topicId, pick.bg, pick.day);
        const art = PixelArt.compose(text, sceneNames(film, sc), 17 + n * 31, { asset: asset ? () => asset : null, bgText: sc.screen, looks: film.characters });
        thumbs.push({ id: sc.id, canvas: art.canvas, screen: sc.screen, lines: sc.lines, ep: i, ai: art.ai });
        shots.push({ kind: "scene", img: art.big, lines: sc.lines, words: ep.mission, n: n++ });
      }
      if (ep.choice) shots.push({ kind: "choice", dur: 4200, bg, q: ep.choice.question, options: ep.choice.options, picked: ep.choice.picked });
    }
    if (guess) { if (!asked) shots.push(guess); const c = C.options[C.answer]; shots.push({ kind: "answer", dur: 10000, bg, clue: C, say: `Case closed! It was ${c.name}.` }); }
    const used = film.episodes.reduce((a, e) => a + (e.used || []).length, 0), tot = film.episodes.reduce((a, e) => a + e.mission.length, 0);
    const stars = Object.keys(film.characters).filter((c) => c !== "Narrator" && thumbs.some((t) => t.lines.some((l) => l[0] === c) || new RegExp("\\b" + escRe(c) + "\\b").test(t.screen)));
    shots.push({ kind: "card", dur: 6500, bg, say: C ? "The end." : "The end?", rows: [
      { text: C ? "THE END" : "THE END ...?", size: 80, color: GOLD },
      { text: `Starring  ${stars.join(" · ") || "our heroes"}`, size: 30, color: "#e9e6ff", weight: 600, gap: 90 },
      { text: `Writers  ${film.writers.join(" · ")}`, size: 30, color: "#e9e6ff", weight: 600, gap: 52 },
      { text: `Mission words used  ${used} / ${tot}`, size: 30, color: GOLD, weight: 700, gap: 60 },
      { text: film.bonus.length ? "Bonus items  " + film.bonus.map((b) => ICON[b] || b).join("   ") : "Made with Relay Story Live", size: 26, color: "#aaa6d6", weight: 600, gap: 56 }] });
    return { film, shots, thumbs, bonus: film.bonus, characters: film.characters };
  }

  /* ---------- 재생기 ---------- */
  class Theater {
    constructor(canvas, opts) {
      this.c = canvas; this.c.width = CW; this.c.height = CH; this.g = canvas.getContext("2d");
      this.opts = opts || {}; this.playing = false; this.voiceOn = true; this.musicOn = true; this.koOn = true; this.fast = false; this.token = 0;
      this.state = null; this.drawLoop = this.drawLoop.bind(this);
    }
    poster(prep) {
      const s = prep.shots[0];
      this.state = { shot: s, t0: performance.now() - 2000 };
      this.draw(performance.now());
      const g = this.g;
      g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(0, 0, CW, CH);
      const py = CH - 96;
      g.fillStyle = "#fff"; g.beginPath(); g.arc(CW / 2, py, 46, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#1d1b33"; g.beginPath(); g.moveTo(CW / 2 - 14, py - 26); g.lineTo(CW / 2 + 24, py); g.lineTo(CW / 2 - 14, py + 26); g.fill();
    }
    async play(prep, from) {
      this.stop();
      const my = ++this.token;
      this.prep = prep; this.playing = true; this.paused = false; this.skip = false;
      await Voice.ready();
      this.cast = Voice.cast(prep.characters, prep.bonus.includes("voice_cast"));
      if (prep.bonus.includes("bgm") && this.musicOn) { this.music = new MusicBox(); this.music.start(); }
      requestAnimationFrame(this.drawLoop);
      const alive = () => my === this.token;
      for (let k = from || 0; k < prep.shots.length && alive(); k++) {
        const s = prep.shots[k];
        this.index = k; this.skip = false;
        this.state = { shot: s, t0: performance.now(), line: null };
        if (this.opts.onShot) this.opts.onShot(k, prep.shots.length, s);
        if (s.kind === "scene") {
          const f = this.fast ? 0.45 : 1;
          await sleep(500 * f);
          for (const [sp, text, ko] of s.lines) {
            if (!alive() || this.skip) break;
            await this.waitPause(alive);
            const ch = prep.characters[sp] || {};
            this.state.line = { sp, text, ko: this.koOn ? ko || "" : "", color: ch.color || (sp !== "Narrator" ? this.nameColor(sp) : null) };
            let spec = this.voiceOn ? (this.cast[sp] || this.cast.Narrator) : null;
            if (spec && this.fast) spec = Object.assign({}, spec, { rate: (spec.rate || 0.92) * 1.18 });
            await Voice.speak(text, spec, () => !alive() || this.skip, this.fast);
            await sleep(260 * f);
          }
          if (alive() && !this.skip) await sleep(700 * f);
        } else if (s.hold) {
          /* 멈춤 카드: 선생님이 '계속'을 누를 때까지 기다려요 (영상관처럼 혼자 볼 때는 holdMs 뒤에 저절로 넘어가요) */
          if (s.say && this.voiceOn && this.cast.Narrator) Voice.speak(s.say, this.cast.Narrator, () => !alive() || this.skip);
          this.go = false; this.holding = true; this.note = "";
          if (this.opts.onHold) this.opts.onHold(s);
          const until = this.opts.holdMs != null ? performance.now() + this.opts.holdMs : Infinity;
          while (alive() && !this.skip && !this.go && performance.now() < until) await sleep(100);
          if (alive()) { this.holding = false; if (this.opts.onResume) this.opts.onResume(s); }
        } else {
          if (s.say && this.voiceOn && this.cast.Narrator) Voice.speak(s.say, this.cast.Narrator, () => !alive() || this.skip);
          const end = performance.now() + s.dur * (this.fast ? 0.6 : 1);
          while (alive() && !this.skip && performance.now() < end) { await sleep(100); if (this.paused) { const p0 = performance.now(); await this.waitPause(alive); s.dur += performance.now() - p0; } }
        }
      }
      if (alive()) { this.finish(); if (this.opts.onEnd) this.opts.onEnd(); }
    }
    nameColor(name) { const PALETTE = ["#ff9b9b", "#8ee6a8", "#c9a0ff", "#ffb86b", "#7ee0f0", "#ff9ccf"]; let h = 0; for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return PALETTE[h % PALETTE.length]; }
    async waitPause(alive) { while (this.paused && alive()) await sleep(120); }
    pause(on) { this.paused = on; try { on ? speechSynthesis.pause() : speechSynthesis.resume(); } catch (e) {} }
    next() { this.skip = true; try { speechSynthesis.cancel(); } catch (e) {} }
    resume() { this.go = true; }
    finish() { this.playing = false; this.holding = false; if (this.music) { this.music.stop(); this.music = null; } }
    stop() { this.token++; this.finish(); try { speechSynthesis.cancel(); } catch (e) {} }
    setMusic(on) { this.musicOn = on; if (!on && this.music) { this.music.stop(); this.music = null; } else if (on && this.playing && !this.music && this.prep && this.prep.bonus.includes("bgm")) { this.music = new MusicBox(); this.music.start(); } }
    drawLoop(now) { if (!this.playing) return; this.draw(now); requestAnimationFrame(this.drawLoop); }
    draw(now) {
      const g = this.g, st = this.state; if (!st) return;
      const s = st.shot, t = now - st.t0;
      g.fillStyle = "#000"; g.fillRect(0, 0, CW, CH);
      if (s.kind === "scene") {
        const z = 1 + 0.1 * Math.min(1, t / 14000), dirs = [[0.5, 0.2], [0.1, 0.5], [0.9, 0.5], [0.5, 0.8]], [px, py] = dirs[s.n % 4];
        const sw = CW / z, sh = CH / z, sx = (CW - sw) * px, sy = (CH - sh) * py;
        g.imageSmoothingEnabled = true;
        g.drawImage(s.img, (sx / CW) * s.img.width, (sy / CH) * s.img.height, (sw / CW) * s.img.width, (sh / CH) * s.img.height, 0, 0, CW, CH);
        if (st.line) drawSubtitle(g, st.line.sp, st.line.text, s.words, st.line.color, st.line.ko);
      } else if (s.kind === "card") drawCard(g, s.bg, s.rows, t);
      else if (s.kind === "guess") drawGuess(g, s, t, this.koOn, this.note, this.holding && this.opts.holdMs == null);
      else if (s.kind === "answer") drawAnswer(g, s, t, this.koOn);
      else if (s.kind === "choice") {
        const showPick = t > 1700;
        drawCard(g, s.bg, [{ text: "WHAT'S NEXT?", size: 34, color: "#aaa6d6", weight: 700 }, { text: s.q, size: 52, color: GOLD, gap: 84 },
          { chips: s.options.map((o, i) => ({ t: `${"AB"[i]}) ${o}${showPick && s.picked === i ? "  ✔" : ""}`, on: showPick && s.picked === i })), size: 34, gap: 100 },
          { text: showPick ? `The next writer chose ${"AB"[s.picked]}!` : "", size: 28, color: "#e9e6ff", weight: 600, gap: 70 }], t);
      }
      const fade = Math.max(0, 1 - t / 450);
      if (fade > 0) { g.fillStyle = `rgba(0,0,0,${fade})`; g.fillRect(0, 0, CW, CH); }
    }
  }
  global.RSLTheater = { Theater, prepare, Voice, MusicBox, CW, CH };
})(window);
