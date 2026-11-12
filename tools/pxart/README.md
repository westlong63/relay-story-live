# 픽셀 그림 만들기 (assets/px)

사이트의 고해상도 픽셀 그림은 모두 이 폴더의 Python 스크립트로 만듭니다. 사이트를 돌릴 때는 필요 없어요.

준비: Python 3, `pip install numpy pillow`, 같은 폴더에 Galmuri 글꼴 TTF
(`npm pack galmuri` 로 받은 묶음의 dist 폴더에서 Galmuri11.ttf, Galmuri11-Bold.ttf, Galmuri9.ttf, Galmuri7.ttf).

| 스크립트 | 만드는 그림 |
|---|---|
| scene.py | 하늘, 해, 구름, 빌딩, 가로수, 펜스, 도로, 덤불 |
| items.py | 장애물, 동전, 큐브, 글자, 신서중, 벚나무, 출발·도착 문 |
| puang_trace.py | **지금 쓰는 푸앙이** 64×88 동작 11가지. 푸앙런 홍보 카드 두 장에서 원래 픽셀 격자(가로 2.6875px, 세로 2.445px)대로 달리기·점프를 따옵니다. `python3 puang_trace.py <도로 위 세 마리 카드> <게임 방법 카드> [out]`. 카드 사진은 행사 로고가 있어서 저장소에 넣지 않았어요. 결과 확인용: puang_trace_preview.png |
| puang2.py | 예전에 직접 그린 푸앙이 64×64 (지금은 안 써요, 되돌릴 때를 위해 남김) |
| pond.py | 낚시터 3곳 (높이 200, 수평선 68, 땅 130) |
| compose.py | 미리보기 합성 (확인용) |

`python3 scene.py` 처럼 돌리면 out/ 에 PNG가 생겨요. 확인한 뒤 assets/px/ 로 복사합니다.
