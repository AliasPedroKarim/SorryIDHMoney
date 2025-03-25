/**
 * Gestion du cache des animes non trouvés
 */
class AnimeCacheManager {
    constructor() {
        this.cache = null;
        this.ready = this.initCache();
    }

    /**
     * Initialise le cache depuis le stockage local
     */
    async initCache() {
        return new Promise(resolve => {
            chrome.storage.local.get(['animeNotFoundCache'], result => {
                this.cache = result.animeNotFoundCache || {
                    items: {},
                    customUrls: {},
                    ignoredItems: []
                };
                resolve();
            });
        });
    }

    /**
     * Attend que le cache soit initialisé
     */
    async ensureCacheReady() {
        if (!this.cache) {
            await this.ready;
        }
    }

    /**
     * Sauvegarde le cache dans le stockage local
     */
    async saveCache() {
        return new Promise(resolve => {
            chrome.storage.local.set({ animeNotFoundCache: this.cache }, resolve);
        });
    }

    /**
     * Ajoute un anime non trouvé au cache
     * @param {string} searchTerm - Terme de recherche utilisé
     * @param {string} sourceUrl - URL de la page source
     * @param {string} title - Titre complet de l'anime
     * @param {boolean} autoIgnore - Si true, l'anime sera automatiquement ignoré après un certain nombre de tentatives
     */
    async addNotFoundAnime(searchTerm, sourceUrl, title, autoIgnore = true) {
        await this.ensureCacheReady();

        // Vérifier si l'anime est déjà dans la liste des ignorés
        if (this.cache.ignoredItems.includes(searchTerm)) {
            return true; // Retourner true pour indiquer que c'est ignoré
        }

        // Vérifier si un URL personnalisé existe
        if (this.cache.customUrls[searchTerm]) {
            return this.cache.customUrls[searchTerm];
        }

        // Ajouter l'anime au cache s'il n'existe pas encore
        if (!this.cache.items[searchTerm]) {
            this.cache.items[searchTerm] = {
                searchTerm,
                title,
                sourceUrl,
                timestamp: Date.now(),
                attempts: 1
            };
        } else {
            // Incrémenter le nombre de tentatives
            this.cache.items[searchTerm].attempts++;
            this.cache.items[searchTerm].timestamp = Date.now();

            // Ignorer automatiquement après 3 tentatives si autoIgnore est activé
            if (autoIgnore && this.cache.items[searchTerm].attempts >= 3) {
                await this.ignoreAnime(searchTerm);
                return true; // L'anime est maintenant ignoré
            }
        }

        await this.saveCache();
        return false;
    }

    /**
     * Vérifie si un terme de recherche est dans le cache
     * @param {string} searchTerm - Terme de recherche à vérifier
     */
    async isInCache(searchTerm) {
        await this.ensureCacheReady();

        // Vérifier si l'anime est dans la liste des ignorés
        if (this.cache.ignoredItems.includes(searchTerm)) {
            return true; // Ignoré
        }

        // Vérifier si un URL personnalisé existe
        if (this.cache.customUrls[searchTerm]) {
            return this.cache.customUrls[searchTerm]; // URL personnalisée
        }

        // Vérifier si l'anime est dans le cache
        return !!this.cache.items[searchTerm] ? false : null;
    }

    /**
     * Ignore un anime pour ne plus le rechercher
     * @param {string} searchTerm - Terme de recherche à ignorer
     */
    async ignoreAnime(searchTerm) {
        await this.ensureCacheReady();

        if (!this.cache.ignoredItems.includes(searchTerm)) {
            this.cache.ignoredItems.push(searchTerm);

            // Nettoyer les autres entrées si nécessaire
            if (this.cache.items[searchTerm]) {
                delete this.cache.items[searchTerm];
            }
            if (this.cache.customUrls[searchTerm]) {
                delete this.cache.customUrls[searchTerm];
            }

            await this.saveCache();
            return true;
        }
        return false;
    }

    /**
     * Définit une URL personnalisée pour un anime
     * @param {string} searchTerm - Terme de recherche
     * @param {string} customUrl - URL personnalisée AniList
     */
    async setCustomUrl(searchTerm, customUrl) {
        await this.ensureCacheReady();

        // Extraire l'ID AniList de l'URL
        const anilistId = this.extractAnilistId(customUrl);

        if (anilistId) {
            try {
                // Tenter de récupérer les données complètes via l'API AniList
                const mediaData = await this.fetchAnilistMediaData(anilistId);

                if (mediaData) {
                    // Stocker l'URL AniList et MAL si disponible
                    this.cache.customUrls[searchTerm] = {
                        anilistUrl: customUrl,
                        malUrl: mediaData.siteUrl ? mediaData.malUrl : null,
                        title: mediaData.title ? mediaData.title.romaji : searchTerm
                    };
                } else {
                    // Si on ne peut pas récupérer les données, stocker juste l'URL AniList
                    this.cache.customUrls[searchTerm] = {
                        anilistUrl: customUrl,
                        malUrl: null
                    };
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des données AniList:", error);
                // En cas d'erreur, stocker juste l'URL AniList
                this.cache.customUrls[searchTerm] = {
                    anilistUrl: customUrl,
                    malUrl: null
                };
            }
        } else {
            // URL non valide, stocker quand même
            this.cache.customUrls[searchTerm] = {
                anilistUrl: customUrl,
                malUrl: null
            };
        }

        // Retirer des ignorés si nécessaire
        if (this.cache.ignoredItems.includes(searchTerm)) {
            this.cache.ignoredItems = this.cache.ignoredItems.filter(item => item !== searchTerm);
        }

        // Retirer des items non trouvés si nécessaire
        if (this.cache.items[searchTerm]) {
            delete this.cache.items[searchTerm];
        }

        await this.saveCache();
        return true;
    }

    /**
     * Extrait l'ID AniList à partir d'une URL
     * @param {string} url - URL AniList
     * @returns {string|null} ID AniList ou null si non trouvé
     */
    extractAnilistId(url) {
        try {
            const urlObj = new URL(url);
            if (urlObj.hostname === 'anilist.co') {
                // Format attendu: https://anilist.co/anime/123456/titre-slug/
                const pathParts = urlObj.pathname.split('/').filter(Boolean);
                if (pathParts.length >= 2 && pathParts[0] === 'anime') {
                    const id = pathParts[1];
                    if (/^\d+$/.test(id)) { // Vérifier que c'est un nombre
                        return id;
                    }
                }
            }
            return null;
        } catch (e) {
            return null;
        }
    }

    /**
     * Récupère les données d'un anime via l'API AniList
     * @param {string} id - ID AniList
     * @returns {Object|null} Données de l'anime ou null en cas d'erreur
     */
    async fetchAnilistMediaData(id) {
        try {
            const query = `
            query ($id: Int) {
                Media (id: $id, type: ANIME) {
                    id
                    title {
                        romaji
                        english
                        native
                    }
                    siteUrl
                    externalLinks {
                        url
                        site
                    }
                }
            }
            `;

            const variables = {
                id: parseInt(id)
            };

            const response = await fetch('https://graphql.anilist.co', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    query: query,
                    variables: variables
                })
            });

            const data = await response.json();

            if (data.data && data.data.Media) {
                const media = data.data.Media;
                // Rechercher l'URL MAL dans les liens externes
                let malUrl = null;
                if (media.externalLinks) {
                    const malLink = media.externalLinks.find(link =>
                        link.site === 'MyAnimeList' || link.url.includes('myanimelist.net')
                    );
                    if (malLink) {
                        malUrl = malLink.url;
                    }
                }

                return {
                    title: media.title,
                    siteUrl: media.siteUrl,
                    malUrl: malUrl
                };
            }

            return null;
        } catch (error) {
            console.error("Erreur lors de la requête à l'API AniList:", error);
            return null;
        }
    }

    /**
     * Récupère tous les animes non trouvés
     */
    async getAllNotFoundAnimes() {
        await this.ensureCacheReady();
        return {
            items: this.cache.items,
            customUrls: this.cache.customUrls,
            ignoredItems: this.cache.ignoredItems
        };
    }

    /**
     * Supprime un anime du cache
     * @param {string} searchTerm - Terme de recherche à supprimer
     */
    async removeAnime(searchTerm) {
        await this.ensureCacheReady();

        let modified = false;

        if (this.cache.items[searchTerm]) {
            delete this.cache.items[searchTerm];
            modified = true;
        }
        if (this.cache.customUrls[searchTerm]) {
            delete this.cache.customUrls[searchTerm];
            modified = true;
        }
        if (this.cache.ignoredItems.includes(searchTerm)) {
            this.cache.ignoredItems = this.cache.ignoredItems.filter(item => item !== searchTerm);
            modified = true;
        }

        if (modified) {
            await this.saveCache();
            return true;
        }
        return false;
    }
}

// Exporter une instance unique
export const animeCache = new AnimeCacheManager(); 