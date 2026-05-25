#!/usr/bin/env python3
"""Generate the WilhelmSK Docs plugin/webapp icon.

Design: a white documentation "page" (rounded card + lines of body text) that
carries the WilhelmSK gauge dial — so the icon reads as "WilhelmSK docs" rather
than just the app's gauge logo. Rendered at 4x and downscaled with LANCZOS for
clean antialiasing. Output: plugin/assets/icon.png (256x256), which gen-info.js
copies into public/icon.png (where package.json's signalk.appIcon points).
"""
import math
import os
from PIL import Image, ImageDraw

S = 4                      # supersample factor
N = 256                    # final size
W = N * S                  # working size
out = os.path.join(os.path.dirname(__file__), "..", "assets", "icon.png")

NAVY = (13, 38, 56, 255)   # marine dark tile
PAGE = (255, 255, 255, 255)
RING = (42, 56, 72, 255)
RED = (216, 64, 52, 255)
GREEN = (38, 168, 92, 255)
NEEDLE = (210, 70, 58, 255)
BLUE = (54, 116, 200, 255)
HUB = (58, 76, 98, 255)
HUB2 = (110, 132, 158, 255)
TEXTLINE = (120, 136, 152, 255)

img = Image.new("RGBA", (W, W), (0, 0, 0, 0))
d = ImageDraw.Draw(img)


def s(v):
    return int(round(v * S))


# Dark rounded tile (transparent outside the corners).
d.rounded_rectangle([0, 0, W - 1, W - 1], radius=s(50), fill=NAVY)

# White document page inset within the tile.
d.rounded_rectangle([s(36), s(34), s(220), s(228)], radius=s(12), fill=PAGE)

# --- Gauge dial (the WilhelmSK motif) in the upper part of the page ---
cx, cy, R = s(128), s(104), s(52)
box = [cx - R, cy - R, cx + R, cy + R]

# Coloured speedometer arc: red on the left sweep, green on the right, with a
# gap at the bottom. (Pillow angles: 0=east, increasing clockwise; 90=bottom.)
d.arc(box, start=130, end=270, fill=RED, width=s(8))
d.arc(box, start=270, end=410, fill=GREEN, width=s(8))
# Bezel ring just inside the coloured arc.
inner = [cx - R + s(10), cy - R + s(10), cx + R - s(10), cy + R - s(10)]
d.arc(inner, start=0, end=360, fill=RING, width=s(3))


def needle(angle_deg, length, half_w, color):
    a = math.radians(angle_deg)
    tipx, tipy = cx + length * math.cos(a), cy + length * math.sin(a)
    # base perpendicular to the needle, centred on the hub
    p = a + math.pi / 2
    bx, by = math.cos(p) * half_w, math.sin(p) * half_w
    d.polygon([(tipx, tipy), (cx + bx, cy + by), (cx - bx, cy - by)], fill=color)


needle(245, R * 0.86, s(5), NEEDLE)   # main needle, upper-left
needle(10, R * 0.60, s(4), BLUE)      # blue counter-needle, right

# Hub
d.ellipse([cx - s(8), cy - s(8), cx + s(8), cy + s(8)], fill=HUB)
d.ellipse([cx - s(3.5), cy - s(3.5), cx + s(3.5), cy + s(3.5)], fill=HUB2)

# --- Body text lines (the "docs" cue) below the dial ---
lines = [(60, 184), (50, 196), (38, 208)]   # (half-width, y) in final px
for hw, y in lines:
    d.rounded_rectangle(
        [s(128 - hw), s(y), s(128 + hw), s(y + 6)],
        radius=s(3), fill=TEXTLINE,
    )

img = img.resize((N, N), Image.LANCZOS)
img.save(out)
print("wrote", os.path.abspath(out), img.size)
