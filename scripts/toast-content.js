// Vérifier si le script a déjà été chargé
if (typeof window.__toastHandlerInitialized === 'undefined') {
    // Marquer comme initialisé
    window.__toastHandlerInitialized = true;

    // Charger le gestionnaire de toasts
    const toastScript = chrome.runtime.getURL('libs/toast-manager.js');

    // Fonction pour gérer les toasts
    let showToast;

    // Charger le module de toast
    import(toastScript).then(module => {
        showToast = module.showToast;

        // Écouter les messages pour afficher les toasts
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === "showToast") {
                // Vérifier si les toasts sont activés
                chrome.storage.sync.get({ enableToasts: true }, function (items) {
                    if (items.enableToasts) {
                        showToast(request.message, request.options);
                    } else {
                        console.log('[Toast désactivé]', request.message, request.options);
                    }
                    // Toujours envoyer une réponse
                    sendResponse({ success: true, toastsEnabled: items.enableToasts });
                });
            }
            // Retourner true pour indiquer que nous allons répondre de manière asynchrone
            return true;
        });
    });
} 