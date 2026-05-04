/**
 * data/movies.js
 * Contrat unifié — Films
 *
 * Champs communs (tous médias) : id, title, year, why, vibe, kids
 * Champs spécifiques films     : duration, genre, director, platforms
 * Nouveau champ v3             : emotionVector { energy, tone, depth }
 *
 * emotionVector calibré manuellement pour chaque film :
 *   energy : 0 (contemplatif) → 1 (explosif)
 *   tone   : 0 (sombre/pesant) → 1 (lumineux/léger)
 *   depth  : 0 (surface) → 1 (dense/complexe)
 */
const MEDIA_MOVIES = {
    id:    'movies',
    label: 'Films',
    icon:  '🎬',
    filterLabel: 'Durée',
    filterOptions: [
        { id: 'short', label: '~1h30', sub: 'Court & efficace' },
        { id: 'long',  label: '2h30+', sub: 'Immersion totale' }
    ],
    filterKey: 'duration',
    filterThresholds: { short: 110 },

    vibes: [
        { id: 'melancolie', label: 'Mélancolie', sub: 'doux & profond',      color: '#4a5568' },
        { id: 'mystere',    label: 'Mystère',    sub: 'énigmes & secrets',   color: '#2d3748' },
        { id: 'tension',    label: 'Tension',    sub: 'action & frissons',   color: '#742a2a' },
        { id: 'reverie',    label: 'Rêverie',    sub: 'mondes imaginaires',  color: '#2b6cb0' },
        { id: 'chaleur',    label: 'Chaleur',    sub: 'humour & tendresse',  color: '#c05621' },
        { id: 'vertige',    label: 'Vertige',    sub: 'grandiose & épique',  color: '#44337a' }
    ],

    kidsVibeLabels: {
        melancolie: 'Poésie',
        mystere:    'Secret',
        tension:    'Aventure',
        reverie:    'Imaginaire',
        chaleur:    'Rire',
        vertige:    'Étonnant'
    },

    items: [
        // ── MÉLANCOLIE ──────────────────────────────────────────
        {
            id: 'aftersun-2022', title: 'Aftersun', year: 2022, vibe: 'melancolie', kids: false,
            why: 'La mémoire qui reconstruit ce qu\'on n\'a pas vu. Bouleversant de douceur.',
            duration: 96, genre: 'Drame', director: 'Charlotte Wells', platforms: ['MUBI'],
            emotionVector: { energy: 0.15, tone: 0.25, depth: 0.90 }
        },
        {
            id: 'lost-in-translation-2003', title: 'Lost in Translation', year: 2003, vibe: 'melancolie', kids: false,
            why: 'Sofia Coppola filme la solitude à Tokyo avec une grâce rare.',
            duration: 102, genre: 'Drame / Romance', director: 'Sofia Coppola', platforms: ['Netflix'],
            emotionVector: { energy: 0.20, tone: 0.40, depth: 0.75 }
        },
        {
            id: 'her-2013', title: 'Her', year: 2013, vibe: 'melancolie', kids: false,
            why: 'Spike Jonze explore la solitude moderne avec une tendresse infinie.',
            duration: 126, genre: 'Drame / SF', director: 'Spike Jonze', platforms: ['Netflix'],
            emotionVector: { energy: 0.25, tone: 0.50, depth: 0.85 }
        },
        {
            id: 'manchester-2016', title: 'Manchester by the Sea', year: 2016, vibe: 'melancolie', kids: false,
            why: 'Le deuil sans catharsis. Une performance qui ne joue pas — qui porte.',
            duration: 137, genre: 'Drame', director: 'Kenneth Lonergan', platforms: ['Prime'],
            emotionVector: { energy: 0.15, tone: 0.15, depth: 0.95 }
        },
        {
            id: 'blue-valentine-2010', title: 'Blue Valentine', year: 2010, vibe: 'melancolie', kids: false,
            why: 'L\'amour qui s\'effondre, filmé au plus près. Brutal et tendre.',
            duration: 112, genre: 'Romance', director: 'Derek Cianfrance', platforms: ['MUBI'],
            emotionVector: { energy: 0.30, tone: 0.20, depth: 0.88 }
        },
        {
            id: 'walle-2008', title: 'Wall-E', year: 2008, vibe: 'melancolie', kids: true,
            why: 'Une histoire d\'amour muette dans un monde silencieux. Pixar à son sommet.',
            duration: 98, genre: 'Animation / SF', director: 'Andrew Stanton', platforms: ['Disney+'],
            emotionVector: { energy: 0.35, tone: 0.55, depth: 0.70 }
        },
        {
            id: 'bambi-1942', title: 'Bambi', year: 1942, vibe: 'melancolie', kids: true,
            why: 'Le premier grand film sur la perte, raconté avec une beauté intemporelle.',
            duration: 70, genre: 'Animation', director: 'David Hand', platforms: ['Disney+'],
            emotionVector: { energy: 0.25, tone: 0.35, depth: 0.60 }
        },

        // ── MYSTÈRE ─────────────────────────────────────────────
        {
            id: 'inception-2010', title: 'Inception', year: 2010, vibe: 'mystere', kids: false,
            why: 'Nolan construit un labyrinthe de rêves dont on ne veut pas sortir.',
            duration: 148, genre: 'SF / Thriller', director: 'Christopher Nolan', platforms: ['Netflix'],
            emotionVector: { energy: 0.75, tone: 0.30, depth: 0.95 }
        },
        {
            id: 'memento-2000', title: 'Memento', year: 2000, vibe: 'mystere', kids: false,
            why: 'Raconté à l\'envers, il place le spectateur dans la peau d\'un homme sans mémoire.',
            duration: 113, genre: 'Thriller', director: 'Christopher Nolan', platforms: ['Prime'],
            emotionVector: { energy: 0.60, tone: 0.20, depth: 0.98 }
        },
        {
            id: 'shutter-island-2010', title: 'Shutter Island', year: 2010, vibe: 'mystere', kids: false,
            why: 'Scorsese joue avec la perception. Déroutant jusqu\'à la dernière seconde.',
            duration: 138, genre: 'Thriller / Horreur', director: 'Martin Scorsese', platforms: ['Netflix'],
            emotionVector: { energy: 0.65, tone: 0.15, depth: 0.90 }
        },
        {
            id: 'parasite-2019', title: 'Parasite', year: 2019, vibe: 'mystere', kids: false,
            why: 'Bong Joon-ho change de genre toutes les 30 minutes. Palme d\'Or méritée.',
            duration: 132, genre: 'Thriller / Drame', director: 'Bong Joon-ho', platforms: ['Netflix'],
            emotionVector: { energy: 0.70, tone: 0.25, depth: 0.92 }
        },
        {
            id: 'coherence-2013', title: 'Coherence', year: 2013, vibe: 'mystere', kids: false,
            why: 'Budget zéro, tension maximale. Un OVNI du genre tourné en une nuit.',
            duration: 88, genre: 'SF / Thriller', director: 'James Ward Byrkit', platforms: ['Prime'],
            emotionVector: { energy: 0.55, tone: 0.20, depth: 0.85 }
        },
        {
            id: 'chihiro-2001', title: 'Le Voyage de Chihiro', year: 2001, vibe: 'mystere', kids: true,
            why: 'Miyazaki crée un monde de l\'au-delà d\'une richesse visuelle absolue.',
            duration: 125, genre: 'Animation / Fantastique', director: 'Hayao Miyazaki', platforms: ['Netflix'],
            emotionVector: { energy: 0.45, tone: 0.55, depth: 0.80 }
        },
        {
            id: 'coco-2017', title: 'Coco', year: 2017, vibe: 'mystere', kids: true,
            why: 'Un voyage au pays des morts lumineux, vibrant et profondément émouvant.',
            duration: 105, genre: 'Animation', director: 'Lee Unkrich', platforms: ['Disney+'],
            emotionVector: { energy: 0.55, tone: 0.65, depth: 0.70 }
        },

        // ── TENSION ─────────────────────────────────────────────
        {
            id: 'madmax-2015', title: 'Mad Max: Fury Road', year: 2015, vibe: 'tension', kids: false,
            why: 'George Miller réinvente le film d\'action. 2h de poursuite parfaitement chorégraphiée.',
            duration: 120, genre: 'Action / SF', director: 'George Miller', platforms: ['Netflix', 'Prime'],
            emotionVector: { energy: 0.98, tone: 0.30, depth: 0.45 }
        },
        {
            id: 'whiplash-2014', title: 'Whiplash', year: 2014, vibe: 'tension', kids: false,
            why: 'La tension dramatique d\'un film d\'horreur appliquée à la musique. Épuisant.',
            duration: 107, genre: 'Drame', director: 'Damien Chazelle', platforms: ['Netflix'],
            emotionVector: { energy: 0.92, tone: 0.25, depth: 0.75 }
        },
        {
            id: 'dark-knight-2008', title: 'The Dark Knight', year: 2008, vibe: 'tension', kids: false,
            why: 'Nolan élève le film de super-héros en tragédie morale. Ledger incandescent.',
            duration: 152, genre: 'Super-héros / Thriller', director: 'Christopher Nolan', platforms: ['Netflix'],
            emotionVector: { energy: 0.88, tone: 0.25, depth: 0.80 }
        },
        {
            id: 'no-country-2007', title: 'No Country for Old Men', year: 2007, vibe: 'tension', kids: false,
            why: 'Les Coen filment le mal absolu avec une sérénité terrifiante.',
            duration: 122, genre: 'Thriller / Western', director: 'Coen Brothers', platforms: ['Prime'],
            emotionVector: { energy: 0.70, tone: 0.10, depth: 0.90 }
        },
        {
            id: 'sicario-2015', title: 'Sicario', year: 2015, vibe: 'tension', kids: false,
            why: 'Villeneuve + Deakins : chaque plan est une menace. La frontière comme métaphore.',
            duration: 121, genre: 'Thriller / Action', director: 'Denis Villeneuve', platforms: ['Netflix'],
            emotionVector: { energy: 0.80, tone: 0.15, depth: 0.85 }
        },
        {
            id: 'indestructibles-2004', title: 'Les Indestructibles', year: 2004, vibe: 'tension', kids: true,
            why: 'Le film de super-héros le plus mature jamais fait pour toute la famille.',
            duration: 115, genre: 'Animation / Super-héros', director: 'Brad Bird', platforms: ['Disney+'],
            emotionVector: { energy: 0.85, tone: 0.65, depth: 0.55 }
        },
        {
            id: 'kirikou-1998', title: 'Kirikou et la Sorcière', year: 1998, vibe: 'tension', kids: true,
            why: 'Un héros minuscule face à un géant. Courageux, simple et universel.',
            duration: 74, genre: 'Animation / Aventure', director: 'Michel Ocelot', platforms: ['Prime'],
            emotionVector: { energy: 0.70, tone: 0.60, depth: 0.45 }
        },

        // ── RÊVERIE ─────────────────────────────────────────────
        {
            id: 'interstellar-2014', title: 'Interstellar', year: 2014, vibe: 'reverie', kids: false,
            why: 'Nolan filme l\'amour comme force gravitationnelle. Vertigineux et humain.',
            duration: 169, genre: 'SF / Aventure', director: 'Christopher Nolan', platforms: ['Netflix'],
            emotionVector: { energy: 0.60, tone: 0.55, depth: 0.95 }
        },
        {
            id: 'annihilation-2018', title: 'Annihilation', year: 2018, vibe: 'reverie', kids: false,
            why: 'Garland crée une zone où la biologie et le rêve fusionnent. Hypnotique.',
            duration: 115, genre: 'SF / Horreur', director: 'Alex Garland', platforms: ['Prime'],
            emotionVector: { energy: 0.40, tone: 0.30, depth: 0.90 }
        },
        {
            id: 'blade-runner-2049', title: 'Blade Runner 2049', year: 2017, vibe: 'reverie', kids: false,
            why: 'Villeneuve et Deakins peignent un futur d\'une beauté désespérante.',
            duration: 164, genre: 'SF / Néo-noir', director: 'Denis Villeneuve', platforms: ['Netflix'],
            emotionVector: { energy: 0.30, tone: 0.25, depth: 0.95 }
        },
        {
            id: 'eeaao-2022', title: 'Everything Everywhere All at Once', year: 2022, vibe: 'reverie', kids: false,
            why: 'Le multivers comme véhicule d\'une ode à l\'amour maternel. Fou et bouleversant.',
            duration: 139, genre: 'SF / Comédie', director: 'Daniels', platforms: ['Netflix'],
            emotionVector: { energy: 0.80, tone: 0.70, depth: 0.88 }
        },
        {
            id: 'totoro-1988', title: 'Mon Voisin Totoro', year: 1988, vibe: 'reverie', kids: true,
            why: 'Miyazaki capture la magie de l\'enfance avec une douceur absolue.',
            duration: 86, genre: 'Animation / Fantastique', director: 'Hayao Miyazaki', platforms: ['Netflix'],
            emotionVector: { energy: 0.30, tone: 0.85, depth: 0.55 }
        },
        {
            id: 'big-fish-2003', title: 'Big Fish', year: 2003, vibe: 'reverie', kids: true,
            why: 'Tim Burton filme la frontière entre mythe et réalité avec une tendresse rare.',
            duration: 125, genre: 'Fantastique / Drame', director: 'Tim Burton', platforms: ['Netflix'],
            emotionVector: { energy: 0.40, tone: 0.70, depth: 0.72 }
        },

        // ── CHALEUR ─────────────────────────────────────────────
        {
            id: 'grand-budapest-2014', title: 'The Grand Budapest Hotel', year: 2014, vibe: 'chaleur', kids: false,
            why: 'Anderson crée un monde en miniature, parfait et mélancolique. Jouissif.',
            duration: 99, genre: 'Comédie / Aventure', director: 'Wes Anderson', platforms: ['Disney+'],
            emotionVector: { energy: 0.65, tone: 0.80, depth: 0.60 }
        },
        {
            id: 'knives-out-2019', title: 'Knives Out', year: 2019, vibe: 'chaleur', kids: false,
            why: 'Rian Johnson réinvente le whodunit avec jubilation. Brillant et drôle.',
            duration: 130, genre: 'Policier / Comédie', director: 'Rian Johnson', platforms: ['Netflix'],
            emotionVector: { energy: 0.70, tone: 0.75, depth: 0.65 }
        },
        {
            id: 'intouchables-2011', title: 'Intouchables', year: 2011, vibe: 'chaleur', kids: false,
            why: 'Le feel-good film français par excellence. Universel, drôle et sincère.',
            duration: 112, genre: 'Comédie / Drame', director: 'Nakache & Toledano', platforms: ['Netflix'],
            emotionVector: { energy: 0.60, tone: 0.88, depth: 0.50 }
        },
        {
            id: 'little-miss-2006', title: 'Little Miss Sunshine', year: 2006, vibe: 'chaleur', kids: false,
            why: 'Une famille dysfonctionnelle en road trip. Drôle, tendre, inoubliable.',
            duration: 101, genre: 'Comédie dramatique', director: 'Dayton & Faris', platforms: ['Prime'],
            emotionVector: { energy: 0.55, tone: 0.78, depth: 0.55 }
        },
        {
            id: 'paddington2-2017', title: 'Paddington 2', year: 2017, vibe: 'chaleur', kids: true,
            why: 'Le film le mieux noté de l\'histoire britannique. Pure joie distillée.',
            duration: 103, genre: 'Comédie / Famille', director: 'Paul King', platforms: ['Netflix'],
            emotionVector: { energy: 0.65, tone: 0.95, depth: 0.40 }
        },
        {
            id: 'ratatouille-2007', title: 'Ratatouille', year: 2007, vibe: 'chaleur', kids: true,
            why: 'Un rat cuisinier à Paris. Pixar filme la passion avec une générosité contagieuse.',
            duration: 111, genre: 'Animation / Comédie', director: 'Brad Bird', platforms: ['Disney+'],
            emotionVector: { energy: 0.60, tone: 0.90, depth: 0.50 }
        },

        // ── VERTIGE ─────────────────────────────────────────────
        {
            id: 'dune-2021', title: 'Dune', year: 2021, vibe: 'vertige', kids: false,
            why: 'La démesure au service d\'un opéra spatial. Chaque plan est une peinture.',
            duration: 155, genre: 'SF / Épique', director: 'Denis Villeneuve', platforms: ['Netflix'],
            emotionVector: { energy: 0.65, tone: 0.35, depth: 0.98 }
        },
        {
            id: 'lighthouse-2019', title: 'The Lighthouse', year: 2019, vibe: 'vertige', kids: false,
            why: 'Eggers filme la folie en noir et blanc. Claustrophobique et sublime.',
            duration: 109, genre: 'Horreur / Drame', director: 'Robert Eggers', platforms: ['Prime', 'MUBI'],
            emotionVector: { energy: 0.55, tone: 0.10, depth: 0.97 }
        },
        {
            id: 'melancholia-2011', title: 'Melancholia', year: 2011, vibe: 'vertige', kids: false,
            why: 'Von Trier filme la fin du monde comme une libération. Magnifique et nihiliste.',
            duration: 135, genre: 'SF / Drame', director: 'Lars von Trier', platforms: ['MUBI'],
            emotionVector: { energy: 0.25, tone: 0.15, depth: 1.00 }
        },
        {
            id: '2001-1968', title: '2001 : L\'Odyssée de l\'espace', year: 1968, vibe: 'vertige', kids: false,
            why: 'Kubrick pose les questions sans réponse. Le film-cosmos absolu.',
            duration: 149, genre: 'SF / Épique', director: 'Stanley Kubrick', platforms: ['Prime'],
            emotionVector: { energy: 0.35, tone: 0.30, depth: 1.00 }
        },
        {
            id: 'hereditary-2018', title: 'Hereditary', year: 2018, vibe: 'vertige', kids: false,
            why: 'Aster déconstruit le deuil familial jusqu\'à l\'insoutenable.',
            duration: 127, genre: 'Horreur', director: 'Ari Aster', platforms: ['Netflix'],
            emotionVector: { energy: 0.60, tone: 0.05, depth: 0.95 }
        },
        {
            id: 'roi-lion-1994', title: 'Le Roi Lion', year: 1994, vibe: 'vertige', kids: true,
            why: 'La mort, la trahison, la rédemption — en chanson, pour toute la famille.',
            duration: 88, genre: 'Animation / Épique', director: 'Allers & Minkoff', platforms: ['Disney+'],
            emotionVector: { energy: 0.70, tone: 0.55, depth: 0.72 }
        },
        {
            id: 'avatar-2009', title: 'Avatar', year: 2009, vibe: 'vertige', kids: true,
            why: 'Cameron crée un monde vivant d\'une générosité visuelle écrasante.',
            duration: 162, genre: 'SF / Aventure', director: 'James Cameron', platforms: ['Disney+'],
            emotionVector: { energy: 0.80, tone: 0.65, depth: 0.60 }
        }
    ]
};
