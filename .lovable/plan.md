# Site de Togami Genshiro, période Edo

Un site en anglais avec des touches de japonais décoratif, dans l'ambiance "Nuit sanglante" : noir laqué, rouge sang, or terni, crème papier.

## Pages

1. **Introduction (/)**
   - Grand portrait de Togami (ta capture principale) sur fond sombre, brume et pétales de rose qui tombent lentement
   - Nom en grand ("Togami Genshiro" / 玄城 戸上 en kanji décoratif vertical), une phrase d'accroche ("The law is a chain. He reads the gaps between its links.")
   - Courte présentation : rōnin kabukimono, fils déshonoré d'une famille de magistrats de Kyoto
   - Bandeau des symboles : rose rouge, lotus, katana à la tsuba en rose
   - Bouton vers l'histoire

2. **Histoire / Lore (/story)**
   - Le récit complet découpé en chapitres façon rouleau (makimono), chacun avec un titre anglais + kanji :
     - The House of Ink (la famille Genshiro)
     - The Hidden Greenhouse (la mère, les roses hollandaises)
     - A Game of Loopholes (l'éducation, le kenjutsu)
     - The Crushed Bloom (le seigneur et la serre)
     - la suite, d'après tes captures
     - The Rose Tsuba (le katana modifié)
     - The Unlisted Contraband (le contrat de Nagasaki)
   - Texte reformulé de façon naturelle, sans tirets "—", en gardant tous les faits
   - Tes autres captures placées entre les chapitres comme des estampes encadrées

## Style

- Typographie : titres en serif ancienne type pinceau/gravure, texte en serif lisible
- Textures papier washi sombre, sceaux rouges (hanko), traits d'encre sumi en séparateurs
- Menu discret en haut : Introduction / Story
- Animations légères au défilement (apparition à l'encre)

## Détails techniques

- Routes : `src/routes/index.tsx` et `src/routes/story.tsx`, menu partagé dans `__root.tsx`, titres et descriptions propres à chaque page
- Couleurs en tokens dans `src/styles.css`, polices chargées via `<link>` (ex. Shippori Mincho + Cormorant)
- Les 8 captures envoyées comme images du site via Lovable Assets
- Je lirai toutes les captures pour récupérer la partie de l'histoire qui m'est arrivée coupée
- Pas de base de données nécessaire
