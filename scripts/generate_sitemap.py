#!/usr/bin/env python3
"""Regenerate public/sitemap.xml with every product page.

Run from the repo root (after pulling the fixes):
    python scripts/generate_sitemap.py
Reads src/data/catalog.json, writes public/sitemap.xml.
Safe to re-run any time; it only reads the catalog and rewrites
the sitemap file.
"""
import json
import os
import xml.etree.ElementTree as ET
from xml.dom import minidom

BASE_URL = "https://laz2a-stickers.vercel.app"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CATALOG = os.path.join(ROOT, "src", "data", "catalog.json")
OUT = os.path.join(ROOT, "public", "sitemap.xml")

STATIC_PAGES = [
    ("/", "daily", "1.0"),
    ("/collections", "weekly", "0.8"),
    ("/checkout", "monthly", "0.5"),
    ("/feedback", "monthly", "0.5"),
    ("/labels-preview", "monthly", "0.5"),
]

def main():
    with open(CATALOG, encoding="utf-8") as f:
        catalog = json.load(f)

    urlset = ET.Element("urlset", {"xmlns": "http://www.sitemaps.org/schemas/sitemap/0.9"})

    def add_url(loc, changefreq, priority):
        url = ET.SubElement(urlset, "url")
        ET.SubElement(url, "loc").text = loc
        ET.SubElement(url, "changefreq").text = changefreq
        ET.SubElement(url, "priority").text = priority

    for path, freq, prio in STATIC_PAGES:
        add_url(BASE_URL + path, freq, prio)

    seen = set()
    for product in catalog:
        pid = str(product.get("id", "")).strip()
        if not pid or pid in seen:
            continue
        seen.add(pid)
        add_url(f"{BASE_URL}/product/{pid}", "weekly", "0.7")

    xml = minidom.parseString(ET.tostring(urlset, encoding="utf-8")).toprettyxml(
        indent="  ", encoding="utf-8"
    )
    with open(OUT, "wb") as f:
        f.write(xml)
    print(f"Wrote {OUT} with {len(urlset)} urls "
          f"({len(STATIC_PAGES)} static + {len(seen)} products).")

if __name__ == "__main__":
    main()
