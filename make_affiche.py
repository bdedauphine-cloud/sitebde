#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
make_affiche.py — Prépare l'affiche d'un événement pour le site.

Prend une image d'affiche (JPG/PNG, même très lourde, telle qu'elle sort de
Canva ou de Photoshop) et génère automatiquement toutes les versions légères
dont le site a besoin : 3 largeurs x 2 formats modernes (AVIF + WebP), plus
un JPG de secours.

Usage :
    python make_affiche.py mon-affiche.jpg croisette

    -> uploads/affiche-croisette.jpg         (secours)
      uploads/affiche-croisette-640.avif     + .webp
      uploads/affiche-croisette-960.avif     + .webp
      uploads/affiche-croisette-1536.avif    + .webp

Ensuite, dans csv/events.csv, sur la ligne de l'événement :
    AFFICHE IMAGE                      = uploads/affiche-croisette.jpg
    AFFICHE RATIO                      = 1179/1462
    AFFICHE IMAGES RESPONSIVES         = OUI
    AFFICHE                            = AUTO

Recopier AFFICHE RATIO tel quel : ce sont les dimensions reelles de
l'image. Elles evitent tout decalage au chargement et indiquent au site
quelles largeurs ont ete generees (aucune n'est plus large que
l'original).

C'est tout. L'affiche apparaîtra seule 14 jours avant la date de l'événement.

Prérequis : pip install pillow
"""

import sys
from pathlib import Path

ROOT = Path(__file__).parent
UPLOADS = ROOT / "uploads"
WIDTHS = (640, 960, 1536)


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)

    source = Path(sys.argv[1])
    slug = sys.argv[2].strip().lower()

    if not source.exists():
        print(f"\n  ERREUR : fichier introuvable : {source}\n")
        sys.exit(1)

    try:
        from PIL import Image
    except ImportError:
        print("\n  ERREUR : Pillow n'est pas installé.")
        print("  Lance d'abord :  pip install pillow\n")
        sys.exit(1)

    UPLOADS.mkdir(exist_ok=True)
    img = Image.open(source).convert("RGB")
    base = UPLOADS / f"affiche-{slug}"

    print()
    print(f"  Source : {source.name}  ({img.width}x{img.height})")
    print()

    made = []
    for w in WIDTHS:
        if w > img.width:
            print(f"  (ignoré {w}px — l'image source ne fait que {img.width}px de large)")
            continue
        h = round(img.height * w / img.width)
        small = img.resize((w, h), Image.LANCZOS)
        for ext, kwargs in (("avif", {"quality": 52}),
                            ("webp", {"quality": 76, "method": 6})):
            out = Path(f"{base}-{w}.{ext}")
            small.save(out, **kwargs)
            made.append(out)

    # JPG de secours — 960px de large, suffisant pour tous les navigateurs
    fw = min(960, img.width)
    fh = round(img.height * fw / img.width)
    fallback = Path(f"{base}.jpg")
    img.resize((fw, fh), Image.LANCZOS).save(
        fallback, quality=82, optimize=True, progressive=True)
    made.append(fallback)

    for f in made:
        print(f"  OK  {f.relative_to(ROOT).as_posix():<44} {f.stat().st_size // 1024:>5} Ko")

    ratio = f"{img.width}/{img.height}"
    print()
    print("  Terminé. Dans csv/events.csv, sur la ligne de l'événement :")
    print()
    print(f"    AFFICHE IMAGE               = {fallback.relative_to(ROOT).as_posix()}")
    print(f"    AFFICHE RATIO               = {ratio}")
    print( "    AFFICHE IMAGES RESPONSIVES  = OUI")
    print( "    AFFICHE                     = AUTO")
    print()


if __name__ == "__main__":
    main()
