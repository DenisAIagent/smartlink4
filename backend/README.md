# SmartLink Backend API

Backend API moderne pour le système SmartLink - Génération de liens universels pour l'industrie musicale.

## 🏗️ Architecture Refactorisée

Cette version utilise une architecture propre et modulaire avec la structure suivante :

```
src/
├── index.js              # Point d'entrée principal
├── models/
│   └── SmartLink.js      # Modèle MongoDB avec Mongoose
├── routes/
│   ├── scan.js           # Route de scan Odesli
│   ├── links.js          # CRUD des SmartLinks
│   └── redirect.js       # Redirections et analytics
└── validators/
    └── linkValidators.js # Validation avec nos améliorations
```

## ✨ Améliorations Conservées

- **Validation GTM améliorée** : Accepte les IDs mixed case (`GTM-572GXWPP`)
- **Validation GA4 robuste** : Support des formats modernes
- **Tracking analytics** : Suivi des clics par plateforme
- **Gestion d'erreurs** : Messages d'erreur utilisateur-friendly
- **Sécurité** : Helmet.js et validation stricte

## 🚀 Démarrage

### Prérequis
- Node.js 18+
- MongoDB 6+

### Installation

```bash
# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Configurer les variables dans .env
# MONGODB_URI=mongodb://127.0.0.1:27017/smartlink
```

### Développement

```bash
# Mode développement avec nodemon
npm run dev

# Production
npm start
```

### Tests

```bash
# Lancer tous les tests
npm test

# Tests en mode watch
npm run test:watch
```

## 📡 API Endpoints

### Scan Musical
```http
POST /api/scan
Content-Type: application/json

{
  "url": "https://open.spotify.com/track/xxx"
}
```

### SmartLinks CRUD
```http
# Créer un SmartLink
POST /api/links

# Lister tous les SmartLinks
GET /api/links

# Récupérer un SmartLink
GET /api/links/:slug

# Vérifier disponibilité du slug
GET /api/links/check-slug/:slug

# Mettre à jour un SmartLink
PUT /api/links/:slug

# Supprimer un SmartLink
DELETE /api/links/:slug
```

### Redirections et Analytics
```http
# Redirection vers plateforme (avec tracking)
GET /api/redirect/:slug/:platform

# Statistiques d'un SmartLink
GET /api/analytics/:slug
```

### Health Check
```http
GET /health
```

## 🔧 Variables d'Environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `PORT` | Port du serveur | `4000` |
| `NODE_ENV` | Environnement | `development` |
| `MONGODB_URI` | URI MongoDB | `mongodb://localhost:27017/smartlink` |
| `ODESLI_API_KEY` | Clé API Odesli | (optionnel) |
| `JWT_SECRET` | Secret JWT | `your-secret-key` |

## 🧪 Tests

Les tests couvrent :
- ✅ Création de SmartLinks avec validation GTM
- ✅ Vérification d'unicité des slugs  
- ✅ Redirections avec tracking analytics
- ✅ Gestion d'erreurs 404/400/500
- ✅ Health check

## 🎯 Plateformes Supportées

- Spotify
- Apple Music  
- YouTube / YouTube Music
- Deezer
- Amazon Music
- Tidal

## 🔒 Sécurité

- Helmet.js pour les en-têtes de sécurité
- Validation stricte avec express-validator
- Sanitization automatique des données
- Protection CORS configurée

## 📊 Analytics

Le système track automatiquement :
- Nombre total de vues par SmartLink
- Clics par plateforme
- Timestamps de création/modification

## 🚀 Déploiement

### Railway
1. Push vers GitHub
2. Connecter à Railway
3. Configurer les variables d'environnement
4. Déploiement automatique

### Render/Heroku
1. Configurer `MONGODB_URI`
2. Build command : `npm install`
3. Start command : `npm start`

## 📝 Changelog

### v2.0 - Architecture Refactorisée
- ✅ Structure modulaire propre (src/)
- ✅ Routes séparées par responsabilité
- ✅ Modules ES6 complets
- ✅ Tests Jest intégrés
- ✅ Validation GTM améliorée conservée
- ✅ Documentation complète