"""푸앙이 (64x64, faces right) in the clean pastel style of the reference screenshots:
flat colours, 1px navy outline, big head, oval eye, blush, spiral whisker, open smile, white tee, pink tail tuft.
Parts are painted back to front; every part carries its own outline."""
import os, math
import numpy as np
from PIL import Image, ImageDraw

W = H = 64
S = 4  # supersampling for smooth pixel curves
OUT = os.path.join(os.path.dirname(__file__), "out")
C = dict(ol="#1b2a63", b="#b4d6f3", bs="#93bbe6", bh="#d3e8fb", w="#ffffff", ws="#d6e2f1", g="#e0b254", gs="#b98a3e",
         p="#f4aebb", ps="#dc8a9d", bl="#f6b9c4", m="#141a4a", t="#e07d90", hi="#f6fbff", star="#2f6fe8")
rgb = lambda h: (int(h[1:3], 16), int(h[3:5], 16), int(h[5:7], 16), 255)
ys, xs = np.mgrid[0:H * S, 0:W * S]
X, Y = (xs + .5) / S, (ys + .5) / S
down = lambda m: m.reshape(H, S, W, S).mean(axis=(1, 3)) >= 0.5


def ell(cx, cy, rx, ry, rot=0.0, n=2.0):
    dx, dy = X - cx, Y - cy
    if rot:
        c, s = math.cos(rot), math.sin(rot); dx, dy = dx * c + dy * s, -dx * s + dy * c
    return down(np.abs(dx / rx) ** n + np.abs(dy / ry) ** n <= 1)


def cap(x0, y0, x1, y1, r, r1=None):
    """capsule; r1 lets it taper"""
    r1 = r if r1 is None else r1
    vx, vy = x1 - x0, y1 - y0; L2 = vx * vx + vy * vy or 1e-6
    t = np.clip(((X - x0) * vx + (Y - y0) * vy) / L2, 0, 1)
    d = np.hypot(X - (x0 + t * vx), Y - (y0 + t * vy))
    return down(d <= r + (r1 - r) * t)


def poly(pts):
    im = Image.new("L", (W * S, H * S), 0)
    ImageDraw.Draw(im).polygon([(x * S, y * S) for x, y in pts], fill=255)
    return down(np.array(im) > 127)


def shift(m, dx, dy):
    """result[y, x] = m[y - dy, x - dx] (moves the mask by dx, dy)"""
    o = np.zeros_like(m)
    h, w = m.shape
    ys0, ys1 = max(0, dy), min(h, h + dy); xs0, xs1 = max(0, dx), min(w, w + dx)
    o[ys0:ys1, xs0:xs1] = m[ys0 - dy:ys1 - dy, xs0 - dx:xs1 - dx]
    return o


def grow(m):
    return m | shift(m, 1, 0) | shift(m, -1, 0) | shift(m, 0, 1) | shift(m, 0, -1)


class Spr:
    def __init__(s):
        s.a = np.zeros((H, W, 4), np.uint8)

    def paint(s, m, col):
        s.a[m] = rgb(C.get(col, col))

    def part(s, m, base, shade=None, rim=2, light=None, ol="ol", clip=None):
        if ol: s.paint(grow(m) & ~m, ol)
        s.paint(m, base)
        if shade:  # darker crescent on the lower-left (light comes from the upper right)
            sm = m & ~shift(m, rim, -rim)
            if clip is not None: sm &= clip
            s.paint(sm, shade)
        if light:
            s.paint(m & ~shift(m, -1, 1) & ~shift(m, -2, 2), light)

    def px(s, pts, col):
        for x, y in pts:
            if 0 <= x < W and 0 <= y < H: s.a[y, x] = rgb(C.get(col, col))

    def img(s):
        return Image.fromarray(s.a, "RGBA")


def antler(bx, by, lean):
    """small Y-shaped antler growing up from (bx, by)"""
    tx, ty = bx + lean, by - 6
    m = cap(bx, by + 2, tx, ty, 1.7, 1.4)
    m |= cap(tx, ty, tx + 2.6, ty - 3.2, 1.3, 1.1)      # front tip
    m |= cap(tx, ty, tx - 2.4, ty - 3.4, 1.3, 1.1)      # back tip
    m |= cap(bx + lean * .4, by - 2.2, bx + lean * .4 - 3.2, by - 3.6, 1.2, 1.0)  # low branch
    return m


def puang(pose="stand"):
    sp = Spr()
    run = pose.startswith("run")
    bob = {"run1": -1, "run3": -1, "jump": -3, "cheer": -1}.get(pose, 0)
    tilt = -2 if pose == "hurt" else 0            # head moves back when hurt
    hx, hy = 33 + tilt, 26 + bob                  # head centre
    bx, by = 30, 48 + bob                         # body centre

    # ----- tail (behind everything), pink tuft at the tip -----
    wag = {"run0": 0, "run1": -1, "run2": -2, "run3": -1, "jump": -3, "cheer": -2, "hurt": 2}.get(pose, 0)
    tail = cap(bx - 6, by + 5, bx - 13, by + 6, 3.2, 2.6) | cap(bx - 13, by + 6, bx - 18, by + 2 + wag, 2.6, 2.0) | cap(bx - 18, by + 2 + wag, bx - 19, by - 3 + wag, 2.0, 1.6)
    sp.part(tail, "b", "bs")
    tx, ty = bx - 19, by - 6 + wag
    tuft = ell(tx, ty - 1.2, 2.3, 3.0) | ell(tx - 2.6, ty + .4, 2.3, 2.4) | ell(tx + 2.6, ty + .4, 2.3, 2.4)
    sp.part(tuft, "p", "ps", rim=1)

    # ----- legs: [back leg, front leg] as (hip, foot) -----
    L = {
        "stand": [((27, by + 7), (26, by + 12)), ((33, by + 7), (34, by + 12))],
        "run0": [((26, by + 6), (18, by + 10)), ((34, by + 6), (42, by + 9))],
        "run1": [((27, by + 7), (24, by + 12)), ((33, by + 7), (37, by + 11))],
        "run2": [((27, by + 6), (36, by + 10)), ((33, by + 6), (24, by + 11))],
        "run3": [((28, by + 7), (32, by + 12)), ((32, by + 7), (28, by + 12))],
        "jump": [((26, by + 6), (19, by + 9)), ((34, by + 6), (42, by + 7))],
        "hurt": [((27, by + 7), (23, by + 12)), ((33, by + 7), (38, by + 12))],
    }
    (a0, a1), (b0, b1) = L.get(pose, L["stand"])
    foot = lambda p, d: ell(p[0] + d * 1.6, p[1] + .6, 4.0, 2.4)
    legB = cap(*a0, *a1, 3.3, 2.9) | foot(a1, -1 if a1[0] < a0[0] - 2 else 1)
    legF = cap(*b0, *b1, 3.4, 3.0) | foot(b1, -1 if b1[0] < b0[0] - 2 else 1)
    sp.part(legB, "bs", None)

    # ----- back arm -----
    AB = {"stand": ((25, by - 3), (22, by + 3)), "blink": ((25, by - 3), (22, by + 3)), "wow": ((25, by - 3), (20, by - 2)),
          "run0": ((27, by - 3), (36, by - 1)), "run1": ((26, by - 3), (31, by + 2)), "run2": ((25, by - 3), (19, by + 0)), "run3": ((25, by - 3), (22, by + 3)),
          "jump": ((25, by - 3), (23, by + 1)), "cheer": ((25, by - 3), (23, by + 1)), "hurt": ((25, by - 3), (18, by - 6)), "fish": ((27, by - 3), (37, by - 4))}
    p0, p1 = AB.get(pose, AB["stand"])
    sp.part(cap(*p0, *p1, 2.7, 2.5), "bs", None)
    up = pose in ("jump", "cheer")
    if up:   # both arms up (만세): drawn before the head so only the hands peek out beside it
        sp.part(cap(26, by - 4, hx - 20, hy + 7, 2.8, 2.9), "b", "bs", rim=1)
        sp.part(cap(36, by - 4, hx + 21, hy + 9, 2.8, 2.9), "b", "bs", rim=1)

    # ----- body: blue hips, white T-shirt on top -----
    hips = ell(bx, by + 3.5, 9.0, 7.0, n=2.3)
    sp.part(hips, "b", "bs")
    sp.part(legF, "b", "bs")
    tee = ell(bx, by - .5, 9.6, 8.2, n=2.5) & (Y[::S, ::S] < by + 6.2)
    sp.part(tee, "w", "ws")
    sx, sy = bx - 6, by - 2   # small blue S (Sinseo) on the chest
    sp.px([(sx + 1, sy), (sx + 2, sy), (sx, sy + 1), (sx + 1, sy + 2), (sx + 2, sy + 3), (sx, sy + 4), (sx + 1, sy + 4)], "star")

    # ----- antlers + ear fin (behind the head) -----
    sp.part(antler(hx - 8, hy - 12, -1.5), "g", "gs", rim=1)
    sp.part(antler(hx + 4, hy - 13, 1.5), "g", "gs", rim=1)
    sp.part(ell(hx - 16.5, hy - 5, 2.8, 4.2, rot=0.5), "bs", None)

    # ----- head: boxy round with a soft muzzle at the lower front -----
    head = ell(hx, hy, 17.6, 13.8, n=2.7) | ell(hx + 6.5, hy + 4.5, 12.0, 9.8, n=2.5)
    sp.part(head, "b", "bs", rim=2)
    sp.px([(hx + 11, hy - 10), (hx + 12, hy - 10), (hx + 12, hy - 9), (hx + 13, hy - 9), (hx + 13, hy - 8)], "hi")   # forehead glint
    face(sp, pose, hx, hy)

    # ----- front arm: white sleeve + blue arm -----
    AF = {"stand": ((35, by - 3), (38, by + 3)), "blink": ((35, by - 3), (38, by + 3)), "wow": ((35, by - 3), (41, by - 3)),
          "run0": ((33, by - 3), (25, by + 0)), "run1": ((34, by - 3), (30, by + 3)), "run2": ((35, by - 3), (43, by - 2)), "run3": ((35, by - 3), (38, by + 3)),
          "jump": ((36, by - 4), (44, by - 11)), "cheer": ((36, by - 4), (44, by - 11)), "hurt": ((36, by - 3), (44, by - 6)), "fish": ((35, by - 3), (43, by - 3))}
    p0, p1 = AF.get(pose, AF["stand"])
    if not up: sp.part(cap(*p0, *p1, 2.9, 2.8), "b", "bs", rim=1)
    return sp.img()


def face(sp, pose, hx, hy):
    ex, ey = hx + 10, hy - 1                     # eye
    if pose == "hurt":
        sp.px([(ex - 2, ey - 2), (ex - 1, ey - 1), (ex, ey), (ex - 1, ey + 1), (ex - 2, ey + 2), (ex + 2, ey - 2), (ex + 1, ey - 1), (ex + 1, ey + 1), (ex + 2, ey + 2)], "ol")
    elif pose == "blink":
        sp.px([(ex - 2, ey + 1), (ex - 1, ey + 1), (ex, ey + 1), (ex + 1, ey + 1), (ex + 2, ey + 1)], "ol")
    elif pose == "cheer":
        sp.px([(ex - 2, ey + 1), (ex - 1, ey), (ex, ey - 1), (ex + 1, ey), (ex + 2, ey + 1)], "ol")
        sp.px([(ex - 2, ey + 2), (ex + 2, ey + 2)], "ol")
    else:
        big = pose == "wow"
        rows = [".##.", "####", "####", "####", "####", ".##."] if not big else [".###.", "#####", "#####", "#####", "#####", "#####", ".###."]
        for j, r in enumerate(rows):
            for i, ch in enumerate(r):
                if ch == "#": sp.px([(ex - 1 + i, ey - 3 + j)], "ol")
        sp.px([(ex, ey - 2)] + ([(ex, ey - 1), (ex + 1, ey - 2)] if big else []), "hi")
    # blush
    sp.paint(ell(hx + 3.5, hy + 5.5, 3.0, 2.5), "bl")
    # whisker: a line going back from the cheek, ending in a square spiral curl
    wy, x1, x0 = hy + 5, hx - 1, hx - 12
    sp.px([(x, wy) for x in range(x0 + 1, x1 + 1)], "ol")
    sp.px([(x0, wy - 1), (x0, wy - 2), (x0, wy - 3), (x0, wy - 4), (x0 + 1, wy - 5), (x0 + 2, wy - 5), (x0 + 3, wy - 5),
           (x0 + 4, wy - 4), (x0 + 4, wy - 3), (x0 + 3, wy - 2), (x0 + 2, wy - 2), (x0 + 2, wy - 3)], "ol")
    # nostril
    sp.px([(hx + 16, hy + 2)], "bs")
    # mouth
    mx, my = hx + 10, hy + 7
    if pose == "hurt":
        sp.px([(mx - 3, my + 1), (mx - 2, my), (mx - 1, my + 1), (mx, my), (mx + 1, my + 1), (mx + 2, my), (mx + 3, my + 1)], "ol")
    elif pose == "wow":
        sp.paint(ell(mx + .5, my + 1.5, 2.6, 3.0), "m"); sp.px([(mx, my + 3), (mx + 1, my + 3)], "t")
    elif pose in ("blink", "fish_closed"):
        sp.px([(mx - 4, my), (mx - 3, my + 1), (mx - 2, my + 1), (mx - 1, my + 1), (mx, my + 1), (mx + 1, my + 1), (mx + 2, my + 1), (mx + 3, my)], "ol")
    else:
        m = ell(mx + .5, my, 5.6, 4.7) & (Y[::S, ::S] >= my)
        sp.paint(m, "m")
        sp.px([(mx - 6, my - 1), (mx + 6, my - 1)], "m")                      # smile corners
        sp.paint(ell(mx - .5, my + 3.6, 2.8, 1.5) & m & shift(m, 0, -1), "t")
        sp.px([(mx + 3, my + 1), (mx + 4, my + 1), (mx + 4, my + 2)], "hi")   # little fang


POSES = ["run0", "run1", "run2", "run3", "jump", "hurt", "stand", "blink", "wow", "cheer", "fish"]

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    sheet = Image.new("RGBA", (W * len(POSES), H), (0, 0, 0, 0))
    for i, p in enumerate(POSES):
        im = puang(p); im.save(os.path.join(OUT, p + ".png")); sheet.paste(im, (i * W, 0))
    bg = Image.new("RGBA", sheet.size, (86, 120, 190, 255)); bg.alpha_composite(sheet)
    bg.resize((sheet.width * 5, H * 5), Image.NEAREST).save(os.path.join(OUT, "puang2_sheet.png"))
    print("ok")
