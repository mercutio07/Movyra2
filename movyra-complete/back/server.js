/**
 * server.js — Point d'entrée Movyra API
 * Node.js / Express · Mai 2026
 */

import 'dotenv/config';
import express        from 'express';
import cors           from 'cors';
import helmet         from 'helmet';
import rateLimit      from 'express-rate-limit';

import recommendRouter from './routes/recommend.js';
import moviesRouter    from './routes/movies.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app  = express();
const PORT = process.env.PORT ?? 3000;

// ─── Sécurité ─────────────────────────────────────────────────────────────────

// Headers HTTP sécurisés
app.use(helmet());

// CORS — en prod, remplacer '*' par le domaine exact du front Movyra
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.ALLOWED_ORIGIN ?? '*'
        : '*',
    methods: ['GET', 'POST'],
}));

// Rate limiting — 60 requêtes / minute par IP
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max:      60,
    message:  { error: 'Trop de requêtes, réessaie dans une minute.', code: 'RATE_LIMIT' },
    standardHeaders: true,
    legacyHeaders:   false,
});
app.use('/api/', limiter);

// Body parser JSON
app.use(express.json({ limit: '10kb' })); // limite la taille des requêtes

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/recommend', recommendRouter);
app.use('/api/movies',    moviesRouter);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        ok:        true,
        version:   '1.0.0',
        uptime:    Math.floor(process.uptime()),
        env:       process.env.NODE_ENV ?? 'development',
        services: {
            tmdb:     !!process.env.TMDB_API_KEY,
            claude:   !!process.env.ANTHROPIC_API_KEY,
        },
    });
});

// ─── Erreurs ──────────────────────────────────────────────────────────────────

app.use(notFound);
app.use(errorHandler);

// ─── Démarrage ────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
    console.log(`\n🎬 Movyra API démarrée`);
    console.log(`   Port    : ${PORT}`);
    console.log(`   Env     : ${process.env.NODE_ENV ?? 'development'}`);
    console.log(`   TMDB    : ${process.env.TMDB_API_KEY ? '✅ configuré' : '❌ manquant'}`);
    console.log(`   Claude  : ${process.env.ANTHROPIC_API_KEY ? '✅ configuré' : '❌ manquant'}`);
    console.log(`\n   Routes disponibles :`);
    console.log(`   POST /api/recommend`);
    console.log(`   GET  /api/movies/search?q=`);
    console.log(`   GET  /api/movies/:id`);
    console.log(`   GET  /api/health\n`);
});

export default app;
