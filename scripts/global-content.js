let clearCount = 0;

function checkConsoleClear() {
  clearCount++;
  if (clearCount > 1) {
    console.clear = function () { };
    chrome.runtime.sendMessage({ action: "disableConsoleClear" });
  }
}

console.clear = function () {
  checkConsoleClear();
  console.clear.apply(this, arguments);
};

function handleScriptInsertions(mutationsList, observer) {
  mutationsList.forEach((mutation) => {
    if (mutation.type === "childList") {
      mutation.addedNodes.forEach((node) => {
        if (node.tagName && node.tagName.toLowerCase() === "script") {
          // node.textContent = node.textContent.replace(/debugger;/g, "");
          // node.textContent = script.textContent.replace(/console\.clear\(\);?/g, "");
        }
      });
    }
  });
}

const observer = new MutationObserver(handleScriptInsertions);

const config = { childList: true, subtree: true };

observer.observe(document, config);

// Tous les éléments qui contiennent la classe "no-scroll"
const noScrollElements = document.querySelectorAll(".no-scroll");

// On les retire de la liste des éléments qui contiennent la classe "no-scroll"
noScrollElements.forEach((element) => {
  element.classList.remove("no-scroll");
});

// Si un élément body de la page contient la classe "fixed" Alors il faudra enlever la classe "fixed"
const body = document.querySelector("body");
if (body.classList.contains("fixed")) {
  body.classList.remove("fixed");
}


document.addEventListener("DOMContentLoaded", function () {
  let currentVideo = null;

  document.querySelectorAll("iframe").forEach((iframe) => {
    try {
      const videos = iframe.contentWindow.document.querySelectorAll("video");

      videos.forEach((video) => {
        video.addEventListener("play", function () {
          currentVideo = video;
          console.log("Vidéo en cours dans l’iframe :", currentVideo);
        });

        video.addEventListener("pause", function () {
          if (currentVideo === video) {
            currentVideo = null;
          }
        });
      });
    } catch (e) {
      console.warn("Impossible d'accéder à l'iframe (protection Same-Origin)", iframe);
    }
  });
});

