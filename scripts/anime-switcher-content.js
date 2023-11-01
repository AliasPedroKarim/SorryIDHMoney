// by @AliasPedroKarim
// This code adds a custom button to MyAnimeList and AniList websites that
// allows users to switch between the two platforms for a given anime or manga.
// It uses GraphQL queries to retrieve the necessary information and dynamically
// injects the button into the page.
// This code retrieves information about an anime or manga from MyAnimeList or
// AniList, and adds a custom button to switch between the two platforms.

const srcUtils = chrome.runtime.getURL("scripts/utils.js");

(async () => {
  const { addCustomButton, animationCSS, injectCSSAnimation, resetButton } = await import(
    srcUtils
  );

  async function getUrlAnilist(id, type) {
    if (isNaN(parseInt(id))) return null;
    if (!["ANIME", "MANGA"].includes(type)) return null;
    const query = `
          query ($id: Int, $type: MediaType) {
              Media(idMal: $id, type: $type) {
                  siteUrl
              }
          }
  `;
    const variables = {
      id: parseInt(id),
      type: type,
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
      .catch((error) => console.error("An error occurred:", error));
    console.log("res", res);
    return res?.data?.Media?.siteUrl;
  }

  async function getUrlMal(id, type) {
    if (isNaN(parseInt(id))) return null;
    if (!["ANIME", "MANGA"].includes(type)) return null;

    const query = `
        query ($id: Int, $type: MediaType) {
            Media(id: $id, type: $type) {
                idMal
            }
        }
        `;
    const variables = {
      id: parseInt(id),
      type: type,
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
    return idMal
      ? `https://myanimelist.net/${type.toLowerCase()}/${idMal}`
      : null;
  }

  function extractAnimeIdFromUrl(urlObj) {
    const pathParts = urlObj.pathname.split("/");

    if (pathParts.length >= 3) {
      const type = pathParts[1];
      const id = pathParts[2];

      return { type, id };
    }

    return { type: null, id: null };
  }

  function animeSwitcher(url) {
    const currentUrl = new URL(url || window.location.href);
    const currentHostname = currentUrl.hostname;
    const { type, id } = extractAnimeIdFromUrl(currentUrl);

    switch (currentHostname) {
      case "myanimelist.net":
        if (["anime", "manga"].includes(type) && id) {
          getUrlAnilist(id, type.toUpperCase()).then((url) => {
            if (!url) return;
            addCustomButton("anilist", url);
          });
        }

        break;
      case "anilist.co":
        if (["anime", "manga"].includes(type) && id) {
          getUrlMal(id, type.toUpperCase()).then((url) => {
            if (!url) return;
            addCustomButton("myanimelist", url);
          });
        }
        break;
      default:
        console.log("Site not supported.");
        break;
    }
  }

  navigation.addEventListener("navigate", (e) => {
    const targetUrl = new URL(e.destination.url);
    const currentUrl = new URL(window.location.href);

    if (currentUrl.hostname != targetUrl.hostname) return;

    resetButton();
    animeSwitcher(e.destination.url);
  });

  injectCSSAnimation(animationCSS());
  animeSwitcher();
})();
