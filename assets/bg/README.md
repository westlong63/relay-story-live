# (선택) AI 배경 그림 넣기 · 구글 AI Pro(Gemini)로 미리 만들기

영상의 배경은 기본으로 픽셀 그림이 자동으로 그려져요. 그림이 더 풍성했으면 좋겠다면,
**수업 전에** Gemini로 배경 그림을 만들어 이 폴더에 넣으세요. 등장인물(픽셀 캐릭터)과 자막은 그 위에 자동으로 올라가요.
수업 중에 학생 글로 AI 그림을 만들지는 않아요. 그래서 비용도 0원이고, 엉뚱한 그림이 나올 걱정도 없어요.

## 넣는 방법 (3단계)

1. 아래 표의 **배경 이름**으로 그림 파일을 저장해요. 예: `classroom.png`
   - 낮 장면용을 따로 만들고 싶으면 `_day`를 붙여요. 예: `classroom_day.png`
   - 특정 주제에만 쓰고 싶으면 주제 폴더에 넣어요. 예: `night/rooftop.png` (주제 이름은 아래 표)
2. `list.json`에 넣은 파일 이름을 적어요.
   ```json
   ["classroom.png", "classroom_day.png", "night/rooftop.png"]
   ```
   `list.json`에 없는 그림은 쓰지 않아요 (없는 파일을 찾느라 느려지지 않게).
3. 사이트를 Netlify에 다시 올려요.

- 크기: **1280×720 (16:9)**, 500KB 이하 권장 (`.jpg`나 `.webp`가 가벼워요).
- 사람이나 글자는 넣지 마세요. 캐릭터는 프로그램이 올리고, 화면 아래쪽 1/4은 자막이 덮어요.

## 배경 이름과 쓰이는 때

학생이 쓴 '화면 묘사'와 이야기에 아래 단어가 나오면 그 배경이 골라져요.

| 배경 이름 | 장면 | 이런 단어가 나오면 |
|---|---|---|
| `dawn` | 해 뜨는 하늘, 마을 지붕 | sunrise, dawn, sun rose |
| `game` | 게임 속 세상 | video game, game world, level |
| `stage` | 학교 축제 무대 | stage, concert, festival, show |
| `palace` | 옛 궁궐, 한옥 마을 | palace, king, Joseon, hanok |
| `store` | 편의점 안 | store, shop, convenience, counter |
| `beach` | 섬 바닷가 | island, ocean, beach, boat |
| `space` | 우주, 낯선 행성 | planet, space, spaceship, alien |
| `rooftop` | 학교 옥상 | rooftop, roof |
| `letters` | 비밀의 방, 책장, 편지 | letter, envelope, library, shelf |
| `bedroom` | 내 방 | bedroom, bed, phone, woke up |
| `stairs` | 학교 계단 | stairs, upstairs |
| `hallway` | 학교 복도, 사물함 | hallway, locker, museum |
| `classroom` | 교실 | classroom, desk, blackboard, lab |
| `park` | 공원 | park, tree, garden, bench |
| `entrance` | 건물 입구, 문 | door, entrance, inside |
| `school` | 학교 건물 밖 | school, gate, building, window |
| `street` | 동네 길 | street, road, walk, town |
| `sky` | 그 밖의 모든 장면 (하늘) | (기본) |

낮 장면(`_day`)은 morning, afternoon, lunch, sunny, bright 같은 단어가 나올 때 쓰여요.

주제 폴더 이름: `night` The Night Before High School · `future` A Message from 2035 · `planet` New Kid from Another Planet · `cat` The Missing Cat Mystery · `game` Trapped in a Video Game · `festival` The School Festival Surprise · `time` Time Travel Field Trip · `store` The Magic Convenience Store · `robot` My Robot Friend · `island` The Island Not on the Map

## Gemini 프롬프트 예시

한 장씩 같은 스타일로 만들면 영상이 통일돼 보여요. 아래 문장을 그대로 쓰고 `[장면]`만 바꾸세요.

```
16:9 pixel art background for a school story video, 320x180 pixel style scaled up,
cozy and bright colors, Korean middle school setting, no people, no text, no logos,
empty lower quarter for subtitles. Scene: [a school classroom at night with moonlight through the windows]
```

장면 예시:
- `classroom`: a school classroom at night with moonlight through the windows
- `classroom_day`: a sunny school classroom in the morning
- `rooftop`: a school rooftop at night with city lights and stars
- `hallway`: a long school hallway with lockers and a clock
- `store`: inside a small Korean convenience store at night
- `space`: the surface of a strange purple planet with two moons

만든 그림은 교사가 한 번 훑어보고 넣어 주세요. 같은 그림은 모든 반, 모든 수업에서 다시 쓸 수 있어요.
