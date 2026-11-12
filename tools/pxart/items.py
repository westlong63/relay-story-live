"""HD items, obstacles, letter cubes, school and gates for the word run and hero."""
import os, math, random
import numpy as np
from PIL import Image
from lib import *

OUT = os.path.join(os.path.dirname(__file__), "out")
D = os.path.dirname(__file__)
F11B = os.path.join(D, "Galmuri11-Bold.ttf"); F11 = os.path.join(D, "Galmuri11.ttf"); F9 = os.path.join(D, "Galmuri9.ttf"); F7 = os.path.join(D, "Galmuri7.ttf")
INK = "#1d3566"


def outline(c, col=INK):
    a = c.a[:, :, 3] > 0
    ap = np.pad(a, 1)
    o = (ap[:-2, 1:-1] | ap[2:, 1:-1] | ap[1:-1, :-2] | ap[1:-1, 2:]) & ~a
    c.mask_paint(o, col)
    return c


def grow(c, p=1):
    n = Cv(c.w + 2 * p, c.h + 2 * p); n.paste_fast(c, p, p); return n


def cone():
    c = Cv(20, 24)
    for y in range(3, 21):
        half = 2 + (y - 3) * 0.42
        for x in range(20):
            dx = x + .5 - 10
            if abs(dx) <= half:
                t = (dx / half + 1) / 2
                col = "#ffb15a" if t < .28 else "#ff8a1f" if t < .72 else "#e2600c"
                if y in (8, 9, 14, 15): col = "#ffffff" if t < .72 else "#dfe6ee"
                c.px(x, y, col)
    c.rect(1, 20, 19, 23, "#3c434e"); c.rect(1, 20, 19, 21, "#646d7a")
    c.rect(8, 2, 12, 3, "#ffb15a")
    return grow(outline(c), 0)


def barrier():
    c = Cv(42, 26)
    # legs
    for lx in (6, 33):
        c.rect(lx, 9, lx + 3, 24, "#8f9aab"); c.rect(lx, 9, lx + 1, 24, "#d1d8e2")
        c.rect(lx - 3, 23, lx + 6, 26, "#4a5260")
    # board with diagonal red/white stripes
    for y in range(3, 13):
        for x in range(1, 41):
            k = (x + y) // 5 % 2
            col = "#e8362c" if k else "#ffffff"
            if y == 3: col = "#ff6b5f" if k else "#ffffff"
            if y == 12: col = "#b3221a" if k else "#d7dde6"
            c.px(x, y, col)
    # blinking lamp
    c.rect(19, 0, 23, 3, "#ffd23f"); c.px(20, 0, "#fff6c8")
    return outline(c)


def books():
    c = Cv(26, 20)
    stack = [(2, 14, 22, "#2d6fe0", "#1d4fb0"), (4, 9, 20, "#e8473c", "#b32a20"), (1, 4, 21, "#f3b52a", "#c98a10")]
    for (x0, y0, w, col, dark) in stack:
        c.rect(x0, y0, x0 + w, y0 + 5, col)
        c.rect(x0, y0 + 4, x0 + w, y0 + 5, dark)
        c.rect(x0 + w - 4, y0 + 1, x0 + w - 1, y0 + 4, "#f6f3ea")  # pages
        c.rect(x0 + 2, y0 + 1, x0 + 3, y0 + 4, "#ffffff")
    return outline(c)


def puddle():
    c = Cv(36, 10)
    for y in range(10):
        for x in range(36):
            if ((x + .5 - 18) / 17) ** 2 + ((y + .5 - 5) / 4.4) ** 2 <= 1:
                c.px(x, y, "#5aa7e8" if y > 4 else "#8cc8f4")
    for x in range(9, 15): c.px(x, 3, "#e6f4ff")
    for x in range(22, 25): c.px(x, 6, "#e6f4ff")
    return c


def coin(frame=0):
    w = [12, 9, 4, 9][frame]
    c = Cv(14, 14)
    x0 = 7 - w / 2
    for y in range(1, 13):
        for x in range(14):
            if ((x + .5 - 7) / (w / 2)) ** 2 + ((y + .5 - 7) / 6) ** 2 <= 1:
                t = (x - x0) / max(1, w)
                c.px(x, y, "#fff1a8" if t < .3 else "#ffd23f" if t < .75 else "#e0a020")
    if w > 6:
        c.rect(6, 4, 8, 10, "#e0a020"); c.rect(6, 4, 7, 10, "#fff6c8")
    return outline(c, "#7a4a10")


def cube(face=("#4f8dff", "#2f6fe8", "#1d4fc0"), size=20, icon=None):
    c = Cv(size + 2, size + 2)
    top = 3
    s = size
    for y in range(s):
        for x in range(s):
            if y < top:
                col = face[0] if x < s - 2 else face[1]
                if y == 0: col = "#ffffff" if 2 < x < s - 4 else face[0]
            else:
                t = (y - top) / (s - top)
                col = face[0] if t < .25 else face[1] if t < .8 else face[2]
                if x >= s - 3: col = face[2]
                if x == 1 and top < y < s - 3: col = "#ffffff"
            c.px(x + 1, y + 1, col)
    # glass highlight
    for i in range(3):
        c.px(3 + i, 7 - i, "#e9f2ff")
    if icon is not None:
        icon(c, s)
    return outline(c, "#14306e")


def heart_icon(c, s):
    pat = [".##.##.", "#######", "#######", ".#####.", "..###..", "...#..."]
    ox, oy = (s + 2) // 2 - 3, (s + 2) // 2 - 2
    for y, r in enumerate(pat):
        for x, ch in enumerate(r):
            if ch == "#": c.px(ox + x, oy + y, "#ffffff")


def shield_icon(c, s):
    pat = ["#######", "#######", "#######", ".#####.", ".#####.", "..###..", "...#..."]
    ox, oy = (s + 2) // 2 - 3, (s + 2) // 2 - 3
    for y, r in enumerate(pat):
        for x, ch in enumerate(r):
            if ch == "#": c.px(ox + x, oy + y, "#fff6c8" if x < 3 else "#ffffff")


def letter_sheet():
    cell = 22
    sheet = Cv(cell * 26, cell)
    for i, ch in enumerate("ABCDEFGHIJKLMNOPQRSTUVWXYZ"):
        c = cube(size=20)
        m = text_mask(ch, F11B, 12)
        sh = np.zeros((m.shape[0] + 1, m.shape[1] + 1), bool); sh[1:, 1:] = m
        ox = 11 - m.shape[1] // 2; oy = 12 - m.shape[0] // 2
        c.mask_paint(sh, "#14306e", ox, oy)
        c.mask_paint(m, "#ffffff", ox, oy)
        sheet.paste_fast(c, i * cell, 0)
    return sheet


# ---------- buildings ----------
def school(w=170, h=118):
    c = Cv(w, h)
    rnd = random.Random(5)
    base = h - 2
    # main block
    bx0, bx1, by0 = 6, w - 6, 40
    for y in range(by0, base):
        for x in range(bx0, bx1):
            t = (x - bx0) / (bx1 - bx0)
            c.px(x, y, "#f6ead2" if t < .82 else "#e3d2b2")
    # floors stripes
    for fy in range(by0 + 22, base, 22): c.rect(bx0, fy, bx1, fy + 2, "#d8c39c")
    # windows
    for fy in range(by0 + 6, base - 10, 22):
        for wx in range(bx0 + 6, bx1 - 10, 14):
            if abs(wx + 5 - w // 2) < 14: continue
            c.rect(wx, fy, wx + 10, fy + 12, "#3f6fc4")
            c.rect(wx + 1, fy + 1, wx + 9, fy + 11, "#7fb1ef")
            c.rect(wx + 1, fy + 1, wx + 4, fy + 6, "#c8e2fb")
            c.rect(wx + 5, fy, wx + 6, fy + 12, "#3f6fc4")
    # roof
    c.rect(bx0 - 4, by0 - 5, bx1 + 4, by0, "#c9473b"); c.rect(bx0 - 4, by0 - 5, bx1 + 4, by0 - 4, "#e7695c")
    c.rect(bx0 - 4, by0 - 1, bx1 + 4, by0, "#8f2c24")
    # clock tower
    tx0, tx1 = w // 2 - 15, w // 2 + 15
    for y in range(8, base):
        for x in range(tx0, tx1):
            c.px(x, y, "#fbf2df" if x < tx1 - 5 else "#e6d6b6")
    c.rect(tx0 - 3, 4, tx1 + 3, 9, "#c9473b"); c.rect(tx0 - 3, 4, tx1 + 3, 5, "#e7695c")
    c.rect(w // 2 - 1, 0, w // 2 + 1, 4, "#8f2c24")
    # clock
    for y in range(12, 30):
        for x in range(tx0 + 3, tx1 - 3):
            d = math.hypot(x + .5 - w / 2, y + .5 - 21)
            if d < 9: c.px(x, y, "#ffffff" if d < 7.5 else "#1d3566")
    c.rect(w // 2, 15, w // 2 + 1, 22, "#1d3566"); c.rect(w // 2, 21, w // 2 + 5, 22, "#1d3566")
    # sign plate
    m = text_mask("SINSEO", F11B, 12)
    pw = m.shape[1] + 10
    px0 = w // 2 - pw // 2
    c.rect(px0, 33, px0 + pw, 33 + m.shape[0] + 6, "#1c479a"); c.rect(px0, 33, px0 + pw, 34, "#3d6fd0")
    c.mask_paint(m, "#ffffff", px0 + 5, 36)
    # door
    c.rect(w // 2 - 9, base - 22, w // 2 + 9, base, "#2b4f9a"); c.rect(w // 2 - 8, base - 21, w // 2 + 8, base, "#6fa2e8")
    c.rect(w // 2, base - 21, w // 2 + 1, base, "#2b4f9a")
    c.rect(w // 2 - 7, base - 20, w // 2 - 3, base - 12, "#bfe0ff")
    c.rect(bx0 - 2, base, bx1 + 2, h, "#b9a682")
    return outline(c, "#5a4a3a")


def cherry(seed=1, w=40, h=46):
    rnd = random.Random(seed)
    circ = [(w / 2 + rnd.uniform(-10, 10), 14 + rnd.uniform(-6, 6), rnd.uniform(6, 10)) for _ in range(9)]
    t = shaded_blob(w, h - 12, circ, ["#e889ad", "#f4a9c4", "#ffc9dc", "#ffe6ef"], light=(0.5, -0.85), noise=0.3, seed=seed)
    c = Cv(w, h)
    c.rect(w // 2 - 2, 18, w // 2 + 2, h, "#7a5236"); c.rect(w // 2 - 2, 18, w // 2 - 1, h, "#9c6b48")
    c.paste_fast(t, 0, 0)
    return c


def arch(text, sub, color=("#2d6fe0", "#1d4fb0", "#5b95f5"), pillar=("#a54a32", "#7f3524", "#c76a50"), w=168, h=120, brick=True):
    c = Cv(w, h)
    pw = 16
    for x0 in (4, w - 4 - pw):
        for y in range(26, h):
            for x in range(x0, x0 + pw):
                col = pillar[0]
                if brick and ((y // 5) % 2 == 0 and (x - x0) % 8 == 0 or (y // 5) % 2 == 1 and (x - x0 + 4) % 8 == 0 or y % 5 == 0): col = pillar[1]
                if x == x0: col = pillar[2]
                c.px(x, y, col)
        c.rect(x0 - 2, 34, x0 + pw + 2, 39, pillar[1]); c.rect(x0 - 2, 34, x0 + pw + 2, 35, pillar[2])
    # banner
    c.rect(0, 2, w, 36, color[1]); c.rect(2, 4, w - 2, 34, color[0]); c.rect(2, 4, w - 2, 5, color[2])
    m = text_mask(text, F11B, 12)
    sh = np.zeros((m.shape[0] + 1, m.shape[1] + 1), bool); sh[1:, 1:] = m
    ox = w // 2 - m.shape[1] // 2
    c.mask_paint(sh, color[1], ox, 7); c.mask_paint(m, "#ffffff", ox, 7)
    if sub:
        m2 = text_mask(sub, F9, 10)
        c.mask_paint(m2, "#e6f0ff", w // 2 - m2.shape[1] // 2, 7 + m.shape[0] + 4)
    return outline(c, "#14306e")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    A = {
        "cone": cone(), "barrier": barrier(), "books": books(), "puddle": puddle(),
        "coin0": coin(0), "coin1": coin(1), "coin2": coin(2), "coin3": coin(3),
        "cube_heart": cube(("#ff7a8a", "#e8364a", "#b01c2e"), icon=heart_icon),
        "cube_shield": cube(("#ffd75a", "#f0b31c", "#c4860c"), icon=shield_icon),
        "letters": letter_sheet(),
        "school": school(), "cherry1": cherry(1), "cherry2": cherry(2),
        "gate_finish": arch("SINSEO MIDDLE SCHOOL", "신서중학교 정문 · FINISH"),
        "gate_start": arch("START  ·  CAU", "중앙대학교에서 출발!", color=("#2d6fe0", "#1d4fb0", "#5b95f5"), pillar=("#e9eef6", "#b7c3d4", "#ffffff"), brick=False),
    }
    for k, v in A.items(): v.save(os.path.join(OUT, k + ".png"))
    # contact sheet
    sheet = Image.new("RGBA", (900, 260), (234, 242, 252, 255)); x = 4; y = 4; rowh = 0
    for k, v in A.items():
        im = v.img()
        if x + im.width > 900: x = 4; y += rowh + 6; rowh = 0
        sheet.alpha_composite(im, (x, y)); x += im.width + 6; rowh = max(rowh, im.height)
    sheet.resize((1800, 520), Image.NEAREST).save(os.path.join(OUT, "items_sheet.png"))
    print("ok")
