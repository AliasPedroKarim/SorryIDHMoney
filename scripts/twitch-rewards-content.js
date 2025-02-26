// Charger le gestionnaire de toasts
const toastScript = chrome.runtime.getURL('libs/toast-manager.js');

// Créer une fonction pour gérer les toasts
let showToast;

// Charger le module de toast
import(toastScript).then(module => {
    showToast = module.showToast;

    let enableTwitchRewards = true;
    let rewardCollectorInterval = null;
    let stats = {
        clickCount: 0,
        pointsCollected: 0,
        lastUpdate: Date.now(),
        channelStats: {} // Nouveau: stockage par chaîne
    };


    // Charger les stats existantes
    chrome.storage.local.get(['twitchRewardStats'], function (result) {
        if (result.twitchRewardStats) {
            stats = result.twitchRewardStats;
        }
    });

    // Récupérer la configuration initiale
    chrome.storage.sync.get({
        enableTwitchRewards: true
    }, function (items) {
        enableTwitchRewards = items.enableTwitchRewards;
        if (enableTwitchRewards) {
            startRewardCollector();
        } else {
            stopRewardCollector();
        }
    });

    // Écouter les changements de configuration et les demandes de stats
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.action === "updateTwitchRewards") {
            enableTwitchRewards = request.enabled;
            console.log("Mise à jour de la configuration Twitch Rewards:", enableTwitchRewards);

            if (enableTwitchRewards) {
                startRewardCollector();
            } else {
                stopRewardCollector();
            }
        } else if (request.action === "getTwitchStats") {
            sendResponse(stats);
        }
        return true;
    });

    function collectReward() {
        const rewardButtons = document.querySelectorAll('button[aria-label="Récupérer un bonus"]');

        if (rewardButtons.length > 0) {
            // Arrêter l'intervalle actuel
            stopRewardCollector();

            // Ajouter un délai aléatoire avant de cliquer (entre 1 et 3 secondes)
            const clickDelay = Math.random() * 2000 + 1000;

            setTimeout(() => {
                const channelName = window.location.pathname.split('/')[1];

                rewardButtons.forEach(button => {
                    console.log("Reward trouvé, préparation du clic...");
                    const points = 50;

                    button.click();
                    button.setAttribute('data-clicked', 'true');

                    // Mettre à jour les stats...
                    stats.clickCount++;
                    stats.pointsCollected += points;
                    stats.lastUpdate = Date.now();

                    if (!stats.channelStats[channelName]) {
                        stats.channelStats[channelName] = {
                            clickCount: 0,
                            pointsCollected: 0,
                            lastUpdate: Date.now()
                        };
                    }
                    stats.channelStats[channelName].clickCount++;
                    stats.channelStats[channelName].pointsCollected += points;
                    stats.channelStats[channelName].lastUpdate = Date.now();

                    chrome.storage.local.set({ twitchRewardStats: stats });

                    // Utiliser le toast via window.toast
                    showToast(`✨ ${points} points collectés !`, {
                        type: 'success',
                        duration: 2000
                    });
                });

                // Redémarrer le collecteur avec un délai aléatoire
                const nextCheckDelay = Math.random() * 5000 + 15000; // Entre 15 et 20 secondes
                setTimeout(() => {
                    startRewardCollector();
                }, nextCheckDelay);

            }, clickDelay);
        }
    }

    function startRewardCollector() {
        console.log("Démarrage du collecteur de rewards");
        if (!rewardCollectorInterval && enableTwitchRewards) {
            // Intervalle aléatoire entre 15 et 20 secondes
            const intervalDelay = Math.random() * 5000 + 15000;
            rewardCollectorInterval = setInterval(collectReward, intervalDelay);
            console.log(`🎮 Collecteur de rewards Twitch activé (vérification toutes les ${Math.round(intervalDelay / 1000)} secondes)`);
            showToast('Collecteur de rewards activé', {
                type: 'info',
                duration: 3000
            });
        }
    }

    function stopRewardCollector() {
        console.log("Stop reward collector");
        if (rewardCollectorInterval) {
            clearInterval(rewardCollectorInterval);
            rewardCollectorInterval = null;
            console.log('🛑 Collecteur de rewards Twitch désactivé');
            showToast('Collecteur de rewards désactivé', {
                type: 'warning',
                duration: 3000
            });
        }
    }
}); 