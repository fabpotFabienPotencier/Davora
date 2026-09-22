import os
import sys
from PIL import Image

def generate_icons():
    # Find source image
    possible_paths = [
        os.path.join(os.path.dirname(__file__), "app_icon.png"),
        ".github/workflows/app_icon.png",
        "app_icon.png",
        "assets/app_icon.png"
    ]
    
    src_icon = None
    for p in possible_paths:
        if os.path.exists(p):
            src_icon = p
            break
            
    if not src_icon:
        print(f"Error: app_icon.png not found in {possible_paths}")
        sys.exit(1)
        
    print(f"Loading source icon from: {src_icon}")
    img = Image.open(src_icon).convert("RGBA")
    
    res_dir = "android/app/src/main/res"
    if not os.path.exists(res_dir):
        print(f"Creating directory: {res_dir}")
        os.makedirs(res_dir, exist_ok=True)

    # 1. Launcher and Round icons
    mipmap_sizes = {
        "mipmap-mdpi": (48, 48),
        "mipmap-hdpi": (72, 72),
        "mipmap-xhdpi": (96, 96),
        "mipmap-xxhdpi": (144, 144),
        "mipmap-xxxhdpi": (192, 192),
    }

    # 2. Adaptive Foreground icons (108dp with safe margins)
    foreground_sizes = {
        "mipmap-mdpi": (108, 108),
        "mipmap-hdpi": (162, 162),
        "mipmap-xhdpi": (216, 216),
        "mipmap-xxhdpi": (324, 324),
        "mipmap-xxxhdpi": (432, 432),
    }

    for folder, size in mipmap_sizes.items():
        target_folder = os.path.join(res_dir, folder)
        os.makedirs(target_folder, exist_ok=True)
        resized = img.resize(size, Image.LANCZOS)
        resized.save(os.path.join(target_folder, "ic_launcher.png"), "PNG")
        resized.save(os.path.join(target_folder, "ic_launcher_round.png"), "PNG")

    for folder, size in foreground_sizes.items():
        target_folder = os.path.join(res_dir, folder)
        os.makedirs(target_folder, exist_ok=True)
        fg_resized = img.resize(size, Image.LANCZOS)
        fg_resized.save(os.path.join(target_folder, "ic_launcher_foreground.png"), "PNG")

    # 3. Splash screens with sleek dark background (#0a0a0c) and centered Davora logo
    splash_sizes = {
        "drawable": (480, 800),
        "drawable-port-mdpi": (320, 480),
        "drawable-port-hdpi": (480, 800),
        "drawable-port-xhdpi": (720, 1280),
        "drawable-port-xxhdpi": (960, 1600),
        "drawable-port-xxxhdpi": (1280, 1920),
        "drawable-land-mdpi": (480, 320),
        "drawable-land-hdpi": (800, 480),
        "drawable-land-xhdpi": (1280, 720),
        "drawable-land-xxhdpi": (1600, 960),
        "drawable-land-xxxhdpi": (1920, 1280),
    }

    bg_color = (10, 10, 12, 255)

    for folder, (w, h) in splash_sizes.items():
        target_folder = os.path.join(res_dir, folder)
        os.makedirs(target_folder, exist_ok=True)
        splash_img = Image.new("RGBA", (w, h), bg_color)
        max_logo_size = int(min(w, h) * 0.38)
        logo_resized = img.resize((max_logo_size, max_logo_size), Image.LANCZOS)
        x = (w - max_logo_size) // 2
        y = (h - max_logo_size) // 2
        splash_img.paste(logo_resized, (x, y), logo_resized)
        splash_img.save(os.path.join(target_folder, "splash.png"), "PNG")

    # 4. Adaptive background XML
    drawable_dir = os.path.join(res_dir, "drawable")
    os.makedirs(drawable_dir, exist_ok=True)
    bg_xml_path = os.path.join(drawable_dir, "ic_launcher_background.xml")
    with open(bg_xml_path, "w") as f:
        f.write('''<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#000000"
        android:pathData="M0,0h108v108h-108z" />
</vector>''')

    print("Successfully generated all Android launcher icons, splash screens, and adaptive vector backgrounds!")

if __name__ == "__main__":
    generate_icons()
