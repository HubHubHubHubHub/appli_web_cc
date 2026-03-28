# -*- coding: utf-8 -*-
"""
build_entries_from_phrases
==========================

Lit automatiquement `phrases_a_traiter.json` (même dossier que ce script),
puis génère :
- un **rapport HTML** (sans JSON embarqué) qui affiche, dans l'ordre d'apparition,
  la phrase, le span source et la table goroh des **lemmes nouveaux** ;
- un **out.json** ordonné, au format **{ "lemma": {entry}, ... }**, prêt à consommer.

Règles :
- On **ignore** tout (pos, lemma) dont le champ `nooj` dans `data.json` a du contenu
  (line, status ou flx non-null = entrée relue par un humain).
- Si une entrée existe SANS nooj validé, le paradigme (cas/conj/inf) est régénéré
  depuis goroh, mais les données annexes (phrases, meta, traduction...) sont **préservées**.
- **Dédup stricte** par exécution : un (pos, lemma) n'est traité qu'une fois.

Entrées JSON (format V2) :
- **adj**  : {"meta", "cas", "nooj", "phrases"}
- **noun** : {"meta", "cas", "nooj", "phrases"}
- **verb** : {"meta", "inf", "conj", "nooj", "phrases"}
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from typing import Dict, Any, Optional, Tuple, Iterable, List

from bs4 import BeautifulSoup

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "goroh"))

from ukr_morph_parser import (
    fetch_html,
    extract_article_blocks,
    parse_table_adj,
    parse_table_nom,
    parse_verb_imperfective_table,
    parse_verb_perfective_table,
)
from nooj_lookup import (
    load_nooj_dict,
    lookup_nooj_line,
    load_aspect_pairs,
    lookup_aspect_pair,
)

UKR_POS_TAG = {
    "adj": "прикметник",
    "noun": "іменник",
    "verb": "дієслово",
}

ASPECT_UKR = {
    "perf": "доконаний вид",
    "impf": "недоконаний вид",
}

# Tags → genre court
GENDER_TAG_MAP = {
    "чоловічий рід": "m",
    "жіночий рід": "f",
    "середній рід": "n",
}

# Clés paradigmatiques (remplacées par goroh, tout le reste est préservé)
PARADIGM_KEYS = {"cas", "conj", "inf", "base", "comp", "super"}

# --------------------------
# I/O utils
# --------------------------

def load_json(path: str) -> Any:
    if not os.path.exists(path):
        return {}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def save_json(path: str, obj: Any) -> None:
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)

# --------------------------
# parsing helpers
# --------------------------

def parse_data_info(data_info: str) -> Tuple[str, str]:
    """Parse un data-info V2 et retourne (lemma, pos)."""
    parts = (data_info or "").split(";")
    if len(parts) < 2:
        return "", ""
    lemma = parts[0].strip()
    # V2 format: pos=noun
    for p in parts[1:]:
        if p.startswith("pos="):
            return lemma, p[4:]
    # V1 fallback
    return lemma, parts[1].strip()

def is_target_pos(pos: str) -> bool:
    return pos in {"adj", "noun", "verb", "num", "pron", "adv", "prep", "conj", "part", "intj", "pred", "insert"}

def pick_article_block_for_pos(articles: Iterable[Dict[str, Any]], pos: str) -> Optional[Dict[str, Any]]:
    want_tag = UKR_POS_TAG.get(pos)
    if not want_tag:
        return None
    chosen = None
    for block in articles:
        tags = block.get("tags", [])
        if any(t == want_tag for t in tags):
            chosen = block
            break
    if chosen is None:
        for block in articles:
            if block.get("table"):
                chosen = block
                break
    return chosen

def detect_aspect_from_tags(tags: Iterable[str]) -> Optional[str]:
    s = set(tags or [])
    if ASPECT_UKR["perf"] in s:
        return "perf"
    if ASPECT_UKR["impf"] in s:
        return "impf"
    if "двовидове" in s or "двовидовий" in s:
        return "biaspect"
    return None

def detect_gender_from_tags(tags: Iterable[str]) -> Optional[str]:
    s = set(tags or [])
    for uk, g in GENDER_TAG_MAP.items():
        if uk in s:
            return g
    return None

def make_base_html(pos: str, lemma: str) -> str:
    """Construit le span `base_html` canonique selon le POS (format V2)."""
    if pos == "verb":
        return f'<span class="ukr" data-info="{lemma};pos=verb;verbForm=inf">{lemma}</span>'
    if pos == "noun":
        return f'<span class="ukr" data-info="{lemma};pos=noun;case=nom;number=sg">{lemma}</span>'
    if pos == "adj":
        return f'<span class="ukr" data-info="{lemma};pos=adj;case=nom;gender=m">{lemma}</span>'
    # Invariables et autres
    return f'<span class="ukr" data-info="{lemma};pos={pos}">{lemma}</span>'

def has_reviewed_nooj(entry: Dict[str, Any]) -> bool:
    """True si l'entrée a un nooj avec du contenu (= relue par un humain)."""
    nooj = entry.get("nooj")
    if isinstance(nooj, str):
        return bool(nooj)
    if isinstance(nooj, dict):
        return bool(nooj.get("line") or nooj.get("status") or nooj.get("flx"))
    return False

def merge_with_existing(new_entry: Dict[str, Any], existing_entry: Dict[str, Any]) -> Dict[str, Any]:
    """Fusionne une entrée régénérée avec l'existante : paradigme remplacé, reste préservé."""
    result = dict(new_entry)

    # Meta : fusion (existant préservé, nouveau ajouté)
    existing_meta = existing_entry.get("meta", {})
    new_meta = result.get("meta", {})
    result["meta"] = {**existing_meta, **new_meta}

    # Phrases : union des deux dicts
    existing_phrases = existing_entry.get("phrases", {})
    new_phrases = result.get("phrases", {})
    result["phrases"] = {**existing_phrases, **new_phrases}

    # Tout le reste non-paradigme : conserver l'existant
    for key, value in existing_entry.items():
        if key not in PARADIGM_KEYS and key not in result:
            result[key] = value

    return result

_NOOJ_EMPTY = {"line": None, "status": None, "flx": None}

def build_entry_from_table(
    pos: str,
    lemma: str,
    table_html: str,
    goroh_tags: Iterable[str],
    phrase_text: str,
) -> Dict[str, Any]:
    """
    Construit l'entrée au format V2 :
      - adj  : {"meta", "cas", "nooj", "phrases"}
      - noun : {"meta", "cas", "nooj", "phrases"}
      - verb : {"meta", "inf", "conj", "nooj", "phrases"}
    """
    meta: Dict[str, Any] = {"pos": pos}

    if pos == "adj":
        parsed = parse_table_adj(table_html)
        return {
            "meta": meta,
            "cas": parsed.get("cas", {}),
            "nooj": dict(_NOOJ_EMPTY),
            "phrases": {phrase_text: ""},
        }

    if pos == "noun":
        parsed = parse_table_nom(table_html)
        cas = parsed.get("cas") or parsed.get(lemma, {}).get("cas", {})
        gender = detect_gender_from_tags(goroh_tags)
        if gender:
            meta["gender"] = gender
        return {
            "meta": meta,
            "cas": cas,
            "nooj": dict(_NOOJ_EMPTY),
            "phrases": {phrase_text: ""},
        }

    if pos == "verb":
        aspect = detect_aspect_from_tags(goroh_tags)
        if aspect:
            meta["aspect"] = aspect
        if aspect == "perf":
            parsed = parse_verb_perfective_table(table_html, lemma)
        else:
            parsed = parse_verb_imperfective_table(table_html, lemma)
        return {
            "meta": meta,
            "inf": parsed.get("inf", []),
            "conj": parsed.get("conj", {}),
            "nooj": dict(_NOOJ_EMPTY),
            "phrases": {phrase_text: ""},
        }

    # fallback (invariables, etc.)
    return {
        "meta": meta,
        "nooj": dict(_NOOJ_EMPTY),
        "phrases": {phrase_text: ""},
    }

# --------------------------
# HTML rendering
# --------------------------

MIN_CSS = """
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,'Noto Sans',sans-serif;margin:0;padding:24px;background:#fafafa;color:#222;}
.container{max-width:1100px;margin:0 auto;}
h1{font-size:22px;margin:0 0 16px;}
.summary{background:#fff;padding:12px 16px;border:1px solid #e5e7eb;border-radius:12px;margin-bottom:24px;}
.list{display:grid;grid-template-columns:1fr;gap:16px;}
.card{background:#fff;border:1px solid #e5e7eb;border-radius:16px;box-shadow:0 1px 2px rgba(0,0,0,0.04);padding:16px;}
.card h2{font-size:18px;margin:0 0 8px;}
.meta{font-size:13px;color:#555;margin-bottom:8px;}
.badge{display:inline-block;padding:2px 8px;border-radius:999px;border:1px solid #ddd;background:#f6f6f6;margin-right:6px;font-size:12px;}
.section{margin-top:10px;}
.section h3{font-size:14px;margin:10px 0 6px;color:#333;}
.table-wrap{background:#fff;border:1px dashed #d1d5db;border-radius:10px;padding:10px;overflow:auto;}
.table-wrap table{width:100%;border-collapse:collapse;}
.table-wrap td,.table-wrap th{border:1px solid #e5e7eb;padding:6px;}
.footer-note{margin-top:20px;font-size:12px;color:#666;}
.err{color:#b91c1c;}
.merged{color:#2563eb;font-size:12px;margin-top:4px;}
"""

def html_escape(s: str) -> str:
    return (s.replace("&", "&amp;")
             .replace("<", "&lt;")
             .replace(">", "&gt;"))

def render_entry_card(lemma: str, pos: str, entry: Dict[str, Any], table_html: str, phrase_text: str, merged: bool = False) -> str:
    meta = entry.get("meta", {})
    badges = [f"<span class='badge'>POS: {pos}</span>"]
    if pos == "verb" and meta.get("aspect"):
        badges.append(f"<span class='badge'>Aspect: {meta['aspect']}</span>")
    if pos == "noun" and meta.get("gender"):
        badges.append(f"<span class='badge'>Genre: {meta['gender']}</span>")

    base_html = make_base_html(pos, lemma)
    merged_note = "<div class='merged'>⟳ Fusionné avec entrée existante (données annexes préservées)</div>" if merged else ""

    return f"""
    <div class="card">
      <h2>{html_escape(lemma)}</h2>
      <div class="meta">{''.join(badges)}</div>
      {merged_note}
      <div class="section">
        <h3>Base (span canonique)</h3>
        <div>{base_html}</div>
      </div>
      <div class="section">
        <h3>Phrase</h3>
        <div>{html_escape(phrase_text)}</div>
      </div>
      <div class="section">
        <h3>Table goroh</h3>
        <div class="table-wrap">{table_html}</div>
      </div>
    </div>
    """

def render_report_html(cards_html: str, counts: Dict[str, int], errors: List[str]) -> str:
    n_total = sum(counts.values())
    err_html = ""
    if errors:
        err_list = "".join(f"<li class='err'>{html_escape(e)}</li>" for e in errors)
        err_html = f"""
        <div class="card">
          <h2>Erreurs</h2>
          <ul>{err_list}</ul>
        </div>"""

    return f"""<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Entrées à créer — Rapport</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>{MIN_CSS}</style>
</head>
<body>
  <div class="container">
    <h1>Entrées "type data" à créer</h1>
    <div class="summary">
      <div><strong>Total</strong>: {n_total} &nbsp;|&nbsp;
           <strong>adj</strong>: {counts.get('adj',0)} &nbsp;|&nbsp;
           <strong>noun</strong>: {counts.get('noun',0)} &nbsp;|&nbsp;
           <strong>verb</strong>: {counts.get('verb',0)}</div>
      <div class="footer-note">Les lemmes avec un champ <code>nooj</code> validé sont ignorés.</div>
    </div>

    <div class="list">
      {cards_html if cards_html else '<div class="card"><em>Aucune nouvelle entrée à créer.</em></div>'}
      {err_html}
    </div>
  </div>
</body>
</html>
"""

# --------------------------
# Moteur (ordre + dédup, sortie dict {lemma: entry})
# --------------------------

def process_phrases_ordered(
    phrases_dict: Dict[str, Any],
    data_path: str,
    limit: Optional[int] = None,
):
    """
    Retourne (entries_in_order, cards_in_order, errors) où :
      - entries_in_order : liste ordonnée d'items:
            { "lemma": str, "entry": dict (sans pos), "pos": str, "table_html": str, "phrase": str, "merged": bool }
      - cards_in_order   : liste de fragments HTML (ordre d'apparition)
      - errors           : liste de messages
    """
    data = load_json(data_path)
    for top in ("adj", "noun", "verb"):
        if top not in data or not isinstance(data[top], dict):
            data[top] = {}

    # Charger les dictionnaires NooJ (une seule fois)
    nooj_dir = os.path.join(os.path.dirname(os.path.abspath(data_path)), "..", "perso", "Nooj")
    nooj_dict = {}
    pairs_dict = {}
    nooj_dict_path = os.path.join(nooj_dir, "Ukr_dictionnary_V.1.3.txt")
    pairs_path = os.path.join(nooj_dir, "ukr_verbes_paires_aspectuelles.txt")
    if os.path.exists(nooj_dict_path):
        nooj_dict = load_nooj_dict(nooj_dict_path)
    if os.path.exists(pairs_path):
        pairs_dict = load_aspect_pairs(pairs_path)

    processed = set()  # (pos, lemma)
    entries_in_order: List[Dict[str, Any]] = []
    cards_in_order: List[str] = []
    errors: List[str] = []
    pending_verbs: List[Tuple[str, str]] = []  # (lemma, phrase) pour les couples à ajouter

    remaining = limit

    def _process_lemma(lemma, pos, phrase, existing):
        """Traite un lemme : scrape goroh ou présente l'existant."""
        nonlocal remaining

        # Cas 3 : entry existe avec nooj rempli mais status=null → présenter sans scraping
        if existing and isinstance(existing, dict):
            nooj = existing.get("nooj")
            if isinstance(nooj, dict) and (nooj.get("line") or nooj.get("flx")) and not nooj.get("status"):
                entries_in_order.append({
                    "lemma": lemma, "entry": existing, "pos": pos,
                    "table_html": "<em>Entrée existante — pas de re-scraping goroh</em>",
                    "phrase": phrase, "merged": False, "review_only": True,
                })
                cards_in_order.append(render_entry_card(
                    lemma, pos, existing,
                    "<em>Entrée existante — pas de re-scraping goroh</em>",
                    phrase, merged=False,
                ))
                return True

        # Cas 1 & 2 : scrape goroh
        try:
            html = fetch_html(lemma)
            articles = extract_article_blocks(html)
            block = pick_article_block_for_pos(articles, pos)
            if not block or not block.get("table"):
                raise RuntimeError("Aucun tableau pertinent trouvé sur la page goroh.")
            table_html = block["table"]
            goroh_tags = block.get("tags", [])

            entry = build_entry_from_table(
                pos=pos, lemma=lemma, table_html=table_html,
                goroh_tags=goroh_tags, phrase_text=phrase,
            )

            # Enrichir avec NooJ : ligne dictionnaire + FLX
            nooj_info = lookup_nooj_line(nooj_dict, lemma, pos)
            if nooj_info:
                entry["nooj"] = nooj_info

            # Paire aspectuelle pour les verbes
            if pos == "verb":
                couple = lookup_aspect_pair(pairs_dict, lemma)
                if couple:
                    entry["meta"]["couple"] = couple
                    # Planifier l'ajout du verbe pairé
                    pending_verbs.append((couple, phrase))

            # Fusionner avec l'existant si présent
            merged = False
            if existing and isinstance(existing, dict):
                entry = merge_with_existing(entry, existing)
                merged = True

            entries_in_order.append({
                "lemma": lemma, "entry": entry, "pos": pos,
                "table_html": table_html, "phrase": phrase, "merged": merged,
            })
            cards_in_order.append(render_entry_card(lemma, pos, entry, table_html, phrase, merged=merged))

            if remaining is not None:
                remaining -= 1
            return True

        except Exception as e:
            errors.append(f"{pos}:{lemma} — {e}")
            return False

    # Passe principale : traiter les phrases
    for phrase, meta in phrases_dict.items():
        if remaining is not None and remaining <= 0:
            break

        phrase_html = (meta or {}).get("phrase_html", "")
        if not phrase_html:
            continue

        soup = BeautifulSoup(phrase_html, "html.parser")
        for span in soup.find_all("span", class_="ukr"):
            lemma, pos = parse_data_info(span.get("data-info", ""))
            if not lemma or not is_target_pos(pos):
                continue

            key = (pos, lemma)
            if key in processed:
                continue

            existing = data.get(pos, {}).get(lemma)

            # Ignorer si nooj.status non-null (déjà validé/pending/divergent)
            if existing and isinstance(existing, dict):
                nooj = existing.get("nooj")
                if isinstance(nooj, dict) and nooj.get("status"):
                    processed.add(key)
                    continue
                # Legacy string non-vide
                if isinstance(nooj, str) and nooj:
                    processed.add(key)
                    continue

            _process_lemma(lemma, pos, phrase, existing)
            processed.add(key)

            if remaining is not None and remaining <= 0:
                break

        if remaining is not None and remaining <= 0:
            break

    # Passe secondaire : ajouter les verbes pairés
    for couple_lemma, phrase in pending_verbs:
        key = ("verb", couple_lemma)
        if key in processed:
            continue
        existing = data.get("verb", {}).get(couple_lemma)
        if existing and isinstance(existing, dict) and has_reviewed_nooj(existing):
            processed.add(key)
            continue
        _process_lemma(couple_lemma, "verb", phrase, existing)
        processed.add(key)

    return entries_in_order, cards_in_order, errors


def main():
    try:
        script_dir = os.path.abspath(os.path.dirname(__file__))
    except NameError:
        script_dir = os.getcwd()

    phrases_path = os.path.join(script_dir, "input", "phrases_a_traiter.json")

    ap = argparse.ArgumentParser(description="Rapport HTML ordonné + out.json {lemma: entry} (ordonné).")
    ap.add_argument("--data", default=os.path.join(script_dir, "..", "..", "static", "data.json"),
                    help="Chemin du data.json (lecture seule). Défaut: ../../static/data.json")
    ap.add_argument("--out", default=os.path.join(script_dir, "output", "entries_report.html"),
                    help="Chemin du HTML de sortie. Défaut: output/entries_report.html")
    ap.add_argument("--json-out", default=os.path.join(script_dir, "output", "out.json"),
                    help="Chemin du JSON des entrées générées. Défaut: output/out.json")
    ap.add_argument("--limit", type=int, default=None,
                    help="Limiter le nombre de lemmes *uniques* traités (debug).")
    args = ap.parse_args()

    phrases_dict = load_json(phrases_path)
    if not isinstance(phrases_dict, dict):
        print(f"Le fichier attendu {phrases_path} doit contenir un dict {{phrase: meta}}.", file=sys.stderr)
        sys.exit(1)

    entries_ordered, cards_ordered, errors = process_phrases_ordered(
        phrases_dict=phrases_dict,
        data_path=args.data,
        limit=args.limit,
    )

    # 1) Construire le dict {lemma: entry} en préservant l'ordre d'apparition
    out_dict: Dict[str, Any] = {}
    for item in entries_ordered:
        lemma = item["lemma"]
        entry = item["entry"]
        pos = item["pos"]

        if lemma in out_dict:
            base_key = f"{lemma}__{pos}"
            k = base_key
            i = 2
            while k in out_dict:
                k = f"{base_key}{i}"
                i += 1
            out_dict[k] = entry
        else:
            out_dict[lemma] = entry

    # 2) Écrire out.json
    try:
        save_json(args.json_out, out_dict)
        print(f"✅ JSON ordonné écrit dans {args.json_out}")
    except Exception as e:
        print(f"❌ Échec d'écriture de {args.json_out} : {e}", file=sys.stderr)
        sys.exit(2)

    # 3) Écrire le HTML
    counts: Dict[str, int] = {}
    for item in entries_ordered:
        counts[item["pos"]] = counts.get(item["pos"], 0) + 1

    html = render_report_html("".join(cards_ordered), counts, errors)
    try:
        with open(args.out, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"✅ Rapport HTML écrit dans {args.out}")
    except Exception as e:
        print(f"❌ Échec d'écriture de {args.out} : {e}", file=sys.stderr)
        sys.exit(3)

    # 4) Convertir en DOCX via pandoc
    import shutil
    docx_path = args.out.rsplit(".", 1)[0] + ".docx"
    if shutil.which("pandoc"):
        try:
            import subprocess
            subprocess.run(["pandoc", args.out, "-o", docx_path], check=True, capture_output=True)
            print(f"✅ Rapport DOCX écrit dans {docx_path}")
        except Exception as e:
            print(f"⚠ Conversion DOCX échouée : {e}", file=sys.stderr)
    else:
        print("⚠ pandoc non installé — rapport DOCX non généré")

    # 5) Résumé des fusions
    merged_count = sum(1 for item in entries_ordered if item.get("merged"))
    if merged_count:
        print(f"⟳ {merged_count} entrée(s) fusionnée(s) avec des données existantes")


if __name__ == "__main__":
    main()
