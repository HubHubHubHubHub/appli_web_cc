# -*- coding: utf-8 -*-
import unittest

from ukr_morph_parser import (
    parse_ukrainian_word_accent_policy,
    parse_table_adj,
    parse_table_nom,
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

    def test_parse_table_adj_basic(self):
        data = parse_table_adj(HTML_ADJ)
        self.assertIn("cas", data)
        nomi = data["cas"]["nomi"]
        # masculin nominatif : première forme = "більший" avec accent sur 2
        self.assertEqual(nomi["m"][0], ["більший", 2])

    def test_parse_table_nom_basic(self):
        data = parse_table_nom(HTML_NOUN)
        nomi = data["cas"]["nomi"]
        # singulier absent (tiret)
        self.assertEqual(nomi["s"], [[None, -2]])
        # pluriel « двері » accent sur « е » → position 3
        self.assertEqual(nomi["pl"][0], ["двері", 3])

    def test_parse_verb_imperfective(self):
        data = parse_verb_imperfective_table(HTML_V_IMP, "висіти")
        self.assertEqual(data["asp"], "imperfectif")
        # infinitif : on choisit la première position (ici 2)
        self.assertEqual(data["inf"], [["висіти", 2]])
        # présent 3p sing/plur
        self.assertIn("pres", data["conj"])
        self.assertIn("3p", data["conj"]["pres"])
        self.assertTrue(len(data["conj"]["pres"]["3p"]["s"]) >= 1)
        self.assertTrue(len(data["conj"]["pres"]["3p"]["pl"]) >= 1)

    def test_parse_verb_perfective(self):
        data = parse_verb_perfective_table(HTML_V_PERF, "відбутися")
        self.assertEqual(data["asp"], "perfectif")
        # infin « відбу́тися » → accent sur « у », position 5
        self.assertEqual(data["inf"], [["відбутися", 5]])
        # futur 2p sing doit être renseigné
        self.assertIn("fut", data["conj"])
        self.assertIn("2p", data["conj"]["fut"])
        self.assertTrue(len(data["conj"]["fut"]["2p"]["s"]) >= 1)
        # passé masculin sing/plur
        self.assertIn("pass", data["conj"])
        self.assertIn("m", data["conj"]["pass"])
        self.assertTrue(len(data["conj"]["pass"]["m"]["s"]) >= 1)
        self.assertTrue(len(data["conj"]["pass"]["m"]["pl"]) >= 1)


if __name__ == "__main__":
    unittest.main()
