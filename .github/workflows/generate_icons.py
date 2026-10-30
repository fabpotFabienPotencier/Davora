import os
from PIL import Image

def main():
    icon_path = ".github/workflows/app_icon.png"
    if not os.path.exists(icon_path):
        print(f"Warning: app_icon.png not found at {icon_path}")
        return

    img = Image.open(icon_path).convert("RGBA")
    res_dir = "android/app/src/main/res"

    densities = {
        "mipmap-mdpi": (48, 108),
        "mipmap-hdpi": (72, 162),
        "mipmap-xhdpi": (96, 216),
        "mipmap-xxhdpi": (144, 324),
        "mipmap-xxxhdpi": (192, 432)
    }

    for folder, (icon_size, fg_size) in densities.items():
        folder_path = os.path.join(res_dir, folder)
        os.makedirs(folder_path, exist_ok=True)

        icon_resized = img.resize((icon_size, icon_size), Image.Resampling.LANCZOS)
        icon_resized.save(os.path.join(folder_path, "ic_launcher.png"), "PNG")
        icon_resized.save(os.path.join(folder_path, "ic_launcher_round.png"), "PNG")

        fg_resized = img.resize((fg_size, fg_size), Image.Resampling.LANCZOS)
        fg_resized.save(os.path.join(folder_path, "ic_launcher_foreground.png"), "PNG")

    bg_xml = os.path.join(res_dir, "values", "ic_launcher_background.xml")
    os.makedirs(os.path.dirname(bg_xml), exist_ok=True)
    with open(bg_xml, "w", encoding="utf-8") as f:
        f.write('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#FFFFFF</color>\n</resources>\n')

    for root, dirs, files in os.walk(res_dir):
        for f in files:
            if f == "splash.png":
                img.save(os.path.join(root, f), "PNG")

    # Notification icon densities (pure white silhouette on transparent background)
    # Required by Android 5.0+ to prevent solid gray/white square or fallback system bell
    notif_densities = {
        "drawable-mdpi": 24,
        "drawable-hdpi": 36,
        "drawable-xhdpi": 48,
        "drawable-xxhdpi": 72,
        "drawable-xxxhdpi": 96,
        "drawable": 48
    }

    # Generate white silhouette for notification status bar
    # 1. Convert image to RGBA
    w, h = img.size
    pixels = img.load()
    
    # Check corner pixels to determine if background is transparent or solid
    corners = [pixels[0, 0], pixels[w - 1, 0], pixels[0, h - 1], pixels[w - 1, h - 1]]
    has_alpha_corners = any(len(c) > 3 and c[3] < 50 for c in corners)

    silhouette = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    sil_pixels = silhouette.load()

    if has_alpha_corners:
        # Image already has transparent background: turn all visible pixels pure white
        for y in range(h):
            for x in range(w):
                p = pixels[x, y]
                alpha = p[3] if len(p) > 3 else 255
                if alpha > 30:
                    sil_pixels[x, y] = (255, 255, 255, alpha)
    else:
        # Image has solid background: use contrast against corner color
        bg_r, bg_g, bg_b = corners[0][0], corners[0][1], corners[0][2]
        for y in range(h):
            for x in range(w):
                p = pixels[x, y]
                # Euclidean distance from corner background color
                dist = ((p[0] - bg_r)**2 + (p[1] - bg_g)**2 + (p[2] - bg_b)**2)**0.5
                if dist > 60:
                    # Foreground element - make pure white
                    sil_pixels[x, y] = (255, 255, 255, min(255, int(dist * 2)))

    for folder, size in notif_densities.items():
        folder_path = os.path.join(res_dir, folder)
        os.makedirs(folder_path, exist_ok=True)
        notif_resized = silhouette.resize((size, size), Image.Resampling.LANCZOS)
        notif_resized.save(os.path.join(folder_path, "ic_stat_davora.png"), "PNG")
        notif_resized.save(os.path.join(folder_path, "ic_stat_name.png"), "PNG")

    print("Davora app icons, branding, and notification silhouettes successfully applied!")

if __name__ == "__main__":
    main()
