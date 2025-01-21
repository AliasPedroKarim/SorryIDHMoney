function formatNumber(num) {
    return new Intl.NumberFormat('fr-FR').format(num);
}

function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString('fr-FR', {
        dateStyle: 'short',
        timeStyle: 'short'
    });
}

function updateStats() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs[0].url.includes('twitch.tv')) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "getTwitchStats" }, function (response) {
                if (response) {
                    document.getElementById('click-count').textContent = formatNumber(response.clickCount);
                    document.getElementById('points-collected').textContent = formatNumber(response.pointsCollected);
                    document.getElementById('last-update').textContent =
                        `Dernière mise à jour : ${formatDate(response.lastUpdate)}`;

                    // Mettre à jour les stats par chaîne
                    const channelStatsContainer = document.getElementById('channel-stats');
                    channelStatsContainer.innerHTML = '';

                    Object.entries(response.channelStats || {})
                        .sort((a, b) => b[1].lastUpdate - a[1].lastUpdate) // Trier par date de dernière mise à jour
                        .forEach(([channelName, channelData]) => {
                            const channelElement = document.createElement('div');
                            channelElement.className = 'channel-item';
                            channelElement.innerHTML = `
                                <div class="channel-name">${channelName}</div>
                                <div class="channel-details">
                                    Clics : ${formatNumber(channelData.clickCount)} | 
                                    Points : ${formatNumber(channelData.pointsCollected)}<br>
                                    Dernière collecte : ${formatDate(channelData.lastUpdate)}
                                </div>
                            `;
                            channelStatsContainer.appendChild(channelElement);
                        });
                }
            });
        } else {
            document.body.innerHTML = '<div style="padding: 20px; text-align: center;">Veuillez vous rendre sur Twitch pour voir les statistiques</div>';
        }
    });
}

document.getElementById('reset-stats').addEventListener('click', function () {
    const stats = {
        clickCount: 0,
        pointsCollected: 0,
        lastUpdate: Date.now(),
        channelStats: {} // Réinitialiser aussi les stats par chaîne
    };

    chrome.storage.local.set({ twitchRewardStats: stats }, function () {
        updateStats();
    });
});

// Mettre à jour les stats toutes les 5 secondes si la popup est ouverte
updateStats();
setInterval(updateStats, 5000); 