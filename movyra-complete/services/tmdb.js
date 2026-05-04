/**
 * services/tmdb.js — Adaptateur TMDB pour Movyra
 * Audit sécurité v1.2 — Mai 2026
 *
 * Corrections appliquées :
 * - Timeout AbortController sur tous les fetch (8s)
 * - Validation de API_KEY au démarrage
 * - Validation de movieId avant appel
 * - Messages d'erreur internes vs externes séparés
 * - T04 : clé API migrée vers Authorization Bearer (plus de api_key= dans les URLs)
 */

import fetch from 'node-fetch';

// ─── Configuration ────────────────────────────────────────────────────────────

const TMDB_BASE     = 'https://api.themoviedb.org/3';
const API_KEY       = process.env.TMDB_API_KEY;
const LANGUAGE      = process.env.TMDB_LANGUAGE ?? 'fr-FR';
const REGION        = process.env.TMDB_REGION   ?? 'FR';
const FETCH_TIMEOUT = 8000; // 8 secondes max par appel TMDB

// ─── Validation au démarrage ─────────────────────────────────────────────────
/**
 * FIX : vérification immédiate de la clé API.
 * Si absente, le serveur refuse de démarrer avec un message clair.
 */
if (!API_KEY) {
    throw new Error(
        '[TMDB] TMDB_API_KEY manquante. ' +
        'Vérifiez votre fichier .env (voir .env.example).'
    );
}

// ─── Mapping vibe → genre IDs TMDB ───────────────────────────────────────────

const VIBE_TO_GENRES = {
    melancolie: [18, 10749],
    mystere:    [9648, 53, 80],
    tension:    [28, 53, 27],
    reverie:    [878, 14, 16],
    chaleur:    [35, 10751, 10402],
    vertige:    [12, 878, 36, 10752],
};

// ─── Mapping plateformes ──────────────────────────────────────────────────────

const PROVIDER_MAP = {
    8:    'Netflix',
    119:  'Prime',
    337:  'Disney+',
    381:  'Canal+',
    56:   'OCS',
    2:    'Apple TV+',
    531:  'Paramount+',
    1899: 'Max',
};

// ─── Erreurs internes (logs serveur uniquement) ───────────────────────────────
/**
 * FIX : séparation claire entre erreur interne (loguée) et message client (générique).
 * On ne retourne jamais les détails TMDB au client final.
 */
class TmdbError extends Error {
    constructor(message, status) {
        super(message);
        this.name    = 'TmdbError';
        this.status  = status;
        this.isKnown = true; // permet de filtrer dans errorHandler.js
    }
}

// ─── Utilitaires ─────────────────────────────────────────────────────────────

function buildUrl(path, params = {}) {
    const url = new URL(`${TMDB_BASE}${path}`);
    url.searchParams.set('language', LANGUAGE);
    for (const [k, v] of Object.entries(params)) {
        url.searchParams.set(k, String(v));
    }
    return url.toString();
}

/**
 * FIX T04 : clé API dans le header Authorization Bearer.
 * La clé ne figure plus dans les URLs ni dans les logs Railway.
 * FIX audit sécurité : timeout AbortController sur chaque appel fetch.
 */
async function tmdbFetch(path, params = {}) {
    const controller = new AbortController();
    const timer      = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    try {
        const url = buildUrl(path, params);
        const res = await fetch(url, {
            signal:  controller.signal,
            headers: { 'Authorization': `Bearer ${API_KEY}` }, // ← Bearer auth
        });

        if (!res.ok) {
            // Log interne détaillé
            const err = await res.json().catch(() => ({}));
            console.error(`[TMDB] Erreur ${res.status} sur ${path} :`, err.status_message ?? res.statusText);

            // Erreur propre vers l'appelant — sans détails TMDB
            throw new TmdbError('Service de films temporairement indisponible', res.status);
        }

        return res.json();

    } catch (err) {
        if (err.name === 'AbortError') {
            console.error(`[TMDB] Timeout dépassé (${FETCH_TIMEOUT}ms) sur ${path}`);
            throw new TmdbError('Le service de films met trop de temps à répondre', 504);
        }
        throw err; // re-throw les TmdbError et autres erreurs connues
    } finally {
        clearTimeout(timer); // nettoyage systématique du timer
    }
}

// ─── Validation des paramètres ────────────────────────────────────────────────
/**
 * FIX : validation de movieId avant tout appel.
 * Un ID invalide retourne [] plutôt que de construire une URL cassée.
 */
function isValidMovieId(movieId) {
    return Number.isInteger(Number(movieId)) && Number(movieId) > 0;
}

// ─── Fetch plateformes ────────────────────────────────────────────────────────

async function fetchPlatforms(movieId) {
    // FIX : validation movieId
    if (!isValidMovieId(movieId)) {
        console.warn(`[TMDB] fetchPlatforms appelé avec un ID invalide : ${movieId}`);
        return [];
    }

    try {
        const data       = await tmdbFetch(`/movie/${movieId}/watch/providers`);
        const regionData = data.results?.[REGION];
        if (!regionData?.flatrate) return [];
        return regionData.flatrate
            .map(p => PROVIDER_MAP[p.provider_id])
            .filter(Boolean);
    } catch {
        return []; // pas de plateforme = pas d'erreur bloquante
    }
}

// ─── Mapping TMDB → Movyra ───────────────────────────────────────────────────

function mapMovie(raw, vibeId, platforms = []) {
    const year = raw.release_date
        ? parseInt(raw.release_date.split('-')[0], 10)
        : null;
    const genre = raw.genres?.[0]?.name ?? null;

    return {
        id:            `tmdb-${raw.id}`,
        title:         raw.title ?? raw.original_title,
        year,
        vibe:          vibeId,
        kids:          raw.adult === false && (raw.genre_ids ?? []).includes(10751),
        why:           raw.overview?.slice(0, 120) ?? '',
        duration:      raw.runtime ?? null,
        genre,
        director:      null,
        platforms,
        tmdbId:        raw.id,
        rating:        raw.vote_average ?? null,
        popularity:    raw.popularity ?? null,
        poster:        raw.poster_path
            ? `https://image.tmdb.org/t/p/w500${raw.poster_path}`
            : null,
        emotionVector: null,
    };
}

// ─── Fetch films par vibe ─────────────────────────────────────────────────────

async function fetchMoviesByVibe(vibeId, pages = 2) {
    const genreIds = VIBE_TO_GENRES[vibeId];
    if (!genreIds) throw new TmdbError(`Vibe inconnue : ${vibeId}`, 400);

    const genreParam = genreIds.join(',');
    const allMovies  = [];

    for (let page = 1; page <= pages; page++) {
        const data = await tmdbFetch('/discover/movie', {
            with_genres:        genreParam,
            sort_by:            'vote_average.desc',
            'vote_count.gte':   200,
            'vote_average.gte': 6.0,
            include_adult:      false,
            page,
            region: REGION,
        });
        const movies = (data.results ?? []).map(raw => mapMovie(raw, vibeId));
        allMovies.push(...movies);
    }

    return allMovies;
}

async function fetchMoviesWithPlatforms(vibeId, pages = 2) {
    const movies   = await fetchMoviesByVibe(vibeId, pages);
    const BATCH    = 5;
    const enriched = [];

    for (let i = 0; i < movies.length; i += BATCH) {
        const batch        = movies.slice(i, i + BATCH);
        const withPlatforms = await Promise.all(
            batch.map(async m => ({
                ...m,
                platforms: await fetchPlatforms(m.tmdbId),
            }))
        );
        enriched.push(...withPlatforms);
    }

    return enriched;
}

async function fetchMovieDetail(tmdbId) {
    if (!isValidMovieId(tmdbId)) {
        throw new TmdbError(`ID film invalide : ${tmdbId}`, 400);
    }
    const raw       = await tmdbFetch(`/movie/${tmdbId}`);
    const platforms = await fetchPlatforms(tmdbId);
    return mapMovie(raw, null, platforms);
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export {
    fetchMoviesByVibe,
    fetchMoviesWithPlatforms,
    fetchMovieDetail,
    fetchPlatforms,
    VIBE_TO_GENRES,
    PROVIDER_MAP,
    TmdbError,
};
