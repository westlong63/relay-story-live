"""HD 푸앙이 sprites (side 3/4 view, facing right) built from vector parts, shaded per part, outlined."""
import math, os, json
import numpy as np
from PIL import Image

S = 6  # supersample
W = H = 64
OX, OY = 2, 4  # drawing offset inside the 64x64 frame
OUT = os.path.join(os.path.dirname(__file__), "out")

C = {
    "o": (29, 53, 102), "o2": (52, 92, 150),
    "b0": (63, 136, 200), "b1": (95, 169, 222), "b2": (128, 196, 238), "b3": (178, 224, 248), "b4": (226, 245, 255),
    "w0": (196, 218, 236), "w1": (234, 244, 252), "w2": (255, 255, 255),
    "t0": (150, 112, 66), "t1": (200, 160, 108), "t2": (232, 202, 150), "to": (110, 78, 44),
    "p0": (226, 120, 160), "p1": (246, 168, 196), "p2": (255, 214, 228),
    "k": (16, 24, 48), "wh": (255, 255, 255), "pk": (255, 170, 190), "m": (190, 70, 100),
}


def grid():
    ys, xs = np.mgrid[0:H * S, 0:W * S]
    return (xs + .5) / S - OX, (ys + .5) / S - OY


X, Y = grid()


def ell(cx, cy, rx, ry, rot=0):
    c, s = math.cos(rot), math.sin(rot)
    dx, dy = X - cx, Y - cy
    u = (dx * c + dy * s) / rx; v = (-dx * s + dy * c) / ry
    return u * u + v * v <= 1


def capsule(x0, y0, x1, y1, r):
    dx, dy = x1 - x0, y1 - y0
    L2 = dx * dx + dy * dy or 1e-6
    t = np.clip(((X - x0) * dx + (Y - y0) * dy) / L2, 0, 1)
    px, py = x0 + t * dx, y0 + t * dy
    return (X - px) ** 2 + (Y - py) ** 2 <= r * r


def poly(pts):
    from matplotlib.path import Path  # noqa
    P = Path(pts)
    m = P.contains_points(np.stack([X.ravel(), Y.ravel()], 1)).reshape(X.shape)
    return m


def down(m):
    """supersampled bool mask -> target bool mask (coverage >= 45%)."""
    return m.reshape(H, S, W, S).mean(axis=(1, 3)) >= 0.45


class Sprite:
    def __init__(s):
        s.lab = np.full((H, W), "", object)  # part key per pixel
        s.order = []
        s.parts = {}

    def add(s, key, m_ss, kind, **kw):
        m = down(m_ss)
        s.parts[key] = dict(mask=m, kind=kind, **kw)
        s.lab[m] = key
        s.order.append(key)

    def render(s, light=(0.55, -0.83)):
        img = np.zeros((H, W, 4), np.uint8)
        lx, ly = light
        lx, ly = -lx, -ly  # normals point outward; light comes from top-right
        for y in range(H):
            for x in range(W):
                k = s.lab[y, x]
                if not k: continue
                p = s.parts[k]
                col = shade(p, x - OX, y - OY, lx, ly)
                img[y, x] = (*col, 255)
        # outline: silhouette edge -> dark outline (outside pixels)
        a = img[:, :, 3] > 0
        ap = np.pad(a, 1)
        out = ap[:-2, 1:-1] | ap[2:, 1:-1] | ap[1:-1, :-2] | ap[1:-1, 2:]
        out &= ~a
        img[out] = (*C["o"], 255)
        # inner part borders: where a front part meets a different back part, darken front edge (selout)
        for y in range(1, H - 1):
            for x in range(1, W - 1):
                k = s.lab[y, x]
                if not k: continue
                p = s.parts[k]
                if not p.get("line"): continue
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    k2 = s.lab[y + dy, x + dx]
                    if k2 and k2 != k and s.order.index(k2) < s.order.index(k) and s.parts[k2].get("group") != p.get("group"):
                        img[y, x] = (*C[p["line"]], 255); break
        return img


def shade(p, x, y, lx, ly):
    """clean cel shading: shadow / base / light / highlight by thresholds (no stripes)."""
    tones = p["tones"]
    cx, cy, rx, ry = p.get("sph", (x, y, 1, 1))
    nx, ny = (x + .5 - cx) / rx, (y + .5 - cy) / ry
    r2 = nx * nx + ny * ny
    d = -(nx * lx + ny * ly)
    th = p.get("th", (-0.45, 0.35, 0.62))
    if p["kind"] == "flat": return C[tones[p.get("t", 1)]]
    if d < th[0] and r2 > 0.35: i = 0
    elif d > th[2] and r2 < 0.75: i = 3
    elif d > th[1]: i = 2
    else: i = 1
    return C[tones[min(i, len(tones) - 1)]]


BODY = ["b1", "b2", "b3", "b4"]
LIMB_B = ["b0", "b1", "b1", "b2"]
BELLY = ["w0", "w2", "w2", "w2"]
ANT = ["t0", "t1", "t2", "t2"]


def antler(cx, base_y, lean, flip=1):
    """Y-shaped antler as union of capsules (supersampled)."""
    tipx = cx + lean
    m = capsule(cx, base_y + 2, tipx, base_y - 8, 1.6)
    m |= capsule(cx + lean * .45, base_y - 3.5, cx + lean * .45 - 3.6 * flip, base_y - 7, 1.3)
    m |= capsule(tipx, base_y - 8, tipx + 2.4 * flip, base_y - 11, 1.25)
    m |= capsule(tipx, base_y - 8, tipx - 1.6 * flip, base_y - 11.5, 1.25)
    return m


def puang(pose="run0"):
    sp = Sprite()
    bob = {"run0": 0, "run1": -1, "run2": 0, "run3": -1, "jump": -2, "hurt": 0}.get(pose, 0)
    by = 44 + bob  # body center y
    hy = 25 + bob  # head center y
    # --- tail (behind) ---
    wag = {"run0": 0, "run1": 1, "run2": 2, "run3": 1}.get(pose, 0)
    tail = capsule(21, by + 4, 14, by + 3, 2.6) | capsule(14, by + 3, 10, by - 1 + wag, 2.0) | capsule(10, by - 1 + wag, 9, by - 5 + wag, 1.6)
    if pose == "hurt": tail = capsule(21, by + 4, 13, by + 5, 2.6) | capsule(13, by + 5, 8, by + 4, 1.8)
    sp.add("tail", tail, "sph", tones=LIMB_B, sph=(14, by - 2, 9, 8), group="tail")
    fx, fy = (9, by - 7 + wag) if pose != "hurt" else (7, by + 3)
    flower = ell(fx, fy - 1.6, 1.6, 1.8) | ell(fx - 1.8, fy - 0.2, 1.7, 1.5) | ell(fx + 1.8, fy - 0.2, 1.7, 1.5) | ell(fx - 1.1, fy + 1.6, 1.5, 1.5) | ell(fx + 1.1, fy + 1.6, 1.5, 1.5)
    sp.add("flower", flower, "sph", tones=["p0", "p1", "p2", "p2"], sph=(fx, fy, 3, 3), line="m", group="flower")
    # --- back leg / back arm ---
    legs = {
        "run0": [((24, by + 6), (19, by + 12)), ((31, by + 6), (36, by + 12))],
        "run1": [((25, by + 6), (23, by + 13)), ((30, by + 6), (33, by + 12))],
        "run2": [((25, by + 6), (30, by + 12)), ((30, by + 6), (25, by + 12))],
        "run3": [((26, by + 6), (28, by + 13)), ((30, by + 6), (27, by + 12))],
        "jump": [((24, by + 5), (20, by + 9)), ((31, by + 5), (34, by + 8))],
        "hurt": [((24, by + 6), (22, by + 13)), ((31, by + 6), (33, by + 13))],
        "stand": [((25, by + 6), (24, by + 13)), ((31, by + 6), (32, by + 13))],
    }.get(pose, [((25, by + 6), (24, by + 13)), ((31, by + 6), (32, by + 13))])
    (a0, a1), (b0, b1) = legs
    sp.add("legB", capsule(*a0, *a1, 3.0), "sph", tones=LIMB_B, sph=(a1[0], a1[1] - 2, 4, 5), group="legB")
    armB = {"run0": ((30, by - 3), (37, by + 1)), "run1": ((29, by - 3), (34, by + 3)), "run2": ((29, by - 3), (23, by + 1)), "run3": ((29, by - 3), (26, by + 3)),
            "jump": ((29, by - 4), (34, by - 10)), "hurt": ((25, by - 3), (20, by - 7)), "cheer": ((25, by - 4), (19, by - 9)),
            "fish": ((29, by - 3), (37, by - 4))}.get(pose, ((27, by - 3), (24, by + 3)))
    sp.add("armB", capsule(*armB[0], *armB[1], 2.4), "sph", tones=LIMB_B, sph=(armB[1][0], armB[1][1], 3, 3), group="armB")
    # --- body ---
    sp.add("body", ell(28, by, 9.5, 8.5), "sph", tones=BODY, sph=(27, by - 2, 10, 10), group="body")
    sp.add("belly", ell(31.5, by + 1.5, 5.6, 6.0) & ell(28, by, 9.5, 8.5), "sph", tones=BELLY, sph=(30, by - 1, 7, 7), group="body")
    sp.add("legF", capsule(*b0, *b1, 3.1), "sph", tones=BODY, sph=(b1[0] - 1, b1[1] - 3, 4, 5), line="b0", group="legF")
    # --- antlers (behind head top) ---
    sp.add("antL", antler(22, hy - 11, -2.5, -1), "sph", tones=ANT, sph=(21, hy - 18, 4, 6), line="t0", group="ant")
    sp.add("antR", antler(33, hy - 13, 1.5, 1), "sph", tones=ANT, sph=(33, hy - 20, 4, 6), line="t0", group="ant2")
    # --- ear fin (back of head) ---
    fin = ell(13, hy - 3, 3.6, 2.6, -0.5)
    sp.add("fin", fin, "sph", tones=LIMB_B, sph=(12, hy - 4, 4, 3), group="fin")
    # --- head: wide rounded with a soft crest at the back-top ---
    head = ell(31, hy, 17.5, 14) | ell(23, hy - 7, 9, 8.5)
    sp.add("head", head, "sph", tones=BODY, sph=(30, hy - 2, 18, 16), line="o2", group="head", th=(-0.5, 0.42, 0.66))
    # --- front arm (in front of body) ---
    armF = {"run0": ((25, by - 2), (20, by + 2)), "run1": ((25, by - 2), (22, by + 3)), "run2": ((30, by - 2), (35, by + 1)), "run3": ((29, by - 2), (32, by + 3)),
            "jump": ((26, by - 3), (19, by - 8)), "hurt": ((30, by - 2), (36, by - 7)), "cheer": ((33, by - 4), (40, by - 9)),
            "fish": ((30, by - 2), (39, by - 3))}.get(pose, ((27, by - 2), (31, by + 4)))
    sp.add("armF", capsule(*armF[0], *armF[1], 2.6), "sph", tones=BODY, sph=(armF[1][0] - 1, armF[1][1] - 1, 3, 3), line="b0", group="armF")
    img = sp.render()
    face(img, pose, hy)
    return img


def put(img, x, y, c):
    x, y = x + OX, y + OY
    if 0 <= x < W and 0 <= y < H: img[y, x] = (*C[c], 255)


def face(img, pose, hy):
    ey = hy - 1
    E = [(36, ey), (45, ey - 1)]
    if pose == "hurt":
        for ex, eyy in E:
            for d in (-1, 0, 1):
                put(img, ex + d, eyy + d, "k"); put(img, ex + d, eyy - d, "k")
    elif pose in ("blink",):
        for ex, eyy in E:
            for d in (-1, 0, 1): put(img, ex + d, eyy + 1, "k")
    elif pose in ("cheer", "happy"):
        for ex, eyy in E:  # ^ ^
            put(img, ex - 1, eyy + 1, "k"); put(img, ex, eyy, "k"); put(img, ex + 1, eyy + 1, "k")
    else:
        big = pose == "wow"
        for ex, eyy in E:
            for yy in range(eyy - 1 - big, eyy + 2):
                put(img, ex, yy, "k"); put(img, ex + 1, yy, "k")
                if big: put(img, ex - 1, yy, "k")
            put(img, ex + 1, eyy - 1 - big, "wh")
    # cheeks
    for cx, cy in ((33, hy + 4), (48, hy + 3)):
        for dx in (-1, 0, 1):
            put(img, cx + dx, cy, "pk")
        put(img, cx, cy - 1, "pk") if pose == "wow" else None
    # mouth
    my = hy + 4
    if pose in ("jump", "cheer", "wow", "run1", "run3"):
        for x in range(39, 44): put(img, x, my, "k")
        for x in range(40, 43): put(img, x, my + 1, "m")
        put(img, 40, my + 1, "k"); put(img, 43, my + 1, "k") if False else None
        put(img, 41, my + 2, "k"); put(img, 42, my + 2, "k"); put(img, 40, my + 1, "m")
    elif pose == "hurt":
        for x in range(39, 44): put(img, x, my + 1 - (1 if x in (40, 42) else 0), "k")
    else:
        for x in range(39, 44): put(img, x, my, "k")
        put(img, 38, my - 1, "k"); put(img, 44, my - 1, "k")
    put(img, 40, my + 1, "wh") if pose not in ("jump", "cheer", "wow", "run1", "run3", "hurt") else None  # fang
    # whiskers: curl from snout right
    wx, wy = 49, hy + 2
    for (dx, dy) in ((0, 0), (1, 0), (2, -1), (3, -2), (3, -3), (2, -4), (1, -3)):
        put(img, wx + dx, wy + dy, "o")
    # nostril
    put(img, 47, hy + 1, "b0")


POSES = ["run0", "run1", "run2", "run3", "jump", "hurt", "stand", "blink", "wow", "cheer", "fish"]

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    sheet = Image.new("RGBA", (W * len(POSES), H))
    for i, p in enumerate(POSES):
        im = Image.fromarray(puang(p), "RGBA")
        im.save(os.path.join(OUT, f"puang_{p}.png"))
        sheet.alpha_composite(im, (i * W, 0))
    sheet.save(os.path.join(OUT, "puang_sheet.png"))
    bg = Image.new("RGBA", sheet.size, (234, 242, 252, 255)); bg.alpha_composite(sheet)
    bg.resize((sheet.width * 5, sheet.height * 5), Image.NEAREST).save(os.path.join(OUT, "puang_sheet_5x.png"))
    print("ok")
