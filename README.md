# 🏦 Banking App - Clean Architecture

Application bancaire moderne construite avec une architecture clean, Next.js et un monorepo pnpm.

---

## 📋 Table des matières

- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration](#️-configuration)
- [Base de données](#-base-de-données)
- [Démarrage](#-démarrage)
- [Comptes de test](#-comptes-de-test)
- [Architecture](#-architecture)

---

## 🔧 Prérequis

- **Node.js** v18+
- **pnpm** v8+
- **Docker** & **Docker Compose**

---

## 📦 Installation

### 1. Cloner le projet

```bash
git clone https://github.com/cecilelecerf/clean-architecture.git banking-app
cd banking-app
```

### 2. Installer les dépendances

```bash
pnpm install
```

Cela installera automatiquement toutes les dépendances pour tous les workspaces du monorepo.

---

## ⚙️ Configuration

### 1. Variables d'environnement racine

Créez un fichier `.env` **à la racine du projet** :

```env
# Database MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3307
MYSQL_USER=myapp_user
MYSQL_PASSWORD=myapp_pass
MYSQL_DATABASE=myapp_db
MYSQL_ROOT_PASSWORD=root

# Database MongoDB
MONGO_URI=mongodb://localhost:27400
MONGO_USERNAME=root
MONGO_PASSWORD=true5ecur3
MONGO_DB_NAME=myapp_db

# JWT
JWT_SECRET=supersecretkey

# Bcrypt
BCRYPT_SALT=10

# SMTP (MailHog)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=no-reply@banking-app.com
```

### 2. Configuration Next.js

Créez un fichier `.env` dans `interfaces/app-next/` :

```env
NEXTAUTH_SECRET=une_chaine_ultra_secrete
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_CLIENT_URL=http://localhost:3000
```

> 💡 **Note :** Modifiez `NEXT_PUBLIC_API_URL` pour basculer entre MySQL (port 3000) et MongoDB (port 3002)

---

## 🗄️ Base de données

### Démarrer les conteneurs Docker

```bash
docker compose up -d
```

Cela démarre :

- **MySQL** sur `localhost:3306`
- **phpMyAdmin** sur [http://localhost:8080](http://localhost:8080)
- **MongoDB** sur `localhost:27400`
- **Mongo Express** sur [http://localhost:8082](http://localhost:8082)
- **MailHog** (SMTP dev) sur [http://localhost:8025](http://localhost:8025)

### MySQL

#### Accès phpMyAdmin

- **URL :** [http://localhost:8080](http://localhost:8080)
- **Serveur :** `mysql`
- **Utilisateur :** `root`
- **Mot de passe :** `root`

#### Commandes utiles

```bash
# Recréer la base de données et les tables
pnpm run mysql:restart

# Ajouter des données de test
pnpm run mysql:seed
```

### MongoDB

#### Accès Mongo Express

- **URL :** [http://localhost:8082](http://localhost:8082)

#### Commandes utiles

```bash
# Recréer la base de données et les collections
pnpm run mongo:restart

# Ajouter des données de test
pnpm run mongo:seed
```

---

## 🚀 Démarrage

### 1. Build des packages

Construisez les packages dans l'ordre suivant :

```bash
pnpm run build:domain
pnpm run build:app
pnpm run build:infra
pnpm run build:next
pnpm run build:express
pnpm run build:socket
pnpm run build:cron
```

> ⚠️ **Important :** L'ordre de build est crucial car les packages dépendent les uns des autres.

### 2. Démarrer les services

#### Application Next.js (API + Frontend)

```bash
pnpm run dev:web
```

- **URL :** [http://localhost:3000](http://localhost:3000)
- **Backend :** Routes API Next.js
- **Base de données :** MySQL

#### Serveur Socket.IO

```bash
pnpm run socket
```

- **Port :** `3001`
- **Utilisation :** Chat

#### API Express (MongoDB)

Attention la partie SSE a été testé seulement sur Next

```bash
pnpm run express
```

- **Port :** `3002`
- **Base de données :** MongoDB

#### Cron Job

```bash
pnpm run cron
```

---

## 👥 Comptes de test

Après avoir exécuté les commandes de seed, vous pouvez vous connecter avec :

| Rôle           | Email                  | Mot de passe  |
| -------------- | ---------------------- | ------------- |
| **Client**     | `client@example.com`   | `password123` |
| **Conseiller** | `advisors@example.com` | `password123` |
| **Directeur**  | `director@example.com` | `password123` |

---

## 🏗️ Architecture

### Structure du projet

```
banking-app/
├── domain/              # Entités et logique métier
├── application/         # Use cases et ports
├── infrastructure/      # Implémentations (MySQL, MongoDB, etc.)
├── interfaces/
│   ├── app-next/       # Application Next.js
│   ├── express/        # API Express (MongoDB)
│   └── sockets/            # Serveur WebSocket
│   └── cron/            # Cron job
├── docker-compose.yml
└── package.json
```

### Technologies utilisées

- **Frontend :** Next.js 15, React 19, Tailwind CSS, shadcn/ui
- **Backend :** Next.js API Routes, Express.js
- **Base de données :** MySQL, MongoDB
- **Cron job :** Node Cron
- **Temps réel :** Socket.IO
- **Authentification :** NextAuth.js
- **Architecture :** Clean Architecture, DDD
- **Monorepo :** pnpm workspaces

### Choix de la base de données

Vous pouvez basculer entre MySQL et MongoDB en modifiant la variable `NEXT_PUBLIC_API_URL` :

- **MySQL (via Next.js API)** → `http://localhost:3000`
- **MongoDB (via Express API)** → `http://localhost:3002`

---

## 📧 Emails de développement

Les emails sont capturés par **MailHog** et consultables sur [http://localhost:8025](http://localhost:8025).

Aucun email n'est envoyé en dehors de votre environnement local.

---

## 📝 Scripts utiles

```bash
# Installer toutes les dépendances
pnpm install

# Lancer le dev server (Next.js)
pnpm run dev:web

# Lancer l'API Express
pnpm run express

# Lancer le serveur Socket
pnpm run socket

# Lancer le serveur de jobs
pnpm run cron

# Build tous les packages
pnpm run build

# Nettoyer les node_modules
pnpm run clean
```

---

## 🤝 Cecile Lecerf et Jade Chi yen
