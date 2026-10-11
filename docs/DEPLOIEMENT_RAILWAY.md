# Guide de Déploiement sur Railway

**Document :** LUNEA-DEPLOY-001
**Version :** 1.0
**Date :** 2026-10-11
**Plateforme :** Railway.app

---

## Prérequis

- Compte Railway (https://railway.app)
- Compte GitHub (pour le dépôt du code)
- Ce projet LUNEA

---

## Étape 1 : Migrer SQLite vers PostgreSQL

Le projet est actuellement configuré avec SQLite. Pour la production sur Railway, nous utilisons PostgreSQL.

Le schéma a déjà été mis à jour dans `prisma/schema.prisma` :
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## Étape 2 : Pousser le code sur GitHub

1. Initialisez Git si ce n'est pas déjà fait :
```bash
git init
git add .
git commit -m "Initial commit - LUNEA avec Flex Pay"
```

2. Créez un dépôt sur GitHub et connectez-le :
```bash
git remote add origin https://github.com/VOTRE_USERNAME/lunea.git
git branch -M main
git push -u origin main
```

---

## Étape 3 : Créer le projet sur Railway

1. Connectez-vous sur https://railway.app
2. Cliquez sur "New Project"
3. Sélectionnez "Deploy from GitHub repo"
4. Choisissez votre dépôt `lunea`
5. Railway détectera automatiquement Next.js

---

## Étape 4 : Configurer la base de données PostgreSQL

1. Dans votre projet Railway, cliquez sur "New Service"
2. Sélectionnez "Database"
3. Choisissez "PostgreSQL"
4. Railway créera une instance PostgreSQL avec une URL de connexion

---

## Étape 5 : Configurer les variables d'environnement

Dans les settings de votre projet Railway, ajoutez ces variables :

### Variables requises

```bash
DATABASE_URL = postgresql://user:password@host:port/database
# (Railway fournit automatiquement cette valeur depuis le service PostgreSQL)

NODE_ENV = production
NEXTAUTH_SECRET = votre_secret_aleatoire_ici
NEXTAUTH_URL = https://votre-app.railway.app
```

### Variables optionnelles (Newcoin)

```bash
NEWCOIN_API_URL = https://api.newcoin.example.com
NEWCOIN_API_KEY = votre_clé_api_newcoin
```

### Variables optionnelles (Flex Pay)

```bash
FLEXPAY_API_URL = https://api.flexpay.example.com
FLEXPAY_API_KEY = votre_clé_api_flexpay
```

### Variables AWS S3 (si utilisé pour le stockage)

```bash
AWS_ACCESS_KEY_ID = votre_access_key
AWS_SECRET_ACCESS_KEY = votre_secret_key
AWS_REGION = us-east-1
AWS_S3_BUCKET = votre_bucket_name
```

---

## Étape 6 : Configurer le build

Railway utilisera le fichier `.nixpacks.toml` créé automatiquement :

```toml
[phases.build]
cmds = ["npm install", "prisma generate", "npm run build"]

[phases.start]
cmds = ["prisma migrate deploy", "npm start"]
```

Cela garantit que :
- Prisma génère le client
- Les migrations sont appliquées au démarrage
- L'application Next.js démarre correctement

---

## Étape 7 : Lier la base de données

1. Cliquez sur votre service "Next.js"
2. Allez dans l'onglet "Variables"
3. Cliquez sur "New Variable"
4. Nom : `DATABASE_URL`
5. Value : Sélectionnez le service PostgreSQL via le bouton "Reference"
6. Railway liera automatiquement la variable à l'URL de la DB

---

## Étape 8 : Déployer

1. Cliquez sur "Deploy" dans votre projet Railway
2. Railway construira et déploiera automatiquement
3. Attendez la fin du build (2-3 minutes)
4. Votre application sera accessible sur une URL comme :
   `https://lunea-production.up.railway.app`

---

## Étape 9 : Vérifier le déploiement

1. Cliquez sur l'URL fournie par Railway
2. Vérifiez que la page d'accueil s'affiche
3. Testez l'inscription
4. Testez le paiement Premium
5. Testez les retraits

---

## Étape 10 : Configurer un domaine personnalisé (optionnel)

Si vous avez un domaine :

1. Dans Railway, allez dans "Settings" → "Networking"
2. Cliquez "Custom Domain"
3. Entrez votre domaine (ex: lunea.com)
4. Railway vous donnera les DNS à configurer chez votre registrar
5. Configurez les enregistrements DNS :
   - Type: CNAME
   - Name: @ (ou www)
   - Value: votre-app.railway.app

---

## Surveillance et Logs

### Voir les logs

1. Dans Railway, cliquez sur votre service
2. Onglet "Logs"
3. Vous verrez les logs en temps réel

### Base de données

1. Cliquez sur le service PostgreSQL
2. Onglet "Console" pour exécuter des requêtes SQL
3. Onglet "Metrics" pour voir la performance

---

## Mises à jour

Pour mettre à jour l'application :

1. Faites vos changements localement
2. Commit et push sur GitHub
3. Railway détectera automatiquement le nouveau commit
4. Un nouveau build et déploiement se lancera automatiquement

---

## Sauvegarde de la base de données

Railway offre des sauvegardes automatiques. Pour exporter manuellement :

1. Cliquez sur le service PostgreSQL
2. Onglet "Connect"
3. Copiez la commande de connexion
4. Exécutez localement :
```bash
pg_dump $DATABASE_URL > backup.sql
```

---

## Coûts estimés (Railway)

- **Plan Hobby** (gratuit) :
  - 500h/mois de CPU
  - 1GB RAM
  - PostgreSQL inclus
  - Suffisant pour démarrer

- **Plan Pro** (5$/mois) :
  - Plus de ressources
  - Meilleure performance
  - Recommandé pour la production

---

## Dépannage

### Build échoue

- Vérifiez les logs dans Railway
- Assurez-vous que `npm run build` fonctionne localement
- Vérifiez que toutes les dépendances sont dans package.json

### Erreur de connexion DB

- Vérifiez que `DATABASE_URL` est correctement liée
- Vérifiez que PostgreSQL est en cours d'exécution
- Regardez les logs du service PostgreSQL

### Erreur Prisma

- Assurez-vous que `prisma generate` est exécuté pendant le build
- Vérifiez que les migrations sont appliquées
- Regardez les logs au démarrage

---

## Sécurité

- Ne committez JAMAIS les fichiers `.env`
- Utilisez Railway Variables pour les secrets
- Activez HTTPS (automatique sur Railway)
- Configurez des limites de taux si nécessaire
- Surveillez les logs pour les activités suspectes

---

## Support

- Documentation Railway : https://docs.railway.app
- Documentation Next.js : https://nextjs.org/docs
- Documentation Prisma : https://www.prisma.io/docs

---

## Contact

Pour toute question sur le déploiement LUNEA :
- Vérifier ce document
- Consulter les logs Railway
- Vérifier la documentation officielle

---

*Fin du document*
