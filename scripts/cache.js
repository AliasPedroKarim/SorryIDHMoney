// Namespace global pour le cache
const cacheNamespace = 'sorryidhmoney';

// Fonction pour mettre en cache des données
export function cacheData(cacheKey, data, expirationInSeconds, terms = []) {
  const fullKey = `${cacheNamespace}.${cacheKey}`;
  const expirationTimestamp = Date.now() + expirationInSeconds * 1000;
  const cacheObject = {
    data: data,
    expires: expirationTimestamp,
    terms: terms,
  };

  // Utilisation de chrome.storage.local pour mettre en cache
  chrome.storage.local.set({ [fullKey]: cacheObject });
}

// Fonction pour obtenir des données en cache par clé de cache
export function getCachedDataByKey(cacheKey) {
  return new Promise((resolve, reject) => {
    const fullKey = `${cacheNamespace}.${cacheKey}`;

    // Utilisation de chrome.storage.local pour récupérer les données
    chrome.storage.local.get([fullKey], (result) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }

      const cachedData = result[fullKey];
      if (cachedData && cachedData.expires > Date.now()) {
        // Les données en cache sont valides, retournez-les
        resolve(cachedData.data);
      } else {
        resolve(null);
      }
    });
  });
}

// Fonction pour obtenir des données en cache par terme
export function getCachedDataByTerm(term) {
    return new Promise((resolve, reject) => {
      const results = [];
  
      // Utilisation de chrome.storage.local pour obtenir toutes les clés de cache
      chrome.storage.local.get(null, (items) => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
  
        // Parcourir toutes les clés
        for (const key in items) {
          if (key.startsWith(`${cacheNamespace}.`)) {
            const cachedData = items[key];
            if (cachedData.expires > Date.now() && cachedData.terms.includes(term)) {
              // Les données en cache sont valides et correspondent au terme, ajoutez-les aux résultats
              const cacheKey = key.substring(cacheNamespace.length + 1);
              results.push({ cacheKey, data: cachedData.data });
            }
          }
        }
        resolve(results);
      });
    });
  }
  

// Fonction pour ajouter un terme à une clé de cache existante
export function addTermToCache(cacheKey, term) {
  const fullKey = `${cacheNamespace}.${cacheKey}`;

  // Utilisation de chrome.storage.local pour récupérer les données existantes
  chrome.storage.local.get([fullKey], (result) => {
    if (!chrome.runtime.lastError) {
      const cachedData = result[fullKey];
      if (cachedData) {
        // La clé de cache existe, ajoutez le terme au tableau des termes
        if (!cachedData.terms.includes(term)) {
          cachedData.terms.push(term);

          // Mettez à jour les données en cache avec le terme ajouté
          chrome.storage.local.set({ [fullKey]: cachedData });
        }
      }
    }
  });
}
