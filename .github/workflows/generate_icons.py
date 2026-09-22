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

    print("Davora app icons and branding successfully applied!")

if __name__ == "__main__":
    main()
