/**
 * middleware/errorHandler.js
 * Gestionnaire d'erreurs centralisé pour Express.
 *
 * Distingue :
 * - TmdbError (erreurs connues TMDB) → message générique au client
 * - Erreurs de validation             → 400 avec message explicite
 * - Erreurs inconnues                 → 500 sans détails internes
 */

import { TmdbError } from '../services/tmdb.js';

// ─── Middleware 404 ───────────────────────────────────────────────────────────
export function notFound(req, res, next) {
    res.status(404).json({
        error:   'Route introuvable',
        path:    req.originalUrl,
        method:  req.method,
    });
}

// ─── Middleware erreurs globales ──────────────────────────────────────────────
export function errorHandler(err, req, res, next) {
    // Log interne complet (jamais envoyé au client)
    console.error(`[Error] ${req.method} ${req.originalUrl}`, {
        name:    err.name,
        message: err.message,
        stack:   process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });

    // TmdbError — service externe indisponible
    if (err instanceof TmdbError) {
        return res.status(err.status ?? 502).json({
            error: err.message,
            code:  'TMDB_ERROR',
        });
    }

    // Erreur de validation (vibe inconnue, params manquants…)
    if (err.status === 400 || err.name === 'ValidationError') {
        return res.status(400).json({
            error: err.message,
            code:  'VALIDATION_ERROR',
        });
    }

    // Erreur inconnue → 500 générique
    return res.status(500).json({
        error: 'Une erreur interne est survenue',
        code:  'INTERNAL_ERROR',
    });
}
