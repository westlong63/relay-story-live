/* Relay Story Live · 영어 문장 도우미 (디벗 안에서만 돌아가요, 인터넷으로 글을 보내지 않음)
   중학생이 자주 하는 실수만 골라 알려 주고, 한 번 누르면 고칠 수 있어요. 제출을 막지는 않아요.
   check(text) → [{ s, e, msg, fix }]  (s~e 구간을 fix로 바꾸면 고쳐져요. fix가 null이면 안내만) */
(function (global) {
  "use strict";
  const MODAL = "can|could|will|would|should|must|may|might|did|didn't|didnt|don't|dont|doesn't|doesnt|won't|wont|can't|cant|couldn't|wouldn't|shouldn't|let's";
  const IRR = { went: "go", saw: "see", ate: "eat", came: "come", took: "take", made: "make", found: "find", ran: "run", said: "say", got: "get", gave: "give",
    knew: "know", thought: "think", felt: "feel", told: "tell", left: "leave", bought: "buy", wrote: "write", began: "begin", flew: "fly", fell: "fall",
    stood: "stand", sat: "sit", heard: "hear", met: "meet", brought: "bring", kept: "keep", slept: "sleep", swam: "swim", drank: "drink", sang: "sing",
    won: "win", lost: "lose", hid: "hide", dug: "dig", froze: "freeze", stole: "steal", chose: "choose", drove: "drive", threw: "throw", caught: "catch",
    taught: "teach", woke: "wake", broke: "break", spoke: "speak", rode: "ride", forgot: "forget", became: "become", understood: "understand", shook: "shake" };
  const OVER = { goed: "went", eated: "ate", runned: "ran", comed: "came", taked: "took", maked: "made", finded: "found", sayed: "said", getted: "got",
    gived: "gave", knowed: "knew", thinked: "thought", feeled: "felt", telled: "told", buyed: "bought", writed: "wrote", falled: "fell", standed: "stood",
    sitted: "sat", catched: "caught", teached: "taught", bringed: "brought", sleeped: "slept", swimmed: "swam", drinked: "drank", hided: "hid",
    digged: "dug", freezed: "froze", stealed: "stole", choosed: "chose", drived: "drove", throwed: "threw", winned: "won", losed: "lost", meeted: "met",
    keeped: "kept", leaved: "left", sended: "sent", spended: "spent", builded: "built", hurted: "hurt", putted: "put", cutted: "cut", hitted: "hit",
    readed: "read", flyed: "flew", cryed: "cried", tryed: "tried", studyed: "studied", stoped: "stopped", droped: "dropped", planed: "planned", shaked: "shook",
    breaked: "broke", speaked: "spoke", wakeed: "woke", waked: "woke", forgeted: "forgot", becomed: "became", understanded: "understood" };
  const BASE = ("go want like have do say know see look need live love make run eat play come think feel try watch cry fly get give take find tell " +
    "walk talk work read write sing swim sleep open close help start stop wait call ask answer jump climb hide win lose bring keep leave meet hear " +
    "smile laugh dance cook wear carry move push pull build learn teach study remember forget believe hope wish visit travel follow catch throw " +
    "use enjoy finish begin change break fix hold hate miss need seem sound mean").split(" ");
  const THIRD = (v) => (v === "have" ? "has" : v === "do" ? "does" : v === "go" ? "goes" : /(s|x|z|ch|sh)$/.test(v) ? v + "es" : /[^aeiou]y$/.test(v) ? v.slice(0, -1) + "ies" : v + "s");
  const BASEOF = {};
  for (const v of BASE) {
    BASEOF[THIRD(v)] = v;
    const ed = /e$/.test(v) ? v + "d" : /[^aeiou]y$/.test(v) ? v.slice(0, -1) + "ied" : v + "ed";
    if (!Object.values(IRR).includes(v)) BASEOF[ed] = v;
  }
  for (const [p, v] of Object.entries(IRR)) BASEOF[p] = v;
  const AN_EXCEPT = /^(uni|use|usu|uti|ure|eu|one|once|ewe)/i, AN_YES = /^(hour|honest|honor|honour|heir)/i;
  const COMP = "better|bigger|faster|taller|smaller|happier|easier|harder|stronger|older|younger|colder|hotter|longer|louder|darker|scarier|funnier|braver|smarter|kinder|prettier|nicer|cooler|warmer|higher|lower|faster|slower|cuter|richer|worse";
  const QWORD = /^(what|where|who|why|how|when|which|do|does|did|are|is|am|can|will|should|could|would|have|has|was|were|shall|may)\b/i;

  function addIssue(out, s, e, msg, fix) { if (!out.some((x) => s < x.e && e > x.s)) out.push({ s, e, msg, fix, fixes: fix == null ? [] : [fix] }); }

  function check(text, opts) {
    opts = opts || {};
    const out = [];
    text = String(text || "");
    if (/[가-힣]/.test(text) && opts.english !== false) {
      const i = text.search(/[가-힣]/);
      addIssue(out, i, i + 1, "영어 이야기 칸에 한글이 있어요. 우리말은 아래 '우리말 자막' 칸에 써 주세요.", null);
    }
    let m;
    /* 줄마다: 이름: 뒤를 문장 시작으로 봄 */
    const lineRe = /[^\n]+/g;
    while ((m = lineRe.exec(text))) {
      const line = m[0], off = m.index;
      const sp = line.match(/^\s*[A-Z][A-Za-z' -]{0,18}?\s*:\s*/), start = sp ? sp[0].length : (line.match(/^\s*/)[0].length);
      const body = line.slice(start), bOff = off + start;
      if (!body.trim()) continue;
      /* 1. 문장 첫 글자 대문자 */
      const sre = /(^|[.!?]["”']?\s+)(["“']?)([a-z])/g; let s;
      while ((s = sre.exec(body))) {
        const at = bOff + s.index + s[1].length + s[2].length;
        if (/^(e\.g|i\.e)/.test(body.slice(s.index + s[1].length))) continue;
        addIssue(out, at, at + 1, "문장의 첫 글자는 대문자로 써요.", s[3].toUpperCase());
      }
      /* 2. 문장 끝 부호 */
      const trimmed = body.replace(/\s+$/, "");
      if (trimmed.split(/\s+/).length >= 3 && !/[.!?…"”')~]$/.test(trimmed) && !/[가-힣]/.test(trimmed)) {
        const lastSent = trimmed.split(/(?<=[.!?])\s+/).pop();
        const end = bOff + trimmed.length;
        addIssue(out, end - 1, end, QWORD.test(lastSent) ? "질문이면 끝에 물음표(?)를 찍어요." : "문장 끝에 마침표(.)나 느낌표(!)를 찍어요.", trimmed.slice(-1) + (QWORD.test(lastSent) ? "?" : "."));
      }
    }
    const rx = (re, fn) => { re.lastIndex = 0; let x; while ((x = re.exec(text))) fn(x); };
    /* 3. 나를 뜻하는 i */
    rx(/(^|[^A-Za-z'’])(i)(?=(['’](m|ll|ve|d))?\b(?![.'’-]?[A-Za-z]{2}))/g, (x) => { const at = x.index + x[1].length; if (/^[a-z]/.test(text.slice(at - 1, at)) ) return; addIssue(out, at, at + 1, "'나'를 뜻하는 I는 언제나 대문자예요.", "I"); });
    /* 4. a / an */
    rx(/\b([Aa]n?)\s+([A-Za-z]+)/g, (x) => {
      const art = x[1], w = x[2], vowel = /^[aeiou]/i.test(w), wantAn = (vowel && !AN_EXCEPT.test(w)) || AN_YES.test(w);
      if (art.length === 1 && wantAn) addIssue(out, x.index, x.index + 1, `'${w}'처럼 모음 소리로 시작하는 말 앞에는 an을 써요.`, art + "n");
      if (art.length === 2 && !wantAn && !/^[aeiou]/i.test(w)) addIssue(out, x.index, x.index + 2, `'${w}'처럼 자음 소리로 시작하는 말 앞에는 a를 써요.`, art[0]);
    });
    /* 5. 같은 단어 두 번 */
    rx(/\b([A-Za-z]+)\s+\1\b/gi, (x) => { if (/^(ha|ho|no|bye|very|knock|so|run|go|yes|la|ta|beep|tick|tock|wow|hey)$/i.test(x[1])) return; addIssue(out, x.index, x.index + x[0].length, "같은 단어가 두 번 들어갔어요.", x[1]); });
    /* 6. I is / they is / he are */
    rx(/\b(I)\s+(is|are)\b/g, (x) => addIssue(out, x.index, x.index + x[0].length, "I 뒤에는 am을 써요. (I am)", "I am"));
    rx(/\b(I)\s+(was|were)\b/g, (x) => { if (x[2] === "were") addIssue(out, x.index, x.index + x[0].length, "I 뒤의 과거형은 was예요.", "I was"); });
    rx(/\b(we|you|they|We|You|They)\s+(is|was)\b/g, (x) => addIssue(out, x.index, x.index + x[0].length, `${x[1]} 뒤에는 ${x[2] === "is" ? "are" : "were"}를 써요.`, `${x[1]} ${x[2] === "is" ? "are" : "were"}`));
    rx(/\b(he|she|it|He|She|It)\s+(are|am)\b/g, (x) => addIssue(out, x.index, x.index + x[0].length, `${x[1]} 뒤에는 is를 써요.`, `${x[1]} is`));
    /* 7. he/she/it + 동사원형 (현재) */
    rx(/(^|[^A-Za-z'])((?:he|she|it|He|She|It))\s+([a-z]+)\b/g, (x) => {
      const v = x[3]; if (!BASE.includes(v)) return;
      const before = text.slice(0, x.index + x[1].length).trim().split(/\s+/).pop() || "";
      if (new RegExp("^(" + MODAL + "|to|make|made|let|help|helped|saw|see|watch|watched|heard|hear)$", "i").test(before)) return;
      const at = x.index + x[1].length + x[2].length + 1;
      const s = text.indexOf(v, at - 1);
      addIssue(out, s, s + v.length, `${x[2]} 뒤의 현재형 동사에는 -s를 붙여요. 지난 일이면 과거형으로 써요.`, THIRD(v));
    });
    /* 8. can/will/did/to + 과거형·-s → 동사원형 */
    rx(new RegExp("\\b(" + MODAL + "|not)\\s+([a-z]+)\\b", "gi"), (x) => {
      const w = x[2].toLowerCase(), b = BASEOF[w]; if (!b || b === w) return;
      if (x[1].toLowerCase() === "not" && !/\b(do|does|did|will|can|could|would|should|must)\s+not\s*$/i.test(text.slice(Math.max(0, x.index - 12), x.index + 4))) return;
      const s = x.index + x[0].length - x[2].length;
      addIssue(out, s, s + x[2].length, `${x[1]} 뒤에는 동사원형을 써요. (${x[1]} ${b})`, b);
    });
    rx(/\bto\s+([a-z]+)\b/gi, (x) => {
      const w = x[1].toLowerCase(); if (!IRR[w] && !/ed$/.test(w)) return;
      const b = BASEOF[w]; if (!b) return;
      if (/^(left|found|felt|lost|won|kept|met|got)$/.test(w)) return;
      const s = x.index + x[0].length - x[1].length;
      addIssue(out, s, s + x[1].length, `to 뒤에는 동사원형을 써요. (to ${b})`, b);
    });
    /* 9. 불규칙 동사 */
    rx(/\b([A-Za-z]+)\b/g, (x) => { const w = x[1].toLowerCase(); if (OVER[w]) addIssue(out, x.index, x.index + w.length, `불규칙 동사예요. ${w}가 아니라 ${OVER[w]}로 써요.`, /^[A-Z]/.test(x[1]) ? OVER[w][0].toUpperCase() + OVER[w].slice(1) : OVER[w]); });
    /* 10. more + -er */
    rx(new RegExp("\\bmore\\s+(" + COMP + ")\\b", "gi"), (x) => addIssue(out, x.index, x.index + x[0].length, `${x[1]}에 이미 '더'라는 뜻이 있어서 more를 빼요.`, x[1]));
    /* 11. can to / must to */
    rx(/\b(can|must|should|will|could|would)\s+to\s+/gi, (x) => addIssue(out, x.index, x.index + x[0].length, `${x[1]} 뒤에는 to를 쓰지 않아요.`, x[1] + " "));
    /* 12. 띄어쓰기와 문장 부호 */
    rx(/([A-Za-z])\s+([,.!?])(?![.\w])/g, (x) => addIssue(out, x.index + 1, x.index + x[0].length, "문장 부호 앞에는 띄어 쓰지 않아요.", x[2]));
    rx(/([a-z]{2})([,!?]|\.(?!\.))([A-Za-z]{2})/g, (x) => { const at = x.index + 2 + x[2].length; addIssue(out, at - 1, at, "문장 부호 뒤에는 한 칸 띄어요.", x[2] + " "); });
    /* 13. 철자 (단어 목록을 받은 뒤에만) */
    if (dict) {
      const known = opts.known || new Set();
      rx(/[A-Za-z]+(?:['’][a-z]+)?/g, (x) => {
        const raw = x[0], w = raw.toLowerCase().replace(/['’].*$/, "");
        if (w.length < 3 || /^[A-Z]/.test(raw) || dict.has(w) || known.has(w) || CONTRA.test(raw)) return;
        if (out.some((y) => x.index < y.e && x.index + raw.length > y.s)) return;
        const sug = suggest(w, known);
        addIssue(out, x.index, x.index + w.length, sug.length ? "철자를 확인해 보세요. 이 중에 있나요?" : "철자를 확인해 보세요. (사전에 없는 단어예요)", sug[0] || null);
        out[out.length - 1].fixes = sug;
      });
    }
    return out.sort((a, b) => a.s - b.s);
  }
  const CONTRA = /^[A-Za-z]+['’](s|t|re|ve|ll|d|m)$/i;

  /* ---------- 철자 사전 (assets/words.txt, 처음 한 번만 받음) ---------- */
  let dict = null, rank = null, loading = null;
  function load(base) {
    if (dict) return Promise.resolve(true);
    if (!loading) loading = fetch((base || "") + "assets/words.txt").then((r) => r.text()).then((t) => {
      const list = t.split("\n"); rank = new Map(); list.forEach((w, i) => rank.set(w, i)); dict = new Set(list); return true;
    }).catch(() => { loading = null; return false; });
    return loading;
  }
  const AB = "abcdefghijklmnopqrstuvwxyz";
  function edits1(w) {
    const out = new Set();
    for (let i = 0; i <= w.length; i++) {
      const a = w.slice(0, i), b = w.slice(i);
      if (b) out.add(a + b.slice(1));
      if (b.length > 1) out.add(a + b[1] + b[0] + b.slice(2));
      for (const c of AB) { if (b) out.add(a + c + b.slice(1)); out.add(a + c + b); }
    }
    return out;
  }
  function suggest(w, known) {
    if (!dict) return [];
    known = known || new Set();
    const has = (x) => dict.has(x) || known.has(x);
    /* 오늘 배운 단어를 먼저, 그다음 자주 쓰는 단어 순서로 */
    const r = (x) => (known.has(x) ? -1e6 : 0) + (rank.has(x) ? rank.get(x) : 9e5) + (x[0] !== w[0] ? 2e4 : 0);
    let c = [...edits1(w)].filter(has);
    if (c.length < 2 && w.length <= 9) { const s = new Set(c); for (const e of edits1(w)) for (const e2 of edits1(e)) if (has(e2)) s.add(e2); c = [...s]; }
    return c.sort((a, b) => r(a) - r(b)).slice(0, 3);
  }
  function apply(text, issue, fix) { fix = fix == null ? issue.fix : fix; return fix == null ? text : text.slice(0, issue.s) + fix + text.slice(issue.e); }
  global.RSLGrammar = { check, load, apply, suggest, ready: () => !!dict };
})(window);
