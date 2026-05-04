/**
 * data/books.js
 * Contrat unifié — Livres
 *
 * Champs communs (tous médias) : id, title, year, why, vibe, kids
 * Champs spécifiques livres    : author, pages, length, genre
 */
const MEDIA_BOOKS = {
    id:    'books',
    label: 'Livres',
    icon:  '📚',
    filterLabel: 'Longueur',
    filterOptions: [
        { id: 'short', label: '< 250 pages', sub: 'Lecture rapide' },
        { id: 'long',  label: '400 pages+',  sub: 'Plongée profonde' }
    ],
    filterKey: 'pages',
    filterThresholds: { short: 250 }, // short ≤ 250 pages, long > 250

    vibes: [
        { id: 'melancolie', label: 'Mélancolie', sub: 'doux & introspectif',  color: '#4a5568' },
        { id: 'mystere',    label: 'Mystère',    sub: 'énigmes & secrets',    color: '#2d3748' },
        { id: 'tension',    label: 'Tension',    sub: 'suspense & frissons',  color: '#742a2a' },
        { id: 'reverie',    label: 'Rêverie',    sub: 'mondes imaginaires',   color: '#2b6cb0' },
        { id: 'chaleur',    label: 'Chaleur',    sub: 'humour & tendresse',   color: '#c05621' },
        { id: 'vertige',    label: 'Vertige',    sub: 'grandiose & épique',   color: '#44337a' }
    ],

    kidsVibeLabels: {
        melancolie: 'Poésie',
        mystere:    'Aventure secrète',
        tension:    'Quête',
        reverie:    'Magie',
        chaleur:    'Fou rire',
        vertige:    'Épopée'
    },

    items: [
        // ── MÉLANCOLIE ──────────────────────────────────────────
        {
            id: 'alchimiste-coelho', title: 'L\'Alchimiste', year: 1988, vibe: 'melancolie', kids: false,
            why: 'Un voyage initiatique qui redonne confiance en ses rêves. Simple et universel.',
            author: 'Paulo Coelho', pages: 208, genre: 'Roman initiatique'
        },
        {
            id: 'petit-prince-1943', title: 'Le Petit Prince', year: 1943, vibe: 'melancolie', kids: true,
            why: 'La solitude de l\'adulte expliquée par les yeux d\'un enfant. Intemporel.',
            author: 'Antoine de Saint-Exupéry', pages: 96, genre: 'Conte philosophique'
        },
        {
            id: 'remains-day-1989', title: 'Les Vestiges du Jour', year: 1989, vibe: 'melancolie', kids: false,
            why: 'Ishiguro filme une vie passée au service des autres, à côté de la sienne.',
            author: 'Kazuo Ishiguro', pages: 258, genre: 'Roman'
        },
        {
            id: 'elegie-hillbilly-2016', title: 'Hillbilly Elegy', year: 2016, vibe: 'melancolie', kids: false,
            why: 'Un portrait intime d\'une Amérique oubliée. Douloureux et nécessaire.',
            author: 'J.D. Vance', pages: 264, genre: 'Mémoires'
        },

        // ── MYSTÈRE ─────────────────────────────────────────────
        {
            id: 'da-vinci-code-2003', title: 'Da Vinci Code', year: 2003, vibe: 'mystere', kids: false,
            why: 'Une chasse aux indices effrénée à travers les secrets de l\'histoire de l\'art.',
            author: 'Dan Brown', pages: 689, genre: 'Thriller ésotérique'
        },
        {
            id: 'nom-rose-1980', title: 'Le Nom de la Rose', year: 1980, vibe: 'mystere', kids: false,
            why: 'Eco enferme un meurtre dans un monastère médiéval. Dense, fascinant, inoubliable.',
            author: 'Umberto Eco', pages: 502, genre: 'Roman policier historique'
        },
        {
            id: 'girl-dragon-tattoo-2005', title: 'Millenium — Les Hommes qui n\'aimaient pas les femmes', year: 2005, vibe: 'mystere', kids: false,
            why: 'Lisbeth Salander est l\'un des personnages les plus magnétiques de la littérature moderne.',
            author: 'Stieg Larsson', pages: 672, genre: 'Thriller nordique'
        },
        {
            id: 'harry-potter-1-1997', title: 'Harry Potter à l\'école des sorciers', year: 1997, vibe: 'mystere', kids: true,
            why: 'Le début d\'un monde entier. La magie de la découverte à chaque page.',
            author: 'J.K. Rowling', pages: 309, genre: 'Fantasy jeunesse'
        },

        // ── TENSION ─────────────────────────────────────────────
        {
            id: 'shining-1977', title: 'Shining', year: 1977, vibe: 'tension', kids: false,
            why: 'King isole une famille dans un hôtel hanté et dissèque la folie de l\'intérieur.',
            author: 'Stephen King', pages: 447, genre: 'Horreur'
        },
        {
            id: 'gone-girl-2012', title: 'Gone Girl', year: 2012, vibe: 'tension', kids: false,
            why: 'Flynn joue avec le narrateur peu fiable jusqu\'à l\'obsession. Haletant.',
            author: 'Gillian Flynn', pages: 422, genre: 'Thriller psychologique'
        },
        {
            id: 'judge-et-sea-2020', title: 'La Carte du Ciel', year: 2020, vibe: 'tension', kids: false,
            why: 'Une course contre la montre géopolitique digne des meilleurs films d\'espionnage.',
            author: 'Daniel Silva', pages: 480, genre: 'Thriller d\'espionnage'
        },
        {
            id: 'narnia-1950', title: 'Le Lion, la Sorcière Blanche et l\'Armoire Magique', year: 1950, vibe: 'tension', kids: true,
            why: 'Lewis construit un monde de l\'autre côté d\'une armoire. L\'aventure pure.',
            author: 'C.S. Lewis', pages: 208, genre: 'Fantasy jeunesse'
        },

        // ── RÊVERIE ─────────────────────────────────────────────
        {
            id: 'fondation-1951', title: 'Fondation', year: 1951, vibe: 'reverie', kids: false,
            why: 'Asimov imagine la chute d\'une civilisation galactique et ceux qui la sauvent.',
            author: 'Isaac Asimov', pages: 255, genre: 'SF'
        },
        {
            id: 'dune-herbert-1965', title: 'Dune', year: 1965, vibe: 'reverie', kids: false,
            why: 'Herbert crée un univers d\'une densité unique. La SF comme opéra politique.',
            author: 'Frank Herbert', pages: 688, genre: 'SF épique'
        },
        {
            id: 'hobbit-1937', title: 'Le Hobbit', year: 1937, vibe: 'reverie', kids: true,
            why: 'L\'aventure de celui qui ne voulait pas partir. Le départ de tout un univers.',
            author: 'J.R.R. Tolkien', pages: 310, genre: 'Fantasy'
        },
        {
            id: 'alice-1865', title: 'Alice au Pays des Merveilles', year: 1865, vibe: 'reverie', kids: true,
            why: 'Carroll invente un monde où la logique est folle. Poétique et subversif.',
            author: 'Lewis Carroll', pages: 130, genre: 'Fantasy / Conte'
        },

        // ── CHALEUR ─────────────────────────────────────────────
        {
            id: 'amelie-nothomb-stupeur', title: 'Stupeur et Tremblements', year: 1999, vibe: 'chaleur', kids: false,
            why: 'Nothomb raconte l\'absurdité du monde du travail japonais avec un humour décapant.',
            author: 'Amélie Nothomb', pages: 186, genre: 'Roman satirique'
        },
        {
            id: 'trois-hommes-bateau', title: 'Trois Hommes dans un Bateau', year: 1889, vibe: 'chaleur', kids: false,
            why: 'Jerome K. Jerome invente le road trip comique. Hilarant 135 ans après.',
            author: 'Jerome K. Jerome', pages: 214, genre: 'Comédie'
        },
        {
            id: 'monde-selon-garp', title: 'Le Monde selon Garp', year: 1978, vibe: 'chaleur', kids: false,
            why: 'Irving mêle comédie, drame et tendresse dans un roman-fleuve inoubliable.',
            author: 'John Irving', pages: 609, genre: 'Roman'
        },
        {
            id: 'matilda-1988', title: 'Matilda', year: 1988, vibe: 'chaleur', kids: true,
            why: 'Une petite fille extraordinaire face à un monde médiocre. Dahl au sommet.',
            author: 'Roald Dahl', pages: 240, genre: 'Jeunesse'
        },

        // ── VERTIGE ─────────────────────────────────────────────
        {
            id: 'crime-chatiment-1866', title: 'Crime et Châtiment', year: 1866, vibe: 'vertige', kids: false,
            why: 'Dostoïevski plonge dans la psyché d\'un meurtrier avec une précision chirurgicale.',
            author: 'Fiodor Dostoïevski', pages: 671, genre: 'Roman psychologique'
        },
        {
            id: 'cent-ans-solitude-1967', title: 'Cent Ans de Solitude', year: 1967, vibe: 'vertige', kids: false,
            why: 'García Márquez fonde un village entier et le regarde mourir sur 7 générations.',
            author: 'Gabriel García Márquez', pages: 417, genre: 'Réalisme magique'
        },
        {
            id: 'proces-kafka-1925', title: 'Le Procès', year: 1925, vibe: 'vertige', kids: false,
            why: 'Kafka invente l\'absurde bureaucratique. Plus actuel que jamais.',
            author: 'Franz Kafka', pages: 230, genre: 'Roman absurde'
        },
        {
            id: 'seigneur-anneaux-1954', title: 'Le Seigneur des Anneaux', year: 1954, vibe: 'vertige', kids: true,
            why: 'Tolkien bâtit un monde complet avec ses langues, ses mythes, son histoire.',
            author: 'J.R.R. Tolkien', pages: 1200, genre: 'Fantasy épique'
        }
    ]
};
