import {
  addTermToCache,
  cacheData,
  getCachedDataByKey,
  getCachedDataByTerm,
} from "./scripts/cache.js";

// Fonction pour nettoyer les termes de recherche
function sanitizeSearchTerm(search) {
  if (!search) return '';

  return search
    // Supprime les crochets et leur contenu
    .replace(/\[.*?\]/g, '')
    // Supprime les deux-points
    .replace(/:/g, '')
    // Supprime les caractères spéciaux tout en gardant les espaces et les lettres/chiffres
    .replace(/[^\w\s-]/g, '')
    // Remplace les espaces multiples par un seul espace
    .replace(/\s+/g, ' ')
    // Supprime les espaces au début et à la fin
    .trim();
}

async function getAnilistMediaInfo(search, typePreference) {
  // Applique la sanitization avant la recherche
  const sanitizedSearch = sanitizeSearchTerm(search);

  console.log(
    "Terms sanitized: ",
    sanitizedSearch
  )

  const query = `query ($search: String, $typePreference: MediaType) {
            Media(search: $search, type: $typePreference) {
                id
                idMal
                siteUrl
                type
            }
        }`;
  const variables = {
    search: sanitizedSearch,
    typePreference,
  };
  const url = "https://graphql.anilist.co";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: query,
      variables: variables,
    }),
  })
    .then((response) => response.json())
    .catch((_) => null);
  const idMal = res?.data?.Media?.idMal;
  return res?.data?.Media
    ? {
      ...res?.data?.Media,
      siteMalUrl: idMal
        ? `https://myanimelist.net/${res?.data?.Media?.type?.toLowerCase()}/${idMal}`
        : null,
    }
    : null;
}

// Listen for messages from the content script

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case "disableConsoleClear":
      console.log("console.clear has been disabled.");
      return false;
    case "getAnilistMedia":
      console.log("Received demand media from anilist: ", message);
      if (message.search) {
        getAnilistMediaInfo(message.search, message?.typePreference).then((res) => {
          console.log("And the response is: ", res);
          sendResponse(res);
        });
      }
      // Le retour de true est important car il indique au runtime
      // que nous voulons qu'il reste actif tout au long de la transition
      return true;
    case "cacheData":
      if (message.cacheKey && message.data && message.expirationInSeconds) {
        cacheData(
          message.cacheKey,
          message.data,
          message.expirationInSeconds,
          message.terms || []
        );
        console.log("Data cached:", message.cacheKey);
      }
      return false;
    case "getCachedDataByKey":
      if (message.cacheKey) {
        getCachedDataByKey(message.cacheKey).then((data) => {
          sendResponse(data);
        });
      }
      return true;
    case "getCachedDataByTerm":
      if (message.term) {
        getCachedDataByTerm(message.term).then((data) => {
          sendResponse(data);
        });
      }
      return true;
    case "addTermToCache":
      if (message.cacheKey && message.term) {
        addTermToCache(message.cacheKey, message.term);
        console.log("Term added to cache:", message.term);
      }
      return false;
    case "openStatsPopup":
      chrome.windows.create({
        url: chrome.runtime.getURL("interfaces/twitch-stats.html"),
        type: "popup",
        width: 350,
        height: 400
      });
      return false;
    default:
      return false;
  }
});
