/**
 * recommender.js — Emotional Fingerprint Engine v3.1
 *
 * Architecture en 3 couches :
 * 1. Vecteur émotionnel    → distance euclidienne sur 3 axes
 * 2. Contexte social       → poids dynamiques par profil
 * 3. Claude API            → génération de "why" personnalisés en temps réel
 */

// ─── 1. CARTE ÉMOTIONNELLE ────────────────────────────────────────────────────
const VIBE_VECTORS = {
    melancolie: { energy: 0.2, tone: 0.3, depth: 0.8 },
    mystere:    { energy: 0.5, tone: 0.2, depth: 0.9 },
    tension:    { energy: 0.9, tone: 0.3, depth: 0.6 },
    reverie:    { energy: 0.3, tone: 0.7, depth: 0.7 },
    chaleur:    { energy: 0.6, tone: 0.9, depth: 0.4 },
    vertige:    { energy: 0.7, tone: 0.4, depth: 1.0 },
};

// ─── 2. POIDS CONTEXTUELS ────────────────────────────────────────────────────
const CONTEXT_WEIGHTS = {
    solo:   { energy: 0.25, tone: 0.30, depth: 0.45 },
    couple: { energy: 0.30, tone: 0.45, depth: 0.25 },
    kids:   { energy: 0.50, tone: 0.35, depth: 0.15 },
};

// ─── 3. LABELS LISIBLES (pour le prompt Claude) ──────────────────────────────
const VIBE_LABELS = {
    melancolie: 'mélancolie douce et introspective',
    mystere:    'mystère et atmosphère énigmatique',
    tension:    'tension et frissons',
    reverie:    'rêverie et mondes imaginaires',
    chaleur:    'chaleur humaine et bonne humeur',
    vertige:    'vertige et épopée grandiose',
};

const CONTEXT_LABELS = {
    solo:   'seul(e), en quête d\'une expérience personnelle et immersive',
    couple: 'en couple, pour une soirée partagée',
    kids:   'en famille avec des enfants',
};

// ─── 4. MOTEUR ───────────────────────────────────────────────────────────────
const Recommender = {

    // ── Utilitaires vectoriels ───────────────────────────────────────────────

    getItemVector(item) {
        if (item.emotionVector) return item.emotionVector;
        return VIBE_VECTORS[item.vibe] ?? { energy: 0.5, tone: 0.5, depth: 0.5 };
    },

    weightedSimilarity(userVec, itemVec, weights) {
        const axes = ['energy', 'tone', 'depth'];
        const sumWeights = axes.reduce((s, ax) => s + weights[ax], 0);
        const distance = Math.sqrt(
            axes.reduce((sum, ax) => {
                const diff = (userVec[ax] ?? 0.5) - (itemVec[ax] ?? 0.5);
                return sum + weights[ax] * diff * diff;
            }, 0)
        );
        const maxDist = Math.sqrt(sumWeights);
        return 1 - (distance / maxDist);
    },

    // ── Pipeline algo ────────────────────────────────────────────────────────

    buildUserFingerprint(state) {
        return { ...(VIBE_VECTORS[state.vibe] ?? { energy: 0.5, tone: 0.5, depth: 0.5 }) };
    },

    hardFilter(items, state, mediaConfig) {
        let pool = [...items];

        if (state.context === 'kids') {
            pool = pool.filter(item => item.kids === true);
        }

        if (state.filter && mediaConfig.filterKey && mediaConfig.filterThresholds) {
            const { filterKey, filterThresholds } = mediaConfig;
            const threshold = filterThresholds.short;
            if (state.filter === 'short') pool = pool.filter(item => item[filterKey] <= threshold);
            if (state.filter === 'long')  pool = pool.filter(item => item[filterKey] > threshold);
        }

        if (pool.length < 3 && state.filter) {
            return this.hardFilter(items, { ...state, filter: null }, mediaConfig);
        }

        if (pool.length === 0) return [...items];
        return pool;
    },

    scoreItem(item, userFingerprint, state, mediaConfig, weights) {
        const itemVec = this.getItemVector(item);
        const vectorScore = this.weightedSimilarity(userFingerprint, itemVec, weights);

        let bonus = 0;
        if (mediaConfig.filterKey && state.filter && mediaConfig.filterThresholds) {
            const val = item[mediaConfig.filterKey];
            const threshold = mediaConfig.filterThresholds.short;
            if (state.filter === 'short' && val <= threshold) bonus += 0.12;
            if (state.filter === 'long'  && val >  threshold) bonus += 0.12;
        }
        if (state.context === 'kids' && item.kids) bonus += 0.08;

        const age = new Date().getFullYear() - (item.year ?? 2000);
        if (age <= 10) bonus += 0.05;

        const variance = (Math.random() - 0.5) * 0.10;
        const finalScore = (vectorScore * 0.60) + (bonus * 0.30) + variance;

        return { ...item, _score: finalScore, _vectorScore: vectorScore };
    },

    diversePick(scoredItems, n = 3) {
        const sorted = [...scoredItems].sort((a, b) => b._score - a._score);
        const picked = [];
        const seenCreators = new Set();

        for (const item of sorted) {
            if (picked.length >= n) break;
            const creator = item.director ?? item.author ?? null;
            if (creator && seenCreators.has(creator)) continue;
            if (creator) seenCreators.add(creator);
            picked.push(item);
        }

        if (picked.length < n) {
            for (const item of sorted) {
                if (picked.length >= n) break;
                if (!picked.find(p => p.id === item.id)) picked.push(item);
            }
        }

        return picked;
    },

    // ── Intégration Claude API ───────────────────────────────────────────────

    /**
     * Génère un "why" personnalisé pour chaque film via Claude.
     * Appel unique avec les 3 films pour minimiser la latence.
     *
     * @param {Array}  films   — 3 films sélectionnés par l'algo
     * @param {Object} state   — { vibe, context, filter }
     * @returns {Array}        — films avec `why` mis à jour
     */
    async generatePersonalizedWhys(films, state) {
        const vibeLabel    = VIBE_LABELS[state.vibe]    ?? state.vibe;
        const contextLabel = CONTEXT_LABELS[state.context] ?? state.context;
        const filterLabel  = state.filter === 'short'
            ? 'un film court (moins de 1h50)'
            : state.filter === 'long'
            ? 'un film long pour une immersion totale'
            : 'un film';

        const filmsList = films.map((f, i) =>
            `${i + 1}. "${f.title}" (${f.year}) — ${f.genre} — réalisé par ${f.director}`
        ).join('\n');

        const prompt = `Tu es Movyra, un assistant culturel au style élégant et sincère.

L'utilisateur est ${contextLabel}. Il cherche ${filterLabel} avec une ambiance de ${vibeLabel}.

Voici les 3 films sélectionnés pour lui :
${filmsList}

Pour chacun, écris UNE phrase courte (max 15 mots) qui explique pourquoi CE film correspond à SON humeur CE SOIR.
- Parle directement à l'utilisateur (tu/vous)
- Connecte le film à l'émotion "${vibeLabel}" de manière concrète
- Style : poétique, direct, pas de clichés
- PAS de titre de film dans la phrase

Réponds UNIQUEMENT en JSON valide, sans markdown :
{
  "whys": ["phrase film 1", "phrase film 2", "phrase film 3"]
}`;

        try {
            // T06 : timeout 10s sur l'appel Claude — évite les requêtes bloquées en prod
            const controller = new AbortController();
            const timer      = setTimeout(() => controller.abort(), 10000);

            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                signal: controller.signal,
                headers: {
                    'Content-Type':      'application/json',
                    'x-api-key':         process.env.ANTHROPIC_API_KEY,
                    'anthropic-version': '2023-06-01',
                },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 1000,
                    messages: [{ role: 'user', content: prompt }]
                })
            });

            clearTimeout(timer);

            if (!response.ok) throw new Error(`API error: ${response.status}`);

            const data = await response.json();
            const raw  = data.content?.find(b => b.type === 'text')?.text ?? '';
            const clean = raw.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(clean);

            if (!Array.isArray(parsed.whys) || parsed.whys.length !== 3) {
                throw new Error('Format inattendu');
            }

            // Injecte les "why" personnalisés dans les films
            return films.map((film, i) => ({
                ...film,
                why: parsed.whys[i] ?? film.why  // fallback sur le why statique si erreur
            }));

        } catch (err) {
            if (err.name === 'AbortError') {
                console.warn('[Recommender] Timeout Claude (10s) — fallback why statique');
            } else {
                console.warn('[Recommender] Fallback why statique :', err.message);
            }
            return films; // Fallback propre : on garde les why statiques
        }
    },

    // ── Point d'entrée principal ─────────────────────────────────────────────

    /**
     * Pipeline complet asynchrone :
     * fingerprint → filtre → score → diversité → Claude why → résultats
     *
     * @param {Array}  items
     * @param {Object} state
     * @param {Object} mediaConfig
     * @param {number} n
     * @returns {Promise<Array>}
     */
    async pick(items, state, mediaConfig, n = 3) {
        // 1. Empreinte émotionnelle
        const userFingerprint = this.buildUserFingerprint(state);

        // 2. Poids contextuels
        const weights = CONTEXT_WEIGHTS[state.context] ?? CONTEXT_WEIGHTS.solo;

        // 3. Filtres durs
        const pool = this.hardFilter(items, state, mediaConfig);

        // 4. Scoring
        const scored = pool.map(item =>
            this.scoreItem(item, userFingerprint, state, mediaConfig, weights)
        );

        // 5. Sélection avec diversité
        const selected = this.diversePick(scored, n);

        // 6. Nettoyage des champs internes
        const clean = selected.map(({ _score, _vectorScore, ...item }) => item);

        // 7. Génération des "why" personnalisés via Claude
        const withWhys = await this.generatePersonalizedWhys(clean, state);

        return withWhys;
    },

    // ── Debug ────────────────────────────────────────────────────────────────

    debug(items, state, mediaConfig) {
        const userFingerprint = this.buildUserFingerprint(state);
        const weights = CONTEXT_WEIGHTS[state.context] ?? CONTEXT_WEIGHTS.solo;
        const pool = this.hardFilter(items, state, mediaConfig);
        const scored = pool
            .map(item => this.scoreItem(item, userFingerprint, state, mediaConfig, weights))
            .sort((a, b) => b._score - a._score);

        console.table(scored.map(i => ({
            title:       i.title,
            score:       i._score?.toFixed(3),
            vectorScore: i._vectorScore?.toFixed(3),
            itemVec:     JSON.stringify(this.getItemVector(i)),
            userVec:     JSON.stringify(userFingerprint),
        })));

        return scored;
    }
};
