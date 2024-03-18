// by @AliasPedroKarim
// The code adds a search bar to a webpage and filters a list of anime
// titles based on the user's input in real-time. It uses a function to find a
// case-insensitive substring in a string.

const srcUtils = chrome.runtime.getURL("scripts/utils.js");

(async () => {
  const { addCustomButton, animationCSS, injectCSSAnimation } = await import(
    srcUtils
  );
  injectCSSAnimation(animationCSS());

  function addButtons(data) {
    if (data?.siteMalUrl) {
      addCustomButton("myanimelist", data.siteMalUrl, {openInNewTab: true});
    }

    if (data?.siteUrl) {
      addCustomButton("anilist", data.siteUrl, {
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
    const episodeTitle = title?.textContent?.toLowerCase();
    if (!episodeTitle) return;
    
    chrome.runtime.sendMessage(
      { action: "getAnilistMedia", search: episodeTitle, typePreference: "ANIME" },
      function (response) {
        if (!response) return;

        addButtons(response);
      }
    );
  }
})();
