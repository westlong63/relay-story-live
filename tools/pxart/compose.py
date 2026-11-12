import os, sys
from PIL import Image
O = os.path.join(os.path.dirname(__file__), "out")
L = lambda n: Image.open(os.path.join(O, n + ".png")).convert("RGBA")


def tile_x(dst, im, y, x0=0):
    x = x0 % im.width - im.width
    while x < dst.width:
        dst.alpha_composite(im, (x, y)) if x >= 0 else dst.alpha_composite(im.crop((-x, 0, im.width, im.height)), (0, y)) if -x < im.width else None
        x += im.width


def hero(W=427, H=240, extra=None):
    c = Image.new("RGBA", (W, H))
    tile_x(c, L("sky"), 0)
    s = L("sun"); c.alpha_composite(s, (W - 125, -70))
    for n, x, y in (("cloud3", -30, 60), ("cloud1", 170, 22), ("cloud2", 250, 72), ("cloud4", 120, 12), ("cloud1", 330, 60), ("cloud4", 60, 40)):
        im = L(n)
        if x < 0: im = im.crop((-x, 0, im.width, im.height)); x = 0
        c.alpha_composite(im, (x, y))
    tile_x(c, L("cityfar"), 158 - 90, 40)
    tile_x(c, L("city"), 165 - 112)
    tile_x(c, L("street"), 172 - 120 + 4)
    tile_x(c, L("fence"), 148)
    road_top = 184
    r = L("road")
    for yy in range(road_top, H, r.height):
        tile_x(c, r, yy)
    tile_x(c, L("curb"), road_top - 2)
    # lane lines
    from PIL import ImageDraw
    d = ImageDraw.Draw(c)
    for ly in (205,):
        for x in range(0, W, 24): d.rectangle((x, ly, x + 13, ly + 1), fill=(233, 238, 244, 255))
    tile_x(c, L("hedge"), H - 24)
    if extra: extra(c)
    return c


if __name__ == "__main__":
    im = hero()
    im.save(os.path.join(O, "hero_1x.png"))
    im.resize((im.width * 4, im.height * 4), Image.NEAREST).save(os.path.join(O, "hero_4x.png"))
    im.resize((im.width * 2, im.height * 2), Image.NEAREST).save(os.path.join(O, "hero_2x.png"))
    print("ok")
