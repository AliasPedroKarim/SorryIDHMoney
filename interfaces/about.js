document.addEventListener('DOMContentLoaded', function () {
    // Récupérer et afficher toutes les informations du manifest
    try {
        const manifest = chrome.runtime.getManifest();

        // Titre de l'extension
        document.getElementById('extension-name').textContent = manifest.name;
        document.title = `À propos de ${manifest.name}`;

        // Version
        document.getElementById('extension-version').textContent = manifest.version;

        // Description
        const descriptionElement = document.getElementById('extension-description');
        if (descriptionElement && manifest.description) {
            descriptionElement.textContent = manifest.description;
        }

        // Permissions
        const permissionsList = document.getElementById('permissions-list');
        if (permissionsList && manifest.permissions && manifest.permissions.length > 0) {
            manifest.permissions.forEach(permission => {
                const li = document.createElement('li');

                // Formater les permissions pour une meilleure lisibilité
                let formattedPermission = permission;
                if (permission === "storage") {
                    formattedPermission = "Stockage local de données";
                } else if (permission === "tabs") {
                    formattedPermission = "Gestion des onglets";
                } else if (permission.includes("://")) {
                    formattedPermission = `Accès au site ${permission.replace(/\*:\/\/|\*\//g, '')}`;
                }

                li.textContent = formattedPermission;
                permissionsList.appendChild(li);
            });
        } else if (permissionsList) {
            permissionsList.innerHTML = '<li class="empty-permission">Aucune permission requise</li>';
        }

        // Auteur
        const authorElement = document.getElementById('extension-author');
        if (authorElement && manifest.author) {
            authorElement.textContent = manifest.author;
        }

        // Afficher le manifest complet dans la console pour les développeurs
        console.log('Manifest de l\'extension:', manifest);

    } catch (error) {
        console.error('Erreur lors de la récupération du manifest:', error);
        document.getElementById('manifest-error').style.display = 'block';
    }

    // Gestion du chargement de l'avatar GitHub
    const avatarImg = document.getElementById('github-avatar');
    if (avatarImg) {
        avatarImg.onerror = function () {
            this.src = '../icons/icon48.png';
        };
    }

    // Mettre à jour l'année du copyright
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Charger les statistiques d'utilisation
    loadStats();

    // Ajouter des données historiques
    loadHistory();
});

function loadHistory() {
    // Récupérer les dates d'installation et de dernière mise à jour
    chrome.storage.local.get(['installDate', 'lastUpdateDate'], function (result) {
        const installDate = result.installDate;
        const updateDate = result.lastUpdateDate;

        if (installDate) {
            document.getElementById('install-date').textContent = new Date(installDate).toLocaleDateString('fr-FR');
        }

        if (updateDate) {
            document.getElementById('update-date').textContent = new Date(updateDate).toLocaleDateString('fr-FR');
        } else if (installDate) {
            // Si pas de date de mise à jour, utiliser la date d'installation
            document.getElementById('update-date').textContent = new Date(installDate).toLocaleDateString('fr-FR');
        }
    });

    // Si ces données n'existent pas encore, les créer maintenant
    const now = Date.now();
    chrome.storage.local.get(['installDate'], function (result) {
        if (!result.installDate) {
            chrome.storage.local.set({ installDate: now });
            document.getElementById('install-date').textContent = new Date(now).toLocaleDateString('fr-FR');
        }

        // Toujours mettre à jour la date de dernière utilisation
        chrome.storage.local.set({ lastUpdateDate: now });
    });
}

function loadStats() {
    // Nombre d'animes dans le cache
    chrome.storage.local.get(['animeCache'], function (result) {
        const animeCache = result.animeCache || { notFound: {} };
        const totalAnimes = Object.keys(animeCache.notFound || {}).length;
        document.getElementById('total-animes').textContent = totalAnimes;

        // Afficher le top des animes non trouvés si disponible
        const topAnimesElement = document.getElementById('top-animes');
        if (topAnimesElement && animeCache.notFound) {
            // Convertir les données en tableau pour le tri
            const animeEntries = Object.entries(animeCache.notFound);

            if (animeEntries.length > 0) {
                // Trier par date de dernière recherche
                animeEntries.sort((a, b) => (b[1].lastSearch || 0) - (a[1].lastSearch || 0));

                // Afficher les 3 derniers animes recherchés
                const topThreeAnimes = animeEntries.slice(0, 3);

                topThreeAnimes.forEach(([name, data]) => {
                    const animeElement = document.createElement('div');
                    animeElement.className = 'top-anime-item';

                    // Formatter le nom (première lettre en majuscule, limiter la longueur)
                    const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
                    const shortName = formattedName.length > 25 ? formattedName.substring(0, 22) + '...' : formattedName;

                    animeElement.innerHTML = `
                        <div class="top-anime-name">${shortName}</div>
                        <div class="top-anime-date">${data.lastSearch ? new Date(data.lastSearch).toLocaleDateString('fr-FR') : 'Inconnu'}</div>
                    `;

                    topAnimesElement.appendChild(animeElement);
                });
            } else {
                topAnimesElement.innerHTML = '<div class="empty-message">Aucun anime en cache</div>';
            }
        }
    });

    // Points Twitch collectés et statistiques détaillées
    chrome.storage.local.get(['twitchRewardStats'], function (result) {
        const stats = result.twitchRewardStats || { pointsCollected: 0, clickCount: 0, channelStats: {} };

        // Points totaux
        document.getElementById('twitch-points').textContent = formatNumber(stats.pointsCollected);

        // Nombre de clics
        const clicksElement = document.getElementById('twitch-clicks');
        if (clicksElement) {
            clicksElement.textContent = formatNumber(stats.clickCount || 0);
        }

        // Top chaînes
        const topChannelsElement = document.getElementById('top-channels');
        if (topChannelsElement && stats.channelStats) {
            // Convertir les données en tableau pour le tri
            const channelEntries = Object.entries(stats.channelStats);

            if (channelEntries.length > 0) {
                // Trier par points collectés
                channelEntries.sort((a, b) => b[1].pointsCollected - a[1].pointsCollected);

                // Afficher les 3 principales chaînes
                const topThreeChannels = channelEntries.slice(0, 3);

                topThreeChannels.forEach(([channel, data]) => {
                    const channelElement = document.createElement('div');
                    channelElement.className = 'top-channel-item';
                    channelElement.innerHTML = `
                        <div class="top-channel-name">${channel}</div>
                        <div class="top-channel-points">${formatNumber(data.pointsCollected)} points</div>
                    `;

                    topChannelsElement.appendChild(channelElement);
                });
            } else {
                topChannelsElement.innerHTML = '<div class="empty-message">Aucune chaîne visitée</div>';
            }
        }
    });
}

function formatNumber(num) {
    return new Intl.NumberFormat('fr-FR').format(num);
}

// Ajout d'une fonction pour réinitialiser toutes les données
function resetAllData() {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données de l\'extension ? Cette action est irréversible.')) {
        // Réinitialiser toutes les données stockées
        chrome.storage.local.clear(function () {
            chrome.storage.sync.clear(function () {
                alert('Toutes les données ont été effacées. L\'extension va redémarrer.');
                // Rafraîchir la page pour montrer les données réinitialisées
                window.location.reload();
            });
        });
    }
}

// Ajouter un écouteur d'événement pour le bouton de réinitialisation
document.addEventListener('DOMContentLoaded', function () {
    const resetButton = document.getElementById('reset-all-data');
    if (resetButton) {
        resetButton.addEventListener('click', resetAllData);
    }
}); 