import json


def extract_json(file):
    """
    Extrait les phrases du fichier data.json et les met dans un fichier phrases.json
    (phase intérmédiaire pour la génération de la base de données)
    """
    with open(file, 'r') as f:
        data = json.load(f)
        phrases = {}
        for key in data:
            for name in data[key]:
                if "phrases" in data[key][name]:
                    for phrase in data[key][name]["phrases"]:
                        phrases[phrase] = data[key][name]["phrases"][phrase] 
        with open('phrases.json', 'w', encoding='utf-8') as f:
            json.dump(phrases, f, ensure_ascii=False, indent=4)
        

extract_json('data.json')