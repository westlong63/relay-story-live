/* Relay Story Live · 사건 구조 (클루 보드게임처럼 이어 쓰는 릴레이 소설)
   사건 파일(js/cases.js)에서 카드를 뽑아 회차마다 할 일을 정해 줍니다.
   - 회차 역할: 첫 화 = 사건 발생, 마지막 화 = 범인 밝히기, 가운데는 단서 발견 → 용의자 만나기 → 장소 조사 → 용의자 만나기 순서로 돌아요.
   - 비밀 봉투(env): 범인 1명, 용의자 4명(범인 포함), 장소 순서. 모둠마다 다르게 뽑혀서 같은 사건이라도 범인이 달라요.
   - 범인이 누구인지는 마지막 화를 쓰는 학생에게만 보내요 (part).
   - 문장 틀(frames)은 카드 내용이 이미 들어간 영어 문장 + 우리말 자막이에요. 학생은 골라 넣고, 자기 문장을 더해요.
   교사 화면(엔진)과 학생 디벗이 같이 씁니다. */
(function (global) {
  "use strict";
  const CASES = global.RSL_CASES || {};
  const MID = ["clue", "suspect", "search", "suspect"];
  const ROLE = {
    case: { en: "The Case", ko: "사건 발생", icon: "🚨", tip: "무슨 일이 일어났는지, 그곳에 누가 있었는지 써요" },
    clue: { en: "The Clue", ko: "단서 발견", icon: "🔎", tip: "어디에서 어떤 단서를 찾았는지 써요" },
    suspect: { en: "The Suspect", ko: "용의자 만나기", icon: "🗣️", tip: "용의자를 만나 어디에 있었는지 물어봐요" },
    search: { en: "The Search", ko: "장소 조사", icon: "🧭", tip: "장소를 조사하고 새 소식을 들어요" },
    solve: { en: "The Answer", ko: "범인 밝히기", icon: "🎉", tip: "비밀 봉투를 열고 범인과 이유를 밝혀요" },
  };
  const DET = [["Mina", "미나"], ["Jun", "준"]];
  const KIND = { "🐶": "dog", "🐕": "dog", "🐱": "cat", "🐈": "cat", "🟢": "slime", "🐻": "bear", "🤖": "robot", "🦜": "bird", "🐒": "monkey", "👻": "ghost", "🐹": "hamster" };
  const OLD = ["🧓", "👵", "👴"], SMALL = ["👧", "👦", "🧒"];

  const role = (k, rounds) => (k <= 0 ? "case" : k >= rounds - 1 ? "solve" : MID[(k - 1) % MID.length]);
  const bat = (w) => { const c = String(w).trim().slice(-1).charCodeAt(0); return c >= 0xac00 && c <= 0xd7a3 ? (c - 0xac00) % 28 : 0; };
  const jo = (w, a, b) => w + (bat(w) ? a : b);
  const ro = (w) => { const b = bat(w); return w + (b && b !== 8 ? "으로" : "로"); };
  const dot = (s) => (/[.!?]$/.test(s) ? s : s + ".");
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const listEn = (a) => (a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]);

  /* 비밀 봉투 뽑기 */
  function makeEnv(rnd) {
    rnd = rnd || Math.random;
    const sh = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const all = sh([0, 1, 2, 3, 4, 5]), c = all[0], inn = all.slice(1, 4);
    return { c, sus: sh([c].concat(inn)), inn, pl: [0].concat(sh([1, 2, 3, 4, 5])) };
  }
  /* k화를 쓰는 학생에게 보낼 카드 번호 (범인은 마지막 화에만 들어 있어요) */
  function part(env, k, rounds) {
    const r = role(k, rounds), o = { role: r, k, sus: env.sus };
    if (r === "case") o.pl = env.pl[0];
    if (r === "clue") { o.item = env.c; o.pl = env.pl[1]; }
    if (r === "suspect") { let n = 0; for (let j = 1; j < k; j++) if (role(j, rounds) === "suspect") n++; o.who = env.inn[n % env.inn.length]; o.pl = env.pl[n % 2 ? 4 : 2]; }
    if (r === "search") { o.pl = env.pl[3]; o.who = env.inn[2]; o.to = env.pl[5]; }
    if (r === "solve") { o.c = env.c; o.item = env.c; o.pl = env.pl[5]; }
    return o;
  }
  /* 지켜보는 친구에게는 마지막 화의 봉투를 잠가서 보내요 */
  const hide = (p) => (p && p.role === "solve" ? { role: "solve", k: p.k, sus: p.sus, locked: true } : p);

  /* 화면에 보여 줄 카드 */
  function cards(cs, p) {
    const out = [], S = cs.suspects, P = cs.places, I = cs.items;
    const place = (i, label) => ({ t: "place", label, emoji: P[i].emoji, en: P[i].en, ko: P[i].ko });
    const sus = (i, label) => ({ t: "sus", label, emoji: S[i].emoji, en: S[i].name, ko: S[i].ko, sub: S[i].role, subKo: S[i].roleKo, note: `${S[i].name} ${S[i].trait}.`, noteKo: S[i].traitKo });
    const item = (i, label) => ({ t: "item", label, emoji: I[i].emoji, en: I[i].en, ko: I[i].ko });
    if (p.role === "case") { out.push({ t: "miss", label: "사라진 것", emoji: cs.missing.emoji, en: cs.missing.en, ko: cs.missing.ko }, place(p.pl, "사건 장소")); p.sus.forEach((i) => out.push(sus(i, "용의자"))); }
    if (p.role === "clue") out.push(place(p.pl, "단서를 찾은 곳"), item(p.item, "단서"));
    if (p.role === "suspect") out.push(sus(p.who, "만날 용의자"), place(p.pl, "그때 있던 곳"));
    if (p.role === "search") out.push(place(p.pl, "조사할 곳"), sus(p.who, "거기서 만난 사람"), place(p.to, "누군가 간 곳"));
    if (p.role === "solve" && !p.locked) out.push(sus(p.c, "범인"), place(p.pl, "찾은 곳"), item(p.item, "결정적 단서"), { t: "why", label: "이유", emoji: "💬", en: S[p.c].why, ko: S[p.c].whyKo });
    return out;
  }
  /* 카드 내용이 들어간 문장 틀. d = 0이면 미나가, 1이면 준이 앞장서요 */
  function frames(cs, p, d) {
    const [D, Dk] = DET[d ? 1 : 0], [E, Ek] = DET[d ? 0 : 1], S = cs.suspects, P = cs.places, I = cs.items, m = cs.missing;
    const both = `${D} and ${E}`, bothK = `${jo(Dk, "과", "와")} ${jo(Ek, "은", "는")}`;
    const L = [], add = (en, ko) => L.push({ en, ko });
    let screen = "";
    if (p.role === "case") {
      const pl = P[p.pl], names = p.sus.map((i) => S[i].name), namesK = p.sus.map((i) => S[i].ko);
      screen = `${both} are ${pl.prep} ${pl.en}.`;
      add(`One day, ${both} were ${pl.prep} ${pl.en}.`, `어느 날, ${bothK} ${pl.ko}에 있었어요.`);
      add(`Suddenly, ${m.en} was gone!`, `갑자기 ${jo(m.ko, "이", "가")} 사라졌어요!`);
      add(`${D}: Oh no! Where is ${m.en}?`, `이런! ${jo(m.ko, "은", "는")} 어디 갔지?`);
      add(`${listEn(names)} were there.`, `그곳에는 ${jo(namesK.join(", "), "이", "가")} 있었어요.`);
      add(`${E}: Don't worry. We will find it!`, `걱정 마. 우리가 꼭 찾을게!`);
    } else if (p.role === "clue") {
      const pl = P[p.pl], it = I[p.item];
      screen = `${D} finds ${it.en} ${pl.prep} ${pl.en}.`;
      add(`${both} started to look for clues.`, `${bothK} 단서를 찾기 시작했어요.`);
      add(`${D} found ${it.en} ${pl.prep} ${pl.en}.`, `${jo(Dk, "은", "는")} ${pl.ko}에서 ${jo(it.ko, "을", "를")} 발견했어요.`);
      add(`${D}: Look! I found ${it.en}!`, `이것 봐! ${jo(it.ko, "을", "를")} 찾았어!`);
      add(`${E}: Hmm. Who left it here?`, `흠. 누가 이걸 여기 두고 갔을까?`);
      add(`${D}: This is a big clue!`, `이건 중요한 단서야!`);
    } else if (p.role === "suspect") {
      const s = S[p.who], pl = P[p.pl];
      screen = `${both} talk to ${s.name}.`;
      add(`${both} met ${s.name}, ${s.role}.`, `${bothK} ${s.roleKo} ${jo(s.ko, "을", "를")} 만났어요.`);
      add(`${s.name} ${s.trait}.`, `${jo(s.ko, "은", "는")} ${dot(s.traitKo)}`);
      add(`${D}: Where were you?`, `어디에 있었어요?`);
      add(`${s.name}: I was ${pl.prep} ${pl.en}.`, `저는 ${pl.ko}에 있었어요.`);
      add(`${s.name}: I didn't take ${m.en}!`, `저는 ${jo(m.ko, "을", "를")} 가져가지 않았어요!`);
      add(`${E}: OK. It was not ${s.name}.`, `좋아. ${jo(s.ko, "은", "는")} 아니야.`);
    } else if (p.role === "search") {
      const pl = P[p.pl], w = S[p.who], to = P[p.to];
      screen = `${both} look around ${pl.en}.`;
      add(`${both} went to ${pl.en}.`, `${bothK} ${ro(pl.ko)} 갔어요.`);
      add(`They looked for ${m.en} everywhere.`, `두 사람은 ${jo(m.ko, "을", "를")} 여기저기 찾아봤어요.`);
      add(`But it was not there.`, `하지만 거기에는 없었어요.`);
      add(`${w.name}: I saw someone go to ${to.en}!`, `누가 ${ro(to.ko)} 가는 걸 봤어요!`);
      add(`${D}: Thank you! Let's go, ${E}!`, `고마워요! 가자, ${Ek}!`);
    } else if (p.role === "solve" && !p.locked) {
      const c = S[p.c], pl = P[p.pl], it = I[p.item];
      screen = `${both} find ${m.en} ${pl.prep} ${pl.en}.`;
      add(`${both} ran to ${pl.en}.`, `${bothK} ${ro(pl.ko)} 달려갔어요.`);
      add(`There it was! ${c.name} had ${m.en}.`, `거기 있었어요! ${jo(c.ko, "이", "가")} ${jo(m.ko, "을", "를")} 가지고 있었어요.`);
      add(`${D}: It was you, ${c.name}!`, `범인은 바로 ${c.ko}!`);
      add(`${E}: We found ${it.en}. ${c.name} ${c.trait}.`, `우리가 ${jo(it.ko, "을", "를")} 찾았거든. ${jo(c.ko, "은", "는")} ${dot(c.traitKo)}`);
      add(`${c.name}: I'm sorry. ${c.why}`, `미안해요. ${c.whyKo}`);
      add(`${D}: It's OK. Let's go back together!`, `괜찮아요. 같이 돌아가요!`);
      add(`In the end, everyone was happy.`, `마침내 모두가 행복해졌어요.`);
    }
    return { screen, list: L };
  }
  /* 시연용: 문장 틀을 그대로 이어 붙인 한 화 */
  function sample(cs, p, d, word) {
    const f = frames(cs, p, d), L = f.list.slice();
    if (word && word.ex) L.push({ en: word.ex, ko: word.exKo || "-" });
    return { title: "", scenes: [{ screen: f.screen, text: L.map((x) => x.en).join("\n"), ko: L.map((x) => x.ko).join("\n") }], next: null, pick: null };
  }
  /* 영상에 넣을 정보: "범인은 누구?" 보기 4명과 정답 */
  function film(cs, env) {
    const S = cs.suspects, c = S[env.c];
    return {
      title: cs.title, titleKo: cs.ko, q: `Who took ${cs.missing.en}?`, qKo: `누가 ${jo(cs.missing.ko, "을", "를")} 가져갔을까요?`, missing: cs.missing,
      options: env.sus.map((i) => ({ i, name: S[i].name, ko: S[i].ko, role: S[i].role, roleKo: S[i].roleKo, emoji: S[i].emoji, trait: S[i].trait, traitKo: S[i].traitKo })),
      answer: env.sus.indexOf(env.c), item: cs.items[env.c], where: cs.places[env.pl[5]], why: c.why, whyKo: c.whyKo,
    };
  }
  /* 영상 속 인물 모습: 동물·유령·로봇은 따로 그리고, 어르신은 흰머리, 어린이는 작게 */
  function look(s) {
    const kind = KIND[s.emoji] || null;
    return { gender: kind === "robot" ? "robot" : s.gender, kind, old: OLD.includes(s.emoji), small: SMALL.includes(s.emoji) };
  }
  const names = (cs) => (cs ? cs.suspects.map((s) => s.name) : []);
  const api = { CASES, ROLE, DET, role, makeEnv, part, hide, cards, frames, sample, film, look, names, cap, of: (id) => CASES[id] || null };
  global.RSL_CLUE = api;
  if (typeof module !== "undefined") module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
