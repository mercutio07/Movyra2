# Movyra API

> Moteur de recommandation cinéma basé sur l'émotion.
> Node.js / Express · TMDB · Claude Sonnet 4.6

---

## Prérequis

- Node.js >= 22
- Clé API TMDB — [obtenir gratuitement](https://www.themoviedb.org/settings/api)
- Clé API Anthropic — [obtenir ici](https://console.anthropic.com)

## Installation

```bash
git clone https://github.com/TON_USERNAME/movyra-api.git
cd movyra-api
npm install
cp .env.example .env
# Remplir .env avec tes clés API
npm run dev
```

## Structure

```
movyra-api/
├── server.js                  # Point d'entrée Express
├── routes/
│   ├── recommend.js           # POST /api/recommend
│   └── movies.js              # GET /api/movies/*
├── services/
│   ├── tmdb.js                # Adaptateur TMDB
│   ├── vectorInference.js     # Inférence emotionVector
│   └── recommender.js         # Moteur vectoriel v3.1
├── middleware/
│   └── errorHandler.js        # Gestion erreurs centralisée
├── .env.example               # Template variables d'env
└── .gitignore
```

## Routes

| Méthode | Route | Description |
|---|---|---|
| `POST` | `/api/recommend` | Pipeline complet : TMDB → vecteurs → algo → Claude |
| `GET` | `/api/movies/search?q=` | Recherche libre dans TMDB |
| `GET` | `/api/movies/:id` | Détail d'un film |
| `GET` | `/api/health` | Monitoring uptime |

## Exemple d'appel

```bash
curl -X POST http://localhost:3000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "vibe": "melancolie",
    "context": "solo",
    "filter": "short"
  }'
```

## Variables d'environnement

| Variable | Description | Obligatoire |
|---|---|---|
| `TMDB_API_KEY` | Clé API TMDB | ✅ |
| `ANTHROPIC_API_KEY` | Clé API Claude | ✅ |
| `TMDB_LANGUAGE` | Langue résultats (défaut: `fr-FR`) | Non |
| `TMDB_REGION` | Région plateformes (défaut: `FR`) | Non |
| `PORT` | Port serveur (défaut: `3000`) | Non |
| `ALLOWED_ORIGIN` | Domaine front autorisé en prod | En prod |
| `NODE_ENV` | `development` ou `production` | Non |

## Déploiement Railway

1. Créer un projet sur [railway.app](https://railway.app)
2. Connecter le repo GitHub
3. Ajouter les variables d'environnement dans l'interface Railway
4. Railway détecte automatiquement Node.js et lance `npm start`

## Coûts estimés

| Composant | MVP | 10k users/mois |
|---|---|---|
| Claude API | ~$0.20 | ~$20 |
| TMDB API | $0 | $0 |
| Railway | $0–5 | ~$10–20 |
