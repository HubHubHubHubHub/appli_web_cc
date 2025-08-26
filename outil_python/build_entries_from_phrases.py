# -*- coding: utf-8 -*-
"""
build_entries_from_phrases
==========================

Lit automatiquement `phrases_a_traiter.json` placé dans le **même dossier** que ce script,
scanne les `phrase_html`, et génère :
- un **rapport HTML** (sans JSON) listant les lemmes à créer (adj/nom/verb), avec la phrase, le span source et la table goroh
- un fichier **out.json** contenant les **entrées “type data”** (nouveau format), sans `table_html`

⚠️ Le script **ne modifie pas** `data.json` : il s’en sert **uniquement en lecture** pour ignorer
les lemmes qui possèdent déjà un champ `nooj`.

Usage :
-------
Place `build_entries_from_phrases.py` et `phrases_a_traiter.json` dans le même dossier, puis :
    python build_entries_from_phrases.py

Options :
- --data     : chemin du data.json (lecture seule). Défaut : ../data.json (relatif au script)
- --out      : fichier HTML de sortie. Défaut : entries_report.html (dans le même dossier)
- --json-out : fichier JSON des entrées générées. Défaut : out.json (dans le même dossier)
- --limit    : limite de lemmes à traiter (debug)
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from typing import Dict, Any, Optional, Tuple, Iterable, List

from bs4 import BeautifulSoup

# Module précédent (doit être présent dans le PYTHONPATH / dossier courant)
from ukr_morph_parser import (
    fetch_html,
    extract_article_blocks,
    parse_table_adj,
    parse_table_nom,
    parse_verb_imperfective_table,
    parse_verb_perfective_table,
)

# POS internes -> étiquette ukrainienne affichée sur goroh
UKR_POS_TAG = {
    "adj": "прикметник",
    "nom": "іменник",
    "verb": "дієслово",
}

# Détection aspect
ASPECT_UKR = {
    "perfectif": "доконаний вид",
    "imperfectif": "недоконаний вид",
}


# --------------------------
# Utilitaires I/O JSON
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
# Parsing helpers
# --------------------------

def parse_data_info(data_info: str) -> Tuple[str, str]:
    """
    Retourne (lemme, pos) extraits de data-info. Ex :
      "новий;adj;cas;nomi;m" -> ("новий", "adj")
      "парк;nom;cas;nomi;s" -> ("парк", "nom")
      "гуляти;verb;conj;pres;3p;pl" -> ("гуляти", "verb")
    """
    parts = (data_info or "").split(";")
    if len(parts) < 2:
        return "", ""
    return parts[0].strip(), parts[1].strip()


def is_target_pos(pos: str) -> bool:
    return pos in {"adj", "nom", "verb"}


def pick_article_block_for_pos(articles: Iterable[Dict[str, Any]], pos: str) -> Optional[Dict[str, Any]]:
    """
    Sélectionne le bloc d’article/table correspondant au POS (via tags goroh).
    Fallback : premier bloc avec un tableau.
    """
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
    """
    Retourne "perfectif", "imperfectif" ou None.
    """
    s = set(tags or [])
    if ASPECT_UKR["perfectif"] in s:
        return "perfectif"
    if ASPECT_UKR["imperfectif"] in s:
        return "imperfectif"
    return None


def build_entry_from_table(
    pos: str,
    lemma: str,
    table_html: str,
    goroh_tags: Iterable[str],
    base_span_html: str,
    phrase_text: str,
) -> Dict[str, Any]:
    """
    Construit l’entrée “type data” au **nouveau format** à partir d’un tableau HTML.
    - adj/nom : clé "cas"
    - verb    : "inf"/"conj"/"asp"
    + métadonnées "nooj"="", "base_html", "phrases"
    (⚠️ aucun champ table_html dans la sortie JSON)
    """
    if pos == "adj":
        parsed = parse_table_adj(table_html)  # {"cas": {...}}
        entry = {
            "cas": parsed.get("cas", {}),
            "nooj": "",
            "base_html": base_span_html,
            "phrases": {phrase_text: ""},
        }
        return entry

    if pos == "nom":
        parsed = parse_table_nom(table_html)  # {"cas": {...}} (ou {lemma:{"cas":...}})
        cas = parsed.get("cas") or parsed.get(lemma, {}).get("cas", {})
        entry = {
            "cas": cas,
            "nooj": "",
            "base_html": base_span_html,
            "phrases": {phrase_text: ""},
        }
        return entry

    if pos == "verb":
        aspect = detect_aspect_from_tags(goroh_tags) or "imperfectif"
        if aspect == "perfectif":
            parsed = parse_verb_perfective_table(table_html, lemma)
        else:
            parsed = parse_verb_imperfective_table(table_html, lemma)
        entry = {
            "inf": parsed.get("inf", []),
            "conj": parsed.get("conj", {}),
            "asp": parsed.get("asp", aspect),
            "nooj": "",
            "base_html": base_span_html,
            "phrases": {phrase_text: ""},
        }
        return entry

    # par défaut (ne devrait pas arriver)
    return {
        "nooj": "",
        "base_html": base_span_html,
        "phrases": {phrase_text: ""},
    }


# --------------------------
# Rendu HTML (rapport)
# --------------------------

MIN_CSS = """
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,'Noto Sans',sans-serif;margin:0;padding:24px;background:#fafafa;color:#222;}
.container{max-width:1100px;margin:0 auto;}
h1{font-size:22px;margin:0 0 16px;}
.summary{background:#fff;padding:12px 16px;border:1px solid #e5e7eb;border-radius:12px;margin-bottom:24px;}
.grid{display:grid;grid-template-columns:1fr;gap:16px;}
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


def render_entry_card(pos: str, lemma: str, entry: Dict[str, Any], aspect: Optional[str], table_html: str, phrase_text: str) -> str:
    # badges
    badges = [f"<span class='badge'>POS: {pos}</span>"]
    if pos == "verb":
        badges.append(f"<span class='badge'>Aspect: {entry.get('asp') or aspect or '-'}</span>")

    base_html = entry.get("base_html", "")

    return f"""
    <div class="card">
      <h2>{html_escape(lemma)}</h2>
      <div class="meta">{''.join(badges)}</div>
      <div class="section">
        <h3>Base (span source)</h3>
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


def render_report_html(cards_html: str, created_counts: Dict[str, int], errors: List[str]) -> str:
    n_total = sum(created_counts.values())
    n_adj = created_counts.get("adj", 0)
    n_nom = created_counts.get("nom", 0)
    n_verb = created_counts.get("verb", 0)

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
      <div><strong>Total</strong>: {n_total} &nbsp;|&nbsp; <strong>adj</strong>: {n_adj} &nbsp;|&nbsp; <strong>nom</strong>: {n_nom} &nbsp;|&nbsp; <strong>verb</strong>: {n_verb}</div>
      <div class="footer-note">Les lemmes déjà présents avec un champ <code>nooj</code> ont été ignorés sans aucune modification.</div>
    </div>

    <div class="grid">
      {cards_html if cards_html else '<div class="card"><em>Aucune nouvelle entrée à créer.</em></div>'}
      {err_html}
    </div>
  </div>
</body>
</html>
"""


# --------------------------
# Moteur principal
# --------------------------

def process_phrases_to_entries_and_cards(
    phrases_dict: Dict[str, Any],
    data_path: str,
    limit: Optional[int] = None,
) -> Tuple[Dict[str, Dict[str, Any]], Dict[str, str], List[str]]:
    """
    Retourne:
      - created: { pos: { lemma: entry, ... }, ... } — entrées JSON (sans toucher data.json)
      - cards  : { (pos,lemma) -> html_card } — pour le rendu HTML (sans JSON)
      - errors : [messages...]
    """
    # data.json (lecture seule)
    data = load_json(data_path)
    for top in ("adj", "nom", "verb"):
        if top not in data or not isinstance(data[top], dict):
            data[top] = {}

    created: Dict[str, Dict[str, Any]] = {"adj": {}, "nom": {}, "verb": {}}
    cards: Dict[str, str] = {}
    errors: List[str] = []
    processed = set()  # (pos, lemma)

    remaining = limit

    for phrase, meta in phrases_dict.items():
        if remaining is not None and remaining <= 0:
            break

        phrase_html = (meta or {}).get("phrase_html", "")
        if not phrase_html:
            continue

        soup = BeautifulSoup(phrase_html, "html.parser")
        for span in soup.find_all("span", class_="ukr"):
            data_info = span.get("data-info", "")
            lemma, pos = parse_data_info(data_info)
            if not lemma or not is_target_pos(pos):
                continue

            key = (pos, lemma)
            if key in processed:
                continue

            # 1) Si l’entrée existe avec "nooj" → on ignore totalement
            entry_existing = data[pos].get(lemma)
            if entry_existing and isinstance(entry_existing, dict) and entry_existing.get("nooj"):
                processed.add(key)
                continue

            # 2) Récupérer goroh & parser
            try:
                html = fetch_html(lemma)
                articles = extract_article_blocks(html)
                block = pick_article_block_for_pos(articles, pos)
                if not block or not block.get("table"):
                    raise RuntimeError("Aucun tableau pertinent trouvé sur la page goroh.")
                table_html = block["table"]
                goroh_tags = block.get("tags", [])

                base_span_html = str(span)
                entry = build_entry_from_table(
                    pos=pos,
                    lemma=lemma,
                    table_html=table_html,
                    goroh_tags=goroh_tags,
                    base_span_html=base_span_html,
                    phrase_text=phrase,
                )
                created[pos][lemma] = entry
                processed.add(key)

                # Carte HTML sans JSON (juste table + phrase + span)
                aspect = entry.get("asp") if pos == "verb" else None
                card_html = render_entry_card(pos, lemma, entry, aspect, table_html, phrase)
                cards[f"{pos}::{lemma}"] = card_html

                if remaining is not None:
                    remaining -= 1
                    if remaining <= 0:
                        break

            except Exception as e:
                errors.append(f"{pos}:{lemma} — {e}")
                processed.add(key)

        if remaining is not None and remaining <= 0:
            break

    return created, cards, errors


def main():
    # Dossier du script
    try:
        script_dir = os.path.abspath(os.path.dirname(__file__))
    except NameError:
        script_dir = os.getcwd()

    # Fichier des phrases (fixe, même dossier)
    phrases_path = os.path.join(script_dir, "phrases_a_traiter.json")

    ap = argparse.ArgumentParser(description="Génère un rapport HTML (sans JSON) et un out.json des entrées à créer.")
    ap.add_argument("--data", default=os.path.join(script_dir, "..", "data.json"),
                    help="Chemin du data.json (lecture seule). Défaut: ../data.json (relatif au script).")
    ap.add_argument("--out", default=os.path.join(script_dir, "entries_report.html"),
                    help="Chemin du HTML de sortie. Défaut: entries_report.html (même dossier).")
    ap.add_argument("--json-out", default=os.path.join(script_dir, "out.json"),
                    help="Chemin du JSON des entrées générées. Défaut: out.json (même dossier).")
    ap.add_argument("--limit", type=int, default=None,
                    help="Limiter le nombre de lemmes traités (debug).")
    args = ap.parse_args()

    phrases_dict = load_json(phrases_path)
    if not isinstance(phrases_dict, dict):
        print(f"Le fichier attendu {phrases_path} doit contenir un dict {{phrase: meta}}.", file=sys.stderr)
        sys.exit(1)

    created, cards, errors = process_phrases_to_entries_and_cards(
        phrases_dict=phrases_dict,
        data_path=args.data,
        limit=args.limit,
    )

    # 1) Écrire le JSON des entrées (sans table_html)
    try:
        save_json(args.json_out, created)
        print(f"✅ JSON des entrées écrit dans {args.json_out}")
    except Exception as e:
        print(f"❌ Échec d'écriture de {args.json_out} : {e}", file=sys.stderr)
        sys.exit(2)

    # 2) Écrire le HTML (sans JSON)
    created_counts = {k: len(created.get(k, {})) for k in ("adj", "nom", "verb")}
    cards_html = "".join(cards[k] for k in sorted(cards.keys()))
    html = render_report_html(cards_html, created_counts, errors)
    try:
        with open(args.out, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"✅ Rapport HTML écrit dans {args.out}")
    except Exception as e:
        print(f"❌ Échec d'écriture de {args.out} : {e}", file=sys.stderr)
        sys.exit(3)


if __name__ == "__main__":
    main()
