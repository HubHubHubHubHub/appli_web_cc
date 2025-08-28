# -*- coding: utf-8 -*-
"""
build_entries_from_phrases
==========================

Lit automatiquement `phrases_a_traiter.json` (même dossier que ce script),
puis génère :
- un **rapport HTML** (sans JSON embarqué) qui affiche, dans l'ordre d'apparition,
  la phrase, le span source et la table goroh des **lemmes nouveaux** (adj/nom/verb) ;
- un **out.json** ordonné, au format **{ "lemma": {entry}, ... }**, prêt à consommer.

Règles :
- On **ignore** totalement tout (pos, lemma) déjà présent avec un champ `nooj` dans `data.json`.
- **Dédup stricte** par exécution : un (pos, lemma) n'est traité qu'une fois.
- En cas de **collision** (même lemma mais **POS différent**), la clé JSON devient
  `lemma__<pos>` pour éviter d’écraser (ex.: "замок__nom" vs "замок__verb").

Entrées JSON (ordre des clés) :
- **adj**  : {"cas","nooj","base_html","phrases"}
- **nom**  : {"cas","genre"(si dispo),"nooj","base_html","phrases"}  ← genre juste après cas
- **verb** : {"inf","conj","asp","nooj","base_html","phrases"}

Note : `base_html` est **toujours canonique** :
- verb  → `<span class="ukr" data-info="LEMMA;verb;inf">LEMMA</span>`
- nom   → `<span class="ukr" data-info="LEMMA;nom;cas;nomi;s">LEMMA</span>`
- adj   → `<span class="ukr" data-info="LEMMA;adj;cas;nomi;m">LEMMA</span>`
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from typing import Dict, Any, Optional, Tuple, Iterable, List

from bs4 import BeautifulSoup

from ukr_morph_parser import (
    fetch_html,
    extract_article_blocks,
    parse_table_adj,
    parse_table_nom,
    parse_verb_imperfective_table,
    parse_verb_perfective_table,
)

UKR_POS_TAG = {
    "adj": "прикметник",
    "nom": "іменник",
    "verb": "дієслово",
}

ASPECT_UKR = {
    "perfectif": "доконаний вид",
    "imperfectif": "недоконаний вид",
}

# Tags → genre court
GENDER_TAG_MAP = {
    "чоловічий рід": "m",
    "жіночий рід": "f",
    "середній рід": "n",
    # "спільний рід": "c",
}

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
    parts = (data_info or "").split(";")
    if len(parts) < 2:
        return "", ""
    return parts[0].strip(), parts[1].strip()

def is_target_pos(pos: str) -> bool:
    return pos in {"adj", "nom", "verb"}

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
    if ASPECT_UKR["perfectif"] in s:
        return "perfectif"
    if ASPECT_UKR["imperfectif"] in s:
        return "imperfectif"
    return None

def detect_gender_from_tags(tags: Iterable[str]) -> Optional[str]:
    s = set(tags or [])
    for uk, g in GENDER_TAG_MAP.items():
        if uk in s:
            return g
    return None

def make_base_html(pos: str, lemma: str) -> str:
    """Construit le span `base_html` canonique selon le POS."""
    if pos == "verb":
        return f'<span class="ukr" data-info="{lemma};verb;inf">{lemma}</span>'
    if pos == "nom":
        return f'<span class="ukr" data-info="{lemma};nom;cas;nomi;s">{lemma}</span>'
    if pos == "adj":
        return f'<span class="ukr" data-info="{lemma};adj;cas;nomi;m">{lemma}</span>'
    # fallback neutre si jamais
    return f'<span class="ukr" data-info="{lemma}">{lemma}</span>'

def build_entry_from_table(
    pos: str,
    lemma: str,
    table_html: str,
    goroh_tags: Iterable[str],
    phrase_text: str,
) -> Dict[str, Any]:
    """
    Construit l’entrée “type data” au nouveau format (sans table_html) :
      - adj : {"cas","nooj","base_html","phrases"}
      - nom : {"cas","genre"(si dispo),"nooj","base_html","phrases"}
      - verb: {"inf","conj","asp","nooj","base_html","phrases"}
    `base_html` est canonique (voir make_base_html).
    """
    base_html = make_base_html(pos, lemma)

    if pos == "adj":
        parsed = parse_table_adj(table_html)  # {"cas": {...}}
        entry: Dict[str, Any] = {
            "cas": parsed.get("cas", {}),
            "nooj": "",
            "base_html": base_html,
            "phrases": {phrase_text: ""},
        }
        return entry

    if pos == "nom":
        parsed = parse_table_nom(table_html)  # {"cas": {...}} (ou {lemma:{"cas":...}})
        cas = parsed.get("cas") or parsed.get(lemma, {}).get("cas", {})
        gender = detect_gender_from_tags(goroh_tags)
        entry: Dict[str, Any] = {
            "cas": cas,
        }
        if gender:
            entry["genre"] = gender  # juste après "cas"
        entry["nooj"] = ""
        entry["base_html"] = base_html
        entry["phrases"] = {phrase_text: ""}
        return entry

    if pos == "verb":
        aspect = detect_aspect_from_tags(goroh_tags) or "imperfectif"
        if aspect == "perfectif":
            parsed = parse_verb_perfective_table(table_html, lemma)
        else:
            parsed = parse_verb_imperfective_table(table_html, lemma)
        entry: Dict[str, Any] = {
            "inf": parsed.get("inf", []),
            "conj": parsed.get("conj", {}),
            "asp": parsed.get("asp", aspect),
            "nooj": "",
            "base_html": base_html,
            "phrases": {phrase_text: ""},
        }
        return entry

    # fallback
    return {
        "nooj": "",
        "base_html": base_html,
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
"""

def html_escape(s: str) -> str:
    return (s.replace("&", "&amp;")
             .replace("<", "&lt;")
             .replace(">", "&gt;"))

def render_entry_card(lemma: str, pos: str, entry: Dict[str, Any], table_html: str, phrase_text: str) -> str:
    badges = [f"<span class='badge'>POS: {pos}</span>"]
    if pos == "verb":
        badges.append(f"<span class='badge'>Aspect: {entry.get('asp','-')}</span>")
    if pos == "nom" and entry.get("genre"):
        badges.append(f"<span class='badge'>Genre: {entry.get('genre')}</span>")

    base_html = entry.get("base_html", "")

    return f"""
    <div class="card">
      <h2>{html_escape(lemma)}</h2>
      <div class="meta">{''.join(badges)}</div>
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
    <h1>Entrées “type data” à créer</h1>
    <div class="summary">
      <div><strong>Total</strong>: {n_total} &nbsp;|&nbsp;
           <strong>adj</strong>: {counts.get('adj',0)} &nbsp;|&nbsp;
           <strong>nom</strong>: {counts.get('nom',0)} &nbsp;|&nbsp;
           <strong>verb</strong>: {counts.get('verb',0)}</div>
      <div class="footer-note">Les lemmes avec un champ <code>nooj</code> existent déjà et sont ignorés.</div>
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
            { "lemma": str, "entry": dict (sans pos), "pos": str, "table_html": str, "phrase": str }
      - cards_in_order   : liste de fragments HTML (ordre d'apparition)
      - errors           : liste de messages
    """
    data = load_json(data_path)
    for top in ("adj", "nom", "verb"):
        if top not in data or not isinstance(data[top], dict):
            data[top] = {}

    processed = set()  # (pos, lemma)
    entries_in_order: List[Dict[str, Any]] = []
    cards_in_order: List[str] = []
    errors: List[str] = []

    remaining = limit

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

            # Ignore si déjà dans data.json avec nooj
            existing = data[pos].get(lemma)
            if existing and isinstance(existing, dict) and existing.get("nooj"):
                processed.add(key)
                continue

            try:
                html = fetch_html(lemma)
                articles = extract_article_blocks(html)
                block = pick_article_block_for_pos(articles, pos)
                if not block or not block.get("table"):
                    raise RuntimeError("Aucun tableau pertinent trouvé sur la page goroh.")
                table_html = block["table"]
                goroh_tags = block.get("tags", [])

                entry = build_entry_from_table(
                    pos=pos,
                    lemma=lemma,
                    table_html=table_html,
                    goroh_tags=goroh_tags,
                    phrase_text=phrase,
                )

                entries_in_order.append({
                    "lemma": lemma,
                    "entry": entry,     # sans "pos"
                    "pos": pos,         # conservé seulement pour l'HTML / dédup / stats
                    "table_html": table_html,
                    "phrase": phrase,
                })
                cards_in_order.append(render_entry_card(lemma, pos, entry, table_html, phrase))
                processed.add(key)

                if remaining is not None:
                    remaining -= 1
                    if remaining <= 0:
                        break

            except Exception as e:
                errors.append(f"{pos}:{lemma} — {e}")
                processed.add(key)

        if remaining is not None and remaining <= 0:
            break

    return entries_in_order, cards_in_order, errors


def main():
    try:
        script_dir = os.path.abspath(os.path.dirname(__file__))
    except NameError:
        script_dir = os.getcwd()

    phrases_path = os.path.join(script_dir, "phrases_a_traiter.json")

    ap = argparse.ArgumentParser(description="Rapport HTML ordonné + out.json {lemma: entry} (ordonné).")
    ap.add_argument("--data", default=os.path.join(script_dir, "..", "data.json"),
                    help="Chemin du data.json (lecture seule). Défaut: ../data.json (relatif au script).")
    ap.add_argument("--out", default=os.path.join(script_dir, "entries_report.html"),
                    help="Chemin du HTML de sortie. Défaut: entries_report.html (même dossier).")
    ap.add_argument("--json-out", default=os.path.join(script_dir, "out.json"),
                    help="Chemin du JSON des entrées générées (ordonné). Défaut: out.json (même dossier).")
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
        entry = item["entry"]  # sans "pos"
        pos = item["pos"]

        # collision si un autre POS a déjà mis le même lemma :
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

    # 2) Écrire out.json (dict ordonné par insertion)
    try:
        save_json(args.json_out, out_dict)
        print(f"✅ JSON ordonné écrit dans {args.json_out}")
    except Exception as e:
        print(f"❌ Échec d'écriture de {args.json_out} : {e}", file=sys.stderr)
        sys.exit(2)

    # 3) Écrire le HTML (même ordre)
    counts = {"adj": 0, "nom": 0, "verb": 0}
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


if __name__ == "__main__":
    main()
