#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
validate_v2.py — Validateur de schéma V2 pour data.json et phrases.json.

Usage:
    python3 validate_v2.py [--data PATH] [--phrases PATH] [--report PATH] [--strict] [--quiet]
"""
import json
import os
import re
import sys
import argparse
from typing import List, Tuple

# Import goroh validators
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "goroh"))
from ukr_morph_parser import validate_accent, validate_entry_accents

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

VALID_POS = {"noun", "verb", "adj", "pron", "num", "adv", "prep", "conj", "part", "intj", "pred", "insert", "x"}
VALID_CASES = {"nom", "gen", "dat", "acc", "ins", "loc", "voc"}
VALID_NUMBERS = {"sg", "pl"}
VALID_PERSONS = {"1", "2", "3"}
VALID_TENSES = {"pres", "past", "fut", "imp", "imper", "impers"}
VALID_GENDERS = {"m", "f", "n"}
VALID_ASPECTS = {"impf", "perf", "biaspect"}
VALID_NOOJ_STATUS = {"reviewed", "pending", None}
V1_RESIDUAL_KEYS = {"nomi", "s", "1p", "2p", "3p", "5p", "pass"}
V1_RESIDUAL_TOPLEVEL = {"nom", "proper", "proposs", "card", "INTERJECTION", "LOCUTION"}
INVARIABLE_POS = {"adv", "prep", "conj", "part", "intj", "pred", "insert"}

# ---------------------------------------------------------------------------
# Collectors
# ---------------------------------------------------------------------------

errors: List[str] = []
warnings: List[str] = []


def error(msg: str):
    errors.append(msg)


def warning(msg: str):
    warnings.append(msg)


# ---------------------------------------------------------------------------
# data.json validation
# ---------------------------------------------------------------------------

def validate_data(data: dict):
    """Validate data.json V2 structure."""
    for pos_key, entries in data.items():
        if not isinstance(entries, dict):
            continue
        if pos_key in V1_RESIDUAL_TOPLEVEL:
            error(f"Clé top-level V1 résiduelle: {pos_key}")
            continue
        if pos_key not in VALID_POS:
            warning(f"Clé top-level inconnue: {pos_key}")

        for lemma, entry in entries.items():
            prefix = f"{pos_key}.{lemma}"
            validate_entry(prefix, pos_key, entry)


def validate_entry(prefix: str, pos_key: str, entry: dict):
    """Validate a single entry."""
    # Meta required
    meta = entry.get("meta")
    if meta is None:
        error(f"{prefix}: bloc meta manquant")
        return
    if not isinstance(meta, dict):
        error(f"{prefix}: meta n'est pas un objet")
        return

    # meta.pos must match top-level key
    if meta.get("pos") != pos_key:
        error(f"{prefix}: meta.pos='{meta.get('pos')}' ≠ clé '{pos_key}'")

    # Aspect validation
    aspect = meta.get("aspect")
    if aspect and aspect not in VALID_ASPECTS:
        error(f"{prefix}: meta.aspect='{aspect}' invalide")

    # Nooj validation
    validate_nooj(prefix, entry.get("nooj"))

    # V1 residual keys at entry level
    for v1_key in ("genre", "asp", "coupl", "gramm"):
        if v1_key in entry:
            error(f"{prefix}: champ V1 résiduel '{v1_key}' (devrait être dans meta)")

    # Paradigm key validation
    validate_paradigm_keys(prefix, pos_key, entry)

    # Accent validation
    accent_errors = validate_entry_accents(entry, prefix)
    for e in accent_errors:
        error(e)

    # Flat pair detection
    validate_no_flat_pairs(prefix, entry)


def validate_nooj(prefix: str, nooj):
    """Validate the nooj field."""
    if nooj is None:
        return
    if isinstance(nooj, str):
        error(f"{prefix}: nooj est un string brut V1 (attendu: objet)")
        return
    if not isinstance(nooj, dict):
        error(f"{prefix}: nooj n'est pas un objet")
        return
    status = nooj.get("status")
    if status not in VALID_NOOJ_STATUS:
        warning(f"{prefix}: nooj.status='{status}' inattendu")


def validate_paradigm_keys(prefix: str, pos_key: str, entry: dict):
    """Validate paradigm keys (cas, conj) are V2."""
    cas = entry.get("cas")
    if cas and isinstance(cas, dict):
        for case_key, case_val in cas.items():
            if case_key in V1_RESIDUAL_KEYS:
                error(f"{prefix}.cas: clé V1 résiduelle '{case_key}'")
            elif case_key not in VALID_CASES:
                warning(f"{prefix}.cas: clé inconnue '{case_key}'")

            # Topology check
            if isinstance(case_val, dict):
                for sub_key in case_val:
                    if sub_key in V1_RESIDUAL_KEYS:
                        error(f"{prefix}.cas.{case_key}: clé V1 résiduelle '{sub_key}'")

    conj = entry.get("conj")
    if conj and isinstance(conj, dict):
        for tense_key, tense_val in conj.items():
            if tense_key in V1_RESIDUAL_KEYS:
                error(f"{prefix}.conj: clé V1 résiduelle '{tense_key}'")
            elif tense_key not in VALID_TENSES:
                warning(f"{prefix}.conj: clé inconnue '{tense_key}'")
            if isinstance(tense_val, dict):
                for sub_key in tense_val:
                    if sub_key in V1_RESIDUAL_KEYS:
                        error(f"{prefix}.conj.{tense_key}: clé V1 résiduelle '{sub_key}'")


def validate_no_flat_pairs(prefix: str, entry: dict):
    """Detect flat pairs (V1 format)."""
    def is_flat(val):
        if not isinstance(val, list) or len(val) < 2:
            return False
        if isinstance(val[0], list):
            return False
        if (isinstance(val[0], str) or val[0] is None) and isinstance(val[1], int):
            return True
        return False

    def walk(obj, path):
        if isinstance(obj, dict):
            for k, v in obj.items():
                walk(v, f"{path}.{k}")
        elif isinstance(obj, list) and is_flat(obj):
            error(f"{prefix}.{path}: paire plate V1 {obj[:4]}")

    for field in ("cas", "conj", "inf", "base"):
        if field in entry:
            walk(entry[field], field)


# ---------------------------------------------------------------------------
# phrases.json validation
# ---------------------------------------------------------------------------

def validate_phrases(phrases: dict, data: dict):
    """Validate phrases.json V2."""
    for phrase_key, phrase_val in phrases.items():
        html = phrase_val.get("phrase_html", "")
        if not html:
            continue

        for match in re.finditer(r'data-info="([^"]+)"', html):
            raw = match.group(1)
            validate_data_info(raw, data, phrase_key)

        # Also check single-quote data-info (should have been migrated)
        for match in re.finditer(r"data-info='([^']+)'", html):
            error(f"data-info guillemets simples V1: '{match.group(1)[:40]}' dans '{phrase_key[:40]}'")


def validate_data_info(raw: str, data: dict, phrase_context: str):
    """Validate a single data-info attribute."""
    parts = raw.split(";")
    if len(parts) < 2:
        error(f"data-info mal formé: '{raw}' dans '{phrase_context[:40]}...'")
        return

    lemma = parts[0]
    tag = {}
    for p in parts[1:]:
        if "=" in p:
            k, v = p.split("=", 1)
            tag[k] = v
        else:
            error(f"data-info V1 résiduel (pas de '='): '{raw}'")
            return

    pos = tag.get("pos")
    if not pos:
        error(f"data-info sans pos: '{raw}'")
        return
    if pos not in VALID_POS:
        error(f"data-info pos invalide '{pos}': '{raw}'")
        return

    # Lemma exists in data.json?
    if pos in data and lemma not in data[pos]:
        warning(f"Lemme '{lemma}' (pos={pos}) absent de data.json")

    # Case valid?
    case_val = tag.get("case")
    if case_val and case_val not in VALID_CASES:
        error(f"Cas invalide '{case_val}' dans: '{raw}'")


# ---------------------------------------------------------------------------
# Report
# ---------------------------------------------------------------------------

def generate_report(data_path: str, phrases_path: str) -> str:
    """Generate markdown report."""
    lines = ["# Rapport de validation V2\n"]

    data_errors = [e for e in errors if not e.startswith("data-info")]
    phrase_errors = [e for e in errors if e.startswith("data-info") or "dans '" in e]
    data_warnings = [w for w in warnings if "absent de data.json" not in w]
    phrase_warnings = [w for w in warnings if "absent de data.json" in w]

    lines.append(f"**{len(errors)} erreur(s)** · {len(warnings)} warning(s)\n")

    if errors:
        lines.append("## Erreurs (bloquantes)\n")
        for e in errors[:50]:
            lines.append(f"- {e}")
        if len(errors) > 50:
            lines.append(f"\n... et {len(errors) - 50} autres\n")

    if warnings:
        lines.append("\n## Warnings (non bloquants)\n")
        for w in warnings[:30]:
            lines.append(f"- {w}")
        if len(warnings) > 30:
            lines.append(f"\n... et {len(warnings) - 30} autres\n")

    lines.append("\n## Résumé\n")
    lines.append("| Fichier | Erreurs | Warnings |")
    lines.append("|---------|---------|----------|")
    lines.append(f"| {data_path} | {len(data_errors)} | {len(data_warnings)} |")
    lines.append(f"| {phrases_path} | {len(phrase_errors)} | {len(phrase_warnings)} |")

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Validateur de schéma V2")
    parser.add_argument("--data", default="static/data.json", help="Chemin data.json")
    parser.add_argument("--phrases", default="static/phrases.json", help="Chemin phrases.json")
    parser.add_argument("--report", default=None, help="Écrire le rapport markdown")
    parser.add_argument("--strict", action="store_true", help="Traiter warnings comme erreurs")
    parser.add_argument("--quiet", action="store_true", help="N'afficher que le résumé")
    args = parser.parse_args()

    with open(args.data, encoding="utf-8") as f:
        data = json.load(f)
    with open(args.phrases, encoding="utf-8") as f:
        phrases = json.load(f)

    validate_data(data)
    validate_phrases(phrases, data)

    # Report
    report = generate_report(args.data, args.phrases)

    if args.report:
        with open(args.report, "w", encoding="utf-8") as f:
            f.write(report)

    if not args.quiet:
        print(report)
    else:
        print(f"{len(errors)} erreur(s), {len(warnings)} warning(s)")

    # Exit code
    total_errors = len(errors) + (len(warnings) if args.strict else 0)
    sys.exit(1 if total_errors > 0 else 0)


if __name__ == "__main__":
    main()
