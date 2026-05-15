# FrontProject - Application Next.js

Application frontend Next.js avec authentification sécurisée.

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`.

## Configuration

Créez un fichier `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Structure du projet

```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── login/              # Page de connexion
│   ├── dashboard/          # Page dashboard (protégée)
│   ├── forgot-password/    # Page mot de passe oublié
│   ├── layout.tsx          # Layout principal
│   ├── page.tsx            # Page d'accueil
│   └── globals.css         # Styles globaux
├── components/             # Composants réutilisables
│   └── ProtectedRoute.tsx  # HOC protection des routes
├── context/                # Contextes React
│   └── AuthContext.tsx     # Contexte d'authentification
└── services/               # Services API
    ├── apiClient.ts        # Client Axios configuré
    ├── authService.ts      # Service d'authentification
    └── tokenService.ts     # Gestion sécurisée des tokens
```

## Sécurité

- Stockage sécurisé du token JWT avec vérification d'expiration
- Protection automatique des routes via `ProtectedRoute`
- Intercepteurs Axios pour l'ajout automatique du token
- Gestion des erreurs 401 avec déconnexion automatique
- Validation des entrées côté client

## Charte graphique

- Police : Poppins
- Couleurs :
  - Orange : `#f18d3e`
  - Vert clair : `#87A515`
  - Vert foncé : `#418123`
  - Bleu : `#2eade4`

## Scripts disponibles

- `npm run dev` - Serveur de développement
- `npm run build` - Build de production
- `npm run start` - Démarrage en production
- `npm run lint` - Linting du code

## arhitecture 

1. Nom de l'architecture

On l'appelle souvent "Feature-based Folder Structure" (Structure par fonctionnalités) ou "Colocation".

Contrairement à une architecture "Layered" (où tous les composants sont dans un dossier, tous les hooks dans un autre), ici tu regroupes les éléments (hooks, composants, utilitaires) à l'intérieur du dossier de la page ou de la fonctionnalité correspondante (admin/clients).
2. Analyse de ta structure

    App Router (src/app) : Utilisation standard de Next.js pour le routage.

    Colocation (app/admin/clients) : Tu as mis ClientsDisplay.tsx et useClientsData.ts directement avec la page.tsx. C'est la recommandation moderne de Next.js.

    Dossiers transversaux (services, components, context, types) : Tu as gardé des dossiers pour ce qui est partagé globalement dans l'application.

3. Les Avantages (Points Positifs)

    Maintenabilité (Loi de proximité) : Quand tu dois modifier la page "Clients", tout est au même endroit (le hook, l'affichage, les types spécifiques). Tu ne perds pas de temps à naviguer entre 10 dossiers parents.

    Scalabilité : Il est beaucoup plus facile de faire grossir l'application. Si tu ajoutes une nouvelle section "Fournisseurs", tu crées un nouveau dossier et tu y mets tout son nécessaire sans polluer le reste du projet.

    Suppression facile : Si une fonctionnalité devient obsolète, tu supprimes le dossier de la fonctionnalité et tu es sûr d'avoir supprimé 90% du code lié, sans laisser de "code mort" dans un dossier hooks global.

    Clarté des responsabilités : Le dossier services centralise les appels API, ce qui permet de réutiliser la logique de données sans la mélanger à l'interface utilisateur.

4. Les Inconvénients (Points Négatifs)

    Risque de duplication : Si deux pages différentes ont besoin de la même logique, un développeur pressé pourrait recréer un hook similaire dans chaque dossier de page au lieu de le déplacer dans un dossier partagé.

    Architecture "import export" complexe : Si tu commences à importer des composants du dossier admin/clients vers une page profile, cela crée des dépendances croisées qui rendent le code difficile à suivre.

    Profondeur des dossiers : Avec l'App Router, on se retrouve vite avec beaucoup de sous-dossiers (src/app/admin/dashboard/settings/...). Cela peut rendre la navigation dans l'explorateur de fichiers un peu lourde.

    Manque de rigueur : Sans une règle d'équipe stricte, certains mettront tout dans components global, et d'autres tout dans le dossier de la page, rendant la structure incohérente au fil du temps.

Conclusion et Conseil

C'est une excellente architecture pour Next.js 14/15. Elle respecte la philosophie du framework.
