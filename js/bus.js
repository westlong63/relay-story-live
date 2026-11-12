/* Relay Story Live · 연결 모듈
   - 시연 모드(local): 컴퓨터 한 대 안에서 교사 화면과 학생 화면을 잇습니다. 인터넷·설정 필요 없음.
   - 수업 모드(firebase): Firebase 무료 실시간 DB로 디벗과 전자칠판을 즉시 잇습니다. js/config.js에 설정을 넣으면 켜집니다.
   교사 화면이 진행을 맡고(엔진), 학생 화면은 행동만 보내고 자기 화면 정보만 받습니다. */
(function (global) {
  "use strict";
  const CFG = global.RSL_CONFIG || {};
  const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const rid = (n) => Array.from({ length: n }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join("");
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} },
  };
  const params = new URLSearchParams(location.search);
  const isDemo = () => params.has("demo") || !CFG.firebase;

  /* ================= 시연 모드: BroadcastChannel ================= */
  class LocalHost {
    constructor(room, onAction) {
      this.room = room; this.onAction = onAction; this.last = { pub: null, views: {} }; this.offset = 0;
      this.ch = new BroadcastChannel("rsl-" + room);
      this.ch.onmessage = (e) => {
        const m = e.data || {};
        if (m.k === "act") { const res = this.onAction(m.pid, m.type, m.body || {}); this.ch.postMessage({ k: "res", to: m.pid, id: m.id, res }); }
        if (m.k === "hello") this.flush();
      };
    }
    publish(pub, views) { this.last = { pub, views }; this.flush(); }
    flush() { this.ch.postMessage({ k: "views", pub: this.last.pub, views: this.last.views }); }
    saveState(S) { store.set("rsl-local-state-" + this.room, JSON.stringify(S)); }
    loadState() { try { return JSON.parse(store.get("rsl-local-state-" + this.room) || "null"); } catch (e) { return null; } }
    publishFilms(films) { store.set("rsl-local-films-" + this.room, JSON.stringify(films)); }
    async destroy() { ["state", "films"].forEach((k) => store.del(`rsl-local-${k}-${this.room}`)); }
  }
  class LocalPlayer {
    constructor(room, as) {
      this.room = room; this.cb = () => {}; this.pending = {}; this.seq = 0; this.got = false; this.offset = 0;
      const key = `rsl-pid-${room}-${as || ""}`;
      this.pid = store.get(key) || "p" + rid(10); store.set(key, this.pid);
      this.ch = new BroadcastChannel("rsl-" + room);
      this.ch.onmessage = (e) => {
        const m = e.data || {};
        if (m.k === "views" && (m.pub || m.views[this.pid])) { this.got = true; this.cb(m.views[this.pid] || m.pub); }
        if (m.k === "res" && m.to === this.pid && this.pending[m.id]) { this.pending[m.id](m.res); delete this.pending[m.id]; }
      };
      const hello = () => { if (!this.got) { this.ch.postMessage({ k: "hello" }); setTimeout(hello, 2000); } };
      hello();
    }
    onView(cb) { this.cb = cb; }
    send(type, body) {
      const id = ++this.seq;
      return new Promise((res) => {
        this.pending[id] = res;
        this.ch.postMessage({ k: "act", id, pid: this.pid, type, body });
        setTimeout(() => { if (this.pending[id]) { delete this.pending[id]; res({ ok: false, msg: "교사 화면과 연결이 안 돼요. 교사 화면이 열려 있는지 확인해 주세요." }); } }, 6000);
      });
    }
  }

  /* ================= 수업 모드: Firebase Realtime Database ================= */
  let fbReady = null;
  function fbInit() {
    if (fbReady) return fbReady;
    fbReady = (async () => {
      if (!global.firebase) throw new Error("Firebase 스크립트를 불러오지 못했어요.");
      if (!firebase.apps.length) {
        firebase.initializeApp(CFG.firebase);
        if (CFG.emulator) { firebase.auth().useEmulator(CFG.emulator.auth); const [h, p] = CFG.emulator.db.split(":"); firebase.database().useEmulator(h, +p); }
      }
      const cred = await firebase.auth().signInAnonymously();
      return { uid: cred.user.uid, db: firebase.database() };
    })().catch((e) => { fbReady = null; throw e; });
    return fbReady;
  }
  function explain(e) {
    const m = String((e && (e.code || e.message)) || e);
    if (/admin-restricted|operation-not-allowed/.test(m)) return "Firebase에서 '익명 로그인'이 꺼져 있어요. 안내서 2단계를 확인해 주세요.";
    if (/permission/i.test(m)) return "Firebase 보안 규칙이 아직 안 들어갔어요. 안내서 3단계를 확인해 주세요.";
    if (/network|offline|failed to fetch/i.test(m)) return "인터넷 연결을 확인해 주세요.";
    return "연결 오류: " + m;
  }
  class FbHost {
    static async open(room, onAction) {
      const { uid, db } = await fbInit();
      if (room) {
        const meta = (await db.ref(`rooms/${room}/meta`).get()).val();
        if (meta && meta.host === uid) return new FbHost(db, uid, room, onAction);
      }
      for (let i = 0; i < 8; i++) {
        const code = rid(5), ref = db.ref(`rooms/${code}/meta`);
        const r = await ref.transaction((cur) => (cur ? undefined : { host: uid, created: Date.now() }));
        if (r.committed) return new FbHost(db, uid, code, onAction);
      }
      throw new Error("수업 코드를 만들지 못했어요. 다시 시도해 주세요.");
    }
    constructor(db, uid, room, onAction) {
      this.db = db; this.uid = uid; this.room = room; this.onAction = onAction; this.sent = {}; this.queue = null; this.timer = null; this.offset = 0;
      this.ref = db.ref("rooms/" + room);
      db.ref(".info/serverTimeOffset").on("value", (s) => { this.offset = s.val() || 0; });
      this.ref.child("inbox").on("child_added", (snap) => {
        const m = snap.val() || {};
        let body = {}; try { body = JSON.parse(m.body || "{}"); } catch (e) {}
        const res = this.onAction(m.pid, m.type, body);
        this.ref.child(`replies/${m.pid}/${snap.key}`).set(JSON.stringify(res || { ok: false }));
        snap.ref.remove();
      });
    }
    /* 교사 화면이 이미 바뀐 것들을 모아서 부르므로 기다리지 않고 바로 보냅니다 */
    publish(pub, views) { this.queue = { pub, views }; if (!this.timer) { this.timer = true; Promise.resolve().then(() => this.flush()); } }
    flush() {
      this.timer = null; if (!this.queue) return;
      const { pub, views } = this.queue, up = {}; this.queue = null;
      const pj = JSON.stringify(pub); if (pj !== this.sent.pub) { up.pub = pj; this.sent.pub = pj; }
      for (const [pid, v] of Object.entries(views)) { const j = JSON.stringify(v); if (j !== this.sent[pid]) { up["views/" + pid] = j; this.sent[pid] = j; } }
      for (const pid of Object.keys(this.sent)) if (pid !== "pub" && !(pid in views)) { up["views/" + pid] = null; delete this.sent[pid]; }
      if (Object.keys(up).length) this.ref.update(up).catch((e) => console.warn(explain(e)));
    }
    /* 진행 상황 백업: 바뀔 때마다가 아니라 3초에 한 번만 (단계가 바뀌면 바로) */
    saveState(S, now) {
      this.stS = S;
      if (now) { clearTimeout(this.st); this.st = null; return this.writeState(); }
      if (!this.st) this.st = setTimeout(() => { this.st = null; this.writeState(); }, 3000);
    }
    writeState() { const j = JSON.stringify(this.stS); if (j === this.stLast) return; this.stLast = j; this.ref.child("state").set(j).catch(() => {}); }
    async loadState() { try { return JSON.parse((await this.ref.child("state").get()).val() || "null"); } catch (e) { return null; } }
    publishFilms(films) { return this.ref.child("films").set(JSON.stringify(films)).catch(() => {}); }
    async destroy() { this.ref.child("inbox").off(); for (const k of ["inbox", "replies", "views", "pub", "films", "state"]) await this.ref.child(k).remove().catch(() => {}); await this.ref.child("meta").remove().catch(() => {}); }
  }
  class FbPlayer {
    static async join(room) {
      const { uid, db } = await fbInit();
      const meta = (await db.ref(`rooms/${room}/meta`).get()).val();
      if (!meta) throw new Error("NO_ROOM");
      return new FbPlayer(db, uid, room);
    }
    constructor(db, uid, room) {
      this.pid = uid; this.room = room; this.cb = () => {}; this.pending = {}; this.pub = null; this.view = null; this.offset = 0;
      this.ref = db.ref("rooms/" + room);
      db.ref(".info/serverTimeOffset").on("value", (s) => { this.offset = s.val() || 0; });
      const emit = () => { const j = this.view || this.pub; if (j) try { this.cb(JSON.parse(j)); } catch (e) {} };
      /* 입장 전에는 공개 화면(pub)을, 입장 뒤에는 내 화면(views/내 id)만 받습니다 → 데이터 사용량이 반 인원에 비례해서만 늘어요 */
      const pubRef = this.ref.child("pub"), onPub = (s) => { this.pub = s.val(); if (!this.view) emit(); };
      let pubOn = false;
      const watchPub = (on) => { if (on === pubOn) return; pubOn = on; if (on) pubRef.on("value", onPub); else pubRef.off("value", onPub); };
      watchPub(true);
      this.ref.child("views/" + uid).on("value", (s) => { this.view = s.val(); watchPub(!this.view); emit(); });
      this.ref.child("replies/" + uid).on("child_added", (s) => {
        const f = this.pending[s.key]; let res = { ok: false }; try { res = JSON.parse(s.val()); } catch (e) {}
        if (f) { f(res); delete this.pending[s.key]; }
        s.ref.remove().catch(() => {});
      });
    }
    onView(cb) { this.cb = cb; }
    send(type, body) {
      const ref = this.ref.child("inbox").push();
      return new Promise((res) => {
        this.pending[ref.key] = res;
        const msg = { pid: this.pid, type, body: JSON.stringify(body || {}), t: Date.now() };
        ref.set(msg).catch(async (e) => {
          /* 저장이 막히면 원인을 확인하고, 로그인 토큰을 새로 받아 한 번 더 시도해요 */
          let why = explain(e);
          if (/permission/i.test(String((e && (e.code || e.message)) || e))) {
            try {
              const u = firebase.auth().currentUser;
              if (u) await u.getIdToken(true);
              const meta = (await this.ref.child("meta").get()).val();
              if (!meta) why = "이 수업은 끝났거나 코드가 바뀌었어요. 선생님 화면의 QR을 다시 찍어 주세요.";
              else if (!u || u.uid !== this.pid) why = "연결이 새로 바뀌었어요. 화면을 새로고침한 뒤 다시 입장해 주세요.";
              else { await ref.set(msg); return; }
            } catch (e2) { why += ` (확인용: ${String((e2 && (e2.code || e2.message)) || e2).slice(0, 60)})`; }
          }
          if (this.pending[ref.key]) { delete this.pending[ref.key]; res({ ok: false, msg: why }); }
        });
        setTimeout(() => { if (this.pending[ref.key]) { delete this.pending[ref.key]; res({ ok: false, msg: "교사 화면이 응답하지 않아요. 잠시 뒤 다시 눌러 주세요." }); } }, 9000);
      });
    }
  }
  async function readFilms(room) {
    if (isDemo()) { try { return JSON.parse(store.get("rsl-local-films-" + room) || "null"); } catch (e) { return null; } }
    const { db } = await fbInit();
    const v = (await db.ref(`rooms/${room}/films`).get()).val();
    return v ? JSON.parse(v) : null;
  }

  global.RSLBus = {
    isDemo, explain, newCode: () => rid(5), store, params,
    async host(room, onAction) {
      if (isDemo()) { const r = room || "D" + rid(4); return new LocalHost(r, onAction); }
      return FbHost.open(room, onAction);
    },
    async player(room, as) { if (isDemo()) return new LocalPlayer(room, as); return FbPlayer.join(room); },
    readFilms,
  };
})(window);
