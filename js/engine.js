/* Relay Story Live · 수업 진행 엔진 (교사 화면 브라우저 안에서 돌아감)
   1 오늘의 Topic → 2 단어 학습·퀴즈(모둠 보너스) → 3 돌려 쓰기 릴레이 소설 → 4 영상 만들기·대표작 → 5 함께 보기
   돌려 쓰기: 모둠원이 모두 동시에 자기 이야기를 시작하고, 라운드마다 옆 사람에게 넘겨 이어 씁니다. */
(function (global) {
  "use strict";
  const TEAM_COLORS = ["#E0582B", "#2C67BE", "#6A4FC9", "#1E8A4C", "#C48A00", "#D23F7A", "#0F8F8A", "#8A5A2B"];
  const TEAM_NAMES = ["Team Sunrise", "Team Ocean", "Team Galaxy", "Team Forest", "Team Star", "Team Candy", "Team Mint", "Team Comet"];
  const ITEMS = [
    { id: "bgm", min: 0.5, name: "배경음악", en: "Background music" },
    { id: "voice_cast", min: 0.7, name: "캐릭터별 목소리", en: "Voice casting" },
    { id: "bonus_scene", min: 0.85, name: "보너스 장면 +1", en: "Bonus scene" },
  ];
  const PHASES = ["topic", "words", "write", "video", "watch"];
  const EMOJI = ["clap", "laugh", "wow", "heart"];

  const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const wordRe = (w) => new RegExp("\\b" + escRe(w) + "\\w*", "i");
  const ascii = (s) => /^[\x00-\x7f]+$/.test(s);
  const clean = (s, max) => String(s == null ? "" : s).replace(/\r/g, "").replace(/[<>]/g, "").slice(0, max).trim();
  function seeded(seed) { let x = seed; return () => { x = (x * 1103515245 + 12345) & 0x7fffffff; return x / 0x7fffffff; }; }
  function shuffle(arr, rnd) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const sentences = (t) => (String(t).match(/[^.!?]+[.!?]+/g) || (String(t).trim() ? [t] : [])).length;

  function makeTeams(n) { return Array.from({ length: n }, (_, i) => ({ id: i, name: TEAM_NAMES[i], color: TEAM_COLORS[i] })); }
  function freshState(topicId, room) {
    return {
      v: 1, room: room || "", phase: "topic", topicId, teamCount: 6, created: Date.now(),
      players: {}, teams: makeTeams(6), wordIndex: 0, quiz: "closed",
      write: { started: false, round: 0, rounds: 4, roundSec: 180, endsAt: null, closingAt: null, done: false },
      roster: {}, stories: [], teamVotes: {}, picks: {}, filmsMade: false,
      watchIndex: -1, votes: {}, reactions: {},
    };
  }

  class Engine {
    constructor(content, saved, opts) {
      this.C = content;
      opts = opts || {};
      this.S = saved && saved.teams ? saved : freshState(content.topics[0].id, opts.room);
      this.extraBanned = opts.extraBanned || [];
      this.realNames = opts.realNames || [];
      this.onEvent = opts.onEvent || (() => {});
    }
    /* ---------- 기본 ---------- */
    topic() { return this.C.topics.find((t) => t.id === this.S.topicId) || this.C.topics[0]; }
    members(teamId) { return Object.values(this.S.players).filter((p) => p.team === teamId).sort((a, b) => a.joined - b.joined); }
    activeTeams() { return this.S.teams.filter((t) => this.members(t.id).length || (this.S.roster[t.id] || []).length); }
    bump() { this.S.v++; }
    banned() { return this.C.banned.concat(this.extraBanned); }
    safety(text) {
      const issues = [], low = text.toLowerCase();
      for (const w of this.banned()) if (ascii(w) ? wordRe(w.toLowerCase()).test(low) : text.includes(w)) issues.push(`금지어: ${w}`);
      const chars = new Set(Object.keys(this.topic().characters));
      for (const n of this.realNames) {
        if (!n || chars.has(n)) continue;
        if (ascii(n) ? new RegExp("\\b" + escRe(n) + "\\b", "i").test(text) : text.includes(n)) issues.push(`실명: ${n}`);
      }
      return issues;
    }
    /* ---------- 단어 게임 (문제는 학생 디벗에서 같은 규칙으로 만들어져 바로 풀려요) ---------- */
    questions() { return Engine.game(this.topic()); }
    teamQuiz(teamId) {
      let correct = 0, answered = 0, score = 0, n = 0;
      for (const p of this.members(teamId)) {
        const as = Object.values(p.answers || {});
        if (as.length) { n++; score += Engine.score(as).score; }
        for (const a of as) { answered++; if (a.ok) correct++; }
      }
      const acc = answered ? correct / answered : 0;
      return { correct, answered, acc, avg: n ? Math.round(score / n) : 0, players: n, items: answered ? ITEMS.filter((it) => acc >= it.min).map((it) => it.id) : [] };
    }
    /* 많이 틀린 단어 (모든 학생의 틀린 횟수 합) */
    missed() {
      const W = this.topic().words, qs = this.questions(), cnt = W.map(() => 0);
      for (const p of Object.values(this.S.players)) for (const [qid, a] of Object.entries(p.answers || {})) {
        const q = qs.find((x) => x.id === qid); if (q && a.tries > 1) cnt[q.w] += a.tries - 1;
      }
      return cnt.map((c, i) => ({ i, c })).filter((x) => x.c > 0).sort((a, b) => b.c - a.c);
    }
    /* ---------- 단어 낚시: 문제를 맞혀 미끼를 얻고, 낚은 물고기로 코인을 모아요 ---------- */
    teamFish(teamId) {
      const ms = this.members(teamId); let earned = 0, caught = 0, laps = 0, n = 0;
      for (const p of ms) { const f = p.fish || {}; if (f.earned || f.caught) n++; earned += f.earned || 0; caught += f.caught || 0; laps += f.laps || 0; }
      return { earned, caught, laps, players: n, members: ms.length, avg: ms.length ? Math.round(earned / ms.length) : 0 };
    }
    fishRanking() {
      return this.S.teams.map((t) => Object.assign({ id: t.id }, this.teamFish(t.id))).filter((t) => t.members).sort((a, b) => b.avg - a.avg || b.earned - a.earned);
    }
    /* ---------- 돌려 쓰기 ---------- */
    missionWords(k) { const W = this.topic().words.map((w) => w.word); return [0, 1, 2].map((j) => W[(k * 3 + j) % W.length]); }
    teamStories(teamId) { return this.S.stories.filter((s) => s.team === teamId); }
    heldStory(pid) {
      const p = this.S.players[pid]; if (!p) return null;
      const ro = this.S.roster[p.team] || [], i = ro.indexOf(pid);
      if (i < 0) return null;
      const m = ro.length, j = (((i - this.S.write.round) % m) + m) % m;
      return this.teamStories(p.team)[j] || null;
    }
    holderOf(story, round) {
      const ro = this.S.roster[story.team] || [], m = ro.length, j = this.teamStories(story.team).indexOf(story);
      return m ? ro[(j + round) % m] : null;
    }
    startWriting() {
      const S = this.S;
      S.roster = {}; S.stories = []; S.teamVotes = {}; S.picks = {}; S.filmsMade = false; S.votes = {}; S.reactions = {}; S.watchIndex = -1;
      for (const t of S.teams) {
        const ms = this.members(t.id);
        if (!ms.length) continue;
        S.roster[t.id] = ms.map((p) => p.id);
        ms.forEach((p, j) => S.stories.push({ id: `t${t.id}s${j}`, team: t.id, starter: p.id, starterName: p.name, episodes: [], twists: {} }));
      }
      S.write.started = true; S.write.done = false; S.write.round = 0; S.write.closingAt = null;
      S.write.endsAt = Date.now() + S.write.roundSec * 1000;
    }
    roundStatus() {
      const r = this.S.write.round, out = { total: 0, done: 0 };
      for (const s of this.S.stories) { const h = this.holderOf(s, r); if (!h) continue; out.total++; if (s.episodes.some((e) => e.k === r)) out.done++; }
      return out;
    }
    advanceRound() {
      const w = this.S.write;
      w.closingAt = null; w.allAt = null;
      if (w.round + 1 >= w.rounds) { w.done = true; w.endsAt = null; this.onEvent("writeDone"); }
      else { w.round++; w.endsAt = Date.now() + w.roundSec * 1000; this.onEvent("round", w.round); }
    }
    /* 1초마다 교사 화면이 부름: 시간 끝 → 5초 동안 학생 폰이 자동 저장 → 다음 라운드 */
    tick() {
      const w = this.S.write, now = Date.now();
      if (this.S.phase !== "write" || !w.started || w.done) return false;
      if (w.closingAt && now - w.closingAt > 5000) { this.advanceRound(); return true; }
      if (!w.closingAt && w.endsAt && now >= w.endsAt) { w.closingAt = now; return true; }
      const st = this.roundStatus(), all = st.total && st.done === st.total;
      if (all && !w.closingAt && w.allAt == null) { w.allAt = now; return true; }          // 모두 제출 → 3초 뒤 바로 다음 라운드
      if (all && w.allAt != null && now - w.allAt >= 3000) { w.allAt = null; this.advanceRound(); return true; }
      if (!all) w.allAt = null;
      return false;
    }
    twistFor(story, k) {
      if (!story.twists[k]) { const L = this.C.twists; story.twists[k] = L[Math.floor(Math.random() * L.length)]; }
      return story.twists[k];
    }
    /* ---------- 대표작 / 영상 ---------- */
    representative(teamId) {
      const list = this.teamStories(teamId).filter((s) => s.episodes.length);
      if (!list.length) return null;
      if (this.S.picks[teamId] && list.some((s) => s.id === this.S.picks[teamId])) return list.find((s) => s.id === this.S.picks[teamId]);
      const votes = (s) => Object.values(this.S.teamVotes).filter((v) => v === s.id).length;
      const used = (s) => s.episodes.reduce((n, e) => n + e.used.length, 0);
      return list.slice().sort((a, b) => votes(b) - votes(a) || b.episodes.length - a.episodes.length || used(b) - used(a))[0];
    }
    screenList() { return this.activeTeams().map((t) => ({ team: t, story: this.representative(t.id) })).filter((x) => x.story); }
    /* 장면 글 → 대사 줄 [말하는 사람, 영어, 우리말 자막]. 우리말은 영어 한 줄에 한 줄씩 짝지어요 */
    parseScene(text, chars, ko) {
      const lines = [], raws = String(text).split(/\n+/).map((x) => x.trim()).filter(Boolean);
      raws.forEach((line, r) => {
        const m = line.match(/^([A-Z][A-Za-z' -]{0,18}?)\s*:\s*(.+)$/);
        if (m && !["From", "To", "PS", "P.S"].includes(m[1])) {
          const name = m[1].trim();
          if (!chars[name]) chars[name] = { voice: "extra" + (Object.keys(chars).length % 6), color: null };
          lines.push([name, m[2].replace(/^["“]|["”]$/g, "").trim(), "", r]);
        } else for (const s of line.split(/(?<=[.!?])\s+(?=[A-Z"“])/)) if (s.trim()) lines.push(["Narrator", s.trim(), "", r]);
      });
      const kos = String(ko || "").split(/\n+/).map((x) => x.trim().replace(/^[^:：\s]{1,12}\s*[:：]\s*/, "").replace(/^["“]|["”]$/g, "")).filter(Boolean);
      if (kos.length === raws.length) raws.forEach((_, r) => {
        const sub = lines.filter((l) => l[3] === r), parts = kos[r].split(/(?<=[.!?])\s+/).filter(Boolean);
        sub.forEach((l, j) => (l[2] = parts.length === sub.length ? parts[j] : kos[r]));
      });
      else if (kos.length === lines.length) lines.forEach((l, j) => (l[2] = kos[j]));
      else if (kos.join(" ").split(/(?<=[.!?])\s+/).filter(Boolean).length === lines.length) { const ks = kos.join(" ").split(/(?<=[.!?])\s+/).filter(Boolean); lines.forEach((l, j) => (l[2] = ks[j])); }
      else if (kos.length) lines.forEach((l, j) => (l[2] = kos[Math.min(kos.length - 1, Math.floor((j * kos.length) / lines.length))]));
      const auto = this.autoKo || {};
      for (const l of lines) { if (/^[-–—]$/.test(l[2])) l[2] = ""; /* '-'는 쉬운 모드가 줄 맞춤용으로 넣은 빈 자막 */ if (!l[2] && auto[l[1]]) l[2] = auto[l[1]]; l.length = 3; }
      return lines;
    }
    buildFilm(story) {
      const T = this.topic(), team = this.S.teams[story.team];
      const chars = JSON.parse(JSON.stringify(T.characters));
      const q = this.teamQuiz(story.team);
      const eps = story.episodes.slice().sort((a, b) => a.k - b.k);
      return {
        id: story.id, topic: T.title, topicKo: T.ko || "", seed: T.seed, team: team.name, teamColor: team.color, starter: story.starterName,
        title: (eps[0] && eps[0].title) || `${story.starterName}'s Story`, bonus: q.items, characters: chars,
        writers: [...new Set(eps.map((e) => e.writer))],
        episodes: eps.map((ep, i) => {
          const next = eps[i + 1];
          const out = { title: ep.title || `Episode ${i + 1}`, writer: ep.writer, mission: ep.mission, used: ep.used, twist: ep.twist,
            scenes: ep.scenes.map((sc, j) => ({ id: `${story.id}e${i + 1}s${j + 1}`, screen: sc.screen, lines: this.parseScene(sc.text, chars, sc.ko) })).filter((sc) => sc.lines.length) };
          if (ep.next && ep.next.question && ep.next.a && ep.next.b && next) out.choice = { question: ep.next.question, options: [ep.next.a, ep.next.b], picked: next.pick === 1 ? 1 : 0 };
          return out;
        }).filter((e) => e.scenes.length),
      };
    }
    allFilms() { const o = {}; for (const s of this.S.stories) if (s.episodes.length) o[s.id] = this.buildFilm(s); return o; }
    classReport() {
      const S = this.S, ps = Object.values(S.players);
      let eps = 0, sent = 0, used = 0, total = 0;
      const writers = new Set();
      for (const s of S.stories) for (const e of s.episodes) {
        eps++; writers.add(e.pid); used += e.used.length; total += e.mission.length;
        for (const sc of e.scenes) sent += sentences(sc.text);
      }
      let qa = 0, qc = 0; for (const p of ps) for (const a of Object.values(p.answers || {})) { qa++; if (a.ok) qc++; }
      const quizzed = ps.filter((p) => Object.keys(p.answers || {}).length).length;
      return { players: ps.length, quizzed, quizAcc: qa ? Math.round((100 * qc) / qa) : 0, writers: writers.size, episodes: eps, sentences: sent,
        missionUsed: used, missionTotal: total, stories: S.stories.filter((s) => s.episodes.length).length,
        reactions: Object.values(S.reactions).reduce((n, r) => n + Object.values(r).reduce((a, b) => a + b, 0), 0) };
    }
    /* ---------- 교사 조작 ---------- */
    hostAction(b) {
      const S = this.S;
      switch (b.action) {
        case "phase":
          if (!PHASES.includes(b.phase)) return false;
          S.phase = b.phase;
          if (b.phase === "write" && !S.write.started) this.startWriting();
          if (b.phase === "watch" && S.watchIndex < 0) S.watchIndex = 0;
          break;
        case "topic": if (this.C.topics.some((t) => t.id === b.topic) && b.topic !== S.topicId) { S.topicId = b.topic; S.wordIndex = 0; S.quiz = "closed"; S.quizEndsAt = null; S.catchFeed = []; for (const p of Object.values(S.players)) { p.answers = {}; p.fish = {}; } } break;
        case "teams": {
          const n = Math.max(2, Math.min(8, parseInt(b.n, 10) || 6));
          S.teamCount = n; S.teams = makeTeams(n);
          for (const p of Object.values(S.players)) if (p.team >= n) p.team = p.team % n;
          break;
        }
        case "rounds": S.write.rounds = Math.max(2, Math.min(6, parseInt(b.n, 10) || 4)); break;
        case "roundSec": S.write.roundSec = Math.max(60, Math.min(600, parseInt(b.n, 10) || 180)); break;
        case "word": S.wordIndex = Math.max(0, Math.min(this.topic().words.length - 1, b.i != null ? +b.i : S.wordIndex + (b.d || 0))); break;
        case "quiz": {
          const st = ["open", "results"].includes(b.state) ? b.state : "closed";
          if (st === "open" && b.min) S.quizEndsAt = Date.now() + Math.max(1, Math.min(20, +b.min || 7)) * 60000;
          if (st === "open" && (b.game === "run" || b.game === "fish")) S.quizGame = b.game; /* 단어 낚시 또는 단어 달리기 */
          if (st !== "open") S.quizEndsAt = null;
          S.quiz = st; break;
        }
        case "quizTime": if (S.quiz === "open" && S.quizEndsAt) S.quizEndsAt += (b.sec || 60) * 1000; break;
        case "addTime": if (S.write.endsAt) { S.write.endsAt += (b.sec || 60) * 1000; S.write.closingAt = null; } break;
        case "nextRound": if (S.write.started && !S.write.done) { S.write.closingAt = Date.now(); } break;
        case "restartWriting": this.startWriting(); break;
        case "kick": if (b.pid && S.players[b.pid]) delete S.players[b.pid]; break;
        case "moveTeam": if (S.players[b.pid] && b.team >= 0 && b.team < S.teams.length) S.players[b.pid].team = b.team; break;
        case "makeFilms": S.filmsMade = true; break;
        case "pick": S.picks[b.team] = b.story; break;
        case "watch": {
          const n = this.screenList().length;
          S.watchIndex = Math.max(0, Math.min(n, b.index != null ? b.index : S.watchIndex + (b.d || 0)));
          break;
        }
        case "reset": this.S = freshState(S.topicId, S.room); this.S.teamCount = S.teamCount; this.S.teams = makeTeams(S.teamCount); this.S.write.rounds = S.write.rounds; this.S.write.roundSec = S.write.roundSec; break;
        default: return false;
      }
      this.bump();
      return true;
    }
    /* ---------- 학생 행동 ---------- */
    playerAction(pid, type, b) {
      const S = this.S;
      b = b || {};
      if (type === "join") {
        const name = clean(b.name, 12).replace(/\s+/g, " ");
        const team = parseInt(b.team, 10);
        if (!name || !(team >= 0 && team < S.teams.length)) return { ok: false, msg: "닉네임과 모둠을 골라 주세요" };
        if (this.safety(name).length) return { ok: false, msg: "다른 닉네임을 써 주세요 (실명·나쁜 말 안 돼요)" };
        if (Object.values(S.players).some((p) => p.id !== pid && p.name.toLowerCase() === name.toLowerCase())) return { ok: false, msg: "이미 있는 닉네임이에요. 조금 바꿔 주세요" };
        const old = S.players[pid];
        if (old) { old.name = name; if (!S.write.started) old.team = team; }
        else S.players[pid] = { id: pid, name, team, joined: Date.now(), answers: {} };
        this.bump();
        return { ok: true };
      }
      const pl = S.players[pid];
      if (!pl) return { ok: false, msg: "다시 입장해 주세요", rejoin: true };
      if (type === "answer") {
        if (S.quiz !== "open") return { ok: false, msg: "퀴즈가 닫혀 있어요" };
        const q = this.questions().find((x) => x.id === b.qid);
        if (!q) return { ok: false };
        if (pl.answers[q.id]) return { ok: true, dup: true };
        /* 디벗에서 바로 채점하고 결과(몇 번 만에 맞혔는지, 걸린 시간)만 보내요 */
        const tries = Math.max(1, Math.min(9, parseInt(b.tries, 10) || 1)), ms = Math.max(0, Math.min(120000, parseInt(b.ms, 10) || 0));
        this.S.ansSeq = (this.S.ansSeq || 0) + 1;
        pl.answers[q.id] = { ok: tries === 1, tries, ms, at: this.S.ansSeq };
        this.bump();
        return { ok: true };
      }
      if (type === "fish") {
        if (S.phase !== "words" || S.quiz !== "open") return { ok: false, msg: "지금은 낚시 시간이 아니에요" };
        const num = (v, max) => Math.max(0, Math.min(max, parseInt(v, 10) || 0));
        const f = pl.fish && pl.fish.earned != null ? pl.fish : (pl.fish = { earned: 0, caught: 0, best: 0, rod: 0, pond: 0, coins: 0 });
        f.earned = Math.max(f.earned, num(b.earned, 1000000)); f.caught = Math.max(f.caught, num(b.caught, 100000)); f.laps = Math.max(f.laps || 0, num(b.laps, 1000));
        f.best = Math.max(f.best || 0, num(b.best, 4)); f.rod = num(b.rod, 2); f.pond = num(b.pond, 2); f.coins = num(b.coins, 1000000);
        if (b.rare && (b.rare.kind === "goal" || b.rare.kind === "fever")) {
          S.catchFeed = (S.catchFeed || []).concat({ name: pl.name, team: pl.team, kind: b.rare.kind, at: Date.now() }).slice(-8);
        } else if (b.rare && num(b.rare.tier, 4) >= 3) {
          S.catchFeed = (S.catchFeed || []).concat({ name: pl.name, team: pl.team, tier: num(b.rare.tier, 4), pond: num(b.rare.pond, 2), at: Date.now() }).slice(-8);
        }
        this.bump();
        return { ok: true, slow: true };
      }
      if (type === "submit") {
        const w = S.write;
        if (S.phase !== "write" || !w.started || w.done) return { ok: false, msg: "지금은 쓰는 시간이 아니에요" };
        const round = b.round != null ? b.round : w.round;
        if (round !== w.round) return { ok: false, msg: "라운드가 이미 넘어갔어요" };
        const story = this.heldStory(pid);
        if (!story) return { ok: false, msg: "이번 이야기에는 참여하지 않아요" };
        const team = pl.team, max = this.teamQuiz(team).items.includes("bonus_scene") ? 3 : 2;
        const scenes = (b.scenes || []).slice(0, max).map((s) => ({ screen: clean(s.screen, 160), text: clean(s.text, 600), ko: clean(s.ko, 400) })).filter((s) => s.text);
        if (!scenes.length) return { ok: false, msg: "장면 1의 이야기를 써 주세요" };
        const title = clean(b.title, 50);
        const next = b.next && b.next.question && b.next.a && b.next.b ? { question: clean(b.next.question, 80), a: clean(b.next.a, 40), b: clean(b.next.b, 40) } : null;
        const all = [title, ...scenes.map((s) => s.screen + "\n" + s.text + "\n" + s.ko), next ? `${next.question} ${next.a} ${next.b}` : ""].join("\n");
        const issues = this.safety(all);
        if (issues.length) return { ok: false, msg: "모두 함께 볼 영상이에요. 이 부분을 바꿔 주세요: " + issues.join(", "), issues };
        const mission = this.missionWords(round), text = scenes.map((s) => s.text).join(" ");
        const ep = { k: round, writer: pl.name, pid, title, scenes, next, pick: b.pick === 1 ? 1 : b.pick === 0 ? 0 : null,
          mission, used: mission.filter((m) => wordRe(m).test(text)), twist: story.twists[round] || null, at: Date.now(), auto: !!b.auto };
        story.episodes = story.episodes.filter((e) => e.k !== round).concat([ep]).sort((a, c) => a.k - c.k);
        this.bump();
        return { ok: true };
      }
      if (type === "teamVote") {
        const s = S.stories.find((x) => x.id === b.story);
        if (!s || s.team !== pl.team) return { ok: false };
        S.teamVotes[pid] = s.id; this.bump();
        return { ok: true };
      }
      if (type === "vote") {
        const t = parseInt(b.team, 10);
        if (S.phase !== "watch" || !(t >= 0 && t < S.teams.length) || t === pl.team) return { ok: false, msg: "다른 모둠에 투표해요" };
        S.votes[pid] = t; this.bump();
        return { ok: true };
      }
      if (type === "react") {
        const t = parseInt(b.team, 10), e = EMOJI.includes(b.emoji) ? b.emoji : null;
        if (!e || !(t >= 0 && t < S.teams.length)) return { ok: false };
        S.reactions[t] = S.reactions[t] || {}; S.reactions[t][e] = (S.reactions[t][e] || 0) + 1;
        this.onEvent("react", { team: t, emoji: e });
        this.bump();
        return { ok: true };
      }
      return { ok: false };
    }
    /* ---------- 화면에 보낼 정보 ---------- */
    publicTopic() { const T = this.topic(); return { id: T.id, title: T.title, ko: T.ko || "", seed: T.seed, seedKo: T.seedKo || "", words: T.words, screens: T.screens || [], characters: Object.keys(T.characters).filter((n) => n !== "Narrator"), custom: !!T.custom }; }
    /* 학생 화면에는 주제 번호만 보내요 (단어·예문은 디벗이 이미 갖고 있음). 선생님이 직접 만든 주제만 통째로 보내요 */
    common(full) {
      const w = this.S.write, T = this.topic();
      return { room: this.S.room, phase: this.S.phase, topic: full || T.custom ? this.publicTopic() : { id: T.id, title: T.title }, wordIndex: this.S.wordIndex, quiz: this.S.quiz,
        write: { started: w.started, round: w.round, rounds: w.rounds, roundSec: w.roundSec, done: w.done, closing: !!w.closingAt,
          endsAt: w.endsAt || null },
        filmsMade: this.S.filmsMade, quizEnd: this.S.quiz === "open" ? this.S.quizEndsAt || null : null, quizGame: this.S.quizGame || "fish" };
    }
    storyBrief(s, withText) {
      const o = { id: s.id, team: s.team, starter: s.starterName, n: s.episodes.length, title: (s.episodes[0] && s.episodes[0].title) || "",
        writers: s.episodes.map((e) => e.writer), used: s.episodes.reduce((n, e) => n + e.used.length, 0), total: s.episodes.reduce((n, e) => n + e.mission.length, 0),
        votes: Object.values(this.S.teamVotes).filter((v) => v === s.id).length };
      if (withText) o.episodes = s.episodes.map((e) => ({ k: e.k, writer: e.writer, title: e.title, scenes: e.scenes, next: e.next, pick: e.pick, mission: e.mission, used: e.used }));
      return o;
    }
    hostView() {
      const S = this.S, r = S.write.round;
      return Object.assign(this.common(true), {
        role: "host", items: ITEMS, topics: this.C.topics.map((t) => ({ id: t.id, title: t.title, ko: t.ko || "", genre: t.genre || "", months: t.months || [], custom: !!t.custom })), teamCount: S.teamCount, questions: this.questions().length,
        missed: S.phase === "words" ? this.missed() : [], feed: S.catchFeed || [],
        players: Object.values(S.players).map((p) => ({ id: p.id, name: p.name, team: p.team })),
        roundStatus: this.roundStatus(), report: this.classReport(),
        teams: S.teams.map((t) => {
          const q = this.teamQuiz(t.id), ro = S.roster[t.id] || [];
          const stories = this.teamStories(t.id);
          return { id: t.id, name: t.name, color: t.color, members: this.members(t.id).map((p) => p.name), quiz: { acc: Math.round(q.acc * 100), answered: q.answered, items: q.items, avg: q.avg, players: q.players }, fish: this.teamFish(t.id),
            writers: ro.map((pid) => { const s = this.heldStory(pid); return { name: (S.players[pid] || {}).name || "(나감)", done: !!(s && s.episodes.some((e) => e.k === r)) }; }),
            stories: stories.map((s) => this.storyBrief(s, true)), rep: (this.representative(t.id) || {}).id || null,
            votes: Object.values(S.votes).filter((v) => v === t.id).length, reactions: S.reactions[t.id] || {},
            missionUsed: stories.reduce((n, s) => n + s.episodes.reduce((m, e) => m + e.used.length, 0), 0),
            missionTotal: stories.reduce((n, s) => n + s.episodes.reduce((m, e) => m + e.mission.length, 0), 0) };
        }),
        screen: this.screenList().map((x) => ({ team: x.team.id, story: x.story.id })), watchIndex: S.watchIndex,
      });
    }
    playerView(pid) {
      const S = this.S, base = this.common(), p = pid && S.players[pid];
      const teamsLite = S.teams.map((t) => ({ id: t.id, name: t.name, color: t.color, count: this.members(t.id).length }));
      if (!p) return Object.assign(base, { role: "player", me: null, teams: teamsLite });
      const t = S.teams[p.team], q = this.teamQuiz(p.team), r = S.write.round;
      const out = Object.assign(base, {
        role: "player", me: { id: p.id, name: p.name, team: p.team }, teams: teamsLite,
        team: { id: t.id, name: t.name, color: t.color, members: this.members(t.id).map((m) => m.name), quiz: { acc: Math.round(q.acc * 100), items: q.items } },
        maxScenes: q.items.includes("bonus_scene") ? 3 : 2,
      });
      if (this.extraBanned.length) out.bannedX = this.extraBanned;
      if (S.phase === "words") {
        const as = p.answers || {}, sc = Engine.score(Object.values(as)), f = p.fish || {};
        out.game = { done: Object.keys(as).join(","), ok: sc.ok, n: sc.n, earned: f.earned || 0, caught: f.caught || 0, laps: f.laps || 0 };
        if (S.quiz !== "closed") {
          const tr = this.fishRanking(), ti = tr.findIndex((x) => x.id === p.team), tf = tr[ti] || {};
          out.game.team = { avg: tf.avg || 0, earned: tf.earned || 0, rank: ti + 1, of: tr.length };
        }
        if (S.quiz === "results") {
          out.game.top = this.missed().slice(0, 3).map((x) => x.i);
          out.game.mine = this.questions().filter((x) => as[x.id] && as[x.id].tries > 1).map((x) => x.w).filter((w, i, a) => a.indexOf(w) === i);
          const all = Object.values(S.players).map((x) => (x.fish && x.fish.earned) || 0).sort((a, b) => b - a);
          out.game.rank = all.indexOf(f.earned || 0) + 1; out.game.of = all.length;
        }
      }
      if (S.phase === "write" && S.write.started) {
        const s = this.heldStory(pid);
        out.inRoster = !!s || (S.roster[p.team] || []).includes(pid);
        if (s) {
          const prev = s.episodes.filter((e) => e.k < r).sort((a, b) => a.k - b.k);
          const last = prev[prev.length - 1];
          const mine = s.episodes.find((e) => e.k === r);
          out.held = { id: s.id, starter: s.starterName, mineStarted: s.starter === pid, episodes: this.storyBrief(s, true).episodes.filter((e) => e.k < r),
            choice: last && last.next ? last.next : null, submitted: !!mine, mission: this.missionWords(r), twist: S.write.done ? null : this.twistFor(s, r) };
        }
        const ro = S.roster[p.team] || [];
        out.teamProgress = ro.map((id) => { const hs = this.heldStory(id); return { name: (S.players[id] || {}).name || "?", done: !!(hs && hs.episodes.some((e) => e.k === r)) }; });
      }
      if (S.phase === "video" || (S.phase === "write" && S.write.done)) {
        out.teamStories = this.teamStories(p.team).filter((s) => s.episodes.length).map((s) => this.storyBrief(s, true));
        out.myVote = S.teamVotes[pid] || null;
        out.rep = (this.representative(p.team) || {}).id || null;
      }
      if (S.phase === "watch") {
        const list = this.screenList(), cur = list[S.watchIndex];
        out.watching = cur ? { id: cur.team.id, name: cur.team.name, color: cur.team.color, title: this.buildFilm(cur.story).title } : null;
        out.screenTeams = list.map((x) => ({ id: x.team.id, name: x.team.name, color: x.team.color }));
        out.voted = S.votes[pid] != null ? S.votes[pid] : null;
        const mine = S.stories.find((s) => s.starter === pid);
        out.myStory = mine && mine.episodes.length ? mine.id : null;
      }
      return out;
    }
  }
  /* 시연용 예시 이야기 (단어 예문을 이어 붙여 만듦) */
  Engine.sample = function (T, round, j, needPick) {
    const W = T.words, mw = [0, 1, 2].map((x) => W[(round * 3 + x) % W.length]);
    const chars = Object.keys(T.characters).filter((n) => n !== "Narrator");
    const a = chars[j % chars.length], b = chars[(j + 1) % chars.length];
    const say = ["Wow, look at that!", "I can't believe it!", "Let's go together.", "This is so cool!", "Are you ready?"];
    const sayKo = ["우와, 저것 좀 봐!", "믿을 수가 없어!", "같이 가자.", "이거 진짜 멋지다!", "준비됐어?"];
    const titles = ["The Beginning", "A Big Surprise", "The Secret Plan", "The Last Chance", "A New Friend", "Back Home"];
    const screens = T.screens && T.screens.length ? T.screens : [T.seed];
    return {
      title: titles[(round + j) % titles.length],
      scenes: [{ screen: screens[(round + j) % screens.length], text: `${mw[0].ex} ${mw[1].ex}\n${a}: ${say[(round + j) % say.length]}\n${b}: ${mw[2].ex}`,
        ko: mw[0].exKo ? `${mw[0].exKo} ${mw[1].exKo}\n${sayKo[(round + j) % say.length]}\n${mw[2].exKo}` : "" }],
      next: round < 5 ? { question: `What should ${a} do next?`, a: "Go and look", b: "Ask a friend for help" } : null,
      pick: needPick ? (j + round) % 2 : null,
    };
  };
  /* 단어 게임 문제: 뜻의 문 → 강세 달걀 → 듣고 고르기 → 철자 퍼즐 → 빈칸 */
  Engine.game = function (T) {
    const W = T.words, rnd = seeded(W.length * 7 + W[0].word.length + W[W.length - 1].word.length), qs = [];
    const pick3 = (w, f) => shuffle(W.filter((x) => x !== w), rnd).slice(0, 3).map(f);
    W.forEach((w, i) => qs.push({ id: "d" + i, kind: "door", w: i, prompt: w.word, options: shuffle([w.ko, ...pick3(w, (x) => x.ko)], rnd), answer: w.ko }));
    W.map((w, i) => ({ w, i, parts: String(w.syl || "").split("-") })).filter((x) => x.parts.length >= 2 && x.parts.some((p) => /[A-Z]/.test(p)) && x.parts.join("").toLowerCase() === x.w.word.toLowerCase())
      .sort((a, b) => (/[A-Z]/.test(a.parts[0]) ? 1 : 0) - (/[A-Z]/.test(b.parts[0]) ? 1 : 0) || a.i - b.i).slice(0, 4).sort((a, b) => a.i - b.i).forEach(({ w, i, parts }) => qs.push({ id: "e" + i, kind: "egg", w: i, prompt: w.word, options: parts.map((p) => p.toLowerCase()), answer: String(parts.findIndex((p) => /[A-Z]/.test(p))) }));
    shuffle(W.map((w, i) => i), rnd).slice(0, 2).forEach((i) => { const w = W[i]; qs.push({ id: "l" + i, kind: "listen", w: i, prompt: w.word, options: shuffle([w.word, ...pick3(w, (x) => x.word)], rnd), answer: w.word }); });
    W.map((w, i) => ({ w, i })).filter((x) => /^[a-z]{3,8}$/.test(x.w.word)).sort((a, b) => a.w.word.length - b.w.word.length).slice(0, 3)
      .forEach(({ w, i }) => { let tiles = shuffle(w.word.split(""), rnd); if (tiles.join("") === w.word) tiles = tiles.reverse(); qs.push({ id: "s" + i, kind: "spell", w: i, prompt: w.ko, emoji: w.emoji || "", options: tiles, answer: w.word }); });
    shuffle(W.map((w, i) => i), rnd).filter((i) => wordRe(W[i].word).test(W[i].ex)).slice(0, 3).forEach((i) => {
      const w = W[i];
      qs.push({ id: "b" + i, kind: "blank", w: i, prompt: w.ex.replace(wordRe(w.word), "_____"), hint: w.exKo || "", options: shuffle([w.word, ...pick3(w, (x) => x.word)], rnd), answer: w.word });
    });
    return qs;
  };
  /* 점수: 한 번에 맞히면 500점 + 빠르기 보너스(최대 300) + 연속 정답 보너스, 다시 시도해서 맞히면 100점 */
  Engine.points = (a, combo) => (a.ok ? 500 + Math.max(0, Math.round(300 * (1 - Math.min(a.ms || 0, 12000) / 12000))) + Math.min(combo, 10) * 50 : 100);
  Engine.score = function (answers) {
    let score = 0, combo = 0, best = 0, ok = 0;
    for (const a of answers.slice().sort((x, y) => (x.at || 0) - (y.at || 0))) {
      score += Engine.points(a, combo);
      if (a.ok) { ok++; combo++; best = Math.max(best, combo); } else combo = 0;
    }
    return { score, ok, n: answers.length, best };
  };
  /* 단어 낚시 규칙 (교사 화면과 디벗이 같이 씀). 이름과 그림은 이 앱에서 새로 만든 것 */
  Engine.FISH = {
    startBait: 3,
    ponds: [
      { name: "Sinseo Pond", ko: "신서중 연못", cost: 0, mult: 1, water: ["#7cc8f0", "#2f7fc0"], sky: ["#bfe6ff", "#e8f6ff"],
        fish: [["Little Minnow", "피라미", "🐟"], ["Puffy Puffer", "통통 복어", "🐡"], ["Rainbow Trout", "무지개 송어", "🐠"], ["Lotus Turtle", "연꽃 거북", "🐢"], ["Golden Carp", "황금 잉어", "👑"]] },
      { name: "Coral Sea", ko: "산호 바다", cost: 150, mult: 2.5, water: ["#3fd0c9", "#0b6f8f"], sky: ["#ffd9a8", "#fff1dc"],
        fish: [["Sea Bream", "도미", "🐟"], ["Spiky Puffer", "가시 복어", "🐡"], ["Clownfish", "흰동가리", "🐠"], ["Giant Octopus", "왕문어", "🐙"], ["Crystal Shark", "수정 상어", "🦈"]] },
      { name: "Blue Dragon Pond", ko: "중앙대 청룡연못", cost: 500, mult: 6, water: ["#3561b8", "#0d1f4f"], sky: ["#0f1a44", "#2a4596"],
        fish: [["Comet Fish", "혜성 물고기", "☄️"], ["Moon Squid", "달 오징어", "🦑"], ["Nebula Ray", "성운 가오리", "🌌"], ["Space Whale", "우주 고래", "🐋"], ["Blue Dragon", "청룡", "🐉"]] },
    ],
    rods: [
      { name: "Basic Rod", ko: "기본 낚싯대", cost: 0, odds: [62, 25, 10, 2.6, 0.4], wait: [1200, 2800], window: 1300 },
      { name: "Pro Rod", ko: "프로 낚싯대", cost: 80, odds: [45, 30, 17, 6.5, 1.5], wait: [900, 2000], window: 1500 },
      { name: "Magic Rod", ko: "마법 낚싯대", cost: 300, odds: [30, 32, 24, 11, 3], wait: [600, 1400], window: 1700 },
    ],
    tiers: [{ en: "Common", ko: "흔함", value: 5 }, { en: "Uncommon", ko: "보통", value: 12 }, { en: "Rare", ko: "희귀", value: 30 }, { en: "Epic", ko: "아주 희귀", value: 80 }, { en: "Legendary", ko: "전설", value: 300 }],
    /* 미끼: 한 번에 맞히면 2개, 다시 해서 맞히면 1개, 3연속 정답마다 1개 더 */
    bait: (first, combo) => (first ? 2 : 1) + (first && combo > 0 && combo % 3 === 0 ? 1 : 0),
  };
  Engine.ITEMS = ITEMS; Engine.wordRe = wordRe; Engine.freshState = freshState; Engine.clean = clean;
  if (typeof module !== "undefined") module.exports = Engine; else global.RSLEngine = Engine;
})(typeof window !== "undefined" ? window : globalThis);
