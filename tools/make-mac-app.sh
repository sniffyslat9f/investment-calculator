#!/bin/bash
# Rebuilds the Mac desktop app: a clickable icon in /Applications that opens the
# live site. There is nothing to install — the app is a shortcut with an icon.
#
#   bash tools/make-mac-app.sh
#
set -e
URL="https://historic-growth-calculator.vercel.app"
APP="/Applications/Investment Calculator.app"
HERE="$(cd "$(dirname "$0")" && pwd)"

# The icon: a green rounded square with the same rising-chart mark as the app
# header. Drawn in code so it can be regenerated, rather than kept only as a
# binary nobody can edit. Needs Pillow (pip3 install pillow).
python3 - "$HERE" <<'PY'
import sys, os
from PIL import Image, ImageDraw

here = sys.argv[1]

def icon(size):
    S = size * 4  # draw large, shrink down, so the edges come out smooth
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, S-1, S-1], radius=int(S*0.225), fill=(16, 185, 129, 255))
    w = max(2, int(S * 0.055))
    d.line([(S*0.20, S*0.70), (S*0.42, S*0.48), (S*0.55, S*0.61), (S*0.79, S*0.34)],
           fill=(255, 255, 255, 255), width=w, joint="curve")
    d.polygon([(S*0.82, S*0.31), (S*0.82, S*0.53), (S*0.60, S*0.31)], fill=(255, 255, 255, 255))
    return img.resize((size, size), Image.LANCZOS)

out = os.path.join(here, "icon.iconset")
os.makedirs(out, exist_ok=True)
for s in (16, 32, 64, 128, 256, 512, 1024):
    icon(s).save(f"{out}/icon_{s}x{s}.png")
    if s <= 512:
        icon(s*2).save(f"{out}/icon_{s}x{s}@2x.png")
PY

iconutil -c icns "$HERE/icon.iconset" -o "$HERE/icon.icns"
rm -rf "$HERE/icon.iconset"

rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"
cp "$HERE/icon.icns" "$APP/Contents/Resources/icon.icns"

cat > "$APP/Contents/Info.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleName</key><string>Investment Calculator</string>
  <key>CFBundleDisplayName</key><string>Investment Calculator</string>
  <key>CFBundleIdentifier</key><string>uk.local.investment-calculator</string>
  <key>CFBundleVersion</key><string>1.0</string>
  <key>CFBundleShortVersionString</key><string>1.0</string>
  <key>CFBundleExecutable</key><string>launch</string>
  <key>CFBundleIconFile</key><string>icon</string>
  <key>CFBundlePackageType</key><string>APPL</string>
  <key>LSMinimumSystemVersion</key><string>10.13</string>
  <key>NSHighResolutionCapable</key><true/>
</dict>
</plist>
PLIST

cat > "$APP/Contents/MacOS/launch" <<LAUNCH
#!/bin/bash
open "$URL"
LAUNCH

chmod +x "$APP/Contents/MacOS/launch"
touch "$APP"   # nudges Finder into picking up the new icon
echo "Built: $APP  ->  $URL"
