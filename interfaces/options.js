// Charger les paramètres sauvegardés
document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.sync.get({
        backgroundColor: '#ffffff',
        theme: 'light',
        censure: false,
        enableMal: true,
        enableAnilist: true,
        enableTwitchRewards: true,
        enableToasts: true
    }, function (items) {
        document.getElementById('background-color').value = items.backgroundColor;
        document.getElementById('theme').value = items.theme;
        document.getElementById('censure').checked = items.censure;
        document.getElementById('enable-mal').checked = items.enableMal;
        document.getElementById('enable-anilist').checked = items.enableAnilist;
        document.getElementById('enable-twitch-rewards').checked = items.enableTwitchRewards;
        document.getElementById('enable-toasts').checked = items.enableToasts;
    });
});

// Écouteurs d'événements pour les changements
document.getElementById('background-color').addEventListener('input', function (e) {
    chrome.storage.sync.set({ backgroundColor: e.target.value });
});

document.getElementById('theme').addEventListener('change', function (e) {
    chrome.storage.sync.set({ theme: e.target.value });
});

document.getElementById('censure').addEventListener('change', function (e) {
    chrome.storage.sync.set({ censure: e.target.checked });
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: "updateCensure",
            censure: e.target.checked
        });
    });
});

document.getElementById('enable-mal').addEventListener('change', function (e) {
    chrome.storage.sync.set({ enableMal: e.target.checked });
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: "updateAnimeSwitcher",
            type: "mal",
            enabled: e.target.checked
        });
    });
});

document.getElementById('enable-anilist').addEventListener('change', function (e) {
    chrome.storage.sync.set({ enableAnilist: e.target.checked });
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: "updateAnimeSwitcher",
            type: "anilist",
            enabled: e.target.checked
        });
    });
});

document.getElementById('enable-twitch-rewards').addEventListener('change', function (e) {
    chrome.storage.sync.set({ enableTwitchRewards: e.target.checked });
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: "updateTwitchRewards",
            enabled: e.target.checked
        });
    });
});

document.getElementById('enable-toasts').addEventListener('change', function (e) {
    chrome.storage.sync.set({ enableToasts: e.target.checked });
});
