# Nūr pour Android — édition hors ligne

Cette version embarque directement l’interface et la bibliothèque coranique. Elle démarre sans Wi‑Fi, y compris lors du premier lancement, et conserve désormais la même application locale même lorsque la connexion revient.

## Disponible hors ligne

- les 114 sourates en lecture Ḥafṣ et Warsh ;
- le texte arabe, la prononciation et les traductions française et anglaise ;
- les couleurs de tajwīd pour la lecture Ḥafṣ ;
- la recherche de sourates et de versets dans l’ensemble du Coran, les favoris, la progression, la mémorisation et le mode concentration ;
- l’étude mot à mot pour Ḥafṣ : texte arabe, prononciation et sens des mots en anglais ;
- les thèmes clair/sombre, les trois langues de l’interface et toutes les animations ;
- les favoris, la progression, les préférences et la dernière position, conservés localement et exportables dans une sauvegarde JSON.

Seuls les réponses de Fqih et l’audio utilisent Internet. L’écran de discussion Fqih fait partie de l’APK : hors ligne, il affiche simplement le message de connexion requise et retrouve la discussion dès le retour du réseau. L’audio n’est pas inclus dans l’APK, mais il peut être enregistré facultativement en choisissant la sourate dans les paramètres.

Plusieurs voix Warsh sont proposées. Quand un minutage fiable est disponible et que l’appareil est connecté, la lecture verset par verset est activée. Hicham El Harraz reste en lecture de sourate entière. Les minutages ne sont pas intégrés à l’APK : hors ligne, les récitations déjà téléchargées restent écoutables en entier.

La connexion ou la déconnexion ne remplace plus l’interface locale par le site web : la page, la sourate et le verset en cours restent en place.

Lorsqu’Internet est disponible, les actions Fqih apparaissent à côté de la sourate et de chaque verset. Elles ouvrent le chat local avec le passage sélectionné ; seule la requête de réponse est envoyée au service Fqih. Ces actions disparaissent hors ligne sans modifier le reste de l’interface.

La première ouverture permet de choisir la langue, la récitation, la voix, les couleurs, l’affichage de la prononciation, une traduction unique et le thème. Les mêmes choix restent modifiables dans les paramètres. En arabe, les listes et titres de sourates utilisent uniquement leurs noms arabes.

## Sources des textes

- AlQuran Cloud : `quran-uthmani`, `quran-tajweed`, `fr.hamidullah`, `en.asad`, `en.transliteration` ;
- Quranpedia : muṣḥaf Warsh, identifiant `4`.
- [data-quran](https://github.com/mamun-al-abdullah/quran), collecté par l’équipe Hablullah : arabe, translittération et sens anglais mot à mot pour Ḥafṣ ; source publiée sous [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/). Aucun de ces sens anglais n’est présenté comme une traduction française.
- [MP3Quran Timing API](https://www.mp3quran.net/eng/timing-api) : repères temporels en ligne pour les voix Warsh compatibles.

Le fichier principal de données est généré par `scripts/build-offline-data.mjs`. Le fichier mot à mot peut être régénéré par `node scripts/build-word-data.mjs app/src/main/assets/data/word-data.js`. Les fichiers de données ne doivent pas être modifiés à la main. La sauvegarde n’inclut pas les fichiers audio téléchargés ni l’historique du chat Fqih.

La compilation automatique se lance à chaque mise à jour de la branche `main`. L’APK se trouve dans l’artefact **Nur-Android-Offline-APK** de l’onglet **Actions**.
