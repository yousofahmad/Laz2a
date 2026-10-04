import os
import random
from PIL import Image, ImageOps, ImageDraw

def create_sticker_collage(input_dir, output_path, num_stickers=15, canvas_size=(1000, 1000)):
    # Get all webp images in the directory
    valid_extensions = ('.webp', '.png', '.jpg')
    files = [f for f in os.listdir(input_dir) if f.lower().endswith(valid_extensions)]
    
    if len(files) < num_stickers:
        num_stickers = len(files)
        
    selected_files = random.sample(files, num_stickers)
    
    # Create a transparent canvas
    canvas = Image.new('RGBA', canvas_size, (0, 0, 0, 0))
    
    # Center and scatter parameters
    center_x, center_y = canvas_size[0] // 2, canvas_size[1] // 2
    max_radius = 350
    
    for i, file in enumerate(selected_files):
        img_path = os.path.join(input_dir, file)
        try:
            with Image.open(img_path) as img:
                img = img.convert('RGBA')
                
                # Resize sticker to roughly 300x300 while maintaining aspect ratio
                img.thumbnail((350, 350), Image.Resampling.LANCZOS)
                
                # Random rotation -30 to 30 degrees
                angle = random.randint(-30, 30)
                img = img.rotate(angle, expand=True, resample=Image.Resampling.BICUBIC)
                
                # Position logic - distribute them around the center
                # First one in the exact center, others scattered around
                if i == 0:
                    offset_x, offset_y = 0, 0
                else:
                    angle_rad = (i / float(num_stickers)) * 2 * 3.14159
                    r = random.uniform(50, max_radius)
                    offset_x = int(r * os.math.cos(angle_rad) if hasattr(os, 'math') else r * __import__('math').cos(angle_rad))
                    offset_y = int(r * os.math.sin(angle_rad) if hasattr(os, 'math') else r * __import__('math').sin(angle_rad))
                
                paste_x = center_x + offset_x - (img.width // 2)
                paste_y = center_y + offset_y - (img.height // 2)
                
                # Paste using alpha composite
                canvas.alpha_composite(img, (paste_x, paste_y))
        except Exception as e:
            print(f"Error processing {file}: {e}")
            
    # Save the collage
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    canvas.save(output_path, 'WEBP', quality=90)
    print(f"Created {output_path}")

categories = {
    '01_Tech_and_Programming': 'programming_collection.webp',
    '02_Arabic_Memes_and_Slang': 'memes_collection.webp',
    '07_Motivation_and_Work': 'motivation_collection.webp',
    '04_Gym_and_Fitness': 'gym_collection.webp',
    '10_Movies_Series_and_Gaming': 'gaming_collection.webp'
}

base_dir = 'public/stickers'
out_dir = 'public/stickers/Collections'

for cat_folder, out_name in categories.items():
    input_path = os.path.join(base_dir, cat_folder)
    output_path = os.path.join(out_dir, out_name)
    if os.path.exists(input_path):
        create_sticker_collage(input_path, output_path)
    else:
        print(f"Category folder not found: {input_path}")
