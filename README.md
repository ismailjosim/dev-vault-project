<div align="center">

# 🔐 DevVault

**The Zero-Knowledge Secrets Management, Environment Variable Synchronization & Security Command Center**

DevVault is a production-ready, enterprise-grade platform designed to securely encrypt, version, audit, synchronize, and inject environment variables and cloud credentials across engineering teams and pipelines.

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.2-47a248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-1.6-red?style=for-the-badge)](https://better-auth.com/)
[![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](#-license)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Why DevVault? (Comparison Matrix)](#-why-devvault-comparison-matrix)
- [Key Features](#-key-features)
  - [1. Authenticated AES-256 GCM Field Encryption](#1-authenticated-aes-256-gcm-field-encryption)
  - [2. Secret Version History & 1-Click Rollback](#2-secret-version-history--1-click-rollback)
  - [3. Zero-Knowledge Ephemeral Secret Sharing](#3-zero-knowledge-ephemeral-secret-sharing)
  - [4. Environment Comparison & Schema Sync](#4-environment-comparison--schema-sync)
  - [5. Developer CLI (In-Memory Process Injection)](#5-developer-cli-in-memory-process-injection)
  - [6. Real-Time Secret Leak & Shannon Entropy Scanner](#6-real-time-secret-leak--shannon-entropy-scanner)
  - [7. Dynamic Cross-Variable Interpolation](#7-dynamic-cross-variable-interpolation)
  - [8. Team Workspaces & RBAC with Auto-Claim Invites](#8-team-workspaces--rbac-with-auto-claim-invites)
  - [9. Expiring Secrets Dashboard Alert Banner](#9-expiring-secrets-dashboard-alert-banner)
  - [10. Cloud & CI/CD Integrations (Vercel, GitHub, Webhooks)](#10-cloud--cicd-integrations-vercel-github-webhooks)
  - [11. Comprehensive Audit Trails with Unified Diffs](#11-comprehensive-audit-trails-with-unified-diffs)
  - [12. Multi-Format Importer & Exporter](#12-multi-format-importer--exporter)
  - [13. Developer Cryptographic Generators](#13-developer-cryptographic-generators)
  - [14. Stack Blueprints & Code Snippets Library](#14-stack-blueprints--code-snippets-library)
- [DevVault CLI Manual](#-devvault-cli-manual)
- [User Guide & Common Workflows](#-user-guide--common-workflows)
- [Tech Stack & Modular Architecture](#-tech-stack--modular-architecture)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Running Locally](#running-locally)
- [Security Specifications](#-security-specifications)
- [Available Scripts](#-available-scripts)
- [License](#-license)

---

## 🌟 Overview

Modern software development relies heavily on third-party APIs, database connection strings, payment gateway keys, and cloud credentials. However, traditional configuration management causes severe operational and security pitfalls:

- **Plaintext `.env` leaks**: Secrets committed accidentally to public GitHub repositories or lingering on developer laptops.
- **Lack of audit trails**: No record of who changed a production secret, when it changed, or why.
- **Disastrous deployment breaks**: Missing variables in `prod` that were added in `dev` but never documented.
- **Cross-environment contamination**: Staging API keys operating in production or vice-versa.
- **Insecure secret sharing**: Credentials pasted into Slack, Microsoft Teams, or email in plaintext.

**DevVault** solves these issues with a zero-knowledge developer platform: secrets remain encrypted at rest with AES-256 GCM, are injected directly into child processes in memory without touching disk, and can be safely shared via self-destructing zero-knowledge links.

---

## ⚖️ Why DevVault? (Comparison Matrix)

| Capability                                             |           DevVault           |   Plain `.env` Files    | Generic Password Managers |
| :----------------------------------------------------- | :--------------------------: | :---------------------: | :-----------------------: |
| **In-Memory Process Injection (Zero Disk Leak)**       | ✅ **Yes (`devvault run`)**  | ❌ No (written to disk) |           ❌ No           |
| **AES-256 GCM Authenticated Field Encryption**         | ✅ **Yes (Unique IV + Tag)** |      ❌ Plaintext       |    ⚠️ Vault-level only    |
| **Immutable Version History & 1-Click Rollback**       |   ✅ **Yes (Full Diffs)**    |     ❌ Lost forever     |        ⚠️ Limited         |
| **Zero-Knowledge Ephemeral Link Sharing (`#key`)**     |  ✅ **Yes (Burn-on-read)**   |         ❌ None         |           ❌ No           |
| **Environment Comparison & 1-Click Missing Sync**      | ✅ **Yes (`DEV` vs `PROD`)** |     ❌ Manual diff      |           ❌ No           |
| **Cross-Variable Dynamic Interpolation (`${VAR}`)**    | ✅ **Yes (Cycle Detection)** |  ❌ Manual copy-paste   |           ❌ No           |
| **Continuous Shannon Entropy Leak Detection**          |   ✅ **Yes (0–100 Score)**   |         ❌ None         |           ❌ No           |
| **Full Team Audit Logs with Unified Diffs**            | ✅ **Yes (Actor + Action)**  |         ❌ None         |       ⚠️ Basic logs       |
| **Developer CLI Integration (`run`, `pull`, `share`)** |    ✅ **Native Node CLI**    |  ❌ Manual management   |     ⚠️ Complex agents     |

---

## ✨ Key Features

### 1. Authenticated AES-256 GCM Field Encryption

- Every secret key and value is encrypted at rest using AES-256 GCM authenticated encryption.
- Unique cryptographically random 12-byte initialization vectors (IVs) and 16-byte authentication tags ensure ciphertext integrity and tamper resistance.
- Values remain masked by default in the web UI (`••••••••`) with one-click reveal and clipboard auto-clearing.

### 2. Secret Version History & 1-Click Rollback

- Every secret creation, modification, and deletion creates an immutable version snapshot.
- **Unified Diff Viewer**: Inspect exact line-by-line diffs between versions, complete with modification reasons and actor attribution.
- **Instant Rollback**: Restore any previous secret version in 1 click without redeploying your codebase.

### 3. Zero-Knowledge Ephemeral Secret Sharing

- Share sensitive credentials, SSH keys, or certificates with teammates and clients.
- **Zero-Knowledge URL Hash Architecture**: The encryption key is appended to the URL fragment (`#key=...`). Browsers never transmit hash fragments to servers, ensuring the DevVault host never sees the plaintext or the decryption key.
- **Burn-on-Read**: Secret automatically self-destructs the moment it is accessed.
- **Custom Time-to-Live (TTL)**: Choose expiration intervals from 10 minutes up to 7 days.
- **PBKDF2 Passphrase Protection**: Optional client-side passphrase protection with 100,000 salt iterations.

### 4. Environment Comparison & Schema Sync

- Side-by-side visual comparison between any two environments (e.g., `dev` vs `prod` or `staging` vs `prod`).
- **Missing Key Audit**: Detects variables present in `dev` but missing in `prod` to prevent deployment crashes.
- **1-Click Schema Clone**: Clone all missing variable definitions to the target environment with or without copying values.

### 5. Developer CLI (In-Memory Process Injection)

- Standalone executable bundled in `bin/devvault.mjs`.
- **Zero Plaintext Files on Disk**: `devvault run -- npm run dev` decrypts variables into OS process memory and spawns child processes inheriting decrypted credentials.
- **Selective Pull**: Export configurations on demand via `devvault pull --env prod`.
- **CLI Quickshare**: Share secrets straight from the terminal with `devvault share`.

### 6. Real-Time Secret Leak & Shannon Entropy Scanner

- **Continuous Health Score (0–100)**: Evaluates project secret security in real time.
- **Signature Detection**: Flags accidental commits of high-privilege keys:
  - AWS Access Key IDs (`AKIA...`)
  - Stripe Live Secret Keys (`sk_live_...`)
  - GitHub Personal Access Tokens (`ghp_...`)
  - Google Cloud API Keys (`AIza...`)
  - Private SSH / RSA Keys (`-----BEGIN RSA PRIVATE KEY-----`)
  - Slack Bot Tokens (`xoxb-...`)
- **Shannon Entropy Evaluation**: Automatically detects low-entropy, default, or guessable secrets (`password123`, `admin`, `secret`).
- **Insecure Protocol Warnings**: Flags unencrypted `http://` endpoints in production.

### 7. Dynamic Cross-Variable Interpolation

- Compose reusable connection strings:
  ```env
  DB_HOST=cluster0.mongodb.net
  DB_PORT=27017
  DB_USER=app_user
  DB_PASS=vault_secret_pass
  DATABASE_URL="mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/production"
  ```
- **Cycle Detection Engine**: Built-in dependency graph detects cyclic dependencies (`A -> B -> A`) and surfaces helpful error alerts.

### 8. Team Workspaces & RBAC with Auto-Claim Invites

- Switch between private **Personal Vaults** and team **Organization Workspaces**.
- **Granular Roles**: `owner`, `admin`, `developer`, `viewer`.
- **Environment Guardrails**: Restrict developers to `dev` and `test` environments while gating `prod`.
- **Capability Flags**: Control `canRevealSecrets` and `canExportSecrets` per member.
- **Smart Auto-Claim**: Team invitations sent by email automatically link to real user accounts the moment the user registers or signs in.

### 9. Expiring Secrets Dashboard Alert Banner

- Scans all visible projects for credentials with expiration dates within the next 7 days (or already expired).
- Renders an interactive alert banner on the main dashboard with direct links to the affected projects and environments.

### 10. Cloud & CI/CD Integrations (Vercel, GitHub, Webhooks)

- **Vercel**: Automatically synchronizes environment variables to Vercel Project Settings via REST API.
- **GitHub Actions**: Encrypts and pushes secrets to GitHub Repository Secrets using asymmetrical libsodium sealed-box encryption.
- **Custom Webhooks**: Dispatches HMAC-SHA256 signed JSON payloads to deployment pipelines when secrets update.

### 11. Comprehensive Audit Trails with Unified Diffs

- Complete compliance audit log capturing:
  - `SECRET_CREATE`, `SECRET_UPDATE`, `SECRET_DELETE`, `SECRET_REVEAL`, `SECRET_ROLLBACK`, `PROJECT_EXPORT`.
- Stores actor email, timestamp, client IP, user agent, target environment, and before/after values.

### 12. Multi-Format Importer & Exporter

- **Import**: Paste or drag-and-drop `.env` files with automatic type inference and duplicate collision handling.
- **Export**:
  - Standard `.env`, `.env.local`, `.env.production`
  - Sanitized `.env.example` (masks values with format hints)
  - Structured `JSON`
  - Cloud `YAML`
  - Markdown Documentation Table

### 13. Developer Cryptographic Generators

- **Customizable Password Generator**: Select length, character sets, and avoid ambiguous characters (`0`/`O`, `1`/`l`).
- **JWT & API Secret Key Generator**: Generates cryptographically secure high-entropy random keys (32 to 128 bytes) using the Web Crypto API.

### 14. Stack Blueprints & Code Snippets Library

- **Pre-Built Stack Blueprints**: Initialize complete environment variable sets for:
  - _Next.js + MongoDB + Better Auth_
  - _MERN Stack (Express, Mongo, JWT)_
  - _Stripe Billing Integration_
  - _AWS S3 Storage Suite_
  - _Supabase & GitHub OAuth_
- **Code Snippets**: Production-tested, syntax-highlighted snippets for Mongoose singletons, Stripe webhook verifiers, Axios interceptors, and AWS S3 presigned URLs.

---

## 💻 DevVault CLI Manual

The DevVault CLI is bundled inside `./bin/devvault.mjs` and installed via `npm link` or `npm install -g devvault-cli`.

### Quickstart

```bash
# 1. Authenticate with a Personal Access Token (PAT)
devvault login --token dv_live_xxxxxxxxxxxxxxxx

# 2. Link your current directory to a project
cd my-project
devvault link --project my-project-slug --env dev

# 3. Inject secrets into your dev process in memory (Zero plaintext files!)
devvault run -- npm run dev

# 4. Pull secrets into an encrypted or local file (if required by Docker)
devvault pull --env prod --format env > .env.production

# 5. Share a sensitive file or secret via ephemeral zero-knowledge link
devvault share --file id_rsa --ttl 1h --burn-on-read
```

### CLI Command Reference

| Command          | Arguments                                             | Description                                                     |
| :--------------- | :---------------------------------------------------- | :-------------------------------------------------------------- |
| `devvault login` | `--token <pat>`                                       | Authenticates CLI with your DevVault API token.                 |
| `devvault link`  | `--project <slug\|id> [--env <name>]`                 | Links local directory to a project via `.devvault.json`.        |
| `devvault run`   | `-- <command>`                                        | Injects decrypted environment variables into child process RAM. |
| `devvault pull`  | `[--env <name>] [--format <env\|json>]`               | Fetches variables and prints or writes them.                    |
| `devvault share` | `[--file <path>] [--ttl <duration>] [--burn-on-read]` | Creates a self-destructing ephemeral link.                      |
| `devvault help`  | —                                                     | Displays the CLI reference guide.                               |

---

## 📖 User Guide & Common Workflows

### Workflow 1: Comparing Environments & Syncing Missing Keys

1. Open your project at `/dashboard/projects/[id]`.
2. Click **Compare Environments** above the environment variables table.
3. Select **Source: DEV** and **Target: PROD**.
4. DevVault lists all variables that exist in `DEV` but are missing in `PROD`.
5. Check **Copy values too** (or leave unchecked for empty schema definitions) and click **Clone Missing to PROD**.

### Workflow 2: Restoring a Compromised Secret

1. On your project page, locate the variable and click the **History icon** (clock).
2. Browse historical versions, inspecting unified diffs and modification timestamps.
3. Select the target stable version and click **Rollback to this version**.
4. DevVault creates a new version restoring the original ciphertext and logs the rollback in the audit trail.

### Workflow 3: Ephemeral Credential Sharing

1. Navigate to **Tools $\rightarrow$ Ephemeral Share** (`/dashboard/tools/secret-share`).
2. Paste the sensitive credential or private key.
3. Configure **Expiration** (e.g. `1 hour`), check **Burn on first read**, and set an optional passphrase.
4. Click **Generate Secure Link**.
5. Copy the URL containing `#key=...`. Share it safely over Slack or email.

---

## 🛠️ Tech Stack & Modular Architecture

### Frontend

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) — Server Components by default with client interactivity delegation
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with custom design tokens
- **Icons**: [Lucide React](https://lucide.dev/)
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes) (Dark / Light / System)
- **Code Styling**: Modern, clean structure strictly following the `< 300 lines per component` rule with dedicated subdirectories (`compare/`, `form/`, `history/`, `api-keys/`, `secret-share/`, `landing/`).

### Backend & Storage

- **Runtime**: Next.js Server Actions & Route Handlers
- **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose v9 ODM + native `mongodb` driver)
- **Authentication**: [Better Auth](https://better-auth.com/) with MongoDB Adapter
- **Cryptography**: AES-256 GCM (Authenticated field encryption with unique IVs), PBKDF2 passphrase hashing, Web Crypto API (`crypto.getRandomValues`)
- **Integrations**: Libsodium public-key encryption for GitHub Actions secrets, Vercel REST API, HMAC-SHA256 webhooks

---

## 📂 Project Directory Structure

```plaintext
dev-vault/
├── bin/
│   └── devvault.mjs                # Developer CLI executable
├── src/
│   ├── app/                        # Next.js App Router (All Server Components)
│   │   ├── page.tsx                # Feature showcase landing page
│   │   ├── api/                    # 35 REST Route Handlers
│   │   │   ├── api-keys/           # PAT creation & validation
│   │   │   ├── audit/              # Compliance audit logging
│   │   │   ├── auth/               # Better Auth route handlers
│   │   │   ├── cli/                # CLI secret injection endpoints
│   │   │   ├── projects/           # Projects, docs, integrations, rollback, clone
│   │   │   ├── tools/              # Ephemeral share, leak scanner, generators
│   │   │   └── workspaces/         # Workspaces, member RBAC & auto-claim
│   │   ├── dashboard/              # Protected application views
│   │   │   ├── projects/           # Project vaults, history, comparison, docs
│   │   │   ├── tools/              # CLI keys, secret share, password generator
│   │   │   └── workspaces/         # Team member permissions & role management
│   │   └── share/[shareId]/        # Zero-knowledge secret decryptor view
│   ├── components/                 # Modular React components (< 300 lines each)
│   │   ├── audit/                  # AuditLogTable, FilterBar, Pagination, Badges
│   │   ├── auth/                   # LogoutButton, LoginForm, AutoLockModal
│   │   ├── common/                 # BrandLogo, SearchBar, FilterPanel
│   │   ├── env/                    # EnvVariableTable, EnvVariableItem, ExpiryBadge
│   │   │   ├── compare/            # EnvironmentCompareModal, useEnvironmentCompare
│   │   │   ├── form/               # EnvVariableForm, InterpolationHelper
│   │   │   └── history/            # SecretHistoryModal, VersionDiff, VersionItem
│   │   ├── landing/                # LandingHero, FeaturesGrid, SecurityArch, Comparison
│   │   ├── projects/               # ProjectCard, ProjectList, ProjectForm
│   │   ├── security/               # SecurityHealthCard, ExpiringSecretsAlert
│   │   ├── share/                  # SharedSecretViewer, UnlockForm, BurnedState
│   │   ├── tools/                  # ApiKeysManager, SecretShareTool, Generators
│   │   └── workspaces/             # WorkspaceSwitcher, MembersTable, InviteModal
│   ├── models/                     # Mongoose Schemas (Project, EnvVariable, Version, etc.)
│   ├── utils/                      # Encryption, interpolation, audit, security scanner
│   └── lib/                        # MongoDB singleton, session helpers, API wrappers
├── tsconfig.json                   # Strict TypeScript configuration
└── package.json                    # Project configuration & scripts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v20.x` or later
- **pnpm**: `v9.x` or later (`npm install -g pnpm`)
- **MongoDB**: Running local instance (`mongodb://localhost:27017/dev-vault`) or a MongoDB Atlas URI

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/dev-vault.git
cd dev-vault

# 2. Install dependencies
pnpm install

# 3. Link the CLI globally (optional)
npm link
```

### Environment Configuration

Create a `.env` file in the root directory:

```env
# MongoDB Connection String
MONGODB_URL=mongodb://localhost:27017/dev-vault

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
BETTER_AUTH_URL=http://localhost:3000

# Better Auth Secret (32+ character key)
BETTER_AUTH_SECRET=your-random-better-auth-secret-key-at-least-32-chars

# Master AES-256 Encryption Key
ENCRYPTION_KEY=your-secure-master-encryption-key-for-aes-256

# Optional: Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### Running Locally

```bash
# Start development server
pnpm dev

# Build and start production bundle
pnpm build
pnpm start
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🔒 Security Specifications

- **Data at Rest**: Authenticated AES-256 GCM encryption on all secret fields with unique initialization vectors.
- **Ephemeral Sharing**: Encryption keys isolated inside URL hash fragments (`#key=...`) ensuring zero-knowledge transfer.
- **Process RAM Injection**: Secrets piped straight to child processes in memory (`devvault run`), leaving zero traces on developer disk.
- **Session Defense**: HttpOnly SameSite session cookies backed by Better Auth.
- **Audit Logging**: 100% mutation coverage tracking user, IP, action, timestamp, and unified diffs.
- **Shannon Entropy**: Mathematical entropy analysis detects brute-forceable and leaked tokens automatically.

---

## 📜 Available Scripts

| Command       | Description                                                  |
| :------------ | :----------------------------------------------------------- |
| `pnpm dev`    | Starts Next.js development server on `http://localhost:3000` |
| `pnpm build`  | Compiles optimized production bundle across all 35 routes    |
| `pnpm start`  | Launches compiled production server                          |
| `pnpm lint`   | Validates TypeScript and ESLint code standards (0 errors)    |
| `pnpm format` | Formats all code with Prettier and Tailwind CSS plugin       |

---

## 📄 License

This project is licensed under the **MIT License**.
