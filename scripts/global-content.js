console.log("[Global content] Global content loaded :3");

// Fonction pour appliquer les règles de nettoyage
function applyCleanupRules() {
  // Tous les éléments qui contiennent la classe "no-scroll"
  const noScrollElements = document.querySelectorAll(".no-scroll");
  noScrollElements.forEach((element) => {
    element.classList.remove("no-scroll");
  });

  // Si un élément body de la page contient la classe "fixed" Alors il faudra enlever la classe "fixed"
  const body = document.querySelector("body");
  if (body.classList.contains("fixed")) {
    body.classList.remove("fixed");
  }

  // Vérification et suppression de data-scroll-locked
  if (document.body.getAttribute("data-scroll-locked") === "1") {
    console.log("data-scroll-locked détecté, application des règles de scroll...");
    document.body.removeAttribute("data-scroll-locked");

    // Réactivation du scroll uniquement si data-scroll-locked était présent
    document.body.style.overflow = "auto";
    document.body.style.height = "auto";
    document.body.style.position = "relative";
    document.body.style.width = "100%";
    document.body.style.top = "auto";
    document.body.style.left = "auto";

    // S'assurer que html a aussi les bonnes propriétés
    document.documentElement.style.overflow = "auto";
    document.documentElement.style.height = "auto";
    document.documentElement.style.position = "relative";
    document.documentElement.style.width = "100%";
    document.documentElement.style.top = "auto";
    document.documentElement.style.left = "auto";
  }

  // Vérification et réinitialisation de pointer-events
  if (document.body.style.pointerEvents === "none") {
    document.body.style.pointerEvents = "auto";
  }
}

// Application initiale des règles
applyCleanupRules();

// Configuration de l'observateur de mutations
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'attributes' &&
      (mutation.attributeName === 'data-scroll-locked' ||
        mutation.attributeName === 'style' ||
        mutation.attributeName === 'class')) {
      console.log("Changement détecté dans le body, application des règles de nettoyage...");
      applyCleanupRules();
    }
  });
});

// Démarrage de l'observation
observer.observe(document.body, {
  attributes: true,
  attributeFilter: ['data-scroll-locked', 'style', 'class']
});
