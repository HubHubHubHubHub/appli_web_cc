"""
nooj_lookup.py — Utilitaires pour interroger les dictionnaires NooJ.

Fonctions pour charger et rechercher dans :
- Ukr_dictionnary_V.1.3.txt (dictionnaire source complet)
- ukr_verbes_paires_aspectuelles.txt (paires aspectuelles)
"""

import os
import re
from typing import Dict, Optional, List, Tuple

# Mapping POS NooJ → POS V2
_NOOJ_POS_MAP = {
    "NOUN": "noun",
    "VERB": "verb",
    "ADJECTIVE": "adj",
    "ADVERB": "adv",
    "PRONOUN": "pron",
    "PREPOSITION": "prep",
    "CONJUNCTION": "conj",
    "PARTICLE": "part",
    "PREDICATIVE": "pred",
    "INSERT": "insert",
    "INTERJECTION": "intj",
    "NUMERAL": "num",
}


def _extract_pos_nooj(attrs: str) -> str:
    """Extrait le POS NooJ depuis les attributs (premier token avant +)."""
    return attrs.split("+")[0].strip()


def _extract_flx(attrs: str) -> Optional[str]:
    """Extrait la valeur FLX= depuis les attributs."""
    m = re.search(r"FLX=(\S+?)(?:\+|$)", attrs)
    return m.group(1) if m else None


def _extract_pair(attrs: str) -> Optional[str]:
    """Extrait le contenu du champ Pair= depuis les attributs."""
    m = re.search(r'Pair="([^"]+)"', attrs)
    return m.group(1) if m else None


def load_nooj_dict(path: str) -> Dict[str, List[Tuple[str, str]]]:
    """
    Charge le dictionnaire NooJ complet.

    Retourne {lemma: [(pos_v2, ligne_brute), ...]}
    Un même lemme peut avoir plusieurs POS (ex: "добре" = adj et adv).
    """
    result: Dict[str, List[Tuple[str, str]]] = {}
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            comma_idx = line.index(",") if "," in line else -1
            if comma_idx <= 0:
                continue
            lemma = line[:comma_idx]
            attrs = line[comma_idx + 1:]
            pos_nooj = _extract_pos_nooj(attrs)
            pos_v2 = _NOOJ_POS_MAP.get(pos_nooj)
            if not pos_v2:
                continue
            result.setdefault(lemma, []).append((pos_v2, line))
    return result


def lookup_nooj_line(nooj_dict: Dict, lemma: str, pos: str) -> Optional[Dict]:
    """
    Cherche un lemme+POS dans le dictionnaire NooJ.

    Retourne {"line": ..., "status": None, "flx": ...} ou None.
    """
    entries = nooj_dict.get(lemma, [])
    for entry_pos, line in entries:
        if entry_pos == pos:
            attrs = line[line.index(",") + 1:]
            flx = _extract_flx(attrs)
            return {"line": line, "status": None, "flx": flx}
    return None


def load_aspect_pairs(path: str) -> Dict[str, str]:
    """
    Charge les paires aspectuelles.

    Retourne un dict bidirectionnel {impf: perf, perf: impf}.
    Pour les paires multiples (impf/perf1,perf2), crée une entrée par paire.
    """
    pairs: Dict[str, str] = {}
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            comma_idx = line.index(",") if "," in line else -1
            if comma_idx <= 0:
                continue
            attrs = line[comma_idx + 1:]
            pair_str = _extract_pair(attrs)
            if not pair_str or "/" not in pair_str:
                continue

            # Format: "impf1,impf2/perf1,perf2"
            parts = pair_str.split("/")
            if len(parts) != 2:
                continue
            impf_side = [v.strip() for v in parts[0].split(",") if v.strip()]
            perf_side = [v.strip() for v in parts[1].split(",") if v.strip()]

            # Créer les liens bidirectionnels (premier élément de chaque côté)
            if impf_side and perf_side:
                # Lien principal : premier impf ↔ premier perf
                pairs[impf_side[0]] = perf_side[0]
                pairs[perf_side[0]] = impf_side[0]
                # Liens secondaires si multiples
                for impf in impf_side[1:]:
                    pairs[impf] = perf_side[0]
                for perf in perf_side[1:]:
                    pairs[perf] = impf_side[0]

    return pairs


def lookup_aspect_pair(pairs_dict: Dict[str, str], lemma: str) -> Optional[str]:
    """Retourne le couple aspectuel d'un verbe, ou None."""
    return pairs_dict.get(lemma)
