// by @AliasPedroKarim
// This code adds a custom button to MyAnimeList and AniList websites that 
// allows users to switch between the two platforms for a given anime or manga. 
// It uses GraphQL queries to retrieve the necessary information and dynamically 
// injects the button into the page.
// This code retrieves information about an anime or manga from MyAnimeList or 
// AniList, and adds a custom button to switch between the two platforms.

let button = null;
let style = null;

function injectCSSAnimation(animationCSS) {
  style = document.createElement("style");
  style.type = "text/css";
  style.appendChild(document.createTextNode(animationCSS));

  document.head.appendChild(style);
}

const listAnimations = [
  `@keyframes buttonAnimation {
    0% {
      transform: scale(1);
    }
  
    50% {
      transform: scale(1.1);
    }
  
    100% {
      transform: scale(1);
    }
  }`,
  `@keyframes buttonAnimation {
    0% {
      animation-timing-function: ease-in;
      opacity: 0;
      transform: translateY(-45px);
    }
  
    16% {
      opacity: .4;
    }
  
    24% {
      opacity: 1;
    }
  
    40% {
      animation-timing-function: ease-in;
      transform: translateY(-24px);
    }
  
    65% {
      animation-timing-function: ease-in;
      transform: translateY(-12px);
    }
  
    82% {
      animation-timing-function: ease-in;
      transform: translateY(-6px);
    }
  
    93% {
      animation-timing-function: ease-in;
      transform: translateY(-4px);
    }
  
    25%,
    55%,
    75%,
    87% {
      animation-timing-function: ease-out;
      transform: translateY(0px);
    }
  
    100% {
      animation-timing-function: ease-out;
      opacity: 1;
      transform: translateY(0px);
    }
  }`,
  `@keyframes buttonAnimation {
    0%,
    100% {
      transform: rotate(0deg);
      transform-origin: 50% 50%;
    }
  
    10% {
      transform: rotate(8deg);
    }
  
    20%,
    40%,
    60% {
      transform: rotate(-10deg);
    }
  
    30%,
    50%,
    70% {
      transform: rotate(10deg);
    }
  
    80% {
      transform: rotate(-8deg);
    }
  
    90% {
      transform: rotate(8deg);
    }
  }`
]

const animationCSS = () => listAnimations[Math.floor(Math.random() * listAnimations.length)];

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

function addCustomButton(site, link) {
  button = document.createElement("button");
  button.setAttribute("type", "button");
  button.style.backgroundColor = site === "anilist" ? "#19212d" : "#2e51a2";
  button.style.color = "#ffffff";
  button.style.width = "50px";
  button.style.height = "50px";
  button.style.borderRadius = "8px";
  button.style.fontSize = "14px";
  button.style.border = "none";
  button.style.cursor = "pointer";

  button.style.position = "fixed";
  button.style.bottom = "20px";
  button.style.left = "20px";
  button.style.boxShadow =
    "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)";

  button.style.animation = "buttonAnimation 2s ease infinite";

  document.body.appendChild(button);

  if (site === "myanimelist") {
    button.innerHTML = `<img src='https://myanimelist.net/img/common/pwa/launcher-icon-3x.png' style="width:100%;height:100%;" alt='AniList' />`;
  } else if (site === "anilist") {
    button.innerHTML = `<img src='https://anilist.co/img/icons/icon.svg' style="width:100%;height:100%;" alt='AniList' />`;
  }

  button.addEventListener("click", function () {
    window.location.href = link;
  });
}

navigation.addEventListener('navigate', e => {
  const targetUrl = new URL(e.destination.url);
  const currentUrl = new URL(window.location.href);

  if(currentUrl.hostname != targetUrl.hostname) return;

  if (button) button.remove();
  if (style) style.remove();
  injectCSSAnimation(animationCSS());
  animeSwitcher(e.destination.url);
});

injectCSSAnimation(animationCSS());

animeSwitcher();
