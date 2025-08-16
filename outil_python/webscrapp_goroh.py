
import json
import re
import requests
import unicodedata
from bs4 import BeautifulSoup

# Exemple de contenu HTML
html_content = """
<div class="list">
      <span id="shortcut-1" display="none"></span>
      <div class="article-block" id="126427">
        <div class="page__sub-header">
          <h2>
            бі́льший
              <span class="short-interpret">від: вели́кий</span>
          </h2>
        </div>
        <div class="taglist">
            <a class="tag " href="/Словозміна/[прикметник]">
              прикметник
            </a>
            <a class="tag " href="/Словозміна/[прикметник | тверда група]">
              тверда група
            </a>
            <a class="tag " href="/Словозміна/[вищий ст. п.]">
              вищий ст. п.
            </a>
        </div>



<div class="table-wrapper">
    <table class="table">
        <tbody>
            <tr class="row column-header">
                <td class="cell">відмінок</td>
                <td class="cell" title="чоловічий рід">чол. р.</td>
                <td class="cell" title="жіночий рід">жін. р.</td>
                <td class="cell" title="середній рід">сер. р.</td>
                <td class="cell">множина</td>
            </tr>
            <tr class="row">
                <td class="cell header">називний</td>
                <td class="cell"><span class="word searched-word ">бі́льший</span></td>
                <td class="cell"><span class="word ">бі́льша</span>, <span class="word " title="Видовжена форма">більшая</span></td>
                <td class="cell"><span class="word ">бі́льше</span>, <span class="word " title="Видовжена форма">більшеє</span></td>
                <td class="cell"><span class="word ">бі́льші</span>, <span class="word " title="Видовжена форма">більшії</span></td>
            </tr>
            <tr class="row">
                <td class="cell header">родовий</td>
                <td class="cell"><span class="word ">бі́льшого</span></td>
                <td class="cell"><span class="word ">бі́льшої</span></td>
                <td class="cell"><span class="word ">бі́льшого</span></td>
                <td class="cell"><span class="word ">бі́льших</span></td>
            </tr>
            <tr class="row">
                <td class="cell header">давальний</td>
                <td class="cell"><span class="word ">бі́льшому</span></td>
                <td class="cell"><span class="word ">бі́льшій</span></td>
                <td class="cell"><span class="word ">бі́льшому</span></td>
                <td class="cell"><span class="word ">бі́льшим</span></td>
            </tr>
            <tr class="row">
                <td class="cell header">знахідний</td>
                <td class="cell"><span class="word searched-word " title="Використовується з неістотами">бі́льший</span>, <span class="word " title="Використовується з істотами">бі́льшого</span></td>
                <td class="cell"><span class="word ">бі́льшу</span>, <span class="word " title="Видовжена форма">більшую</span></td>
                <td class="cell"><span class="word ">бі́льше</span>, <span class="word " title="Видовжена форма">більшеє</span></td>
                <td class="cell"><span class="word " title="Використовується з істотами">бі́льших</span>, <span class="word " title="Використовується з неістотами">бі́льші</span>, <span class="word " title="Видовжена форма">більшії</span></td>
            </tr>
            <tr class="row">
                <td class="cell header">орудний</td>
                <td class="cell"><span class="word ">бі́льшим</span></td>
                <td class="cell"><span class="word ">бі́льшою</span></td>
                <td class="cell"><span class="word ">бі́льшим</span></td>
                <td class="cell"><span class="word ">бі́льшими</span></td>
            </tr>
            <tr class="row">
                <td class="cell header">місцевий</td>
                <td class="cell"><span class="word ">бі́льшому</span>, <span class="word ">бі́льшім</span></td>
                <td class="cell"><span class="word ">бі́льшій</span></td>
                <td class="cell"><span class="word ">бі́льшому</span>, <span class="word ">бі́льшім</span></td>
                <td class="cell"><span class="word ">бі́льших</span></td>
            </tr>

                <tr class="row">
                    <td class="cell header">кличний</td>
                    <td class="cell"><span class="word searched-word ">бі́льший</span></td>
                    <td class="cell"><span class="word " title="Видовжена форма">більшая</span>, <span class="word ">бі́льша</span></td>
                    <td class="cell"><span class="word " title="Видовжена форма">більшеє</span>, <span class="word ">бі́льше</span></td>
                    <td class="cell"><span class="word " title="Видовжена форма">більшії</span>, <span class="word ">бі́льші</span></td>
                </tr>

        </tbody>
    </table>
</div>
      </div>
  </div>
"""

#importer le fichier json data.json (qui est dans le dossier parent)

with open('data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)


entree_nom="""
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
			<tr class="row">
				<td class="cell header">родовий</td>
				<td class="cell">—</td>
				<td class="cell"><span class="word ">двере́й</span></td>
			</tr>
			<tr class="row">
				<td class="cell header">давальний</td>
				<td class="cell">—</td>
				<td class="cell"><span class="word ">две́рям</span></td>
			</tr>
			<tr class="row">
				<td class="cell header">знахідний</td>
				<td class="cell">—</td>
				<td class="cell"><span class="word searched-word ">две́рі</span></td>
			</tr>
			<tr class="row">
				<td class="cell header">орудний</td>
				<td class="cell">—</td>
				<td class="cell"><span class="word ">двери́ма</span>, <span class="word ">дверми́</span></td>
			</tr>
			<tr class="row">
				<td class="cell header">місцевий</td>
				<td class="cell">—</td>
				<td class="cell"><span class="word ">две́рях</span></td>
			</tr>
			<tr class="row">
				<td class="cell header">кличний</td>
				<td class="cell">—</td>
				<td class="cell"><span class="word searched-word ">две́рі</span></td>
			</tr>
		</tbody>
	</table>
"""

entree_verbe="""
<table class="table">
		<tbody>
			<tr class="row">
				<td class="cell header">Інфінітив</td>
				<td colspan="2" class="cell" style="text-align: center;padding-right: 110px;"><span class="word searched-word ">ви́сі́ти</span>, <span class="word " title="Коротка форма">висіть</span></td>
			</tr>
			<tr class="row column-header">
				<td class="cell">&nbsp;</td>
				<td class="cell">Однина</td>
				<td class="cell">Множина</td>
			</tr>
			<tr class="row subgroup-header">
				<td colspan="3" class="cell ta-center">Наказовий спосіб</td>
			</tr>
			<tr class="row">
				<td class="cell header">1 особа</td>
				<td class="cell">&nbsp;</td>
				<td class="cell"><span class="word ">висі́м</span>, <span class="word ">висі́мо</span></td>
			</tr>
			<tr class="row">
				<td class="cell header">2 особа</td>
				<td class="cell"><span class="word ">виси́</span>, <span class="word ">виси́-но</span></td>
				<td class="cell"><span class="word ">висі́ть</span></td>
			</tr>
			<tr class="row subgroup-header">
				<td colspan="3" class="cell ta-center">Майбутній час</td>
			</tr>
			<tr class="row">
				<td class="cell header">1 особа</td>
				<td class="cell"><span class="word ">ви́сі́тиму</span></td>
				<td class="cell"><span class="word ">ви́сі́тимем</span>, <span class="word ">ви́сі́тимемо</span></td>
			</tr>
			<tr class="row">
				<td class="cell header">2 особа</td>
				<td class="cell"><span class="word ">ви́сі́тимеш</span></td>
				<td class="cell"><span class="word ">ви́сі́тимете</span></td>
			</tr>
			<tr class="row">
				<td class="cell header">3 особа</td>
				<td class="cell"><span class="word ">ви́сі́тиме</span></td>
				<td class="cell"><span class="word ">ви́сі́тимуть</span></td>
			</tr>
				<tr class="row subgroup-header">
					<td colspan="3" class="cell ta-center">Теперішній час</td>
				</tr>
				<tr class="row">
					<td class="cell header">1 особа</td>
					<td class="cell"><span class="word ">ви́шу</span></td>
					<td class="cell"><span class="word " title="Просторічна форма">ви́сим</span>, <span class="word ">ви́симо</span></td>
				</tr>
				<tr class="row">
					<td class="cell header">2 особа</td>
					<td class="cell"><span class="word ">ви́сиш</span></td>
					<td class="cell"><span class="word ">ви́сите</span></td>
				</tr>
				<tr class="row">
					<td class="cell header">3 особа</td>
					<td class="cell"><span class="word ">ви́сить</span></td>
					<td class="cell"><span class="word ">ви́сять</span></td>
				</tr>
			<tr class="row subgroup-header">
				<td colspan="3" class="cell ta-center">Минулий час</td>
			</tr>
			<tr class="row">
				<td class="cell header">чол. р.</td>
				<td class="cell"><span class="word ">ви́сі́в</span></td>
				<td rowspan="3" class="cell light-cell"><span class="word ">ви́сі́ли</span></td>
			</tr>
			<tr class="row">
				<td class="cell header">жін. р.</td>
				<td class="cell"><span class="word ">ви́сі́ла</span></td>
			</tr>
			<tr class="row">
				<td class="cell header">сер. р.</td>
				<td class="cell"><span class="word ">ви́сі́ло</span></td>
			</tr>
		</tbody>
	</table>
"""

entree_verbe_perfectif="""
<table class="table">
		<tbody>
			<tr class="row">
				<td class="cell header">Інфінітив</td>
				<td colspan="2" class="cell" style="text-align: center;padding-right: 110px;"><span class="word ">відбу́тись</span>, <span class="word searched-word ">відбу́тися</span>, <span class="word " title="Коротка форма">відбуться</span></td>
			</tr>
			<tr class="row column-header">
				<td class="cell">&nbsp;</td>
				<td class="cell">Однина</td>
				<td class="cell">Множина</td>
			</tr>
			<tr class="row subgroup-header">
				<td colspan="3" class="cell ta-center">Наказовий спосіб</td>
			</tr>
			<tr class="row">
				<td class="cell header">1 особа</td>
				<td class="cell">&nbsp;</td>
				<td class="cell"><span class="word ">відбу́дьмось</span>, <span class="word ">відбу́дьмося</span></td>
			</tr>
			<tr class="row">
				<td class="cell header">2 особа</td>
				<td class="cell"><span class="word ">відбу́дься</span></td>
				<td class="cell"><span class="word ">відбу́дьтесь</span>, <span class="word ">відбу́дьтеся</span></td>
			</tr>
			<tr class="row subgroup-header">
				<td colspan="3" class="cell ta-center">Майбутній час</td>
			</tr>
			<tr class="row">
				<td class="cell header">1 особа</td>
				<td class="cell"><span class="word ">відбу́дусь</span>, <span class="word ">відбу́дуся</span></td>
				<td class="cell"><span class="word ">відбу́демось</span>, <span class="word ">відбу́демося</span>, <span class="word " title="Просторічна форма">відбу́демся</span></td>
			</tr>
			<tr class="row">
				<td class="cell header">2 особа</td>
				<td class="cell"><span class="word ">відбу́дешся</span></td>
				<td class="cell"><span class="word ">відбу́детесь</span>, <span class="word ">відбу́детеся</span></td>
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
				<td class="cell"><span class="word ">відбу́всь</span>, <span class="word ">відбу́вся</span></td>
				<td rowspan="3" class="cell light-cell"><span class="word ">відбули́сь</span>, <span class="word ">відбули́ся</span></td>
			</tr>
			<tr class="row">
				<td class="cell header">жін. р.</td>
				<td class="cell"><span class="word ">відбула́сь</span>, <span class="word ">відбула́ся</span></td>
			</tr>
			<tr class="row">
				<td class="cell header">сер. р.</td>
				<td class="cell"><span class="word ">відбуло́сь</span>, <span class="word ">відбуло́ся</span></td>
			</tr>
		</tbody>
	</table>
"""

############################################################################################################

import urllib.parse

# URL de base
base_url = "https://goroh.pp.ua/Словозміна/"

def fetch_html(mot):
    # Encodage de la partie du chemin pour gérer les caractères non-ASCII
    encoded_mot = urllib.parse.quote(mot)
    path = urllib.parse.urljoin(base_url, encoded_mot)
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                      'AppleWebKit/537.36 (KHTML, like Gecko) '
                      'Chrome/117.0.0.0 Safari/537.36'
    }
    
    response = requests.get(path, headers=headers)
    
    if response.status_code == 200:
        return response.text
    else:
        raise Exception(f"Erreur lors de la récupération de la page : {response.status_code}")



def extract_article_blocks(html):
    soup = BeautifulSoup(html, 'lxml')  # Utilise le parser lxml pour une meilleure performance
    articles = []

    # Trouver tous les éléments avec la classe "article-block"
    article_blocks = soup.find_all('div', class_='article-block')

    for block in article_blocks:
        article = {}
        
        # Récupérer l'ID de l'article
        article_id = block.get('id', None)
        article['id'] = article_id

        # Récupérer les tags
        tags = block.find_all('a', class_='tag')
        tag_list = [tag.get_text(strip=True) for tag in tags]
        article['tags'] = tag_list

        # Récupérer le contenu de "table-wrapper" s'il existe
        table = block.find('table', class_='table')
        if table:
            # Vous pouvez choisir de récupérer le HTML brut ou de le traiter davantage
            article['table'] = table.prettify()
        else:
            article['table'] = None

        articles.append(article)

    return articles

def parse_ukrainian_word_accent_policy(raw_word: str):
    """
    Analyse un mot ukrainien potentiellement accentué et retourne un tuple (mot_sans_accent, posAccent)
    * posAccent = -1 si aucun accent
    * posAccent = -2 s'il y a plus d'un accent
    * sinon, position (1-based) de l'accent
    Rappels :
      - L'accent ukrainien se marque souvent par le caractère combiné U+0301
        (ex. бі́льший = ['б', 'і', '\u0301', 'л', 'ь', 'ш', 'и', 'й'])
    """
    # Normaliser en NFD pour repérer plus facilement les accents combinés
    nfd_word = unicodedata.normalize("NFD", raw_word)
    
    # Trouver *tous* les indices où se situe l'accent combiné
    accent_positions = []
    start = 0
    while True:
        idx = nfd_word.find('\u0301', start)
        if idx == -1:
            break
        accent_positions.append(idx)
        start = idx + 1

    # Selon le nombre d'accents trouvés
    nb_accents = len(accent_positions)
    if nb_accents == 0:
        # Aucun accent
        pos_accent = -1
        word_clean = raw_word
    elif nb_accents > 1:
        # Plus d'un accent → on choisit -2
        pos_accent = -2
        # On retire tous les accents pour le mot "clean"
        word_no_accents = nfd_word.replace('\u0301', '')
        word_clean = unicodedata.normalize("NFC", word_no_accents)
    else:
        # Un seul accent
        # L'accent combiné est juste après la voyelle accentuée,
        # donc son index dans la string NFD correspond au "point d'accent".
        only_idx = accent_positions[0]
        # Reconstruisons le mot sans l'accent
        word_no_accents = nfd_word[:only_idx] + nfd_word[only_idx+1:]
        word_clean = unicodedata.normalize("NFC", word_no_accents)

        # Calculer la position "1-based" : 
        # On compte le nombre de *lettres recomposées* dans word_clean
        # qui se trouvent avant le point d'accent. 
        # Une approche simple : on tronque la NFD juste avant l'accent
        # puis on re-NFC et on prend la longueur (en "vrais" caractères).
        truncated_nfd = nfd_word[:only_idx]
        truncated_clean = unicodedata.normalize("NFC", truncated_nfd)
        pos_accent = len(truncated_clean)  # c'est déjà "1-based" car on compte les chars

    return word_clean, pos_accent

# Association entre l'intitulé ukrainien et le code JSON
case_map = {
    "називний": "nomi",
    "родовий": "gen",
    "давальний": "dat",
    "знахідний": "acc",
    "орудний": "ins",
    "місцевий": "loc",
    "кличний": "voc"
}

def parse_table_adj(html_content: str):
    """
    Parse le tableau HTML et retourne la structure JSON demandée.
    """
    soup = BeautifulSoup(html_content, "html.parser")
    
    # Ordre des colonnes : [відмінок, чол. р., жін. р., сер. р., множина]
    # On veut récupérer un dico de la forme:
    # {
    #   "cas": {
    #       "nomi": {"m": [...], "f": [...], "n": [...], "pl": [...]},
    #       "gen":  {"m": [...], "f": [...], "n": [...], "pl": [...]},
    #       ...
    #   }
    # }
    
    result = {"cas": {}}
    
    # Trouver toutes les lignes qui ne sont pas l'en-tête principale
    # On saute la ligne "column-header"
    rows = soup.find("table", class_="table").find("tbody").find_all("tr", class_="row")
    
    for row in rows:
        cells = row.find_all("td", class_="cell")
        if not cells:
            continue
        
        # La première cellule contient le nom du cas
        case_uk = cells[0].text.strip().lower()  # par ex. "називний"
        # On retrouve la clé (ex. "nomi")
        case_key = case_map.get(case_uk)
        if not case_key:
            continue
        
        # Initialise la structure pour ce cas
        result["cas"].setdefault(case_key, {})
        result["cas"][case_key].setdefault("m", [])
        result["cas"][case_key].setdefault("f", [])
        result["cas"][case_key].setdefault("n", [])
        result["cas"][case_key].setdefault("pl", [])
        
        # Les 4 cellules suivantes correspondent à m, f, n, pl
        # On boucle sur (index, genre_key) pour plus de clarté
        for col_idx, gender_key in enumerate(["m", "f", "n", "pl"], start=1):
            # Récupère la liste de spans de la cellule correspondante
            span_words = cells[col_idx].find_all("span", class_="word")
            
            # Pour chacun, on parse le mot et sa position d'accent
            # Les mots peuvent être séparés par des virgules dans le HTML,
            # mais la technique la plus sûre est de prendre directement
            # chaque <span class="word">.
            all_forms_for_gender = []
            
            for span in span_words:
                text = span.get_text(strip=True)
                clean_word, accent_pos = parse_ukrainian_word_accent_policy(text)
                if accent_pos is not None:
                    all_forms_for_gender.append(clean_word)
                    all_forms_for_gender.append(accent_pos)
                else:
                    # S'il n'y a pas d'accent, on peut mettre 0 ou None
                    # Mais ici, dans l’exemple, toutes les formes sont accentuées
                    # On met quand même quelque chose au cas où
                    all_forms_for_gender.append(clean_word)
                    all_forms_for_gender.append(0)
            
            # On stocke la liste dans la structure de sortie
            result["cas"][case_key][gender_key] = all_forms_for_gender
    
    return result

def parse_table_nom(html_content: str, lemma: str = None):
    """
    Parse un tableau HTML de nom ukrainien (відмінок / однина / множина).
    Retourne un dictionnaire de la forme :
    
      {
        "cas": {
          "nomi": {"s": [...], "pl": [...]},
          "gen":  {"s": [...], "pl": [...]},
          ...
        }
      }
    
    Avec la gestion spéciale des cases '—' => [None, -2].
    
    Paramètres :
    -----------
    - html_content : str, le code HTML de la table
    - lemma : str ou None, le lemme du nom (ex. "двері") si vous souhaitez l’inclure
              dans la structure de sortie. 
    """
    soup = BeautifulSoup(html_content, "html.parser")
    
    
    # On initialise la structure de sortie
    # (si lemma est fourni, on fait {"lemma": "...", "cas": {...}} ou autre)
    if lemma:
        result = {lemma: {"cas": {}}}
        cas_dict = result[lemma]["cas"]
    else:
        result = {"cas": {}}
        cas_dict = result["cas"]
    
    # Récupération des lignes (skip la ligne .column-header)
    table = soup.find("table", class_="table")
    rows = table.find("tbody").find_all("tr", class_="row")
    
    for row in rows:
        cells = row.find_all("td", class_="cell")
        if not cells:
            continue
        
        # 1re cellule = nom du відмінок
        case_uk = cells[0].text.strip().lower()  # ex. "називний"
        case_key = case_map.get(case_uk)
        if not case_key:
            continue  # ignore si inconnu
        
        # On prépare un sous-dict pour ce cas
        cas_dict.setdefault(case_key, {})
        cas_dict[case_key].setdefault("s", [])   # singular
        cas_dict[case_key].setdefault("pl", [])  # plural
        
        # Seconde cellule => однина
        singular_cell = cells[1]
        # Troisième cellule => множина
        plural_cell = cells[2]
        
        # --- Traitement singulier ---
        forms_singular = []
        if singular_cell.get_text(strip=True) == "—":
            # Cas du tiret => on enregistre [None, -2]
            forms_singular.extend([None, -2])
        else:
            # Extraire toutes les <span class="word">
            sing_spans = singular_cell.find_all("span", class_="word")
            for span in sing_spans:
                text = span.get_text(strip=True)
                clean_word, accent_pos = parse_ukrainian_word_accent_policy(text)
                if accent_pos is not None:
                    forms_singular.append(clean_word)
                    forms_singular.append(accent_pos)
                else:
                    # Pas d’accent => on peut mettre [word, 0], au choix
                    forms_singular.append(clean_word)
                    forms_singular.append(0)
        
        # --- Traitement pluriel ---
        forms_plural = []
        if plural_cell.get_text(strip=True) == "—":
            # Si jamais ça existait, pareil (ex. un mot sans forme pluriel)
            forms_plural.extend([None, -2])
        else:
            pl_spans = plural_cell.find_all("span", class_="word")
            for span in pl_spans:
                text = span.get_text(strip=True)
                clean_word, accent_pos = parse_ukrainian_word_accent_policy(text)
                if accent_pos is not None:
                    forms_plural.append(clean_word)
                    forms_plural.append(accent_pos)
                else:
                    forms_plural.append(clean_word)
                    forms_plural.append(0)
        
        # On enregistre dans la structure
        cas_dict[case_key]["s"] = forms_singular
        cas_dict[case_key]["pl"] = forms_plural
    
    return result

def parse_table_verbe_imperfectif_old(html_content: str):
    """
    Parse le tableau HTML d'un verbe imperfectif et retourne la structure JSON décrite.
    """
    soup = BeautifulSoup(html_content, "html.parser")
    
    # 1) Récupérer l’infinitif dans la ligne "Інфінітив"
    infinitive_cell = soup.find("td", class_="cell header", string="Інфінітив")
    # Normalement c'est la <td class="cell header">Інфінітив</td>
    # Le <td suivant (colspan="2") contient le verbe
    inf_data = ["", -1]  # par défaut
    if infinitive_cell:
        # Cherchons la cellule suivante
        # <td colspan="2" ...> <span class="word searched-word">ви́сі́ти</span>, ...
        next_td = infinitive_cell.find_next_sibling("td")
        if next_td:
            # Prendre tous les <span class="word"> de cet endroit
            spans = next_td.find_all("span", class_="word")
            if spans:
                # On ne prend que le premier verbe de la liste pour "inf"
                # (ex. "ви́сі́ти", "висіть" => le 1er est l'infinitif).
                raw_inf = spans[0].get_text(strip=True)
                clean_inf, pos_inf = parse_ukrainian_word_accent_policy(raw_inf)
                inf_data = [clean_inf, pos_inf]

    # 2) Préparer la structure
    result = {
        "inf": inf_data,      # ex. ["висіти", 2]
        "conj": {
            "imp":  {},
            "fut":  {},
            "pres": {},
            "pass": {}
        },
        "asp": "imperfectif"
    }
    
    # Pour la conjugaison, on va repérer des blocs <tr class="row subgroup-header">
    # qui contiennent un titre comme "Наказовий спосіб", "Майбутній час", "Теперішній час", "Минулий час"
    mode_map = {
        "Наказовий спосіб": "imp",
        "Майбутній час": "fut",
        "Теперішній час": "pres",
        "Минулий час": "pass"
    }
    
    # Pour les personnes & genres
    # 1 особа => "1p"
    # 2 особа => "2p"
    # 3 особа => "3p"
    # чол. р. => "m"
    # жін. р. => "f"
    # сер. р. => "n"
    person_map = {
        "1 особа": "1p",
        "2 особа": "2p",
        "3 особа": "3p",
        "чол. р.": "m",
        "жін. р.": "f",
        "сер. р.": "n"
    }
    
    # Petit utilitaire pour initialiser la sous-structure { "s": [], "pl": [] }
    def ensure_sp_structure(dct, person_key):
        if person_key not in dct:
            dct[person_key] = {"s": [], "pl": []}
        return dct[person_key]
    
    # Pour le "passé" (M, F, N), on veut stocker { "s": [], "pl": [] } 
    # Ex. "pass": { "m": {"s": [...], "pl": [...]}, "f": {...}, "n": {...} }
    def ensure_mfn_structure(dct, gender_key):
        if gender_key not in dct:
            dct[gender_key] = {"s": [], "pl": []}
        return dct[gender_key]
    
    current_mode_key = None  # "imp", "fut", "pres", ou "pass"
    
    # Parcourir tous les <tr class="row"> (on ignore ceux qui contiennent "Інфінітив")
    rows = soup.find_all("tr", class_="row")
    
    for row in rows:
        # Vérifier si c'est un "subgroup-header"
        if "subgroup-header" in row.get("class", []):
            # On récupère le texte (ex. "Наказовий спосіб")
            mode_uk = row.get_text(strip=True)
            # Retrouver la clé
            current_mode_key = mode_map.get(mode_uk, None)
            continue
        
        # Si pas un subgroup-header, on est dans une ligne de données
        cells = row.find_all("td", class_="cell")
        if not cells:
            continue
        
        # Le premier td est la "cell header" => ex. "1 особа", "2 особа", "чол. р."...
        header_cell = cells[0].text.strip()
        
        # Selon current_mode_key, on va parser différemment
        if current_mode_key in ("imp", "fut", "pres"):
            # Pour ces modes, on a 3 colonnes : 
            #  - 1re col = "1 особа"/"2 особа"/"3 особа"
            #  - 2e col = forme(s) singulier
            #  - 3e col = forme(s) pluriel
            if len(cells) < 3:
                continue
            
            person_key = person_map.get(header_cell, None)
            if not person_key:
                # Parfois, il peut y avoir une ligne vide («&nbsp;»), on ignore
                continue
            
            # On assure la structure conj[current_mode_key][person_key] = { "s": [...], "pl": [...] }
            slot = ensure_sp_structure(result["conj"][current_mode_key], person_key)

            # Cellule 2 (singulier) / Cellule 3 (pluriel)
            singular_td = cells[1]
            plural_td   = cells[2]
            
            # Extraire les mots du singulier
            singular_spans = singular_td.find_all("span", class_="word")
            forms_s = []
            for sp in singular_spans:
                txt = sp.get_text(strip=True)
                clean, pos = parse_ukrainian_word_accent_policy(txt)
                forms_s.append(clean)
                forms_s.append(pos)
            # S'il n'y a pas de span => rien
            if not singular_spans:
                # On peut choisir de stocker [None, -1] ou [None, -2], ou [null, -2] 
                # selon la convention pour « pas de forme ».
                # Dans votre exemple, vous faites parfois [null, -2].
                # On peut donc le faire si on veut marquer "inexistant".
                forms_s = [None, -2]  # ex.

            # Extraire les mots du pluriel
            plural_spans = plural_td.find_all("span", class_="word")
            forms_p = []
            for sp in plural_spans:
                txt = sp.get_text(strip=True)
                clean, pos = parse_ukrainian_word_accent_policy(txt)
                forms_p.append(clean)
                forms_p.append(pos)
            if not plural_spans:
                forms_p = [None, -2]
            
            slot["s"] = forms_s
            slot["pl"] = forms_p
        
        elif current_mode_key == "pass":
            # Pour le "Минулий час", la structure est différente.
            # On a un bloc 3 lignes (chol. r., zhin. r., ser. r.) 
            # + la colonne du pluriel potentiellement mutualisée (rowspan).
            # ex. :
            #   <td class="cell header">чол. р.</td>
            #   <td class="cell">ви́сі́в</td>
            #   <td rowspan="3" class="cell light-cell">ви́сі́ли</td>
            
            # => 1) "chol. r." => "m", 2) "zhin. r." => "f", 3) "ser. r." => "n"
            gender_key = person_map.get(header_cell, None)
            if not gender_key:
                # ligne inutile
                continue
            
            # On initialise conj["pass"]["m"] = { "s": [], "pl": [] } etc.
            slot = ensure_mfn_structure(result["conj"]["pass"], gender_key)
            
            # On suppose que la 2e cellule = singulier
            # et la 3e cellule = pluriel (sauf si elle est "rowspan=3").
            
            # Cas simple : la 2e cellule (singulier)
            if len(cells) >= 2:
                sing_spans = cells[1].find_all("span", class_="word")
                forms_s = []
                if sing_spans:
                    for sp in sing_spans:
                        txt = sp.get_text(strip=True)
                        clean, pos = parse_ukrainian_word_accent_policy(txt)
                        forms_s.append(clean)
                        forms_s.append(pos)
                else:
                    # s'il n'y a pas de forme
                    forms_s = [None, -2]
                slot["s"] = forms_s
            
            # Cas pluriel -> on essaye la 3e cellule, 
            # mais attention au "rowspan" qui peut affecter les lignes suivantes
            if len(cells) == 3:
                # Si on est sur la première ligne (чол. р.), la 3e cell est peut-être "rowspan=3"
                # Donc on la lit pour le pluriel
                plur_spans = cells[2].find_all("span", class_="word")
                forms_p = []
                for sp in plur_spans:
                    txt = sp.get_text(strip=True)
                    clean, pos = parse_ukrainian_word_accent_policy(txt)
                    forms_p.append(clean)
                    forms_p.append(pos)
                if not plur_spans:
                    forms_p = [None, -2]
                slot["pl"] = forms_p
            else:
                # Sur les lignes 2 et 3 (fém. et neutre), la 3e cellule n'est pas présente
                # car déjà occupée par le "rowspan". Du coup, on ne modifie pas le "pl" (il est déjà rempli).
                pass
            
        else:
            # On n’est pas dans un bloc qu’on gère ?
            continue
    
    return result

def remove_all_accents(word: str) -> str:
    """
    Supprime tous les accents combinés U+0301 d'une chaîne,
    puis renormalise en NFC.
    """
    nfd_word = unicodedata.normalize("NFD", word)
    no_accent = nfd_word.replace('\u0301', '')
    return unicodedata.normalize("NFC", no_accent)


def parse_verb_perfective_table(html_content: str, main_infinitive: str):
    """
    Parse le tableau HTML d'un verbe perfectif et retourne la structure JSON voulue,
    en repérant l'accent réel de `main_infinitive` dans la liste d'infinitifs du tableau.

    Paramètres
    ----------
    html_content : str
        Le code HTML du tableau
    main_infinitive : str
        L’infinitif principal « sans accent » (ex. "відбутися").
        On va chercher dans le tableau la version accentuée correspondante.
    """
    soup = BeautifulSoup(html_content, "html.parser")
    
    # Prépare la structure de base
    result = {
        "inf": [main_infinitive, -1],  # On initialisera correctement après recherche
        "conj": {
            "imp": {},
            "fut": {},
            "pass": {}
        },
        "asp": "perfectif"
    }
    
    # 1) Retrouver la ligne/cellule «Інфінітив» 
    inf_header_td = soup.find("td", class_="cell header", string="Інфінітив")
    if inf_header_td:
        # La cellule suivante (colspan="2") contient tous les infinitifs
        inf_cell = inf_header_td.find_next_sibling("td")
        if inf_cell:
            # Collecter tous les <span class="word">
            span_infinitives = inf_cell.find_all("span", class_="word")
            
            # On va comparer remove_all_accents(spanText) == main_infinitive
            # pour trouver la version accentuée qui correspond
            found_accented_form = None

            # On normalise `main_infinitive` en enlevant (éventuellement) tous accents
            # au cas où le paramètre contiendrait des diacritiques inattendus.
            main_inf_no_accent = remove_all_accents(main_infinitive)

            for sp in span_infinitives:
                raw = sp.get_text(strip=True)
                # On enlève tous les accents du span pour la comparaison
                candidate_no_accent = remove_all_accents(raw)
                
                if candidate_no_accent == main_inf_no_accent:
                    # On a trouvé la forme accentuée correspondante
                    found_accented_form = raw
                    break
            
            if found_accented_form:
                # Extraire la position de l'accent
                clean_inf, pos_inf = parse_ukrainian_word_accent_policy(found_accented_form)
                result["inf"] = [clean_inf, pos_inf]
            else:
                # Si on ne trouve aucune correspondance,
                # on peut par exemple prendre le premier <span> comme fallback
                # ou bien laisser [main_infinitive, -1].
                if span_infinitives:
                    raw_first = span_infinitives[0].get_text(strip=True)
                    clean_inf, pos_inf = parse_ukrainian_word_accent_policy(raw_first)
                    result["inf"] = [clean_inf, pos_inf]
                # Sinon, rien à faire -> on garde le -1 par défaut
        # fin if inf_cell
    # fin if inf_header_td
    
    # ======================
    # Mappage des blocs
    mode_map = {
        "Наказовий спосіб": "imp",
        "Майбутній час": "fut",
        "Минулий час": "pass"
    }
    
    # Mappage des personnes
    # Remarquez que dans votre JSON final, la "3 особа" du futur
    # est appelée "5p" dans l’exemple. (sinon, vous pouvez la nommer "3p")
    person_map = {
        "1 особа": "1p",
        "2 особа": "2p",
        "3 особа": "5p",
        "чол. р.": "m",
        "жін. р.": "f",
        "сер. р.": "n"
    }
    
    def ensure_sp_structure(dct, person_key):
        """Initialise un sous-dico de la forme {"s": [], "pl": []}."""
        if person_key not in dct:
            dct[person_key] = {"s": [], "pl": []}
        return dct[person_key]
    
    def ensure_mfn_structure(dct, gender_key):
        """Initialise un sous-dico de la forme {"s": [], "pl": []} pour un genre (m, f, n)."""
        if gender_key not in dct:
            dct[gender_key] = {"s": [], "pl": []}
        return dct[gender_key]
    
    current_mode_key = None

    # 2) Parcourir toutes les lignes "class=row"
    rows = soup.find_all("tr", class_="row")
    for row in rows:
        # Détecter les sous-titres (Наказовий спосіб, Майбутній час, Минулий час)
        if "subgroup-header" in row.get("class", []):
            mode_title = row.get_text(strip=True)
            current_mode_key = mode_map.get(mode_title, None)
            continue
        
        cells = row.find_all("td", class_="cell")
        if not cells:
            continue
        
        header_text = cells[0].text.strip()
        
        # --- GESTION IMP / FUT ---
        if current_mode_key in ("imp", "fut"):
            if len(cells) < 3:
                continue
            
            person_key = person_map.get(header_text, None)
            if not person_key:
                # pas de correspondance => on ignore la ligne
                continue
            
            slot = ensure_sp_structure(result["conj"][current_mode_key], person_key)
            
            td_sing = cells[1]
            td_plur = cells[2]
            
            # Collecte SINGULIER
            sing_spans = td_sing.find_all("span", class_="word")
            forms_s = []
            if sing_spans:
                for sp in sing_spans:
                    raw = sp.get_text(strip=True)
                    wclean, wpos = parse_ukrainian_word_accent_policy(raw)
                    forms_s.append(wclean)
                    forms_s.append(wpos)
            else:
                forms_s = [None, -1]
            
            # Collecte PLURIEL
            plur_spans = td_plur.find_all("span", class_="word")
            forms_p = []
            if plur_spans:
                for sp in plur_spans:
                    raw = sp.get_text(strip=True)
                    wclean, wpos = parse_ukrainian_word_accent_policy(raw)
                    forms_p.append(wclean)
                    forms_p.append(wpos)
            else:
                forms_p = [None, -1]
            
            slot["s"] = forms_s
            slot["pl"] = forms_p
        
        # --- GESTION PASS (Mинулий час) ---
        elif current_mode_key == "pass":
            # On a : 
            #  - la première colonne = "чол. р." ou "3 особа" etc. 
            #  - la deuxième colonne = formes singulières
            #  - la troisième = formes plurielles (parfois rowspan=3)
            if len(cells) < 2:
                continue
            
            gender_key = person_map.get(header_text, None)
            if not gender_key:
                # non géré => ignore
                continue
            
            slot = ensure_mfn_structure(result["conj"]["pass"], gender_key)
            
            # SINGULIER
            sing_spans = cells[1].find_all("span", class_="word")
            forms_s = []
            if sing_spans:
                for sp in sing_spans:
                    raw = sp.get_text(strip=True)
                    wclean, wpos = parse_ukrainian_word_accent_policy(raw)
                    forms_s.append(wclean)
                    forms_s.append(wpos)
            else:
                forms_s = [None, -1]
            slot["s"] = forms_s
            
            # PLURIEL (si 3e cell existe)
            if len(cells) == 3:
                plur_spans = cells[2].find_all("span", class_="word")
                forms_p = []
                if plur_spans:
                    for sp in plur_spans:
                        raw = sp.get_text(strip=True)
                        wclean, wpos = parse_ukrainian_word_accent_policy(raw)
                        forms_p.append(wclean)
                        forms_p.append(wpos)
                else:
                    forms_p = [None, -1]
                slot["pl"] = forms_p
            # Sinon, on ne touche pas (le "pl" est déjà défini éventuellement au row précédent).
        
        else:
            # Hors des blocs gérables (imp, fut, pass)
            continue

    return result

def parse_verb_imperfective_table(html_content: str, main_infinitive: str):
    """
    Parse le tableau HTML d'un verbe imperfectif et retourne la structure JSON voulue,
    en repérant l'accent réel de `main_infinitive` dans la liste d'infinitifs du tableau.

    Paramètres
    ----------
    html_content : str
        Le code HTML du tableau
    main_infinitive : str
        L’infinitif principal (a priori sans accent), p.ex. "виcіти".
        On va chercher dans le tableau la version accentuée correspondante.
    """
    soup = BeautifulSoup(html_content, "html.parser")
    
    # Structure de base
    result = {
        "inf": [main_infinitive, -1],  # mis à jour après qu’on trouve l’accent
        "conj": {
            "imp":  {},  # Наказовий спосіб
            "fut":  {},  # Майбутній час
            "pres": {},  # Теперішній час
            "pass": {}   # Минулий час
        },
        "asp": "imperfectif"
    }
    
    # 1) Récupérer la ligne «Інфінітив»
    inf_header_td = soup.find("td", class_="cell header", string="Інфінітив")
    if inf_header_td:
        # La cellule suivante contient les formes infinitives
        inf_cell = inf_header_td.find_next_sibling("td")
        if inf_cell:
            span_infinitives = inf_cell.find_all("span", class_="word")
            
            # On compare la version "remove_all_accents(...)" à main_infinitive (lui aussi sans accent)
            main_inf_no_accent = remove_all_accents(main_infinitive)
            found_accented_form = None
            
            for sp in span_infinitives:
                raw_span = sp.get_text(strip=True)
                candidate_no_accent = remove_all_accents(raw_span)
                if candidate_no_accent == main_inf_no_accent:
                    found_accented_form = raw_span
                    break
            
            if found_accented_form:
                # extraire l’accent
                clean_inf, pos_inf = parse_ukrainian_word_accent_policy(found_accented_form)
                result["inf"] = [clean_inf, pos_inf]
            else:
                # fallback : si on ne trouve pas de correspondance, on prend la 1re ou on garde -1
                if span_infinitives:
                    raw_first = span_infinitives[0].get_text(strip=True)
                    clean_inf, pos_inf = parse_ukrainian_word_accent_policy(raw_first)
                    result["inf"] = [clean_inf, pos_inf]
    
    # 2) Mappage des blocs 
    #    Наказовий спосіб => "imp"
    #    Майбутній час => "fut"
    #    Теперішній час => "pres"
    #    Минулий час => "pass"
    mode_map = {
        "Наказовий спосіб": "imp",
        "Майбутній час": "fut",
        "Теперішній час": "pres",
        "Минулий час": "pass"
    }
    
    # 3) Mappage des personnes & genres
    person_map = {
        "1 особа": "1p",
        "2 особа": "2p",
        "3 особа": "3p",   # typically "3p" en imperfectif
        "чол. р.": "m",
        "жін. р.": "f",
        "сер. р.": "n"
    }
    
    # Fonctions utilitaires
    def ensure_sp_structure(dct, key):
        """Init un sous-dico {"s": [], "pl": []}."""
        if key not in dct:
            dct[key] = {"s": [], "pl": []}
        return dct[key]
    
    def ensure_mfn_structure(dct, key):
        """Init pour passé: {"s": [], "pl": []} pour (m/f/n)."""
        if key not in dct:
            dct[key] = {"s": [], "pl": []}
        return dct[key]
    
    current_mode_key = None
    
    # 4) Parcourir les lignes <tr class="row">
    rows = soup.find_all("tr", class_="row")
    for row in rows:
        # Détecter si c’est un sous-titre (subgroup-header)
        if "subgroup-header" in row.get("class", []):
            mode_title = row.get_text(strip=True)
            current_mode_key = mode_map.get(mode_title, None)
            continue
        
        cells = row.find_all("td", class_="cell")
        if not cells:
            continue
        
        header_text = cells[0].text.strip()
        
        # === GESTION "imp", "fut", "pres" ===
        if current_mode_key in ("imp", "fut", "pres"):
            # 3 colonnes attendues : 
            #  - col0 : "1 особа" / "2 особа" / "3 особа"
            #  - col1 : SINGULIER
            #  - col2 : PLURIEL
            if len(cells) < 3:
                continue
            
            person_key = person_map.get(header_text, None)
            if not person_key:
                # Ligne non gérée
                continue
            
            slot = ensure_sp_structure(result["conj"][current_mode_key], person_key)
            
            td_sing = cells[1]
            td_plur = cells[2]
            
            # Singulier
            sing_spans = td_sing.find_all("span", class_="word")
            forms_s = []
            if sing_spans:
                for sp in sing_spans:
                    raw = sp.get_text(strip=True)
                    wclean, wpos = parse_ukrainian_word_accent_policy(raw)
                    forms_s.append(wclean)
                    forms_s.append(wpos)
            else:
                # si pas de forme => [None, -1] ou [None, -2], à vous de voir
                forms_s = [None, -1]
            
            # Pluriel
            plur_spans = td_plur.find_all("span", class_="word")
            forms_p = []
            if plur_spans:
                for sp in plur_spans:
                    raw = sp.get_text(strip=True)
                    wclean, wpos = parse_ukrainian_word_accent_policy(raw)
                    forms_p.append(wclean)
                    forms_p.append(wpos)
            else:
                forms_p = [None, -1]
            
            slot["s"] = forms_s
            slot["pl"] = forms_p
        
        # === GESTION "pass" (Mинулий час) ===
        elif current_mode_key == "pass":
            # On attend 3 colonnes :
            #  - col0 : "чол. р." / "жін. р." / "сер. р."
            #  - col1 : formes singulières
            #  - col2 : formes plurielles (parfois rowspan=3)
            if len(cells) < 2:
                continue
            
            gender_key = person_map.get(header_text, None)
            if not gender_key:
                continue
            
            slot = ensure_mfn_structure(result["conj"]["pass"], gender_key)
            
            # Singulier
            sing_spans = cells[1].find_all("span", class_="word")
            forms_s = []
            if sing_spans:
                for sp in sing_spans:
                    raw = sp.get_text(strip=True)
                    wclean, wpos = parse_ukrainian_word_accent_policy(raw)
                    forms_s.append(wclean)
                    forms_s.append(wpos)
            else:
                forms_s = [None, -1]
            slot["s"] = forms_s
            
            # Pluriel (si 3e cell présente)
            if len(cells) == 3:
                plur_spans = cells[2].find_all("span", class_="word")
                forms_p = []
                if plur_spans:
                    for sp in plur_spans:
                        raw = sp.get_text(strip=True)
                        wclean, wpos = parse_ukrainian_word_accent_policy(raw)
                        forms_p.append(wclean)
                        forms_p.append(wpos)
                else:
                    forms_p = [None, -1]
                slot["pl"] = forms_p
            
            # sinon, si la 3e col n’est pas présente (rowspan), on ne touche pas
        else:
            # En-dehors des blocs reconnus
            continue
    
    return result

expl_phrases = {
      "Сєргійко значно менший, ніж Павло.": {
    "phrase_html": "<span class=\"ukr\" data-info=\"сєргійко;nom;cas;nomi;s\">Сєргійко</span> <span class=\"ukr\" data-info=\"значно;adv\">значно</span> <span class=\"ukr\" data-info=\"менший;adj;cas;nomi;m\">менший</span> <span class=\"ukr\" data-info=\"ніж;conj\">ніж</span> <span class=\"ukr\" data-info=\"павло;nom;cas;nomi;s\">Павло</span>.",
    "traduction": "Serghiyko est bien plus petit que Pavlo.",
    "ref": { "Olena Saint-Joanis": "L2,Cours2,Thème5.13" }
  },
  "Я взяла яблуко трохи більше, ніж твоє.": {
    "phrase_html": "<span class=\"ukr\" data-info=\"я;proper;cas;nom\">Я</span> <span class=\"ukr\" data-info=\"взяти;verb;conj;pass;f;s\">взяла</span> <span class=\"ukr\" data-info=\"яблуко;nom;cas;acc;s\">яблуко</span> <span class=\"ukr\" data-info=\"трохи;adv\">трохи</span> <span class=\"ukr\" data-info=\"більший;adj;cas;nomi;n\">більше</span> <span class=\"ukr\" data-info=\"ніж;conj\">ніж</span> <span class=\"ukr\" data-info=\"твій;proposs;cas;nomi;n\">твоє</span>.",
    "traduction": "J’ai pris une pomme un peu plus grande que la tienne.",
    "ref": { "Olena Saint-Joanis": "L2,Cours2,Thème5.14" }
  }
}

correspondance = {"verb": "дієслово", "adj": "прикметник", "adv": "прислівник", 
                  "proper": "займенник", "proposs": "займенник", 
                  "nom": "іменник", "cas": "відмінок", "nomi": "називний", 
                  "acc": "знахідний", "conj": "сполучник", "pass": "стражний", 
                  "f": "жіночий рід", "m": "чоловічий рід", "n": "середній рід", 
                  "s": "однина", "pl": "множина","perfectif":"доконаний вид",
                  "imperfectif":"недоконаний вид"}

def parse_json_phrase(json_phrase: dict):
    """
    Parse une phrase JSON (dictionnaire) et affiche/retourne les informations.
    """
    for phrase_orig, infos in json_phrase.items():
        phrase_html = infos["phrase_html"]
        soup = BeautifulSoup(phrase_html, "html.parser")
        
        # Trouver toutes les balises span avec la classe "ukr"
        spans = soup.find_all("span", class_="ukr")
        
        # Récupérer la valeur de l'attribut data-info de chacune
        data_info_list = [span.get("data-info").split(";") for span in spans if span.get("data-info")]
        print("#####################")
        for item in data_info_list:
            # On peut traiter chaque item ici
            forme = item[1]
            mot = item[0]
            res = data.get(forme, "N/A")
            #.get(mot, "N/A")
            if res == "N/A":
                print(f"Attention : pas de correspondance pour '{mot}' ({forme})")
            else:
                res.get(mot, "N/A")
                if res == "N/A":
                    print(f" '{mot}' ({forme}) n'est pas dans la base de données")
                else:
                    print("ok\n")
                    #print(f" - {mot} : {res}")
        print(f"Phrase originale : {phrase_orig}")
        print(f"Traduction      : {infos.get('traduction', 'N/A')}")
        print("Liste des data-info :")
        for item in data_info_list:
            print(f" - {item}")
        print("-" * 50)






# Utilisation de la fonction
if __name__ == "__main__":
    #result = extract_article_blocks(html_content)
    result = extract_article_blocks(fetch_html("більший"))
    for article in result:
        print(f"ID: {article['id']}")
        print("Tags:", ", ".join(article['tags']))
        if article['table']:
            print("Table Wrapper Content:")
            #print(article['table'])
            print(parse_table_adj(article['table']))
        else:
            print("Table Wrapper: None")
        print("-" * 40)
    print(parse_table_nom(entree_nom))#, lemma="двері"))  # Exemple avec un nom
    print(parse_verb_imperfective_table(entree_verbe,"висіти" ))  # Exemple avec un ver
    print(parse_verb_perfective_table(entree_verbe_perfectif, "відбутися"))  # Exemple avec un verbe perfectif
    parse_json_phrase(expl_phrases)  # Exemple avec des phrases JSON