// Sauvegarde des options
function saveOptions(event) {
    event.preventDefault();

    const backgroundColor = document.getElementById('background-color').value;
    const theme = document.getElementById('theme').value;

    chrome.storage.sync.set({
        backgroundColor: backgroundColor,
        theme: theme
    }, function () {
        alert('Les paramètres ont été sauvegardés');
    });
}

// Chargement des options sauvegardées
function restoreOptions() {
    chrome.storage.sync.get({
        backgroundColor: '#ffffff', // Valeur par défaut
        theme: 'light'              // Valeur par défaut
    }, function (items) {
        document.getElementById('background-color').value = items.backgroundColor;
        document.getElementById('theme').value = items.theme;
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('settings-form').addEventListener('submit', saveOptions);
