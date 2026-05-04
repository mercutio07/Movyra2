/**
 * routes/recommend.js
 * POST /api/recommend — Pipeline complet Movyra
 *
 * Body attendu :
 * {
 *   vibe:    'melancolie' | 'mystere' | 'tension' | 'reverie' | 'chaleur' | 'vertige'
 *   context: 'solo' | 'couple' | 'kids'
 *   filter:  'short' | 'long' | null
 *   media:   'movies' (seul médium supporté pour l'instant)
 * }
 */

import { Router } from 'express';
import { fetchMoviesWithPlatforms, VIBE_TO_GENRES } from '../services/tmdb.js';
import { enrichMovies } from '../services/vectorInference.js';
import { Recommender } from '../services/recommender.js';

const router = Router();

// ─── Validation ───────────────────────────────────────────────────────────────

const VALID_VIBES    = Object.keys(VIBE_TO_GENRES);
const VALID_CONTEXTS = ['solo', 'couple', 'kids'];
const VALID_FILTERS  = ['short', 'long', null];

function validate(body) {
    const { vibe, context, filter = null } = body;

    if (!vibe || !VALID_VIBES.includes(vibe)) {
        const err = new Error(`Vibe invalide. Valeurs acceptées : ${VALID_VIBES.join(', ')}`);
        err.status = 400;
        throw err;
    }
    if (!context || !VALID_CONTEXTS.includes(context)) {
        const err = new Error(`Contexte invalide. Valeurs acceptées : ${VALID_CONTEXTS.join(', ')}`);
        err.status = 400;
        throw err;
    }
    if (!VALID_FILTERS.includes(filter)) {
        const err = new Error(`Filtre invalide. Valeurs acceptées : short, long, null`);
        err.status = 400;
        throw err;
    }

    return { vibe, context, filter };
}

// ─── Config média (équivalent MEDIA_MOVIES côté serveur) ─────────────────────

const MEDIA_MOVIES_CONFIG = {
    id:         'movies',
    filterKey:  'duration',
    filterThresholds: { short: 110 },
};

// ─── Route principale ─────────────────────────────────────────────────────────

router.post('/', async (req, res, next) => {
    try {
        const state = validate(req.body);

        // 1. Fetch films TMDB pour la vibe demandée
        const rawMovies = await fetchMoviesWithPlatforms(state.vibe, 3);

        // 2. Injection des emotionVector via inférence
        const movies = enrichMovies(rawMovies);

        // 3. Pipeline recommender
        const results = await Recommender.pick(movies, state, MEDIA_MOVIES_CONFIG);

        res.json({
            ok:      true,
            count:   results.length,
            state,
            results,
        });

    } catch (err) {
        next(err);
    }
});

export default router;
