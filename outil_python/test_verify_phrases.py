"""Tests pour verify_phrases.py — vérifie la cohérence data-info / paradigmes."""
import os
import unittest

from verify_phrases import verify


class TestVerifyPhrases(unittest.TestCase):
    """Exécute la vérification complète et vérifie qu'il n'y a aucune correction auto."""

    @classmethod
    def setUpClass(cls):
        script_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(script_dir)
        cls.phrases_path = os.path.join(project_root, "static", "phrases.json")
        cls.data_path = os.path.join(project_root, "static", "data.json")
        cls.issues, cls.stats = verify(cls.phrases_path, cls.data_path)
        cls.auto_issues = [i for i in cls.issues if i["auto"]]

    def test_no_auto_correctable_issues(self):
        """Aucune balise data-info ne devrait nécessiter de correction automatique."""
        if self.auto_issues:
            details = "\n".join(
                f"  - {i['form']}: {i['old_info']} → {i['new_info']} ({i['msg']})"
                for i in self.auto_issues
            )
            self.fail(f"{len(self.auto_issues)} correction(s) auto détectée(s) :\n{details}")

    def test_no_structural_errors(self):
        """Aucune erreur structurelle dans les data-info."""
        structural = [i for i in self.issues if i["type"] == "STRUCTURAL"]
        if structural:
            details = "\n".join(
                f"  - {i['form']}: {i['old_info']}" for i in structural
            )
            self.fail(f"{len(structural)} erreur(s) structurelle(s) :\n{details}")


if __name__ == "__main__":
    unittest.main()
