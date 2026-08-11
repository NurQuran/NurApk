# Nūr pour Android — édition hors ligne

Cette version embarque directement l’interface et la bibliothèque coranique. Elle démarre sans Wi‑Fi, y compris lors du premier lancement.

## Disponible hors ligne

- les 114 sourates en lecture Ḥafṣ et Warsh ;
- le texte arabe, la prononciation et les traductions française et anglaise ;
- les couleurs de tajwīd pour la lecture Ḥafṣ ;
- la recherche, les favoris, la progression, la mémorisation et le mode concentration ;
- les thèmes clair/sombre, les trois langues de l’interface et toutes les animations ;
- les sourates audio déjà enregistrées depuis les paramètres.

Fqih reste volontairement en ligne. L’audio peut être écouté en ligne ou enregistré, sourate par sourate, pour les prochaines lectures hors connexion.

## Sources des textes

- AlQuran Cloud : `quran-uthmani`, `quran-tajweed`, `fr.hamidullah`, `en.asad`, `en.transliteration` ;
- Quranpedia : muṣḥaf Warsh, identifiant `4`.

Le fichier de données est généré par `scripts/build-offline-data.mjs`. Il ne doit pas être modifié à la main.

La compilation automatique se lance à chaque mise à jour de la branche `main`. L’APK se trouve dans l’artefact **Nur-Android-Offline-APK** de l’onglet **Actions**.
