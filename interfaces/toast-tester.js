// Charger le gestionnaire de toasts
const toastScript = chrome.runtime.getURL('libs/toast-manager.js');

// Fonction pour envoyer un toast à la page active
async function sendToastToActiveTab(message, options) {
    try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const tab = tabs[0];

        if (!tab) {
            showError("Aucun onglet actif trouvé");
            return;
        }

        // Vérifier si l'URL est valide
        if (!tab.url || tab.url.startsWith('chrome://')) {
            showError("Impossible d'afficher des toasts sur cette page");
            return;
        }

        // Injecter le content script s'il n'est pas déjà présent
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['scripts/toast-content.js']
        });

        // Envoyer le message après l'injection
        await chrome.tabs.sendMessage(tab.id, {
            action: "showToast",
            message: message,
            options: options
        }, response => {
            // Optionnel : traiter la réponse si nécessaire
            console.log("Toast affiché avec succès:", response);
        });

    } catch (error) {
        showError("Impossible d'afficher le toast sur cette page");
        console.error("Erreur lors de l'envoi du toast:", error);
    }
}

// Fonction pour afficher une erreur dans l'interface
function showError(message) {
    const errorDiv = document.getElementById('error-message') || createErrorDiv();
    errorDiv.textContent = message;
    errorDiv.style.opacity = '1';
    setTimeout(() => {
        errorDiv.style.opacity = '0';
    }, 3000);
}

// Créer la div d'erreur si elle n'existe pas
function createErrorDiv() {
    const errorDiv = document.createElement('div');
    errorDiv.id = 'error-message';
    errorDiv.style.cssText = `
        position: fixed;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        background-color: var(--error-color);
        color: white;
        padding: 10px 20px;
        border-radius: 4px;
        transition: opacity 0.3s;
        opacity: 0;
    `;
    document.body.appendChild(errorDiv);
    return errorDiv;
}

// Afficher un toast personnalisé
function showCustomToast() {
    const message = document.getElementById('message').value;
    const type = document.getElementById('type').value;
    const duration = parseInt(document.getElementById('duration').value);
    const position = document.getElementById('position').value;

    sendToastToActiveTab(message, { type, duration, position });
}

// Afficher un toast prédéfini
function showPresetToast(type) {
    const presets = {
        success: { message: '✨ Opération réussie !', duration: 3000 },
        error: { message: '❌ Une erreur est survenue', duration: 4000 },
        warning: { message: '⚠️ Attention requise', duration: 3500 },
        info: { message: 'ℹ️ Information importante', duration: 3000 }
    };

    const { message, duration } = presets[type];
    const position = document.getElementById('position').value;
    sendToastToActiveTab(message, { type, duration, position });
}

// Ajouter les écouteurs d'événements
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('custom-toast-btn').addEventListener('click', showCustomToast);

    document.querySelectorAll('.preset-toasts button').forEach(button => {
        button.addEventListener('click', () => {
            showPresetToast(button.dataset.type);
        });
    });
}); 