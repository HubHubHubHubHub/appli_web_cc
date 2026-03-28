# -*- coding: utf-8 -*-
"""Tests pour les fonctions utilitaires de build_entries.py (V2)"""
import unittest
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from build_entries import (
    parse_data_info,
    is_target_pos,
    detect_aspect_from_tags,
    detect_gender_from_tags,
    make_base_html,
    has_reviewed_nooj,
    merge_with_existing,
)


class TestParseDataInfo(unittest.TestCase):
    def test_v2_noun(self):
        lemma, pos = parse_data_info("машина;pos=noun;case=acc;number=sg")
        self.assertEqual(lemma, "машина")
        self.assertEqual(pos, "noun")

    def test_v2_verb(self):
        lemma, pos = parse_data_info("читати;pos=verb;verbForm=inf")
        self.assertEqual(lemma, "читати")
        self.assertEqual(pos, "verb")

    def test_v1_fallback(self):
        lemma, pos = parse_data_info("машина;nom;cas;acc;s")
        self.assertEqual(lemma, "машина")
        self.assertEqual(pos, "nom")

    def test_empty(self):
        lemma, pos = parse_data_info("")
        self.assertEqual(lemma, "")
        self.assertEqual(pos, "")

    def test_none(self):
        lemma, pos = parse_data_info(None)
        self.assertEqual(lemma, "")
        self.assertEqual(pos, "")

    def test_single_field(self):
        lemma, pos = parse_data_info("alone")
        self.assertEqual(lemma, "")
        self.assertEqual(pos, "")


class TestIsTargetPos(unittest.TestCase):
    def test_main_pos_accepted(self):
        self.assertTrue(is_target_pos("adj"))
        self.assertTrue(is_target_pos("noun"))
        self.assertTrue(is_target_pos("verb"))

    def test_invariables_accepted(self):
        self.assertTrue(is_target_pos("prep"))
        self.assertTrue(is_target_pos("adv"))
        self.assertTrue(is_target_pos("conj"))
        self.assertTrue(is_target_pos("part"))
        self.assertTrue(is_target_pos("intj"))
        self.assertTrue(is_target_pos("pred"))
        self.assertTrue(is_target_pos("insert"))

    def test_empty_rejected(self):
        self.assertFalse(is_target_pos(""))

    def test_unknown_rejected(self):
        self.assertFalse(is_target_pos("xyz"))


class TestDetectAspect(unittest.TestCase):
    def test_perfectif(self):
        self.assertEqual(
            detect_aspect_from_tags(["доконаний вид", "дієслово"]),
            "perf",
        )

    def test_imperfectif(self):
        self.assertEqual(
            detect_aspect_from_tags(["недоконаний вид", "дієслово"]),
            "impf",
        )

    def test_biaspect(self):
        self.assertEqual(
            detect_aspect_from_tags(["двовидове", "дієслово"]),
            "biaspect",
        )

    def test_none(self):
        self.assertIsNone(detect_aspect_from_tags(["іменник"]))

    def test_empty(self):
        self.assertIsNone(detect_aspect_from_tags([]))
        self.assertIsNone(detect_aspect_from_tags(None))


class TestDetectGender(unittest.TestCase):
    def test_masculine(self):
        self.assertEqual(detect_gender_from_tags(["чоловічий рід"]), "m")

    def test_feminine(self):
        self.assertEqual(detect_gender_from_tags(["жіночий рід"]), "f")

    def test_neuter(self):
        self.assertEqual(detect_gender_from_tags(["середній рід"]), "n")

    def test_none(self):
        self.assertIsNone(detect_gender_from_tags(["дієслово"]))


class TestMakeBaseHtml(unittest.TestCase):
    def test_verb(self):
        html = make_base_html("verb", "читати")
        self.assertIn('data-info="читати;pos=verb;verbForm=inf"', html)
        self.assertIn(">читати</span>", html)

    def test_noun(self):
        html = make_base_html("noun", "стіл")
        self.assertIn('data-info="стіл;pos=noun;case=nom;number=sg"', html)

    def test_adj(self):
        html = make_base_html("adj", "великий")
        self.assertIn('data-info="великий;pos=adj;case=nom;gender=m"', html)

    def test_invariable(self):
        html = make_base_html("prep", "у")
        self.assertIn('data-info="у;pos=prep"', html)

    def test_pred(self):
        html = make_base_html("pred", "можна")
        self.assertIn('data-info="можна;pos=pred"', html)


class TestHasReviewedNooj(unittest.TestCase):
    def test_empty_string(self):
        self.assertFalse(has_reviewed_nooj({"nooj": ""}))

    def test_nonempty_string(self):
        self.assertTrue(has_reviewed_nooj({"nooj": "some content"}))

    def test_dict_all_null(self):
        self.assertFalse(has_reviewed_nooj({"nooj": {"line": None, "status": None, "flx": None}}))

    def test_dict_with_line(self):
        self.assertTrue(has_reviewed_nooj({"nooj": {"line": "NOUN+FLX=X", "status": None, "flx": None}}))

    def test_dict_with_status(self):
        self.assertTrue(has_reviewed_nooj({"nooj": {"line": None, "status": "pending", "flx": None}}))

    def test_dict_with_flx(self):
        self.assertTrue(has_reviewed_nooj({"nooj": {"line": None, "status": None, "flx": "МАШИНА"}}))

    def test_missing_nooj(self):
        self.assertFalse(has_reviewed_nooj({"meta": {"pos": "noun"}}))

    def test_none_nooj(self):
        self.assertFalse(has_reviewed_nooj({"nooj": None}))


class TestMergeWithExisting(unittest.TestCase):
    def test_paradigm_replaced(self):
        existing = {
            "meta": {"pos": "noun", "gender": "f"},
            "cas": {"nom": {"sg": [["старе", 1]]}},
            "phrases": {"old phrase": ""},
            "traduction": "old translation",
        }
        new_entry = {
            "meta": {"pos": "noun"},
            "cas": {"nom": {"sg": [["нове", 1]]}},
            "phrases": {"new phrase": ""},
        }
        result = merge_with_existing(new_entry, existing)
        # Paradigme remplacé
        self.assertEqual(result["cas"]["nom"]["sg"], [["нове", 1]])
        # Phrases fusionnées
        self.assertIn("old phrase", result["phrases"])
        self.assertIn("new phrase", result["phrases"])
        # Meta fusionnée (gender préservé)
        self.assertEqual(result["meta"]["gender"], "f")
        # Champs custom préservés
        self.assertEqual(result["traduction"], "old translation")

    def test_meta_merge_priority(self):
        existing = {"meta": {"pos": "noun", "gender": "m", "custom": "keep"}}
        new_entry = {"meta": {"pos": "noun"}}
        result = merge_with_existing(new_entry, existing)
        self.assertEqual(result["meta"]["gender"], "m")
        self.assertEqual(result["meta"]["custom"], "keep")

    def test_empty_existing(self):
        new_entry = {"meta": {"pos": "adj"}, "cas": {"nom": {}}, "phrases": {"p": ""}}
        result = merge_with_existing(new_entry, {})
        self.assertEqual(result["cas"]["nom"], {})
        self.assertEqual(result["meta"]["pos"], "adj")


if __name__ == "__main__":
    unittest.main()
