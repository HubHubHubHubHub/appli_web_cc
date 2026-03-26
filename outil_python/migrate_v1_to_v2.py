#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
migrate_v1_to_v2.py — Migration de data.json et phrases.json du format V1 au format V2.

Transformations appliquées :
1. Renommage des clés top-level (nom→noun, proper→pron, proposs→adj, pron→adj, card→num)
2. Ajout du bloc meta sur chaque entrée
3. Structuration du champ nooj (string → objet)
4. Renommage des clés internes (nomi→nom, s→sg, 1p→1, pass→past, asp→meta.aspect)
4bis. Normalisation des formes au format liste de paires [["forme", accent], ...]
5. Migration des data-info dans phrases.json

Usage : python3 migrate_v1_to_v2.py [--data PATH] [--phrases PATH] [--dry-run]
"""
import json
import re
import sys
import argparse
from copy import deepcopy

# ---------------------------------------------------------------------------
# Constantes
# ---------------------------------------------------------------------------

CASE_RENAME = {"nomi": "nom"}  # seul renommage de cas

NUMBER_RENAME = {"s": "sg"}  # pl reste pl

PERSON_RENAME = {"1p": "1", "2p": "2", "3p": "3", "5p": "3"}  # 5p = bug #43

TENSE_RENAME = {"pass": "past"}  # pres, fut, imp inchangés

ASPECT_RENAME = {
    "imperfectif": "impf",
    "perfectif": "perf",
    "biaspectuel": "biaspect",
}

# V1 cat → V2 pos for data-info migration
CAT_RENAME = {
    "nom": "noun",
    "proper": "pron",
    "proposs": "adj",
    "card": "num",
    # pron → adj (mais c'est aussi une clé top-level V1 pour démonstratifs)
}

# ---------------------------------------------------------------------------
# Normalisation des paires
# ---------------------------------------------------------------------------

def normalize_pairs(val):
    """Convertit une valeur de forme fléchie au format liste de paires.

    Entrées possibles :
    - [] → []
    - ["mot", 3] → [["mot", 3]]
    - ["mot1", 3, "mot2", 5] → [["mot1", 3], ["mot2", 5]]
    - [["mot", 3]] → [["mot", 3]] (déjà correct)
    - [["mot1", 3], ["mot2", 5]] → inchangé
    - [[None, -2]] → [[None, -2]]
    """
    if not isinstance(val, list) or len(val) == 0:
        return val

    # Déjà au format liste de paires ?
    if isinstance(val[0], list):
        return val

    # Format plat : [word, accent] ou [w1, a1, w2, a2, ...]
    if len(val) >= 2 and (isinstance(val[0], str) or val[0] is None):
        pairs = []
        for i in range(0, len(val), 2):
            if i + 1 < len(val):
                pairs.append([val[i], val[i + 1]])
        return pairs

    return val


def normalize_all_pairs(obj):
    """Normalise récursivement toutes les formes dans un objet cas/conj."""
    if isinstance(obj, list):
        return normalize_pairs(obj)
    if isinstance(obj, dict):
        return {k: normalize_all_pairs(v) for k, v in obj.items()}
    return obj


# ---------------------------------------------------------------------------
# Renommage des clés internes
# ---------------------------------------------------------------------------

def rename_keys_recursive(obj, rename_map):
    """Renomme les clés d'un dict récursivement."""
    if isinstance(obj, dict):
        return {
            rename_map.get(k, k): rename_keys_recursive(v, rename_map)
            for k, v in obj.items()
        }
    if isinstance(obj, list):
        return [rename_keys_recursive(item, rename_map) for item in obj]
    return obj


def rename_internal_keys(entry):
    """Renomme nomi→nom, s→sg, 1p→1, pass→past dans cas et conj."""
    if "cas" in entry:
        cas = entry["cas"]
        # Renommer les cas
        cas = rename_keys_recursive(cas, CASE_RENAME)
        # Renommer s→sg dans les sous-niveaux
        cas = rename_keys_recursive(cas, NUMBER_RENAME)
        entry["cas"] = cas

    if "conj" in entry:
        conj = entry["conj"]
        # Renommer pass→past
        conj = rename_keys_recursive(conj, TENSE_RENAME)
        # Renommer 1p→1, 2p→2, 3p→3
        conj = rename_keys_recursive(conj, PERSON_RENAME)
        # Renommer s→sg
        conj = rename_keys_recursive(conj, NUMBER_RENAME)
        entry["conj"] = conj

    return entry


# ---------------------------------------------------------------------------
# Parsing du champ nooj V1
# ---------------------------------------------------------------------------

def parse_nooj_string(raw):
    """Parse un string nooj V1 en objet structuré V2."""
    if not raw or not isinstance(raw, str):
        return {"line": None, "status": None, "flx": None}

    result = {"line": raw, "status": "pending", "flx": None}

    # Extraire FLX=
    flx_match = re.search(r"FLX=(\w+)", raw)
    if flx_match:
        result["flx"] = flx_match.group(1)

    # Extraire DRV= (peut être multiple)
    drvs = re.findall(r"DRV=([^\+]+)", raw)
    if drvs:
        result["drv"] = drvs

    # Extraire Pair=
    pair_match = re.search(r'Pair="([^"]+)"', raw)
    if pair_match:
        pair_val = pair_match.group(1)
        result["pair"] = pair_val
        if "/" in pair_val:
            left, right = pair_val.split("/", 1)
            if left == right:
                result["biaspect"] = True

    return result


# ---------------------------------------------------------------------------
# Construction du bloc meta
# ---------------------------------------------------------------------------

def build_meta_noun(entry, v1_cat="nom"):
    """Construit meta pour un nom."""
    meta = {"pos": "noun"}
    if entry.get("genre"):
        meta["gender"] = entry["genre"]
    return meta


def build_meta_verb(entry):
    """Construit meta pour un verbe."""
    meta = {"pos": "verb"}

    # Aspect
    asp = entry.get("asp")
    if asp and asp in ASPECT_RENAME:
        meta["aspect"] = ASPECT_RENAME[asp]
    elif asp:
        meta["aspect"] = asp  # valeur inconnue, garder telle quelle

    # Couple aspectuel
    if entry.get("coupl"):
        meta["couple"] = entry["coupl"]

    # Verbe de mouvement
    gramm = entry.get("gramm", "")
    if "déplacement indéterminé" in gramm:
        meta["motionType"] = "indet"
    elif "déplacement déterminé" in gramm:
        meta["motionType"] = "det"

    # Couple de mouvement
    if entry.get("couple déterminé"):
        meta["motionPair"] = entry["couple déterminé"]
    elif entry.get("couple indéterminé"):
        meta["motionPair"] = entry["couple indéterminé"]

    return meta


def build_meta_adj(entry, adjType=None, syntax=None):
    """Construit meta pour un adjectif."""
    meta = {"pos": "adj"}
    if adjType:
        meta["adjType"] = adjType
    if syntax:
        meta["syntax"] = syntax
    return meta


def build_meta_pron(entry, pronType="pers"):
    """Construit meta pour un pronom."""
    meta = {"pos": "pron", "pronType": pronType, "syntax": f"pron_{pronType}"}
    return meta


def build_meta_num(entry, numType="card"):
    """Construit meta pour un numéral."""
    meta = {"pos": "num", "numType": numType}
    return meta


def build_meta_invariable(pos):
    """Construit meta pour un mot invariable."""
    return {"pos": pos}


# ---------------------------------------------------------------------------
# Migration d'une entrée
# ---------------------------------------------------------------------------

def migrate_entry(entry, v1_cat, lemma):
    """Migre une entrée V1 vers V2. Retourne (v2_pos, entry_v2)."""
    entry = deepcopy(entry)

    # 1. Déterminer le pos V2 et construire meta
    if v1_cat == "nom":
        meta = build_meta_noun(entry)
        v2_pos = "noun"
    elif v1_cat == "verb":
        meta = build_meta_verb(entry)
        v2_pos = "verb"
    elif v1_cat == "adj":
        meta = build_meta_adj(entry)
        v2_pos = "adj"
    elif v1_cat == "proper":
        meta = build_meta_pron(entry, "pers")
        v2_pos = "pron"
    elif v1_cat == "proposs":
        meta = build_meta_adj(entry, adjType="poss", syntax="pron_poss")
        v2_pos = "adj"
    elif v1_cat == "pron":
        # V1 "pron" = démonstratifs/relatifs → adj en V2
        meta = build_meta_adj(entry, adjType="dem", syntax="pron_dem")
        v2_pos = "adj"
    elif v1_cat == "card":
        meta = build_meta_num(entry, "card")
        v2_pos = "num"
    elif v1_cat in ("adv", "prep", "conj", "part"):
        meta = build_meta_invariable(v1_cat)
        v2_pos = v1_cat
    else:
        meta = {"pos": v1_cat}
        v2_pos = v1_cat

    # 2. Structurer nooj
    nooj_raw = entry.pop("nooj", None)
    if isinstance(nooj_raw, str):
        nooj = parse_nooj_string(nooj_raw)
    elif isinstance(nooj_raw, dict):
        nooj = nooj_raw  # déjà structuré (idempotent)
    else:
        nooj = {"line": None, "status": None, "flx": None}

    # 3. Supprimer les anciens champs déplacés dans meta
    entry.pop("genre", None)
    entry.pop("asp", None)
    entry.pop("coupl", None)
    entry.pop("gramm", None)
    entry.pop("group", None)
    entry.pop("couple déterminé", None)
    entry.pop("couple indéterminé", None)

    # 4. Renommer les clés internes
    entry = rename_internal_keys(entry)

    # 5. Normaliser les formes au format liste de paires
    if "cas" in entry:
        entry["cas"] = normalize_all_pairs(entry["cas"])
    if "conj" in entry:
        entry["conj"] = normalize_all_pairs(entry["conj"])
    if "inf" in entry:
        entry["inf"] = normalize_pairs(entry["inf"])
    if "base" in entry:
        entry["base"] = normalize_pairs(entry["base"])

    # 6. Reconstruire base_html en V2
    base_html = entry.get("base_html", "")
    if base_html:
        entry["base_html"] = migrate_data_info_in_html(base_html)

    # 7. Assembler l'entrée V2
    entry_v2 = {"meta": meta}
    # Champs de données (dans un ordre logique)
    for key in ("cas", "inf", "conj", "base", "nooj", "base_html", "phrases"):
        if key in entry:
            entry_v2[key] = entry[key]
    if "nooj" not in entry_v2:
        entry_v2["nooj"] = nooj
    else:
        entry_v2["nooj"] = nooj

    # Garder les champs inconnus restants
    for key, val in entry.items():
        if key not in entry_v2 and key != "meta":
            entry_v2[key] = val

    return v2_pos, entry_v2


# ---------------------------------------------------------------------------
# Migration data-info dans phrases.json
# ---------------------------------------------------------------------------

def migrate_data_info_tag(tag):
    """Migre un data-info V1 vers V2.

    V1: "машина;nom;cas;acc;s"
    V2: "машина;pos=noun;case=acc;number=sg"
    """
    parts = tag.split(";")
    if len(parts) < 2:
        return tag

    lemma = parts[0]
    v1_cat = parts[1]
    rest = parts[2:]

    # Déjà en V2 ? (contient '=')
    if "=" in v1_cat:
        return tag

    # Déterminer le pos V2
    pos_map = {
        "nom": "noun", "verb": "verb", "adj": "adj",
        "proper": "pron", "proposs": "adj", "pron": "adj",
        "card": "num", "adv": "adv", "prep": "prep",
        "conj": "conj", "part": "part",
    }
    v2_pos = pos_map.get(v1_cat, v1_cat)

    kv_pairs = [f"pos={v2_pos}"]

    if not rest:
        return f"{lemma};{';'.join(kv_pairs)}"

    # Parse selon la structure V1
    if rest[0] == "base":
        # Invariable : LEMME;cat;base → LEMME;pos=X
        pass
    elif rest[0] == "inf":
        # Verbe infinitif : LEMME;verb;inf → LEMME;pos=verb;verbForm=inf
        kv_pairs.append("verbForm=inf")
    elif rest[0] == "cas" and len(rest) >= 2:
        # Déclinaison : LEMME;cat;cas;CASE;...
        v1_case = rest[1]
        v2_case = CASE_RENAME.get(v1_case, v1_case)
        kv_pairs.append(f"case={v2_case}")

        if len(rest) >= 3:
            val = rest[2]
            # C'est un nombre (s/pl) ou un genre (m/f/n/pl) ?
            if val in ("s", "pl"):
                v2_num = NUMBER_RENAME.get(val, val)
                kv_pairs.append(f"number={v2_num}")
            elif val in ("m", "f", "n"):
                kv_pairs.append(f"gender={val}")
                if len(rest) >= 4 and rest[3] in ("s", "pl"):
                    v2_num = NUMBER_RENAME.get(rest[3], rest[3])
                    kv_pairs.append(f"number={v2_num}")
            elif val == "pl":
                kv_pairs.append("number=pl")

            # Gérer var=N
            for r in rest:
                if r.startswith("var="):
                    kv_pairs.append(r)
    elif rest[0] == "conj" and len(rest) >= 2:
        # Verbe conjugué : LEMME;verb;conj;TEMPS;PERS;NOMBRE
        kv_pairs.append("verbForm=fin")
        v1_tense = rest[1]
        v2_tense = TENSE_RENAME.get(v1_tense, v1_tense)
        kv_pairs.append(f"tense={v2_tense}")

        if len(rest) >= 3:
            val = rest[2]
            if val in PERSON_RENAME:
                kv_pairs.append(f"person={PERSON_RENAME[val]}")
            elif val in ("m", "f", "n"):
                kv_pairs.append(f"gender={val}")

        if len(rest) >= 4:
            val = rest[3]
            v2_num = NUMBER_RENAME.get(val, val)
            if v2_num in ("sg", "pl"):
                kv_pairs.append(f"number={v2_num}")

    return f"{lemma};{';'.join(kv_pairs)}"


def migrate_data_info_in_html(html):
    """Remplace tous les data-info V1 dans une chaîne HTML."""
    def replacer(match):
        old_tag = match.group(1)
        new_tag = migrate_data_info_tag(old_tag)
        return f'data-info="{new_tag}"'

    return re.sub(r'data-info="([^"]+)"', replacer, html)


# ---------------------------------------------------------------------------
# Migration complète
# ---------------------------------------------------------------------------

def migrate_data(data_v1):
    """Migre data.json V1 → V2."""
    data_v2 = {}
    report = {"moved": [], "renamed": [], "dropped": [], "total": 0}

    for v1_cat, entries in data_v1.items():
        if not isinstance(entries, dict):
            continue
        if v1_cat in ("INTERJECTION", "LOCUTION") and len(entries) == 0:
            report["dropped"].append(v1_cat)
            continue

        for lemma, entry in entries.items():
            v2_pos, entry_v2 = migrate_entry(entry, v1_cat, lemma)

            if v2_pos not in data_v2:
                data_v2[v2_pos] = {}

            if lemma in data_v2[v2_pos]:
                # Collision : même lemme dans deux catégories V1
                # Stratégie : l'entrée existante (de adj V1) garde ses données,
                # on enrichit avec le meta de la source V1 (pron/proposs)
                existing = data_v2[v2_pos][lemma]
                # Fusionner meta (la source peut avoir adjType/syntax)
                for mk, mv in entry_v2.get("meta", {}).items():
                    if mk not in existing.get("meta", {}) or mk in ("adjType", "syntax"):
                        existing.setdefault("meta", {})[mk] = mv
                # Fusionner nooj si l'existant n'en a pas
                if not existing.get("nooj", {}).get("line") and entry_v2.get("nooj", {}).get("line"):
                    existing["nooj"] = entry_v2["nooj"]
                report["moved"].append(f"FUSION: {v1_cat}.{lemma} → {v2_pos}.{lemma} (enrichi)")
            else:
                data_v2[v2_pos][lemma] = entry_v2
                report["total"] += 1

                if v1_cat != v2_pos:
                    report["moved"].append(f"{v1_cat}.{lemma} → {v2_pos}.{lemma}")

    return data_v2, report


def migrate_phrases(phrases_v1):
    """Migre phrases.json V1 → V2 (data-info dans phrase_html)."""
    phrases_v2 = {}
    changes = 0

    for key, val in phrases_v1.items():
        val_v2 = deepcopy(val)
        html = val_v2.get("phrase_html", "")
        if html:
            new_html = migrate_data_info_in_html(html)
            if new_html != html:
                changes += 1
            val_v2["phrase_html"] = new_html
        phrases_v2[key] = val_v2

    return phrases_v2, changes


# ---------------------------------------------------------------------------
# Vérification post-migration
# ---------------------------------------------------------------------------

def verify_no_v1_residual(data_v2):
    """Vérifie qu'aucune clé V1 ne subsiste."""
    v1_keys = {"nomi", "s", "1p", "2p", "3p", "5p", "pass"}
    v1_toplevel = {"nom", "proper", "proposs", "card", "INTERJECTION", "LOCUTION"}
    # Note: "pron" existe en V2 (pronoms personnels) — ce n'est plus une clé V1
    errors = []

    for pos_key in data_v2:
        if pos_key in v1_toplevel:
            errors.append(f"Clé top-level V1 résiduelle: {pos_key}")

    def check_keys(obj, path=""):
        if isinstance(obj, dict):
            for k, v in obj.items():
                if k in v1_keys:
                    errors.append(f"Clé V1 résiduelle: {path}.{k}")
                check_keys(v, f"{path}.{k}")
        elif isinstance(obj, list):
            for i, item in enumerate(obj):
                check_keys(item, f"{path}[{i}]")

    for pos_key, entries in data_v2.items():
        if isinstance(entries, dict):
            for lemma, entry in entries.items():
                check_keys(entry, f"{pos_key}.{lemma}")

    return errors


def verify_no_flat_pairs(data_v2):
    """Vérifie qu'aucune paire plate ne subsiste.

    Une paire plate est une liste de la forme ["mot", N] au niveau feuille
    (là où on attend [["mot", N], ...]). On la détecte quand une liste
    commence par un string ou None suivi d'un int, sans être wrappée.
    """
    warnings = []

    def is_flat_pair(val):
        """True si val est ["mot", N] ou ["m1", N, "m2", N, ...] — format plat V1."""
        if not isinstance(val, list) or len(val) < 2:
            return False
        # Si le premier élément est une liste, c'est déjà [["mot", N]] — OK
        if isinstance(val[0], list):
            return False
        # Si le premier élément est un string ou None et le second un int → plat
        if (isinstance(val[0], str) or val[0] is None) and isinstance(val[1], int):
            return True
        return False

    def check_leaf(obj, path=""):
        if isinstance(obj, dict):
            for k, v in obj.items():
                check_leaf(v, f"{path}.{k}")
        elif isinstance(obj, list):
            if is_flat_pair(obj):
                warnings.append(f"Paire plate: {path} = {obj[:4]}")
            # Ne pas descendre dans les paires internes [["mot", N]] — elles sont correctes

    for pos_key, entries in data_v2.items():
        if isinstance(entries, dict):
            for lemma, entry in entries.items():
                for key in ("cas", "conj", "inf", "base"):
                    if key in entry:
                        check_leaf(entry[key], f"{pos_key}.{lemma}.{key}")

    return warnings


def verify_all_have_meta(data_v2):
    """Vérifie que toutes les entrées ont un bloc meta."""
    missing = []
    for pos_key, entries in data_v2.items():
        if isinstance(entries, dict):
            for lemma, entry in entries.items():
                if "meta" not in entry:
                    missing.append(f"{pos_key}.{lemma}")
    return missing


# ---------------------------------------------------------------------------
# Rapport
# ---------------------------------------------------------------------------

def print_report(report, v1_errors, flat_warnings, meta_missing, phrase_changes):
    """Affiche le rapport de migration."""
    print("=" * 60)
    print("RAPPORT DE MIGRATION V1 → V2")
    print("=" * 60)
    print(f"\nEntrées migrées : {report['total']}")

    if report["dropped"]:
        print(f"\nCatégories supprimées (vides) : {', '.join(report['dropped'])}")

    moved = [m for m in report["moved"] if not m.startswith("COLLISION")]
    collisions = [m for m in report["moved"] if m.startswith("COLLISION")]

    if moved:
        print(f"\nDéplacements ({len(moved)}) :")
        for m in moved:
            print(f"  {m}")

    if collisions:
        print(f"\n⚠ Collisions ({len(collisions)}) :")
        for c in collisions:
            print(f"  {c}")

    print(f"\nPhrases modifiées : {phrase_changes}")

    if v1_errors:
        print(f"\n❌ Clés V1 résiduelles ({len(v1_errors)}) :")
        for e in v1_errors[:20]:
            print(f"  {e}")
    else:
        print("\n✅ Aucune clé V1 résiduelle")

    if flat_warnings:
        print(f"\n⚠ Paires plates résiduelles ({len(flat_warnings)}) :")
        for w in flat_warnings[:20]:
            print(f"  {w}")
    else:
        print("✅ Aucune paire plate résiduelle")

    if meta_missing:
        print(f"\n❌ Entrées sans meta ({len(meta_missing)}) :")
        for m in meta_missing[:20]:
            print(f"  {m}")
    else:
        print("✅ Toutes les entrées ont un bloc meta")

    print()


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Migration data.json V1 → V2")
    parser.add_argument("--data", default="static/data.json", help="Chemin data.json")
    parser.add_argument("--phrases", default="static/phrases.json", help="Chemin phrases.json")
    parser.add_argument("--dry-run", action="store_true", help="Ne pas écrire les fichiers")
    args = parser.parse_args()

    # Charger
    with open(args.data, encoding="utf-8") as f:
        data_v1 = json.load(f)
    with open(args.phrases, encoding="utf-8") as f:
        phrases_v1 = json.load(f)

    # Migrer
    data_v2, report = migrate_data(data_v1)
    phrases_v2, phrase_changes = migrate_phrases(phrases_v1)

    # Vérifier
    v1_errors = verify_no_v1_residual(data_v2)
    flat_warnings = verify_no_flat_pairs(data_v2)
    meta_missing = verify_all_have_meta(data_v2)

    # Rapport
    print_report(report, v1_errors, flat_warnings, meta_missing, phrase_changes)

    # Écrire
    if not args.dry_run:
        with open(args.data, "w", encoding="utf-8") as f:
            json.dump(data_v2, f, ensure_ascii=False, indent=2)
        with open(args.phrases, "w", encoding="utf-8") as f:
            json.dump(phrases_v2, f, ensure_ascii=False, indent=2)
        print(f"✅ Fichiers écrits : {args.data}, {args.phrases}")
    else:
        print("🔍 Dry run — aucun fichier modifié")

    # Exit code
    if v1_errors or meta_missing:
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    main()
