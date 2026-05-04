/**
 * services/vectorInference.js — Inférence automatique des emotionVector
 * Movyra · Mai 2026
 *
 * Génère automatiquement { energy, tone, depth } depuis les métadonnées TMDB.
 * Permet de scaler à des milliers de films sans calibrage manuel.
 *
 * Toutes les valeurs sont clampées entre 0.0 et 1.0.
 * Point de départ neutre : { energy: 0.5, tone: 0.5, depth: 0.5 }
 */

// ─── IDs genres TMDB (référence) ─────────────────────────────────────────────
const GENRE = {
    ACTION:      28,
    ADVENTURE:   12,
    ANIMATION:   16,
    COMEDY:      35,
    CRIME:       80,
    DOCUMENTARY: 99,
    DRAMA:       18,
    FAMILY:      10751,
    FANTASY:     14,
    HISTORY:     36,
    HORROR:      27,
    MUSIC:       10402,
    MYSTERY:     9648,
    ROMANCE:     10749,
    SF:          878,
    THRILLER:    53,
    WAR:         10752,
    WESTERN:     37,
};

// ─── Règles d'inférence ───────────────────────────────────────────────────────
/**
 * Chaque règle est : { axis, delta, condition(movie) }
 * On applique toutes les règles qui passent, puis on clamp [0,1].
 */
const INFERENCE_RULES = [

    // ── ENERGY ────────────────────────────────────────────────────────────────
    {
        axis: 'energy', delta: +0.30,
        condition: m => hasGenre(m, GENRE.ACTION),
        label: 'Action → energy++'
    },
    {
        axis: 'energy', delta: +0.25,
        condition: m => hasGenre(m, GENRE.THRILLER) && !hasGenre(m, GENRE.DRAMA),
        label: 'Thriller pur → energy++'
    },
    {
        axis: 'energy', delta: +0.25,
        condition: m => hasGenre(m, GENRE.HORROR),
        label: 'Horror → energy++'
    },
    {
        axis: 'energy', delta: +0.20,
        condition: m => hasGenre(m, GENRE.ADVENTURE),
        label: 'Adventure → energy+'
    },
    {
        axis: 'energy', delta: +0.15,
        condition: m => hasGenre(m, GENRE.COMEDY) && !hasGenre(m, GENRE.DRAMA),
        label: 'Comedy pure → energy+'
    },
    {
        axis: 'energy', delta: +0.10,
        condition: m => (m.popularity ?? 0) > 100,
        label: 'Film populaire → energy+'
    },
    {
        axis: 'energy', delta: -0.20,
        condition: m => hasGenre(m, GENRE.DRAMA) && !hasGenre(m, GENRE.ACTION),
        label: 'Drama sans action → energy--'
    },
    {
        axis: 'energy', delta: -0.15,
        condition: m => hasGenre(m, GENRE.ROMANCE) && !hasGenre(m, GENRE.ACTION),
        label: 'Romance sans action → energy--'
    },
    {
        axis: 'energy', delta: -0.10,
        condition: m => (m.runtime ?? 0) > 150,
        label: 'Film long (>150min) → energy--'
    },
    {
        axis: 'energy', delta: -0.15,
        condition: m => hasGenre(m, GENRE.DOCUMENTARY),
        label: 'Documentaire → energy--'
    },

    // ── TONE ──────────────────────────────────────────────────────────────────
    {
        axis: 'tone', delta: +0.30,
        condition: m => hasGenre(m, GENRE.COMEDY),
        label: 'Comedy → tone++'
    },
    {
        axis: 'tone', delta: +0.25,
        condition: m => hasGenre(m, GENRE.FAMILY),
        label: 'Family → tone++'
    },
    {
        axis: 'tone', delta: +0.20,
        condition: m => hasGenre(m, GENRE.ANIMATION) && !hasGenre(m, GENRE.HORROR),
        label: 'Animation sans horreur → tone+'
    },
    {
        axis: 'tone', delta: +0.15,
        condition: m => hasGenre(m, GENRE.ROMANCE),
        label: 'Romance → tone+'
    },
    {
        axis: 'tone', delta: +0.10,
        condition: m => (m.vote_average ?? 0) > 7.5,
        label: 'Note > 7.5 → tone+'
    },
    {
        axis: 'tone', delta: +0.10,
        condition: m => hasGenre(m, GENRE.MUSIC),
        label: 'Musical → tone+'
    },
    {
        axis: 'tone', delta: -0.30,
        condition: m => hasGenre(m, GENRE.HORROR),
        label: 'Horror → tone--'
    },
    {
        axis: 'tone', delta: -0.25,
        condition: m => hasGenre(m, GENRE.CRIME) && !hasGenre(m, GENRE.COMEDY),
        label: 'Crime sans comédie → tone--'
    },
    {
        axis: 'tone', delta: -0.20,
        condition: m => hasGenre(m, GENRE.WAR),
        label: 'War → tone--'
    },
    {
        axis: 'tone', delta: -0.15,
        condition: m => hasGenre(m, GENRE.THRILLER) && !hasGenre(m, GENRE.COMEDY),
        label: 'Thriller sans comédie → tone--'
    },
    {
        axis: 'tone', delta: -0.15,
        condition: m => (m.vote_average ?? 10) < 5.0,
        label: 'Note < 5 → tone--'
    },

    // ── DEPTH ─────────────────────────────────────────────────────────────────
    {
        axis: 'depth', delta: +0.30,
        condition: m => hasGenre(m, GENRE.DRAMA),
        label: 'Drama → depth++'
    },
    {
        axis: 'depth', delta: +0.25,
        condition: m => hasGenre(m, GENRE.MYSTERY),
        label: 'Mystery → depth++'
    },
    {
        axis: 'depth', delta: +0.20,
        condition: m => (m.runtime ?? 0) > 130,
        label: 'Film long (>130min) → depth+'
    },
    {
        axis: 'depth', delta: +0.20,
        condition: m => (m.vote_average ?? 0) > 8.0,
        label: 'Note > 8 → depth+'
    },
    {
        axis: 'depth', delta: +0.15,
        condition: m => hasGenre(m, GENRE.SF),
        label: 'SF → depth+'
    },
    {
        axis: 'depth', delta: +0.15,
        condition: m => hasGenre(m, GENRE.HISTORY),
        label: 'History → depth+'
    },
    {
        axis: 'depth', delta: +0.10,
        condition: m => hasGenre(m, GENRE.WAR),
        label: 'War → depth+'
    },
    {
        axis: 'depth', delta: -0.20,
        condition: m => hasGenre(m, GENRE.COMEDY) && !hasGenre(m, GENRE.DRAMA),
        label: 'Comedy sans drama → depth--'
    },
    {
        axis: 'depth', delta: -0.20,
        condition: m => hasGenre(m, GENRE.ACTION) && !hasGenre(m, GENRE.DRAMA) && !hasGenre(m, GENRE.SF),
        label: 'Action pure → depth--'
    },
    {
        axis: 'depth', delta: -0.15,
        condition: m => hasGenre(m, GENRE.ANIMATION) && hasGenre(m, GENRE.FAMILY),
        label: 'Animation famille → depth--'
    },
    {
        axis: 'depth', delta: -0.10,
        condition: m => (m.runtime ?? 999) < 90,
        label: 'Film court (<90min) → depth--'
    },
];

// ─── Utilitaires ─────────────────────────────────────────────────────────────

/**
 * Vérifie si un film contient un genre donné.
 * Compatible avec les deux formats TMDB :
 *   - /discover → genre_ids: [28, 18, ...]
 *   - /movie/:id → genres: [{ id: 28, name: 'Action' }, ...]
 */
function hasGenre(movie, genreId) {
    if (movie.genre_ids) return movie.genre_ids.includes(genreId);
    if (movie.genres)    return movie.genres.some(g => g.id === genreId);
    return false;
}

/**
 * Clamp une valeur entre min et max.
 */
function clamp(value, min = 0.0, max = 1.0) {
    return Math.min(max, Math.max(min, value));
}

// ─── Moteur d'inférence ───────────────────────────────────────────────────────

/**
 * Génère un emotionVector depuis les métadonnées TMDB d'un film.
 *
 * @param {Object} movie — film au format TMDB (raw ou mappé Movyra)
 * @returns {{ energy: number, tone: number, depth: number }}
 */
function inferVector(movie) {
    // Point de départ neutre
    const vec = { energy: 0.5, tone: 0.5, depth: 0.5 };

    // Application de toutes les règles
    for (const rule of INFERENCE_RULES) {
        if (rule.condition(movie)) {
            vec[rule.axis] += rule.delta;
        }
    }

    // Clamp final [0, 1] avec arrondi à 2 décimales
    return {
        energy: Math.round(clamp(vec.energy) * 100) / 100,
        tone:   Math.round(clamp(vec.tone)   * 100) / 100,
        depth:  Math.round(clamp(vec.depth)  * 100) / 100,
    };
}

/**
 * Injecte l'emotionVector dans un film Movyra.
 * Respecte un vecteur déjà présent (calibrage manuel prioritaire).
 *
 * @param {Object} movie — film au format Movyra
 * @returns {Object}     — film avec emotionVector
 */
function enrichMovie(movie) {
    if (movie.emotionVector) return movie; // calibrage manuel conservé
    return { ...movie, emotionVector: inferVector(movie) };
}

/**
 * Enrichit un tableau de films.
 *
 * @param {Object[]} movies
 * @returns {Object[]}
 */
function enrichMovies(movies) {
    return movies.map(enrichMovie);
}

/**
 * Mode debug : affiche les règles appliquées pour un film donné.
 * Usage : inferDebug(movie)
 *
 * @param {Object} movie
 * @returns {Object} — { vector, rulesApplied }
 */
function inferDebug(movie) {
    const rulesApplied = INFERENCE_RULES
        .filter(rule => rule.condition(movie))
        .map(rule => ({ label: rule.label, axis: rule.axis, delta: rule.delta }));

    const vector = inferVector(movie);

    console.log(`\n[VectorInference] "${movie.title ?? 'Film inconnu'}"`);
    console.log('  Genres :', movie.genre_ids ?? movie.genres?.map(g => g.name) ?? []);
    console.log('  Runtime:', movie.runtime ?? movie.duration ?? 'N/A', 'min');
    console.log('  Rating :', movie.vote_average ?? movie.rating ?? 'N/A');
    console.log('  Règles appliquées :');
    rulesApplied.forEach(r => console.log(`    ${r.delta > 0 ? '+' : ''}${r.delta} ${r.axis} — ${r.label}`));
    console.log('  Vecteur final :', vector);

    return { vector, rulesApplied };
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export {
    inferVector,
    enrichMovie,
    enrichMovies,
    inferDebug,
    INFERENCE_RULES,
    GENRE,
};
