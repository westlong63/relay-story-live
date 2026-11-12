#!/usr/bin/env python3
"""푸앙런 푸앙이를 그대로 옮겨 오기 (2026-11-12, 서경 요청: "그냥 푸앙런에서 가져다 써")

중앙대 개교 110주년 미니게임 <푸앙런> 안내 카드 두 장(서경이 올려 준 그림)에 찍힌 푸앙이를
원래 픽셀 칸 크기(가로 2.6875px, 세로 2.445px)로 다시 읽어서 그대로 옮깁니다. 새로 그리지 않아요.
  - 달리는 모습: 같은 그림 5개를 칸 맞춰 겹친 뒤 가운데 값(중앙값) → 뒤에 깔린 도로·차선이 사라져요
  - 뛰는 모습: 그림 2개 (색은 첫 번째 것, 배경 지우기는 두 장을 같이 봐요)
카드에는 이 두 동작만 있어서 run0~3은 달리는 모습을 위아래로 살짝 튕기고, 나머지 동작은 두 그림을 나눠 씁니다.

쓰는 법:  python3 puang_trace.py <게임 설명 카드(차선 3개)> <조작 설명 카드(SPACE)> [저장 폴더=../../assets/px]
카드 그림에는 행사 로고가 있어서 저장소에 넣지 않았어요.
"""
import sys, os
from collections import deque
import numpy as np
from PIL import Image

PX, PY = 2.6875, 2.445          # 카드에서 푸앙이 한 칸의 크기 (가로, 세로)
CW, CH, FOOT = 64, 88, 84       # 그림 한 장 크기와 발바닥 높이 (게임이 이 값으로 그려요)
RUN = [(0, (152, 1020, 330, 1245)), (0, (852, 1150, 1030, 1375)), (1, (745, 975, 925, 1195)), (1, (85, 1170, 265, 1390)), (1, (165, 985, 345, 1215))]
JUMP = [(0, (525, 950, 715, 1175)), (1, (915, 880, 1105, 1100))]


def resid(a, phx, phy):
    """칸마다 한 색이라고 볼 때 남는 오차 (칸 위치 맞추기용)"""
    H, W, _ = a.shape
    xi = np.floor((np.arange(W) + 0.5 - phx) / PX).astype(int); yi = np.floor((np.arange(H) + 0.5 - phy) / PY).astype(int)
    xi -= xi.min(); yi -= yi.min(); nx, ny = xi.max() + 1, yi.max() + 1
    idx = (yi[:, None] * nx + xi[None, :]).ravel(); cnt = np.maximum(np.bincount(idx, minlength=nx * ny), 1); tot = 0
    for c in range(3):
        v = a[:, :, c].ravel(); s = np.bincount(idx, weights=v, minlength=nx * ny); s2 = np.bincount(idx, weights=v * v, minlength=nx * ny)
        tot += (s2 - s * s / cnt).sum()
    return tot


def cells(a):
    """카드 조각 → 원래 픽셀 칸 (칸 가운데 색을 읽어요)"""
    _, phx, phy = min((resid(a, x, y), x, y) for x in np.arange(0, PX, 0.1) for y in np.arange(0, PY, 0.1))
    H, W, _ = a.shape; nx, ny = int((W - phx) / PX), int((H - phy) / PY); out = np.zeros((ny, nx, 3))
    for j in range(ny):
        for i in range(nx):
            x = min(max(phx + (i + 0.5) * PX - 0.5, 0), W - 1.001); y = min(max(phy + (j + 0.5) * PY - 0.5, 0), H - 1.001)
            x0, y0 = int(x), int(y); fx, fy = x - x0, y - y0
            out[j, i] = a[y0, x0] * (1 - fx) * (1 - fy) + a[y0, x0 + 1] * fx * (1 - fy) + a[y0 + 1, x0] * (1 - fx) * fy + a[y0 + 1, x0 + 1] * fx * fy
    return out


def is_road(c):
    r, g, b = c[..., 0], c[..., 1], c[..., 2]; lum = (r + g + b) / 3
    return (np.abs(r - g) < 16) & (np.abs(b - g) < 20) & (b - r < 26) & (lum > 45) & (lum < 135)


def is_line(c):  # 뒤에 깔린 흰 차선
    lum = c.mean(axis=-1); return (c.max(axis=-1) - c.min(axis=-1) < 28) & (lum > 120) & (lum < 215)


def align(ref, c):
    """c를 ref와 같은 칸에 맞춰요 (칸 단위로 밀기)"""
    f = lambda v: np.abs(v[..., 2] - v[..., 0]) + np.abs(v[..., 1] - v[..., 0])
    fr, fc, best = f(ref), f(c), None
    for dy in range(-14, 15):
        for dx in range(-14, 15):
            y0, y1 = max(0, -dy), min(ref.shape[0], c.shape[0] - dy); x0, x1 = max(0, -dx), min(ref.shape[1], c.shape[1] - dx)
            if y1 - y0 < 50 or x1 - x0 < 40: continue
            d = np.abs(fr[y0:y1, x0:x1] - fc[y0 + dy:y1 + dy, x0 + dx:x1 + dx]).mean()
            if best is None or d < best[0]: best = (d, dx, dy)
    _, dx, dy = best; out = np.full(ref.shape, np.nan)
    y0, y1 = max(0, -dy), min(ref.shape[0], c.shape[0] - dy); x0, x1 = max(0, -dx), min(ref.shape[1], c.shape[1] - dx)
    out[y0:y1, x0:x1] = c[y0 + dy:y1 + dy, x0 + dx:x1 + dx]
    return out


def outside(bg):
    """가장자리에서 배경을 따라 번져 가며 바깥쪽을 찾아요"""
    H, W = bg.shape; out = np.zeros((H, W), bool); q = deque()
    for y in range(H):
        for x in range(W):
            if y in (0, H - 1) or x in (0, W - 1): out[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            yy, xx = y + dy, x + dx
            if 0 <= yy < H and 0 <= xx < W and not out[yy, xx] and bg[yy, xx]: out[yy, xx] = True; q.append((yy, xx))
    return out


def biggest(mask):
    H, W = mask.shape; lab = np.zeros((H, W), int); n = 0; best = (0, 0)
    for y in range(H):
        for x in range(W):
            if mask[y, x] and not lab[y, x]:
                n += 1; q = deque([(y, x)]); lab[y, x] = n; cnt = 0
                while q:
                    a, b = q.popleft(); cnt += 1
                    for dy in (-1, 0, 1):
                        for dx in (-1, 0, 1):
                            yy, xx = a + dy, b + dx
                            if 0 <= yy < H and 0 <= xx < W and mask[yy, xx] and not lab[yy, xx]: lab[yy, xx] = n; q.append((yy, xx))
                if cnt > best[0]: best = (cnt, n)
    return lab == best[1]


def tidy(a):
    """혼자 삐져나온 점 지우기"""
    for _ in range(2):
        p = np.pad(a, 1); n = p[:-2, 1:-1].astype(int) + p[2:, 1:-1] + p[1:-1, :-2] + p[1:-1, 2:]
        a = a & (n >= 2)
    return biggest(a)


def sprite(rgb, alpha):
    ys, xs = np.where(alpha); x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    out = np.zeros((y1 - y0 + 1, x1 - x0 + 1, 4), "uint8")
    out[..., :3] = rgb[y0:y1 + 1, x0:x1 + 1].round().clip(0, 255); out[..., 3] = np.where(alpha[y0:y1 + 1, x0:x1 + 1], 255, 0)
    out[out[..., 3] == 0] = 0
    return Image.fromarray(out, "RGBA")


def trace(cards):
    crop = lambda k, box: cards[k][box[1]:box[3], box[0]:box[2]]
    # 달리기: 5장을 겹쳐 중앙값
    rs = [cells(crop(k, b)) for k, b in RUN]; st = np.stack([rs[0]] + [align(rs[0], c) for c in rs[1:]])
    med = np.nanmedian(st, axis=0)
    road = (np.stack([is_road(np.nan_to_num(r, nan=90.0)) for r in st]).sum(axis=0) >= 3) | is_road(med)
    a = biggest(~outside(road)) & ~road       # 팔과 꼬리 사이로 보이는 길도 비워요
    run = sprite(med, tidy(a))
    # 점프: 색은 첫 장, 배경은 두 장을 같이 보고 지워요
    j0 = cells(crop(*JUMP[0])); j1 = align(j0, cells(crop(*JUMP[1]))); j1 = np.where(np.isnan(j1), j0, j1)
    bg = is_road(j0) | (is_line(j0) & (is_road(j1) | is_line(j1)) & (np.abs(j0 - j1).sum(axis=2) > 45))
    aj = biggest(~outside(bg)) & ~is_road(j0)
    jump = sprite(j0, tidy(aj))
    return run, jump


def cell(sp, dy=0):
    im = Image.new("RGBA", (CW, CH), (0, 0, 0, 0))
    im.paste(sp, ((CW - sp.width) // 2, FOOT - sp.height + dy))
    return im


def main():
    if len(sys.argv) < 3: print(__doc__); sys.exit(1)
    cards = [np.asarray(Image.open(p).convert("RGB"), dtype=float) for p in sys.argv[1:3]]
    out = sys.argv[3] if len(sys.argv) > 3 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "assets", "px")
    run, jump = trace(cards)
    print("run", run.size, "jump", jump.size)
    poses = {"run0": cell(run), "run1": cell(run, -1), "run2": cell(run, -2), "run3": cell(run, -1),
             "jump": cell(jump), "cheer": cell(jump), "wow": cell(jump),
             "hurt": cell(run), "stand": cell(run), "blink": cell(run), "fish": cell(run)}
    for n, im in poses.items(): im.save(os.path.join(out, n + ".png"), optimize=True)
    sheet = Image.new("RGB", (CW * 2 * 6 + 8, CH * 6), (120, 150, 200))
    for i, im in enumerate((poses["run0"], poses["jump"])):
        big = im.resize((CW * 6, CH * 6), Image.NEAREST); sheet.paste(big, (i * (CW * 6 + 8), 0), big)
    sheet.save(os.path.join(out, "..", "..", "tools", "pxart", "puang_trace_preview.png") if len(sys.argv) <= 3 else os.path.join(out, "_preview.png"))


if __name__ == "__main__":
    main()
