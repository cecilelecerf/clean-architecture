# Clean Architecture Project

## 1️⃣ Configuration des variables d’environnement

Crée un fichier `.env` à la racine du projet avec le contenu suivant :

```env
# Database
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=myapp_user
MYSQL_PASSWORD=myapp_pass
MYSQL_DATABASE=myapp_db
MYSQL_ROOT_PASSWORD=root

# JWT
JWT_SECRET=supersecretkey

# Bcrypt
BCRYPT_SALT=10
```

💡 Assure-toi que ce fichier est à la racine du monorepo pour qu’il soit utilisé par Docker et tous les workspaces.

## 2️⃣ Installer les dépendances

Installe toutes les dépendances avec pnpm :

`pnpm install`

Cela installera les packages pour tous les workspaces (domain, application, infrastructure, interfaces/web/app-next).

## 3️⃣ Compiler les packages

Construit chaque workspace dans le bon ordre :

- `pnpm --filter domain build`
- `pnpm --filter application build`
- `pnpm --filter infrastructure build`

🔹 L’ordre est important car application dépend de domain et infrastructure dépend des deux précédents.

## 4️⃣ Démarrer MySQL et phpMyAdmin

Lance les conteneurs Docker :

`docker compose up -d`

MySQL sera disponible sur localhost:3306

phpMyAdmin sera accessible sur http://localhost:8080

Serveur : mysql

Utilisateur : root

Mot de passe : root

💡 Si tu modifies les scripts SQL dans infrastructure/src/adapters/db/schemas/, supprime le volume pour que MySQL réexécute les scripts :

`docker compose down -v`
`docker compose up -d`

## 5️⃣ Démarrer l’application Next.js (API + Web)

Dans le workspace web, lance le serveur de développement :

`pnpm run web:dev`

L’API et l’interface web seront disponibles sur http://localhost:3000.

Les routes API utiliseront la base MySQL configurée via .env.

## 6️⃣ Bonnes pratiques

Toujours utiliser le .env global pour partager les variables entre workspaces et Docker.

Pour ajouter de nouvelles tables ou modifier des schemas, utilise des fichiers SQL préfixés par ordre (01_users.sql, 02_categories.sql, …).

En développement, tu peux recréer le conteneur MySQL pour réinitialiser la base avec tous les scripts.
