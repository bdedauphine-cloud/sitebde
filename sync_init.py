#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
sync_init.py — Génère les fichiers CSV depuis les fichiers data/*.js
Usage   : python sync_init.py
Résultat: crée ou écrase les fichiers dans le dossier csv/

Les CSV s'ouvrent directement dans Excel ou Google Sheets.
Encodage UTF-8 avec BOM pour que Excel affiche correctement les accents.
"""

import json, re, csv, os
from pathlib import Path

ROOT = Path(__file__).parent
DATA = ROOT / "data"
CSV  = ROOT / "csv"
CSV.mkdir(exist_ok=True)


def load_js(filename):
    content = (DATA / filename).read_text(encoding="utf-8")
    lines = [l for l in content.split("\n") if not l.strip().startswith("//")]
    content = "\n".join(lines)
    match = re.search(r'window\.\w+\s*=\s*([\s\S]+?)\s*;?\s*$', content.strip())
    if not match:
        raise ValueError(f"Impossible de parser {filename}")
    return json.loads(match.group(1))


def write_csv(filename, rows):
    """Écrit un CSV UTF-8 avec BOM (lisible par Excel sans configuration)."""
    path = CSV / filename
    with open(path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f)
        writer.writerows(rows)
    print(f"  OK  csv/{filename}  ({len(rows)-1} lignes)")


def b(val):
    if val is True:  return "OUI"
    if val is False: return "NON"
    return val if val is not None else ""

def s(val):
    return val if val is not None else ""


def main():
    print()
    print("  Lecture des fichiers data/*.js...")

    site      = load_js("site.js")
    events    = load_js("events.js")
    sponsors  = load_js("sponsors.js")
    artists   = load_js("artists.js")
    galleries = load_js("galleries.js")

    print("  Génération des fichiers CSV...")

    # ── config.csv ───────────────────────────────────────────────
    ticket  = site.get("ticket")  or {}
    affiche = site.get("affiche") or {}
    rows = [["CHAMP", "VALEUR", "DESCRIPTION (impact sur le site)"]]
    rows += [
        ["## Nom du champ (ne pas modifier)", "Valeur à modifier", "Explication de l'impact sur le site"],
        ["siteName",              s(site.get("siteName")),               "Affiché dans l'onglet du navigateur et le titre de chaque page"],
        ["university",            s(site.get("university")),             "Nom de l'université affiché dans le footer"],
        ["year",                  s(site.get("year")),                   "Année affichée dans le footer et le copyright"],
        ["seasonLabel",           s(site.get("seasonLabel")),            "Libellé de saison affiché dans le footer (ex: Saison 2025-2026)"],
        ["email",                 s(site.get("email")),                  "Email de contact affiché sur la page Contact"],
        ["phone",                 s(site.get("phone")),                  "Téléphone affiché sur la page Contact"],
        ["phoneHref",             s(site.get("phoneHref")),              "Téléphone sans espaces pour les liens cliquables (tel:+33...)"],
        ["address",               s(site.get("address")),                "Adresse affichée sur la page Contact"],
        ["logo",                  s(site.get("logo")),                   "Chemin du logo affiché dans le header et le footer"],
        ["footerDescription",     s(site.get("footerDescription")),      "Texte de présentation affiché dans le footer en français"],
        ["footerDescriptionEn",   s(site.get("footerDescriptionEn")),    "Texte de présentation affiché dans le footer en anglais"],
        ["instagramUrl",          s(site.get("instagramUrl")),           "Lien Instagram BDE — bouton dans le footer et page Contact"],
        ["instagramLabel",        s(site.get("instagramLabel")),         "Texte affiché pour le lien Instagram BDE"],
        ["nuitsInstagramUrl",     s(site.get("nuitsInstagramUrl")),      "Lien Instagram Nuits Dauphine — affiché sur la page Notre Label"],
        ["nuitsInstagramLabel",   s(site.get("nuitsInstagramLabel")),    "Texte affiché pour le lien Instagram Nuits"],
        ["tiktokUrl",             s(site.get("tiktokUrl")),              "Lien TikTok — bouton dans le footer et page Contact"],
        ["facebookUrl",           s(site.get("facebookUrl")),            "Lien Facebook — bouton dans le footer et page Contact"],
        ["defaultTicketUrl",      s(site.get("defaultTicketUrl")),       "Lien billetterie générique utilisé si un événement n'a pas son propre lien"],
        ["defaultGooglePhotosUrl",s(site.get("defaultGooglePhotosUrl")), "Lien Google Photos générique utilisé si une galerie n'a pas son propre album"],
        ["copyrightText",         s(site.get("copyrightText")),          "Texte copyright affiché en bas du footer"],
        ["ticket_eventName",      s(ticket.get("eventName")),            "Nom de l'événement affiché dans le modal billetterie (popup bouton Billets)"],
        ["ticket_eventSub",       s(ticket.get("eventSub")),             "Sous-titre du modal billetterie en français"],
        ["ticket_eventSubEn",     s(ticket.get("eventSubEn")),           "Sous-titre du modal billetterie en anglais"],
        ["ticket_url",            s(ticket.get("url")),                  "URL Shotgun ou autre billetterie — lien du bouton principal du modal"],
        ["ticket_buttonLabel",    s(ticket.get("buttonLabel")),          "Texte du bouton billetterie en français (ex: Prendre ma place)"],
        ["ticket_buttonLabelEn",  s(ticket.get("buttonLabelEn")),        "Texte du bouton billetterie en anglais"],
        ["ticket_description",    s(ticket.get("description")),          "Description affichée dans le modal billetterie en français"],
        ["ticket_descriptionEn",  s(ticket.get("descriptionEn")),        "Description affichée dans le modal billetterie en anglais"],
        ["ticket_note",           s(ticket.get("note")),                 "Note informative dans le modal billetterie en français (ex: tarif réduit)"],
        ["ticket_noteEn",         s(ticket.get("noteEn")),               "Note informative dans le modal billetterie en anglais"],
        ["affiche_active",        b(affiche.get("active")),              "OUI = l'affiche de l'événement à venir peut s'afficher / NON = fonctionnalité désactivée partout"],
        ["affiche_joursAvant",    s(affiche.get("daysBefore")),          "Nombre de jours avant l'événement où l'affiche commence à s'afficher (défaut : 14)"],
        ["affiche_frequence",     s(affiche.get("frequency")),           "session = une fois par visite / evenement = une fois par événement / toujours = à chaque page"],
        ["affiche_pages",         s(affiche.get("pages")),               "toutes = sur toutes les pages / home = uniquement sur la page d'accueil"],
        ["affiche_delaiMs",       s(affiche.get("delayMs")),             "Délai en millisecondes avant l'apparition de l'affiche (défaut : 700)"],
    ]
    write_csv("config.csv", rows)

    # ── navigation.csv ───────────────────────────────────────────
    rows = [["ORDRE", "LABEL FR", "LABEL EN", "HREF", "LIEN HORS HOME"]]
    rows.append(["## Position (1=premier lien du menu)", "Texte du lien affiché en français", "Texte du lien affiché en anglais", "URL de destination (fichier HTML ou lien externe)", "Si renseigné : ce lien s'ouvre dans un nouvel onglet quand on n'est pas sur la homepage"])
    for i, nav in enumerate(site.get("navigation") or [], 1):
        rows.append([i, s(nav.get("label")), s(nav.get("labelEn")),
                     s(nav.get("href")), s(nav.get("externalFromNonHome"))])
    write_csv("navigation.csv", rows)

    # ── events.csv ───────────────────────────────────────────────
    rows = [[
        "SLUG", "ORDRE", "NUMÉRO", "TITRE", "SOUS-TITRE", "CATÉGORIE",
        "DATE (AAAA-MM-JJ)", "DATE FR", "DATE EN",
        "STATUT FR", "STATUT EN", "COULEUR STATUT",
        "LIEU", "SALLE", "DESCRIPTION COURTE",
        "HOME DESC FR", "HOME DESC EN", "HOME PÉRIODE FR", "HOME PÉRIODE EN",
        "IMAGE PRINCIPALE", "IMAGES SUPPLÉMENTAIRES (séparer par ;)", "ALT IMAGE",
        "TICKET URL", "TICKET LABEL",
        "DOSSIER URL", "DOSSIER LABEL FR", "DOSSIER LABEL EN", "DOSSIER DOWNLOAD (OUI/NON)",
        "GOOGLE PHOTOS URL", "PAGE GALERIE", "GALERIE LABEL",
        "SUR HOME (OUI/NON)", "SUR ÉVÉNEMENTS (OUI/NON)", "SUR PAGE NUITS (OUI/NON)",
        "FEATURED (OUI/NON)", "STATUS", "REVERSE (OUI/NON)",
        "AFFICHE (OUI/NON/AUTO)", "AFFICHE IMAGE", "AFFICHE ALT", "AFFICHE RATIO",
        "AFFICHE IMAGES RESPONSIVES (OUI/NON)", "AFFICHE JOURS AVANT",
        "AFFICHE TITRE FR", "AFFICHE TITRE EN", "AFFICHE TEXTE FR", "AFFICHE TEXTE EN",
        "AFFICHE CTA LABEL FR", "AFFICHE CTA LABEL EN", "AFFICHE CTA URL",
    ]]
    rows.append([
        "## Identifiant unique interne (ne jamais modifier)",
        "Ordre d'affichage dans les listes",
        "Numéro affiché visuellement sur la carte (ex: 01)",
        "Titre de l'événement — affiché sur la homepage, page événements et page dédiée",
        "Sous-titre affiché sur la page de l'événement",
        "Catégorie interne (non affichée sur le site)",
        "Date technique ISO pour le tri (ex: 2026-02-12)",
        "Date affichée sur la homepage en français (ex: 12 février 2026)",
        "Date affichée sur la homepage en anglais",
        "Statut affiché à la place de la date en français (ex: En vente, Passé, À venir)",
        "Statut affiché en anglais",
        "Couleur du statut : 'red' pour rouge — laissez vide sinon",
        "Lieu général affiché dans les infos pratiques (ville, espace)",
        "Salle précise affichée dans les infos pratiques",
        "Texte court affiché sous le titre sur la page événements",
        "Texte de description affiché sur la carte homepage en français",
        "Texte de description affiché sur la carte homepage en anglais",
        "Période affichée sur la carte homepage en français (ex: Annuel, Mensuel)",
        "Période affichée sur la carte homepage en anglais",
        "Photo principale — affichée sur la homepage et en haut de la page événement",
        "Photos supplémentaires pour le carrousel de la page événement — séparées par ;",
        "Texte alternatif de l'image (pour l'accessibilité et le SEO)",
        "Lien billetterie spécifique à cet événement (Shotgun, etc.)",
        "Texte affiché sur le bouton billetterie",
        "Lien vers le dossier de présentation de l'événement",
        "Texte du bouton dossier en français",
        "Texte du bouton dossier en anglais",
        "OUI = téléchargement direct du dossier / NON = ouverture dans l'onglet",
        "Lien vers l'album Google Photos complet de cet événement",
        "Nom du fichier HTML de la galerie associée (ex: galerie-begins.html)",
        "Nom affiché pour le bouton vers la galerie",
        "OUI = carte visible sur la homepage",
        "OUI = visible sur la page Événements",
        "OUI = visible sur la page Notre Label (Nuits Dauphine)",
        "OUI = mis en avant visuellement sur la page événements (grande carte)",
        "Statut technique interne",
        "OUI = inverser l'ordre texte/image sur la carte homepage",
        "AUTO = l'affiche apparaît seule avant l'événement / OUI = forcer maintenant / NON = jamais",
        "Chemin de l'affiche de l'événement (ex: uploads/affiche-croisette.jpg) — vide = pas d'affiche",
        "Texte alternatif de l'affiche (accessibilité et SEO)",
        "Dimensions réelles de l'affiche en pixels, largeur/hauteur (ex: 1179/1462) — donné par make_affiche.py ; obligatoire si IMAGES RESPONSIVES = OUI",
        "OUI = les versions AVIF/WebP existent (make_affiche.py) — exige un RATIO en pixels / NON = image simple",
        "Nombre de jours avant l'événement où l'affiche apparaît — vide = valeur globale de config.csv",
        "Titre affiché sur l'affiche en français — vide = titre de l'événement",
        "Titre affiché sur l'affiche en anglais — vide = titre de l'événement",
        "Ligne d'information sous le titre en français — vide = date et salle de l'événement",
        "Ligne d'information sous le titre en anglais — vide = date et salle de l'événement",
        "Texte du bouton billetterie en français — vide = Réserver sur Shotgun",
        "Texte du bouton billetterie en anglais — vide = Book on Shotgun",
        "Lien billetterie de l'affiche — vide = TICKET URL de l'événement, puis lien global",
    ])
    for ev in events:
        dl   = ev.get("dateLabel")          or {}
        sl   = ev.get("statusLabel")        or {}
        hd   = ev.get("homeDescriptionI18n") or {}
        hp   = ev.get("homePeriodI18n")     or {}
        dlab = ev.get("dossierLabel")       or {}
        imgs = ev.get("images")             or []
        aff  = ev.get("affiche")            or {}
        atit = aff.get("title")             or {}
        atxt = aff.get("text")              or {}
        acta = aff.get("ctaLabel")          or {}
        main = s(ev.get("image"))
        supp = " ; ".join(img for img in imgs if img != main)
        rows.append([
            s(ev.get("slug")), ev.get("order",""), s(ev.get("number")),
            s(ev.get("title")), s(ev.get("subtitle")), s(ev.get("category")),
            s(ev.get("date")), s(dl.get("fr")), s(dl.get("en")),
            s(sl.get("fr")), s(sl.get("en")), s(ev.get("statusColor")),
            s(ev.get("place")), s(ev.get("venue")), s(ev.get("shortDescription")),
            s(hd.get("fr")), s(hd.get("en")),
            s(hp.get("fr")), s(hp.get("en")),
            main, supp, s(ev.get("alt")),
            s(ev.get("ticketUrl")), s(ev.get("ticketLabel")),
            s(ev.get("dossierUrl")), s(dlab.get("fr")), s(dlab.get("en")),
            b(ev.get("dossierDownload")),
            s(ev.get("googlePhotosUrl")), s(ev.get("galleryPage")), s(ev.get("galleryLabel")),
            b(ev.get("showOnHome")), b(ev.get("showOnEventsPage")), b(ev.get("showOnNuitsPage")),
            b(ev.get("featured")), s(ev.get("status")), b(ev.get("reverse")),
            s(aff.get("mode")), s(aff.get("image")), s(aff.get("alt")), s(aff.get("ratio")),
            b(aff.get("responsive")), (aff.get("daysBefore") or ""),
            s(atit.get("fr")), s(atit.get("en")), s(atxt.get("fr")), s(atxt.get("en")),
            s(acta.get("fr")), s(acta.get("en")), s(aff.get("ctaUrl")),
        ])
    write_csv("events.csv", rows)

    # ── event_descriptions.csv ───────────────────────────────────
    rows = [["SLUG ÉVÉNEMENT", "ORDRE", "TEXTE FR", "TEXTE EN"]]
    rows.append(["## Slug de l'événement concerné (doit correspondre à la colonne SLUG d'events.csv)", "Ordre d'affichage du paragraphe (1, 2, 3...)", "Paragraphe de description long affiché en français sur la page de l'événement", "Traduction en anglais du même paragraphe"])
    for ev in events:
        for k, block in enumerate(ev.get("descriptionBlocks") or [], 1):
            i18n = block.get("i18n") or {}
            rows.append([s(ev.get("slug")), k,
                         s(i18n.get("fr") or block.get("text")), s(i18n.get("en"))])
    write_csv("event_descriptions.csv", rows)

    # ── event_meta.csv ───────────────────────────────────────────
    rows = [["SLUG ÉVÉNEMENT", "ORDRE", "CLÉ FR", "CLÉ EN", "VALEUR FR", "VALEUR EN"]]
    rows.append(["## Slug de l'événement concerné", "Ordre d'affichage de la ligne dans le tableau d'infos", "Label affiché en français dans les infos pratiques (ex: Format, Durée, Prix, Lieu)", "Label affiché en anglais", "Valeur affichée en français (ex: Soirée, 6h, 15€, Paris)", "Valeur affichée en anglais"])
    for ev in events:
        for k, meta in enumerate(ev.get("meta") or [], 1):
            ki = meta.get("keyI18n")   or {}
            vi = meta.get("valueI18n") or {}
            rows.append([s(ev.get("slug")), k,
                         s(ki.get("fr") or meta.get("key")), s(ki.get("en") or meta.get("key")),
                         s(vi.get("fr") or meta.get("value")), s(vi.get("en") or meta.get("value"))])
    write_csv("event_meta.csv", rows)

    # ── event_tags.csv ───────────────────────────────────────────
    rows = [["SLUG ÉVÉNEMENT", "ORDRE", "LABEL", "ROUGE (OUI/NON)", "LABEL FR", "LABEL EN"]]
    rows.append(["## Slug de l'événement concerné", "Ordre d'affichage du badge", "Texte du badge (utilisé si pas de traduction)", "OUI = badge affiché en rouge sur la page événement", "Texte du badge en français affiché sur la page de l'événement", "Texte du badge en anglais"])
    for ev in events:
        for k, tag in enumerate(ev.get("tags") or [], 1):
            i18n = tag.get("i18n") or {}
            rows.append([s(ev.get("slug")), k, s(tag.get("label")),
                         b(tag.get("red", False)),
                         s(i18n.get("fr") or tag.get("label")), s(i18n.get("en"))])
    write_csv("event_tags.csv", rows)

    # ── event_artists.csv ────────────────────────────────────────
    rows = [["SLUG ÉVÉNEMENT", "ORDRE", "LABEL", "MIS EN AVANT (OUI/NON)"]]
    rows.append(["## Slug de l'événement concerné", "Ordre dans le line-up affiché sur la page de l'événement", "Nom de l'artiste affiché dans la liste du line-up", "OUI = nom affiché en gras / mis en valeur visuellement dans le line-up"])
    for ev in events:
        for k, art in enumerate(ev.get("artists") or [], 1):
            rows.append([s(ev.get("slug")), k, s(art.get("label")), b(art.get("highlight", False))])
    write_csv("event_artists.csv", rows)

    # ── sponsors.csv ─────────────────────────────────────────────
    rows = [["NOM", "LOGO", "FALLBACK", "ALT", "URL",
             "CATÉGORIE", "TYPE FR", "TYPE EN", "LIEN LABEL", "ACTIF (OUI/NON)", "ORDRE"]]
    rows.append(["## Nom du sponsor affiché sur la page Partenaires et la homepage", "Chemin de l'image du logo (uploads/partners/...)", "Initiales affichées à la place du logo si le fichier est absent", "Texte alternatif de l'image (accessibilité et SEO)", "Lien vers le site du sponsor — s'ouvre au clic sur le logo", "Catégorie interne pour regroupement visuel", "Description du partenariat affichée en français (ex: Partenaire bancaire)", "Description du partenariat affichée en anglais", "Texte du lien affiché sous le logo (ex: Visiter le site)", "OUI = logo affiché / NON = masqué sans être supprimé", "Position dans la liste (plus petit = affiché en premier)"])
    for sp in sponsors:
        rows.append([s(sp.get("name")), s(sp.get("logo")), s(sp.get("fallback")),
                     s(sp.get("alt")), s(sp.get("url")), s(sp.get("category")),
                     s(sp.get("type")), s(sp.get("typeEn")), s(sp.get("linkLabel")),
                     b(sp.get("active")), sp.get("order", "")])
    write_csv("sponsors.csv", rows)

    # ── artists_cartes.csv ───────────────────────────────────────
    rows = [["NOM", "IMAGE", "ALT", "ANNÉE · ÉVÉNEMENT", "TEXTE ÉVÉNEMENT",
             "BADGE", "FEATURED (OUI/NON)", "ACTIF (OUI/NON)", "ORDRE"]]
    rows.append(["## Nom de l'artiste affiché sur la carte du carrousel homepage", "Chemin de la photo de l'artiste (uploads/...)", "Texte alternatif de l'image", "Texte affiché sur la carte sous le nom (ex: 2025 · How We Dau)", "Texte secondaire affiché sur la carte (nom de l'événement)", "Badge affiché sur la carte (ex: Headliner, Live, Exclusif)", "OUI = carte visuellement mise en avant dans le carrousel", "OUI = carte visible dans le carrousel homepage / NON = masquée", "Position dans le carrousel (plus petit = affiché en premier)"])
    for card in artists.get("cards") or []:
        rows.append([s(card.get("name")), s(card.get("image")), s(card.get("alt")),
                     s(card.get("yearEvent")), s(card.get("eventText")), s(card.get("badge")),
                     b(card.get("featured")), b(card.get("active")), card.get("order", "")])
    write_csv("artists_cartes.csv", rows)

    # ── artists_bande.csv ────────────────────────────────────────
    rows = [["ORDRE", "NOM"]]
    rows.append(["## Position dans la bande défilante (1=premier affiché)", "Nom de l'artiste affiché dans la bande de texte animée en homepage"])
    for i, name in enumerate(artists.get("textStrip") or [], 1):
        rows.append([i, s(name)])
    write_csv("artists_bande.csv", rows)

    # ── galleries.csv ────────────────────────────────────────────
    rows = [["SLUG", "TITRE", "PAGE HTML", "SLUG ÉVÉNEMENT LIÉ",
             "IMAGE COUVERTURE", "GOOGLE PHOTOS URL", "MODE LIGHTBOX", "ACTIF (OUI/NON)", "ORDRE"]]
    rows.append(["## Identifiant unique de la galerie (ne jamais modifier)", "Nom de la galerie affiché sur la page et dans le bouton de la page événement", "Nom du fichier HTML de la galerie (ex: galerie-begins.html)", "Slug de l'événement lié — affiche un bouton vers la galerie sur la page événement", "Photo de couverture affichée sur la page événement et dans la bande photos de la homepage", "Lien vers l'album complet Google Photos", "overlay = photos s'ouvrent en plein écran sur le site / link = redirige vers Google Photos", "OUI = galerie visible + photo de couverture dans la bande homepage / NON = masquée", "Ordre d'affichage"])
    for gal in galleries:
        rows.append([s(gal.get("slug")), s(gal.get("title")), s(gal.get("page")),
                     s(gal.get("eventSlug")), s(gal.get("coverImage")),
                     s(gal.get("googlePhotosUrl")), s(gal.get("lightboxMode")),
                     b(gal.get("active")), gal.get("order", "")])
    write_csv("galleries.csv", rows)

    # ── gallery_images.csv ───────────────────────────────────────
    rows = [["SLUG GALERIE", "ORDRE", "SRC", "ALT",
             "LÉGENDE FR", "LÉGENDE EN", "TAG FR", "TAG EN"]]
    rows.append(["## Identifiant de la galerie concernée (doit correspondre à la colonne SLUG de galleries.csv)", "Ordre d'affichage dans la galerie (1=première photo)", "Chemin de la photo depuis la racine du site (ex: uploads/photo.jpg)", "Texte alternatif pour l'accessibilité et le SEO", "Légende affichée sous la photo en français (visible en mode lightbox)", "Légende affichée sous la photo en anglais", "Badge/tag affiché sur la miniature en français (ex: Gala · 2026)", "Badge/tag affiché sur la miniature en anglais"])
    for gal in galleries:
        for k, img in enumerate(gal.get("images") or [], 1):
            ci = img.get("captionI18n") or {}
            ti = img.get("tagI18n")     or {}
            rows.append([s(gal.get("slug")), k, s(img.get("src")), s(img.get("alt")),
                         s(ci.get("fr") or img.get("caption")), s(ci.get("en")),
                         s(ti.get("fr") or img.get("tag")), s(ti.get("en"))])
    write_csv("gallery_images.csv", rows)

    print()
    print("  Terminé ! 12 fichiers CSV générés dans csv/")
    print()


if __name__ == "__main__":
    main()
