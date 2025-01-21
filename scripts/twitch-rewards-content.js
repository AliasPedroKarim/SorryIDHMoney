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
    }
});

// Écouter les changements de configuration et les demandes de stats
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "updateTwitchRewards") {
        enableTwitchRewards = request.enabled;
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

    // Récupérer le nom de la chaîne depuis l'URL
    const channelName = window.location.pathname.split('/')[1];

    rewardButtons.forEach(button => {
        console.log(
            "Button found: ", button
        );
        const points = 50; // Points par défaut pour un bonus

        button.click();
        button.setAttribute('data-clicked', 'true');

        // Mettre à jour les stats globales
        stats.clickCount++;
        stats.pointsCollected += points;
        stats.lastUpdate = Date.now();

        // Mettre à jour les stats par chaîne
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

        // Sauvegarder les stats
        chrome.storage.local.set({ twitchRewardStats: stats });

        console.log(`✨ ${points} points Twitch récupérés sur la chaîne ${channelName} !`);
    });
}

function startRewardCollector() {
    console.log("Start reward collector");
    if (!rewardCollectorInterval) {
        rewardCollectorInterval = setInterval(collectReward, 5000); // Vérifier toutes les 5 secondes
        console.log('🎮 Collecteur de rewards Twitch activé');
    }
}

function stopRewardCollector() {
    console.log("Stop reward collector");
    if (rewardCollectorInterval) {
        clearInterval(rewardCollectorInterval);
        rewardCollectorInterval = null;
        console.log('🛑 Collecteur de rewards Twitch désactivé');
    }
}

// Démarrer le collecteur si activé
if (enableTwitchRewards) {
    startRewardCollector();
} 