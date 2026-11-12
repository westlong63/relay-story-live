/* Relay Story Live · 수업 내용 (주제 36개, 단어, 글쓰기 힌트, 반전 카드, 금지어)
   단어는 모두 2022 개정 영어과 교육과정 [별책14] 기본 어휘 목록의 ** 표시(중학교 권장) 단어입니다.
   선생님은 아무것도 만들 필요가 없어요. 교사 화면이 아직 안 한 주제를 계절에 맞춰 자동으로 골라 줍니다.

   단어 한 개 = W(단어, 뜻, 품사, 이모지, 강세, 예문, 예문 뜻, 기억 팁)
   강세는 음절을 '-'로 나누고 세게 읽는 음절만 대문자로 씁니다. 예: "CU-ri-ous", "a-CHIEVE" */
window.RSL_CONTENT = (function () {
  const MJ = {
    Narrator: { gender: "n" },
    Mina: { gender: "f", look: "15-year-old girl, short black bob hair, yellow hoodie", color: "#ffce3c" },
    Jun: { gender: "m", look: "15-year-old boy, spiky brown hair, round glasses, blue jacket", color: "#6eaaff" },
  };
  const withChars = (extra) => Object.assign(JSON.parse(JSON.stringify(MJ)), extra || {});
  const W = (word, ko, pos, emoji, syl, ex, exKo, hook) => ({ word, ko, pos, emoji, syl, ex, exKo, hook });
  const X = (s) => s.split("|").map((p) => p.split("="));
  const WINTER = [11, 12, 1, 2];
  const T = (o) => Object.assign({ characters: withChars(), months: [] }, o);

  const topics = [
    T({ id: "night", title: "The Night Before High School", ko: "고등학교 입학 전날 밤", genre: "판타지", months: [12, 1, 2, 3],
      seed: "On the night before high school starts, something strange happens at your old middle school.",
      seedKo: "고등학교 입학 전날 밤, 다니던 중학교에서 이상한 일이 벌어져요.",
      screens: ["Mina walks past her old school at night.", "A golden key shines on the classroom floor.", "Mina and Jun run up the stairs to the rooftop.", "Mina and Jun watch the sunrise on the rooftop."],
      words: [
        W("strange", "이상한, 낯선", "형용사", "🌀", "STRANGE", "Mina saw a strange light in the window.", "미나는 창문에서 이상한 불빛을 보았다.", "스트레인지 → 전자레인지가 혼자 돌아간다?! 이상해!"),
        W("whisper", "속삭이다", "동사", "🤫", "WHIS-per", "Let's whisper, so nobody can hear us.", "아무도 못 듣게 속삭이자.", "위스퍼~ 바람 소리처럼 '쉬~' 하고 작게 말해요"),
        W("shine", "빛나다", "동사", "✨", "SHINE", "The old key began to shine.", "오래된 열쇠가 빛나기 시작했다.", "샤인머스캣처럼 반짝반짝 빛나요"),
        W("secret", "비밀; 비밀의", "명사·형용사", "🤐", "SE-cret", "They found a secret room on the rooftop.", "그들은 옥상에서 비밀의 방을 찾았다.", "시크릿 → 쉿! 아무도 모르는 비밀"),
        W("curious", "궁금한, 호기심 많은", "형용사", "🧐", "CU-ri-ous", "Mina was curious about the light.", "미나는 그 불빛이 궁금했다.", "큐리어스 → 큐(Q)! 머리 위에 물음표가 뿅"),
        W("promise", "약속; 약속하다", "명사·동사", "🤙", "PROM-ise", "They made a promise to stay friends.", "그들은 계속 친구로 지내자고 약속했다.", "프라미스 → 새끼손가락 걸고 '프라미스!'")],
      extra: X("rooftop=옥상|key=열쇠|stairs=계단|hallway=복도|flashlight=손전등|uniform=교복|night=밤|sunrise=해돋이") }),

    T({ id: "future", title: "A Message from 2035", ko: "2035년에서 온 메시지", genre: "SF·진로", months: WINTER,
      seed: "One morning, you get a message from yourself, ten years in the future.",
      seedKo: "어느 날 아침, 10년 뒤의 내가 보낸 메시지가 도착해요.",
      screens: ["Jun looks at his phone in his bedroom in the morning.", "Mina reads the message in the classroom.", "Mina and Jun walk on the street after school.", "Mina and Jun stand on the rooftop in the sunrise."],
      words: [
        W("imagine", "상상하다", "동사", "🌈", "i-MAG-ine", "Can you imagine your life in 2035?", "2035년의 네 삶을 상상할 수 있니?", "이매진 → 이미지(image)를 머릿속에 그리기 = 상상"),
        W("expect", "기대하다, 예상하다", "동사", "🤞", "ex-PECT", "Jun didn't expect a message from himself.", "준은 자기 자신에게서 메시지가 올 줄 몰랐다.", "익스펙트 → 택배를 손꼽아 기다리며 기대해요"),
        W("achieve", "이루다, 성취하다", "동사", "🏆", "a-CHIEVE", "You will achieve your dream someday.", "너는 언젠가 꿈을 이룰 거야.", "a-CHIEVE → chief(대장)가 되는 꿈을 이루다"),
        W("career", "직업, 경력", "명사", "💼", "ca-REER", "Mina wants a career in science.", "미나는 과학 분야의 직업을 원한다.", "커리어 → 뒤 음절 REER를 세게! 커리어 = 평생의 직업"),
        W("challenge", "도전; 도전하다", "명사·동사", "🧗", "CHAL-lenge", "High school will be a new challenge.", "고등학교는 새로운 도전이 될 거야.", "챌린지 → SNS 댄스 챌린지에 도전!"),
        W("advice", "조언, 충고", "명사", "💬", "ad-VICE", "The message had some good advice.", "그 메시지에는 좋은 조언이 있었다.", "어드바이스 → '어, 들어 봐!' 하고 건네는 조언")],
      extra: X("future=미래|message=메시지|phone=휴대폰|dream=꿈|job=직업|scientist=과학자|worry=걱정하다|myself=나 자신") }),

    T({ id: "planet", title: "New Kid from Another Planet", ko: "다른 행성에서 온 전학생", genre: "SF·학교",
      seed: "A new student joins your class. There is one secret: the student is from another planet.",
      seedKo: "새 친구가 전학을 왔어요. 비밀이 하나 있어요. 그 친구는 다른 행성에서 왔어요.",
      characters: withChars({ Zoe: { gender: "f", look: "a friendly alien girl", color: "#96e6aa" } }),
      screens: ["Zoe stands in front of the classroom.", "Mina and Zoe talk in the hallway.", "Jun shows Zoe the school gate.", "Zoe looks at her planet in space."],
      words: [
        W("planet", "행성", "명사", "🪐", "PLAN-et", "Zoe came from a small blue planet.", "조이는 작은 파란 행성에서 왔다.", "플래닛 → 플랜(plan) 짜서 떠나는 행성 여행"),
        W("language", "언어", "명사", "🗣️", "LAN-guage", "She spoke a language nobody knew.", "그녀는 아무도 모르는 언어로 말했다.", "랭귀지 → 혀(라틴어 lingua)로 하는 것 = 언어"),
        W("communicate", "의사소통하다", "동사", "📡", "com-MU-ni-cate", "They used pictures to communicate.", "그들은 그림으로 의사소통했다.", "커뮤니케이트 → 커뮤니티(community)에서 서로 말 나누기"),
        W("gesture", "몸짓, 제스처", "명사", "👋", "GES-ture", "Jun made a friendly gesture.", "준은 친근한 몸짓을 했다.", "제스처 → 몸으로 말하는 '제스처 게임'"),
        W("greet", "인사하다, 맞이하다", "동사", "🙋", "GREET", "The class greeted the new student.", "반 친구들이 새 학생을 반갑게 맞이했다.", "그리트 → 'Great!' 하고 반갑게 인사해요"),
        W("respect", "존중; 존중하다", "명사·동사", "🤝", "re-SPECT", "We respect different cultures.", "우리는 다른 문화를 존중한다.", "리스펙! 힙합에서 외치는 'Respect' = 존중")],
      extra: X("alien=외계인|spaceship=우주선|star=별|new student=전학생|culture=문화|space=우주|earth=지구|different=다른") }),

    T({ id: "cat", title: "The Missing Cat Mystery", ko: "사라진 고양이 미스터리", genre: "미스터리",
      seed: "Your neighbor's cat, Coco, is missing. You and your friends become detectives for one day.",
      seedKo: "이웃집 고양이 코코가 사라졌어요. 친구들과 하루 동안 탐정이 되어요.",
      screens: ["Mina knocks on her neighbor's door.", "Jun looks for a cat under a tree in the park.", "Mina and Jun walk on the street at night with a map.", "A small cat sleeps on the rooftop."],
      words: [
        W("neighbor", "이웃", "명사", "🏘️", "NEIGH-bor", "My neighbor has a fluffy white cat.", "우리 이웃은 털이 복슬복슬한 하얀 고양이를 키운다.", "네이버 아님! 옆집에 사는 네이버(neighbor) = 이웃"),
        W("search", "찾다, 수색하다", "동사", "🔍", "SEARCH", "Let's search the park for Coco.", "공원에서 코코를 찾아보자.", "서치 → 검색창의 '서치' 버튼 = 찾다"),
        W("clue", "단서", "명사", "🧩", "CLUE", "Mina found a clue under the bench.", "미나는 벤치 아래에서 단서를 찾았다.", "클루 → 사건을 풀(glue)처럼 이어 주는 단서"),
        W("notice", "알아차리다", "동사", "👀", "NO-tice", "Did you notice the small footprints?", "작은 발자국을 알아챘니?", "노티스 → 알림(notice)이 뜨면 알아차려요"),
        W("mystery", "수수께끼, 미스터리", "명사", "❓", "MYS-ter-y", "The missing cat was a big mystery.", "사라진 고양이는 큰 수수께끼였다.", "미스터리 → 미스터 리(Mr. Lee)의 정체는 수수께끼"),
        W("solve", "해결하다, 풀다", "동사", "💡", "SOLVE", "Together, we can solve this mystery.", "함께라면 이 수수께끼를 풀 수 있어.", "솔브 → 솔루션(solution)을 찾아 문제를 풀다")],
      extra: X("cat=고양이|detective=탐정|footprint=발자국|missing=사라진|bench=벤치|tree=나무|map=지도|poster=전단지") }),

    T({ id: "game", title: "Trapped in a Video Game", ko: "게임 속에 갇혔다", genre: "모험·게임",
      seed: "You wake up inside a video game. To go home, you must clear the last level.",
      seedKo: "눈을 떠 보니 비디오 게임 속이에요. 집에 가려면 마지막 레벨을 깨야 해요.",
      screens: ["Mina wakes up in a pixel game world.", "Jun jumps over a trap in the game world.", "Mina and Jun find a golden key in the game.", "Mina and Jun walk through the exit door."],
      words: [
        W("escape", "탈출하다", "동사", "🏃", "es-CAPE", "We have to escape from this game!", "우리는 이 게임에서 탈출해야 해!", "이스케이프 → 키보드 ESC 키 = 탈출 버튼"),
        W("rule", "규칙", "명사", "📜", "RULE", "The first rule is: never give up.", "첫 번째 규칙은 절대 포기하지 않는 것이다.", "룰 → 게임 룰 = 규칙"),
        W("level", "단계, 레벨", "명사", "🎚️", "LEV-el", "Mina finished the last level.", "미나는 마지막 레벨을 끝냈다.", "레벨업! = 다음 단계로"),
        W("mission", "임무", "명사", "🎯", "MIS-sion", "Our mission is to find the golden key.", "우리의 임무는 황금 열쇠를 찾는 것이다.", "미션 임파서블 = 불가능한 임무"),
        W("skill", "기술, 능력", "명사", "⚡", "SKILL", "Jun has a special skill: he can fly.", "준에게는 특별한 능력이 있다. 그는 날 수 있다.", "스킬 → 게임 캐릭터의 스킬 = 능력"),
        W("trap", "덫, 함정", "명사·동사", "🪤", "TRAP", "Watch out! There is a trap on the floor.", "조심해! 바닥에 함정이 있어.", "트랩 → '함정 카드 발동!'")],
      extra: X("player=플레이어|boss=보스|coin=동전|jump=뛰다|heart=하트(목숨)|exit=출구|key=열쇠|monster=괴물") }),

    T({ id: "festival", title: "The School Festival Surprise", ko: "학교 축제 대소동", genre: "학교·코미디", months: [9, 10, 11, 12],
      seed: "The school festival is tomorrow. But this morning, everything goes wrong!",
      seedKo: "학교 축제가 내일이에요. 그런데 오늘 아침부터 모든 게 엉망이에요!",
      screens: ["Mina and Jun decorate the classroom in the morning.", "Jun practices a song on the stage.", "The stage is dark and the audience waits.", "Mina and Jun sing on the stage."],
      words: [
        W("prepare", "준비하다", "동사", "📋", "pre-PARE", "We prepared our show for two weeks.", "우리는 2주 동안 공연을 준비했다.", "프리페어 → pre(미리) 갖추다 = 준비하다"),
        W("practice", "연습; 연습하다", "명사·동사", "🎹", "PRAC-tice", "Let's practice one more time.", "한 번 더 연습하자.", "프랙티스 → 게임의 '연습 모드(practice mode)'"),
        W("perform", "공연하다", "동사", "🎤", "per-FORM", "Mina will perform a song on stage.", "미나는 무대에서 노래를 공연할 것이다.", "퍼폼 → 퍼포먼스(performance)를 하다 = 공연하다"),
        W("stage", "무대", "명사", "🎭", "STAGE", "The lights on the stage went out.", "무대 조명이 꺼졌다.", "스테이지 → 노래 무대, 게임 1스테이지"),
        W("audience", "관객", "명사", "👏", "AU-di-ence", "The audience clapped and cheered.", "관객들이 박수 치며 환호했다.", "오디언스 → 오디오(audio)를 듣는 사람들 = 관객"),
        W("decorate", "장식하다", "동사", "🎈", "DEC-o-rate", "Let's decorate the classroom with balloons.", "풍선으로 교실을 꾸미자.", "데코레이트 → 케이크 '데코'레이션 = 장식")],
      extra: X("festival=축제|poster=포스터|costume=의상|balloon=풍선|microphone=마이크|dance=춤|mistake=실수|ticket=표") }),

    T({ id: "time", title: "Time Travel Field Trip", ko: "시간 여행 현장 체험 학습", genre: "역사·모험",
      seed: "On a field trip to a museum, your class falls 500 years into the past.",
      seedKo: "박물관으로 체험 학습을 갔다가 반 전체가 500년 전 과거로 떨어져요.",
      screens: ["Mina and Jun look at an old map in the museum hallway.", "Mina and Jun stand in front of a palace.", "Jun talks to a king in the palace.", "Mina and Jun come back to the museum."],
      words: [
        W("museum", "박물관", "명사", "🏛️", "mu-SE-um", "Our class went to a history museum.", "우리 반은 역사 박물관에 갔다.", "뮤지엄 → 예술의 여신 뮤즈(Muse)의 집"),
        W("past", "과거", "명사", "⏳", "PAST", "We traveled 500 years into the past.", "우리는 500년 전 과거로 여행했다.", "패스트 → 지나간(passed) 시간 = 과거"),
        W("century", "세기, 100년", "명사", "💯", "CEN-tu-ry", "This old map is from the 16th century.", "이 오래된 지도는 16세기 것이다.", "센추리 → 센트(cent) = 100, 100년 = 1세기"),
        W("palace", "궁전, 궁궐", "명사", "🏯", "PAL-ace", "The king lived in a beautiful palace.", "왕은 아름다운 궁궐에 살았다.", "팰리스 → '○○팰리스' 아파트처럼 으리으리한 궁전"),
        W("tradition", "전통", "명사", "🎎", "tra-DI-tion", "Making rice cakes is a Korean tradition.", "떡을 만드는 것은 한국의 전통이다.", "tra-DI-tion → 명절 상에 DISH(접시)가 가득한 전통"),
        W("experience", "경험; 경험하다", "명사·동사", "🎒", "ex-PE-ri-ence", "It was the best experience of my life.", "그것은 내 인생 최고의 경험이었다.", "익스피리언스 → 직접 해 보는 '체험' = 경험")],
      extra: X("king=왕|queen=왕비|soldier=병사|hanbok=한복|village=마을|time machine=타임머신|history=역사|old=오래된") }),

    T({ id: "store", title: "The Magic Convenience Store", ko: "마법 편의점", genre: "판타지·코미디",
      seed: "A new convenience store opens near school. Everything it sells is a little bit magic.",
      seedKo: "학교 근처에 새 편의점이 생겼어요. 거기서 파는 물건은 모두 조금씩 마법이에요.",
      screens: ["Mina and Jun walk into a small store.", "Jun holds a strange candy in the store.", "Mina flies over the street.", "Mina and Jun wave goodbye to the store."],
      words: [
        W("magic", "마법; 마법의", "명사·형용사", "🪄", "MAG-ic", "This magic gum makes you fly.", "이 마법 껌은 너를 날게 해 준다.", "매직 → 매직 쇼 = 마법"),
        W("price", "가격", "명사", "🏷️", "PRICE", "The price is one smile.", "가격은 미소 한 번이다.", "프라이스 → 프라이스 태그 = 가격표"),
        W("item", "물건, 품목", "명사", "🛍️", "I-tem", "Every item in the store was strange.", "가게의 모든 물건이 이상했다.", "아이템 → 게임 아이템 = 물건"),
        W("exchange", "교환하다; 교환", "동사·명사", "🔄", "ex-CHANGE", "Can I exchange this for a different one?", "이걸 다른 것으로 바꿀 수 있나요?", "익스체인지 → change(바꾸다)가 들어 있어요 = 교환"),
        W("choice", "선택", "명사", "🔴", "CHOICE", "You have one choice: red or blue.", "너에게는 선택이 하나 있어. 빨강 아니면 파랑.", "초이스 → choose(고르다)의 명사 = 선택"),
        W("surprise", "놀라움; 놀라게 하다", "명사·동사", "🎁", "sur-PRISE", "What a surprise! The candy started to sing.", "깜짝이야! 사탕이 노래를 부르기 시작했다.", "서프라이즈 파티 = 깜짝 놀라게 하기")],
      extra: X("convenience store=편의점|candy=사탕|gum=껌|clerk=점원|counter=계산대|wish=소원|fly=날다|invisible=투명한") }),

    T({ id: "robot", title: "My Robot Friend", ko: "나의 로봇 친구", genre: "SF",
      seed: "You build a robot for the science fair. That night, it opens its eyes and starts to talk.",
      seedKo: "과학 대회에 낼 로봇을 만들었어요. 그날 밤, 로봇이 눈을 뜨고 말을 하기 시작해요.",
      characters: withChars({ Robo: { gender: "robot", look: "a small cute robot", color: "#aab4c8" } }),
      screens: ["Jun and Robo in his bedroom at night.", "Robo waves hello in the classroom.", "Mina repairs Robo's arm at the desk.", "Jun and Robo watch the sunrise on the rooftop."],
      words: [
        W("invent", "발명하다", "동사", "💡", "in-VENT", "Jun invented a robot for the science fair.", "준은 과학 대회를 위해 로봇을 발명했다.", "인벤트 → 세상에 없던 물건을 처음 만들어 내다"),
        W("machine", "기계", "명사", "⚙️", "ma-CHINE", "The machine made a strange sound.", "그 기계는 이상한 소리를 냈다.", "머신 → 커피 머신 = 기계"),
        W("battery", "배터리", "명사", "🔋", "BAT-ter-y", "Robo's battery is almost empty.", "로보의 배터리가 거의 다 떨어졌다.", "배터리 → 휴대폰 배터리, 그대로예요!"),
        W("repair", "수리하다; 수리", "동사·명사", "🔧", "re-PAIR", "Can you repair my robot arm?", "내 로봇 팔을 고쳐 줄 수 있니?", "리페어 → re(다시) + pair(짝 맞추기) = 다시 맞춰 고치다"),
        W("emotion", "감정", "명사", "😊", "e-MO-tion", "Robo wanted to learn about human emotions.", "로보는 사람의 감정에 대해 배우고 싶었다.", "이모션 → 이모티콘(emoticon) = 감정 그림"),
        W("pretend", "~인 척하다", "동사", "🎭", "pre-TEND", "Let's pretend we are robots.", "우리가 로봇인 척하자.", "프리텐드 → 아닌데 '그런 척' 하는 것")],
      extra: X("robot=로봇|science fair=과학 대회|arm=팔|button=버튼|power=전원|beep=삐 소리|laugh=웃다|human=사람") }),

    T({ id: "island", title: "The Island Not on the Map", ko: "지도에 없는 섬", genre: "모험",
      seed: "After a storm, your class boat arrives at a small island that is not on any map.",
      seedKo: "폭풍이 지나간 뒤, 우리 반 배가 어느 지도에도 없는 작은 섬에 닿아요.",
      screens: ["A small boat in the ocean during a storm.", "Mina and Jun walk on the beach of the island.", "Jun finds a map under a tree in the park.", "A rainbow over the island in the morning."],
      words: [
        W("storm", "폭풍", "명사", "⛈️", "STORM", "The storm was loud and scary.", "폭풍은 시끄럽고 무서웠다.", "스톰 → 쿵쾅 스톰! 폭풍"),
        W("island", "섬", "명사", "🏝️", "IS-land", "We found a small island in the ocean.", "우리는 바다에서 작은 섬을 발견했다.", "아일랜드 → s는 소리 안 나요! 바다 위 땅(land) = 섬"),
        W("ocean", "바다, 대양", "명사", "🌊", "O-cean", "The ocean was blue and calm.", "바다는 파랗고 잔잔했다.", "오션 → 오션뷰 = 바다 전망"),
        W("journey", "여행, 여정", "명사", "🧭", "JOUR-ney", "Our journey is just beginning.", "우리의 여정은 이제 막 시작이다.", "저니 → 하루하루 이어지는 긴 여정"),
        W("adventure", "모험", "명사", "🗺️", "ad-VEN-ture", "This is the biggest adventure of our lives.", "이건 우리 인생에서 가장 큰 모험이야.", "어드벤처 → 놀이공원 어드벤처 = 모험"),
        W("rainbow", "무지개", "명사", "🌈", "RAIN-bow", "A rainbow appeared over the island.", "섬 위로 무지개가 떴다.", "rain(비) + bow(활) = 비 온 뒤 하늘의 활")],
      extra: X("boat=배|beach=해변|sand=모래|palm tree=야자나무|cave=동굴|fire=불|help=도움|wave=파도") }),

    T({ id: "ghost", title: "The Friendly Ghost in the Library", ko: "도서관의 착한 유령", genre: "미스터리·코미디",
      seed: "After school, you stay late in the library. Then the books start to move by themselves.",
      seedKo: "방과 후 도서관에 늦게까지 남았는데, 책들이 저절로 움직이기 시작해요.",
      screens: ["Mina reads a book next to the library shelves.", "A shadow moves in the dark hallway.", "Jun runs down the stairs.", "Mina and Jun laugh on the rooftop at sunrise."],
      words: [
        W("ghost", "유령", "명사", "👻", "GHOST", "There is a friendly ghost in our library.", "우리 도서관에는 착한 유령이 있다.", "고스트 → 스르륵 벽을 통과하는 유령"),
        W("shadow", "그림자", "명사", "👤", "SHAD-ow", "A long shadow moved across the wall.", "긴 그림자가 벽을 가로질러 움직였다.", "섀도 → 눈 화장 '섀도'처럼 어둡게 드리운 그림자"),
        W("scream", "비명을 지르다; 비명", "동사·명사", "😱", "SCREAM", "Jun screamed and dropped his book.", "준은 비명을 지르며 책을 떨어뜨렸다.", "스크림 → 아이스크림 아니고 꺄악! 비명"),
        W("hide", "숨다, 숨기다", "동사", "🙈", "HIDE", "The ghost likes to hide behind the shelves.", "유령은 책장 뒤에 숨는 것을 좋아한다.", "숨바꼭질은 hide-and-seek, 숨는 쪽이 hide"),
        W("scare", "겁주다, 놀라게 하다", "동사", "😨", "SCARE", "Don't worry. I won't scare you.", "걱정 마. 너를 겁주지 않을게.", "스케어 → scary(무서운)와 한 가족 = 겁주다"),
        W("shelf", "선반, 책장", "명사", "📚", "SHELF", "A book fell from the top shelf.", "맨 위 책장에서 책 한 권이 떨어졌다.", "셸프 → 셀프(self)로 책을 꺼내는 책장")],
      extra: X("library=도서관|book=책|librarian=사서|page=쪽|candle=촛불|dark=어두운|friendly=친절한|lonely=외로운") }),

    T({ id: "switch", title: "Switch Day", ko: "강아지랑 몸이 바뀐 날", genre: "코미디",
      seed: "One morning, you wake up in your dog's body, and your dog is in yours!",
      seedKo: "어느 날 아침 눈을 떠 보니 내가 강아지 몸에, 강아지가 내 몸에 들어가 있어요!",
      screens: ["Mina looks in the mirror in her bedroom in the morning.", "Jun walks a dog on the street.", "A dog sits at a desk in the classroom.", "Mina and Jun run in the park."],
      words: [
        W("switch", "바꾸다; 스위치", "동사·명사", "🔁", "SWITCH", "Mina and her dog switched bodies!", "미나와 강아지의 몸이 바뀌었다!", "스위치 → 딸깍! 스위치를 눌러 바꾸다"),
        W("mirror", "거울", "명사", "🪞", "MIR-ror", "Mina looked in the mirror and screamed.", "미나는 거울을 보고 비명을 질렀다.", "미러 → 자동차 사이드 '미러' = 거울"),
        W("confuse", "헷갈리게 하다", "동사", "😵‍💫", "con-FUSE", "The new rules confused everyone.", "새 규칙은 모두를 헷갈리게 했다.", "컨퓨즈 → 퓨즈(fuse)가 나간 듯 머리가 뒤죽박죽"),
        W("silly", "엉뚱한, 우스운", "형용사", "🤪", "SIL-ly", "That was a silly idea, but it worked!", "엉뚱한 생각이었지만 효과가 있었다!", "실리 → 실실 웃음이 나는 우스운 일"),
        W("pet", "반려동물", "명사", "🐶", "PET", "My pet dog loves sausages.", "우리 반려견은 소시지를 정말 좋아한다.", "펫 → 펫샵 = 반려동물 가게"),
        W("react", "반응하다", "동사", "⚡", "re-ACT", "How did your teacher react?", "너희 선생님은 어떻게 반응하셨어?", "리액트 → 예능의 '리액션(reaction)' = 반응")],
      extra: X("dog=개|tail=꼬리|bark=짖다|bone=뼈다귀|walk=산책시키다|body=몸|owner=주인|sausage=소시지") }),

    T({ id: "snow", title: "Snow Day Rescue", ko: "눈 오는 날 구조 작전", genre: "모험", months: [12, 1, 2],
      seed: "Heavy snow falls on the way home. You and your friends must help a lost little kid get home safely.",
      seedKo: "집에 가는 길에 폭설이 내려요. 친구들과 함께 길 잃은 꼬마를 무사히 집까지 데려다줘야 해요.",
      screens: ["Mina and Jun walk on the street in the snow.", "A little kid cries under a tree in the park in the snow.", "Mina and Jun stay inside the school entrance.", "Everyone watches the sunrise on the rooftop."],
      words: [
        W("freeze", "얼다, 얼어붙다", "동사", "🥶", "FREEZE", "My hands started to freeze.", "내 손이 얼기 시작했다.", "프리즈 → 냉동고(freezer) = 꽁꽁 얼리는 곳"),
        W("blanket", "담요", "명사", "🛏️", "BLAN-ket", "Jun gave the kid his warm blanket.", "준은 꼬마에게 따뜻한 담요를 주었다.", "블랭킷 → 아기가 늘 안고 다니는 애착 담요"),
        W("shelter", "피난처, 대피소", "명사", "🏠", "SHEL-ter", "We found a shelter from the snow.", "우리는 눈을 피할 곳을 찾았다.", "셸터 → shell(껍데기)처럼 감싸 주는 대피소"),
        W("survive", "살아남다, 견뎌 내다", "동사", "💪", "sur-VIVE", "We can survive this cold night together.", "함께라면 이 추운 밤을 견딜 수 있어.", "서바이브 → 서바이벌 게임 = 살아남기"),
        W("temperature", "온도, 기온", "명사", "🌡️", "TEM-per-a-ture", "The temperature dropped below zero.", "기온이 영하로 떨어졌다.", "템퍼러처 → 일기 예보의 온도 숫자"),
        W("path", "길, 오솔길", "명사", "🛤️", "PATH", "The snow covered the path home.", "눈이 집으로 가는 길을 덮었다.", "패스 → 지나가는(pass) 길 = path")],
      extra: X("snow=눈|snowman=눈사람|cold=추운|gloves=장갑|scarf=목도리|lost=길을 잃은|hot chocolate=핫초코|slip=미끄러지다") }),

    T({ id: "recipe", title: "The Secret Recipe Contest", ko: "비밀 레시피 요리 대회", genre: "코미디",
      seed: "Your class joins a cooking contest. But someone has changed your secret recipe!",
      seedKo: "우리 반이 요리 대회에 나가요. 그런데 누군가 우리의 비밀 레시피를 바꿔 놓았어요!",
      screens: ["Mina and Jun cook in the classroom.", "Jun buys sauce at the store counter.", "The judges taste food on the stage.", "Mina and Jun hold a prize on the stage."],
      words: [
        W("recipe", "요리법, 레시피", "명사", "📖", "REC-i-pe", "This recipe is my grandma's secret.", "이 요리법은 우리 할머니의 비밀이다.", "레시피 → 요리 영상의 '레시피' 그대로!"),
        W("contest", "대회", "명사", "🏅", "CON-test", "Our team won the cooking contest.", "우리 팀이 요리 대회에서 우승했다.", "콘테스트 → 노래 대회, 요리 대회 = 콘테스트"),
        W("judge", "심사위원; 판단하다", "명사·동사", "🧑‍⚖️", "JUDGE", "The judges tasted every dish.", "심사위원들이 모든 요리를 맛보았다.", "저지 → 오디션 프로그램의 심사위원"),
        W("mix", "섞다", "동사", "🥣", "MIX", "Mix the eggs and the milk.", "달걀과 우유를 섞어.", "믹스 → 믹서기, 믹스커피 = 섞다"),
        W("pour", "붓다, 따르다", "동사", "🫗", "POUR", "Jun poured too much water into the pot.", "준은 냄비에 물을 너무 많이 부었다.", "포어 → 비가 퍼붓는다 = pour"),
        W("sauce", "소스", "명사", "🥫", "SAUCE", "The sauce was too spicy!", "소스가 너무 매웠다!", "소스 → 떡볶이 소스, 그대로!")],
      extra: X("cook=요리하다|kitchen=부엌|pot=냄비|spicy=매운|sweet=달콤한|delicious=맛있는|taste=맛보다|prize=상") }),

    T({ id: "super", title: "Superpowers for One Day", ko: "하루 동안 초능력", genre: "판타지",
      seed: "You wake up with a superpower, but it only lasts until midnight.",
      seedKo: "아침에 일어나니 초능력이 생겼어요. 하지만 자정까지만 써요.",
      screens: ["Mina flies over the school in the morning.", "Jun lifts a car on the street.", "Mina and Jun help a cat on the rooftop.", "Mina and Jun look at the stars at night."],
      words: [
        W("amaze", "깜짝 놀라게 하다", "동사", "🤩", "a-MAZE", "Mina's power amazed the whole class.", "미나의 능력은 반 전체를 놀라게 했다.", "어메이즈 → 어메이징(amazing)! 놀라워"),
        W("protect", "보호하다, 지키다", "동사", "🛡️", "pro-TECT", "Superheroes protect people.", "슈퍼히어로는 사람들을 지킨다.", "프로텍트 → 휴대폰 보호 필름 '프로텍터'"),
        W("flash", "번쩍임; 번쩍이다", "명사·동사", "⚡", "FLASH", "In a flash, Jun was on the roof.", "눈 깜짝할 사이에 준은 지붕 위에 있었다.", "플래시 → 카메라 플래시가 번쩍!"),
        W("super", "엄청난, 대단한", "형용사·부사", "🦸", "SU-per", "You were super brave today!", "너 오늘 정말 용감했어!", "슈퍼 → 슈퍼맨, 슈퍼 파워 = 엄청난"),
        W("ordinary", "평범한", "형용사", "🙂", "OR-di-nar-y", "At midnight, they became ordinary kids again.", "자정이 되자 그들은 다시 평범한 아이가 되었다.", "오디너리 → 순서(order)대로 흘러가는 평범한 하루"),
        W("responsible", "책임감 있는", "형용사", "🧭", "re-SPON-si-ble", "With great power, you must be responsible.", "큰 힘을 가지면 책임감도 가져야 한다.", "리스판서블 → response(응답)할 수 있는 = 책임지는")],
      extra: X("superhero=슈퍼히어로|fly=날다|strong=힘센|fast=빠른|invisible=투명한|save=구하다|midnight=자정|cape=망토") }),

    T({ id: "graduation", title: "The Last Day of Middle School", ko: "중학교 마지막 날", genre: "학교·감동", months: [12, 1, 2],
      seed: "On the last day of middle school, you find a time capsule your class buried three years ago.",
      seedKo: "중학교 마지막 날, 3년 전에 우리 반이 묻어 둔 타임캡슐을 찾아요.",
      screens: ["Mina and Jun dig under a tree in the park.", "The class looks at old photos in the classroom.", "Mina writes a letter at her desk.", "Everyone stands in front of the school gate."],
      words: [
        W("forever", "영원히", "부사", "♾️", "for-EV-er", "We will be friends forever.", "우리는 영원히 친구일 거야.", "포에버 → for(동안) + ever(언제나) = 영원히"),
        W("photograph", "사진", "명사", "📸", "PHO-to-graph", "We took a photograph in front of the gate.", "우리는 교문 앞에서 사진을 찍었다.", "포토그래프 → 포토(photo) = 빛으로 그린 그림"),
        W("gather", "모이다, 모으다", "동사", "👨‍👩‍👧‍👦", "GATH-er", "The whole class gathered in the classroom.", "반 전체가 교실에 모였다.", "개더 → '같이 더' 모이자!"),
        W("remind", "생각나게 하다", "동사", "💭", "re-MIND", "This photo reminds me of our first day.", "이 사진을 보니 우리의 첫날이 생각난다.", "리마인드 → re(다시) + mind(마음) = 다시 떠올리게 하다"),
        W("moment", "순간", "명사", "⏱️", "MO-ment", "This is the moment we waited for.", "이게 우리가 기다린 순간이야.", "모먼트 → 인생 모먼트 = 기억에 남는 순간"),
        W("diary", "일기", "명사", "📔", "DI-a-ry", "Mina wrote about today in her diary.", "미나는 오늘의 일을 일기에 썼다.", "다이어리 → 새해 다이어리 = 일기장")],
      extra: X("graduation=졸업|time capsule=타임캡슐|letter=편지|classmate=반 친구|goodbye=작별 인사|memory=추억|flower=꽃|tear=눈물") }),

    T({ id: "lunch", title: "Who Stole the School Lunch?", ko: "급식 도둑을 찾아라", genre: "미스터리",
      seed: "Today's lunch is fried chicken, but it disappeared from the school kitchen!",
      seedKo: "오늘 급식 메뉴는 치킨인데, 학교 조리실에서 치킨이 감쪽같이 사라졌어요!",
      screens: ["Mina and Jun stand in the dark hallway.", "Jun looks at footprints on the classroom floor.", "A cat runs on the street with a bag.", "Mina and Jun eat chicken on the rooftop."],
      words: [
        W("thief", "도둑", "명사", "🦹", "THIEF", "The thief left a small footprint.", "도둑은 작은 발자국을 남겼다.", "띠프 → th는 혀를 살짝 물고! 몰래 가져가는 도둑"),
        W("suspect", "의심하다", "동사", "🤨", "sus-PECT", "I suspect the new student.", "나는 새로 온 학생을 의심해.", "서스펙트 → 서스펜스 영화 속 의심"),
        W("evidence", "증거", "명사", "🧾", "EV-i-dence", "We need more evidence.", "우리는 증거가 더 필요해.", "에비던스 → 눈으로(vid) 직접 본 것 = 증거"),
        W("steal", "훔치다", "동사", "🫳", "STEAL", "Who would steal our lunch?", "누가 우리 점심을 훔치겠어?", "스틸 → 야구의 도루(steal) = 몰래 훔치기"),
        W("detect", "알아내다, 탐지하다", "동사", "🕵️", "de-TECT", "Mina detected a smell of chicken.", "미나는 치킨 냄새를 알아챘다.", "디텍트 → 디텍티브(detective) = 알아내는 탐정"),
        W("investigate", "조사하다", "동사", "🔎", "in-VES-ti-gate", "Let's investigate the kitchen.", "조리실을 조사해 보자.", "인베스티게이트 → 조끼(vest) 주머니 안(in)까지 샅샅이 조사")],
      extra: X("lunch=점심|chicken=치킨|kitchen=조리실|cook=조리사|footprint=발자국|smell=냄새|hungry=배고픈|bag=가방") }),

    T({ id: "spacecamp", title: "Space Camp Emergency", ko: "우주 캠프 비상사태", genre: "SF",
      seed: "Your class visits a space camp. Suddenly, the practice rocket takes off for real!",
      seedKo: "우리 반이 우주 캠프에 갔어요. 그런데 연습용 로켓이 진짜로 날아올랐어요!",
      screens: ["Mina and Jun sit in a rocket.", "The rocket flies in space near a planet.", "Jun repairs the engine of the spaceship.", "The rocket lands on the beach at sunrise."],
      words: [
        W("rocket", "로켓", "명사", "🚀", "ROCK-et", "The rocket shook and flew up.", "로켓이 흔들리더니 날아올랐다.", "로켓 → 로켓 배송처럼 슝!"),
        W("engine", "엔진", "명사", "⚙️", "EN-gine", "The engine made a loud noise.", "엔진이 큰 소리를 냈다.", "엔진 → 자동차 엔진, 그대로!"),
        W("crash", "충돌하다, 추락하다", "동사", "💥", "CRASH", "Watch out! We're going to crash!", "조심해! 우리 부딪히겠어!", "크래시 → 쾅! = 충돌"),
        W("panic", "당황, 공황", "명사·동사", "😰", "PAN-ic", "Don't panic. Stay calm.", "당황하지 마. 침착해.", "패닉 → 머릿속이 하얘지는 패닉 상태"),
        W("alarm", "경보, 알람", "명사", "🚨", "a-LARM", "The alarm started to ring.", "경보가 울리기 시작했다.", "알람 → 아침 알람 = 울리는 경보"),
        W("captain", "선장, 대장", "명사", "🧑‍✈️", "CAP-tain", "Mina became the captain of the rocket.", "미나가 로켓의 대장이 되었다.", "캡틴 → 캡틴 아메리카 = 대장")],
      extra: X("astronaut=우주 비행사|space=우주|moon=달|star=별|button=버튼|oxygen=산소|earth=지구|landing=착륙") }),

    T({ id: "plant", title: "The Talking Plant", ko: "말하는 화분", genre: "환경",
      seed: "The plant in your classroom suddenly talks. It says the earth needs your help.",
      seedKo: "교실 화분이 갑자기 말을 해요. 지구가 우리의 도움을 필요로 한대요.",
      screens: ["A small plant sits on a desk in the classroom.", "Mina and Jun pick up trash in the park.", "Jun plants a seed in the garden.", "Flowers bloom in the park in the morning."],
      words: [
        W("plant", "식물; 심다", "명사·동사", "🪴", "PLANT", "Let's plant a tree together.", "함께 나무를 심자.", "플랜트 → 식물로 꾸미는 '플랜테리어'"),
        W("seed", "씨앗", "명사", "🌱", "SEED", "One small seed can grow into a big tree.", "작은 씨앗 하나가 큰 나무로 자랄 수 있다.", "시드 → 모든 것의 시작점, 씨앗"),
        W("soil", "흙, 토양", "명사", "🟫", "SOIL", "Put the seed into the soil.", "씨앗을 흙 속에 넣어.", "소일 → 흙 속에 씨앗을 쏘옥!"),
        W("pollute", "오염시키다", "동사", "🏭", "pol-LUTE", "Plastic pollutes the ocean.", "플라스틱은 바다를 오염시킨다.", "폴루트 → 뉴스에 나오는 pollution(오염)"),
        W("waste", "쓰레기; 낭비하다", "명사·동사", "🗑️", "WASTE", "Don't waste water.", "물을 낭비하지 마.", "웨이스트 → 제로 웨이스트 = 쓰레기 없애기"),
        W("bloom", "꽃이 피다", "동사", "🌸", "BLOOM", "The flowers will bloom in spring.", "꽃들은 봄에 필 것이다.", "블룸 → 봉오리가 불룩 부풀어 꽃이 펴요")],
      extra: X("earth=지구|trash=쓰레기|recycle=재활용하다|plastic=플라스틱|water=물을 주다|leaf=잎|green=초록의|garden=정원") }),

    T({ id: "audition", title: "The Big Audition", ko: "두근두근 오디션", genre: "진로·무대",
      seed: "Your band gets a chance to play at a big concert. But first, you must pass the audition.",
      seedKo: "우리 밴드가 큰 콘서트에 설 기회를 얻었어요. 그런데 먼저 오디션을 통과해야 해요.",
      screens: ["Mina and Jun practice in the classroom after school.", "The band plays a song on the stage.", "The audience cheers at the concert.", "Mina and Jun walk on the street at night."],
      words: [
        W("band", "밴드, 악단", "명사", "🎸", "BAND", "Our band has four members.", "우리 밴드는 멤버가 넷이다.", "밴드 → 록 밴드, 그대로!"),
        W("concert", "콘서트, 음악회", "명사", "🎶", "CON-cert", "The concert starts at seven.", "콘서트는 7시에 시작한다.", "콘서트 → 콘서트장, 그대로!"),
        W("tune", "곡조, 선율", "명사", "🎵", "TUNE", "Jun hummed a happy tune.", "준은 신나는 곡조를 흥얼거렸다.", "튠 → 기타 튜닝(tuning) = 음을 맞추기"),
        W("studio", "스튜디오, 작업실", "명사", "🎙️", "STU-di-o", "We recorded our song in a studio.", "우리는 스튜디오에서 노래를 녹음했다.", "스튜디오 → 사진관 스튜디오, 그대로!"),
        W("brilliant", "훌륭한, 눈부신", "형용사", "🌟", "BRIL-liant", "That was a brilliant song!", "정말 훌륭한 노래였어!", "브릴리언트 → 다이아몬드처럼 눈부신"),
        W("crowd", "군중, 관중", "명사", "👥", "CROWD", "The crowd shouted our name.", "관중이 우리 이름을 외쳤다.", "크라우드 → 크라우드 펀딩 = 많은 사람이 함께")],
      extra: X("audition=오디션|singer=가수|drum=드럼|guitar=기타|nervous=긴장한|dream=꿈|fan=팬|microphone=마이크") }),

    T({ id: "dino", title: "A Dinosaur in the Schoolyard", ko: "운동장에 공룡이 나타났다", genre: "모험",
      seed: "One morning, a baby dinosaur appears in the schoolyard. It is lost and hungry.",
      seedKo: "어느 아침, 운동장에 아기 공룡이 나타났어요. 길을 잃고 배가 고파 보여요.",
      screens: ["A baby dinosaur stands in front of the school gate.", "Mina gives the dinosaur an apple in the park.", "The dinosaur chases Jun on the street.", "Mina and Jun wave goodbye at sunrise."],
      words: [
        W("giant", "거대한; 거인", "형용사·명사", "🦕", "GI-ant", "A giant footprint was on the ground.", "땅에 거대한 발자국이 있었다.", "자이언트 → 자이언트 판다 = 거대한"),
        W("enormous", "엄청나게 큰", "형용사", "🐘", "e-NOR-mous", "The dinosaur had enormous feet.", "공룡의 발은 엄청나게 컸다.", "이노머스 → 보통(norm) 크기를 훨씬 넘는"),
        W("species", "종(생물의 종류)", "명사", "🧬", "SPE-cies", "This species lived long ago.", "이 종은 아주 오래전에 살았다.", "스피시즈 → 특별한(special) 생물 무리 = 종"),
        W("chase", "뒤쫓다", "동사", "🏃", "CHASE", "The dinosaur chased a butterfly.", "공룡이 나비를 뒤쫓았다.", "체이스 → 영화의 추격전 '카 체이스'"),
        W("gentle", "온순한, 다정한", "형용사", "🕊️", "GEN-tle", "Don't be scared. It is very gentle.", "무서워하지 마. 아주 순해.", "젠틀 → 젠틀맨 = 부드럽고 다정한 사람"),
        W("hunger", "배고픔", "명사", "🍖", "HUN-ger", "The baby dinosaur cried from hunger.", "아기 공룡은 배가 고파서 울었다.", "헝거 → hungry(배고픈)의 명사 = 배고픔")],
      extra: X("dinosaur=공룡|egg=알|tail=꼬리|roar=으르렁거리다|schoolyard=운동장|apple=사과|mom=엄마|zoo=동물원") }),

    T({ id: "weather", title: "The Weather Machine", ko: "날씨를 바꾸는 기계", genre: "SF·환경",
      seed: "Jun invents a machine that can change the weather. Then it starts to go crazy.",
      seedKo: "준이 날씨를 바꾸는 기계를 발명했어요. 그런데 기계가 제멋대로 움직이기 시작해요.",
      screens: ["Jun builds a machine in the classroom lab.", "Snow falls on the street in summer.", "Big waves hit the beach.", "A rainbow appears over the school in the morning."],
      words: [
        W("climate", "기후", "명사", "🌍", "CLI-mate", "Our climate is getting warmer.", "우리 기후는 점점 따뜻해지고 있다.", "클라이밋 → 뉴스의 '기후 위기(climate crisis)'"),
        W("flood", "홍수", "명사", "🌊", "FLOOD", "Heavy rain caused a flood.", "폭우가 홍수를 일으켰다.", "플러드 → 물이 넘쳐흐르는 홍수"),
        W("fog", "안개", "명사", "🌫️", "FOG", "We couldn't see anything in the fog.", "안개 속에서 아무것도 보이지 않았다.", "포그 → 포근하게 덮은 하얀 안개"),
        W("experiment", "실험", "명사", "🧪", "ex-PER-i-ment", "The experiment went wrong.", "실험이 잘못되었다.", "익스페리먼트 → experience(경험)의 형제, 직접 해 보는 실험"),
        W("wave", "파도; 손을 흔들다", "명사·동사", "🌊", "WAVE", "A huge wave hit the beach.", "거대한 파도가 해변을 덮쳤다.", "웨이브 → 응원석 파도타기 '웨이브'"),
        W("sudden", "갑작스러운", "형용사", "❗", "SUD-den", "There was a sudden change in the sky.", "하늘에 갑작스러운 변화가 생겼다.", "서든 → 게임 '서든 데스' = 갑자기 끝남")],
      extra: X("weather=날씨|rain=비|snow=눈|sunny=맑은|storm=폭풍|machine=기계|button=버튼|summer=여름") }),

    T({ id: "treasure", title: "Grandma's Treasure Map", ko: "할머니의 보물 지도", genre: "모험",
      seed: "In your grandma's old box, you find a treasure map of your own town.",
      seedKo: "할머니의 낡은 상자에서 우리 동네 보물 지도를 찾았어요.",
      screens: ["Mina opens an old box in her bedroom.", "Mina and Jun read the map on the street.", "Jun digs under a tree in the park.", "Mina and Jun open a chest on the beach."],
      words: [
        W("hint", "힌트, 암시", "명사", "💡", "HINT", "Grandma's letter gave us a hint.", "할머니의 편지가 우리에게 힌트를 주었다.", "힌트 → 퀴즈 힌트, 그대로!"),
        W("trace", "흔적; 따라가다", "명사·동사", "👣", "TRACE", "We followed the trace of footprints.", "우리는 발자국 흔적을 따라갔다.", "트레이스 → 그림 따라 그리기 '트레이싱'"),
        W("dig", "파다", "동사", "⛏️", "DIG", "Jun began to dig under the old tree.", "준은 오래된 나무 아래를 파기 시작했다.", "디그 → 삽으로 '디그디그' 파요"),
        W("bury", "묻다", "동사", "🪏", "BUR-y", "Grandma buried the box long ago.", "할머니는 오래전에 상자를 묻었다.", "베리 → 발음이 berry(딸기류)와 같아요, 땅에 묻다"),
        W("coin", "동전", "명사", "🪙", "COIN", "The box was full of old coins.", "상자에는 오래된 동전이 가득했다.", "코인 → 코인 노래방의 코인 = 동전"),
        W("chest", "상자; 가슴", "명사", "🧰", "CHEST", "They found a wooden chest.", "그들은 나무 상자를 찾았다.", "체스트 → 게임 속 보물 상자")],
      extra: X("treasure=보물|map=지도|grandma=할머니|shovel=삽|old=오래된|gold=금|town=동네|letter=편지") }),

    T({ id: "camping", title: "Camping Under the Stars", ko: "별빛 캠핑", genre: "모험", months: [4, 5, 6, 7, 8, 9, 10],
      seed: "Your class goes camping in the mountains. At night, a strange light falls from the sky.",
      seedKo: "우리 반이 산으로 캠핑을 갔어요. 밤이 되자 하늘에서 이상한 빛이 떨어져요.",
      screens: ["Mina and Jun walk along a stream in the park.", "The class sits around a fire under a tree at night.", "A strange light falls from the sky.", "Mina and Jun watch the sunrise in the valley."],
      words: [
        W("valley", "계곡, 골짜기", "명사", "🏞️", "VAL-ley", "Our tent was in a quiet valley.", "우리 텐트는 조용한 계곡에 있었다.", "밸리 → 실리콘밸리 = 산 사이 골짜기"),
        W("stream", "개울, 시내", "명사", "💧", "STREAM", "We washed our faces in the stream.", "우리는 개울에서 세수를 했다.", "스트림 → 스트리밍처럼 끊임없이 흐르는 개울"),
        W("wild", "야생의", "형용사", "🦌", "WILD", "We saw a wild deer near the tent.", "텐트 근처에서 야생 사슴을 보았다.", "와일드 → 와일드한 야생 동물"),
        W("shade", "그늘", "명사", "🌳", "SHADE", "Let's rest in the shade of the tree.", "나무 그늘에서 쉬자.", "셰이드 → 햇빛을 가리는 '선셰이드' = 그늘"),
        W("bug", "벌레", "명사", "🐛", "BUG", "A bug crawled into Jun's shoe.", "벌레 한 마리가 준의 신발 속으로 기어들어 갔다.", "버그 → 컴퓨터 버그도 원래 벌레"),
        W("branch", "나뭇가지", "명사", "🌿", "BRANCH", "Mina picked up a long branch.", "미나는 긴 나뭇가지를 주웠다.", "브랜치 → 은행 지점(branch)도 본점에서 뻗은 가지")],
      extra: X("tent=텐트|campfire=모닥불|mountain=산|star=별|marshmallow=마시멜로|flashlight=손전등|owl=부엉이|sleeping bag=침낭") }),

    T({ id: "sports", title: "Sports Day Comeback", ko: "체육대회 역전승", genre: "학교", months: [3, 4, 5, 9, 10],
      seed: "On sports day, your class is losing badly. You have one last chance to win.",
      seedKo: "체육대회 날, 우리 반이 크게 지고 있어요. 이길 마지막 기회가 한 번 남았어요.",
      screens: ["The class runs in front of the school.", "Jun kicks a ball in the park.", "Mina and Jun cheer on the stage.", "The class holds a prize in front of the school gate."],
      words: [
        W("champion", "우승자, 챔피언", "명사", "🏆", "CHAM-pi-on", "Our class became the champion!", "우리 반이 우승했다!", "챔피언 → 챔피언스 리그 = 우승자"),
        W("match", "경기, 시합", "명사", "⚽", "MATCH", "The final match was very close.", "결승전은 아주 팽팽했다.", "매치 → 축구 매치 = 경기"),
        W("league", "리그, 연맹", "명사", "🗂️", "LEAGUE", "We joined the school soccer league.", "우리는 학교 축구 리그에 참가했다.", "리그 → 프로야구 리그, 그대로!"),
        W("coach", "코치", "명사", "📣", "COACH", "Our coach said, \"Don't give up!\"", "우리 코치는 \"포기하지 마!\"라고 말했다.", "코치 → 운동 코치, 그대로!"),
        W("struggle", "애쓰다, 버둥거리다", "동사", "😤", "STRUG-gle", "Jun struggled to run faster.", "준은 더 빨리 달리려고 애썼다.", "스트러글 → 끈에 묶인 듯 버둥버둥 애쓰다"),
        W("cheer", "응원하다, 환호하다", "동사", "🙌", "CHEER", "Everyone cheered for our team.", "모두가 우리 팀을 응원했다.", "치어 → 치어리더 = 응원하는 사람")],
      extra: X("sports day=체육대회|relay=이어달리기|ball=공|goal=골|team=팀|win=이기다|lose=지다|medal=메달") }),

    T({ id: "tourist", title: "Helping a Lost Tourist", ko: "길 잃은 관광객 돕기", genre: "여행·소통",
      seed: "After school, you meet a tourist named Emma. She is lost, and she only speaks English.",
      seedKo: "방과 후 엠마라는 관광객을 만났어요. 길을 잃었는데 영어만 할 줄 알아요.",
      characters: withChars({ Emma: { gender: "f", look: "a tourist girl with a red backpack", color: "#ff9b9b" } }),
      screens: ["Emma looks at a map on the street.", "Mina and Jun meet Emma near the school gate.", "Emma and Mina visit a palace.", "Emma waves goodbye on the street at night."],
      words: [
        W("tour", "관광, 여행", "명사", "🧳", "TOUR", "Emma is on a tour of Korea.", "엠마는 한국을 여행하는 중이다.", "투어 → 시티 투어 버스 = 관광"),
        W("guide", "안내하다; 안내원", "동사·명사", "🧭", "GUIDE", "Mina guided Emma to the palace.", "미나는 엠마를 궁궐까지 안내했다.", "가이드 → 여행 가이드 = 안내원"),
        W("route", "길, 경로", "명사", "🗺️", "ROUTE", "This is the fastest route to the station.", "이게 역까지 가는 가장 빠른 길이야.", "루트 → 등산 루트 = 가는 길"),
        W("station", "역, 정거장", "명사", "🚉", "STA-tion", "The subway station is near here.", "지하철역은 이 근처에 있어.", "스테이션 → 서울 스테이션 = 서울역"),
        W("foreign", "외국의", "형용사", "🌐", "FOR-eign", "Emma is from a foreign country.", "엠마는 외국에서 왔다.", "포린 → g는 소리 안 나요! '포-린' 외국의"),
        W("polite", "공손한, 예의 바른", "형용사", "🙇", "po-LITE", "Jun was very polite to Emma.", "준은 엠마에게 아주 예의 바르게 대했다.", "폴라이트 → 뒤 음절 LITE를 세게, 예의 바른")],
      extra: X("tourist=관광객|map=지도|subway=지하철|ticket=표|left=왼쪽|right=오른쪽|straight=똑바로|Excuse me=실례합니다") }),

    T({ id: "youtuber", title: "One Day as a YouTuber", ko: "하루 크리에이터", genre: "진로·미디어",
      seed: "Your class makes a video for the school channel. Then it suddenly becomes famous!",
      seedKo: "우리 반이 학교 채널에 올릴 영상을 찍었는데, 갑자기 엄청난 인기를 끌어요!",
      screens: ["Mina records a video with her phone in the classroom.", "Jun edits the video in his bedroom.", "Many people watch the video on the street.", "Mina and Jun smile on the stage."],
      words: [
        W("channel", "채널", "명사", "📺", "CHAN-nel", "Please subscribe to our channel!", "우리 채널을 구독해 주세요!", "채널 → 유튜브 채널, 그대로!"),
        W("record", "녹화하다, 녹음하다", "동사", "🎥", "re-CORD", "Let's record a video after school.", "방과 후에 영상을 찍자.", "레코드 → 녹화 버튼 '● REC' = record"),
        W("edit", "편집하다", "동사", "✂️", "ED-it", "Jun edited the video all night.", "준은 밤새 영상을 편집했다.", "에디트 → 영상 에디터 = 편집하는 사람"),
        W("screen", "화면", "명사", "🖥️", "SCREEN", "Our faces were on the big screen.", "우리 얼굴이 큰 화면에 나왔다.", "스크린 → 영화관 스크린 = 화면"),
        W("popular", "인기 있는", "형용사", "🔥", "POP-u-lar", "Our video became very popular.", "우리 영상은 아주 인기를 끌었다.", "파퓰러 → 팝(POP)송처럼 인기 있는"),
        W("comment", "댓글, 의견", "명사", "💬", "COM-ment", "Mina read every comment.", "미나는 댓글을 하나하나 다 읽었다.", "코멘트 → '노 코멘트' = 할 말 없음")],
      extra: X("video=영상|YouTuber=유튜버|subscribe=구독하다|like=좋아요|camera=카메라|upload=올리다|famous=유명한|fan=팬") }),

    T({ id: "wish", title: "Three Wishes", ko: "세 가지 소원", genre: "판타지",
      seed: "You find an old lamp in the classroom. When you rub it, a genie gives you three wishes.",
      seedKo: "교실에서 오래된 램프를 찾았어요. 문지르자 요정이 나타나 소원 세 가지를 들어준대요.",
      screens: ["Mina finds an old lamp under a desk in the classroom.", "Magic smoke comes out of the lamp in the classroom.", "Jun flies over the street.", "Mina and Jun smile on the rooftop at sunrise."],
      words: [
        W("lamp", "램프, 등", "명사", "🪔", "LAMP", "Mina rubbed the old lamp.", "미나는 오래된 램프를 문질렀다.", "램프 → 알라딘의 요술 램프"),
        W("grant", "(소원을) 들어주다", "동사", "✅", "GRANT", "The genie will grant you three wishes.", "요정이 소원 세 가지를 들어줄 거야.", "그랜트 → 그랜드(grand)하게 통 크게 들어주다"),
        W("desire", "바람, 욕구", "명사", "💖", "de-SIRE", "Jun had a desire to fly.", "준은 하늘을 날고 싶은 바람이 있었다.", "디자이어 → 갖고 싶은 마음이 계속 이어지는 바람"),
        W("wise", "현명한", "형용사", "🦉", "WISE", "Mina made a wise choice.", "미나는 현명한 선택을 했다.", "와이즈 → 부엉이처럼 지혜로운"),
        W("wonder", "궁금해하다; 놀라움", "동사·명사", "🤔", "WON-der", "I wonder what the third wish is.", "세 번째 소원이 뭘지 궁금해.", "원더 → 원더랜드 = 신기하고 궁금한 나라"),
        W("fortune", "운, 재산", "명사", "🍀", "FOR-tune", "Good fortune came to our class.", "우리 반에 행운이 찾아왔다.", "포춘 → 포춘쿠키 = 행운 과자")],
      extra: X("wish=소원|genie=요정(지니)|rub=문지르다|smoke=연기|rich=부자인|happy=행복한|careful=조심하는|regret=후회하다") }),

    T({ id: "animals", title: "The Animal Rescue Team", ko: "동물 구조대", genre: "환경·봉사",
      seed: "Your class volunteers at an animal shelter. One day, a hurt bird arrives.",
      seedKo: "우리 반이 동물 보호소에서 봉사를 해요. 어느 날 다친 새 한 마리가 들어와요.",
      screens: ["Mina and Jun feed a puppy in the park.", "A small bird sits in a nest in a tree.", "Jun carries a cage on the street.", "The bird flies over the park in the morning."],
      words: [
        W("volunteer", "자원봉사하다; 자원봉사자", "동사·명사", "🙋", "vol-un-TEER", "We volunteer at the shelter every Saturday.", "우리는 매주 토요일 보호소에서 봉사한다.", "발런티어 → 마지막 TEER를 세게! 자원봉사"),
        W("injure", "다치게 하다", "동사", "🩹", "IN-jure", "The bird injured its wing.", "새가 날개를 다쳤다.", "인저 → 축구의 인저리 타임 = 다친 시간"),
        W("feed", "먹이를 주다", "동사", "🍼", "FEED", "Mina feeds the puppies every morning.", "미나는 매일 아침 강아지들에게 먹이를 준다.", "피드 → food(음식)를 주다 = feed"),
        W("nest", "둥지", "명사", "🪺", "NEST", "We found a nest with three eggs.", "우리는 알이 세 개 있는 둥지를 찾았다.", "네스트 → 그물(net)처럼 엮어 만든 둥지"),
        W("cage", "우리, 새장", "명사", "🐦", "CAGE", "The bird was safe in the cage.", "새는 새장 안에서 안전했다.", "케이지 → 반려동물 케이지 = 우리"),
        W("recover", "회복하다", "동사", "💚", "re-COV-er", "The bird recovered in two weeks.", "새는 2주 만에 회복했다.", "리커버 → re(다시) 건강을 되찾다")],
      extra: X("animal=동물|shelter=보호소|puppy=강아지|bird=새|wing=날개|vet=수의사|hurt=다친|adopt=입양하다") }),

    T({ id: "underwater", title: "The Underwater Kingdom", ko: "바닷속 왕국", genre: "판타지",
      seed: "On a school trip to the sea, you fall into the water and find a kingdom under the ocean.",
      seedKo: "바다로 수학여행을 갔다가 물에 빠졌는데, 바닷속에서 왕국을 발견해요.",
      screens: ["Mina and Jun stand on the beach.", "A whale swims in the deep ocean.", "Mina and Jun meet a queen in an underwater palace.", "Mina and Jun come back to the beach at sunrise."],
      words: [
        W("whale", "고래", "명사", "🐋", "WHALE", "A huge whale swam next to us.", "거대한 고래가 우리 옆에서 헤엄쳤다.", "웨일 → 바다를 울리는 고래 노래"),
        W("dolphin", "돌고래", "명사", "🐬", "DOL-phin", "A dolphin showed us the way.", "돌고래가 우리에게 길을 알려 주었다.", "돌핀 → 빙글빙글 돌며 노는 돌고래"),
        W("shell", "조개껍데기", "명사", "🐚", "SHELL", "Mina found a shiny shell.", "미나는 반짝이는 조개껍데기를 찾았다.", "셸 → 단단한 껍데기 = shell"),
        W("dive", "뛰어들다, 잠수하다", "동사", "🤿", "DIVE", "Jun dived into the water.", "준은 물속으로 뛰어들었다.", "다이브 → 다이빙 = 뛰어들기"),
        W("tide", "조수(밀물과 썰물)", "명사", "🌊", "TIDE", "The tide came in quickly.", "밀물이 빠르게 밀려왔다.", "타이드 → 시간(time)처럼 매일 오가는 밀물과 썰물"),
        W("shore", "해안, 물가", "명사", "🏖️", "SHORE", "We swam back to the shore.", "우리는 헤엄쳐서 해안으로 돌아왔다.", "쇼어 → seashore = 바다가 끝나는 해안")],
      extra: X("sea=바다|fish=물고기|turtle=거북|swim=수영하다|crown=왕관|queen=여왕|bubble=거품|deep=깊은") }),

    /* ---- 2026-11 학생 설문 반영: 대중문화·여행 주제 ---- */
    T({ id: "airport", title: "The Suitcase Mix-up", ko: "공항에서 바뀐 가방", genre: "여행",
      seed: "At the airport, Mina picks up the wrong suitcase. Inside, there is a strange map and a note.",
      seedKo: "공항에서 미나가 다른 사람 가방을 들고 왔어요. 안에는 이상한 지도와 쪽지가 들어 있어요.",
      screens: ["Mina and Jun wait at the airport.", "A plane takes off from the airport.", "Mina opens the strange bag in her room.", "Mina and Jun walk on the street in a foreign town."],
      words: [
        W("airport", "공항", "명사", "🛫", "AIR-port", "We arrived at the airport early.", "우리는 공항에 일찍 도착했다.", "에어포트 → 에어(air, 하늘) + 포트(port, 항구) = 하늘의 항구"),
        W("flight", "비행, 항공편", "명사", "✈️", "FLIGHT", "Our flight leaves at nine.", "우리 비행기는 9시에 떠난다.", "플라이트 → fly(날다)에서 나온 말 = 비행"),
        W("gate", "탑승구, 문", "명사", "🚪", "GATE", "Please go to gate seven now.", "지금 7번 탑승구로 가 주세요.", "게이트 → 공항 '게이트' = 비행기 타는 문"),
        W("delay", "지연시키다; 지연", "동사·명사", "⏰", "de-LAY", "The flight was delayed for two hours.", "비행기가 두 시간 늦어졌다.", "딜레이 → 게임 '딜레이' = 늦어짐"),
        W("announce", "알리다, 방송하다", "동사", "📢", "an-NOUNCE", "A voice announced a gate change.", "안내 방송이 탑승구 변경을 알렸다.", "어나운스 → 아나운서(announcer) = 알리는 사람"),
        W("label", "꼬리표, 이름표", "명사", "🏷️", "LA-bel", "The label on the bag had a strange name.", "가방 꼬리표에 이상한 이름이 적혀 있었다.", "라벨 → 옷에 붙은 라벨 = 이름표")],
      extra: X("passport=여권|suitcase=여행 가방|ticket=표|plane=비행기|pilot=조종사|travel=여행하다|lost=잃어버린|seat=좌석") }),

    T({ id: "market", title: "The Magic Night Market", ko: "마법 야시장", genre: "여행·음식",
      seed: "On a trip abroad, your class visits a night market. Every snack you eat gives you a strange power!",
      seedKo: "해외 여행 중에 우리 반이 야시장에 갔어요. 그런데 간식을 먹을 때마다 이상한 능력이 생겨요!",
      screens: ["Mina and Jun walk on the street at night.", "A man stands at the counter of a food shop.", "Jun eats a snack in the park.", "Mina flies over the town at night."],
      words: [
        W("local", "그 지역의, 현지의", "형용사", "📍", "LO-cal", "We tried a local snack.", "우리는 현지 간식을 먹어 봤다.", "로컬 → 로컬 푸드 = 그 지역에서 난 음식"),
        W("snack", "간식", "명사", "🍡", "SNACK", "This snack is very popular here.", "이 간식은 여기서 아주 인기가 많다.", "스낵 → 스낵 코너 = 간식 파는 곳"),
        W("menu", "메뉴, 차림표", "명사", "📜", "MEN-u", "The menu was in English and Thai.", "메뉴판은 영어와 태국어로 쓰여 있었다.", "메뉴 → 그대로! 강세는 앞 MEN"),
        W("order", "주문하다; 주문", "동사·명사", "🛎️", "OR-der", "Jun ordered two bowls of noodles.", "준은 국수 두 그릇을 주문했다.", "오더 → '주문 오더 들어갑니다!'"),
        W("sour", "신, 시큼한", "형용사", "🍋", "SOUR", "The fruit was very sour.", "그 과일은 아주 시었다.", "사워 → 사워 캔디 = 시큼한 사탕"),
        W("sample", "시식, 견본", "명사", "🥢", "SAM-ple", "The man gave us a free sample.", "아저씨가 공짜로 맛보기를 줬다.", "샘플 → 화장품 샘플 = 맛보기")],
      extra: X("market=시장|noodle=국수|spicy=매운|delicious=맛있는|taste=맛보다|price=가격|night=밤|power=힘") }),

    T({ id: "movie", title: "Inside the Movie", ko: "영화 속으로", genre: "대중문화·영화",
      seed: "At the cinema, Mina and Jun get pulled into the movie. They must finish the story to get out!",
      seedKo: "영화관에서 미나와 준이 영화 속으로 빨려 들어가요. 이야기를 끝내야 밖으로 나올 수 있어요!",
      screens: ["Mina and Jun sit in the cinema with popcorn.", "Mina and Jun fall into the movie screen.", "A hero runs on the street at night.", "Mina and Jun come back to their seats in the cinema."],
      words: [
        W("cinema", "영화관", "명사", "🎬", "CIN-e-ma", "We watched a movie at the cinema.", "우리는 영화관에서 영화를 봤다.", "시네마 → 'OO 시네마' 간판 = 영화관"),
        W("scene", "장면", "명사", "🎞️", "SCENE", "This is my favorite scene.", "이게 내가 제일 좋아하는 장면이야.", "씬 → 명장면 = '명씬'"),
        W("character", "등장인물, 캐릭터", "명사", "🦸", "CHAR-ac-ter", "Jun became a character in the movie.", "준은 영화 속 등장인물이 되었다.", "캐릭터 → 게임 캐릭터 = 등장인물"),
        W("role", "역할, 배역", "명사", "🎭", "ROLE", "Mina got the role of the hero.", "미나는 주인공 역할을 맡았다.", "롤 → 롤플레잉(role-playing) = 역할 놀이"),
        W("comedy", "코미디, 희극", "명사", "😂", "COM-e-dy", "It was a comedy, so everyone laughed.", "코미디라서 모두 웃었다.", "코미디 → 개그 코미디 = 웃기는 이야기"),
        W("title", "제목", "명사", "🔤", "TI-tle", "The title of the movie was Run.", "영화 제목은 '달려'였다.", "타이틀 → 타이틀곡 = 앨범의 대표 제목 곡")],
      extra: X("movie=영화|actor=배우|hero=주인공, 영웅|popcorn=팝콘|camera=카메라|ending=결말|exit=출구|screen=화면") }),

    T({ id: "kpop", title: "K-pop Concert Rescue", ko: "케이팝 콘서트 구출 작전", genre: "대중문화·음악",
      seed: "Your favorite K-pop group comes to your town. But one hour before the show, the leader goes missing!",
      seedKo: "제일 좋아하는 케이팝 그룹이 우리 동네에 와요. 그런데 공연 한 시간 전에 리더가 사라졌어요!",
      screens: ["Many fans wait in front of the concert stage.", "The singers practice a dance on the stage.", "Mina and Jun run down the stairs.", "The crowd cheers at the concert."],
      words: [
        W("award", "상", "명사", "🏆", "a-WARD", "The group won a big award.", "그 그룹은 큰 상을 받았다.", "어워드 → 'OO 어워즈' 시상식 = 상"),
        W("release", "(곡을) 발표하다", "동사", "💿", "re-LEASE", "They released a new song today.", "그들은 오늘 새 노래를 발표했다.", "릴리스 → 신곡 '릴리즈' = 세상에 내놓다"),
        W("fashion", "패션, 유행", "명사", "👗", "FASH-ion", "Mina loves K-pop fashion.", "미나는 케이팝 패션을 정말 좋아한다.", "패션 → 패션쇼, 그대로!"),
        W("fantastic", "환상적인, 멋진", "형용사", "✨", "fan-TAS-tic", "The show was fantastic!", "공연은 환상적이었어!", "판타스틱 → 판타지(fantasy)처럼 멋진"),
        W("entertain", "즐겁게 하다", "동사", "🎤", "en-ter-TAIN", "The singers entertained the crowd.", "가수들이 관중을 즐겁게 했다.", "엔터테인 → 엔터테인먼트 회사 = 즐거움을 주는 회사"),
        W("shout", "외치다", "동사", "📣", "SHOUT", "The fans shouted the leader's name.", "팬들이 리더의 이름을 외쳤다.", "샤우트 → 노래방 '샤우팅' = 크게 외치기")],
      extra: X("K-pop=케이팝|idol=아이돌|fan=팬|dance=춤추다|singer=가수|leader=리더|voice=목소리|ticket=표") }),

    T({ id: "webtoon", title: "My Webtoon Came to Life", ko: "웹툰 캐릭터가 튀어나왔다", genre: "대중문화·만화",
      seed: "Jun draws a webtoon on his tablet. One night, his tiny hero jumps out of the screen!",
      seedKo: "준이 태블릿으로 웹툰을 그려요. 어느 날 밤, 웹툰 속 작은 주인공이 화면 밖으로 튀어나와요!",
      screens: ["Jun draws a webtoon in his bedroom.", "A tiny hero stands on the desk in the bedroom.", "The tiny hero runs on the desk in the classroom.", "Mina and Jun look for the hero in the park."],
      words: [
        W("create", "만들다, 창작하다", "동사", "🎨", "cre-ATE", "Jun created a new character.", "준은 새 캐릭터를 만들었다.", "크리에이트 → 크리에이터 = 만드는 사람"),
        W("series", "시리즈, 연재물", "명사", "📚", "SE-ries", "His webtoon series has ten parts.", "그의 웹툰 시리즈는 10화까지 있다.", "시리즈 → 영화 시리즈 = 이어지는 이야기"),
        W("click", "클릭하다, 누르다", "동사", "🖱️", "CLICK", "Mina clicked the next button.", "미나는 다음 버튼을 눌렀다.", "클릭 → 마우스 딸깍 = 누르기"),
        W("frame", "칸, 틀", "명사", "🖼️", "FRAME", "The hero jumped out of the last frame.", "주인공이 마지막 칸에서 뛰쳐나왔다.", "프레임 → 사진 액자 프레임 = 틀"),
        W("copy", "따라 하다, 복사하다", "동사", "📄", "COP-y", "The hero copied everything Jun did.", "주인공은 준이 하는 걸 다 따라 했다.", "카피 → 복사기 '카피' = 똑같이 만들기"),
        W("tiny", "아주 작은", "형용사", "🐜", "TI-ny", "A tiny hero stood on the desk.", "아주 작은 주인공이 책상 위에 서 있었다.", "타이니 → '타이니 하우스' = 아주 작은 집")],
      extra: X("webtoon=웹툰|draw=그리다|tablet=태블릿|hero=주인공, 영웅|cartoon=만화|artist=작가, 화가|pen=펜|screen=화면") }),

    T({ id: "hotel", title: "The Thirteenth Floor", ko: "호텔 13층의 비밀", genre: "여행·미스터리",
      seed: "On a family trip abroad, you stay at an old hotel. At midnight, the lift stops on a floor that is not on the map.",
      seedKo: "가족 해외 여행 중에 오래된 호텔에 묵어요. 한밤중에 엘리베이터가 안내도에 없는 층에서 멈춰요.",
      screens: ["Mina and Jun stand at the hotel entrance.", "Mina looks at the sea from the hotel rooftop.", "The lift opens on a dark hallway.", "Mina and Jun run up the stairs."],
      words: [
        W("hotel", "호텔", "명사", "🏨", "ho-TEL", "Our hotel is next to the sea.", "우리 호텔은 바다 옆에 있다.", "호텔 → 그대로! 다만 강세는 뒤 TEL"),
        W("reserve", "예약하다", "동사", "📅", "re-SERVE", "Mom reserved a room for three nights.", "엄마는 3박으로 방을 예약했다.", "리저브 → 식당 'Reserved' 팻말 = 예약석"),
        W("guest", "손님, 투숙객", "명사", "🛎️", "GUEST", "A strange guest stood in the hallway.", "이상한 손님이 복도에 서 있었다.", "게스트 → 게스트하우스 = 손님 집"),
        W("view", "경치, 전망", "명사", "🌄", "VIEW", "The view from our window was amazing.", "창문 밖 경치가 멋졌다.", "뷰 → 오션 뷰 = 바다 전망"),
        W("schedule", "일정", "명사", "🗓️", "SCHED-ule", "Our schedule was full of fun trips.", "우리 일정은 재미있는 여행으로 가득했다.", "스케줄 → 연예인 스케줄 = 일정"),
        W("lift", "엘리베이터; 들어 올리다", "명사·동사", "🛗", "LIFT", "The lift stopped on the thirteenth floor.", "엘리베이터가 13층에서 멈췄다.", "리프트 → 스키장 리프트 = 위로 올려 주는 것")],
      extra: X("trip=여행|room=방|key=열쇠|elevator=엘리베이터|floor=층|ghost=유령|map=지도|midnight=한밤중") }),
  ];

  /* ---------- 글쓰기 힌트 ---------- */
  const hints = {
    /* 라운드 위치별 안내 */
    flow: {
      first: { title: "1화: 이야기를 시작해요", tips: ["누가 나오나요? Mina, Jun, 새 인물", "어디에 있나요? 언제인가요?", "무슨 일이 시작되나요?"] },
      middle: { title: "이어 쓰기: 사건을 키워요", tips: ["앞 친구의 마지막 문장을 다시 읽어요", "Twist 카드나 갈림길 선택을 넣어요", "대사를 한두 줄 넣으면 영상이 살아나요"] },
      last: { title: "마지막 화: 이야기를 끝내요", tips: ["문제를 어떻게 해결하나요?", "등장인물은 어떤 기분인가요?", "Finally, In the end로 끝내 봐요"] },
    },
    /* 표현 (영어|뜻). ___ 는 직접 채우는 칸 */
    phrases: [
      { group: "시작할 때", items: X("One day, =어느 날,|It was a dark and quiet night. =어둡고 조용한 밤이었다.|Mina was in the ___. =미나는 ___에 있었다.|Everything was normal until =…하기 전까지는 모든 게 평범했다|Jun had a strange feeling. =준은 이상한 느낌이 들었다.") },
      { group: "사건이 생길 때", items: X("Suddenly, =갑자기,|At that moment, =바로 그 순간,|Then, =그러고 나서,|But there was a problem. =그런데 문제가 있었다.|Someone was behind the door. =문 뒤에 누군가 있었다.|They heard a strange sound. =그들은 이상한 소리를 들었다.") },
      { group: "기분을 말할 때", items: X("Mina felt so ___. =미나는 너무 ___했다.|Jun was so scared that he couldn't move. =준은 너무 무서워서 움직일 수 없었다.|They were surprised. =그들은 깜짝 놀랐다.|Mina smiled. =미나는 미소 지었다.|Jun started to cry. =준은 울기 시작했다.") },
      { group: "대사", items: X("What is that? =저게 뭐야?|Let's go together! =같이 가자!|Don't worry. =걱정 마.|Are you okay? =괜찮아?|I have an idea! =좋은 생각이 있어!|Wait for me! =나 기다려!|Help! =도와줘!|I can't believe it! =믿을 수 없어!|Look at this! =이것 좀 봐!|Be careful! =조심해!|Thank you so much. =정말 고마워.|Who are you? =너는 누구야?") },
      { group: "끝낼 때", items: X("Finally, =마침내,|In the end, =결국,|They became best friends. =그들은 단짝이 되었다.|It was the best day ever. =최고의 날이었다.|But the story is not over... =하지만 이야기는 아직 끝나지 않았다...") },
      { group: "갈림길 질문", items: X("What should ___ do? =___는 어떻게 해야 할까?|Where should they go? =그들은 어디로 가야 할까?|Who is behind the door? =문 뒤에는 누가 있을까?|Should they open the box? =상자를 열어야 할까?") },
    ],
    /* 화면 묘사용 장소 (그림 배경과 연결됨) */
    places: X("classroom=교실|hallway=복도|rooftop=옥상|library=도서관|stairs=계단|school gate=교문|park=공원|street=거리|store=가게|bedroom=침실|beach=해변|stage=무대|palace=궁궐|museum=박물관|space=우주|island=섬"),
    screenFrames: X("___ and ___ are in the ___. =___와 ___가 ___에 있다.|___ stands in front of the ___. =___가 ___ 앞에 서 있다.|___ runs on the ___. =___가 ___에서 달린다.|___ looks at the ___. =___가 ___를 바라본다."),
    feelings: X("happy=행복한|sad=슬픈|scared=무서워하는|excited=신난|nervous=긴장한|angry=화난|surprised=놀란|tired=피곤한|hungry=배고픈|lonely=외로운|proud=자랑스러운|worried=걱정하는"),
    /* 우리말 → 영어 단어 찾기 */
    dict: X("friend=친구|teacher=선생님|student=학생|classmate=반 친구|mom=엄마|dad=아빠|grandma=할머니|grandpa=할아버지|brother=형, 오빠, 남동생|sister=언니, 누나, 여동생|baby=아기|kid=아이|people=사람들|police officer=경찰관|doctor=의사|king=왕|queen=여왕|stranger=낯선 사람|hero=영웅|monster=괴물|alien=외계인|robot=로봇|ghost=유령|" +
      "school=학교|classroom=교실|hallway=복도|rooftop=옥상|library=도서관|gym=체육관|cafeteria=급식실|playground=놀이터|schoolyard=운동장|home=집|bedroom=침실|kitchen=부엌|park=공원|street=거리|store=가게|hospital=병원|station=역|bus stop=버스 정류장|beach=해변|sea=바다|mountain=산|forest=숲|river=강|city=도시|town=동네|castle=성|museum=박물관|space=우주|" +
      "bag=가방|book=책|phone=휴대폰|key=열쇠|door=문|window=창문|desk=책상|chair=의자|box=상자|map=지도|letter=편지|picture=그림|photo=사진|money=돈|ticket=표|umbrella=우산|clock=시계|computer=컴퓨터|ball=공|food=음식|water=물|gift=선물|candy=사탕|flower=꽃|tree=나무|cake=케이크|" +
      "dog=개|cat=고양이|bird=새|rabbit=토끼|mouse=쥐|horse=말|tiger=호랑이|bear=곰|fish=물고기|dragon=용|puppy=강아지|" +
      "happy=행복한|sad=슬픈|angry=화난|scared=무서워하는|scary=무서운|afraid=두려워하는|fear=두려움|excited=신난|nervous=긴장한|surprised=놀란|tired=피곤한|hungry=배고픈|lonely=외로운|proud=자랑스러운|worried=걱정하는|brave=용감한|kind=친절한|funny=웃긴|smart=똑똑한|big=큰|small=작은|old=오래된, 늙은|new=새로운|dark=어두운|bright=밝은|quiet=조용한|loud=시끄러운|fast=빠른|slow=느린|beautiful=아름다운|strange=이상한|cold=추운, 차가운|hot=더운, 뜨거운|safe=안전한|dangerous=위험한|empty=텅 빈|special=특별한|" +
      "go=가다|come=오다|run=달리다|walk=걷다|jump=뛰다|fly=날다|swim=수영하다|see=보다|look at=바라보다|watch=지켜보다|hear=듣다|listen to=귀 기울이다|say=말하다|tell=말해 주다|ask=묻다|answer=대답하다|call=부르다, 전화하다|shout=소리치다|cry=울다|laugh=웃다|smile=미소 짓다|eat=먹다|drink=마시다|sleep=자다|wake up=잠에서 깨다|open=열다|close=닫다|find=찾다, 발견하다|lose=잃어버리다|take=가져가다|give=주다|bring=가져오다|help=돕다|follow=따라가다|meet=만나다|wait=기다리다|start=시작하다|stop=멈추다|fall=떨어지다, 넘어지다|hide=숨다|catch=잡다|throw=던지다|push=밀다|pull=당기다|climb=오르다|think=생각하다|know=알다|remember=기억하다|forget=잊다|want=원하다|need=필요하다|like=좋아하다|love=사랑하다|try=해 보다|win=이기다|change=바꾸다|make=만들다|build=짓다|break=부수다|fix=고치다|save=구하다|leave=떠나다|arrive=도착하다|come back=돌아오다|" +
      "today=오늘|tomorrow=내일|yesterday=어제|morning=아침|afternoon=오후|night=밤|midnight=자정|now=지금|then=그때, 그다음|soon=곧|later=나중에|suddenly=갑자기|finally=마침내|again=다시|always=항상|never=절대 ~않다|first=먼저|next=다음에|after=뒤에|before=전에|" +
      "sun=해|moon=달|star=별|sky=하늘|cloud=구름|rain=비|snow=눈|wind=바람|fire=불|light=빛|sound=소리|voice=목소리|noise=소음|smell=냄새|idea=생각|plan=계획|problem=문제|question=질문|" +
      "really=정말|very=매우|together=함께|alone=혼자|quickly=빨리|slowly=천천히|quietly=조용히|outside=밖에|inside=안에|behind=뒤에|under=아래에|next to=옆에|in front of=앞에|between=사이에|far=먼|near=가까운|" +
      "confused=헷갈리는|embarrassed=창피한|bored=지루한|sleepy=졸린|thirsty=목마른|sick=아픈|hurt=다친|run away=도망가다|look for=찾다|give up=포기하다|turn on=켜다|turn off=끄다|pick up=줍다|fall down=넘어지다|get up=일어나다|sit down=앉다|stand up=일어서다"),
  };

  return {
    note: "단어는 2022 개정 영어과 교육과정 기본 어휘(중학교 권장) 목록에서 골랐습니다.",
    topics, hints,
    twists: [
      "Suddenly, the lights go out.", "Someone finds an old photo.", "A cat follows the main character.", "It starts to snow, in the middle of the story.",
      "A phone rings, but nobody is there.", "The main character finds a map.", "Someone says: \"I've never seen that before.\"", "A door that was locked is now open.",
      "Everyone hears music from far away.", "A small robot appears.", "It starts to rain.", "Someone gets a strange letter.",
    ],
    twistsKo: {
      "Suddenly, the lights go out.": "갑자기 불이 꺼진다.", "Someone finds an old photo.": "누군가 오래된 사진을 찾는다.", "A cat follows the main character.": "고양이 한 마리가 주인공을 따라온다.",
      "It starts to snow, in the middle of the story.": "이야기 도중에 눈이 내리기 시작한다.", "A phone rings, but nobody is there.": "전화가 울리는데 아무도 없다.", "The main character finds a map.": "주인공이 지도를 찾는다.",
      "Someone says: \"I've never seen that before.\"": "누군가 \"저런 건 처음 봐.\"라고 말한다.", "A door that was locked is now open.": "잠겨 있던 문이 열려 있다.", "Everyone hears music from far away.": "멀리서 음악 소리가 들린다.",
      "A small robot appears.": "작은 로봇이 나타난다.", "It starts to rain.": "비가 내리기 시작한다.", "Someone gets a strange letter.": "누군가 이상한 편지를 받는다.",
    },
    /* 학교에서 함께 보는 영상이라 막는 말 (영어는 뒤에 붙는 형태도 같이 막음: kill → killed). 선생님 화면에서 더 추가할 수 있어요. */
    banned: ["kill", "blood", "gun", "knife", "drunk", "beer", "cigarette", "stupid", "idiot", "loser", "sexy", "kiss", "fight",
      "fuck", "shit", "bitch", "drug", "suicide", "porn", "nude",
      "바보", "죽어", "시발", "씨발", "병신", "존나", "개새", "ㅅㅂ", "ㅂㅅ", "꺼져"],
  };
})();
