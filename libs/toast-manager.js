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
     * Crée et affiche un toast
     * @param {string} message - Message à afficher
     * @param {Object} options - Options du toast
     * @param {string} options.type - Type de toast ('success', 'error', 'info', 'warning')
     * @param {number} options.duration - Durée d'affichage en ms (défaut: 3000)
     */
    show(message, options = {}) {
        const {
            type = 'info',
            duration = 3000,
            position
        } = options;

        if (position) {
            this.setPosition(position);
        }

        const toast = document.createElement('div');
        toast.className = `extension-toast toast-${type}`;

        // Styles du toast avec transition sur la hauteur
        toast.style.cssText = `
            padding: 12px 24px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            opacity: 0;
            pointer-events: auto;
            transform: scale(0.9);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: 200px;
            max-width: 400px;
            height: auto;
            margin: 0;
        `;

        // Ajouter l'icône et le message
        const icon = this.getIconForType(type);
        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <span class="toast-message">${message}</span>
        `;

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

        // Suppression
        const removeToast = () => {
            toast.style.opacity = '0';
            toast.style.transform = 'scale(0.9)';
            toast.style.maxHeight = '0';
            toast.style.margin = '0';
            toast.style.padding = '0';

            setTimeout(() => {
                if (this.container.contains(toast)) {
                    this.container.removeChild(toast);
                    this.toasts.delete(toast);
                }
            }, 300);
        };

        // Gérer le hover pour mettre en pause le timer
        let timeoutId;
        const startTimer = () => {
            timeoutId = setTimeout(removeToast, duration);
        };

        toast.addEventListener('mouseenter', () => {
            clearTimeout(timeoutId);
        });

        toast.addEventListener('mouseleave', () => {
            startTimer();
        });

        startTimer();
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

// Créer et exporter une instance unique
const toastManager = new ToastManager();

// Exposer les méthodes nécessaires
export function showToast(message, options = {}) {
    // Vérifier si les toasts sont activés
    chrome.storage.sync.get({ enableToasts: true }, function (items) {
        if (items.enableToasts) {
            toastManager.show(message, options);
        } else {
            // Toasts désactivés, mais on peut quand même logger le message
            console.log('[Toast désactivé]', message, options);
        }
    });
} 