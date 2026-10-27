# Site de Togami Genshiro, période Edo

Un site en anglais avec des touches de japonais décoratif, dans l'ambiance "Nuit sanglante" : noir laqué, rouge sang, or terni, crème papier. Âge jamais mentionné.

## 0. Scène d'ouverture (avant d'entrer)

Écran noir, une lanterne en papier qui vacille. Un rouleau de mise à prix (tehai-gaki, avis de recherche d'Edo) se déroule avec le portrait de Togami à l'encre et "Click to break the seal". Au clic : le sceau de cire rouge en forme de rose se brise, un coup de katana horizontal tranche le rouleau en deux, les deux moitiés tombent, des pétales s'envolent et le site apparaît derrière.

## Pages

1. **Introduction (/)**
   - Portrait de Togami, brume, pétales qui tombent lentement
   - Nom en grand + kanji vertical, phrase d'accroche
   - Fiche du personnage en panneaux de papier : Personality, Likes, Dislikes, Hobbies (tes textes, reformulés sans tirets et sans répétition entre Personality et Likes)
   - Les emojis remplacés par de petites icônes dessinées à l'encre (pièces, kimono, roses)
   - Liens vers Story et Weapon

2. **Story (/story)** : tout se lit en défilant
   - Chapitres avec tes titres exacts :
     - 🌹 - 第壱章：根 - 🌹
     - 🌹 - 第弐章：開花 - 🌹
     - 🌹 - 第参章：棘 - 🌹
   - Chaque paragraphe apparaît en fondu au fil du défilement, comme de l'encre qui sèche
   - Les moments forts déclenchent des animations à côté du texte : katana animé qui se dégaine et tranche quand il y a un coup d'épée, éclaboussure de sang qui gicle et coule quand il tranche l'artère, pétales qui tombent pour les roses, la sandale qui écrase la fleur, etc.
   - Mots en gras/rouge de ton texte conservés (Genshiro en rouge)
   - Texte reformulé naturellement, sans "—", tous les faits gardés ; je relis toutes tes captures pour compléter la partie coupée

3. **Weapon (/weapon)**
   - Titre au même format, traduit : 🌹 - 刀の章：薔薇の鍔 - 🌹 ("The Rose Tsuba")
   - Ta photo de l'épée détourée, qui entre en glissant avec un éclat de lame
   - Effet 3D : l'épée pivote et brille selon la souris / le doigt (option 1, une seule photo)
   - Histoire de l'épée en défilement, avec les mêmes animations

## Style

- Titres en serif type gravure, texte serif lisible
- Papier washi sombre, sceaux rouges, traits d'encre en séparateurs
- Menu discret : Introduction / Story / Weapon

## En attente de toi

- La photo de l'épée (pour la page Weapon). En attendant, emplacement temporaire.
- Optionnel : captures à 360° ou modèle 3D si tu veux une vraie rotation

## Détails techniques

- Routes `index.tsx`, `story.tsx`, `weapon.tsx`, menu dans `__root.tsx`, head() propre à chaque page
- Scène d'ouverture jouée une fois par visite (mémorisée en session)
- Animations au défilement avec framer-motion ; épée et sang en SVG animé
- Détourage de la photo de l'épée par outil d'édition d'image ; 3D par transformation perspective CSS
- Couleurs en tokens dans `src/styles.css`, polices via `<link>` (Shippori Mincho + Cormorant)
- Captures envoyées via Lovable Assets ; pas de base de données
