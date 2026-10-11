# LUNEA

Plateforme musicale (Next.js) — **sans Docker**.

## Stack locale

- Base : **SQLite** (`prisma/dev.db`)
- Fichiers MP3 : **`public/uploads`**
- Auth : cookies JWT

## Démarrage

```bash
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

### Comptes seed (mot de passe : `lunea123`)

- `admin@lunea.app` — admin
- `lunez@lunea.app` — artiste Normal
- `malaika@lunea.app` / `kofi@lunea.app` — artistes Premium

## Config

Copie `.env.example` → `.env` si besoin.  
S3 / Newcoin sont optionnels (cloud), pas de Docker requis.
