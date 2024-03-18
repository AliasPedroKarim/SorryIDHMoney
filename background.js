import {
  addTermToCache,
  cacheData,
  getCachedDataByKey,
  getCachedDataByTerm,
} from "./scripts/cache.js";

async function getAnilistMediaInfo(search, typePreference) {
  const query = `query ($search: String, $typePreference: MediaType) {
            Media(search: $search, type: $typePreference) {
                id
                idMal
                siteUrl
                type
            }
        }`;
  const variables = {
    search,
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case "disableConsoleClear":
      console.log("console.clear has been disabled.");
      return false;
    case "getAnilistMedia":
      console.log("Received demand media from anilist: ", message);
      if (message.search) {
        getAnilistMediaInfo(message.search, message?.typePreference).then((res) => {
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
    default:
      return false;
  }
});
