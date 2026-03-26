# -*- coding: utf-8 -*-
import unittest

from ukr_morph_parser import (
    parse_ukrainian_word_accent_policy,
    parse_table_adj,
    parse_table_nom,
    parse_table_pron,
    parse_verb_imperfective_table,
    parse_verb_perfective_table,
)

HTML_ADJ = """
<div class="article-block" id="126427">
  <div class="table-wrapper">
    <table class="table">
      <tbody>
        <tr class="row column-header">
          <td class="cell">відмінок</td>
          <td class="cell">чол. р.</td>
          <td class="cell">жін. р.</td>
          <td class="cell">сер. р.</td>
          <td class="cell">множина</td>
        </tr>
        <tr class="row">
          <td class="cell header">називний</td>
          <td class="cell"><span class="word searched-word ">бі́льший</span></td>
          <td class="cell"><span class="word ">бі́льша</span>, <span class="word " title="Видовжена форма">більшая</span></td>
          <td class="cell"><span class="word ">бі́льше</span>, <span class="word " title="Видовжена форма">більшеє</span></td>
          <td class="cell"><span class="word ">бі́льші</span>, <span class="word " title="Видовжена форма">більшії</span></td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
"""

HTML_NOUN = """
<table class="table">
  <tbody>
    <tr class="row column-header">
      <td class="cell">відмінок</td>
      <td class="cell">однина</td>
      <td class="cell">множина</td>
    </tr>
    <tr class="row">
      <td class="cell header">називний</td>
      <td class="cell">—</td>
      <td class="cell"><span class="word searched-word ">две́рі</span></td>
    </tr>
  </tbody>
</table>
"""

HTML_V_IMP = """
<table class="table">
  <tbody>
    <tr class="row">
      <td class="cell header">Інфінітив</td>
      <td colspan="2" class="cell"><span class="word searched-word ">ви́сі́ти</span>, <span class="word " title="Коротка форма">висіть</span></td>
    </tr>
    <tr class="row column-header">
      <td class="cell">&nbsp;</td>
      <td class="cell">Однина</td>
      <td class="cell">Множина</td>
    </tr>
    <tr class="row subgroup-header">
      <td colspan="3" class="cell ta-center">Теперішній час</td>
    </tr>
    <tr class="row">
      <td class="cell header">3 особа</td>
      <td class="cell"><span class="word ">ви́сить</span></td>
      <td class="cell"><span class="word ">ви́сять</span></td>
    </tr>
  </tbody>
</table>
"""

HTML_V_PERF = """
<table class="table">
  <tbody>
    <tr class="row">
      <td class="cell header">Інфінітив</td>
      <td colspan="2" class="cell"><span class="word ">відбу́тись</span>, <span class="word searched-word ">відбу́тися</span></td>
    </tr>
    <tr class="row column-header">
      <td class="cell">&nbsp;</td>
      <td class="cell">Однина</td>
      <td class="cell">Множина</td>
    </tr>
    <tr class="row subgroup-header">
      <td colspan="3" class="cell ta-center">Майбутній час</td>
    </tr>
    <tr class="row">
      <td class="cell header">2 особа</td>
      <td class="cell"><span class="word ">відбу́дься</span></td>
      <td class="cell"><span class="word ">відбу́дьтесь</span></td>
    </tr>
    <tr class="row">
      <td class="cell header">3 особа</td>
      <td class="cell"><span class="word ">відбу́деться</span></td>
      <td class="cell"><span class="word ">відбу́дуться</span></td>
    </tr>
    <tr class="row subgroup-header">
      <td colspan="3" class="cell ta-center">Минулий час</td>
    </tr>
    <tr class="row">
      <td class="cell header">чол. р.</td>
      <td class="cell"><span class="word ">відбу́вся</span></td>
      <td class="cell light-cell"><span class="word ">відбули́ся</span></td>
    </tr>
  </tbody>
</table>
"""


class TestUkrMorphParser(unittest.TestCase):
    def test_accent_policy_single(self):
        pairs = parse_ukrainian_word_accent_policy("бі́льший")
        self.assertEqual(pairs, [("більший", 2)])

    def test_accent_policy_none(self):
        pairs = parse_ukrainian_word_accent_policy("більший")
        self.assertEqual(pairs, [("більший", -1)])

    def test_accent_policy_multiple(self):
        pairs = parse_ukrainian_word_accent_policy("ви́сі́ти")
        # deux accents → duplication (positions 1-based)
        self.assertEqual(pairs, [("висіти", 2), ("висіти", 4)])

    # --- Adjectif ---
    def test_parse_table_adj_basic(self):
        data = parse_table_adj(HTML_ADJ)
        self.assertIn("cas", data)
        nom = data["cas"]["nom"]
        self.assertEqual(nom["m"][0], ["більший", 2])

    # --- Nom ---
    def test_parse_table_nom_basic(self):
        data = parse_table_nom(HTML_NOUN)
        nom = data["cas"]["nom"]
        # singulier absent (tiret)
        self.assertEqual(nom["sg"], [[None, -2]])
        # pluriel « двері » accent sur « е » → position 3
        self.assertEqual(nom["pl"][0], ["двері", 3])

    # --- Verbe imperfectif ---
    def test_parse_verb_imperfective(self):
        data = parse_verb_imperfective_table(HTML_V_IMP, "висіти")
        self.assertEqual(data["asp"], "impf")
        self.assertEqual(data["inf"][0], ["висіти", 2])
        self.assertIn("pres", data["conj"])
        self.assertIn("3", data["conj"]["pres"])
        self.assertTrue(len(data["conj"]["pres"]["3"]["sg"]) >= 1)
        self.assertTrue(len(data["conj"]["pres"]["3"]["pl"]) >= 1)

    # --- Verbe perfectif ---
    def test_parse_verb_perfective(self):
        data = parse_verb_perfective_table(HTML_V_PERF, "відбутися")
        self.assertEqual(data["asp"], "perf")
        self.assertEqual(data["inf"][0], ["відбутися", 5])
        self.assertIn("fut", data["conj"])
        self.assertIn("2", data["conj"]["fut"])
        self.assertTrue(len(data["conj"]["fut"]["2"]["sg"]) >= 1)
        # passé
        self.assertIn("past", data["conj"])
        self.assertIn("m", data["conj"]["past"])
        self.assertTrue(len(data["conj"]["past"]["m"]["sg"]) >= 1)
        self.assertTrue(len(data["conj"]["past"]["m"]["pl"]) >= 1)

    def test_parse_verb_perfective_3p_not_5p(self):
        """Regression test for #43: 3 особа must map to '3', not '5p'."""
        data = parse_verb_perfective_table(HTML_V_PERF, "відбутися")
        fut = data["conj"]["fut"]
        self.assertIn("3", fut)
        self.assertTrue(len(fut["3"]["sg"]) >= 1)
        self.assertTrue(len(fut["3"]["pl"]) >= 1)
        self.assertNotIn("5p", fut)
        self.assertNotIn("3p", fut)


if __name__ == "__main__":
    unittest.main()
