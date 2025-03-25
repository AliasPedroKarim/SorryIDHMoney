// by @AliasPedroKarim
// The code adds a search bar to a webpage and filters a list of anime
// titles based on the user's input in real-time. It uses a function to find a
// case-insensitive substring in a string.

const srcUtils = chrome.runtime.getURL("scripts/utils.js");
const toastScript = chrome.runtime.getURL("libs/toast-manager.js");
const animeCacheScript = chrome.runtime.getURL("scripts/anime-cache-manager.js");

// Modules à charger
let showToast;
let animeCache;
let utils;

// Fonction principale qui s'exécute une fois tous les modules chargés
async function main() {
  try {
    // Charger tous les modules nécessaires
    const [toastModule, cacheModule, utilsModule] = await Promise.all([
      import(toastScript),
      import(animeCacheScript),
      import(srcUtils)
    ]);

    // Assigner les fonctions/objets importés
    showToast = toastModule.showToast;
    animeCache = cacheModule.animeCache;
    utils = utilsModule;

    // S'assurer que le cache est initialisé
    await animeCache.ensureCacheReady();

    // Exécuter la logique principale
    initializeAnimeDetection();
  } catch (error) {
    console.error("Erreur lors du chargement des modules:", error);
  }
}

// Fonction qui gère la détection des animes et l'ajout des boutons
async function initializeAnimeDetection() {
  const { addCustomButton, animationCSS, injectCSSAnimation } = utils;
  injectCSSAnimation(animationCSS());

  function addButtons(data) {
    if (data?.siteMalUrl || data?.malUrl) {
      addCustomButton("myanimelist", data.siteMalUrl || data.malUrl, { openInNewTab: true });
    }

    if (data?.siteUrl || data?.anilistUrl) {
      addCustomButton("anilist", data.siteUrl || data.anilistUrl, {
        styles: {
          left: `${20 * 2 + 50}px`,
        },
        openInNewTab: true,
      });
    }
  }

  if (
    window.location.pathname.includes("-vostfr") && window.location.pathname.startsWith("/anime/")
  ) {
    // .entry-header_wrap ol.breadcrumb li (second element) a
    const title = document.querySelector(".entry-header_wrap ol.breadcrumb li:nth-child(2) a");
    if (!title) return;
    const episodeTitle = title?.textContent?.toLowerCase()?.trim();
    if (!episodeTitle) return;

    try {
      // Vérifier si l'anime est dans le cache avant de faire la recherche
      const cachedResult = await animeCache.isInCache(episodeTitle);

      if (cachedResult === true) {
        // Anime ignoré, ne rien faire
        console.log(`Anime ignoré: ${episodeTitle}`);
        return;
      } else if (cachedResult) {
        // URL personnalisée trouvée, utiliser directement
        console.log(`URL personnalisée trouvée pour: ${episodeTitle}`);
        addButtons({
          siteUrl: cachedResult.anilistUrl || cachedResult,
          malUrl: cachedResult.malUrl || null
        });
        return;
      }

      // Rechercher l'anime via l'API
      chrome.runtime.sendMessage(
        { action: "getAnilistMedia", search: episodeTitle, typePreference: "ANIME" },
        function (response) {
          if (!response) {
            // Ajouter l'anime au cache
            animeCache.addNotFoundAnime(episodeTitle, window.location.href, title.textContent, true);

            // Afficher un toast d'erreur avec des boutons
            if (showToast) {
              showToast(`Anime non trouvé : ${title.textContent}`, {
                type: 'warning',
                duration: 8000,
                position: 'top-right',
                buttons: [
                  {
                    text: 'Ignorer',
                    onClick: () => animeCache.ignoreAnime(episodeTitle),
                    type: 'danger'
                  },
                  {
                    text: 'Gérer URL',
                    onClick: () => {
                      chrome.runtime.sendMessage({
                        action: 'openAnimeManager',
                        searchTerm: episodeTitle
                      });
                    },
                    type: 'primary'
                  }
                ]
              });
            }
            return;
          }

          addButtons(response);
        }
      );
    } catch (error) {
      console.error("Erreur lors de la vérification du cache:", error);
    }
  }
}

// Démarrer l'exécution
main().catch(error => {
  console.error("Erreur dans le script principal:", error);
});
