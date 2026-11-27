# AI Learning App 🤖📚

**AI Learning App** est une application web d'apprentissage assisté par l'intelligence artificielle. Elle permet de travailler à partir de documents PDF et de créer des ressources pour faciliter la révision.

> Projet en développement. Les fonctionnalités, la configuration et les procédures décrites ici correspondent au code du dépôt et peuvent évoluer.

## Fonctionnalités

- Import et traitement de documents PDF.
- Génération de fiches de révision (flashcards).
- Génération de quiz à choix multiples.
- Résumés de documents.
- Chat avec un document et explications de notions.
- Suivi des révisions et de l'activité.
- Authentification par JWT et espace utilisateur.

## Technologies

- **Frontend :** React, Vite, Tailwind CSS, React Router, Axios.
- **Backend :** Node.js, Express.
- **Base de données :** MongoDB avec Mongoose.
- **IA :** Google Gemini via `@google/genai`.
- **PDF :** `pdf-parse`.

## Structure du dépôt

```text
AI-LEARNING-APP/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── uploads/
└── frontend/
    └── ai-learning-assistant/
        ├── public/
        └── src/
```

## Prérequis

- Node.js et npm.
- Une base MongoDB accessible.
- Une clé API Google Gemini.

## Installation et démarrage local

### 1. Backend

```bash
cd backend
npm install
```

Créez un fichier `.env` dans le dossier `backend/` (ne le commitez jamais) :

```env
PORT=8000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
JWT_EXPIRE=7d
GEMINI_API_KEY=your_gemini_api_key
MAX_FILE_SIZE=10485760
```

Lancez le backend :

```bash
npm run dev
```

Le script `npm start` lance le serveur avec Node directement.

### 2. Frontend

Dans un autre terminal :

```bash
cd frontend/ai-learning-assistant
npm install
```

Configurez la variable Vite `VITE_API_URL` (dans un fichier local `.env`, par exemple) avec l'adresse du backend, selon le format utilisé par l'application. Pour le backend local :

```env
VITE_API_URL=http://localhost:8000
```

Démarrez Vite :

```bash
npm run dev
```

## Vérifications frontend

Depuis `frontend/ai-learning-assistant/` :

```bash
npm run build
npm run lint
```

## API backend (aperçu)

Les routes d'authentification, documents, fiches, quiz, progression et IA sont regroupées sous `/api`. Les routes protégées nécessitent un jeton JWT dans l'en-tête :

```
Authorization: Bearer <token>
```

Principaux préfixes :

- `/api/auth`
- `/api/documents`
- `/api/flashcards`
- `/api/quizzes`
- `/api/ai`
- `/api/progress`
- `/api/notifications`

## Configuration de déploiement

- Le backend utilise les variables d'environnement ci-dessus; aucune clé secrète ne doit être ajoutée au dépôt.
- Le frontend doit recevoir `VITE_API_URL` correspondant au serveur API utilisé par l'environnement.
- Les fichiers PDF sont stockés sur le système de fichiers du backend. **Un hébergement dont le disque est éphémère peut perdre ces fichiers lors d'un redémarrage ou d'un déploiement**; un stockage persistant doit être configuré pour la production.
- Les modifications de code doivent être vérifiées et testées avant d'être déployées.

## Sécurité et limites

- Le backend refuse de démarrer si `JWT_SECRET` est absent ou vide; cette variable doit être configurée dans l'environnement d'exécution et ne doit jamais être commitée.
- Le middleware d'authentification exige un en-tête `Authorization: Bearer <token>` correctement formé et rejette les en-têtes incomplets ou mal formés.
- Lorsqu'une requête protégée renvoie une réponse 401 avec un jeton, le frontend efface les données de session locales et met à jour l'état d'authentification. Les réponses 401 des routes de connexion et d'inscription ne déclenchent pas cette déconnexion automatique.
- Les routes de profil valident désormais le nom d'utilisateur, l'adresse e-mail et la valeur de l'image de profil; la modification exige au moins un champ reconnu.
- Le changement de mot de passe valide les deux champs et impose une longueur de 6 à 128 caractères au nouveau mot de passe.
- Les contrôleurs du profil et du changement de mot de passe renvoient une réponse 404 explicite si le compte n'existe plus. La suppression d'une image de profil peut être demandée en envoyant `profileImage: null`.
- Les fichiers téléversés sont destinés aux PDF; le backend vérifie le type et l'extension puis la signature du PDF lors de son traitement.
- Les limites de génération de fiches et de quiz ajoutées sur la branche de corrections doivent être testées avant leur mise en production.
- Les contrôleurs IA limitent également les questions de chat à 2 000 caractères et les concepts à 500 caractères (branche de corrections; tests à effectuer).
- La route de récupération d'un quiz masque les réponses correctes avant la soumission (branche de corrections; tests à effectuer).
- Les opérations de génération IA sont limitées à 12 requêtes par utilisateur sur une fenêtre de 10 minutes (limiteur en mémoire de l'instance; tests à effectuer).
- Ce limiteur est local à une instance et se réinitialise au redémarrage; en déploiement multi-instance, un stockage partagé serait nécessaire.
- L'historique de chat conserve au maximum les 100 messages les plus récents (50 échanges). La réduction de l'historique existant se produit lors du prochain échange avec le document (branche de corrections; tests à effectuer).
- La réponse du changement de favori utilise désormais `message` et conserve l'ancien champ mal orthographié comme alias de compatibilité.
- La liste des documents est triée selon le champ de date de téléversement réellement défini dans le modèle (`UploadDate`).
- Ne partagez jamais les fichiers `.env`, les clés API, les mots de passe ou les jetons.

## Statut du projet

Application en développement et stabilisation. Les changements de sécurité et les procédures de déploiement doivent être validés dans un environnement de test avant toute mise en production.

## Auteur

**Ablaye Tamba** — [GitHub @lux-26](https://github.com/lux-26)
