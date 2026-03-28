# Enrichissement des données — double protocole

## Vue d'ensemble

L'enrichissement de `static/data.json` suit deux protocoles distincts selon le contexte. Dans les deux cas, **goroh.pp.ua est la source primaire** pour les paradigmes et les accents.

---

## Protocole 1 : Ajout direct (IA)

Quand Claude Code ajoute ou modifie directement des entrées dans `data.json`.

### Quand l'utiliser
- Ajout ponctuel d'un mot
- Correction d'un paradigme existant
- Enrichissement (comparatifs, superlatifs, formes manquantes)

### Marquage
- **`"automate": true`** dans le bloc `meta` — ces entrées ne passent pas par relecture humaine et doivent être identifiables

### Source
- Paradigmes et accents **depuis goroh.pp.ua** (`https://goroh.pp.ua/Словник/<mot>`)
- Ne PAS inventer les accents (ils sont souvent irréguliers et mobiles en ukrainien)

### Structure de l'entrée
```json
{
  "meta": { "pos": "noun", "gender": "f", "automate": true },
  "cas": { "nom": { "sg": [["машина", 4]], "pl": [["машини", 4]] }, ... },
  "nooj": { "line": null, "status": null, "flx": null }
}
```

- Formes : `[["texte", accentPosition], ...]` — accent 1-based, `-1` monosyllabe, `-2` inconnu
- Passé pluriel des verbes : remplir `past.f.pl` et `past.n.pl` (= même forme que `past.m.pl`)
- Comparatifs/superlatifs : blocs optionnels `comp` et `super` (même structure que `cas`)

### Vérifications obligatoires
```bash
# 1. getLemmaEntry retourne une forme non-null
node -e "const d=JSON.parse(require('fs').readFileSync('static/data.json','utf8')); console.log(d['noun']['LEMME']?.cas?.nom?.sg);"

# 2. Cohérence data-info ↔ paradigmes
python3 outil_python/validation/verify_phrases.py

# 3. Schéma V2
python3 outil_python/validation/validate_v2.py

# 4. Tests
npm run test
cd outil_python/goroh && python3 -m unittest discover
cd outil_python/enrichissement && python3 -m unittest discover
cd outil_python/validation && python3 -m unittest discover
```

---

## Protocole 2 : Batch via `outil_python/enrichissement/`

Pour ajouter plusieurs mots d'un coup depuis des phrases annotées, avec **relecture humaine garantie**.

### Quand l'utiliser
- Ajout d'un lot de phrases avec des mots nouveaux
- Régénération de paradigmes depuis goroh pour des entrées non validées

### Workflow

```
phrases_a_traiter.json   →   build_entries_from_phrases.py   →   out.json + rapport HTML
                                        ↓                              ↓
                                   scrape goroh               relecture humaine
                                                                       ↓
                                                              intégration dans data.json
```

1. Mettre les phrases annotées dans `outil_python/enrichissement/input/phrases_a_traiter.json`
2. Générer les entrées :
   ```bash
   python3 outil_python/enrichissement/build_entries.py
   ```
3. Examiner `outil_python/enrichissement/output/out.json` et `output/entries_report.html` (relecture humaine)
4. Insérer dans data.json (tri alphabétique ukrainien automatique) :
   ```bash
   python3 outil_python/enrichissement/merge_entries.py --dry-run   # prévisualisation
   python3 outil_python/enrichissement/merge_entries.py              # insertion effective
   ```
5. Lancer les vérifications (même que protocole 1)

### Marquage
- **Pas de `automate: true`** — la relecture humaine est garantie par le workflow (out.json → validation → intégration)

### Comportement du script

| Situation | Action |
|---|---|
| Lemme absent de data.json | Scrape goroh, crée une nouvelle entrée |
| Lemme présent, `nooj` validé (line/status/flx non-null) | **Ignoré** (entrée déjà relue) |
| Lemme présent, `nooj` vide | Paradigme **régénéré** depuis goroh, données annexes **préservées** |

**Données préservées** lors de la régénération : `phrases`, `meta` (fusionné), `traduction`, tout champ non-paradigmatique.

**Données remplacées** : `cas`, `conj`, `inf`, `base`, `comp`, `super` (paradigme pur).

### Format de `phrases_a_traiter.json`
```json
{
  "Phrase en ukrainien": {
    "phrase_html": "<span class=\"ukr\" data-info=\"lemme;pos=noun;case=nom;number=sg\">mot</span>...",
    "traduction": "Traduction en français",
    "ref": { "article": "source" }
  }
}
```

---

## Convention : passé pluriel dans les phrases

Les `data-info` des verbes au passé pluriel doivent inclure `gender=m` (convention) car `resolveEntry` navigue `conj.past.{gender}.pl`.

Exemple : `бути;pos=verb;verbForm=fin;tense=past;gender=m;number=pl`

---

## Scripts de vérification

| Script | Rôle |
|---|---|
| `validation/verify_phrases.py` | Cross-référence data-info ↔ paradigmes (0 auto-correction attendu) |
| `validation/validate_v2.py` | Validation structurelle du schéma V2 |
| `enrichissement/build_entries.py` | Génération d'entrées depuis goroh (batch) |
| `enrichissement/merge_entries.py` | Insertion ordonnée de out.json dans data.json (tri ukrainien) |

---

## Champ `nooj` — signification

Le champ `nooj` dans chaque entrée sert de marqueur de relecture humaine :

| Valeur | Signification |
|---|---|
| `{"line": null, "status": null, "flx": null}` | Entrée non relue (éligible à régénération) |
| `{"line": "NOUN+FLX=X", "status": "pending", ...}` | Entrée en cours de relecture |
| `{"line": "...", "status": "ok", "flx": "..."}` | Entrée validée (ignorée par build_entries) |
| `""` (string vide, legacy) | Non relue |
| `"contenu"` (string non-vide, legacy) | Relue |
