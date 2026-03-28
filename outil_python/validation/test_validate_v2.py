# -*- coding: utf-8 -*-
"""Tests pour validate_v2.py"""
import unittest
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

import validate_v2 as v


class TestValidateData(unittest.TestCase):
    def setUp(self):
        v.errors.clear()
        v.warnings.clear()

    def test_valid_noun(self):
        data = {"noun": {"стіл": {
            "meta": {"pos": "noun", "gender": "m"},
            "cas": {"nom": {"sg": [["стіл", 3]]}},
            "nooj": {"line": None, "status": "pending", "flx": None},
        }}}
        v.validate_data(data)
        self.assertEqual(len(v.errors), 0)

    def test_missing_meta(self):
        data = {"noun": {"стіл": {"cas": {}}}}
        v.validate_data(data)
        self.assertTrue(any("meta manquant" in e for e in v.errors))

    def test_meta_pos_mismatch(self):
        data = {"noun": {"стіл": {"meta": {"pos": "verb"}}}}
        v.validate_data(data)
        self.assertTrue(any("meta.pos" in e for e in v.errors))

    def test_v1_residual_toplevel(self):
        data = {"nom": {"стіл": {"meta": {"pos": "nom"}}}}
        v.validate_data(data)
        self.assertTrue(any("V1 résiduelle" in e for e in v.errors))

    def test_v1_residual_case_key(self):
        data = {"noun": {"стіл": {
            "meta": {"pos": "noun"},
            "cas": {"nomi": {"sg": [["стіл", 3]]}},
        }}}
        v.validate_data(data)
        self.assertTrue(any("nomi" in e for e in v.errors))

    def test_nooj_string_error(self):
        data = {"noun": {"стіл": {
            "meta": {"pos": "noun"},
            "nooj": "стіл,NOUN+FLX=СТІЛ",
        }}}
        v.validate_data(data)
        self.assertTrue(any("string brut V1" in e for e in v.errors))

    def test_v1_field_residual(self):
        data = {"noun": {"стіл": {
            "meta": {"pos": "noun"},
            "genre": "m",
        }}}
        v.validate_data(data)
        self.assertTrue(any("genre" in e for e in v.errors))

    def test_flat_pair_detected(self):
        data = {"noun": {"стіл": {
            "meta": {"pos": "noun"},
            "cas": {"nom": {"sg": ["стіл", 3]}},
        }}}
        v.validate_data(data)
        self.assertTrue(any("paire plate" in e for e in v.errors))


class TestValidatePhrases(unittest.TestCase):
    def setUp(self):
        v.errors.clear()
        v.warnings.clear()

    def test_valid_v2_data_info(self):
        phrases = {"test": {"phrase_html": '<span class="ukr" data-info="стіл;pos=noun;case=nom;number=sg">стіл</span>'}}
        data = {"noun": {"стіл": {}}}
        v.validate_phrases(phrases, data)
        self.assertEqual(len(v.errors), 0)

    def test_v1_data_info_detected(self):
        phrases = {"test": {"phrase_html": '<span class="ukr" data-info="стіл;nom;cas;nomi;s">стіл</span>'}}
        v.validate_phrases(phrases, {})
        self.assertTrue(any("V1 résiduel" in e for e in v.errors))

    def test_single_quote_detected(self):
        phrases = {"test": {"phrase_html": "<span class='ukr' data-info='стіл;nom;cas;nomi;s'>стіл</span>"}}
        v.validate_phrases(phrases, {})
        self.assertTrue(any("guillemets simples" in e for e in v.errors))

    def test_missing_lemma_warning(self):
        phrases = {"test": {"phrase_html": '<span class="ukr" data-info="xyz;pos=noun;case=nom">xyz</span>'}}
        data = {"noun": {}}
        v.validate_phrases(phrases, data)
        self.assertTrue(any("absent" in w for w in v.warnings))


if __name__ == "__main__":
    unittest.main()
