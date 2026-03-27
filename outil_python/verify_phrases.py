#!/usr/bin/env python3
"""
Vérification des balises data-info dans phrases.json.
Cross-référence avec data.json pour détecter les incohérences paradigmatiques et contextuelles.

Usage :
  python3 outil_python/verify_phrases.py              # depuis la racine du projet
  python3 outil_python/verify_phrases.py --fix         # applique les corrections et écrit phrases_corrected.json
"""

import json
import os
import re
import sys
from collections import defaultdict
from copy import deepcopy

VALID_POS = {"noun", "verb", "adj", "pron", "num", "adv", "prep", "conj", "part", "intj", "pred", "insert", "x"}
VALID_CASES = {"nom", "gen", "dat", "acc", "ins", "loc", "voc"}
VALID_NUMBERS = {"sg", "pl"}
VALID_GENDERS = {"m", "f", "n"}

VALID_KEYS = {
    "pos", "case", "number", "gender", "person",
    "verbForm", "tense", "aspect",
    "nounType", "nounSubtype", "adjType", "pronType", "numType",
    "conjType", "advType", "adjDegree", "advDegree",
    "notation", "variant", "foreign", "indecl", "unamb",
    "motionType", "syntax",
}

KEY_VALIDATORS = {
    "pos": VALID_POS, "case": VALID_CASES, "number": VALID_NUMBERS,
    "gender": VALID_GENDERS, "person": {"1","2","3"}, "tense": {"pres","past","fut","imp"},
    "verbForm": {"fin","inf","imp","conv"},
}

PREP_GOVERNS = {
    "з": {"gen", "ins"}, "із": {"gen", "ins"}, "зі": {"gen", "ins"},
    "у": {"acc", "loc", "gen"}, "в": {"acc", "loc", "gen"},
    "на": {"acc", "loc"}, "до": {"gen"}, "від": {"gen"},
    "без": {"gen"}, "для": {"gen"}, "про": {"acc"},
    "за": {"acc", "ins"}, "під": {"acc", "ins"},
    "над": {"ins"}, "між": {"ins"}, "перед": {"ins"},
    "після": {"gen"}, "через": {"acc"},
    "по": {"acc", "loc", "dat"},
    "біля": {"gen"}, "серед": {"gen"}, "крізь": {"acc"},
    "замість": {"gen"}, "щодо": {"gen"}, "завдяки": {"dat"},
    "проти": {"gen"}, "навколо": {"gen"}, "окрім": {"gen"}, "крім": {"gen"},
    "поза": {"ins"}, "вздовж": {"gen"}, "довкола": {"gen"},
}

SECOND_LOCATIVE = {
    ("ряд", "ряду"), ("бік", "боку"), ("ніс", "носі"),
    ("край", "краю"), ("рід", "роду"), ("сад", "саду"),
    ("лоб", "лобі"), ("рот", "роті"), ("верх", "верху"),
    ("міст", "мосту"), ("порт", "порту"), ("сніг", "снігу"),
}


def parse_data_info(raw):
    parts = raw.split(";")
    result = {"lemma": parts[0]}
    for part in parts[1:]:
        if "=" in part:
            k, v = part.split("=", 1)
            result[k] = v
        else:
            result.setdefault("_orphans", []).append(part)
    return result

def serialize_data_info(tag):
    parts = [tag["lemma"]]
    key_order = ["pos", "nounType", "nounSubtype", "adjType", "pronType", "numType",
                 "conjType", "advType", "adjDegree", "advDegree",
                 "verbForm", "tense", "person", "aspect", "motionType",
                 "case", "gender", "number",
                 "notation", "variant", "foreign", "indecl", "unamb", "syntax"]
    for k in key_order:
        if k in tag and k != "lemma":
            parts.append(f"{k}={tag[k]}")
    return ";".join(parts)

def norm(text):
    if text is None: return ""
    return str(text).lower().strip().replace("\u2019", "'").replace("\u02bc", "'")

def find_form_in_paradigm(data_json, lemma, pos, form_text):
    form_n = norm(form_text)
    entry = data_json.get(pos, {}).get(lemma)
    if not entry: return []
    matches = []

    def check(forms, extra):
        if not isinstance(forms, list): return
        flist = forms if (forms and isinstance(forms[0], list)) else [forms]
        for fp in flist:
            if isinstance(fp, list) and len(fp) >= 2 and fp[0] is not None:
                if norm(fp[0]) == form_n:
                    matches.append(dict(extra))

    if pos == "noun":
        for ck, nums in entry.get("cas", {}).items():
            if not isinstance(nums, dict): continue
            for nk, forms in nums.items():
                check(forms, {"case": ck, "number": nk})
    elif pos == "adj":
        for block_name in ("cas", "comp", "super"):
            block = entry.get(block_name, {})
            for ck, genders in block.items():
                if not isinstance(genders, dict): continue
                for gk, forms in genders.items():
                    n = "pl" if gk == "pl" else "sg"
                    extra = {"case": ck, "number": n}
                    if gk != "pl": extra["gender"] = gk
                    if block_name == "comp": extra["adjDegree"] = "comp"
                    elif block_name == "super": extra["adjDegree"] = "super"
                    check(forms, extra)
    elif pos == "pron":
        for ck, forms in entry.get("cas", {}).items():
            check(forms, {"case": ck})
    elif pos == "verb":
        inf = entry.get("inf")
        if inf: check(inf, {"verbForm": "inf"})
        for tk, persons in entry.get("conj", {}).items():
            if not isinstance(persons, dict): continue
            for pgk, numbers in persons.items():
                if not isinstance(numbers, dict): continue
                for nk, forms in numbers.items():
                    if tk == "imp":
                        check(forms, {"verbForm": "imp", "person": pgk, "number": nk})
                    else:
                        extra = {"verbForm": "fin", "tense": tk, "number": nk}
                        if tk == "past": extra["gender"] = pgk
                        else: extra["person"] = pgk
                        check(forms, extra)
    elif pos == "num":
        for ck, sub in entry.get("cas", {}).items():
            if isinstance(sub, dict):
                for sk, forms in sub.items():
                    extra = {"case": ck}
                    if sk in VALID_GENDERS: extra["gender"] = sk
                    elif sk in VALID_NUMBERS: extra["number"] = sk
                    check(forms, extra)
            elif isinstance(sub, list):
                check(sub, {"case": ck})
    return matches

def form_matches_tag(data_json, lemma, pos, form_text, tag):
    entry = data_json.get(pos, {}).get(lemma)
    if not entry: return None
    form_n = norm(form_text)
    case = tag.get("case"); number = tag.get("number"); gender = tag.get("gender")
    person = tag.get("person"); tense = tag.get("tense"); vf = tag.get("verbForm")

    slot = None
    if pos == "noun" and case and number:
        slot = entry.get("cas", {}).get(case, {}).get(number)
    elif pos == "adj" and case:
        gk = "pl" if number == "pl" else gender
        degree = tag.get("adjDegree")
        block = "comp" if degree == "comp" else "super" if degree == "super" else "cas"
        if gk:
            slot = entry.get(block, {}).get(case, {}).get(gk)
        else:
            # Indéclinable (його, її, їхній) — try any gender
            case_data = entry.get(block, {}).get(case, {})
            for try_gk in ("m", "f", "n", "pl"):
                slot = case_data.get(try_gk)
                if slot: break
    elif pos == "pron" and case:
        slot = entry.get("cas", {}).get(case)
    elif pos == "verb":
        if vf == "inf": slot = entry.get("inf")
        elif vf == "fin" and tense:
            pgk = gender if tense == "past" else person
            if pgk and number:
                slot = entry.get("conj", {}).get(tense, {}).get(pgk, {}).get(number)
            elif tense == "past" and number and not gender:
                # Past plural without gender — try any gender (pl is same for all)
                for try_g in ("m", "f", "n"):
                    slot = entry.get("conj", {}).get("past", {}).get(try_g, {}).get(number)
                    if slot: break
        elif vf == "imp" and person and number:
            slot = entry.get("conj", {}).get("imp", {}).get(person, {}).get(number)
    elif pos == "num" and case:
        sub = entry.get("cas", {}).get(case)
        if isinstance(sub, dict):
            slot = sub.get(gender) or sub.get(number)
        elif isinstance(sub, list): slot = sub

    if slot is None: return None
    if not isinstance(slot, list): return None
    flist = slot if (slot and isinstance(slot[0], list)) else [slot]
    for fp in flist:
        if isinstance(fp, list) and len(fp) >= 2 and fp[0] is not None:
            if norm(fp[0]) == form_n: return True
    return False


def disambiguate(matches, pos, form_text, phrase_tags, idx, data_json):
    if not matches: return None
    if len(matches) == 1: return matches[0]

    non_voc = [m for m in matches if m.get("case") != "voc"]
    if non_voc: matches = non_voc
    if len(matches) == 1: return matches[0]

    prep_cases = set()
    for j in range(idx - 1, max(idx - 4, -1), -1):
        ptag = phrase_tags[j][2]
        if ptag.get("pos") == "prep":
            prep_cases = PREP_GOVERNS.get(norm(phrase_tags[j][1]), set())
            break
        elif ptag.get("pos") in ("adj", "num"): continue
        else: break

    if prep_cases:
        ctx = [m for m in matches if m.get("case") in prep_cases]
        if ctx:
            matches = ctx
            if len(matches) == 1: return matches[0]

    if pos == "adj":
        for j in range(idx + 1, min(idx + 3, len(phrase_tags))):
            nt = phrase_tags[j][2]
            if nt.get("pos") in ("noun", "num"):
                nl = nt.get("lemma")
                noun_gender = None
                if nl:
                    ne = data_json.get("noun", {}).get(nl)
                    if ne: noun_gender = ne.get("meta", {}).get("gender")
                agreeing = []
                for m in matches:
                    if nt.get("case") and m.get("case") != nt["case"]: continue
                    if nt.get("number") and m.get("number") != nt["number"]: continue
                    if noun_gender and m.get("gender") and m["gender"] != noun_gender: continue
                    agreeing.append(m)
                if agreeing:
                    matches = agreeing
                    if len(matches) == 1: return matches[0]
                break
            elif nt.get("pos") == "adj": continue
            else: break

    if pos == "adj":
        for j in range(idx - 1, max(idx - 4, -1), -1):
            ptag = phrase_tags[j][2]
            if ptag.get("pos") == "verb" and ptag.get("tense") == "past":
                ins = [m for m in matches if m.get("case") == "ins"]
                if ins: return ins[0]
                break
            elif ptag.get("pos") in ("adv",): continue
            else: break
        for j in range(idx - 1, max(idx - 3, -1), -1):
            ptag = phrase_tags[j][2]
            if ptag.get("pos") == "verb" and ptag.get("lemma") == "бути":
                ins = [m for m in matches if m.get("case") == "ins"]
                if ins: return ins[0]
                break
            elif ptag.get("pos") in ("adv",): continue
            else: break

    for j in range(idx - 1, max(idx - 3, -1), -1):
        ptag = phrase_tags[j][2]
        if ptag.get("pos") == "verb" and ptag.get("verbForm") == "fin":
            acc = [m for m in matches if m.get("case") == "acc"]
            if acc: return acc[0]
            break
        elif ptag.get("pos") in ("adj",): continue
        else: break

    return matches[0]


def verify(phrases_path, data_path):
    """Run verification and return (issues, stats). No file I/O beyond reading inputs."""
    with open(phrases_path, "r", encoding="utf-8") as f:
        phrases = json.load(f)
    with open(data_path, "r", encoding="utf-8") as f:
        data_json = json.load(f)

    issues = []
    stats = defaultdict(int)
    span_re = re.compile(r'<span\s+class="ukr"\s+data-info="([^"]+)">([^<]+)</span>')

    for phrase_key, phrase_obj in phrases.items():
        html = phrase_obj.get("phrase_html", "")
        spans = span_re.findall(html)
        phrase_tags = [(di, ft, parse_data_info(di)) for di, ft in spans]

        for idx, (data_info_raw, form_text, tag) in enumerate(phrase_tags):
            stats["total"] += 1
            lemma = tag.get("lemma", "")
            pos = tag.get("pos", "")

            if "_orphans" in tag or not pos or pos not in VALID_POS:
                issues.append({
                    "phrase": phrase_key, "form": form_text,
                    "old_info": data_info_raw, "new_info": None,
                    "type": "STRUCTURAL", "auto": False,
                    "msg": f"Structural issue in data-info"
                })
                continue

            if pos in ("prep","conj","part","adv","intj","pred","insert","x"):
                continue

            entry = data_json.get(pos, {}).get(lemma)
            if not entry:
                stats["lemma_missing"] += 1
                continue

            stats["verifiable"] += 1
            match = form_matches_tag(data_json, lemma, pos, form_text, tag)

            if match is True:
                if pos in ("noun","adj","num","pron") and tag.get("case"):
                    prep_idx = None
                    for j in range(idx - 1, max(idx - 4, -1), -1):
                        pt = phrase_tags[j][2]
                        if pt.get("pos") == "prep":
                            prep_idx = j; break
                        elif pt.get("pos") in ("adj","num"): continue
                        else: break

                    if prep_idx is not None:
                        prep_form = norm(phrase_tags[prep_idx][1])
                        prep_cases = PREP_GOVERNS.get(prep_form, set())
                        declared = tag["case"]

                        if prep_cases and declared not in prep_cases:
                            if declared == "loc" and (lemma, norm(form_text)) in SECOND_LOCATIVE:
                                stats["correct"] += 1
                                continue

                            all_m = find_form_in_paradigm(data_json, lemma, pos, form_text)
                            valid = [m for m in all_m if m.get("case") in prep_cases]

                            if valid:
                                sug = disambiguate(valid, pos, form_text, phrase_tags, idx, data_json)
                                if sug:
                                    new_tag = dict(tag); new_tag.pop("_orphans", None)
                                    for k,v in sug.items(): new_tag[k] = v
                                    new_info = serialize_data_info(new_tag)
                                    if new_info != data_info_raw:
                                        issues.append({
                                            "phrase": phrase_key, "form": form_text,
                                            "old_info": data_info_raw, "new_info": new_info,
                                            "type": "CONTEXT_PREP", "auto": True,
                                            "msg": f"'{prep_form}' régit {prep_cases}, déclaré case={declared}"
                                        })
                                        stats["context_fix"] += 1
                                        continue

                stats["correct"] += 1
                continue

            if match is None:
                if pos == "noun" and tag.get("case") == "loc":
                    stats["slot_note"] += 1
                issues.append({
                    "phrase": phrase_key, "form": form_text,
                    "old_info": data_info_raw, "new_info": None,
                    "type": "SLOT_MISSING", "auto": False,
                    "msg": f"Slot manquant dans paradigme de '{lemma}'"
                })
                continue

            stats["mismatch"] += 1
            all_m = find_form_in_paradigm(data_json, lemma, pos, form_text)

            if not all_m:
                issues.append({
                    "phrase": phrase_key, "form": form_text,
                    "old_info": data_info_raw, "new_info": None,
                    "type": "FORM_NOT_FOUND", "auto": False,
                    "msg": f"'{form_text}' introuvable dans paradigme de '{lemma}' ({pos})"
                })
                continue

            sug = disambiguate(all_m, pos, form_text, phrase_tags, idx, data_json)
            new_tag = dict(tag); new_tag.pop("_orphans", None)
            if sug:
                for k,v in sug.items(): new_tag[k] = v
                if "person" in sug and "gender" in new_tag and "gender" not in sug:
                    if sug.get("tense") != "past": del new_tag["gender"]
                if "gender" in sug and "person" in new_tag and "person" not in sug:
                    del new_tag["person"]

            new_info = serialize_data_info(new_tag)
            auto = new_info != data_info_raw

            issues.append({
                "phrase": phrase_key, "form": form_text,
                "old_info": data_info_raw,
                "new_info": new_info if auto else None,
                "type": "MISMATCH", "auto": auto,
                "msg": f"Matches trouvés: {all_m}"
            })

    return issues, dict(stats)


def apply_fixes(phrases_path, issues):
    with open(phrases_path, "r", encoding="utf-8") as f:
        phrases = json.load(f)
    fixed = deepcopy(phrases)
    count = 0
    for issue in issues:
        if not issue["auto"] or not issue["new_info"]: continue
        pk = issue["phrase"]
        html = fixed[pk]["phrase_html"]
        new_html = html.replace(f'data-info="{issue["old_info"]}"', f'data-info="{issue["new_info"]}"', 1)
        if new_html != html:
            fixed[pk]["phrase_html"] = new_html
            count += 1
    return fixed, count


def _get_paths():
    """Resolve paths relative to this script's location (outil_python/)."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    return (
        os.path.join(project_root, "static", "phrases.json"),
        os.path.join(project_root, "static", "data.json"),
    )


def main():
    phrases_path, data_path = _get_paths()
    issues, stats = verify(phrases_path, data_path)

    auto = [i for i in issues if i["auto"]]
    manual = [i for i in issues if not i["auto"]]

    print(f"{'='*70}")
    print(f"RÉSULTATS DE VÉRIFICATION")
    print(f"{'='*70}")
    print(f"  Balises totales              : {stats.get('total', 0)}")
    print(f"  Vérifiables (avec paradigme) : {stats.get('verifiable', 0)}")
    print(f"  Correctes                    : {stats.get('correct', 0)}")
    print(f"  Incohérences paradigme       : {stats.get('mismatch', 0)}")
    print(f"  Incohérences contexte        : {stats.get('context_fix', 0)}")
    print(f"  Lemmes absents               : {stats.get('lemma_missing', 0)}")
    print(f"  ─────────────────────")
    print(f"  Corrections auto             : {len(auto)}")
    print(f"  Vérif. manuelle requise      : {len(manual)}")

    if auto:
        print(f"\n{'─'*70}")
        print("CORRECTIONS AUTOMATIQUES :")
        for i, issue in enumerate(auto, 1):
            print(f"  [{i}] {issue['type']} — « {issue['form']} » : {issue['old_info']} → {issue['new_info']}")

    if manual:
        print(f"\n{'─'*70}")
        print("À VÉRIFIER MANUELLEMENT :")
        for i, issue in enumerate(manual, 1):
            print(f"  [{i}] {issue['type']} — « {issue['form']} » ({issue['old_info']}) : {issue['msg']}")

    if "--fix" in sys.argv and auto:
        fixed, fix_count = apply_fixes(phrases_path, issues)
        with open(phrases_path, "w", encoding="utf-8") as f:
            json.dump(fixed, f, ensure_ascii=False, indent=2)
        print(f"\n{fix_count} corrections appliquées à {phrases_path}")

    sys.exit(1 if auto else 0)


if __name__ == "__main__":
    main()
