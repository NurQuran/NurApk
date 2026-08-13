# Nūr pour Android — édition hors ligne

Cette version embarque directement l’interface et la bibliothèque coranique. Elle démarre sans Wi‑Fi, y compris lors du premier lancement, et conserve désormais la même application locale même lorsque la connexion revient.

## Disponible hors ligne

- les 114 sourates en lecture Ḥafṣ et Warsh ;
- le texte arabe, la prononciation et les traductions française et anglaise ;
- les couleurs de tajwīd pour la lecture Ḥafṣ ;
- la recherche, les favoris, la progression, la mémorisation et le mode concentration ;
- les thèmes clair/sombre, les trois langues de l’interface et toutes les animations ;
- les favoris, la progression, les préférences et la dernière position, conservés localement.

Seuls les réponses de Fqih et l’audio utilisent Internet. L’écran de discussion Fqih fait partie de l’APK : hors ligne, il affiche simplement le message de connexion requise et retrouve la discussion dès le retour du réseau. L’audio n’est pas inclus dans l’APK, mais il peut être enregistré facultativement en choisissant la sourate dans les paramètres.

La connexion ou la déconnexion ne remplace plus l’interface locale par le site web : la page, la sourate et le verset en cours restent en place.

Lorsqu’Internet est disponible, les actions Fqih apparaissent à côté de la sourate et de chaque verset. Elles ouvrent le chat local avec le passage sélectionné ; seule la requête de réponse est envoyée au service Fqih. Ces actions disparaissent hors ligne sans modifier le reste de l’interface.

La première ouverture permet de choisir la langue, la récitation, la voix, les couleurs, l’affichage de la prononciation, une traduction unique et le thème. Les mêmes choix restent modifiables dans les paramètres. En arabe, les listes et titres de sourates utilisent uniquement leurs noms arabes.

## Sources des textes

- AlQuran Cloud : `quran-uthmani`, `quran-tajweed`, `fr.hamidullah`, `en.asad`, `en.transliteration` ;
- Quranpedia : muṣḥaf Warsh, identifiant `4`.

Le fichier de données est généré par `scripts/build-offline-data.mjs`. Il ne doit pas être modifié à la main.

La compilation automatique se lance à chaque mise à jour de la branche `main`. L’APK se trouve dans l’artefact **Nur-Android-Offline-APK** de l’onglet **Actions**.
