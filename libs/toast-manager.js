/**
 * Gestionnaire de toasts pour l'extension
 */
class ToastManager {
    constructor(position = 'top-right') {
        this.container = null;
        this.position = position;
        this.toasts = new Set(); // Pour suivre les toasts actifs
        this.initContainer();
    }

    /**
     * Définit la position des toasts
     * @param {string} position - 'top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'
     */
    setPosition(position) {
        this.position = position;
        this.updateContainerPosition();
    }

    updateContainerPosition() {
        const positions = {
            'top-left': 'top: 20px; left: 20px; flex-direction: column;',
            'top-center': 'top: 20px; left: 50%; transform: translateX(-50%); flex-direction: column;',
            'top-right': 'top: 20px; right: 20px; flex-direction: column;',
            'bottom-left': 'bottom: 20px; left: 20px; flex-direction: column-reverse;',
            'bottom-center': 'bottom: 20px; left: 50%; transform: translateX(-50%); flex-direction: column-reverse;',
            'bottom-right': 'bottom: 20px; right: 20px; flex-direction: column-reverse;'
        };

        const positionStyle = positions[this.position] || positions['top-right'];
        this.container.style.cssText = `
            position: fixed;
            ${positionStyle}
            z-index: 999999;
            display: flex;
            gap: 10px;
            pointer-events: none;
            max-height: 100vh;
            overflow-y: hidden;
            padding: 10px;
        `;
    }

    initContainer() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'extension-toast-container';
            this.updateContainerPosition();
            document.body.appendChild(this.container);
        }
    }

    /**
     * Affiche un toast avec des options avancées
     * @param {string} message - Message à afficher
     * @param {Object} options - Options du toast
     * @param {string} options.type - Type de toast ('success', 'error', 'info', 'warning')
     * @param {number} options.duration - Durée d'affichage en ms (défaut: 3000)
     * @param {string} options.position - Position du toast
     * @param {Array} options.buttons - Boutons à ajouter au toast [{text, onClick, type}]
     */
    show(message, options = {}) {
        const {
            type = 'info',
            duration = 3000,
            position,
            buttons = []
        } = options;

        // Mettre à jour la position si spécifiée
        if (position) {
            this.setPosition(position);
        }

        const toast = document.createElement('div');
        toast.className = `extension-toast toast-${type}`;

        // Styles du toast
        toast.style.cssText = `
            padding: 12px 16px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            margin-bottom: 8px;
            opacity: 0;
            pointer-events: auto;
            transform: scale(0.9);
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            gap: 8px;
            min-width: 250px;
            max-width: 400px;
            height: auto;
            margin: 0;
        `;

        // Contenu principal du toast
        const contentDiv = document.createElement('div');
        contentDiv.className = 'toast-content';
        contentDiv.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
        `;

        // Ajouter l'icône et le message
        const icon = this.getIconForType(type);
        contentDiv.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <span class="toast-message">${message}</span>
        `;
        toast.appendChild(contentDiv);

        // Ajouter les boutons si présents
        if (buttons.length > 0) {
            const buttonsContainer = document.createElement('div');
            buttonsContainer.className = 'toast-buttons';
            buttonsContainer.style.cssText = `
                display: flex;
                gap: 8px;
                margin-top: 4px;
                justify-content: flex-end;
            `;

            buttons.forEach(button => {
                const btnElement = document.createElement('button');
                btnElement.textContent = button.text;
                btnElement.className = `toast-button ${button.type || 'default'}`;
                btnElement.style.cssText = `
                    padding: 4px 10px;
                    border: none;
                    border-radius: 4px;
                    font-size: 12px;
                    cursor: pointer;
                    background-color: ${this.getButtonColor(button.type)};
                    color: white;
                    transition: opacity 0.2s;
                `;
                btnElement.addEventListener('click', () => {
                    if (typeof button.onClick === 'function') {
                        button.onClick();
                    }
                    // Fermer le toast après avoir cliqué sur le bouton
                    this.removeToast(toast);
                });
                buttonsContainer.appendChild(btnElement);
            });

            toast.appendChild(buttonsContainer);
        }

        // Appliquer les couleurs
        const colors = {
            success: '#4CAF50',
            error: '#F44336',
            warning: '#FF9800',
            info: '#2196F3'
        };
        toast.style.borderLeft = `4px solid ${colors[type]}`;
        toast.style.color = colors[type];

        // Ajouter le toast au conteneur
        this.container.appendChild(toast);
        this.toasts.add(toast);

        // Animation d'entrée
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'scale(1)';
        });

        // Suppression automatique après la durée spécifiée
        if (duration > 0) {
            setTimeout(() => {
                this.removeToast(toast);
            }, duration);
        }

        return toast; // Retourner le toast pour permettre de le manipuler plus tard
    }

    /**
     * Supprime un toast spécifique avec animation
     */
    removeToast(toast) {
        if (!this.toasts.has(toast)) return;

        toast.style.opacity = '0';
        toast.style.transform = 'scale(0.9)';
        setTimeout(() => {
            if (this.container.contains(toast)) {
                this.container.removeChild(toast);
                this.toasts.delete(toast);
            }
        }, 300);
    }

    /**
     * Retourne la couleur de fond pour un type de bouton
     */
    getButtonColor(type) {
        const colors = {
            primary: '#2196F3',
            success: '#4CAF50',
            danger: '#F44336',
            warning: '#FF9800',
            info: '#03A9F4',
            default: '#757575'
        };
        return colors[type] || colors.default;
    }

    /**
     * Retourne l'icône SVG correspondant au type de toast
     */
    getIconForType(type) {
        const icons = {
            success: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#4CAF50" opacity="0.2"/><path d="M8 12l3 3 5-7" stroke="#4CAF50" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            error: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#F44336" opacity="0.2"/><path d="M15 9l-6 6m0-6l6 6" stroke="#F44336" stroke-width="2.5" stroke-linecap="round"/></svg>',
            warning: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3L2 21h20L12 3z" fill="#FF9800" opacity="0.2"/><path d="M12 9v6" stroke="#FF9800" stroke-width="2.5" stroke-linecap="round"/><circle cx="12" cy="18" r="1.5" fill="#FF9800"/></svg>',
            info: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#2196F3" opacity="0.2"/><path d="M12 8v8" stroke="#2196F3" stroke-width="2.5" stroke-linecap="round"/><circle cx="12" cy="6" r="1.5" fill="#2196F3"/></svg>'
        };
        return icons[type] || icons.info;
    }
}

// Exporter une instance unique
const toastManager = new ToastManager();

// Exposer les méthodes nécessaires
export function showToast(message, options = {}) {
    // Vérifier si les toasts sont activés
    return new Promise(resolve => {
        chrome.storage.sync.get({ enableToasts: true }, function (items) {
            if (items.enableToasts) {
                const toast = toastManager.show(message, options);
                resolve(toast);
            } else {
                // Toasts désactivés, mais on peut quand même logger le message
                console.log('[Toast désactivé]', message, options);
                resolve(null);
            }
        });
    });
} 