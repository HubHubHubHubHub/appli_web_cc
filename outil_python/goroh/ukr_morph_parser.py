# -*- coding: utf-8 -*-
"""
ukr_morph_parser
================

Outils locaux pour extraire, normaliser et structurer des tableaux de flexion
ukrainiens (adjectifs, noms, verbes) depuis du HTML de type goroh.pp.ua.

Politique d’accent (U+0301) et format des valeurs
-------------------------------------------------
- On normalise en NFD, on repère tous les U+0301, puis on renvoie une
  **liste de paires** (forme_sans_accent, position), avec :
  * **position 1-based**, comptée en **lettres** (caractères dont
    `unicodedata.category(ch) != 'Mn'`).
  * **0 accent**   → `[(forme_sans_accent, -1)]`
  * **≥ 2 accents** → on **duplique** la forme pour **chaque** position.
  La forme renvoyée est en **NFC sans accent(s)**.

Structures de sortie (schémas simplifiés)
-----------------------------------------
* Adjectif :
    {"cas": {CASE: {
        "m":  [[w1, p1], [w2, p2], ...],
        "f":  [[...]],
        "n":  [[...]],
        "pl": [[...]]
    }}}

* Nom :
    {"cas": {CASE: {
        "s":  [[w1, p1], ...] ou [[None, -2]] si « — »
        "pl": [[...]]
    }}}

* Verbe imperfectif :
    {"inf": [[lemma_no_accent, pos]],
     "conj": {
        "imp":  {"1":{"sg":[[...]],"pl":[[...]]}, ...},
        "fut":  {...},
        "pres": {...},
        "past": {"m":{"sg":[[...]],"pl":[[...]]},
                 "f":{...},"n":{...}}
     },
     "asp": "impf"}

* Verbe perfectif : idem (sans "pres"), "asp": "perf".

Remarques
---------
- `extract_article_blocks(html)` renvoie le tableau HTML brut du premier
  `<table class="table">` trouvé dans chaque bloc article.
- `fetch_html` est un utilitaire réseau optionnel (à mocker en tests).
"""

from __future__ import annotations

from typing import Dict, List, Tuple, Optional
import unicodedata
import urllib.parse

try:
    import requests
except ImportError:
    requests = None  # Optional — only needed for fetch_html()
from bs4 import BeautifulSoup


# ----------------------------
# Constantes et petits outils
# ----------------------------

# Correspondance des cas (ukr → clé V2)
CASE_MAP: Dict[str, str] = {
    "називний": "nom",
    "родовий": "gen",
    "давальний": "dat",
    "знахідний": "acc",
    "орудний": "ins",
    "місцевий": "loc",
    "кличний": "voc",
}

COMBINING_ACUTE = "\u0301"  # U+0301


def remove_all_accents(word: str) -> str:
    """
    Supprime **tous** les accents combinés U+0301 d'une chaîne et renormalise en NFC.

    Parameters
    ----------
    word : str
        Chaîne potentiellement accentuée (NFC ou NFD).

    Returns
    -------
    str
        Chaîne normalisée NFC sans U+0301.
    """
    nfd = unicodedata.normalize("NFD", word)
    no_acute = nfd.replace(COMBINING_ACUTE, "")
    return unicodedata.normalize("NFC", no_acute)


def parse_ukrainian_word_accent_policy(raw_word: str):  # -> List[Tuple[str, int]]
    """
    Retourne une **liste de paires** (forme_sans_accent, position_1_based).
    0 accent -> [(forme, -1)], ≥2 accents -> duplication.
    """
    nfd = unicodedata.normalize("NFD", raw_word)

    # indices des accents U+0301
    idxs: List[int] = []
    start = 0
    while True:
        i = nfd.find(COMBINING_ACUTE, start)
        if i < 0:
            break
        idxs.append(i)
        start = i + 1

    # forme sans accents (NFC)
    clean = unicodedata.normalize("NFC", nfd.replace(COMBINING_ACUTE, ""))

    if not idxs:
        # -1 = monosyllabe, -2 = accent inconnu (polysyllabe sans accent marqué)
        return [(clean, -1 if count_vowels(clean) <= 1 else -2)]

    # positions 1-based en comptant les lettres (cat != 'Mn')
    pairs: List[Tuple[str, int]] = []
    for i in idxs:
        count = 0
        for ch in nfd[:i]:
            if unicodedata.category(ch) != "Mn":
                count += 1
        pairs.append((clean, count))
    return pairs


# ----------------------------
# Extraction d’articles (HTML)
# ----------------------------

def extract_article_blocks(html: str) -> List[Dict[str, Optional[str]]]:
    """
    Extrait, depuis un HTML de page goroh-like, les blocs d’articles,
    leurs `id`, leurs `tags` textuels et **le HTML du premier tableau "table"**
    s’il existe.

    Parameters
    ----------
    html : str
        Contenu HTML d'une page.

    Returns
    -------
    list[dict]
        Chaque dict a la forme :
        {
            "id": <str|None>,
            "tags": [<str>, ...],
            "table": <str|None>  # HTML pretty du tableau principal
        }
    """
    soup = BeautifulSoup(html, "html.parser")
    out: List[Dict[str, Optional[str]]] = []
    for block in soup.find_all("div", class_="article-block"):
        article: Dict[str, Optional[str] | List[str]] = {
            "id": block.get("id", None),
            "tags": [],
            "table": None,
        }
        article["tags"] = [a.get_text(strip=True) for a in block.find_all("a", class_="tag")]
        table = block.find("table", class_="table")
        if table:
            article["table"] = table.prettify()
        out.append(article)  # type: ignore[arg-type]
    return out


# ----------------------------
# Parsing des tableaux
# ----------------------------

def _normalize_pairs(result) -> List[List[object]]:
    """
    Normalise en liste de paires [[w, p], ...] quel que soit le format plausible
    renvoyé par parse_ukrainian_word_accent_policy (liste de tuples, liste de listes,
    paire unique, liste aplatie [w,p], etc.).
    """
    # None/vides
    if result is None:
        return []
    # tuple (w,p)
    if isinstance(result, tuple) and len(result) == 2:
        w, p = result
        return [[w, p]]
    # liste
    if isinstance(result, list):
        if not result:
            return []
        first = result[0]
        # liste de couples ?
        if isinstance(first, (tuple, list)) and len(first) == 2 and not isinstance(first[0], (tuple, list)):
            return [[w, p] for (w, p) in result]
        # liste aplatie [w,p]
        if len(result) == 2 and not isinstance(result[0], (tuple, list)):
            w, p = result
            return [[w, p]]
        # fallback : re-pairer si possible
        flat: List[object] = []
        for elem in result:
            if isinstance(elem, (tuple, list)):
                if len(elem) == 2:
                    flat.extend(elem)
                else:
                    continue
            else:
                flat.append(elem)
        if len(flat) % 2 == 0:
            return [[flat[i], flat[i + 1]] for i in range(0, len(flat), 2)]
    # dernier recours : rien
    return []


def _collect_span_pairs(cell):
    """
    Collecte toutes les <span class="word"> et renvoie [[w, p], ...].
    Si une forme a plusieurs accents, elle est dédoublée (politique globale).
    """
    forms: List[List[object]] = []
    for sp in cell.find_all("span", class_="word"):
        raw = sp.get_text(strip=True)
        pairs = parse_ukrainian_word_accent_policy(raw)  # liste de (w, p)
        forms.extend(_normalize_pairs(pairs))
    return forms


def parse_table_adj(html_table: str) -> Dict[str, Dict[str, Dict[str, List[object]]]]:
    """
    Parse un tableau d’adjectif de la forme (en-têtes abrégées) :
        відмінок | чол. р. | жін. р. | сер. р. | множина

    Retour
    ------
    dict :
        {"cas": {CASE: {"m": [[...]], "f":[[...]], "n":[[...]], "pl":[[...]]}, ...}}
    """
    soup = BeautifulSoup(html_table, "html.parser")
    table = soup.find("table", class_="table")
    if table is None:
        return {"cas": {}}

    out: Dict[str, Dict[str, Dict[str, List[object]]]] = {"cas": {}}
    for row in table.find("tbody").find_all("tr", class_="row"):
        tds = row.find_all("td", class_="cell")
        if not tds:
            continue
        case_uk = tds[0].get_text(strip=True).lower()
        case_key = CASE_MAP.get(case_uk)
        if not case_key:
            continue
        out["cas"].setdefault(case_key, {"m": [], "f": [], "n": [], "pl": []})
        # colonnes 1..4 : m, f, n, pl
        for idx, gk in enumerate(("m", "f", "n", "pl"), start=1):
            if idx < len(tds):
                out["cas"][case_key][gk] = _collect_span_pairs(tds[idx])
    return out


def parse_table_pron(html_table: str) -> Dict[str, Dict[str, List[object]]]:
    """
    Parse un tableau de pronom idiosyncratique (хто, що, себе).
    Format : відмінок | forme(s) (une seule colonne de valeurs).

    Retour
    ------
    dict :
        {"cas": {CASE: [[form, accent], ...], ...}}
    """
    soup = BeautifulSoup(html_table, "html.parser")
    table = soup.find("table", class_="table")
    if table is None:
        return {"cas": {}}

    out: Dict[str, List[object]] = {}
    for row in table.find("tbody").find_all("tr", class_="row"):
        tds = row.find_all("td", class_="cell")
        if not tds:
            continue
        case_uk = tds[0].get_text(strip=True).lower()
        case_key = CASE_MAP.get(case_uk)
        if not case_key:
            continue
        # Collect forms from all columns after the first (case label)
        forms: List[List[object]] = []
        for td in tds[1:]:
            forms.extend(_collect_span_pairs(td))
        out[case_key] = forms if forms else [[None, -2]]
    return {"cas": out}


def parse_table_nom(html_table: str, lemma: Optional[str] = None) -> Dict[str, object]:
    """
    Parse un tableau de nom (schéma : відмінок | однина | множина).

    Normalise les formes et encode les absences par [[None, -2]] pour une case qui
    contient uniquement « — ».

    Parameters
    ----------
    html_table : str
        HTML du tableau.
    lemma : str | None
        Si fourni, encadre la table dans {lemma: {"cas": {...}}}.

    Returns
    -------
    dict
        {"cas": {...}} ou {lemma: {"cas": {...}}}
    """
    soup = BeautifulSoup(html_table, "html.parser")
    table = soup.find("table", class_="table")
    if table is None:
        return {lemma: {"cas": {}}} if lemma else {"cas": {}}

    def init_root() -> Tuple[Dict[str, object], Dict[str, object]]:
        if lemma:
            root = {lemma: {"cas": {}}}
            return root, root[lemma]["cas"]  # type: ignore[index]
        root = {"cas": {}}
        return root, root["cas"]  # type: ignore[index]

    root, cas_dict = init_root()
    for row in table.find("tbody").find_all("tr", class_="row"):
        tds = row.find_all("td", class_="cell")
        if not tds:
            continue
        case_uk = tds[0].get_text(strip=True).lower()
        case_key = CASE_MAP.get(case_uk)
        if not case_key:
            continue

        cas_dict.setdefault(case_key, {"sg": [], "pl": []})  # type: ignore[index]

        # Singulier
        cell_s, cell_pl = tds[1], tds[2]
        if cell_s.get_text(strip=True) == "—":
            forms_s = [[None, -2]]
        else:
            forms_s = _collect_span_pairs(cell_s) or [[None, -2]]

        # Pluriel
        if cell_pl.get_text(strip=True) == "—":
            forms_p = [[None, -2]]
        else:
            forms_p = _collect_span_pairs(cell_pl) or [[None, -2]]

        cas_dict[case_key]["sg"] = forms_s  # type: ignore[index]
        cas_dict[case_key]["pl"] = forms_p  # type: ignore[index]

    return root


# ----------------------------
# Aide robuste pour trouver la cellule « Інфінітив »
# ----------------------------

def _find_inf_cell(soup: BeautifulSoup):
    """
    Retourne la <td class="cell"> qui suit le header 'Інфінітив'.
    Robuste aux espaces/nbsp et variations d'HTML.
    """
    for row in soup.select("tr.row"):
        head = row.find("td", class_="cell header")
        if not head:
            continue
        label = head.get_text(strip=True).replace("\xa0", " ")
        if label == "Інфінітив":
            cells = row.find_all("td", class_="cell")
            if len(cells) >= 2:
                return cells[-1]  # souvent la grosse cellule (colspan)
            sib = head.find_next_sibling("td")
            if sib:
                return sib
    return None


# ----------------------------
# Verbes : imperfectif & perfectif
# ----------------------------

def parse_verb_imperfective_table(html_content: str, main_infinitive: str):
    """
    Verbe imperfectif.
    - 'inf' devient une liste de paires [[form, pos], ...] pour TOUTES les variantes
      visibles dans la cellule «Інфінітив». Les formes sans accent reçoivent -1.
    - L’ordre met d’abord les variantes correspondant à main_infinitive (sans accent),
      puis les autres (tri stable).
    """
    soup = BeautifulSoup(html_content, "html.parser")

    out = {
        "inf": [],
        "conj": {"imp": {}, "fut": {}, "pres": {}, "past": {}},
        "asp": "impf",
    }

    # 1) Cellule des infinitifs (robuste)
    inf_cell = _find_inf_cell(soup)
    if inf_cell:
        pairs = _collect_span_pairs(inf_cell)  # [[w, p], ...] (dédoublage si multi-accents)
        if not pairs:
            pairs = [[remove_all_accents(main_infinitive), -1]]

        main_no = remove_all_accents(main_infinitive)

        def _rank(pair):
            return 0 if remove_all_accents(pair[0]) == main_no else 1

        out["inf"] = sorted(pairs, key=lambda pr: (_rank(pr),))  # tri stable
    else:
        out["inf"] = [[remove_all_accents(main_infinitive), -1]]

    # 2) Cartographie des blocs (V2)
    mode_map = {
        "Наказовий спосіб": "imp",
        "Майбутній час": "fut",
        "Теперішній час": "pres",
        "Минулий час": "past",
    }

    person_map = {
        "1 особа": "1",
        "2 особа": "2",
        "3 особа": "3",
        "чол. р.": "m",
        "жін. р.": "f",
        "сер. р.": "n",
    }

    def ensure_sp(dct, key):
        if key not in dct:
            dct[key] = {"sg": [], "pl": []}
        return dct[key]

    def ensure_mfn(dct, key):
        if key not in dct:
            dct[key] = {"sg": [], "pl": []}
        return dct[key]

    cur = None
    for row in soup.find_all("tr", class_="row"):
        if "subgroup-header" in row.get("class", []):
            cur = mode_map.get(row.get_text(strip=True))
            continue

        tds = row.find_all("td", class_="cell")
        if not tds or cur is None:
            continue

        hdr = tds[0].get_text(strip=True)

        if cur in ("imp", "fut", "pres"):
            if len(tds) < 3:
                continue
            key = person_map.get(hdr)
            if not key:
                continue
            slot = ensure_sp(out["conj"][cur], key)
            slot["sg"] = _collect_span_pairs(tds[1]) or [[None, -2]]
            slot["pl"] = _collect_span_pairs(tds[2]) or [[None, -2]]

        elif cur == "past":
            if len(tds) < 2:
                continue
            g = person_map.get(hdr)
            if not g:
                continue
            slot = ensure_mfn(out["conj"]["past"], g)
            slot["sg"] = _collect_span_pairs(tds[1]) or [[None, -2]]
            if len(tds) == 3:
                slot["pl"] = _collect_span_pairs(tds[2]) or [[None, -2]]

    return out


def parse_verb_perfective_table(html_content: str, main_infinitive: str):
    """
    Verbe perfectif.
    - 'inf' devient une liste de paires [[form, pos], ...] pour TOUTES les variantes
      visibles dans la cellule «Інфінітив». Les formes sans accent reçoivent -1.
    - L’ordre met d’abord les variantes correspondant à main_infinitive (sans accent),
      puis les autres (tri stable).
    """
    soup = BeautifulSoup(html_content, "html.parser")

    out = {
        "inf": [],
        "conj": {"imp": {}, "fut": {}, "past": {}},
        "asp": "perf",
    }

    # 1) Cellule des infinitifs (robuste)
    inf_cell = _find_inf_cell(soup)
    if inf_cell:
        pairs = _collect_span_pairs(inf_cell) or [[remove_all_accents(main_infinitive), -1]]
        main_no = remove_all_accents(main_infinitive)

        def _rank(pair):
            return 0 if remove_all_accents(pair[0]) == main_no else 1

        out["inf"] = sorted(pairs, key=lambda pr: (_rank(pr),))
    else:
        out["inf"] = [[remove_all_accents(main_infinitive), -1]]

    # 2) Cartographie des blocs (V2)
    mode_map = {
        "Наказовий спосіб": "imp",
        "Майбутній час": "fut",
        "Минулий час": "past",
    }

    person_map = {
        "1 особа": "1",
        "2 особа": "2",
        "3 особа": "3",
        "чол. р.": "m",
        "жін. р.": "f",
        "сер. р.": "n",
    }

    def ensure_sp(dct, key):
        if key not in dct:
            dct[key] = {"sg": [], "pl": []}
        return dct[key]

    def ensure_mfn(dct, key):
        if key not in dct:
            dct[key] = {"sg": [], "pl": []}
        return dct[key]

    cur = None
    for row in soup.find_all("tr", class_="row"):
        if "subgroup-header" in row.get("class", []):
            cur = mode_map.get(row.get_text(strip=True))
            continue

        tds = row.find_all("td", class_="cell")
        if not tds or cur is None:
            continue

        hdr = tds[0].get_text(strip=True)

        if cur in ("imp", "fut"):
            if len(tds) < 3:
                continue
            key = person_map.get(hdr)
            if not key:
                continue
            slot = ensure_sp(out["conj"][cur], key)
            slot["sg"] = _collect_span_pairs(tds[1]) or [[None, -2]]
            slot["pl"] = _collect_span_pairs(tds[2]) or [[None, -2]]

        elif cur == "past":
            if len(tds) < 2:
                continue
            g = person_map.get(hdr)
            if not g:
                continue
            slot = ensure_mfn(out["conj"]["past"], g)
            slot["sg"] = _collect_span_pairs(tds[1]) or [[None, -2]]
            if len(tds) == 3:
                slot["pl"] = _collect_span_pairs(tds[2]) or [[None, -2]]

    return out


# ----------------------------
# Réseau (optionnel)
# ----------------------------

BASE_URL = "https://goroh.pp.ua/Словозміна/"


def fetch_html(mot: str) -> str:
    """
    Récupère le HTML d’une page goroh-like pour un mot donné.

    Parameters
    ----------
    mot : str
        Mot ukrainien (UTF-8).

    Returns
    -------
    str
        Contenu HTML.

    Raises
    ------
    RuntimeError
        Si le code HTTP de réponse n’est pas 200.
    """
    encoded = urllib.parse.quote(mot)
    url = urllib.parse.urljoin(BASE_URL, encoded)
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/117.0.0.0 Safari/537.36"
        )
    }
    resp = requests.get(url, headers=headers, timeout=10)
    if resp.status_code != 200:
        raise RuntimeError(f"Échec HTTP {resp.status_code} pour {url}")
    return resp.text


UKR_VOWELS = set("аеєиіїоуюяАЕЄИІЇОУЮЯ")
INVARIABLE_POS = {"adv", "prep", "conj", "part", "intj", "pred", "insert"}


def count_vowels(word: str) -> int:
    """Compte le nombre de voyelles ukrainiennes dans un mot."""
    return sum(1 for c in word if c in UKR_VOWELS)


def should_skip_goroh(lemma: str, pos: str, data_v2: dict) -> Optional[str]:
    """
    Retourne une raison de skip si on n'a pas besoin de scraper goroh, None sinon.

    Parameters
    ----------
    lemma : str
    pos : str (V2)
    data_v2 : dict (data.json chargé)
    """
    # Monosyllabe → accent toujours -1, pas besoin de paradigme
    if count_vowels(lemma) <= 1:
        return "monosyllabe"

    # Invariable → pas de paradigme goroh (juste base)
    if pos in INVARIABLE_POS:
        return "invariable"

    # Déjà complet dans data_v2 (a un paradigme rempli)
    entry = data_v2.get(pos, {}).get(lemma)
    if entry:
        cas = entry.get("cas", {})
        conj = entry.get("conj", {})
        # Pour les noms/adj : vérifier qu'au moins 5 cas ont des formes
        if cas:
            filled = sum(1 for v in cas.values()
                        if isinstance(v, dict) and any(vv for vv in v.values())
                        or isinstance(v, list) and len(v) > 0 and v[0] and v[0][0] is not None)
            if filled >= 5:
                return "paradigme complet"
        # Pour les verbes : vérifier qu'il y a au moins un temps conjugué
        if conj:
            filled = sum(1 for v in conj.values() if isinstance(v, dict) and v)
            if filled >= 2:
                return "conjugaison complète"

    return None


def validate_accent(word, accent_pos) -> Optional[str]:
    """
    Vérifie qu'un accent pointe sur une voyelle ukrainienne.
    Retourne un message d'erreur ou None si OK.
    """
    if not isinstance(accent_pos, int):
        return None  # skip non-int (malformed data)
    if not isinstance(word, str) or not word:
        return None
    if accent_pos in (-1, -2):
        return None
    if accent_pos < 1 or accent_pos > len(word):
        return f"accent {accent_pos} hors bornes (len={len(word)})"
    if word[accent_pos - 1].lower() not in UKR_VOWELS:
        return f"accent {accent_pos} pointe sur '{word[accent_pos - 1]}' (pas voyelle)"
    return None


def validate_entry_accents(entry: dict, lemma: str = "") -> List[str]:
    """Valide tous les accents d'une entrée (base, cas, conj, inf)."""
    errors = []
    prefix = lemma or "?"

    def check_pairs(pairs, path):
        if not isinstance(pairs, list):
            return
        for pair in pairs:
            if isinstance(pair, list) and len(pair) >= 2 and pair[0]:
                err = validate_accent(pair[0], pair[1])
                if err:
                    errors.append(f"{prefix}.{path}: {err} dans '{pair[0]}'")

    def walk(obj, path=""):
        if isinstance(obj, list):
            check_pairs(obj, path)
        elif isinstance(obj, dict):
            for k, v in obj.items():
                walk(v, f"{path}.{k}" if path else k)

    for field in ("base", "inf", "cas", "conj"):
        if field in entry:
            walk(entry[field], field)

    return errors


__all__ = [
    "remove_all_accents",
    "parse_ukrainian_word_accent_policy",
    "extract_article_blocks",
    "parse_table_adj",
    "parse_table_nom",
    "parse_table_pron",
    "parse_verb_imperfective_table",
    "parse_verb_perfective_table",
    "fetch_html",
    "should_skip_goroh",
    "validate_accent",
    "validate_entry_accents",
    "count_vowels",
]
