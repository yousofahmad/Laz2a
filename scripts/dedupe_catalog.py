#!/usr/bin/env python3
"""Remove exact duplicate products from src/data/catalog.json.

A product is an exact duplicate when another product has the SAME
title AND the SAME image (relative_path). Only the first copy is kept.
Products that share a title but have a DIFFERENT image are left alone
(they are design variants, not duplicates).

Run from the repo root:
    python scripts/dedupe_catalog.py
It backs the catalog up to src/data/catalog.json.bak first and prints
exactly which ids it removed, so you can review before committing.
"""
import json
import os
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CATALOG = os.path.join(ROOT, "src", "data", "catalog.json")

def main():
    with open(CATALOG, encoding="utf-8") as f:
        catalog = json.load(f)

    seen = {}
    kept = []
    removed = []
    for product in catalog:
        title = str(product.get("title", "")).strip()
        image = str(product.get("relative_path", "")).strip()
        key = (title.lower(), image)
        if key in seen:
            removed.append((product.get("id"), title, image))
            continue
        seen[key] = product.get("id")
        kept.append(product)

    if not removed:
        print("No exact duplicates found. Nothing changed.")
        return

    shutil.copyfile(CATALOG, CATALOG + ".bak")
    with open(CATALOG, "w", encoding="utf-8") as f:
        json.dump(kept, f, ensure_ascii=False, indent=2)

    print(f"Removed {len(removed)} exact duplicate(s); "
          f"{len(catalog)} -> {len(kept)} products. Backup: catalog.json.bak")
    for pid, title, image in removed:
        print(f"  - id={pid} title={title!r} image={image!r}")

if __name__ == "__main__":
    main()
