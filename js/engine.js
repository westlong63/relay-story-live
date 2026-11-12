/* Relay Story Live · 수업 진행 엔진 (교사 화면 브라우저 안에서 돌아감)
   1 오늘의 Topic → 2 단어 학습·퀴즈(모둠 보너스) → 3 릴레이 소설(턴제) → 4 영상 만들기 → 5 함께 보기
   릴레이 소설: 모둠마다 이야기 하나를 한 명씩 차례로 이어 씁니다. 쓰는 내용은 모둠 친구와 교사 화면에 바로 보여요.
   기본은 자유 이야기. 교사가 사건 카드 모드를 켜면, 사건 파일이 있는 주제는 사건 → 단서 → 용의자 → 범인 밝히기 순서로 써요 (js/clue.js, js/cases.js). */
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
  const Clue = () => global.RSL_CLUE || null;
  function freshState(topicId, room) {
    return {
      v: 1, room: room || "", phase: "topic", topicId, teamCount: 6, created: Date.now(),
      players: {}, teams: makeTeams(6), wordIndex: 0, quiz: "closed",
      /* rounds: 이번 쓰기의 차례 수, roundsSet: 교사가 고른 값 (0 = 모둠 인원만큼 자동), cards: 사건 카드 모드 (교사가 켰을 때만) */
      write: { started: false, rounds: 4, roundsSet: 0, roundSec: 180, done: false, cards: false },
      /* tw: 모둠별 진행 { round, endsAt, closingAt, subAt, done, given }, turn: 모둠별 지금 쓰는 학생, live: 모둠별 쓰는 중인 글 */
      roster: {}, stories: [], tw: {}, turn: {}, live: {}, picks: {}, filmsMade: false,
      watchIndex: -1, votes: {}, reactions: {}, guess: null, guessed: {}, sleuth: {},
    };
  }

  class Engine {
    constructor(content, saved, opts) {
      this.C = content;
      opts = opts || {};
      this.S = saved && saved.teams ? saved : freshState(content.topics[0].id, opts.room);
      const S = this.S; /* 예전 버전에서 저장한 수업도 열리게 빈 칸을 채워요 */
      for (const k of ["tw", "turn", "live", "picks", "guessed", "sleuth", "roster", "votes", "reactions"]) if (!S[k]) S[k] = {};
      if (S.write.roundsSet == null) S.write.roundsSet = 0;
      if (S.write.started && !Object.keys(S.tw).length) { S.write.done = true; for (const s of S.stories) S.tw[s.team] = { round: Math.max(0, S.write.rounds - 1), done: true }; }
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
    /* 사건 카드 모드: 교사가 켰고, 이 주제에 사건 파일이 있을 때만. 기본은 자유 이야기예요 */
    caseOf() { return Clue() && this.S.write.cards ? Clue().of(this.S.topicId) : null; }
    hits(text) {
      const out = [], low = text.toLowerCase();
      for (const w of this.banned()) if (ascii(w) ? wordRe(w.toLowerCase()).test(low) : text.includes(w)) out.push(["금지어", w]);
      const chars = new Set(Object.keys(this.topic().characters));
      /* 사건 속 인물 이름(Leo, Manager Han …)은 실명 검사에서 빼요 */
      let rest = text; for (const n of Clue() ? Clue().names(Clue().of(this.S.topicId)) : []) rest = rest.split(n).join(" ");
      for (const n of this.realNames) {
        if (!n || chars.has(n)) continue;
        if (ascii(n) ? new RegExp("\\b" + escRe(n) + "\\b", "i").test(rest) : rest.includes(n)) out.push(["실명", n]);
      }
      return out;
    }
    safety(text) { return this.hits(text).map(([k, w]) => `${k}: ${w}`); }
    /* 실시간으로 보여 줄 글은 금지어와 실명을 가려서 보내요 (제출할 때는 고쳐야 통과돼요) */
    mask(text) {
      let t = text;
      for (const [k, w] of this.hits(text)) t = ascii(w) ? t.replace(new RegExp("\\b" + escRe(w) + (k === "금지어" ? "\\w*" : "\\b"), "gi"), "***") : t.split(w).join("***");
      return t;
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
    /* ---------- 릴레이 소설 (턴제): 모둠마다 이야기 하나, 한 명씩 차례로 ---------- */
    missionWords(k) { const W = this.topic().words.map((w) => w.word); return [0, 1, 2].map((j) => W[(k * 3 + j) % W.length]); }
    teamStories(teamId) { return this.S.stories.filter((s) => s.team === teamId); }
    teamStory(teamId) { return this.S.stories.find((s) => s.team === teamId) || null; }
    /* 차례 수: 교사가 고르지 않으면 가장 큰 모둠 인원만큼 (모두 한 번씩 쓰게) */
    autoRounds() {
      const w = this.S.write, min = this.caseOf() ? 3 : 2;
      if (w.roundsSet) return Math.max(min, Math.min(6, w.roundsSet));
      const big = Math.max(0, ...this.S.teams.map((t) => this.members(t.id).length));
      return big ? Math.max(min, Math.min(6, big)) : 4;
    }
    rosterOf(teamId) { return (this.S.roster[teamId] || []).filter((pid) => this.S.players[pid] && this.S.players[pid].team === teamId); }
    /* 지금 내 차례일 때만 이야기를 쥐고 있어요 */
    heldStory(pid) {
      const p = this.S.players[pid]; if (!p) return null;
      const tw = this.S.tw[p.team];
      return tw && !tw.done && this.S.turn[p.team] === pid ? this.teamStory(p.team) : null;
    }
    /* 다음에 쓸 사람: 차례를 가장 적게 받은 사람부터, 같으면 들어온 순서대로 */
    pickWriter(teamId, not) {
      const given = (this.S.tw[teamId] || {}).given || {}, ro = this.rosterOf(teamId);
      let pool = ro.filter((pid) => pid !== not); if (!pool.length) pool = ro;
      return pool.slice().sort((a, b) => (given[a] || 0) - (given[b] || 0) || ro.indexOf(a) - ro.indexOf(b))[0] || null;
    }
    giveTurn(teamId, not) {
      const S = this.S, tw = S.tw[teamId], pid = this.pickWriter(teamId, not);
      delete S.live[teamId];
      if (pid) { S.turn[teamId] = pid; tw.given = tw.given || {}; tw.given[pid] = (tw.given[pid] || 0) + 1; } else delete S.turn[teamId];
      tw.endsAt = Date.now() + S.write.roundSec * 1000; tw.closingAt = null; tw.subAt = null;
    }
    openTeam(t) {
      const S = this.S, ms = this.members(t.id), cs = this.caseOf();
      if (!ms.length || S.tw[t.id]) return false;
      S.roster[t.id] = ms.map((p) => p.id);
      S.stories.push({ id: `t${t.id}s0`, team: t.id, starter: ms[0].id, starterName: t.name, episodes: [], twists: {}, env: cs ? Clue().makeEnv() : null });
      S.tw[t.id] = { round: 0, endsAt: null, closingAt: null, subAt: null, done: false, given: {} };
      this.giveTurn(t.id);
      return true;
    }
    startWriting() {
      const S = this.S;
      S.roster = {}; S.stories = []; S.tw = {}; S.turn = {}; S.live = {}; S.picks = {}; S.filmsMade = false; S.votes = {}; S.reactions = {}; S.watchIndex = -1; S.guess = null; S.guessed = {}; S.sleuth = {};
      S.write.rounds = this.autoRounds();
      S.write.started = true; S.write.done = false;
      for (const t of S.teams) this.openTeam(t);
    }
    roundStatus() {
      const out = { total: 0, done: 0, eps: 0, of: 0 };
      for (const [tid, tw] of Object.entries(this.S.tw)) {
        const s = this.teamStory(+tid); out.total++; if (tw.done) out.done++;
        out.eps += s ? s.episodes.length : 0; out.of += this.S.write.rounds;
      }
      return out;
    }
    advanceTeam(teamId) {
      const S = this.S, tw = S.tw[teamId];
      if (!tw || tw.done) return;
      if (tw.round + 1 >= S.write.rounds) { tw.done = true; tw.endsAt = null; tw.closingAt = null; tw.subAt = null; delete S.turn[teamId]; delete S.live[teamId]; }
      else { tw.round++; this.giveTurn(teamId, S.turn[teamId]); this.onEvent("round", { team: teamId, round: tw.round }); }
    }
    /* 1초마다 교사 화면이 부름. 모둠마다 자기 속도로: 제출하면 곧 다음 차례, 시간이 끝나면 쓰던 내용을 자동 저장한 뒤 다음 차례 */
    tick() {
      const S = this.S, w = S.write, now = Date.now();
      if (S.phase !== "write" || !w.started || w.done) return false;
      let ch = false;
      for (const [tid, tw] of Object.entries(S.tw)) {
        if (tw.done) continue;
        const cur = S.players[S.turn[tid]];
        if ((!cur || cur.team !== +tid) && this.pickWriter(+tid)) { this.giveTurn(+tid); ch = true; continue; } /* 쓰던 학생이 나가면 다음 사람에게 */
        if (tw.closingAt && now - tw.closingAt > 4000) { this.advanceTeam(+tid); ch = true; }
        else if (!tw.closingAt && tw.endsAt && now >= tw.endsAt) { tw.closingAt = now; ch = true; }
        else if (!tw.closingAt && tw.subAt && now - tw.subAt >= 2500) { this.advanceTeam(+tid); ch = true; }
      }
      const all = Object.values(S.tw);
      if (all.length && all.every((t) => t.done)) { w.done = true; this.onEvent("writeDone"); ch = true; }
      if (ch) this.bump();
      return ch;
    }
    twistFor(story, k) {
      if (!story.twists[k]) { const L = this.C.twists; story.twists[k] = L[Math.floor(Math.random() * L.length)]; }
      return story.twists[k];
    }
    /* ---------- 영상 ---------- */
    representative(teamId) {
      const list = this.teamStories(teamId).filter((s) => s.episodes.length);
      return list.find((s) => s.id === this.S.picks[teamId]) || list[0] || null;
    }
    screenList() { return this.activeTeams().map((t) => ({ team: t, story: this.representative(t.id) })).filter((x) => x.story); }
    /* 장면 글 → 대사 줄 [말하는 사람, 영어, 우리말 자막]. 우리말은 영어 한 줄에 한 줄씩 짝지어요 */
    parseScene(text, chars, ko) {
      const lines = [], raws = String(text).split(/\n+/).map((x) => x.trim()).filter(Boolean);
      raws.forEach((line, r) => {
        const m = line.match(/^((?:(?:Mr|Mrs|Ms|Dr)\.\s)?[A-Z][A-Za-z' -]{0,18}?)\s*:\s*(.+)$/); /* Mr. Choi: … 처럼 호칭이 붙은 이름도 대사로 */
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
      const T = this.topic(), team = this.S.teams[story.team], cs = story.env && Clue() ? Clue().of(this.S.topicId) : null;
      const chars = JSON.parse(JSON.stringify(T.characters));
      if (cs) for (const i of story.env.sus) chars[cs.suspects[i].name] = Object.assign({ color: null }, Clue().look(cs.suspects[i]));
      const q = this.teamQuiz(story.team), rounds = this.S.write.rounds;
      const eps = story.episodes.slice().sort((a, b) => a.k - b.k);
      const film = {
        id: story.id, topic: T.title, topicKo: T.ko || "", seed: T.seed, team: team.name, teamColor: team.color, starter: story.starterName,
        title: cs ? cs.title : (eps[0] && eps[0].title) || `${team.name}'s Story`, bonus: q.items, characters: chars,
        writers: [...new Set(eps.map((e) => e.writer))],
        episodes: eps.map((ep, i) => {
          const next = eps[i + 1], role = cs ? Clue().role(ep.k, rounds) : null;
          const out = { title: ep.title || (role ? Clue().ROLE[role].en : `Episode ${i + 1}`), writer: ep.writer, mission: ep.mission, used: ep.used, twist: ep.twist,
            scenes: ep.scenes.map((sc, j) => ({ id: `${story.id}e${i + 1}s${j + 1}`, screen: sc.screen, lines: this.parseScene(sc.text, chars, sc.ko) })).filter((sc) => sc.lines.length) };
          if (role) out.role = role;
          if (ep.next && ep.next.question && ep.next.a && ep.next.b && next) out.choice = { question: ep.next.question, options: [ep.next.a, ep.next.b], picked: next.pick === 1 ? 1 : 0 };
          return out;
        }).filter((e) => e.scenes.length),
      };
      if (cs) film.clue = Clue().film(cs, story.env);
      return film;
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
        case "topic": if (this.C.topics.some((t) => t.id === b.topic) && b.topic !== S.topicId) {
          S.topicId = b.topic; S.wordIndex = 0; S.quiz = "closed"; S.quizEndsAt = null; S.catchFeed = [];
          for (const p of Object.values(S.players)) { p.answers = {}; p.fish = {}; }
          /* 주제가 바뀌면 쓰던 이야기도 새로 시작해요 */
          S.write.started = false; S.write.done = false; S.stories = []; S.roster = {}; S.tw = {}; S.turn = {}; S.live = {}; S.filmsMade = false; S.guess = null;
        } break;
        case "teams": {
          const n = Math.max(2, Math.min(8, parseInt(b.n, 10) || 6));
          S.teamCount = n; S.teams = makeTeams(n);
          for (const p of Object.values(S.players)) if (p.team >= n) p.team = p.team % n;
          break;
        }
        case "rounds": { const n = parseInt(b.n, 10) || 0; S.write.roundsSet = n ? Math.max(2, Math.min(6, n)) : 0; break; } /* 0 = 자동 */
        case "cards": if (S.write.started) return false; S.write.cards = !!b.on; break; /* 쓰기를 시작하기 전에만 바꿀 수 있어요 */
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
        case "addTime": for (const tw of Object.values(S.tw)) if (!tw.done && tw.endsAt) { tw.endsAt += (b.sec || 60) * 1000; tw.closingAt = null; } break;
        /* 모든 모둠(또는 한 모둠)을 다음 차례로: 쓰던 내용은 자동 저장돼요 */
        case "nextRound": for (const [tid, tw] of Object.entries(S.tw)) if (!tw.done && !tw.closingAt && (b.team == null || +tid === +b.team)) tw.closingAt = Date.now(); break;
        /* 자리에 없는 학생 대신 같은 화를 다른 친구가 쓰게 */
        case "passTurn": { const tw = S.tw[b.team]; if (!tw || tw.done) return false; this.giveTurn(+b.team, S.turn[b.team]); break; }
        case "restartWriting": this.startWriting(); break;
        case "kick": if (b.pid && S.players[b.pid]) delete S.players[b.pid]; break;
        case "moveTeam": {
          const p = S.players[b.pid]; if (!p || !(b.team >= 0 && b.team < S.teams.length)) return false;
          p.team = +b.team;
          if (S.write.started && S.tw[p.team] && !S.tw[p.team].done && !(S.roster[p.team] || []).includes(p.id)) (S.roster[p.team] = S.roster[p.team] || []).push(p.id);
          break;
        }
        case "makeFilms": S.filmsMade = true; break;
        case "pick": S.picks[b.team] = b.story; break;
        case "watch": {
          const n = this.screenList().length, was = S.watchIndex;
          S.watchIndex = Math.max(0, Math.min(n, b.index != null ? b.index : S.watchIndex + (b.d || 0)));
          if (S.watchIndex !== was) S.guess = null;
          break;
        }
        /* "범인은 누구?" 반 전체 투표: open 받는 중 → closed 마감 → reveal 정답 공개 */
        case "guess": {
          const cur = this.screenList()[S.watchIndex], st = b.state;
          if (!cur || !cur.story.env) return false;
          const same = S.guess && S.guess.story === cur.story.id;
          if (st === "open") { if (!same) S.guess = { story: cur.story.id, state: "open", picks: {} }; else if (S.guess.state === "closed") S.guess.state = "open"; }
          else if (!same) return false;
          else if (st === "closed") { if (S.guess.state === "open") S.guess.state = "closed"; }
          else if (st === "reveal") {
            S.guess.state = "reveal";
            if (!S.guessed[cur.story.id]) { S.guessed[cur.story.id] = true; for (const [pid, pick] of Object.entries(S.guess.picks)) if (pick === cur.story.env.c) S.sleuth[pid] = (S.sleuth[pid] || 0) + 1; }
          } else return false;
          break;
        }
        case "reset": {
          const w = S.write;
          this.S = freshState(S.topicId, S.room); this.S.teamCount = S.teamCount; this.S.teams = makeTeams(S.teamCount);
          Object.assign(this.S.write, { roundsSet: w.roundsSet || 0, roundSec: w.roundSec, cards: !!w.cards });
          break;
        }
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
        else {
          S.players[pid] = { id: pid, name, team, joined: Date.now(), answers: {} };
          /* 쓰기가 시작된 뒤에 들어온 학생도 차례를 받아요 */
          if (S.write.started && !S.write.done) {
            if (S.tw[team]) { if (!S.tw[team].done) (S.roster[team] = S.roster[team] || []).push(pid); }
            else if (S.phase === "write") this.openTeam(S.teams[team]);
          }
        }
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
      /* 쓰는 중인 글: 모둠 친구와 교사 화면에 바로 보여 줘요 (지금 차례인 학생만 보낼 수 있어요) */
      if (type === "live") {
        const tw = S.tw[pl.team];
        if (S.phase !== "write" || !tw || tw.done || S.turn[pl.team] !== pid || b.round !== tw.round) return { ok: false };
        const cur = S.live[pl.team];
        if (cur && cur.done && cur.r === tw.round) return { ok: true };
        S.live[pl.team] = { r: tw.round, title: this.mask(clean(b.title, 50)), at: Date.now(),
          scenes: (b.scenes || []).slice(0, 3).map((s) => ({ screen: this.mask(clean(s.screen, 160)), text: this.mask(clean(s.text, 600)), ko: this.mask(clean(s.ko, 400)) })) };
        this.bump();
        return { ok: true, slow: true };
      }
      if (type === "submit") {
        const w = S.write, tw = S.tw[pl.team];
        if (S.phase !== "write" || !w.started || !tw || tw.done) return { ok: false, msg: "지금은 쓰는 시간이 아니에요" };
        const round = b.round != null ? b.round : tw.round;
        if (round !== tw.round) return { ok: false, msg: "차례가 이미 넘어갔어요" };
        const story = this.heldStory(pid);
        if (!story) return { ok: false, msg: "지금은 다른 친구가 쓰는 차례예요" };
        const team = pl.team, max = this.teamQuiz(team).items.includes("bonus_scene") ? 3 : 2;
        const scenes = (b.scenes || []).slice(0, max).map((s) => ({ screen: clean(s.screen, 160), text: clean(s.text, 600), ko: clean(s.ko, 400) })).filter((s) => s.text);
        if (!scenes.length) return { ok: false, msg: "장면 1의 이야기를 써 주세요" };
        const title = clean(b.title, 50);
        /* 마지막 화에는 갈림길을 남기지 않아요 */
        const next = round + 1 < w.rounds && b.next && b.next.question && b.next.a && b.next.b ? { question: clean(b.next.question, 80), a: clean(b.next.a, 40), b: clean(b.next.b, 40) } : null;
        const all = [title, ...scenes.map((s) => s.screen + "\n" + s.text + "\n" + s.ko), next ? `${next.question} ${next.a} ${next.b}` : ""].join("\n");
        const issues = this.safety(all);
        if (issues.length) return { ok: false, msg: "모두 함께 볼 영상이에요. 이 부분을 바꿔 주세요: " + issues.join(", "), issues };
        const mission = this.missionWords(round), text = scenes.map((s) => s.text).join(" ");
        const ep = { k: round, writer: pl.name, pid, title, scenes, next, pick: b.pick === 1 ? 1 : b.pick === 0 ? 0 : null,
          mission, used: mission.filter((m) => wordRe(m).test(text)), twist: story.twists[round] || null, at: Date.now(), auto: !!b.auto };
        story.episodes = story.episodes.filter((e) => e.k !== round).concat([ep]).sort((a, c) => a.k - c.k);
        if (!tw.subAt) tw.subAt = Date.now(); /* 제출하면 곧 다음 친구 차례로 넘어가요 */
        S.live[team] = { r: round, title, scenes, at: Date.now(), done: true };
        this.bump();
        return { ok: true };
      }
      /* "범인은 누구?" 투표: 다른 모둠 영상일 때만 */
      if (type === "guess") {
        const g = S.guess, s = g && S.stories.find((x) => x.id === g.story), pick = parseInt(b.pick, 10);
        if (S.phase !== "watch" || !g || g.state !== "open" || !s || !s.env) return { ok: false, msg: "지금은 투표 시간이 아니에요" };
        if (s.team === pl.team) return { ok: false, msg: "우리 모둠 영상이에요. 범인은 비밀!" };
        if (!s.env.sus.includes(pick)) return { ok: false };
        g.picks[pid] = pick; this.bump();
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
    /* 학생 화면에는 주제 번호만 보내요 (단어·예문·사건 카드는 디벗이 이미 갖고 있음). 선생님이 직접 만든 주제만 통째로 보내요.
       쓰기 진행(몇 화, 남은 시간)은 모둠마다 달라서 그 학생 모둠의 것을 넣어요 */
    common(full, teamId) {
      const S = this.S, w = S.write, T = this.topic(), tw = teamId != null ? S.tw[teamId] : null;
      const wr = { started: w.started, round: 0, rounds: w.started ? w.rounds : this.autoRounds(), roundSec: w.roundSec, done: w.done, closing: false, endsAt: null };
      if (tw) { wr.round = Math.min(tw.round, wr.rounds - 1); wr.done = !!tw.done; wr.closing = !!tw.closingAt; wr.endsAt = tw.done ? null : tw.endsAt || null; }
      return { room: S.room, phase: S.phase, topic: full || T.custom ? this.publicTopic() : { id: T.id, title: T.title }, wordIndex: S.wordIndex, quiz: S.quiz,
        write: wr, clue: !!this.caseOf(), filmsMade: S.filmsMade, quizEnd: S.quiz === "open" ? S.quizEndsAt || null : null, quizGame: S.quizGame || "fish" };
    }
    storyBrief(s, withText) {
      const cs = s.env && Clue() ? Clue().of(this.S.topicId) : null;
      const o = { id: s.id, team: s.team, starter: s.starterName, n: s.episodes.length, title: cs ? cs.title : (s.episodes[0] && s.episodes[0].title) || "",
        writers: s.episodes.map((e) => e.writer), used: s.episodes.reduce((n, e) => n + e.used.length, 0), total: s.episodes.reduce((n, e) => n + e.mission.length, 0) };
      if (withText) o.episodes = s.episodes.map((e) => ({ k: e.k, writer: e.writer, title: e.title, scenes: e.scenes, next: e.next, pick: e.pick, mission: e.mission, used: e.used }));
      return o;
    }
    /* "범인은 누구?" 투표 상황. 학생에게는 정답을 공개한 뒤에만 정답과 표 수를 보내요 */
    guessView(pid) {
      const S = this.S, g = S.guess, s = g && S.stories.find((x) => x.id === g.story);
      if (!g || !s || !s.env) return null;
      const o = { story: g.story, team: s.team, state: g.state, opts: s.env.sus, n: Object.keys(g.picks).length, of: Object.values(S.players).filter((x) => x.team !== s.team).length };
      if (pid) { const p = S.players[pid]; o.own = !!p && p.team === s.team; o.mine = g.picks[pid] != null ? g.picks[pid] : null; }
      if (!pid || g.state === "reveal") { o.answer = s.env.c; o.tally = s.env.sus.map((i) => Object.values(g.picks).filter((v) => v === i).length); o.right = Object.values(g.picks).filter((v) => v === s.env.c).length; }
      return o;
    }
    hostView() {
      const S = this.S, rounds = S.write.rounds;
      return Object.assign(this.common(true), {
        role: "host", items: ITEMS, topics: this.C.topics.map((t) => ({ id: t.id, title: t.title, ko: t.ko || "", genre: t.genre || "", months: t.months || [], custom: !!t.custom, hasCase: !!(Clue() && Clue().of(t.id)) })), teamCount: S.teamCount, questions: this.questions().length,
        hasCase: !!(Clue() && Clue().of(S.topicId)), cards: !!S.write.cards, roundsSet: S.write.roundsSet || 0,
        missed: S.phase === "words" ? this.missed() : [], feed: S.catchFeed || [],
        players: Object.values(S.players).map((p) => ({ id: p.id, name: p.name, team: p.team })),
        roundStatus: this.roundStatus(), report: this.classReport(),
        teams: S.teams.map((t) => {
          const q = this.teamQuiz(t.id), ro = this.rosterOf(t.id), tw = S.tw[t.id] || null, s = this.teamStory(t.id), mem = this.members(t.id);
          const stories = this.teamStories(t.id), cur = tw && !tw.done ? S.turn[t.id] : null, r = tw ? tw.round : 0, lv = S.live[t.id];
          return { id: t.id, name: t.name, color: t.color, members: mem.map((p) => p.name), quiz: { acc: Math.round(q.acc * 100), answered: q.answered, items: q.items, avg: q.avg, players: q.players }, fish: this.teamFish(t.id),
            writers: ro.map((pid) => ({ name: S.players[pid].name, now: pid === cur, n: s ? s.episodes.filter((e) => e.pid === pid).length : 0 })),
            turn: tw ? { round: r, done: !!tw.done, endsAt: tw.endsAt || null, closing: !!tw.closingAt, writer: cur && S.players[cur] ? S.players[cur].name : null,
              role: s && s.env && !tw.done && Clue() ? Clue().role(r, rounds) : null, submitted: !!(s && s.episodes.some((e) => e.k === r)), live: !tw.done && lv && lv.r === r ? lv : null } : null,
            stories: stories.map((x) => this.storyBrief(x, true)), rep: (this.representative(t.id) || {}).id || null,
            votes: Object.values(S.votes).filter((v) => v === t.id).length, reactions: S.reactions[t.id] || {},
            missionUsed: stories.reduce((n, x) => n + x.episodes.reduce((m, e) => m + e.used.length, 0), 0),
            missionTotal: stories.reduce((n, x) => n + x.episodes.reduce((m, e) => m + e.mission.length, 0), 0),
            sleuth: mem.reduce((n, p) => n + (S.sleuth[p.id] || 0), 0) };
        }),
        screen: this.screenList().map((x) => ({ team: x.team.id, story: x.story.id })), watchIndex: S.watchIndex, guess: this.guessView(null),
        sleuths: Object.entries(S.sleuth).filter(([pid]) => S.players[pid]).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([pid, n]) => ({ name: S.players[pid].name, n })),
      });
    }
    playerView(pid) {
      const S = this.S, p = pid && S.players[pid], base = this.common(false, p ? p.team : null);
      const teamsLite = S.teams.map((t) => ({ id: t.id, name: t.name, color: t.color, count: this.members(t.id).length }));
      if (!p) return Object.assign(base, { role: "player", me: null, teams: teamsLite });
      const t = S.teams[p.team], q = this.teamQuiz(p.team);
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
        const tw = S.tw[p.team], s = this.teamStory(p.team), ro = this.rosterOf(p.team);
        out.inRoster = ro.includes(pid);
        if (tw && s && !tw.done) {
          const r = tw.round, cur = S.turn[p.team], prev = this.storyBrief(s, true).episodes.filter((e) => e.k < r), last = prev[prev.length - 1];
          const cs = s.env ? this.caseOf() : null, part = cs ? Clue().part(s.env, r, S.write.rounds) : null, mine = s.episodes.some((e) => e.k === r), lv = S.live[p.team];
          /* 차례표: now 지금 쓰는 중, done 이미 차례를 받음, wait 기다리는 중 */
          const nx = r + 1 < S.write.rounds ? this.pickWriter(p.team, cur) : null;
          out.turn = { writer: cur && S.players[cur] ? S.players[cur].name : null, me: cur === pid, next: nx && S.players[nx] ? S.players[nx].name : null,
            order: ro.map((id) => ({ name: S.players[id].name, st: id === cur ? "now" : (tw.given || {})[id] ? "done" : "wait" })) };
          if (cur === pid) out.held = { id: s.id, starter: s.starterName, mineStarted: r === 0, episodes: prev, choice: !cs && last && last.next ? last.next : null, submitted: mine,
            mission: this.missionWords(r), twist: cs ? null : this.twistFor(s, r), clue: part };
          else out.watch = { id: s.id, episodes: prev, mission: this.missionWords(r), clue: part ? Clue().hide(part) : null, submitted: mine,
            live: lv && lv.r === r ? { title: lv.title, scenes: lv.scenes, done: !!lv.done } : null };
        }
      }
      if (S.phase === "video" || (S.phase === "write" && S.write.started && base.write.done)) {
        out.teamStories = this.teamStories(p.team).filter((s) => s.episodes.length).map((s) => this.storyBrief(s, true));
      }
      if (S.phase === "watch") {
        const list = this.screenList(), cur = list[S.watchIndex];
        out.watching = cur ? { id: cur.team.id, name: cur.team.name, color: cur.team.color, title: this.buildFilm(cur.story).title } : null;
        out.screenTeams = list.map((x) => ({ id: x.team.id, name: x.team.name, color: x.team.color }));
        out.voted = S.votes[pid] != null ? S.votes[pid] : null;
        out.guess = this.guessView(pid); out.sleuth = S.sleuth[pid] || 0;
        const mine = this.representative(p.team);
        out.myStory = mine ? mine.id : null;
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
