"""HD layers for the fishing ponds (신서중 연못 / 산호 바다 / 중앙대 청룡연못).
Pond canvas is 200 px tall: horizon y=68, ground (where Puang stands) y=130."""
import os, math, random
import numpy as np
from lib import *
from items import outline

OUT = os.path.join(os.path.dirname(__file__), "out")
F7 = os.path.join(os.path.dirname(__file__), "Galmuri7.ttf")
HZ, GY = 68, 130


def vtile(tones, h, w=8, gamma=1.0):
    c = Cv(w, h)
    for y in range(h):
        for x in range(w):
            c.px(x, y, dither_pick(tones, (y / max(1, h - 1)) ** gamma, x, y))
    return c


# ---------- 신서중 연못 (day) ----------
def far_trees(w=512, h=26, seed=12):
    rnd = random.Random(seed)
    circ = []
    x = -6
    while x < w + 6:
        r = rnd.uniform(6, 10)
        circ.append((x, h - r * .7 + rnd.uniform(-2, 1), r)); x += r * rnd.uniform(.8, 1.2)
    for _ in range(int(w / 10)):
        circ.append((rnd.uniform(0, w), h * rnd.uniform(.4, .7), rnd.uniform(4, 7)))
    circ.sort(key=lambda c: -c[1])
    return shaded_blob(w, h, circ, ["#2f7a62", "#3f8f6c", "#56a57a", "#76bd8c", "#9ad3a6"], light=(0.45, -0.9), noise=0.35, seed=seed)


def mini_school(w=100, h=58):
    c = Cv(w, h)
    base = h - 1
    bx0, bx1, by0 = 4, w - 4, 24
    for y in range(by0, base):
        for x in range(bx0, bx1):
            c.px(x, y, "#f6ead2" if (x - bx0) / (bx1 - bx0) < .84 else "#e3d2b2")
    c.rect(bx0, by0 + 15, bx1, by0 + 16, "#d8c39c")
    for fy in (by0 + 4, by0 + 19):
        for wx in range(bx0 + 4, bx1 - 6, 9):
            if abs(wx + 3 - w // 2) < 15: continue
            c.rect(wx, fy, wx + 6, fy + 8, "#3f6fc4"); c.rect(wx + 1, fy + 1, wx + 5, fy + 7, "#7fb1ef"); c.rect(wx + 1, fy + 1, wx + 3, fy + 4, "#c8e2fb")
    c.rect(bx0 - 3, by0 - 4, bx1 + 3, by0, "#c9473b"); c.rect(bx0 - 3, by0 - 4, bx1 + 3, by0 - 3, "#e7695c"); c.rect(bx0 - 3, by0 - 1, bx1 + 3, by0, "#8f2c24")
    tx0, tx1 = w // 2 - 12, w // 2 + 12
    for y in range(6, base):
        for x in range(tx0, tx1):
            c.px(x, y, "#fbf2df" if x < tx1 - 4 else "#e6d6b6")
    c.rect(tx0 - 2, 3, tx1 + 2, 7, "#c9473b"); c.rect(tx0 - 2, 3, tx1 + 2, 4, "#e7695c"); c.rect(w // 2 - 1, 0, w // 2 + 1, 3, "#8f2c24")
    for y in range(8, 22):
        for x in range(tx0 + 2, tx1 - 2):
            d = math.hypot(x + .5 - w / 2, y + .5 - 15)
            if d < 6.5: c.px(x, y, "#ffffff" if d < 5.2 else "#1d3566")
    c.rect(w // 2, 11, w // 2 + 1, 16, "#1d3566"); c.rect(w // 2, 15, w // 2 + 4, 16, "#1d3566")
    m = text_mask("SINSEO", F7, 8)
    pw = m.shape[1] + 6; px0 = w // 2 - pw // 2
    c.rect(px0, 25, px0 + pw, 25 + m.shape[0] + 4, "#1c479a"); c.rect(px0, 25, px0 + pw, 26, "#3d6fd0")
    c.mask_paint(m, "#ffffff", px0 + 3, 27)
    c.rect(w // 2 - 6, base - 13, w // 2 + 6, base, "#2b4f9a"); c.rect(w // 2 - 5, base - 12, w // 2 + 5, base, "#6fa2e8"); c.rect(w // 2, base - 12, w // 2 + 1, base, "#2b4f9a")
    return outline(c, "#5a4a3a")


def mini_cherry(seed=1, w=28, h=30):
    rnd = random.Random(seed)
    circ = [(w / 2 + rnd.uniform(-6, 6), 10 + rnd.uniform(-4, 4), rnd.uniform(4.5, 6.5)) for _ in range(8)]
    t = shaded_blob(w, h - 8, circ, ["#e889ad", "#f4a9c4", "#ffc9dc", "#ffe6ef"], light=(0.5, -0.85), noise=0.3, seed=seed)
    c = Cv(w, h)
    c.rect(w // 2 - 1, 12, w // 2 + 2, h, "#7a5236"); c.rect(w // 2 - 1, 12, w // 2, h, "#9c6b48")
    c.paste_fast(t, 0, 0)
    return c


def bank_mask(w, h, top, edge0, slope=0.32):
    yy, xx = np.mgrid[0:h, 0:w]
    m = (yy >= top) & (xx < edge0 + (yy - top) * slope)
    # rounded lip at the water edge
    lip = (yy < top + 3) & (xx > edge0 - 3 + (top + 3 - yy))
    return m & ~lip


def grass_bank(w=130, h=94, top=24, edge0=90, seed=3):
    rnd = random.Random(seed)
    c = Cv(w, h)
    m = bank_mask(w, h, top, edge0)
    DIRT = ["#5c3b1e", "#6e4726", "#83552e", "#9c6b3e", "#b07d4a"]
    GR = ["#2f7d3a", "#3f9442", "#56ab4a", "#76c45a", "#9bdc72"]
    for y in range(h):
        for x in range(w):
            if not m[y, x]: continue
            e = edge0 + (y - top) * 0.32
            if y < top + 7:
                t = 0.95 - (y - top) / 7 * .8 - (x / w) * .15
                c.px(x, y, dither_pick(GR, t, x, y))
            else:
                band = ((y - top - 7) // 6) % 2
                t = 0.75 - (y - top) / (h - top) * .6 - band * .12 - (1 - min(1, (e - x) / 18)) * .25
                c.px(x, y, dither_pick(DIRT, t, x, y))
    # grass fringe hanging over the dirt
    for x in range(0, int(edge0 + 2)):
        d = rnd.randint(0, 3)
        for k in range(d): c.px(x, top + 7 + k, "#3f9442" if k < d - 1 else "#2f7d3a")
    # stones in the dirt
    for _ in range(9):
        sx, sy = rnd.randint(4, 80), rnd.randint(top + 14, h - 6)
        if m[sy, min(w - 1, sx + 6)]:
            c.rect(sx, sy, sx + 6, sy + 3, "#8a7a6a"); c.rect(sx + 1, sy - 1, sx + 5, sy, "#a89886"); c.rect(sx + 1, sy, sx + 3, sy + 1, "#c4b6a4")
    # edge line
    for y in range(top, h):
        e = int(edge0 + (y - top) * 0.32)
        if y >= top + 3: c.px(e, y, "#3e2611")
    # flowers on the grass
    for fx in (12, 30, 61, 74):
        fy = top + 1 + rnd.randint(0, 2)
        col = rnd.choice(["#ffffff", "#ffd84a", "#f5a3c7"])
        c.px(fx, fy, col); c.px(fx - 1, fy + 1, col); c.px(fx + 1, fy + 1, col); c.px(fx, fy + 2, col); c.px(fx, fy + 1, "#ffb020")
    # reeds / cattails at the water edge
    for i, (rx, rh) in enumerate([(edge0 + 2, 22), (edge0 + 6, 28), (edge0 + 10, 19), (edge0 + 14, 25), (edge0 - 3, 16)]):
        rx = int(rx); y0 = top + 10
        for k in range(rh):
            bend = int(round(math.sin(k / rh * 1.4) * (1 if i % 2 else -1)))
            c.px(rx + bend, y0 - k, "#3f7f34" if k % 5 else "#2f6a28"); c.px(rx + bend + 1, y0 - k, "#5fa548")
        hx = rx + int(round(math.sin(1.4) * (1 if i % 2 else -1)))
        c.rect(hx - 1, y0 - rh - 5, hx + 2, y0 - rh + 1, "#6b3f1f"); c.rect(hx, y0 - rh - 5, hx + 1, y0 - rh - 2, "#8a5530")
        c.px(hx, y0 - rh - 7, "#5fa548"); c.px(hx, y0 - rh - 6, "#5fa548")
    for k in range(10):  # leaves
        lx = int(edge0) - 6 + k * 2
        for j in range(5 + k % 3):
            c.px(lx + (j // 2) * (1 if k % 2 else -1), top + 9 - j, "#4f9a3f" if j % 2 else "#6fbb55")
    return c


def lily(flower=False, w=30, h=14):
    c = Cv(w, h)
    cx, cy, rx, ry = w / 2, h / 2 + 2, 13, 5
    for y in range(h):
        for x in range(w):
            d = ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2
            if d <= 1 and not (x > cx and abs(y + .5 - cy) < 1.1):
                t = 0.85 - (y - cy + ry) / (2 * ry) * .7
                c.px(x, y, "#2f6a2a" if d > .8 else dither_pick(["#3e8a3a", "#56a84a", "#78c460"], t, x, y))
    c.rect(int(cx) - 6, int(cy) - 2, int(cx) - 2, int(cy) - 1, "#9ad884")
    if flower:
        fx, fy = int(cx) - 4, int(cy) - 4
        for (a, b, col) in [(0, -3, "#ffd6e6"), (-2, -2, "#f5a3c7"), (2, -2, "#f5a3c7"), (-3, 0, "#e87fae"), (3, 0, "#e87fae"), (0, -1, "#ffe6ef"), (-1, -1, "#ffd6e6"), (1, -1, "#ffd6e6"), (0, 0, "#ffd84a")]:
            c.px(fx + a, fy + b, col)
    return c


# ---------- 산호 바다 (sunset) ----------
def sunset_sun(r=30):
    w, h = r * 2 + 16, r + 8
    c = Cv(w, h)
    cx, cy = w / 2, h
    for y in range(h):
        for x in range(w):
            d = math.hypot(x + .5 - cx, y + .5 - cy)
            if d < r:
                t = (y / h)
                if y > h * .55 and (y % 5) in (0,) : continue  # retro stripes
                c.px(x, y, dither_pick(["#fff3b0", "#ffd27a", "#ffb05a", "#ff8a4a"], t, x, y))
            elif d < r + 6 and BAYER4[y % 4, x % 4] < (1 - (d - r) / 6) * .6:
                c.px(x, y, "#ffc48a")
    return c


def island(w=86, h=46):
    c = Cv(w, h)
    rnd = random.Random(8)
    cx = w * .45
    for y in range(h - 9, h):
        hw = 30 * math.sqrt(max(0, 1 - ((h - y) / 9) ** 2 * .9))
        for x in range(int(cx - hw), int(cx + hw)):
            t = 0.9 - (y - h + 9) / 9 * .7 - (x - cx + hw) / (2 * hw + 1) * .25
            c.px(x, y, dither_pick(["#9a6a4a", "#c48a5a", "#e0b070", "#f4cc8a"], 1 - t, x, y) if False else dither_pick(["#a8704a", "#c88c5a", "#e0b070", "#f2c98a"], t, x, y))
    # trunk (curved)
    pts = [(cx + 2 + math.sin(k / 26 * 1.2) * 7, h - 8 - k) for k in range(27)]
    for i, (px, py) in enumerate(pts):
        col = "#6a4022" if i % 4 == 0 else "#8a5a2b"
        c.rect(int(px) - 1, int(py), int(px) + 2, int(py) + 1, col); c.px(int(px) + 1, int(py), "#a8703a")
    tx, ty = int(pts[-1][0]), int(pts[-1][1])
    # fronds
    for ang, ln in [(-2.6, 18), (-2.0, 15), (-0.6, 18), (-1.2, 14), (0.2, 15), (2.9, 14)]:
        for k in range(ln):
            fx = tx + math.cos(ang) * k
            fy = ty + math.sin(ang) * k + (k / ln) ** 2 * 7
            c.rect(int(fx), int(fy), int(fx) + 2, int(fy) + 2, "#2f6a3a")
            if k % 2 == 0: c.px(int(fx), int(fy) + 2, "#1f4f2a")
            if k > 3: c.px(int(fx), int(fy) - 1, "#4f9a5a")
    c.rect(tx - 2, ty - 1, tx + 3, ty + 3, "#3a2010"); c.px(tx - 1, ty, "#6a4022"); c.px(tx + 1, ty + 1, "#6a4022")
    return outline(c, "#3a2a40")


def pier(w=130, h=94, top=24, end=104):
    c = Cv(w, h)
    PL = ["#7a4a24", "#9a6232", "#b47a42", "#cf9658"]
    for y in range(top, top + 8):
        for x in range(0, end):
            seg = (x // 13) % 2
            t = 0.85 - (y - top) / 8 * .5 - seg * .12
            col = dither_pick(PL, t, x, y)
            if x % 13 == 0: col = "#5c3618"
            c.px(x, y, col)
        if y == top: c.rect(0, y, end, y + 1, "#e8b47a")
    for x in range(6, end, 13): c.px(x, top + 3, "#4a2a12")
    c.rect(0, top + 8, end, top + 11, "#4a2a12")
    for px in (8, 50, end - 10):
        for y in range(top + 11, h):
            for x in range(px, px + 7):
                c.px(x, y, "#5a3a1a" if x == px else dither_pick(["#4a2a12", "#6a4022", "#7a4a24"], .9 - (y - top) / h, x, y))
        c.rect(px - 1, top + 8, px + 8, top + 12, "#6a4022")
    # rope + buoy
    for k in range(18): c.px(end - 16 + k, top + 12 + int(math.sin(k / 17 * math.pi) * 5), "#e8d8b0")
    return c


# ---------- 청룡연못 (night) ----------
def night_city(w=512, h=56, seed=5):
    rnd = random.Random(seed)
    c = Cv(w, h)
    x = -6
    i = 0
    while x < w:
        tw = rnd.randint(16, 30); th = rnd.randint(16, h - 10)
        if 230 <= x < 262 and not getattr(night_city, "done", False): th, tw = h - 4, max(tw, 34); night_city.done = True
        top = h - th
        for y in range(top, h):
            for xx in range(x, x + tw):
                side = xx - x > tw * .78
                c.px(xx, y, "#131d48" if side else dither_pick(["#16224f", "#1c2b5e", "#22346c"], .9 - (y - top) / th * .7, xx, y))
        c.rect(x, top - 1, x + tw, top, "#2c3d78")
        for y in range(top + 3, h - 2, 4):
            for xx in range(x + 2, x + tw - 3, 4):
                r = rnd.random()
                if r > .5: c.rect(xx, y, xx + 2, y + 2, "#ffd86b" if r > .62 else "#ffb84a")
                elif r > .35: c.rect(xx, y, xx + 2, y + 2, "#33468a")
        if th == h - 4:
            m = text_mask("CAU", F7, 8)
            sw = m.shape[1] + 8; sx = x + (tw - sw) // 2
            c.rect(sx, top + 3, sx + sw, top + 5 + m.shape[0] + 2, "#2c67be"); c.rect(sx, top + 3, sx + sw, top + 4, "#5b95f5")
            c.mask_paint(m, "#ffffff", sx + 4, top + 5)
            c.rect(x + tw // 2, top - 9, x + tw // 2 + 1, top - 1, "#2c3d78"); c.px(x + tw // 2, top - 10, "#ff5a5a")
        x += tw + rnd.randint(0, 3); i += 1
    return c


def moon(r=10):
    s = r * 2 + 12
    c = Cv(s, s)
    cx = cy = s / 2
    for y in range(s):
        for x in range(s):
            d = math.hypot(x + .5 - cx, y + .5 - cy)
            if d < r:
                t = 0.9 - ((x - cx) * -.5 + (y - cy) * .5) / r * .4
                c.px(x, y, dither_pick(["#e8d890", "#fff0a8", "#fffbe0"], t, x, y))
            elif d < r + 5 and BAYER4[y % 4, x % 4] < (1 - (d - r) / 5) * .45:
                c.px(x, y, "#5a6ab0")
    for (a, b, rr) in [(-3, -2, 2), (3, 3, 1.6), (2, -4, 1.2)]:
        for y in range(s):
            for x in range(s):
                if math.hypot(x + .5 - cx - a, y + .5 - cy - b) < rr: c.px(x, y, "#e0cc80")
    return c


def stone_bank(w=130, h=94, top=24, edge0=94, seed=9):
    rnd = random.Random(seed)
    c = Cv(w, h)
    m = bank_mask(w, h, top, edge0)
    ST = ["#2a2450", "#3c3466", "#5a4f8a", "#7a6fb0", "#9a8fd0"]
    circ = []
    for y in range(top + 2, h + 10, 9):
        x = -4 + (y // 9 % 2) * 6
        while x < edge0 + (y - top) * .32 + 4:
            circ.append((x, y, rnd.uniform(5, 8))); x += rnd.uniform(9, 13)
    blob = shaded_blob(w, h, circ, ST, light=(0.4, -0.9), noise=0.25, seed=seed)
    for y in range(h):
        for x in range(w):
            if m[y, x]:
                c.a[y, x] = blob.a[y, x] if blob.a[y, x, 3] else hexc("#3c3466")
    for x in range(w):
        for y in range(top, top + 3):
            if m[y, x]: c.px(x, y, "#9a8fd0" if y == top else "#7a6fb0")
    for y in range(top, h):
        e = int(edge0 + (y - top) * 0.32)
        if y >= top + 3: c.px(e, y, "#1c1838")
    for (a, b) in [(16, top + 14), (52, top + 26), (76, top + 10), (30, top + 44)]:
        c.rect(a, b - 3, a + 2, b + 2, "#3fb8d8"); c.rect(a + 1, b - 4, a + 3, b + 1, "#7ff0ff"); c.px(a + 2, b - 3, "#ffffff")
    # lanterns
    for lx in (20, 70):
        c.rect(lx, top - 16, lx + 2, top, "#2a2450"); c.rect(lx - 3, top - 22, lx + 5, top - 15, "#2a2450")
        c.rect(lx - 2, top - 21, lx + 4, top - 16, "#ffd86b"); c.rect(lx - 1, top - 20, lx + 1, top - 18, "#fff3c0")
    return c


def rock(w=56, h=18):
    circ = [(14, 14, 9), (28, 11, 11), (42, 14, 9), (22, 16, 8), (36, 16, 8)]
    return shaded_blob(w, h, circ, ["#2a2450", "#3d4470", "#5b6390", "#7a82b0", "#9aa3c8"], light=(0.4, -0.9), flat_bottom=h - 2, noise=.2, seed=4)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    L = {
        "psky0": vtile(["#4f93f0", "#64a5f3", "#7cb7f6", "#97c9f9", "#b4dafb", "#d6ecfd"], HZ),
        "pwater0": vtile(["#9ad6f6", "#7cc3f0", "#5eaee6", "#4a9ade", "#3a86d2", "#2c71c2", "#245fb0"], 200 - HZ, gamma=.8),
        "pfar0": far_trees(), "pschool": mini_school(), "pcherry1": mini_cherry(1), "pcherry2": mini_cherry(2),
        "pbank0": grass_bank(), "plily": lily(False), "plilyf": lily(True),
        "psky1": vtile(["#3b3f9e", "#5a4aae", "#8a5ab8", "#c46aa8", "#ec7e96", "#ffa07a", "#ffc58a", "#ffe0a0"], HZ),
        "pwater1": vtile(["#ffc48a", "#f3a07a", "#d98a8e", "#a87aa8", "#7a6ab8", "#5a5aae", "#45509e", "#35448c"], 200 - HZ, gamma=.7),
        "psun1": sunset_sun(), "pisland": island(), "pbank1": pier(),
        "psky2": vtile(["#0a1238", "#101a48", "#16235a", "#1e2e6c", "#28397c", "#34468a"], HZ),
        "pwater2": vtile(["#4a4f9f", "#3c3f8c", "#30327a", "#262868", "#1e1e56", "#171747"], 200 - HZ, gamma=.8),
        "pcity2": night_city(), "pmoon": moon(), "pbank2": stone_bank(), "prock": rock(),
    }
    import scene
    old = scene.CLOUD
    scene.CLOUD = ["#8a5aa8", "#b06aa6", "#da84a2", "#f7a89a", "#ffd2b0"]
    L["pcloud1"] = scene.cloud(76, 24, 5); L["pcloud1b"] = scene.cloud(48, 18, 6)
    scene.CLOUD = old
    for k, v in L.items():
        v.save(os.path.join(OUT, k + ".png"))
    print("ok", {k: (v.w, v.h) for k, v in L.items()})
