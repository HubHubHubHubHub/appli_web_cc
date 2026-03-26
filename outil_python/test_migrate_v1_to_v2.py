# -*- coding: utf-8 -*-
"""Tests unitaires pour migrate_v1_to_v2.py"""
import unittest
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from migrate_v1_to_v2 import (
    normalize_pairs,
    rename_internal_keys,
    parse_nooj_string,
    migrate_entry,
    migrate_data_info_tag,
    migrate_data,
    migrate_phrases,
    verify_no_v1_residual,
    verify_no_flat_pairs,
    verify_all_have_meta,
)


class TestNormalizePairs(unittest.TestCase):
    def test_empty(self):
        self.assertEqual(normalize_pairs([]), [])

    def test_single_flat_pair(self):
        self.assertEqual(normalize_pairs(["мій", -1]), [["мій", -1]])

    def test_multiple_flat_pairs(self):
        self.assertEqual(
            normalize_pairs(["його", 4, "нього", 3]),
            [["його", 4], ["нього", 3]],
        )

    def test_already_wrapped(self):
        self.assertEqual(normalize_pairs([["мій", -1]]), [["мій", -1]])

    def test_already_wrapped_multiple(self):
        val = [["мене", 4], ["мене", 2]]
        self.assertEqual(normalize_pairs(val), val)

    def test_none_pair(self):
        self.assertEqual(normalize_pairs([None, -2]), [[None, -2]])

    def test_non_list(self):
        self.assertEqual(normalize_pairs("foo"), "foo")


class TestRenameInternalKeys(unittest.TestCase):
    def test_case_nomi_to_nom(self):
        entry = {"cas": {"nomi": {"s": [["x", 1]], "pl": []}}}
        result = rename_internal_keys(entry)
        self.assertIn("nom", result["cas"])
        self.assertNotIn("nomi", result["cas"])

    def test_number_s_to_sg(self):
        entry = {"cas": {"nomi": {"s": [["x", 1]], "pl": []}}}
        result = rename_internal_keys(entry)
        self.assertIn("sg", result["cas"]["nom"])
        self.assertNotIn("s", result["cas"]["nom"])

    def test_person_rename(self):
        entry = {"conj": {"pres": {"1p": {"s": [], "pl": []}}}}
        result = rename_internal_keys(entry)
        self.assertIn("1", result["conj"]["pres"])
        self.assertNotIn("1p", result["conj"]["pres"])

    def test_tense_pass_to_past(self):
        entry = {"conj": {"pass": {"m": {"s": []}}}}
        result = rename_internal_keys(entry)
        self.assertIn("past", result["conj"])
        self.assertNotIn("pass", result["conj"])

    def test_5p_to_3(self):
        entry = {"conj": {"fut": {"5p": {"s": [], "pl": []}}}}
        result = rename_internal_keys(entry)
        self.assertIn("3", result["conj"]["fut"])
        self.assertNotIn("5p", result["conj"]["fut"])


class TestParseNoojString(unittest.TestCase):
    def test_empty(self):
        result = parse_nooj_string("")
        self.assertIsNone(result["line"])
        self.assertIsNone(result["status"])

    def test_basic_noun(self):
        raw = "артист,NOUN+Masculine+Common+Animate+FLX=СИН"
        result = parse_nooj_string(raw)
        self.assertEqual(result["line"], raw)
        self.assertEqual(result["status"], "pending")
        self.assertEqual(result["flx"], "СИН")

    def test_with_pair(self):
        raw = 'бачити,VERB+Pair="бачити/побачити"+FLX=БАЧИТИ'
        result = parse_nooj_string(raw)
        self.assertEqual(result["pair"], "бачити/побачити")
        self.assertNotIn("biaspect", result)

    def test_biaspect(self):
        raw = 'атакувати,VERB+Pair="атакувати/атакувати"+FLX=РИСУВАТИ+DRV=0:РИСУВАТИ_PF'
        result = parse_nooj_string(raw)
        self.assertTrue(result.get("biaspect"))
        self.assertEqual(result["drv"], ["0:РИСУВАТИ_PF"])

    def test_multiple_drv(self):
        raw = "батожити,VERB+FLX=БАЧИТИ+DRV=ВИ:БАЧИТИ_PF+DRV=ВІД:БАЧИТИ_PF"
        result = parse_nooj_string(raw)
        self.assertEqual(result["drv"], ["ВИ:БАЧИТИ_PF", "ВІД:БАЧИТИ_PF"])


class TestMigrateEntry(unittest.TestCase):
    def test_noun(self):
        entry = {
            "cas": {"nomi": {"s": ["стіл", 4], "pl": ["столи", 4]}},
            "genre": "m",
            "nooj": "стіл,NOUN+Masculine+Common+Inanimate+FLX=СТІЛ",
            "base_html": '<span class="ukr" data-info="стіл;nom;cas;nomi;s">стіл</span>',
        }
        pos, v2 = migrate_entry(entry, "nom", "стіл")
        self.assertEqual(pos, "noun")
        self.assertEqual(v2["meta"]["pos"], "noun")
        self.assertEqual(v2["meta"]["gender"], "m")
        self.assertIn("nom", v2["cas"])
        self.assertNotIn("nomi", v2["cas"])
        self.assertIn("sg", v2["cas"]["nom"])
        self.assertEqual(v2["cas"]["nom"]["sg"], [["стіл", 4]])
        self.assertEqual(v2["nooj"]["flx"], "СТІЛ")
        self.assertNotIn("genre", v2)

    def test_verb_impf(self):
        entry = {
            "inf": ["читати", 4],
            "conj": {"pres": {"1p": {"s": ["читаю", 4], "pl": ["читаємо", 4]}}},
            "asp": "imperfectif",
            "coupl": "прочитати",
            "nooj": "",
            "base_html": '<span class="ukr" data-info="читати;verb;inf">читати</span>',
        }
        pos, v2 = migrate_entry(entry, "verb", "читати")
        self.assertEqual(pos, "verb")
        self.assertEqual(v2["meta"]["aspect"], "impf")
        self.assertEqual(v2["meta"]["couple"], "прочитати")
        self.assertIn("1", v2["conj"]["pres"])
        self.assertIn("sg", v2["conj"]["pres"]["1"])
        self.assertEqual(v2["inf"], [["читати", 4]])
        self.assertNotIn("asp", v2)
        self.assertNotIn("coupl", v2)

    def test_proper_to_pron(self):
        entry = {
            "cas": {"nomi": ["він", -1], "gen": ["його", 4, "нього", 3]},
            "nooj": "він,PRONOUN+Personal+FLX=ВІН",
            "base_html": '<span class="ukr" data-info="він;proper;cas;nomi">він</span>',
        }
        pos, v2 = migrate_entry(entry, "proper", "він")
        self.assertEqual(pos, "pron")
        self.assertEqual(v2["meta"]["pronType"], "pers")
        self.assertEqual(v2["meta"]["syntax"], "pron_pers")
        self.assertEqual(v2["cas"]["nom"], [["він", -1]])
        self.assertEqual(v2["cas"]["gen"], [["його", 4], ["нього", 3]])

    def test_proposs_to_adj(self):
        entry = {
            "cas": {"nomi": {"m": ["мій", -1], "f": ["моя", 3]}},
            "base_html": '<span class="ukr" data-info="мій;proposs;cas;nomi;m">мій</span>',
        }
        pos, v2 = migrate_entry(entry, "proposs", "мій")
        self.assertEqual(pos, "adj")
        self.assertEqual(v2["meta"]["adjType"], "poss")
        self.assertEqual(v2["meta"]["syntax"], "pron_poss")
        self.assertEqual(v2["cas"]["nom"]["m"], [["мій", -1]])

    def test_card_to_num(self):
        entry = {
            "cas": {"nomi": {"m": ["два", 3]}},
            "nooj": "",
            "base_html": '<span class="ukr" data-info="два;card;cas;nomi;m">два</span>',
        }
        pos, v2 = migrate_entry(entry, "card", "два")
        self.assertEqual(pos, "num")
        self.assertEqual(v2["meta"]["numType"], "card")

    def test_biaspect(self):
        entry = {
            "inf": [["атакувати", 7]],
            "conj": {},
            "asp": "biaspectuel",
            "nooj": "",
            "base_html": '<span class="ukr" data-info="атакувати;verb;inf">атакувати</span>',
        }
        pos, v2 = migrate_entry(entry, "verb", "атакувати")
        self.assertEqual(v2["meta"]["aspect"], "biaspect")

    def test_idempotent(self):
        """Une entrée déjà V2 ne doit pas être cassée."""
        entry = {
            "meta": {"pos": "noun", "gender": "m"},
            "cas": {"nom": {"sg": [["стіл", 4]]}},
            "nooj": {"line": "стіл,NOUN+FLX=СТІЛ", "status": "pending", "flx": "СТІЛ"},
            "base_html": '<span class="ukr" data-info="стіл;pos=noun;case=nom;number=sg">стіл</span>',
        }
        pos, v2 = migrate_entry(entry, "noun", "стіл")
        self.assertEqual(pos, "noun")
        self.assertEqual(v2["cas"]["nom"]["sg"], [["стіл", 4]])


class TestMigrateDataInfoTag(unittest.TestCase):
    def test_noun(self):
        self.assertEqual(
            migrate_data_info_tag("машина;nom;cas;acc;s"),
            "машина;pos=noun;case=acc;number=sg",
        )

    def test_verb_inf(self):
        self.assertEqual(
            migrate_data_info_tag("читати;verb;inf"),
            "читати;pos=verb;verbForm=inf",
        )

    def test_verb_conj_pres(self):
        self.assertEqual(
            migrate_data_info_tag("читати;verb;conj;pres;3p;pl"),
            "читати;pos=verb;verbForm=fin;tense=pres;person=3;number=pl",
        )

    def test_verb_conj_past(self):
        self.assertEqual(
            migrate_data_info_tag("купити;verb;conj;pass;f;s"),
            "купити;pos=verb;verbForm=fin;tense=past;gender=f;number=sg",
        )

    def test_adj(self):
        self.assertEqual(
            migrate_data_info_tag("великий;adj;cas;nomi;m"),
            "великий;pos=adj;case=nom;gender=m",
        )

    def test_proper_to_pron(self):
        self.assertEqual(
            migrate_data_info_tag("я;proper;cas;dat"),
            "я;pos=pron;case=dat",
        )

    def test_proposs_to_adj(self):
        self.assertEqual(
            migrate_data_info_tag("мій;proposs;cas;nomi;m"),
            "мій;pos=adj;case=nom;gender=m",
        )

    def test_card_to_num(self):
        self.assertEqual(
            migrate_data_info_tag("два;card;cas;nomi;m"),
            "два;pos=num;case=nom;gender=m",
        )

    def test_invariable(self):
        self.assertEqual(
            migrate_data_info_tag("у;prep;base"),
            "у;pos=prep",
        )

    def test_already_v2(self):
        tag = "машина;pos=noun;case=acc;number=sg"
        self.assertEqual(migrate_data_info_tag(tag), tag)


class TestVerification(unittest.TestCase):
    def test_no_v1_residual_clean(self):
        data = {"noun": {"x": {"meta": {"pos": "noun"}, "cas": {"nom": {"sg": []}}}}}
        self.assertEqual(verify_no_v1_residual(data), [])

    def test_v1_residual_detected(self):
        data = {"noun": {"x": {"meta": {"pos": "noun"}, "cas": {"nomi": {"s": []}}}}}
        errors = verify_no_v1_residual(data)
        self.assertTrue(len(errors) >= 1)

    def test_no_flat_pairs_clean(self):
        data = {"noun": {"x": {"meta": {}, "cas": {"nom": {"sg": [["x", 1]]}}}}}
        self.assertEqual(verify_no_flat_pairs(data), [])

    def test_flat_pair_detected(self):
        data = {"noun": {"x": {"meta": {}, "cas": {"nom": {"sg": ["x", 1]}}}}}
        warnings = verify_no_flat_pairs(data)
        self.assertTrue(len(warnings) >= 1)

    def test_all_have_meta(self):
        data = {"noun": {"x": {"meta": {"pos": "noun"}}}}
        self.assertEqual(verify_all_have_meta(data), [])

    def test_missing_meta(self):
        data = {"noun": {"x": {"cas": {}}}}
        missing = verify_all_have_meta(data)
        self.assertEqual(missing, ["noun.x"])


class TestIdempotence(unittest.TestCase):
    def test_double_migration(self):
        """Migrer un fichier V1, puis re-migrer le résultat doit être stable."""
        data_v1 = {
            "nom": {
                "стіл": {
                    "cas": {"nomi": {"s": ["стіл", 4], "pl": ["столи", 4]}},
                    "genre": "m",
                    "nooj": "стіл,NOUN+FLX=СТІЛ",
                    "base_html": '<span class="ukr" data-info="стіл;nom;cas;nomi;s">стіл</span>',
                }
            }
        }
        v2_first, _ = migrate_data(data_v1)
        v2_second, report2 = migrate_data(v2_first)
        # Le deuxième passage ne doit rien déplacer de significatif
        self.assertEqual(v2_first["noun"]["стіл"]["cas"], v2_second["noun"]["стіл"]["cas"])
        self.assertEqual(v2_first["noun"]["стіл"]["meta"], v2_second["noun"]["стіл"]["meta"])


if __name__ == "__main__":
    unittest.main()
