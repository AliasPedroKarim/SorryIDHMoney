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
      addCustomButton("myanimelist", data.siteMalUrl, { openInNewTab: true });
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
    const episodeTitleRaw = extractEpisodeTitle(title.textContent);
    const episodeTitle = episodeTitleRaw.toLowerCase();

    if (!episodeTitle) return;

    // Rewrite the episode title in title page, split by "|" and replace the first part with the episode title
    document.title = `${title.textContent} | ${document.title?.split("|")[1]}`;

    checkPreviousAndNext();

    setupButtonAdvanceVideo();

    chrome.runtime.sendMessage(
      { action: "getAnilistMedia", search: episodeTitle, typePreference: "ANIME" },
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
  if (window.location.pathname === "/") {
    const animesGrid = document.querySelector(".animes-grid>.w-full:nth-child(2)");
    if (!animesGrid) return;

    const animeCards = animesGrid.querySelectorAll("a>img");
    if (!animeCards?.length) return;

    for (const animeCard of Array.from(animeCards)) {
      const link = animeCard.parentElement.getAttribute("href");
      if (!link) continue;

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

// Fonction pour extraire le numéro d'épisode à partir de l'URL
function extractEpisodeNumber(url) {
  const match = url.match(/episode-(\d+)/i);
  if (match && match[1]) {
    return parseInt(match[1]);
  } else {
    throw new Error('Impossible d\'extraire le numéro d\'épisode depuis l\'URL actuelle.');
  }
}

// Fonction pour vérifier si une page existe et si elle est une redirection permanente (code 301)
async function checkPageExists(url) {
  try {
    const response = await fetch(url);
    if (response.ok) {
      return true;
    } else if (response.status === 301) {
      // Redirection permanente, donc la page n'existe pas
      return false;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

/* // Fonction pour créer un bouton et appliquer le style en JavaScript
function createButton(icon, position) {
  const button = document.createElement('a');
  button.innerHTML = `<span></span>`;
  document.body.appendChild(button);

  // Appliquer le style directement
  button.style.position = 'fixed';
  button.style.top = '50%';
  button.style.transform = 'translateY(-50%)';
  button.style.width = '50px';
  button.style.height = '50px';
  button.style.backgroundColor = '#6b46c1';
  button.style.borderRadius = '8px';
  button.style.textAlign = 'center';
  button.style.lineHeight = '50px';
  button.style.fontSize = '24px';
  button.style.cursor = 'pointer';
  button.style[`${position === 'left' ? 'left' : 'right'}`] = '20px'; // Utilisation de [ ] pour utiliser une variable comme nom de propriété

  // Création de l'icône
  const span = document.createElement('span');
  span.innerHTML = icon === 'prev-icon' ? '◄' : '►';
  span.style.display = 'inline-block';
  span.style.fontFamily = 'Arial';
  button.appendChild(span);

  return button;
} */

function createGenericButton(iconHTML, styles) {
  const button = document.createElement('a');
  document.body.appendChild(button);

  // Appliquer les styles spécifiés dans l'objet `styles`
  Object.assign(button.style, {
    width: '50px',
    height: '50px',
    borderRadius: '8px',
    textAlign: 'center',
    lineHeight: '50px',
    fontSize: '24px',
    cursor: 'pointer',
    ...styles,
  });

  // Ajouter l'icône HTML
  button.innerHTML = iconHTML;  // L'icône peut être passée en tant que HTML

  return button;
}


function createButtonWithPosition(position) {
  // Définir l'icône en fonction de la position (flèche gauche ou droite)
  const iconHTML = position === 'left' ? '<span>◄</span>' : '<span>►</span>';

  // Styles de base pour le bouton
  const baseStyles = {
    position: 'fixed',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: '#6b46c1',
  };

  // Ajouter la position (gauche ou droite)
  baseStyles[position === 'left' ? 'left' : 'right'] = '20px';

  // Utilisation de la fonction générique pour créer le bouton avec icône et styles
  return createGenericButton(iconHTML, baseStyles);
}

// Fonction principale
async function checkPreviousAndNext() {
  const currentUrl = window.location.href;
  const episodeNumber = extractEpisodeNumber(currentUrl);

  // Vérifier si l'épisode précédent existe
  const prevEpisodeUrl = currentUrl.replace(`episode-${(String(episodeNumber)).padStart(2, '0')}`, `episode-${(String(episodeNumber - 1)).padStart(2, '0')}`);
  const prevEpisodeExists = await checkPageExists(prevEpisodeUrl);

  // Créer le bouton précédent s'il existe
  if (prevEpisodeExists) {
    const prevButton = createButtonWithPosition('left');
    prevButton.href = prevEpisodeUrl;
  }

  // Vérifier si l'épisode suivant existe
  const nextEpisodeUrl = currentUrl.replace(`episode-${(String(episodeNumber)).padStart(2, '0')}`, `episode-${(String(episodeNumber + 1)).padStart(2, '0')}`);
  const nextEpisodeExists = await checkPageExists(nextEpisodeUrl);

  // Créer le bouton suivant s'il existe
  if (nextEpisodeExists) {
    const nextButton = createButtonWithPosition('right');
    nextButton.href = nextEpisodeUrl;
  }
}

let activeVideo = null; // Variable pour stocker la vidéo actuellement en cours de lecture

// Fonction pour avancer la vidéo active de X secondes
// async function setupButtonAdvanceVideo() {

//   // Fonction pour avancer la vidéo active de X secondes
//   function advanceActiveVideo(seconds) {
//     if (activeVideo) {
//       activeVideo.currentTime += seconds; // Avance de X secondes
//       console.log(`Vidéo avancée de ${seconds} secondes`);
//     } else {
//       console.log("Aucune vidéo active trouvée.");
//     }
//   }
  
//   // Fonction pour attacher les événements 'playing' et 'pause' à une vidéo
//   function attachVideoEvents(video) {
//     video.addEventListener('playing', function () {
//       activeVideo = video;
//       console.log("Vidéo active détectée.");
//     });
  
//     video.addEventListener('pause', function () {
//       if (activeVideo === video) {
//         activeVideo = null;
//         console.log("Vidéo mise en pause, plus de vidéo active.");
//       }
//     });
//   }
  
//   // Fonction pour détecter les vidéos présentes et leur attacher des événements
//   function detectActiveVideo() {
//     const videos = document.querySelectorAll('video');
//     console.log(`Détecté ${videos.length} vidéo(s) sur la page.`, videos);
  
//     for (let video of videos) {
//       if (!video.dataset.eventsAttached) { // Vérifie si les événements sont déjà attachés
//         attachVideoEvents(video);
//         video.dataset.eventsAttached = true; // Marque la vidéo comme ayant les événements attachés
//       }
//     }
//   }
  
//   // Observer les modifications dans le DOM pour détecter de nouvelles vidéos
//   const observer = new MutationObserver((mutations) => {
//     mutations.forEach((mutation) => {
//       console.log(
//         `Mutation de type '${mutation.type}' détectée, ${mutation.addedNodes.length} nœud(s) ajouté(s).`
//       );
      
//       if (mutation.addedNodes.length > 0) {
//         for (let node of mutation.addedNodes) {
//           if (node.tagName === 'VIDEO') {
//             console.log('Nouvelle vidéo détectée, événements attachés.');
//             attachVideoEvents(node); // Attache les événements à la nouvelle vidéo
//           }
//         }
//       }
//     });
//   });
  
//   // Options de l'observateur : observe les enfants et les sous-arbres pour les ajouts de nœuds
//   observer.observe(document.body, { childList: true, subtree: true });
  
//   // Initialiser la détection des vidéos existantes sur la page
//   detectActiveVideo();






//   const advanceButton = createGenericButton('<span>⏩</span>', {
//     position: 'fixed',
//     bottom: '20px',
//     right: '20px',
//     backgroundColor: '#805ad5',
//     color: '#fff',
//   });

//   advanceButton.addEventListener('click', () => {
//     /* chrome.runtime.sendMessage({ action: "advanceActiveVideo", time: 80 }, function(response) {
//       if (response.status === 'success') {
//         console.log(response.message);
//       } else {
//         console.log('Erreur lors de l\'avancement de la vidéo.');
//       }
//     }); */
    
//     advanceActiveVideo(80);
//   });
// }

