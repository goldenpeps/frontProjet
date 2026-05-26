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

## URLs et Architecture Réseau

### Comment fonctionnent les URLs dans ce projet ?

L'application est construite sur une architecture **client-serveur** :

- **Frontend (Next.js)** : Tourne sur `http://localhost:3000`
- **Backend (API)** : Tourne sur `http://localhost:8000`

### Rôle de NEXT_PUBLIC_API_URL

La variable d'environnement `NEXT_PUBLIC_API_URL=http://localhost:8000/api` définit l'adresse de base de l'API backend.

- Le préfixe `NEXT_PUBLIC_` rend cette variable **accessible au navigateur** (et au code client)
- C'est l'URL racine vers laquelle tous les services envoient les requêtes HTTP
- Elle pointe vers `http://localhost:8000/api`, ce qui signifie :
  - `http://localhost:8000` = serveur backend
  - `/api` = préfixe des routes API

### Comment les requêtes sont envoyées ?

1. **Depuis le navigateur** : Un composant React appelle un service (ex: `authService.login()`)
2. **Service HTTP** : Le service utilise `apiClient.ts` (Axios) pour envoyer la requête
3. **Construction de l'URL** : Axios combine `NEXT_PUBLIC_API_URL` avec la route spécifique
   ```
   NEXT_PUBLIC_API_URL + "/login"
   = http://localhost:8000/api/login
   ```
4. **Réponse du serveur** : Le backend reçoit la requête et renvoie les données
5. **Gestion des tokens** : Le token JWT est automatiquement ajouté aux en-têtes par les intercepteurs Axios

### Exemple concret

Lors d'une connexion :
```typescript
// Dans authService.ts
export const login = (email: string, password: string) => {
  return apiClient.post('/login', { email, password });
  // URL finale envoyée : http://localhost:8000/api/login
};
```

### Configuration en production

En production, vous devez changer la variable d'environnement :

```env
NEXT_PUBLIC_API_URL=https://votre-api.com/api
```

Cela permet au navigateur de pointer vers votre API en production sans modifier le code.

### Exemple avancé : API Open-Meteo (Météo)

Le service `weatherService.ts` utilise une API publique pour récupérer les données météo. Voici comment l'URL est construite :

```typescript
const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
```

#### Décomposition de l'URL

```
https://api.open-meteo.com/v1/forecast?latitude=48.8&longitude=2.3&timezone=auto&daily=weathercode&start_date=2026-05-26&end_date=2026-05-26
```

**Parties de l'URL :**

1. **Protocole** : `https://`
   - Connexion sécurisée

2. **Domaine** : `api.open-meteo.com`
   - Serveur hébergeant l'API météo

3. **Chemin** : `/v1/forecast`
   - `v1` = version 1 de l'API
   - `forecast` = endpoint pour les prévisions météo

4. **Paramètres de requête** (après le `?`) :
   - `latitude=48.8` → Latitude du point (Paris ≈ 48.8°N)
   - `longitude=2.3` → Longitude du point (Paris ≈ 2.3°E)
   - `timezone=auto` → Détecte automatiquement le fuseau horaire
   - `daily=weathercode` → Demande le code météo quotidien
   - `start_date=2026-05-26` → Date de début (format YYYY-MM-DD)
   - `end_date=2026-05-26` → Date de fin (même jour pour un seul jour)

#### Comment les paramètres sont construits

```typescript
const params = new URLSearchParams({
  latitude: String(latitude),        // Coordonnée Y
  longitude: String(longitude),      // Coordonnée X
  timezone: 'auto',                  // Fuseau horaire automatique
  daily: 'weathercode',              // Type de données demandées
  start_date: date,                  // Date de début
  end_date: date,                    // Date de fin
});

// params.toString() convertit cela en :
// "latitude=48.8&longitude=2.3&timezone=auto&daily=weathercode&start_date=2026-05-26&end_date=2026-05-26"
```

#### Réponse de l'API

L'API retourne un JSON avec la structure :

```json
{
  "daily": {
    "weathercode": [3],
    "time": ["2026-05-26"]
  }
}
```

- `weathercode: [3]` = Code 3 = "Couvert" (nuageux)
- Le service traduit ensuite ce code en description lisible

#### Résumé du flux

```
Service → URLSearchParams → https://api.open-meteo.com/v1/forecast?params
                            ↓
                       Serveur répond avec JSON
                            ↓
                  WeatherCheckResult retourné
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
