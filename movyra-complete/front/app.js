/**
 * app.js — Orchestrateur générique
 * Aucune référence à un type de média spécifique.
 * Tout passe par MEDIA_REGISTRY, getMedia(), getItems() et Recommender.
 */
const App = {
    VERSION: "2.0",

    state: {
        step:    'media',   // 'media' | 'context' | 'vibe' | 'duration' | 'loading' | 'results'
        media:   null,      // id du média choisi (ex: 'movies', 'books')
        context: null,      // 'solo' | 'couple' | 'kids'
        vibe:    null,      // id de la vibe choisie
        filter:  null,      // valeur du filtre actif (ex: 'short' | 'long')
        results: []
    },

    // ─── Init ────────────────────────────────────────────────────────────────

    init() {
        this.loadAndValidateState();
        this.render();
    },

    loadAndValidateState() {
        const saved = localStorage.getItem('movyra_session');
        if (!saved) return;
        try {
            const parsed = JSON.parse(saved);
            if (parsed?.version === this.VERSION) {
                this.state = { ...this.state, ...parsed.data };
            } else {
                localStorage.removeItem('movyra_session');
            }
        } catch {
            localStorage.removeItem('movyra_session');
        }
    },

    save() {
        localStorage.setItem('movyra_session', JSON.stringify({
            version: this.VERSION,
            data: this.state
        }));
    },

    // ─── Setters ─────────────────────────────────────────────────────────────

    setMedia(mediaId) {
        this.state.media   = mediaId;
        this.state.step    = 'context';
        this.render();
    },

    setContext(choice) {
        this.state.context = choice;
        this.state.step    = 'vibe';
        this.render();
    },

    setVibe(vibeId) {
        this.state.vibe = vibeId;
        this.state.step = 'duration';
        this.render();
    },

    setFilter(value) {
        this.state.filter = value;
        this.processResults();
    },

    // ─── Recommandation ──────────────────────────────────────────────────────

    processResults() {
        this.state.step = 'loading';
        this.render();

        const media = getMedia(this.state.media);
        const items = getItems(this.state.media, this.state.vibe);

        // pick() est async — on attend la promesse
        Recommender.pick(items, this.state, media)
            .then(results => {
                this.state.results = results;
                this.state.step    = 'results';
                this.render();
            })
            .catch(err => {
                console.error('[App] Erreur recommender :', err);
                this.state.step = 'results';
                this.render();
            });
    },

    // ─── Reset ───────────────────────────────────────────────────────────────

    reset() {
        localStorage.removeItem('movyra_session');
        this.state = {
            step: 'media', media: null, context: null,
            vibe: null, filter: null, results: []
        };
        this.render();
    },

    // ─── Render ──────────────────────────────────────────────────────────────

    render() {
        document.querySelectorAll('.step').forEach(section => {
            section.classList.toggle('active', section.id === `step-${this.state.step}`);
        });

        const renders = {
            media:    () => this.renderMediaGrid(),
            vibe:     () => this.renderVibeGrid(),
            duration: () => this.renderFilterOptions(),
            results:  () => this.renderResults(),
        };
        renders[this.state.step]?.();

        this.updateAtmosphere();
        this.save();
    },

    // ─── Étape : choix du média ───────────────────────────────────────────────

    renderMediaGrid() {
        const grid = document.getElementById('media-grid');
        if (!grid) return;

        grid.innerHTML = MEDIA_REGISTRY.map(media => `
            <button onclick="App.setMedia('${media.id}')" class="btn-choice glass p-6 rounded-xl text-left">
                <span class="block text-2xl mb-2">${media.icon}</span>
                <span class="block text-lg">${media.label}</span>
            </button>
        `).join('');
    },

    // ─── Étape : choix de la vibe ────────────────────────────────────────────

    renderVibeGrid() {
        const grid  = document.getElementById('vibe-grid');
        if (!grid) return;

        const media   = getMedia(this.state.media);
        const isKids  = this.state.context === 'kids';
        const vibes   = media?.vibes ?? [];
        const labels  = media?.kidsVibeLabels ?? {};

        grid.innerHTML = vibes.map(v => `
            <button onclick="App.setVibe('${v.id}')" class="btn-choice glass p-6 rounded-2xl text-left">
                <span class="block text-lg">${isKids ? (labels[v.id] ?? v.label) : v.label}</span>
                <span class="text-[10px] opacity-50 uppercase tracking-widest">${v.sub}</span>
            </button>
        `).join('');
    },

    // ─── Étape : filtre (durée / longueur / etc.) ────────────────────────────

    renderFilterOptions() {
        const container = document.getElementById('filter-options');
        const title     = document.getElementById('filter-title');
        if (!container) return;

        const media = getMedia(this.state.media);
        if (!media) return;

        if (title) title.textContent = media.filterLabel ?? 'Filtre';

        container.innerHTML = media.filterOptions.map(opt => `
            <button onclick="App.setFilter('${opt.id}')" class="btn-choice glass p-6 rounded-xl text-left">
                ${opt.label} — ${opt.sub}
            </button>
        `).join('');
    },

    // ─── Étape : résultats ───────────────────────────────────────────────────

    renderResults() {
        const container = document.getElementById('movie-results-container');
        const title     = document.getElementById('results-title');
        if (!container) return;

        const media = getMedia(this.state.media);
        if (title && media) {
            title.textContent = `Tes 3 ${media.label.toLowerCase()} pour ce soir`;
        }

        container.innerHTML = this.state.results.map((item, i) => `
            <div class="glass p-5 rounded-2xl">
                <div class="flex flex-col gap-2">

                    ${i === 0 ? `<span class="text-[9px] text-[#e8b457] font-bold uppercase tracking-widest">✦ Coup de cœur</span>` : ''}

                    <span class="text-lg font-medium leading-snug">${item.title}</span>
                    <span class="text-[11px] opacity-40">${this.buildMeta(item, media)}</span>
                    <p class="text-sm opacity-60 leading-relaxed">${item.why}</p>

                    ${this.buildExtras(item, media)}

                    ${item.kids ? `<span class="text-[9px] text-[#e8b457] font-bold uppercase tracking-widest mt-1">✨ Idéal Famille</span>` : ''}
                </div>
            </div>
        `).join('');
    },

    /**
     * Ligne de méta-données adaptée au média.
     * Films  : genre · année · durée
     * Livres : auteur · année · pages
     */
    buildMeta(item, media) {
        if (media.id === 'movies') {
            return [item.genre, item.year, item.duration ? `${item.duration} min` : null]
                .filter(Boolean).join(' · ');
        }
        if (media.id === 'books') {
            return [item.author, item.year, item.pages ? `${item.pages} pages` : null]
                .filter(Boolean).join(' · ');
        }
        return [item.genre ?? item.author, item.year].filter(Boolean).join(' · ');
    },

    /**
     * Extras propres à chaque média.
     * Films  : badges plateformes
     * Livres : badge genre
     */
    buildExtras(item, media) {
        if (media.id === 'movies' && item.platforms?.length) {
            return `
                <div class="flex flex-wrap gap-1.5 mt-1">
                    ${item.platforms.map(p =>
                        `<span class="text-[9px] uppercase tracking-widest border border-white/10 px-2 py-0.5 rounded-full opacity-50">${p}</span>`
                    ).join('')}
                </div>`;
        }
        if (media.id === 'books' && item.genre) {
            return `<span class="text-[9px] uppercase tracking-widest border border-white/10 px-2 py-0.5 rounded-full opacity-40 self-start">${item.genre}</span>`;
        }
        return '';
    },

    // ─── Atmosphère ──────────────────────────────────────────────────────────

    updateAtmosphere() {
        const media    = getMedia(this.state.media);
        const vibeData = media?.vibes.find(v => v.id === this.state.vibe);
        const glow     = document.getElementById('bg-glow');
        if (glow && vibeData) {
            glow.style.background =
                `radial-gradient(circle at 50% 50%, ${vibeData.color}33, transparent 70%)`;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
