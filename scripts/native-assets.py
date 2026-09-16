"""Generate platform icons and launch artwork from the project's rendered SVG.

Run node scripts/capture.mjs first, then python3 scripts/native-assets.py.
Requires Pillow, only for developer asset generation.
"""
from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parent.parent
icon = Image.open(root / 'artifacts/icon-1024.png').convert('RGB')
icon.save(root / 'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png')
res = root / 'android/app/src/main/res'
for density, size in [('mdpi', 48), ('hdpi', 72), ('xhdpi', 96), ('xxhdpi', 144), ('xxxhdpi', 192)]:
    folder = res / f'mipmap-{density}'
    base = icon.resize((size, size), Image.Resampling.LANCZOS)
    base.save(folder / 'ic_launcher.png')
    base.save(folder / 'ic_launcher_round.png')
    adaptive_size = round(size * 108 / 48)
    adaptive = Image.new('RGB', (adaptive_size, adaptive_size), '#102422')
    inset_icon = icon.resize((round(adaptive_size * .6),) * 2, Image.Resampling.LANCZOS)
    margin = (adaptive_size - inset_icon.width) // 2
    adaptive.paste(inset_icon, (margin, margin))
    adaptive.save(folder / 'ic_launcher_foreground.png')

# Replace Capacitor's default launch artwork while retaining generated dimensions.
for path in [*res.glob('drawable*/splash.png'), *(root / 'ios/App/App/Assets.xcassets/Splash.imageset').glob('*.png')]:
    original = Image.open(path)
    splash = Image.new('RGB', original.size, '#102422')
    size = max(40, round(min(original.size) * .20))
    badge = icon.resize((size, size), Image.Resampling.LANCZOS)
    splash.paste(badge, ((splash.width-size)//2, (splash.height-size)//2))
    splash.save(path)
print('Native icons and splash artwork generated.')
