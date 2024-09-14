// Récupère les informations sur l'extension
document.addEventListener('DOMContentLoaded', function() {
    // Récupère le nom et la version depuis le manifest
    const manifest = chrome.runtime.getManifest();
    document.getElementById('extension-name').textContent = manifest.name;
    document.getElementById('extension-version').textContent = manifest.version;
  
    // Si tu souhaites ajouter des informations supplémentaires, tu peux le faire ici.
    const additionalInfo = "Informations supplémentaires à ajouter plus tard.";
    document.getElementById('additional-info').textContent = additionalInfo;
  });
  