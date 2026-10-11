# Document Officiel d'Intégration Flex Pay

**Document :** LUNEA-FLEXPAY-001
**Version :** 1.0
**Date :** 2026-10-09
**Statut :** Production
**Logiciel :** LUNEA
**Module :** Paiements Premium & Retraits

---

## Table des matières

1. [Introduction](#introduction)
2. [Architecture Technique](#architecture-technique)
3. [Configuration](#configuration)
4. [Fonctionnalités](#fonctionnalités)
5. [Base de Données](#base-de-données)
6. [API Endpoints](#api-endpoints)
7. [Interface Utilisateur](#interface-utilisateur)
8. [Sécurité](#sécurité)
9. [Tests](#tests)
10. [Maintenance](#maintenance)

---

## Introduction

Ce document officiel décrit l'intégration de Flex Pay comme méthode de paiement alternative à Newcoin dans le logiciel LUNEA. Flex Pay permet aux artistes de :

- Payer leur abonnement Premium (12 $ / 31 jours)
- Effectuer des retraits de leurs revenus (minimum 500 $)

L'intégration suit le même modèle que Newcoin avec support pour les modes simulation et live.

---

## Architecture Technique

### Composants

```
src/lib/flexpay.ts          → Intégration API Flex Pay
src/app/api/premium/activate/route.ts  → Paiement Premium
src/app/api/withdrawals/route.ts       → Retraits
src/app/premium/paiement/page.tsx      → UI Paiement
src/app/dashboard/retrait/page.tsx     → UI Retrait
prisma/schema.prisma         → Schéma de données
```

### Flux de Paiement Premium

```
UI → API /api/premium/activate → Flex Pay API → DB → Ledger
```

### Flux de Retrait

```
UI → API /api/withdrawals → Flex Pay API → DB → Ledger
```

---

## Configuration

### Variables d'Environnement

Ajoutez dans `.env` :

```bash
# Mode Live Flex Pay
FLEXPAY_API_URL=https://api.flexpay.example.com
FLEXPAY_API_KEY=votre_clé_api_ici
```

### Modes de Fonctionnement

- **Mode Simulation** (par défaut) : Sans variables d'environnement, les transactions sont simulées et enregistrées en base de données
- **Mode Live** : Avec variables configurées, les appels API réels sont effectués

---

## Fonctionnalités

### 1. Paiement Premium

**Fonction :** `chargePremiumFlexPay()`

**Paramètres :**
- `account` : Compte Flex Pay de l'artiste
- `amountUsd` : Montant en USD (fixe à 12 $)
- `artistId` : Identifiant de l'artiste

**Retour :**
```typescript
{
  ok: boolean;
  mode: "live" | "simulation";
  reference: string;
  message: string;
}
```

### 2. Retrait d'Artiste

**Fonction :** `payoutArtistFlexPay()`

**Paramètres :**
- `account` : Compte Flex Pay de l'artiste
- `amountUsd` : Montant en USD
- `withdrawalId` : Identifiant de la demande de retrait

**Retour :**
```typescript
{
  ok: boolean;
  mode: "live" | "simulation";
  reference: string;
  message: string;
}
```

---

## Base de Données

### Modifications du Schéma Prisma

#### Modèle Artist

```prisma
model Artist {
  // ... autres champs
  flexpayAccount String?  // Ajouté
}
```

#### Modèle PremiumPayment

```prisma
model PremiumPayment {
  // ... autres champs
  method         String   @default("Newcoin")  // Modifié
  flexpayAccount String?  // Ajouté
}
```

#### Modèle Withdrawal

```prisma
model Withdrawal {
  // ... autres champs
  method         String   @default("Newcoin")  // Modifié
  newcoinAccount String?  // Modifié (optionnel)
  flexpayAccount String?  // Ajouté
}
```

---

## API Endpoints

### POST /api/premium/activate

Active le Premium via Flex Pay.

**Corps de la requête :**
```json
{
  "paymentMethod": "flexpay",
  "flexpayAccount": "compte_flexpay"
}
```

**Réponse :**
```json
{
  "ok": true,
  "expiresAt": "2026-11-09T00:00:00.000Z",
  "payment": {
    "ok": true,
    "mode": "simulation",
    "reference": "prem_artistId_1234567890",
    "message": "Paiement Flex Pay simulé..."
  }
}
```

### POST /api/withdrawals

Crée une demande de retrait via Flex Pay.

**Corps de la requête :**
```json
{
  "amount": 500,
  "paymentMethod": "flexpay",
  "flexpayAccount": "compte_flexpay"
}
```

**Réponse :**
```json
{
  "ok": true,
  "withdrawal": { ... },
  "payout": {
    "ok": true,
    "mode": "simulation",
    "reference": "wd_withdrawalId",
    "message": "Retrait Flex Pay en attente..."
  }
}
```

---

## Interface Utilisateur

### Page Paiement Premium

**Chemin :** `/premium/paiement`

**Fonctionnalités :**
- Sélection entre Newcoin et Flex Pay
- Saisie du compte Flex Pay
- Affichage du mode (simulation/live)
- Confirmation du paiement

### Page Retrait

**Chemin :** `/dashboard/retrait`

**Fonctionnalités :**
- Sélection entre Newcoin et Flex Pay
- Saisie du montant (minimum 500 $)
- Saisie du compte Flex Pay
- Validation du solde Premium
- Confirmation du retrait

---

## Sécurité

### Validation

- Seuls les artistes Premium peuvent effectuer des retraits
- Solde minimum de 500 $ pour les retraits
- Validation des comptes Flex Pay (non vide)
- Protection contre les montants négatifs

### Authentification

- Session utilisateur requise
- Rôle ARTIST requis
- Vérification du statut Premium

### Audit

- Toutes les transactions sont journalisées dans le ledger
- Référence unique par transaction
- Mode de paiement enregistré (simulation/live)

---

## Tests

### Scénarios de Test

1. **Paiement Premium Simulation**
   - Sélectionner Flex Pay
   - Saisir un compte
   - Vérifier l'activation Premium
   - Vérifier l'enregistrement en DB

2. **Paiement Premium Live**
   - Configurer FLEXPAY_API_*
   - Sélectionner Flex Pay
   - Vérifier l'appel API réussi
   - Vérifier la référence générée

3. **Retrait Simulation**
   - Solde >= 500 $
   - Sélectionner Flex Pay
   - Vérifier la création du retrait
   - Vérifier la déduction du solde

4. **Retrait Live**
   - Configurer FLEXPAY_API_*
   - Solde >= 500 $
   - Vérifier l'appel API payout
   - Vérifier le statut PROCESSING

---

## Maintenance

### Mise à jour de l'API Flex Pay

Si l'API Flex Pay change :
1. Mettre à jour `src/lib/flexpay.ts`
2. Ajuster les endpoints si nécessaire
3. Mettre à jour ce document (version + date)
4. Tester en mode simulation avant le live

### Migration de Données

Pour migrer des paiements existants vers Flex Pay :
1. Exécuter la migration Prisma déjà appliquée
2. Les champs `flexpayAccount` sont optionnels
3. Pas de rupture de compatibilité avec Newcoin

### Support

En cas d'erreur :
- Vérifier les logs serveur
- Vérifier la configuration FLEXPAY_API_*
- Tester en mode simulation
- Consulter la documentation Flex Pay externe

---

## Historique des Versions

| Version | Date | Modifications |
|---------|------|---------------|
| 1.0     | 2026-10-09 | Version initiale - Intégration Flex Pay complète |

---

## Approbation

**Développé par :** Devin AI
**Approuvé par :** [À compléter]
**Signature :** [À compléter]

---

*Fin du document*
