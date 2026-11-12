"""HD pixel-art helpers (numpy RGBA canvases, shaded blobs, dithering)."""
import math, random
import numpy as np
from PIL import Image, ImageDraw, ImageFont

BAYER4 = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]) / 16.0


def hexc(h, a=255):
    h = h.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), a)


class Cv:
    def __init__(s, w, h):
        s.w, s.h = w, h
        s.a = np.zeros((h, w, 4), np.uint8)

    def px(s, x, y, c):
        x, y = int(x), int(y)
        if 0 <= x < s.w and 0 <= y < s.h:
            s.a[y, x] = hexc(c) if isinstance(c, str) else c

    def rect(s, x0, y0, x1, y1, c):  # inclusive-exclusive
        x0, y0, x1, y1 = max(0, int(x0)), max(0, int(y0)), min(s.w, int(x1)), min(s.h, int(y1))
        if x1 > x0 and y1 > y0:
            s.a[y0:y1, x0:x1] = hexc(c) if isinstance(c, str) else c

    def mask_paint(s, m, c, ox=0, oy=0):
        h, w = m.shape
        col = np.array(hexc(c) if isinstance(c, str) else c, np.uint8)
        ys, xs = np.nonzero(m)
        xs = xs + ox; ys = ys + oy
        ok = (xs >= 0) & (xs < s.w) & (ys >= 0) & (ys < s.h)
        s.a[ys[ok], xs[ok]] = col

    def paste(s, o, x, y):
        """alpha-over paste of another Cv (binary alpha)."""
        x, y = int(x), int(y)
        for yy in range(o.h):
            ty = y + yy
            if not 0 <= ty < s.h: continue
            row = o.a[yy]
            xs = np.nonzero(row[:, 3] > 0)[0]
            for xx in xs:
                tx = x + xx
                if 0 <= tx < s.w: s.a[ty, tx] = row[xx]

    def paste_fast(s, o, x, y):
        x, y = int(x), int(y)
        sx0, sy0 = max(0, -x), max(0, -y)
        sx1, sy1 = min(o.w, s.w - x), min(o.h, s.h - y)
        if sx1 <= sx0 or sy1 <= sy0: return
        src = o.a[sy0:sy1, sx0:sx1]
        dst = s.a[y + sy0:y + sy1, x + sx0:x + sx1]
        m = src[:, :, 3] > 0
        dst[m] = src[m]

    def img(s):
        return Image.fromarray(s.a, "RGBA")

    def save(s, p, scale=1):
        im = s.img()
        if scale > 1: im = im.resize((s.w * scale, s.h * scale), Image.NEAREST)
        im.save(p)


def dither_pick(tones, t, x, y):
    """t in [0,1] maps across tones list with ordered dithering between neighbours."""
    n = len(tones) - 1
    v = min(max(t, 0), 0.9999) * n
    i = int(v); f = v - i
    if i >= n: return tones[n]
    return tones[i + 1] if f > BAYER4[y % 4, x % 4] else tones[i]


def circle_mask(w, h, circles):
    """returns label map: index of top-most circle covering each pixel (-1 none)."""
    yy, xx = np.mgrid[0:h, 0:w]
    lab = -np.ones((h, w), int)
    for i, (cx, cy, r) in enumerate(circles):
        m = (xx + .5 - cx) ** 2 + (yy + .5 - cy) ** 2 <= r * r
        lab[m] = i
    return lab


def shaded_blob(w, h, circles, tones, light=(-0.55, -0.75), flat_bottom=None, rim=None, vgrad=0.0, noise=0.0, seed=1, outline=None):
    """Sphere-shaded union of circles. tones dark->light. returns Cv."""
    rnd = random.Random(seed)
    lab = circle_mask(w, h, circles)
    if flat_bottom is not None:
        lab[int(flat_bottom):, :] = -1
    c = Cv(w, h)
    lx, ly = light; ln = math.hypot(lx, ly); lx, ly = lx / ln, ly / ln
    ys, xs = np.nonzero(lab >= 0)
    for x, y in zip(xs, ys):
        cx, cy, r = circles[lab[y, x]]
        nx, ny = (x + .5 - cx) / r, (y + .5 - cy) / r
        nz = math.sqrt(max(0, 1 - nx * nx - ny * ny))
        d = -(nx * lx + ny * ly) * 0.75 + nz * 0.35
        t = 0.5 + d * 0.6
        if vgrad: t -= vgrad * (y / h - 0.5)
        if noise: t += (rnd.random() - .5) * noise
        c.a[y, x] = hexc(dither_pick(tones, t, x, y))
    if outline:
        m = lab >= 0
        edge = m & ~(np.roll(m, 1, 0) & np.roll(m, -1, 0) & np.roll(m, 1, 1) & np.roll(m, -1, 1))
        c.mask_paint(edge, outline)
    return c


def text_mask(txt, font_path, size, spacing=0):
    f = ImageFont.truetype(font_path, size)
    bb = f.getbbox(txt)
    w = bb[2] - bb[0] + 2 + spacing * len(txt); h = bb[3] + 2
    im = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(im)
    if spacing:
        x = 1
        for ch in txt:
            d.text((x, 0), ch, font=f, fill=255)
            x += f.getbbox(ch)[2] + spacing if ch != " " else size // 2 + spacing
    else:
        d.text((1 - bb[0], 0), txt, font=f, fill=255)
    m = np.array(im) > 110
    ys, xs = np.nonzero(m)
    if len(xs) == 0: return m
    return m[ys.min():ys.max() + 1, xs.min():xs.max() + 1]


def outline_mask(m, r=1, diag=True):
    o = m.copy()
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            if not diag and dx and dy: continue
            o |= np.roll(np.roll(m, dy, 0), dx, 1)
    return o & ~m


def pad(m, p):
    return np.pad(m, p)
