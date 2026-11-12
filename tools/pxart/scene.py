"""Builds HD pixel scene layers for Relay Story Live (sky, sun, clouds, city, street, fence, road, hedge)."""
import math, random, os, sys
import numpy as np
from lib import *

OUT = os.path.join(os.path.dirname(__file__), "out")
F11 = os.path.join(os.path.dirname(__file__), "Galmuri11.ttf")
F11B = os.path.join(os.path.dirname(__file__), "Galmuri11-Bold.ttf")
F9 = os.path.join(os.path.dirname(__file__), "Galmuri9.ttf")
F7 = os.path.join(os.path.dirname(__file__), "Galmuri7.ttf")

SKY = ["#1748c4", "#1d55d3", "#2563de", "#2f72e6", "#3d82ec", "#4f93f0", "#64a5f3", "#7cb7f6", "#97c9f9", "#b4dafb"]


def sky_tile(h=240, w=8):
    c = Cv(w, h)
    for y in range(h):
        for x in range(w):
            c.px(x, y, dither_pick(SKY, (y / h) ** 1.1, x, y))
    return c


def sun(r=12, size=180):
    c = Cv(size, size)
    cx = cy = size / 2
    # rays: dithered light shafts
    rnd = random.Random(4)
    angles = [i * (2 * math.pi / 14) + rnd.uniform(-.12, .12) for i in range(14)]
    for y in range(size):
        for x in range(size):
            dx, dy = x + .5 - cx, y + .5 - cy
            d = math.hypot(dx, dy)
            if d < r:
                c.px(x, y, "#ffffff"); continue
            if d < r + 3:
                c.px(x, y, "#fffbe6" if (x + y) % 2 == 0 or d < r + 1.5 else "#fff3c0"); continue
            if d < r + 9:
                if (x + y) % 2 == 0: c.px(x, y, (255, 250, 225, 255))
                else: c.px(x, y, (236, 246, 255, 255))
                continue
            if d < r + 30:
                f = 1 - (d - r - 9) / 21
                if BAYER4[y % 4, x % 4] < f * 0.75: c.px(x, y, (232, 243, 255, 255))
                continue
            a = math.atan2(dy, dx)
            for k, ra in enumerate(angles):
                da = abs((a - ra + math.pi) % (2 * math.pi) - math.pi)
                wdt = (0.07 if k % 2 else 0.12) * (1 - d / (size * .5)) + 0.01
                if da < wdt and d < size * .5:
                    fade = 1 - d / (size * .5)
                    p = BAYER4[y % 4, x % 4]
                    if p < fade * 0.55:
                        c.px(x, y, (250, 252, 255, 255))
    return c


CLOUD = ["#8fb0e3", "#b3cbef", "#d6e4f8", "#eef4fd", "#ffffff"]


def cloud(w, h, seed, puffs=None):
    rnd = random.Random(seed)
    base = h - 3
    circles = []
    # base row of puffs
    x = 6
    while x < w - 6:
        r = rnd.uniform(5, 8)
        circles.append((x, base - r * .4, r)); x += r * rnd.uniform(1.0, 1.4)
    # upper puffs, larger in the middle
    n = puffs or max(3, int(w / 16))
    for i in range(n):
        t = (i + .5) / n
        cx = 8 + t * (w - 16) + rnd.uniform(-4, 4)
        hump = math.sin(t * math.pi)
        r = 6 + hump * (h * .36) * rnd.uniform(.75, 1.05)
        cy = base - r * .55 - hump * h * .12
        circles.append((cx, cy, r))
    # a couple of crown puffs
    for i in range(max(1, n // 3)):
        cx = w * rnd.uniform(.3, .65); r = h * rnd.uniform(.22, .3)
        circles.append((cx, base - h * .55, r))
    return shaded_blob(w, h, circles, CLOUD, light=(0.45, -0.9), flat_bottom=base + 1, vgrad=0.35, seed=seed)


# ---------- city ----------
NEAR = dict(face=["#4f80d2", "#6593dd", "#7ea8e8", "#9bc0f1", "#bcd7f8"], side=["#2f56a6", "#3a64b4", "#4672c0"],
            mull="#456fbe", refl="#dcebfd", cap="#2a4a92", capl="#8fb3ea")
FAR = dict(face=["#7ea9e6", "#8db5eb", "#9cc0ef", "#aecdf3"], side=["#6f9ade", "#77a2e2"], mull="#86aee8", refl="#c6dcf7",
           cap="#6c95d8", capl="#b8d3f6")


def tower(c, x0, w, top, base, P, rnd, sign=None, far=False):
    sw = max(3, int(w * (0.22 if not far else .18)))  # side face width (right)
    fw = w - sw
    H = base - top
    style = rnd.choice(["grid", "band", "vert"])
    for y in range(top, base):
        ty = (y - top) / max(1, H)
        for x in range(x0, x0 + w):
            lx = x - x0
            if lx < fw:
                t = 0.95 - ty * 0.85
                col = dither_pick(P["face"], t, x, y)
                # mullions
                if style == "grid":
                    if (y - top) % 4 == 3 or lx % 4 == 0: col = P["mull"]
                elif style == "band":
                    if (y - top) % 5 in (3, 4): col = P["mull"] if (y - top) % 5 == 4 else dither_pick(P["face"], t - .25, x, y)
                else:
                    if lx % 3 == 0: col = P["mull"]
                    elif (y - top) % 6 == 5: col = P["mull"]
                # diagonal reflection band
                k = (lx + (y - top) * 0.6) % (w * 2.6)
                if k < 3.5 and not far and col != P["mull"]: col = P["refl"]
                elif k < 6 and not far and col != P["mull"] and (x + y) % 2 == 0: col = P["refl"]
                if lx == 0: col = P["capl"] if not far else col
            else:
                t = 0.8 - ty * 0.6
                col = dither_pick(P["side"], t, x, y)
                if (y - top) % 4 == 3: col = P["side"][0]
                if lx == w - 1: col = P["cap"]
            c.px(x, y, col)
    # roof cap
    c.rect(x0, top - 2, x0 + w, top, P["cap"]); c.rect(x0 + 1, top - 2, x0 + fw, top - 1, P["capl"])
    if not far and rnd.random() < .45:
        # setback crown
        iw = max(6, int(w * .55)); ix = x0 + (w - iw) // 2; ih = rnd.randint(5, 10)
        tower_crown(c, ix, iw, top - 2 - ih, top - 2, P)
        if rnd.random() < .7:
            ax = ix + iw // 2
            c.rect(ax, top - 2 - ih - 9, ax + 1, top - 2 - ih, P["cap"]); c.px(ax, top - 2 - ih - 10, "#ffffff")
    if sign:
        m = text_mask(sign, F7, 8)
        sw2 = m.shape[1] + 6; sx = x0 + (fw - sw2) // 2; sy = top + 5
        c.rect(sx, sy, sx + sw2, sy + m.shape[0] + 4, "#1d3f8f"); c.rect(sx, sy, sx + sw2, sy + 1, "#3d66b8")
        c.mask_paint(m, "#ffffff", sx + 3, sy + 2)


def tower_crown(c, x0, w, top, base, P):
    for y in range(top, base):
        for x in range(x0, x0 + w):
            c.px(x, y, P["side"][1] if x - x0 > w * .7 else dither_pick(P["face"], .6, x, y))
    c.rect(x0, top - 1, x0 + w, top, P["cap"])


def city(w=512, h=150, seed=3, far=False, signs=()):
    rnd = random.Random(seed)
    c = Cv(w, h)
    P = FAR if far else NEAR
    x = -10
    i = 0
    while x < w:
        tw = rnd.randint(20, 34) if far else rnd.randint(22, 42)
        th = rnd.randint(int(h * .35), int(h * .8)) if far else rnd.randint(int(h * .42), h - 14)
        sign = None
        for (sx, txt) in signs:
            if x <= sx < x + tw: sign = txt
        if sign: th = max(th, h - 16); tw = max(tw, 40)
        tower(c, x, tw, h - th, h, P, rnd, sign=sign, far=far)
        x += tw + (rnd.randint(-6, 2) if far else rnd.randint(0, 5))
        i += 1
    # make horizontally tileable: copy left 20px blend not needed if wide; we crop a seamless window
    return c


# ---------- street: trees + lamps + banners ----------
TREE = ["#0d3f22", "#165a2e", "#21733a", "#2f8c44", "#4aa84d", "#78c45a"]


def treeline(w=512, h=84, seed=7):
    rnd = random.Random(seed)
    circles = []
    x = -8
    while x < w + 8:
        r = rnd.uniform(15, 24)
        cy = h - r * rnd.uniform(1.1, 1.6)
        # crown made of several puffs
        for k in range(9):
            circles.append((x + rnd.uniform(-r * .7, r * .7), cy + rnd.uniform(-r * .6, r * .5), r * rnd.uniform(.38, .62)))
        circles.append((x, h - r * .5, r * .8))
        x += r * rnd.uniform(1.0, 1.4)
    # sort by y so upper puffs are drawn later (on top)
    circles.sort(key=lambda c: -c[1])
    t = shaded_blob(w, h, circles, TREE, light=(0.5, -0.85), vgrad=0.25, noise=0.35, seed=seed)
    # leaf speckles
    for y in range(h):
        for x in range(w):
            if t.a[y, x, 3] and rnd.random() < 0.035:
                t.px(x, y, TREE[-1] if rnd.random() < .5 else TREE[0])
    return t


def banner(w, h, blue=True, icon="book"):
    c = Cv(w, h)
    body = ["#1b4fc4", "#2560d6", "#3070e0"] if blue else ["#cfdcef", "#e6eef9", "#ffffff"]
    for y in range(h):
        for x in range(w):
            t = 0.8 - (x / w) * .6
            c.px(x, y, dither_pick(body, t, x, y))
    c.rect(0, 0, w, 2, "#0f2f7c" if blue else "#9fb3d3")
    c.rect(0, h - 2, w, h, "#0f2f7c" if blue else "#9fb3d3")
    ink = "#ffffff" if blue else "#2560d6"
    cx = w // 2
    if icon == "book":
        m = text_mask("RSL", F7, 8)
        m2 = np.rot90(m, -1)
        c.mask_paint(m2, ink, cx - m2.shape[1] // 2, h // 2 - m2.shape[0] // 2)
    else:
        m = text_mask("ABC", F7, 8)
        m2 = np.rot90(m, -1)
        c.mask_paint(m2, ink, cx - m2.shape[1] // 2, h // 2 - m2.shape[0] // 2)
    return c


def lamp(h=96):
    w = 40
    c = Cv(w, h)
    px = w // 2
    c.rect(px - 1, 6, px + 2, h, "#6f7f96"); c.rect(px - 1, 6, px, h, "#a9b7ca")
    c.rect(px - 3, h - 4, px + 4, h, "#56657c")
    # arm + head
    c.rect(px - 9, 4, px + 10, 6, "#6f7f96"); c.rect(px - 9, 4, px + 10, 5, "#a9b7ca")
    for hx in (px - 12, px + 7):
        c.rect(hx, 2, hx + 6, 6, "#4d5c73"); c.rect(hx + 1, 6, hx + 5, 7, "#fff6d0")
    b1 = banner(13, 40, True, "book"); b2 = banner(13, 40, False, "abc")
    c.paste_fast(b1, px - 15, 12); c.paste_fast(b2, px + 3, 12)
    c.rect(px - 15, 11, px + 16, 12, "#56657c")
    return c


def street(w=512, h=110, seed=7):
    c = Cv(w, h)
    t = treeline(w, 84, seed)
    c.paste_fast(t, 0, h - 84)
    for lx in range(60, w, 256):
        l = lamp(h)
        c.paste_fast(l, lx, 0)
    return c


# ---------- fence ----------
def fence(w=512, h=36):
    c = Cv(w, h)
    labels = ["RELAY STORY LIVE", "중앙대 × 신서중", "WORD RUN", "ENGLISH CLASS"]
    pw = 128
    for i, x0 in enumerate(range(0, w, pw)):
        # panel
        for y in range(5, h - 4):
            for x in range(x0 + 4, x0 + pw - 3):
                t = 0.75 - (y - 5) / (h - 9) * .5
                c.px(x, y, dither_pick(["#163f9e", "#1c4cb8", "#2358c8", "#2b64d4"], t, x, y))
        c.rect(x0 + 4, 5, x0 + pw - 3, 6, "#4a7ee0"); c.rect(x0 + 4, h - 5, x0 + pw - 3, h - 4, "#0f2d78")
        txt = labels[i % len(labels)]
        f = F11B if all(ord(ch) < 128 for ch in txt) else F11B
        m = text_mask(txt, f, 12)
        mx = x0 + (pw - m.shape[1]) // 2; my = 5 + (h - 9 - m.shape[0]) // 2
        sh = np.zeros_like(m); sh[1:, 1:] = m[:-1, :-1]
        c.mask_paint(sh & ~m, "#0f2d78", mx, my)
        c.mask_paint(m, "#ffffff", mx, my)
        # post
        c.rect(x0, 0, x0 + 5, h, "#7c8aa0"); c.rect(x0 + 1, 0, x0 + 2, h, "#c9d3e0"); c.rect(x0 + 4, 0, x0 + 5, h, "#56637a")
        c.rect(x0 - 1, 0, x0 + 6, 2, "#9aa7ba")
    # rails
    for ry in (1, h - 3):
        c.rect(0, ry, w, ry + 2, "#8795ab"); c.rect(0, ry, w, ry + 1, "#d3dbe6")
    return c


# ---------- road ----------
def road_tile(w=64, h=64, seed=11):
    rnd = random.Random(seed)
    c = Cv(w, h)
    for y in range(h):
        for x in range(w):
            v = rnd.random()
            col = "#4e545e" if v < .55 else "#535a64" if v < .85 else "#484e57" if v < .97 else "#5f6671"
            c.px(x, y, col)
    return c


def curb(w=64, h=8):
    c = Cv(w, h)
    c.rect(0, 0, w, 3, "#d3d9e1"); c.rect(0, 3, w, 6, "#a3acb8"); c.rect(0, 6, w, 8, "#3f454e")
    for x in range(0, w, 16): c.rect(x, 0, x + 1, 6, "#8b95a3")
    return c


HEDGE = ["#0f3d22", "#175731", "#21703a", "#2f8a45", "#4aa24f"]


def hedge(w=256, h=30, seed=21):
    rnd = random.Random(seed)
    circles = []
    x = -6
    while x < w + 6:
        r = rnd.uniform(7, 11)
        circles.append((x, h - r * .55 + rnd.uniform(-2, 2), r)); x += r * rnd.uniform(.9, 1.3)
    for _ in range(int(w / 9)):
        circles.append((rnd.uniform(0, w), h * rnd.uniform(.45, .7), rnd.uniform(5, 8)))
    circles.sort(key=lambda c: -c[1])
    c = shaded_blob(w, h, circles, HEDGE, light=(0.4, -0.9), noise=0.4, seed=seed)
    for _ in range(int(w / 5)):
        x, y = rnd.randrange(w), rnd.randrange(h // 3, h)
        if c.a[y, x, 3]:
            col = rnd.choice(["#ffffff", "#e9e3ff", "#c8b8f2", "#ffffff"])
            c.px(x, y, col); c.px(x + 1, y, col); c.px(x, y - 1, col)
    return c


def tileable(c, blend=0):
    return c


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    layers = {
        "sky": sky_tile(),
        "sun": sun(),
        "cloud1": cloud(120, 48, 1), "cloud2": cloud(80, 32, 2), "cloud3": cloud(180, 70, 3), "cloud4": cloud(52, 22, 4),
        "cityfar": city(512, 90, 9, far=True),
        "city": city(512, 112, 3, signs=[(60, "CAU")]),
        "street": street(512, 120, 7),
        "fence": fence(512, 36),
        "road": road_tile(), "curb": curb(), "hedge": hedge(256, 30),
    }
    for k, v in layers.items():
        v.save(os.path.join(OUT, k + ".png"))
    print("ok", {k: (v.w, v.h) for k, v in layers.items()})
