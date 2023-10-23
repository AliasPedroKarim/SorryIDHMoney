# Introduction

This project is a Chrome extension designed to help users manage their finances through a simple and intuitive interface. The extension consists of several scripts located in the "scripts" folder. Below is a detailed description of each script:

# Scripts

- `anime-switcher-content.js`: 

# Fonctions

## extractAnimeIdFromUrl

La fonction `extractAnimeIdFromUrl` prend un objet URL en entrée et renvoie un objet contenant le type et l'ID de l'anime ou du manga dans l'URL. Elle le fait en divisant le chemin d'accès de l'URL et en extrayant la deuxième et la troisième parties du chemin, qui devraient être le type et l'ID respectivement.

## getUrlAnilist

La fonction `getUrlAnilist` prend un ID et un type en entrée et renvoie l'URL du site de l'anime ou du manga sur AniList en utilisant une requête GraphQL. Elle vérifie d'abord si l'ID est un nombre valide et si le type est soit "ANIME" soit "MANGA". Elle construit ensuite une requête GraphQL en utilisant les variables ID et type et envoie une requête POST à l'API GraphQL d'AniList. Si la requête est réussie, elle renvoie l'URL du site de l'anime ou du manga.

## addCustomButton

La fonction `addCustomButton` prend un site et un lien en entrée et ajoute un bouton personnalisé à la page. Le bouton est stylé en fonction du paramètre site et contient une image du logo du site. Lorsqu'il est cliqué, le bouton redirige l'utilisateur vers le lien fourni.

## getUrlMal

La fonction `getUrlMal` est similaire à `getUrlAnilist`, mais elle récupère l'URL de MyAnimeList de l'anime ou du manga au lieu de l'URL d'AniList.

## animeSwitcher

La fonction `animeSwitcher` est la fonction principale du script. Elle prend une URL en entrée (ou utilise l'URL actuelle si aucune n'est fournie) et détermine si l'URL est pour MyAnimeList ou AniList. Si elle est pour MyAnimeList, elle récupère l'URL d'AniList de l'anime ou du manga et ajoute un bouton personnalisé pour passer à AniList. Si elle est pour AniList, elle récupère l'URL de MyAnimeList et ajoute un bouton personnalisé pour passer à MyAnimeList. La fonction utilise les fonctions `extractAnimeIdFromUrl`, `getUrlAnilist`, `getUrlMal` et `addCustomButton` pour accomplir cela.

## injectCSSAnimation

La fonction `injectCSSAnimation` ajoute une animation CSS à la page qui est utilisée pour le bouton personnalisé. Elle crée un élément de style et l'ajoute à la tête du document. L'animation est définie en utilisant le paramètre `animationCSS`.

