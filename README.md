# AI Learning App 🤖📚

AI Learning App est un projet d'apprentissage assisté par l'intelligence artificielle. Le code du backend montre des fonctionnalités qui transforment les documents de l'utilisateur en ressources de révision.

## Fonctionnalités présentes dans le code

- Génération de fiches de révision (*flashcards*) à partir d'un document
- Génération de quiz personnalisés
- Création de résumés de documents
- Conversation avec un document à partir de passages pertinents
- Enregistrement des ressources générées et de l'historique associé à l'utilisateur

La génération de contenu IA s'appuie sur un service Gemini côté backend.

## Technologies repérées

**Frontend**
- React
- Vite
- Tailwind CSS
- React Router
- Axios

**Backend et données**
- Node.js
- API Express (architecture par contrôleurs)
- MongoDB avec modèles Mongoose
- Service IA Gemini

## Organisation du dépôt

```text
AI-LEARNING-APP/
├── backend/
│   ├── controllers/
│   ├── models/
│   └── utils/
└── frontend/
    └── ai-learning-assistant/
        ├── public/
        └── src/
```

## Démarrer le frontend

Depuis le dossier du frontend :

```bash
cd frontend/ai-learning-assistant
npm install
npm run dev
```

Pour compiler et vérifier le frontend :

```bash
npm run build
npm run lint
```

## Configuration et exécution du backend

Le backend nécessite une configuration locale pour la base de données et le fournisseur IA. Les instructions exactes de démarrage et les variables d'environnement doivent être complétées dans le projet avant un déploiement. Ne publiez jamais de fichier `.env`, de mot de passe ou de clé API dans le dépôt.

## Statut

Projet en développement. La documentation de déploiement, les prérequis backend et les captures d'écran de l'application pourront être ajoutés au fur et à mesure de sa stabilisation.

## Auteur

**Ablaye Tamba** — [GitHub @lux-26](https://github.com/lux-26)
