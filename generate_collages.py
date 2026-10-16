#!/usr/bin/env python3
"""Generate deterministic collection cover collages from catalog member IDs."""
import json
import random
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent
CATALOG_PATH = ROOT / "src" / "data" / "catalog.json"
STICKERS_DIR = ROOT / "public" / "stickers"


def create_collection_collage(collection, products_by_id):
    member_ids = collection.get("member_ids")
    if not isinstance(member_ids, list) or not member_ids:
        raise ValueError(f"Collection {collection.get('id')} has no member_ids")
    if len(set(map(int, member_ids))) != len(member_ids):
        raise ValueError(f"Collection {collection.get('id')} has duplicate member IDs")

    canvas_size = 1000
    columns = 4
    cell_size = canvas_size // columns
    rows = (len(member_ids) + columns - 1) // columns
    canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    rng = random.Random(int(collection["id"]))

    for index, product_id in enumerate(member_ids):
        product = products_by_id.get(int(product_id))
        if product is None:
            raise ValueError(
                f"Collection {collection['id']} references missing product {product_id}"
            )
        image_path = STICKERS_DIR / product["relative_path"]
        if not image_path.is_file():
            raise FileNotFoundError(image_path)

        with Image.open(image_path) as source:
            sticker = source.convert("RGBA")
        sticker.thumbnail((cell_size - 34, cell_size - 34), Image.Resampling.LANCZOS)
        angle = rng.randint(-7, 7)
        sticker = sticker.rotate(
            angle, expand=True, resample=Image.Resampling.BICUBIC
        )

        row, column = divmod(index, columns)
        cell_x = column * cell_size
        cell_y = row * cell_size
        jitter_x = rng.randint(-8, 8)
        jitter_y = rng.randint(-8, 8)
        x = cell_x + (cell_size - sticker.width) // 2 + jitter_x
        y = cell_y + (cell_size - sticker.height) // 2 + jitter_y
        canvas.alpha_composite(sticker, (x, y))

    relative_path = collection.get("relative_path")
    if not relative_path:
        raise ValueError(f"Collection {collection.get('id')} has no relative_path")
    output_path = STICKERS_DIR / relative_path
    output_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(output_path, "WEBP", quality=90, method=6)
    print(f"Created {output_path} from {len(member_ids)} selected stickers")


def main():
    catalog = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    products_by_id = {
        int(product["id"]): product
        for product in catalog
        if not product.get("isCollection")
    }
    collections = [product for product in catalog if product.get("isCollection")]
    if not collections:
        raise SystemExit("No collections found in catalog.json")

    for collection in collections:
        create_collection_collage(collection, products_by_id)


if __name__ == "__main__":
    main()
