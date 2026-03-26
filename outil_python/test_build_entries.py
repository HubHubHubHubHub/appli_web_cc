# -*- coding: utf-8 -*-
"""Tests pour les fonctions utilitaires de build_entries_from_phrases.py"""
import unittest
import importlib
import sys
import os

# Le nom du fichier contient des parenthèses, on importe les deux modules
sys.path.insert(0, os.path.dirname(__file__))

from build_entries_from_phrases import (
    parse_data_info,
    is_target_pos,
    detect_aspect_from_tags,
    detect_gender_from_tags,
    make_base_html,
)


class TestParseDataInfo(unittest.TestCase):
    def test_basic_nom(self):
        lemma, pos = parse_data_info("машина;nom;cas;acc;s")
        self.assertEqual(lemma, "машина")
        self.assertEqual(pos, "nom")

    def test_basic_verb(self):
        lemma, pos = parse_data_info("читати;verb;inf")
        self.assertEqual(lemma, "читати")
        self.assertEqual(pos, "verb")

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
    def test_accepted(self):
        self.assertTrue(is_target_pos("adj"))
        self.assertTrue(is_target_pos("nom"))
        self.assertTrue(is_target_pos("verb"))

    def test_rejected(self):
        self.assertFalse(is_target_pos("prep"))
        self.assertFalse(is_target_pos("adv"))
        self.assertFalse(is_target_pos("conj"))
        self.assertFalse(is_target_pos("part"))
        self.assertFalse(is_target_pos(""))


class TestDetectAspect(unittest.TestCase):
    def test_perfectif(self):
        self.assertEqual(
            detect_aspect_from_tags(["доконаний вид", "дієслово"]),
            "perfectif",
        )

    def test_imperfectif(self):
        self.assertEqual(
            detect_aspect_from_tags(["недоконаний вид", "дієслово"]),
            "imperfectif",
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
        self.assertIn('data-info="читати;verb;inf"', html)
        self.assertIn(">читати</span>", html)

    def test_nom(self):
        html = make_base_html("nom", "стіл")
        self.assertIn('data-info="стіл;nom;cas;nomi;s"', html)

    def test_adj(self):
        html = make_base_html("adj", "великий")
        self.assertIn('data-info="великий;adj;cas;nomi;m"', html)

    def test_unknown_pos(self):
        html = make_base_html("prep", "у")
        self.assertIn('data-info="у"', html)


if __name__ == "__main__":
    unittest.main()
