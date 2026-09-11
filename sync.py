#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
sync.py — Régénère les fichiers data/*.js depuis les fichiers CSV du dossier csv/
Usage   : python sync.py
Résultat: écrase les 5 fichiers data/*.js avec le contenu des CSV.
"""

import json, csv, sys
from pathlib import Path
from datetime import datetime

ROOT = Path(__file__).parent
DATA = ROOT / "data"
CSV  = ROOT / "csv"


def read_csv(filename):
    """Lit un CSV UTF-8 (avec ou sans BOM) et retourne les lignes sans l'en-tête.
    Les lignes dont la première cellule commence par ## sont des lignes de description
    et sont ignorées (elles servent uniquement de guide dans le tableur)."""
    path = CSV / filename
    if not path.exists():
        print(f"  AVERTISSEMENT : csv/{filename} introuvable")
        return []
    with open(path, newline="", encoding="utf-8-sig") as f:
        rows = list(csv.reader(f))
    return [r for r in rows[1:] if not (r and str(r[0]).startswith("##"))]


def sv(val, default=""):
    if val is None: return default
    v = str(val).strip()
    return v if v else default


def bv(val):
    if isinstance(val, bool): return val
    v = str(val).strip().upper()
    return v in ("OUI", "TRUE", "1", "YES", "VRAI")


def iv(val, default=0):
    try:    return int(val)
    except: return default


def pad(row, n):
    r = list(row)
    while len(r) < n: r.append("")
    return r


HEADER_SITE = """\
// =====================================================
// FICHIER GLOBAL DU SITE
// Généré automatiquement par sync.py le {date}
// Modifier via csv/config.csv et csv/navigation.csv
// ou directement dans ce fichier.
// Ne pas renommer window.BDE_SITE.
// =====================================================
"""

HEADER_EVENTS = """\
// =====================================================
// ÉVÉNEMENTS
// Généré automatiquement par sync.py le {date}
// Modifier via csv/events.csv, csv/event_descriptions.csv,
// csv/event_meta.csv, csv/event_tags.csv, csv/event_artists.csv
// ou directement dans ce fichier.
// Ne pas renommer window.BDE_EVENTS.
// =====================================================
"""

HEADER_SPONSORS = """\
// =====================================================
// SPONSORS / PARTENAIRES
// Généré automatiquement par sync.py le {date}
// Modifier via csv/sponsors.csv ou directement dans ce fichier.
// Ne pas renommer window.BDE_SPONSORS.
// =====================================================
"""

HEADER_ARTISTS = """\
// =====================================================
// ARTISTES / SHOWCASES
// Généré automatiquement par sync.py le {date}
// Modifier via csv/artists_cartes.csv et csv/artists_bande.csv
// ou directement dans ce fichier.
// Ne pas renommer window.BDE_ARTISTS.
// =====================================================
"""

HEADER_GALLERIES = """\
// =====================================================
// GALERIES ET ALBUMS GOOGLE PHOTOS
// Généré automatiquement par sync.py le {date}
// Modifier via csv/galleries.csv et csv/gallery_images.csv
// ou directement dans ce fichier.
// Ne pas renommer window.BDE_GALLERIES.
// =====================================================
"""


def write_js(filename, var_name, data, header_tpl):
    path = DATA / filename
    date_str = datetime.now().strftime("%d/%m/%Y %H:%M")
    header = header_tpl.format(date=date_str)
    json_str = json.dumps(data, ensure_ascii=False, indent=2)
    path.write_text(f"{header}\nwindow.{var_name} = {json_str};\n", encoding="utf-8")
    n = len(data) if isinstance(data, list) else len(data.get("cards", []))
    print(f"  OK  {filename}  ({n} éléments)")


def build_site():
    cfg = {}
    for row in read_csv("config.csv"):
        row = pad(row, 2)
        if sv(row[0]):
            cfg[sv(row[0])] = sv(row[1])

    nav = []
    for row in sorted(read_csv("navigation.csv"), key=lambda r: iv(pad(r,1)[0])):
        row = pad(row, 5)
        if not sv(row[1]) and not sv(row[3]): continue
        item = {"label": sv(row[1]), "labelEn": sv(row[2]), "href": sv(row[3])}
        if sv(row[4]): item["externalFromNonHome"] = sv(row[4])
        nav.append(item)

    def g(k): return cfg.get(k, "")

    site = {
        "siteName": g("siteName"), "university": g("university"),
        "year": g("year"), "seasonLabel": g("seasonLabel"),
        "email": g("email"), "phone": g("phone"), "phoneHref": g("phoneHref"),
        "address": g("address"), "logo": g("logo"),
        "footerDescription": g("footerDescription"),
        "footerDescriptionEn": g("footerDescriptionEn"),
        "instagramUrl": g("instagramUrl"), "instagramLabel": g("instagramLabel"),
        "nuitsInstagramUrl": g("nuitsInstagramUrl"), "nuitsInstagramLabel": g("nuitsInstagramLabel"),
        "tiktokUrl": g("tiktokUrl"), "facebookUrl": g("facebookUrl"),
        "defaultTicketUrl": g("defaultTicketUrl"),
        "defaultGooglePhotosUrl": g("defaultGooglePhotosUrl"),
        "copyrightText": g("copyrightText"),
        "ticket": {
            "eventName": g("ticket_eventName"), "eventSub": g("ticket_eventSub"),
            "eventSubEn": g("ticket_eventSubEn"), "url": g("ticket_url"),
            "buttonLabel": g("ticket_buttonLabel"), "buttonLabelEn": g("ticket_buttonLabelEn"),
            "description": g("ticket_description"), "descriptionEn": g("ticket_descriptionEn"),
            "note": g("ticket_note"), "noteEn": g("ticket_noteEn"),
        },
        "affiche": {
            "active": bv(g("affiche_active")),
            "daysBefore": iv(g("affiche_joursAvant"), 14),
            "frequency": g("affiche_frequence") or "session",
            "pages": g("affiche_pages") or "toutes",
            "delayMs": iv(g("affiche_delaiMs"), 700),
        },
        "navigation": nav,
    }
    write_js("site.js", "BDE_SITE", site, HEADER_SITE)


def build_events():
    def index(rows, slug_col=0, order_col=1):
        idx = {}
        for r in rows:
            r = pad(r, max(slug_col, order_col) + 2)
            slug = sv(r[slug_col])
            if slug: idx.setdefault(slug, []).append(r)
        for k in idx: idx[k].sort(key=lambda r: iv(pad(r, order_col+1)[order_col]))
        return idx

    descs   = index(read_csv("event_descriptions.csv"))
    metas   = index(read_csv("event_meta.csv"))
    tags_ix = index(read_csv("event_tags.csv"))
    arts    = index(read_csv("event_artists.csv"))

    events = []
    for row in read_csv("events.csv"):
        row = pad(row, 50)
        slug = sv(row[0])
        if not slug: continue

        main = sv(row[19])
        supp_raw = sv(row[20])
        supp = [x.strip() for x in supp_raw.split(";") if x.strip()]
        images = [main] if main else []
        for img in supp:
            if img not in images: images.append(img)

        desc_blocks = []
        for dr in descs.get(slug, []):
            dr = pad(dr, 4)
            fr, en = sv(dr[2]), sv(dr[3])
            if fr or en:
                desc_blocks.append({"text": fr, "i18n": {"fr": fr, "en": en}})

        meta_out = []
        for mr in metas.get(slug, []):
            mr = pad(mr, 6)
            cle_fr, cle_en = sv(mr[2]), sv(mr[3])
            val_fr, val_en = sv(mr[4]), sv(mr[5])
            if cle_fr:
                meta_out.append({"key": cle_fr, "value": val_fr,
                                  "keyI18n": {"fr": cle_fr, "en": cle_en},
                                  "valueI18n": {"fr": val_fr, "en": val_en} if val_en else {}})

        tags_out = []
        for tr in tags_ix.get(slug, []):
            tr = pad(tr, 6)
            label, rouge = sv(tr[2]), bv(tr[3])
            lbl_fr, lbl_en = sv(tr[4]) or label, sv(tr[5])
            if label:
                tag = {"label": label, "red": rouge}
                if lbl_fr or lbl_en: tag["i18n"] = {"fr": lbl_fr, "en": lbl_en}
                tags_out.append(tag)

        artists_out = []
        for ar in arts.get(slug, []):
            ar = pad(ar, 4)
            if sv(ar[2]): artists_out.append({"label": sv(ar[2]), "highlight": bv(ar[3])})

        hp_fr, hp_en = sv(row[17]), sv(row[18])
        events.append({
            "slug": slug, "order": iv(row[1], 1), "number": sv(row[2]),
            "title": sv(row[3]), "subtitle": sv(row[4]), "category": sv(row[5]),
            "date": sv(row[6]),
            "dateLabel":   {"fr": sv(row[7]),  "en": sv(row[8])},
            "statusLabel": {"fr": sv(row[9]),  "en": sv(row[10])},
            "statusColor": sv(row[11]),
            "place": sv(row[12]), "venue": sv(row[13]),
            "shortDescription": sv(row[14]),
            "homeDescriptionI18n": {"fr": sv(row[15]), "en": sv(row[16])},
            "homePeriod": hp_fr, "homePeriodI18n": {"fr": hp_fr, "en": hp_en},
            "longDescription": [b["text"] for b in desc_blocks],
            "descriptionBlocks": desc_blocks,
            "image": main, "images": images, "alt": sv(row[21]),
            "ticketUrl": sv(row[22]), "ticketLabel": sv(row[23]),
            "dossierUrl": sv(row[24]),
            "dossierLabel": {"fr": sv(row[25]), "en": sv(row[26])},
            "dossierDownload": bv(row[27]),
            "googlePhotosUrl": sv(row[28]), "galleryPage": sv(row[29]), "galleryLabel": sv(row[30]),
            "showOnHome": bv(row[31]), "showOnEventsPage": bv(row[32]), "showOnNuitsPage": bv(row[33]),
            "featured": bv(row[34]), "status": sv(row[35]),
            "tags": tags_out, "meta": meta_out, "artists": artists_out,
            "reverse": bv(row[36]),
            "affiche": {
                "mode": (sv(row[37]) or "AUTO").upper(),
                "image": sv(row[38]),
                "alt": sv(row[39]),
                "ratio": sv(row[40]),
                "responsive": bv(row[41]),
                "daysBefore": iv(row[42], 0),
                "title":    {"fr": sv(row[43]), "en": sv(row[44])},
                "text":     {"fr": sv(row[45]), "en": sv(row[46])},
                "ctaLabel": {"fr": sv(row[47]), "en": sv(row[48])},
                "ctaUrl": sv(row[49]),
            },
        })

    events.sort(key=lambda e: e["order"])
    write_js("events.js", "BDE_EVENTS", events, HEADER_EVENTS)


def build_sponsors():
    sponsors = []
    for row in read_csv("sponsors.csv"):
        row = pad(row, 11)
        if not sv(row[0]): continue
        sponsors.append({
            "name": sv(row[0]), "logo": sv(row[1]), "fallback": sv(row[2]),
            "alt": sv(row[3]), "url": sv(row[4]), "category": sv(row[5]),
            "type": sv(row[6]), "typeEn": sv(row[7]), "linkLabel": sv(row[8]),
            "active": bv(row[9]), "order": iv(row[10], 1),
        })
    sponsors.sort(key=lambda x: x["order"])
    write_js("sponsors.js", "BDE_SPONSORS", sponsors, HEADER_SPONSORS)


def build_artists():
    cards = []
    for row in read_csv("artists_cartes.csv"):
        row = pad(row, 9)
        if not sv(row[0]): continue
        cards.append({
            "name": sv(row[0]), "image": sv(row[1]), "alt": sv(row[2]),
            "yearEvent": sv(row[3]), "eventText": sv(row[4]), "badge": sv(row[5]),
            "featured": bv(row[6]), "active": bv(row[7]), "order": iv(row[8], 1),
        })
    cards.sort(key=lambda c: c["order"])

    strip = []
    for row in sorted(read_csv("artists_bande.csv"), key=lambda r: iv(pad(r,2)[0])):
        row = pad(row, 2)
        name = sv(row[1]) or sv(row[0])
        if name: strip.append(name)

    write_js("artists.js", "BDE_ARTISTS", {"cards": cards, "textStrip": strip}, HEADER_ARTISTS)


def build_galleries():
    imgs_by_slug = {}
    for row in read_csv("gallery_images.csv"):
        row = pad(row, 8)
        slug = sv(row[0])
        if slug: imgs_by_slug.setdefault(slug, []).append(row)
    for k in imgs_by_slug:
        imgs_by_slug[k].sort(key=lambda r: iv(pad(r,2)[1]))

    galleries = []
    for row in read_csv("galleries.csv"):
        row = pad(row, 9)
        slug = sv(row[0])
        if not slug: continue
        images = []
        for ir in imgs_by_slug.get(slug, []):
            ir = pad(ir, 8)
            src, alt = sv(ir[2]), sv(ir[3])
            cap_fr, cap_en = sv(ir[4]), sv(ir[5])
            tag_fr, tag_en = sv(ir[6]), sv(ir[7])
            if not src: continue
            images.append({
                "src": src, "alt": alt, "caption": cap_fr,
                "captionI18n": {"fr": cap_fr, "en": cap_en} if cap_en else {},
                "tag": tag_fr,
                "tagI18n": {"fr": tag_fr, "en": tag_en} if tag_en else {},
            })
        galleries.append({
            "slug": slug, "title": sv(row[1]), "page": sv(row[2]),
            "eventSlug": sv(row[3]), "coverImage": sv(row[4]),
            "googlePhotosUrl": sv(row[5]), "lightboxMode": sv(row[6]),
            "active": bv(row[7]), "order": iv(row[8], 1), "images": images,
        })
    galleries.sort(key=lambda g: g["order"])
    write_js("galleries.js", "BDE_GALLERIES", galleries, HEADER_GALLERIES)


def main():
    if not CSV.exists():
        print(f"\n  ERREUR : dossier csv/ introuvable.\n  Lance d'abord init_excel.bat\n")
        sys.exit(1)
    print()
    print("  Génération des fichiers data/*.js depuis les CSV...")
    build_site()
    build_events()
    build_sponsors()
    build_artists()
    build_galleries()
    print()
    print(f"  Terminé ! 5 fichiers data/*.js mis à jour.")
    print(f"  {datetime.now().strftime('%d/%m/%Y  %H:%M:%S')}")
    print()


if __name__ == "__main__":
    main()
