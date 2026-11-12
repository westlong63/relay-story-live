# 픽셀 그림 만들기 (assets/px)

사이트의 고해상도 픽셀 그림은 모두 이 폴더의 Python 스크립트로 만듭니다. 사이트를 돌릴 때는 필요 없어요.

준비: Python 3, `pip install numpy pillow`, 같은 폴더에 Galmuri 글꼴 TTF
(`npm pack galmuri` 로 받은 묶음의 dist 폴더에서 Galmuri11.ttf, Galmuri11-Bold.ttf, Galmuri9.ttf, Galmuri7.ttf).

| 스크립트 | 만드는 그림 |
|---|---|
| scene.py | 하늘, 해, 구름, 빌딩, 가로수, 펜스, 도로, 덤불 |
| items.py | 장애물, 동전, 큐브, 글자, 신서중, 벚나무, 출발·도착 문 |
| puang2.py | 푸앙이 64×64 동작 11가지 (run0~3, jump, hurt, stand, blink, wow, cheer, fish) |
| pond.py | 낚시터 3곳 (높이 200, 수평선 68, 땅 130) |
| compose.py | 미리보기 합성 (확인용) |

`python3 scene.py` 처럼 돌리면 out/ 에 PNG가 생겨요. 확인한 뒤 assets/px/ 로 복사합니다.
