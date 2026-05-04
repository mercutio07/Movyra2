/**
 * routes/movies.js
 * GET /api/movies/search  — recherche libre dans TMDB
 * GET /api/movies/:id     — détail d'un film
 */

import { Router } from 'express';
import { fetchMovieDetail } from '../services/tmdb.js';
import { enrichMovie } from '../services/vectorInference.js';
import fetch from 'node-fetch';

const router = Router();

const TMDB_BASE = 'https://api.themoviedb.org/3';
const LANGUAGE  = process.env.TMDB_LANGUAGE ?? 'fr-FR';

// ─── GET /api/movies/search?q=inception&page=1 ────────────────────────────────

router.get('/search', async (req, res, next) => {
    try {
        const query = req.query.q?.trim();
        const page  = parseInt(req.query.page ?? '1', 10);

        if (!query || query.length < 2) {
            return res.status(400).json({
                error: 'Paramètre "q" requis (min 2 caractères)',
                code:  'VALIDATION_ERROR',
            });
        }

        const url = new URL(`${TMDB_BASE}/search/movie`);
        url.searchParams.set('api_key',  process.env.TMDB_API_KEY);
        url.searchParams.set('language', LANGUAGE);
        url.searchParams.set('query',    query);
        url.searchParams.set('page',     page);

        const controller = new AbortController();
        const timer      = setTimeout(() => controller.abort(), 8000);

        const tmdbRes = await fetch(url.toString(), { signal: controller.signal });
        clearTimeout(timer);

        if (!tmdbRes.ok) throw new Error('Erreur TMDB search');

        const data    = await tmdbRes.json();
        const results = (data.results ?? []).map(raw => enrichMovie({
            id:         `tmdb-${raw.id}`,
            title:      raw.title ?? raw.original_title,
            year:       raw.release_date ? parseInt(raw.release_date.split('-')[0], 10) : null,
            genre:      null,
            genre_ids:  raw.genre_ids ?? [],
            runtime:    null,
            vote_average: raw.vote_average,
            popularity: raw.popularity,
            poster:     raw.poster_path
                ? `https://image.tmdb.org/t/p/w500${raw.poster_path}`
                : null,
            tmdbId:     raw.id,
            emotionVector: null,
        }));

        res.json({
            ok:      true,
            query,
            page,
            total:   data.total_results ?? 0,
            results,
        });

    } catch (err) {
        next(err);
    }
});

// ─── GET /api/movies/:id ──────────────────────────────────────────────────────

router.get('/:id', async (req, res, next) => {
    try {
        const tmdbId = parseInt(req.params.id, 10);

        if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
            return res.status(400).json({
                error: 'ID film invalide — doit être un entier positif',
                code:  'VALIDATION_ERROR',
            });
        }

        const movie   = await fetchMovieDetail(tmdbId);
        const enriched = enrichMovie(movie);

        res.json({ ok: true, movie: enriched });

    } catch (err) {
        next(err);
    }
});

export default router;
