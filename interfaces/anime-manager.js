import { animeCache } from '../scripts/anime-cache-manager.js';
import { showToast } from '../libs/toast-manager.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Gestion des onglets
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    // Sélectionner le premier onglet par défaut
    tabs[0].classList.add('active');
    tabContents[0].classList.add('active');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Retirer la classe active de tous les onglets
            tabs.forEach(t => t.classList.remove('active'));
            // Ajouter la classe active à l'onglet cliqué
            tab.classList.add('active');

            // Masquer tous les contenus d'onglet
            tabContents.forEach(content => {
                content.classList.remove('active');
            });

            // Afficher le contenu d'onglet correspondant
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // Recherche d'animes
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        filterAnimeItems(searchTerm);
    });

    // Chargement initial des données
    await loadAnimeData();

    // Focus sur un anime spécifique si demandé
    const params = new URLSearchParams(window.location.search);
    const highlightTerm = params.get('highlight');
    if (highlightTerm) {
        highlightAnimeItem(highlightTerm);
    }
});

/**
 * Chargement des données d'anime depuis le cache
 */
async function loadAnimeData() {
    try {
        const data = await animeCache.getAllNotFoundAnimes();

        // Animes non trouvés
        renderAnimeList('not-found', data.items, renderNotFoundItem);

        // URLs personnalisées
        const customUrlItems = Object.entries(data.customUrls).map(([searchTerm, url]) => ({
            searchTerm,
            url
        }));
        renderAnimeList('custom-urls', customUrlItems, renderCustomUrlItem);

        // Animes ignorés
        const ignoredItems = data.ignoredItems.map(term => ({ searchTerm: term }));
        renderAnimeList('ignored', ignoredItems, renderIgnoredItem);
    } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        showToast("Erreur lors du chargement des données", { type: 'error' });
    }
}

/**
 * Rendu d'une liste d'animes
 */
function renderAnimeList(listType, items, renderFunction) {
    const list = document.getElementById(`${listType}-list`);
    const emptyMessage = document.getElementById(`${listType}-empty`);

    // Vider la liste
    list.innerHTML = '';

    if (Object.keys(items).length === 0) {
        list.style.display = 'none';
        emptyMessage.style.display = 'block';
        return;
    }

    list.style.display = 'block';
    emptyMessage.style.display = 'none';

    // Trier les éléments par titre ou terme de recherche
    const sortedItems = Array.isArray(items)
        ? items
        : Object.values(items).sort((a, b) =>
            (a.title || a.searchTerm).localeCompare(b.title || b.searchTerm)
        );

    // Générer les éléments de liste
    sortedItems.forEach(item => {
        const listItem = document.createElement('li');
        listItem.className = 'anime-item';
        listItem.dataset.searchTerm = item.searchTerm.toLowerCase();
        listItem.innerHTML = renderFunction(item);
        list.appendChild(listItem);
    });

    // Ajouter les écouteurs d'événements après le rendu
    attachEventListeners(listType);
}

/**
 * Rendu d'un élément d'anime non trouvé
 */
function renderNotFoundItem(item) {
    return `
        <div class="anime-title">${item.title || item.searchTerm}</div>
        <div class="anime-search-term">Terme de recherche : ${item.searchTerm}</div>
        <div class="anime-source">Source : <a href="${item.sourceUrl}" target="_blank">${item.sourceUrl}</a></div>
        <div class="anime-actions">
            <button class="btn btn-primary search-anilist" data-search="${item.searchTerm}">
                Rechercher sur AniList
            </button>
            <div class="url-input">
                <input type="text" placeholder="URL AniList personnalisée" class="custom-url-input">
                <button class="btn btn-success save-custom-url" data-search="${item.searchTerm}">
                    Enregistrer
                </button>
            </div>
            <button class="btn btn-danger ignore-anime" data-search="${item.searchTerm}">
                Ignorer
            </button>
        </div>
    `;
}

/**
 * Rendu d'un élément d'URL personnalisée
 */
function renderCustomUrlItem(item) {
    const anilistUrl = item.url?.anilistUrl || item.url;
    const malUrl = item.url?.malUrl || null;

    return `
        <div class="anime-title">${item.searchTerm}</div>
        <div class="anime-source">
            URL AniList : <a href="${anilistUrl}" target="_blank">${anilistUrl}</a>
            ${malUrl ? `<br>URL MyAnimeList : <a href="${malUrl}" target="_blank">${malUrl}</a>` : ''}
        </div>
        <div class="anime-actions">
            <div class="url-input">
                <input type="text" value="${anilistUrl}" class="custom-url-input" placeholder="URL AniList">
                <button class="btn btn-success update-custom-url" data-search="${item.searchTerm}">
                    Mettre à jour
                </button>
            </div>
            <button class="btn btn-danger remove-custom-url" data-search="${item.searchTerm}">
                Supprimer
            </button>
        </div>
    `;
}

/**
 * Rendu d'un élément d'anime ignoré
 */
function renderIgnoredItem(item) {
    return `
        <div class="anime-title">${item.searchTerm}</div>
        <div class="anime-actions">
            <button class="btn btn-primary search-anilist" data-search="${item.searchTerm}">
                Rechercher sur AniList
            </button>
            <div class="url-input">
                <input type="text" placeholder="URL AniList personnalisée" class="custom-url-input">
                <button class="btn btn-success save-custom-url" data-search="${item.searchTerm}">
                    Ajouter URL
                </button>
            </div>
            <button class="btn btn-success restore-anime" data-search="${item.searchTerm}">
                Restaurer
            </button>
        </div>
    `;
}

/**
 * Filtrer les éléments d'anime selon un terme de recherche
 */
function filterAnimeItems(searchTerm) {
    const allItems = document.querySelectorAll('.anime-item');

    allItems.forEach(item => {
        const itemSearchTerm = item.dataset.searchTerm;
        const shouldShow = !searchTerm || itemSearchTerm.includes(searchTerm.toLowerCase());
        item.style.display = shouldShow ? 'block' : 'none';
    });

    // Mettre à jour les messages vides
    updateEmptyMessages();
}

/**
 * Mettre à jour l'affichage des messages vides
 */
function updateEmptyMessages() {
    const tabContents = document.querySelectorAll('.tab-content');

    tabContents.forEach(content => {
        const list = content.querySelector('.anime-list');
        const emptyMessage = content.querySelector('.empty-message');
        const visibleItems = Array.from(list.querySelectorAll('.anime-item')).filter(item =>
            item.style.display !== 'none'
        );

        if (visibleItems.length === 0) {
            list.style.display = 'none';
            emptyMessage.style.display = 'block';
        } else {
            list.style.display = 'block';
            emptyMessage.style.display = 'none';
        }
    });
}

/**
 * Mettre en évidence un élément d'anime spécifique
 */
function highlightAnimeItem(searchTerm) {
    if (!searchTerm) return;

    // Rechercher l'élément dans tous les onglets
    const allItems = document.querySelectorAll('.anime-item');
    let found = false;

    allItems.forEach(item => {
        if (item.dataset.searchTerm === searchTerm.toLowerCase()) {
            // Mettre en évidence l'élément
            item.classList.add('highlight');

            // Défiler jusqu'à l'élément
            item.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Ouvrir l'onglet approprié
            const tabContent = item.closest('.tab-content');
            if (tabContent) {
                const tabId = tabContent.id.replace('-tab', '');
                document.querySelector(`.tab[data-tab="${tabId}"]`).click();
            }

            found = true;
        } else {
            item.classList.remove('highlight');
        }
    });

    // Si l'élément n'est pas trouvé, essayer de le rechercher
    if (!found) {
        document.getElementById('search-input').value = searchTerm;
        filterAnimeItems(searchTerm);
    }
}

/**
 * Attacher les écouteurs d'événements après le rendu
 */
function attachEventListeners(listType) {
    try {
        // Actions spécifiques aux animes non trouvés
        if (listType === 'not-found') {
            // Rechercher sur AniList
            document.querySelectorAll('#not-found-list .search-anilist').forEach(btn => {
                btn.addEventListener('click', () => {
                    const searchTerm = btn.dataset.search;
                    const anilistSearchUrl = `https://anilist.co/search/anime?search=${encodeURIComponent(searchTerm)}`;
                    window.open(anilistSearchUrl, '_blank');
                });
            });

            // Enregistrer une URL personnalisée
            document.querySelectorAll('#not-found-list .save-custom-url').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const searchTerm = btn.dataset.search;
                    const inputElement = btn.parentElement.querySelector('.custom-url-input');
                    const customUrl = inputElement.value.trim();

                    if (!customUrl) {
                        showToast('Veuillez entrer une URL valide', { type: 'error' });
                        return;
                    }

                    if (!isValidAnilistUrl(customUrl)) {
                        showToast('L\'URL doit être une URL AniList valide', { type: 'error' });
                        return;
                    }

                    await animeCache.setCustomUrl(searchTerm, customUrl);
                    showToast('URL personnalisée enregistrée', { type: 'success' });
                    await loadAnimeData(); // Recharger les données
                });
            });

            // Ignorer un anime
            document.querySelectorAll('#not-found-list .ignore-anime').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const searchTerm = btn.dataset.search;
                    await animeCache.ignoreAnime(searchTerm);
                    showToast('Anime ignoré', { type: 'success' });
                    await loadAnimeData(); // Recharger les données
                });
            });
        }

        // Actions spécifiques aux URLs personnalisées
        else if (listType === 'custom-urls') {
            // Mettre à jour une URL personnalisée
            document.querySelectorAll('#custom-urls-list .update-custom-url').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const searchTerm = btn.dataset.search;
                    const inputElement = btn.parentElement.querySelector('.custom-url-input');
                    const customUrl = inputElement.value.trim();

                    if (!customUrl) {
                        showToast('Veuillez entrer une URL valide', { type: 'error' });
                        return;
                    }

                    if (!isValidAnilistUrl(customUrl)) {
                        showToast('L\'URL doit être une URL AniList valide', { type: 'error' });
                        return;
                    }

                    await animeCache.setCustomUrl(searchTerm, customUrl);
                    showToast('URL personnalisée mise à jour', { type: 'success' });
                });
            });

            // Supprimer une URL personnalisée
            document.querySelectorAll('#custom-urls-list .remove-custom-url').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const searchTerm = btn.dataset.search;
                    await animeCache.removeAnime(searchTerm);
                    showToast('URL personnalisée supprimée', { type: 'success' });
                    await loadAnimeData(); // Recharger les données
                });
            });
        }

        // Actions spécifiques aux animes ignorés
        else if (listType === 'ignored') {
            // Rechercher sur AniList
            document.querySelectorAll('#ignored-list .search-anilist').forEach(btn => {
                btn.addEventListener('click', () => {
                    const searchTerm = btn.dataset.search;
                    const anilistSearchUrl = `https://anilist.co/search/anime?search=${encodeURIComponent(searchTerm)}`;
                    window.open(anilistSearchUrl, '_blank');
                });
            });

            // Ajouter une URL personnalisée pour un anime ignoré
            document.querySelectorAll('#ignored-list .save-custom-url').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const searchTerm = btn.dataset.search;
                    const inputElement = btn.parentElement.querySelector('.custom-url-input');
                    const customUrl = inputElement.value.trim();

                    if (!customUrl) {
                        showToast('Veuillez entrer une URL valide', { type: 'error' });
                        return;
                    }

                    if (!isValidAnilistUrl(customUrl)) {
                        showToast('L\'URL doit être une URL AniList valide', { type: 'error' });
                        return;
                    }

                    await animeCache.setCustomUrl(searchTerm, customUrl);
                    showToast('URL personnalisée ajoutée et anime restauré', { type: 'success' });
                    await loadAnimeData(); // Recharger les données
                });
            });

            // Restaurer un anime ignoré
            document.querySelectorAll('#ignored-list .restore-anime').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const searchTerm = btn.dataset.search;
                    await animeCache.removeAnime(searchTerm);
                    showToast('Anime restauré', { type: 'success' });
                    await loadAnimeData(); // Recharger les données
                });
            });
        }
    } catch (error) {
        console.error("Erreur lors de l'attache des événements:", error);
        showToast("Erreur lors de l'initialisation des boutons", { type: 'error' });
    }
}

/**
 * Vérifier si une URL est une URL AniList valide
 */
function isValidAnilistUrl(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname === 'anilist.co' && urlObj.pathname.includes('/anime/');
    } catch (e) {
        return false;
    }
} 