/* Relay Story Live · 사건 파일 (클루 보드게임처럼 이어 쓰는 릴레이 소설)
   주제마다 사건 하나: 사라진 물건 1개, 용의자 6명, 장소 6곳, 단서 6개.
   - 단서 i번은 용의자 i번의 특징과 이어져요 (예: 딸기 껌 종이 ↔ 늘 딸기 껌을 씹는 댄서). 그래서 반 친구들이 추리할 수 있어요.
   - 이유(why)는 모두 착한 이유예요. 아무도 다치지 않고, 마지막엔 모두 웃으며 끝나요.
   - 장소 0번은 사건이 일어난 곳이에요. 나머지 5곳 중에서 단서 장소, 알리바이 장소, 조사할 장소, 찾은 곳을 뽑아요.
   - 학생 또래 인물과 학교 선생님은 실제 이름과 겹치지 않게 별명 같은 이름을 썼어요 (Luna, Coach Tiger, Mr. Owl …).
   - 이름·사건은 모두 이 앱에서 새로 지었어요. 주제 순서는 2026-11 학생 설문(대중문화 → 여행 → 진로 → 학교생활)을 따랐어요.
   용의자 = S(이름, 우리말 이름, 역할, 우리말 역할, 그림글자, 성별 f/m, 특징(영어: 이름 뒤에 바로 붙는 말), 특징(우리말), 이유(영어: I로 시작), 이유(우리말))
   장소 = P(영어, 우리말, 그림글자, 전치사)   단서·물건 = I(영어, 우리말, 그림글자) */
window.RSL_CASES = (function () {
  const S = (name, ko, role, roleKo, emoji, gender, trait, traitKo, why, whyKo) => ({ name, ko, role, roleKo, emoji, gender, trait, traitKo, why, whyKo });
  const P = (en, ko, emoji, prep) => ({ en, ko, emoji, prep: prep || "in" });
  const I = (en, ko, emoji) => ({ en, ko, emoji });
  return {
    /* ---------- 대중문화 ---------- */
    kpop: {
      title: "The Missing Golden Mic", ko: "사라진 황금 마이크", missing: I("the golden mic", "황금 마이크", "🎤"),
      incident: "One hour before the concert, the leader's golden mic is missing!", incidentKo: "공연 한 시간 전, 리더의 황금 마이크가 사라졌어요!",
      suspects: [
        S("Rio", "리오", "the dancer", "댄서", "🕺", "m", "always chews strawberry gum", "늘 딸기 껌을 씹어요", "I wanted to practice the song alone.", "혼자 노래 연습을 하고 싶었어요."),
        S("Manager Han", "한 매니저", "the manager", "매니저", "📋", "f", "writes everything in a blue notebook", "모든 걸 파란 수첩에 적어요", "I wanted to clean it before the show.", "공연 전에 깨끗이 닦아 주고 싶었어요."),
        S("Bella", "벨라", "the makeup artist", "메이크업 아티스트", "💄", "f", "has pink glitter on her hands", "손에 분홍 반짝이가 묻어 있어요", "I wanted to make it shine with stickers.", "스티커로 더 반짝이게 꾸미고 싶었어요."),
        S("Tony", "토니", "the drummer", "드러머", "🥁", "m", "always carries drumsticks", "늘 드럼 스틱을 들고 다녀요", "I wanted to test the sound before the show.", "공연 전에 소리를 미리 시험해 보고 싶었어요."),
        S("Luna", "루나", "the fan club leader", "팬클럽 회장", "💙", "f", "always holds a light stick", "늘 응원봉을 들고 있어요", "I wanted to take a photo with it for the fans.", "팬들에게 보여 줄 사진을 찍고 싶었어요."),
        S("Mr. Choi", "최 아저씨", "the cleaner", "청소 아저씨", "🧹", "m", "has wet shoes from mopping", "걸레질을 해서 신발이 젖어 있어요", "I found it on the floor and kept it safe.", "바닥에 떨어진 걸 주워서 안전하게 보관했어요."),
      ],
      places: [P("the dance studio", "연습실", "🪩"), P("the backstage hallway", "무대 뒤 복도", "🚪"), P("the dressing room", "분장실", "🪞"), P("the concert stage", "콘서트 무대", "🎪", "on"), P("the snack shop", "간식 가게", "🍿"), P("the rooftop", "옥상", "🌇", "on")],
      items: [I("a strawberry gum wrapper", "딸기 껌 종이", "🍓"), I("a page from a blue notebook", "파란 수첩 한 장", "📘"), I("pink glitter", "분홍 반짝이", "✨"), I("a broken drumstick", "부러진 드럼 스틱", "🥢"), I("a light stick battery", "응원봉 건전지", "🔋"), I("wet footprints", "젖은 발자국", "👣")],
    },
    webtoon: {
      title: "The Missing Magic Pen", ko: "사라진 마법 펜", missing: I("the magic pen", "마법 펜", "🖊️"),
      incident: "The tiny webtoon hero lost his magic pen. Without it, he cannot go back into the screen!", incidentKo: "웹툰 속 작은 주인공이 마법 펜을 잃어버렸어요. 펜이 없으면 화면 속으로 돌아갈 수 없어요!",
      suspects: [
        S("Coco", "코코", "Jun's little sister", "준의 여동생", "👧", "f", "loves chocolate milk", "초코우유를 정말 좋아해요", "I wanted to draw a cute cat with it.", "그 펜으로 귀여운 고양이를 그리고 싶었어요."),
        S("Max", "맥스", "the dog next door", "옆집 강아지", "🐶", "m", "loves to hide things in the garden", "물건을 마당에 숨기는 걸 좋아해요", "Woof! I thought it was a stick!", "멍! 막대기인 줄 알았어요!"),
        S("Ms. Palette", "팔레트 선생님", "the art teacher", "미술 선생님", "🎨", "f", "always has blue paint on her sleeves", "소매에 늘 파란 물감이 묻어 있어요", "I wanted to fix the broken pen tip.", "부러진 펜촉을 고쳐 주고 싶었어요."),
        S("Leo", "레오", "the webtoon villain", "웹툰 속 악당", "🦹", "m", "wears a long black cape", "긴 검은 망토를 입어요", "I wanted to draw a happy ending for myself.", "나도 행복한 결말을 그려 보고 싶었어요."),
        S("Kelly", "켈리", "Jun's best friend", "준의 단짝", "🎧", "f", "puts music stickers on everything", "어디에나 음표 스티커를 붙여요", "I wanted to give it a new color as a surprise.", "깜짝 선물로 새 색을 칠해 주고 싶었어요."),
        S("Grandpa Oh", "오 할아버지", "the stationery shop owner", "문구점 할아버지", "🧓", "m", "always eats peppermint candy", "늘 박하사탕을 먹어요", "I found it on the street and kept it for Jun.", "길에서 주워서 준에게 주려고 맡아 두었어요."),
      ],
      places: [P("Jun's bedroom", "준의 방", "🛏️"), P("the classroom", "교실", "🏫"), P("the park", "공원", "🌳"), P("the stationery shop", "문구점", "✏️"), P("the library", "도서관", "📚"), P("the rooftop", "옥상", "🌇", "on")],
      items: [I("a chocolate milk box", "초코우유 곽", "🥛"), I("dog hair", "강아지 털", "🐾"), I("a drop of blue paint", "파란 물감 한 방울", "💧"), I("a piece of black cloth", "검은 천 조각", "🖤"), I("a music sticker", "음표 스티커", "🎵"), I("a peppermint candy wrapper", "박하사탕 껍질", "🍬")],
    },
    youtuber: {
      title: "The Missing Silver Trophy", ko: "사라진 은빛 트로피", missing: I("the silver trophy", "은빛 트로피", "🏆"),
      incident: "Our school channel won a silver trophy. But it is missing just before the photo time!", incidentKo: "우리 학교 채널이 은빛 트로피를 받았어요. 그런데 기념사진을 찍기 직전에 트로피가 사라졌어요!",
      suspects: [
        S("Hazel", "헤이즐", "the camera girl", "촬영 담당", "🎥", "f", "always carries a camera", "늘 카메라를 들고 다녀요", "I wanted to film a cool opening scene.", "멋진 오프닝 장면을 찍고 싶었어요."),
        S("Ben", "벤", "the video editor", "편집 담당", "💻", "m", "drinks banana milk all day", "하루 종일 바나나우유를 마셔요", "I wanted to take a picture for the thumbnail.", "썸네일에 쓸 사진을 찍고 싶었어요."),
        S("Principal Gold", "골드 교장 선생님", "the principal", "교장 선생님", "👔", "m", "wears a shiny gold tie pin", "반짝이는 금색 넥타이핀을 해요", "I wanted to show it to the other teachers.", "다른 선생님들께 자랑하고 싶었어요."),
        S("Ruby", "루비", "the top commenter", "댓글왕", "💬", "f", "always uses pink sticky notes", "늘 분홍 메모지를 써요", "I wanted to make a thank-you card for it.", "트로피에 붙일 감사 카드를 만들고 싶었어요."),
        S("Coach Tiger", "타이거 코치", "the PE teacher", "체육 선생님", "🏀", "m", "always has a red whistle", "늘 빨간 호루라기를 걸고 있어요", "I wanted to keep it safe until the photo time.", "사진 찍을 때까지 안전하게 맡아 두고 싶었어요."),
        S("Nabi", "나비", "the school cat", "학교 고양이", "🐱", "f", "loves shiny things", "반짝이는 물건을 좋아해요", "Meow! It was so shiny!", "야옹! 너무 반짝였어요!"),
      ],
      places: [P("the classroom", "교실", "🏫"), P("the hallway", "복도", "🚪"), P("the library", "도서관", "📚"), P("the gym", "체육관", "🏀"), P("the school gate", "교문", "🚧", "at"), P("the rooftop", "옥상", "🌇", "on")],
      items: [I("a camera lens cap", "카메라 렌즈 뚜껑", "📷"), I("a banana milk straw", "바나나우유 빨대", "🍌"), I("a gold tie pin", "금색 넥타이핀", "📌"), I("a pink sticky note", "분홍 메모지", "🩷"), I("a red whistle string", "빨간 호루라기 줄", "🔴"), I("cat footprints", "고양이 발자국", "🐾")],
    },
    game: {
      title: "The Missing Golden Key", ko: "사라진 황금 열쇠", missing: I("the golden key", "황금 열쇠", "🗝️"),
      incident: "You need the golden key to clear the last level. But someone took it from the treasure box!", incidentKo: "마지막 레벨을 깨려면 황금 열쇠가 필요해요. 그런데 누군가 보물 상자에서 열쇠를 가져갔어요!",
      suspects: [
        S("Sir Pixel", "픽셀 기사", "the castle guard", "성문 경비", "🛡️", "m", "wears noisy metal boots", "시끄러운 쇠 장화를 신어요", "I wanted to protect it from the monsters.", "몬스터에게서 지키고 싶었어요."),
        S("Slimy", "슬라이미", "the green slime", "초록 슬라임", "🟢", "f", "leaves a sticky green trail", "끈적한 초록 자국을 남겨요", "I wanted to be the hero for one day.", "하루만 주인공이 되어 보고 싶었어요."),
        S("Merchant Moe", "상인 모", "the item seller", "아이템 상인", "💰", "m", "counts gold coins all day", "하루 종일 금화를 세요", "I wanted to make a copy for lost players.", "길 잃은 플레이어에게 줄 복사본을 만들고 싶었어요."),
        S("Fairy Lumi", "요정 루미", "the helper fairy", "도우미 요정", "🧚", "f", "drops sparkly dust when she flies", "날아다닐 때 반짝이 가루를 떨어뜨려요", "I wanted to hide it from the boss.", "보스에게서 숨겨 주고 싶었어요."),
        S("Boss Bear", "보스 곰", "the last boss", "마지막 보스", "🐻", "m", "loves sweet honey", "달콤한 꿀을 좋아해요", "I was lonely. I wanted players to visit me.", "외로웠어요. 플레이어들이 나를 찾아오길 바랐어요."),
        S("Bit", "비트", "the robot cat", "로봇 고양이", "🤖", "f", "has a blinking blue light", "파란 불빛이 깜빡여요", "I wanted to scan it and save the game.", "열쇠를 스캔해서 게임을 저장해 두고 싶었어요."),
      ],
      places: [P("the treasure room", "보물 방", "💎"), P("the item shop", "아이템 상점", "🏪"), P("the castle gate", "성문", "🏰", "at"), P("the pixel forest", "픽셀 숲", "🌲"), P("the secret level", "비밀 레벨", "🕹️"), P("the boss room", "보스의 방", "👾")],
      items: [I("a metal screw", "쇠 나사", "🔩"), I("a sticky green trail", "끈적한 초록 자국", "💚"), I("a gold coin", "금화", "🪙"), I("sparkly fairy dust", "반짝이는 요정 가루", "✨"), I("drops of honey", "꿀 방울", "🍯"), I("a tiny blue light", "작은 파란 불빛", "🔵")],
    },
    movie: {
      title: "The Missing Movie Script", ko: "사라진 영화 대본", missing: I("the movie script", "영화 대본", "📜"),
      incident: "Inside the movie, the script is missing. Without it, nobody knows the ending!", incidentKo: "영화 속에서 대본이 사라졌어요. 대본이 없으면 아무도 결말을 몰라요!",
      suspects: [
        S("Director Kim", "김 감독", "the director", "감독", "🎬", "m", "always wears a red cap", "늘 빨간 모자를 써요", "I wanted to write a happier ending.", "더 행복한 결말로 바꾸고 싶었어요."),
        S("Lily", "릴리", "the movie star", "주연 배우", "🌟", "f", "always carries a small mirror", "늘 작은 거울을 들고 다녀요", "I wanted to practice my lines at home.", "집에서 대사 연습을 하고 싶었어요."),
        S("Pete", "피트", "the popcorn seller", "팝콘 판매원", "🍿", "m", "smells like butter popcorn", "버터 팝콘 냄새가 나요", "I wanted to read the ending first.", "결말을 제일 먼저 읽어 보고 싶었어요."),
        S("Sam", "샘", "the stunt actor", "스턴트 배우", "🤸", "f", "has a bandage on her arm", "팔에 반창고를 붙이고 있어요", "I wanted to check the action scene.", "액션 장면을 미리 확인하고 싶었어요."),
        S("Robo Ray", "로보 레이", "the robot actor", "로봇 배우", "🤖", "m", "leaves little oil drops", "작은 기름 방울을 흘려요", "I wanted to learn how to cry in the sad scene.", "슬픈 장면에서 우는 법을 배우고 싶었어요."),
        S("Ms. Moon", "문 작가", "the writer", "작가", "✍️", "f", "writes with a purple pen", "보라색 펜으로 글을 써요", "I wanted to fix a spelling mistake.", "틀린 철자를 고치고 싶었어요."),
      ],
      places: [P("the cinema", "영화관", "🎦"), P("the movie stage", "촬영 무대", "🎥", "on"), P("the dressing room", "분장실", "🪞"), P("the popcorn counter", "팝콘 판매대", "🍿", "at"), P("the dark street", "어두운 거리", "🌃", "on"), P("the rooftop", "옥상", "🌇", "on")],
      items: [I("a red cap", "빨간 모자", "🧢"), I("a small mirror", "작은 거울", "🪞"), I("a piece of popcorn", "팝콘 한 알", "🍿"), I("a bandage", "반창고", "🩹"), I("oil drops", "기름 방울", "🛢️"), I("purple ink", "보라색 잉크", "🟣")],
    },
    /* ---------- 여행 ---------- */
    airport: {
      title: "The Missing Passport", ko: "사라진 여권", missing: I("the passport", "여권", "🛂"),
      incident: "Thirty minutes before the flight, Mina's passport is missing!", incidentKo: "비행기 출발 30분 전, 미나의 여권이 사라졌어요!",
      suspects: [
        S("Captain Lee", "이 기장", "the pilot", "기장", "✈️", "m", "always wears white gloves", "늘 하얀 장갑을 껴요", "I found it on the floor. I wanted to give it back.", "바닥에서 주웠어요. 돌려주고 싶었어요."),
        S("Amy", "에이미", "the flight attendant", "승무원", "💁", "f", "wears a flower scarf", "꽃무늬 스카프를 해요", "I found it on a chair and kept it safe.", "의자 위에서 발견해서 안전하게 보관했어요."),
        S("Tommy", "토미", "a little boy", "꼬마 승객", "👦", "m", "loves dinosaur stickers", "공룡 스티커를 좋아해요", "I wanted to put a sticker on it.", "여권에 스티커를 붙여 주고 싶었어요."),
        S("Officer Jang", "장 요원", "the security guard", "보안 요원", "👮", "m", "always drinks coffee", "늘 커피를 마셔요", "I wanted to check it one more time.", "한 번 더 확인하고 싶었어요."),
        S("Grandma Rose", "로즈 할머니", "a tourist", "관광객 할머니", "👵", "f", "knits all the time", "늘 뜨개질을 해요", "I picked it up with my knitting by mistake.", "실수로 뜨개질 바구니에 같이 넣었어요."),
        S("Pip", "핍", "a green parrot", "초록 앵무새", "🦜", "m", "collects paper for its nest", "둥지를 지으려고 종이를 모아요", "Squawk! I wanted it for my nest!", "꽥! 둥지에 쓰고 싶었어요!"),
      ],
      places: [P("the boarding gate", "탑승구", "🚪", "at"), P("the duty-free shop", "면세점", "🛍️"), P("the airport café", "공항 카페", "☕"), P("the baggage area", "수하물 찾는 곳", "🧳"), P("the lost-and-found desk", "분실물 센터", "📦", "at"), P("the airport lobby", "공항 로비", "🛫")],
      items: [I("a white glove", "하얀 장갑", "🧤"), I("a flower scarf", "꽃무늬 스카프", "🧣"), I("a dinosaur sticker", "공룡 스티커", "🦖"), I("a coffee cup", "커피 컵", "☕"), I("red yarn", "빨간 털실", "🧶"), I("a green feather", "초록 깃털", "🪶")],
    },
    market: {
      title: "The Missing Magic Spoon", ko: "사라진 마법 숟가락", missing: I("the magic spoon", "마법 숟가락", "🥄"),
      incident: "The night market's magic spoon is missing! Without it, every snack loses its power.", incidentKo: "야시장의 마법 숟가락이 사라졌어요! 숟가락이 없으면 간식이 모두 힘을 잃어요.",
      suspects: [
        S("Auntie Mei", "메이 아주머니", "the dumpling seller", "만두 장수", "🥟", "f", "has flour on her apron", "앞치마에 밀가루가 묻어 있어요", "I wanted to make a giant dumpling for everyone.", "모두를 위해 엄청 큰 만두를 만들고 싶었어요."),
        S("Kai", "카이", "the street dancer", "거리 댄서", "🕺", "m", "wears light-up shoes", "불이 들어오는 신발을 신어요", "I wanted to use it in my dance show.", "댄스 공연에 써 보고 싶었어요."),
        S("Lulu", "룰루", "a little monkey", "꼬마 원숭이", "🐒", "f", "loves bananas", "바나나를 좋아해요", "Ooh ooh! I thought it was a back scratcher!", "우끼끼! 등 긁는 건 줄 알았어요!"),
        S("Mr. Tan", "탄 아저씨", "the lantern maker", "등불 만드는 아저씨", "🏮", "m", "has red paint on his fingers", "손가락에 빨간 물감이 묻어 있어요", "I wanted to paint it gold for the festival.", "축제를 위해 금색으로 칠해 주고 싶었어요."),
        S("Nina", "니나", "a tourist", "여행객", "📸", "f", "takes photos of everything", "뭐든지 사진으로 찍어요", "I wanted to take a perfect photo of it.", "완벽한 사진을 찍고 싶었어요."),
        S("Chef Bo", "보 셰프", "the noodle chef", "국수 요리사", "🍜", "m", "smells like spicy sauce", "매운 소스 냄새가 나요", "I wanted to taste the magic myself.", "저도 그 마법을 맛보고 싶었어요."),
      ],
      places: [P("the dumpling shop", "만두 가게", "🥟"), P("the lantern street", "등불 거리", "🏮", "on"), P("the noodle counter", "국수 판매대", "🍜", "at"), P("the night park", "밤 공원", "🌙"), P("the photo booth", "사진 부스", "📸"), P("the fruit store", "과일 가게", "🍉")],
      items: [I("white flour", "하얀 밀가루", "🌾"), I("a tiny shoe light", "신발 불빛 조각", "💡"), I("a banana peel", "바나나 껍질", "🍌"), I("red paint", "빨간 물감", "🖌️"), I("a photo", "사진 한 장", "🖼️"), I("a drop of spicy sauce", "매운 소스 한 방울", "🌶️")],
    },
    hotel: {
      title: "The Missing Golden Key Card", ko: "사라진 황금 카드 키", missing: I("the golden key card", "황금 카드 키", "💳"),
      incident: "The hotel's golden key card is missing! Now nobody can open the thirteenth floor.", incidentKo: "호텔의 황금 카드 키가 사라졌어요! 이제 아무도 13층 문을 열 수 없어요.",
      suspects: [
        S("Mr. Bell", "벨 씨", "the bellboy", "벨보이", "🛎️", "m", "wears a red coat with gold buttons", "금색 단추가 달린 빨간 옷을 입어요", "I wanted to fix the broken lift.", "고장 난 엘리베이터를 고치고 싶었어요."),
        S("Madame Lin", "린 부인", "a rich guest", "부자 손님", "💎", "f", "wears a pearl necklace", "진주 목걸이를 해요", "I wanted to find my lost cat upstairs.", "위층에서 잃어버린 고양이를 찾고 싶었어요."),
        S("Chef Paul", "폴 셰프", "the hotel chef", "호텔 요리사", "🍰", "m", "loves chocolate cake", "초콜릿 케이크를 좋아해요", "I wanted to make a midnight snack for the guests.", "손님들에게 줄 야식을 만들고 싶었어요."),
        S("Kiki", "키키", "a little guest", "꼬마 손님", "👧", "f", "always plays with a yo-yo", "늘 요요를 가지고 놀아요", "I wanted to explore the hotel like a detective.", "탐정처럼 호텔을 탐험하고 싶었어요."),
        S("Manager Song", "송 지배인", "the night manager", "야간 지배인", "🌙", "f", "carries a moon key ring", "달 모양 열쇠고리를 들고 다녀요", "I wanted to check the old rooms at night.", "밤에 오래된 방들을 확인하고 싶었어요."),
        S("Mr. Boo", "부 씨", "the friendly ghost", "착한 유령", "👻", "m", "leaves cold air behind him", "지나간 자리에 찬 바람을 남겨요", "I was lonely. I wanted visitors on my floor.", "외로웠어요. 내 층에 손님이 오길 바랐어요."),
      ],
      places: [P("the hotel lobby", "호텔 로비", "🏨"), P("the old lift", "오래된 엘리베이터", "🛗"), P("the hotel kitchen", "호텔 주방", "🍳"), P("the rooftop pool", "옥상 수영장", "🏊", "at"), P("the dark hallway", "어두운 복도", "🚪"), P("the back stairs", "뒤쪽 계단", "🪜", "on")],
      items: [I("a gold button", "금색 단추", "🟡"), I("a pearl", "진주 한 알", "⚪"), I("chocolate crumbs", "초콜릿 부스러기", "🍫"), I("a yo-yo string", "요요 줄", "🪀"), I("a moon key ring", "달 모양 열쇠고리", "🌙"), I("a piece of ice", "얼음 조각", "🧊")],
    },
    /* ---------- 진로 ---------- */
    recipe: {
      title: "The Missing Secret Recipe", ko: "사라진 비밀 레시피", missing: I("the secret recipe card", "비밀 레시피 카드", "📝"),
      incident: "Just before the cooking contest, our secret recipe card is missing!", incidentKo: "요리 대회 직전에 우리 반 비밀 레시피 카드가 사라졌어요!",
      suspects: [
        S("Judge Hong", "홍 심사위원", "the judge", "심사위원", "🎀", "m", "always wears a red bow tie", "늘 빨간 나비넥타이를 매요", "I wanted to read it before the contest.", "대회 전에 미리 읽어 보고 싶었어요."),
        S("Hailey", "헤일리", "the rival cook", "라이벌 요리사", "👩‍🍳", "f", "keeps a pencil behind her ear", "귀 뒤에 연필을 꽂고 다녀요", "I wanted to say, 'Your recipe is great!'", "'너희 레시피 최고야!'라고 말해 주고 싶었어요."),
        S("Duke", "듀크", "the school dog", "학교 강아지", "🐕", "m", "loves sausages", "소시지를 좋아해요", "Woof! The card smelled like food!", "멍! 카드에서 음식 냄새가 났어요!"),
        S("Mr. Atom", "아톰 선생님", "the science teacher", "과학 선생님", "🥼", "m", "always carries a test tube", "늘 시험관을 들고 다녀요", "I wanted to cook it with science.", "과학으로 요리해 보고 싶었어요."),
        S("Mrs. Honey", "허니 조리사님", "the school cook", "급식 조리사님", "👵", "f", "always holds a wooden spoon", "늘 나무 주걱을 들고 있어요", "I wanted to add my secret tip.", "내 비법을 하나 더 적어 주고 싶었어요."),
        S("Ollie", "올리", "the class clown", "반 개그맨", "🤡", "m", "puts smile stickers everywhere", "어디에나 웃는 얼굴 스티커를 붙여요", "I wanted to draw funny faces on it.", "카드에 웃긴 얼굴을 그리고 싶었어요."),
      ],
      places: [P("the school kitchen", "학교 조리실", "🍳"), P("the classroom", "교실", "🏫"), P("the contest stage", "대회 무대", "🎪", "on"), P("the sauce store", "소스 가게", "🧂"), P("the hallway", "복도", "🚪"), P("the school garden", "학교 텃밭", "🥬")],
      items: [I("a red bow tie", "빨간 나비넥타이", "🎀"), I("a short pencil", "짧은 연필", "✏️"), I("a piece of sausage", "소시지 조각", "🌭"), I("a test tube", "시험관", "🧪"), I("a wooden spoon", "나무 주걱", "🥄"), I("a smile sticker", "웃는 얼굴 스티커", "😀")],
    },
    /* ---------- 학교생활 ---------- */
    festival: {
      title: "The Missing Festival Trophy", ko: "사라진 축제 트로피", missing: I("the golden trophy", "황금 트로피", "🏆"),
      incident: "The school festival is tomorrow. But the golden trophy for the best class is missing!", incidentKo: "학교 축제가 내일이에요. 그런데 최고의 반에게 줄 황금 트로피가 사라졌어요!",
      suspects: [
        S("DJ Sky", "디제이 스카이", "the school DJ", "학교 디제이", "🎧", "m", "always wears big headphones", "늘 큰 헤드폰을 쓰고 있어요", "I wanted to show it in my music show.", "내 음악 방송에서 보여 주고 싶었어요."),
        S("Ms. Melody", "멜로디 선생님", "the music teacher", "음악 선생님", "🎹", "f", "drinks lemon tea all day", "하루 종일 레몬차를 마셔요", "I wanted to polish it for tomorrow.", "내일을 위해 반짝반짝 닦아 주고 싶었어요."),
        S("Penny", "페니", "the cheer captain", "응원단장", "🎉", "f", "carries gold pom-poms", "금색 응원 수술을 들고 다녀요", "I wanted to use it in our cheer dance.", "응원 춤에 써 보고 싶었어요."),
        S("Mr. Fixit", "픽스잇 아저씨", "the school handyman", "학교 주무관님", "🔧", "m", "carries yellow tape in his toolbox", "공구함에 노란 테이프를 넣고 다녀요", "I wanted to fix its broken handle.", "부러진 손잡이를 고쳐 주고 싶었어요."),
        S("Toto", "토토", "the class hamster", "반 햄스터", "🐹", "m", "loves sunflower seeds", "해바라기씨를 좋아해요", "Squeak! I thought it was a golden house!", "찍! 황금 집인 줄 알았어요!"),
        S("Grace", "그레이스", "the student president", "학생회장", "⭐", "f", "makes paper stars for everyone", "모두에게 종이 별을 접어 줘요", "I wanted to wrap it as a surprise.", "깜짝 선물처럼 포장하고 싶었어요."),
      ],
      places: [P("the classroom", "교실", "🏫"), P("the music room", "음악실", "🎹"), P("the festival stage", "축제 무대", "🎪", "on"), P("the hallway", "복도", "🚪"), P("the school gate", "교문", "🚧", "at"), P("the gym", "체육관", "🏀")],
      items: [I("a headphone pad", "헤드폰 쿠션", "🎧"), I("a lemon tea bag", "레몬차 티백", "🍋"), I("a gold pom-pom string", "금색 응원 수술 한 가닥", "🎊"), I("yellow tape", "노란 테이프", "🟨"), I("sunflower seeds", "해바라기씨", "🌻"), I("a paper star", "종이 별", "⭐")],
    },
    lunch: {
      title: "The Missing Fried Chicken", ko: "사라진 급식 치킨", missing: I("the fried chicken", "급식 치킨", "🍗"),
      incident: "Today's lunch is fried chicken. But the chicken box disappeared from the school kitchen!", incidentKo: "오늘 급식은 치킨이에요. 그런데 조리실에서 치킨 상자가 사라졌어요!",
      suspects: [
        S("Mrs. Pepper", "페퍼 조리사님", "the lunch cook", "급식 조리사님", "👩‍🍳", "f", "always wears a white hat", "늘 하얀 모자를 써요", "I wanted to keep it warm until lunch time.", "점심시간까지 따뜻하게 두고 싶었어요."),
        S("Coach Rocket", "로켓 코치", "the PE teacher", "체육 선생님", "⚽", "m", "always drinks a sports drink", "늘 이온음료를 마셔요", "I wanted to share it after the soccer game.", "축구 경기가 끝나고 다 같이 나눠 먹고 싶었어요."),
        S("Mango", "망고", "the school cat", "학교 고양이", "🐈", "f", "has orange fur", "주황색 털이 있어요", "Meow! It smelled so good!", "야옹! 냄새가 너무 좋았어요!"),
        S("Mr. Owl", "아울 교감 선생님", "the vice principal", "교감 선생님", "👓", "m", "wears thick glasses", "두꺼운 안경을 써요", "I wanted to check that it was safe to eat.", "먹어도 안전한지 확인하고 싶었어요."),
        S("Bonnie", "보니", "the class president", "반장", "📝", "f", "always writes with a red pen", "늘 빨간 펜으로 써요", "I planned a surprise party for the class.", "반 친구들을 위한 깜짝 파티를 준비했어요."),
        S("Teddy", "테디", "a hungry first grader", "배고픈 1학년", "🧒", "m", "has yellow sauce on his face", "얼굴에 노란 소스가 묻어 있어요", "I was so hungry after soccer practice.", "축구 연습이 끝나고 너무 배가 고팠어요."),
      ],
      places: [P("the school kitchen", "학교 조리실", "🍳"), P("the cafeteria", "급식실", "🍽️"), P("the classroom", "교실", "🏫"), P("the dark hallway", "어두운 복도", "🚪"), P("the rooftop", "옥상", "🌇", "on"), P("the school garden", "학교 텃밭", "🥬")],
      items: [I("a white hair net", "하얀 위생모", "⚪"), I("a sports drink cap", "이온음료 뚜껑", "🥤"), I("orange cat hair", "주황색 고양이 털", "🧡"), I("a glasses cloth", "안경 닦는 천", "👓"), I("red ink", "빨간 잉크", "🖍️"), I("yellow sauce", "노란 소스", "🟡")],
    },
    sports: {
      title: "The Missing Relay Baton", ko: "사라진 계주 바통", missing: I("the golden baton", "황금 바통", "🏃"),
      incident: "The last relay race starts in ten minutes. But our golden baton is missing!", incidentKo: "마지막 계주가 10분 뒤에 시작해요. 그런데 우리 반 황금 바통이 사라졌어요!",
      suspects: [
        S("Referee Finn", "핀 심판", "the referee", "심판 선생님", "🟨", "m", "keeps a yellow card in his pocket", "주머니에 옐로카드를 넣고 다녀요", "I wanted to check it for the rules.", "규칙에 맞는지 확인하고 싶었어요."),
        S("Jet", "제트", "the fastest runner in Class 2", "2반 달리기 선수", "💨", "f", "wears a blue headband", "파란 머리띠를 해요", "I wanted to practice passing it.", "바통 넘기는 연습을 하고 싶었어요."),
        S("Doodle", "두들", "the school puppy", "학교 강아지", "🐶", "m", "loves to chew sticks", "막대기 씹는 걸 좋아해요", "Woof! I wanted to play fetch!", "멍! 물어 오기 놀이를 하고 싶었어요!"),
        S("Nurse Mint", "민트 보건 선생님", "the school nurse", "보건 선생님", "🩺", "f", "always carries ice packs", "늘 얼음팩을 들고 다녀요", "I wanted to keep it cool on this hot day.", "더운 날이라 시원하게 식혀 주고 싶었어요."),
        S("Hugo", "휴고", "the photo club boy", "사진 동아리 친구", "📷", "m", "takes photos all day", "하루 종일 사진을 찍어요", "I wanted a cool photo of it.", "바통의 멋진 사진을 찍고 싶었어요."),
        S("Grandpa Sung", "성 할아버지", "a cheering grandpa", "응원 온 할아버지", "👴", "m", "eats roasted chestnuts", "군밤을 먹어요", "I wanted to hold it for my grandson.", "손자를 위해 잠깐 들어 주고 싶었어요."),
      ],
      places: [P("the school field", "운동장", "🏟️", "on"), P("the running track", "달리기 트랙", "🛤️", "on"), P("the school gate", "교문", "🚧", "at"), P("the gym", "체육관", "🏀"), P("the nurse's office", "보건실", "🩹"), P("the park bench", "공원 벤치", "🪑", "on")],
      items: [I("a yellow card", "옐로카드", "🟨"), I("a blue headband", "파란 머리띠", "💙"), I("a chewed stick", "씹힌 막대기", "🪵"), I("a melted ice pack", "녹은 얼음팩", "🧊"), I("a photo of the race", "경기 사진 한 장", "📸"), I("chestnut shells", "군밤 껍질", "🌰")],
    },
  };
})();
