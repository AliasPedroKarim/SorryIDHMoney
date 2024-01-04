// by @AliasPedroKarim
// The code adds a search bar to a webpage and filters a list of anime
// titles based on the user's input in real-time. It uses a function to find a
// case-insensitive substring in a string.

const srcUtils = chrome.runtime.getURL("scripts/utils.js");

function findCaseInsensitiveSubstring(sourceString, searchString) {
  const regex = new RegExp(searchString, "i");
  const matchResult = sourceString.match(regex);

  return matchResult ? matchResult[0] : null;
}

function extractEpisodeTitle(inputString) {
  // Utilisez une expression régulière pour extraire le texte avant "Episode"
  const match = inputString.match(/^(.*?)Episode/);

  if (match && match[1]) {
    // Si une correspondance est trouvée, retournez le texte avant "Episode"
    return match[1].trim();
  } else {
    // Si aucune correspondance n'est trouvée, retournez la chaîne d'origine
    return inputString.trim();
  }
}

function extractLinkList(inputString) {
    // Utilisez une expression régulière pour extraire le texte avant "-episode"
  const match = inputString.match(/^(.*?)-episode/);

  if (match && match[1]) {
    // Si une correspondance est trouvée, retournez le texte avant "Episode"
    return match[1].trim();
  } else {
    // Si aucune correspondance n'est trouvée, retournez la chaîne d'origine
    return inputString.trim();
  }
}

if ([
  "/tous-les-animes-en-vostfr",
  "/films",
  "/regarder-animes-oav-streaming"
].includes(window.location.pathname)) {
  const landing = document.querySelector(".az-tabs");

  if (landing) {
    const label = document.createElement("label");
    label.setAttribute("for", "custom-search-anime");
    label.style.display = "block";
    label.style.color = "#fff";
    label.style.fontSize = "14px";
    label.style.fontWeight = "bold";
    label.style.marginBottom = "8px";
    label.textContent = "Rechercher un anime";

    const input = document.createElement("input");
    input.id = "custom-search-anime";
    input.style.boxShadow = "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
    input.style.border = "1px solid #e2e8f0";
    input.style.borderRadius = "4px";
    input.style.width = "100%";
    input.style.padding = "8px 12px";
    input.style.color = "#333";
    input.style.lineHeight = "1.25";
    input.style.outline = "none";
    input.style.transition = "box-shadow 0.15s, border-color 0.15s";
    input.setAttribute("type", "text");
    input.setAttribute(
      "placeholder",
      "Tensei Shitara Slime Datta Ken, One piece, ..."
    );

    landing.insertBefore(input, landing.firstChild);
    landing.insertBefore(label, landing.firstChild);

    input.addEventListener("keyup", (e) => {
      const value = e.target.value;

      const tabs = document.querySelectorAll("#az-slider #inner-slider ul li");

      if (tabs?.length) {
        for (const tab of Array.from(tabs)) {
          const elementModifiable = tab.querySelector("a");
          const title = elementModifiable?.innerText;

          if (!title) continue;

          if (title.toLowerCase().includes(value.toLowerCase())) {
            tab.style.display = "block";
            const term = findCaseInsensitiveSubstring(title, value);
            elementModifiable.innerHTML = title.replace(
              term,
              `<span style="color:red;font-weight:bold;">${term}</span>`
            );
          } else {
            tab.style.display = "none";
          }
        }
      }

      const letterSection = document.querySelectorAll(
        "#az-slider #inner-slider .letter-section"
      );

      if (letterSection?.length) {
        for (const section of Array.from(letterSection)) {
          const listElement = section.querySelectorAll("ul li");

          if (
            Array.from(listElement).every((v) => v.style.display === "none")
          ) {
            section.style.display = "none";
          } else {
            section.style.display = "block";
          }
        }
      }
    });
  }
}

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

  if (window.location.pathname?.endsWith("-vostfr")) {
    const title = document.querySelector(".release .header h1.title");
    if (!title) return;
    const episodeTitle = extractEpisodeTitle(title.textContent).toLowerCase();

    if (!episodeTitle) return;

    chrome.runtime.sendMessage(
      { action: "getAnilistMedia", search: episodeTitle },
      function (response) {
        if (!response) return;

        addButtons(response);
      }
    );

    // chrome.runtime.sendMessage(
    //   { action: "getCachedDataByTerm", term: episodeTitle },
    //   function (cachedData) {
    //     if (!cachedData) return;

    //     if (cachedData) {
    //       addButtons(cachedData);
    //     } else {
    //       chrome.runtime.sendMessage(
    //         { action: "getAnilistMedia", search: episodeTitle },
    //         function (response) {
    //           if (!response) return;

    //           chrome.runtime.sendMessage({
    //             action: "cacheData",
    //             cacheKey: episodeTitle,
    //             data: response,
    //             expirationInSeconds: 86400,
    //             terms: [episodeTitle],
    //           });

    //           addButtons(response);
    //         }
    //       );
    //     }
    //   }
    // );
  }
})();

(async () => {
  if(window.location.pathname === "/") {
    const animesGrid = document.querySelector(".animes-grid>.w-full:nth-child(2)");
    if(!animesGrid) return;

    const animeCards = animesGrid.querySelectorAll("a>img");
    if(!animeCards?.length) return;

    for(const animeCard of Array.from(animeCards)) {
      const link = animeCard.parentElement.getAttribute("href");
      if(!link) continue;

      const button = document.createElement("button");

      Object.assign(button.style, {
        position: "absolute",
        top: "5px",
        left: "5px",
        padding: "4px",
        borderRadius: "50%",
        backgroundColor: "#805ad5",
        color: "#fff",
        fontSize: "14px",
        fontWeight: "bold",
        textDecoration: "none",
        zIndex: "1000",
        width: "32px",
        height: "32px",
        opacity: "0.51",
      });

      button.addEventListener("mouseenter", (e) => {
        e.stopPropagation();
        e.preventDefault();

        button.style.opacity = "1";
      });

      button.addEventListener("mouseleave", (e) => {
        e.stopPropagation();
        e.preventDefault();

        button.style.opacity = "0.51";
      });

      button.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        window.open(extractLinkList(link), "_self");
      });

      button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" style="overflow: unset; position: unset; display: unset; width: unset; height: unset; top: unset; left: unset; fill: none; background: unset; border-radius: unset; margin: unset;" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-list"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
      `;

      animeCard.parentElement.style.position = "relative";
      animeCard.parentElement.appendChild(button);
    }
  }
})();
