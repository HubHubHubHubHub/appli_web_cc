#!/usr/bin/env python3
"""
merge_entries.py
================

Insère les entrées de out.json dans data.json en respectant l'ordre
alphabétique ukrainien au sein de chaque catégorie (noun, verb, adj, etc.).

Usage :
  python3 outil_python/merge_entries.py                          # depuis la racine du projet
  python3 outil_python/merge_entries.py --dry-run                # prévisualisation sans écriture
  python3 outil_python/merge_entries.py --input path/to/out.json # fichier d'entrée custom
"""

import argparse
import json
import os
import sys

# Alphabet ukrainien pour le tri (minuscules)
_UKR_ALPHABET = "абвгґдеєжзиіїйклмнопрстуфхцчшщьюя"
_UKR_ORDER = {ch: i for i, ch in enumerate(_UKR_ALPHABET)}
_FALLBACK = len(_UKR_ALPHABET)


def ukr_sort_key(word):
    """Clé de tri alphabétique ukrainien (insensible à la casse)."""
    return [_UKR_ORDER.get(ch, _FALLBACK) for ch in word.lower()]


def sort_category(cat_dict):
    """Retourne un dict trié par ordre alphabétique ukrainien."""
    return dict(sorted(cat_dict.items(), key=lambda kv: ukr_sort_key(kv[0])))


def infer_pos(key, entry):
    """Détermine le POS d'une entrée out.json."""
    # 1. Depuis meta.pos
    meta = entry.get("meta", {})
    if meta.get("pos"):
        return meta["pos"]

    # 2. Depuis la clé (format lemma__pos pour les collisions)
    if "__" in key:
        return key.split("__")[-1].rstrip("0123456789")

    # 3. Heuristique depuis les champs
    if "inf" in entry or "conj" in entry:
        return "verb"
    if "cas" in entry:
        if any(g in entry.get("cas", {}).get("nom", {}) for g in ("m", "f", "n", "pl")):
            return "adj"
        return "noun"

    return None


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)

    ap = argparse.ArgumentParser(description="Insère les entrées de out.json dans data.json (ordre alphabétique ukrainien).")
    ap.add_argument("--input", default=os.path.join(script_dir, "out.json"),
                    help="Fichier d'entrées à fusionner (défaut: outil_python/out.json)")
    ap.add_argument("--data", default=os.path.join(project_root, "static", "data.json"),
                    help="Fichier data.json cible (défaut: static/data.json)")
    ap.add_argument("--dry-run", action="store_true",
                    help="Affiche ce qui serait fait sans modifier data.json")
    args = ap.parse_args()

    # Charger
    with open(args.data, "r", encoding="utf-8") as f:
        data = json.load(f)
    with open(args.input, "r", encoding="utf-8") as f:
        entries = json.load(f)

    if not entries:
        print("Aucune entrée dans le fichier d'entrée.")
        sys.exit(0)

    added = []
    updated = []
    skipped = []

    for key, entry in entries.items():
        # Extraire le lemme (retirer le suffixe __pos si collision)
        lemma = key.split("__")[0] if "__" in key else key

        pos = infer_pos(key, entry)
        if not pos:
            skipped.append((key, "POS non déterminable"))
            continue

        if pos not in data:
            data[pos] = {}

        if lemma in data[pos]:
            updated.append((pos, lemma))
        else:
            added.append((pos, lemma))

        data[pos][lemma] = entry

    # Trier chaque catégorie
    for pos in data:
        if isinstance(data[pos], dict):
            data[pos] = sort_category(data[pos])

    # Résumé
    print(f"{'='*50}")
    print(f"RÉSUMÉ — merge_entries")
    print(f"{'='*50}")
    print(f"  Ajoutées   : {len(added)}")
    print(f"  Mises à jour : {len(updated)}")
    print(f"  Ignorées   : {len(skipped)}")

    if added:
        print(f"\n  Nouvelles entrées :")
        for pos, lemma in added:
            print(f"    + {pos}/{lemma}")

    if updated:
        print(f"\n  Entrées mises à jour :")
        for pos, lemma in updated:
            print(f"    ~ {pos}/{lemma}")

    if skipped:
        print(f"\n  Ignorées :")
        for key, reason in skipped:
            print(f"    ✗ {key} — {reason}")

    # Écrire
    if args.dry_run:
        print(f"\n  (dry-run : data.json non modifié)")
    else:
        with open(args.data, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"\n  ✅ {args.data} mis à jour")

        # Compter
        total = sum(len(v) for v in data.values() if isinstance(v, dict))
        print(f"  Total entrées : {total}")


if __name__ == "__main__":
    main()
