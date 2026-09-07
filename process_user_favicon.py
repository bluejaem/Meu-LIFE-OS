from PIL import Image, ImageChops

# Configuration
input_path = "/home/joao/.gemini/antigravity/brain/55454d0b-4640-4255-9c5a-51d7326484f7/.user_uploaded/media_1786911493089.png"
public_dir = "/home/joao/Documentos/Programas/planner-ti-life-os/public"

def trim(im):
    bg = Image.new(im.mode, im.size, im.getpixel((0,0)))
    diff = ImageChops.difference(im, bg)
    diff = ImageChops.add(diff, diff, 2.0, -100)
    bbox = diff.getbbox()
    if bbox:
        return im.crop(bbox)
    return im

# Open the image
img = Image.open(input_path).convert("RGBA")

# Trim white background
trimmed_img = trim(img)

# It might have a tiny bit of white edge left, let's crop a few more pixels inward just to be safe
width, height = trimmed_img.size
margin = int(width * 0.02) # 2% margin crop to remove anti-aliasing white border
cropped_img = trimmed_img.crop((margin, margin, width - margin, height - margin))

# Resize to high-res standard sizes
img_192 = cropped_img.resize((192, 192), Image.Resampling.LANCZOS)
img_512 = cropped_img.resize((512, 512), Image.Resampling.LANCZOS)

# Save
img_192.save(f"{public_dir}/favicon-192x192.png")
img_512.save(f"{public_dir}/favicon-512x512.png")
img_192.save(f"{public_dir}/apple-touch-icon.png")

# Save a standard size too
img_32 = cropped_img.resize((32, 32), Image.Resampling.LANCZOS)
img_32.save(f"{public_dir}/favicon.png")

print("User favicons processed and generated successfully!")
