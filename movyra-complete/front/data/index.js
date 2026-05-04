/**
 * data/index.js
 * Registre des médias disponibles — source de vérité unique.
 *
 * Pour ajouter un nouveau média (musique, BD...) :
 * 1. Créer data/music.js avec le contrat unifié
 * 2. L'ajouter dans MEDIA_REGISTRY ci-dessous
 * 3. C'est tout — app.js et recommender.js s'adaptent automatiquement.
 */
const MEDIA_REGISTRY = [
    MEDIA_MOVIES,
    // MEDIA_BOOKS,   ← décommenter quand le module livres sera prêt
    // MEDIA_MUSIC,   ← décommenter quand data/music.js sera prêt
    // MEDIA_COMICS,  ← décommenter quand data/comics.js sera prêt
];

/**
 * Récupère la config d'un média par son id.
 * @param {string} mediaId
 * @returns {Object|null}
 */
function getMedia(mediaId) {
    return MEDIA_REGISTRY.find(m => m.id === mediaId) ?? null;
}

/**
 * Récupère les items d'un média filtrés par vibe.
 * @param {string} mediaId
 * @param {string} vibeId
 * @returns {Array}
 */
function getItems(mediaId, vibeId) {
    const media = getMedia(mediaId);
    if (!media) return [];
    return media.items.filter(item => item.vibe === vibeId);
}
