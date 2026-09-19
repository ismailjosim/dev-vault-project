<div align="center">

# 🔐 DevVault

**The Enterprise-Grade Secret Management, Environment Variable Synchronization & Security Command Center**

DevVault is a full-stack platform designed to securely encrypt, audit, synchronize, and inject environment variables, cloud secrets, architecture blueprints, and integration snippets across teams and environments.

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.2-47a248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-1.6-red?style=for-the-badge)](https://better-auth.com/)
[![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](#license)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Comprehensive Features](#-comprehensive-features)
  - [1. Cryptographic Security & Secrets Vault](#1-cryptographic-security--secrets-vault)
  - [2. Automated Secret Security Scanner & Health Auditor](#2-automated-secret-security-scanner--health-auditor)
  - [3. DevVault CLI (Zero-Disk In-Memory Injection)](#3-devvault-cli-zero-disk-in-memory-injection)
  - [4. Team Workspaces & Role-Based Access Control (RBAC)](#4-team-workspaces--role-based-access-control-rbac)
  - [5. Cloud & CI/CD Integrations Engine](#5-cloud--cicd-integrations-engine)
  - [6. Variable Interpolation & Reference Resolution](#6-variable-interpolation--reference-resolution)
  - [7. Multi-Environment & Multi-Format Exporter](#7-multi-environment--multi-format-exporter)
  - [8. Smart .env Parser & Collision-Safe Importer](#8-smart-env-parser--collision-safe-importer)
  - [9. Missing Env Checker & Schema Diffing](#9-missing-env-checker--schema-diffing)
  - [10. Token & Credential Expiration Tracker](#10-token--credential-expiration-tracker)
  - [11. Developer Cryptographic Generators](#11-developer-cryptographic-generators)
  - [12. Stack Blueprints & Reusable Snippets](#12-stack-blueprints--reusable-snippets)
  - [13. Project Documentation Hub](#13-project-documentation-hub)
  - [14. Inactivity Auto-Lock & Session Defense](#14-inactivity-auto-lock--session-defense)
- [User Guide & How-To Workflows](#-user-guide--how-to-workflows)
  - [Workflow 1: Getting Started & Creating Workspaces](#workflow-1-getting-started--creating-workspaces)
  - [Workflow 2: Managing Secrets & Resolving Interpolation](#workflow-2-managing-secrets--resolving-interpolation)
  - [Workflow 3: Auditing Secrets with the Security Scanner](#workflow-3-auditing-secrets-with-the-security-scanner)
  - [Workflow 4: Synchronizing Secrets to Vercel, GitHub & Webhooks](#workflow-4-synchronizing-secrets-to-vercel-github--webhooks)
  - [Workflow 5: Running Local Apps with the DevVault CLI](#workflow-5-running-local-apps-with-the-devvault-cli)
  - [Workflow 6: Team Collaboration & Granular RBAC](#workflow-6-team-collaboration--granular-rbac)
  - [Workflow 7: Importing and Exporting Environment Files](#workflow-7-importing-and-exporting-environment-files)
- [DevVault CLI Command Reference](#-devvault-cli-command-reference)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Running the Application](#running-the-application)
- [Security Architecture](#-security-architecture)
- [Available Scripts](#-available-scripts)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

Modern software development relies heavily on third-party APIs, database connection strings, payment gateway keys, and cloud credentials. However, traditional secret management often leads to:

- **Unencrypted `.env` files** accidentally committed to public Git repositories.
- **Outdated `.env.example` files** causing broken builds and painful onboarding.
- **Cross-environment contamination** (e.g., test Stripe keys operating in production).
- **Weak or default passwords** exposed in shared developer channels.
- **No visibility** into when API keys expire or which team members have access to reveal plaintext credentials.

**DevVault** solves these challenges by combining an encrypted web dashboard with an automated security auditor, multi-cloud synchronization, granular team RBAC, and an in-memory CLI runtime. Secrets remain encrypted at rest and can be injected directly into child processes without writing plaintext secrets to disk.

---

## ✨ Comprehensive Features

### 1. Cryptographic Security & Secrets Vault

- **AES-256 Encryption at Rest**: Every secret value is automatically encrypted using AES-256 before persistence in MongoDB. Plaintext values are never transmitted in bulk payloads.
- **Masked-by-Default UI**: Secret values are masked (`••••••••`) with one-click toggles to reveal or copy.
- **Clipboard Auto-Clearing**: Copied sensitive credentials automatically trigger clipboard timeouts to prevent lingering clipboard exposure.
- **Granular Secret Categories**: Categorize variables by type: `secret`, `jwt`, `api_key`, `url`, `database_url`, or `other`.

### 2. Automated Secret Security Scanner & Health Auditor

- **0–100 Security Health Score**: Real-time evaluation of your project's overall secret security posture.
- **Signature Leaked Key Detection**: Scans secret values against known high-privilege token patterns:
  - AWS Access Key IDs (`AKIA...`)
  - Stripe Live Secret Keys (`sk_live_...`)
  - GitHub Personal Access Tokens (`ghp_...`)
  - Google Cloud / Maps API Keys (`AIza...`)
  - Private SSH and RSA Keys (`-----BEGIN RSA PRIVATE KEY-----`)
  - Slack Bot Tokens (`xoxb-...`)
- **Shannon Entropy Analysis**: Detects low-entropy, guessable, or default secrets (e.g., `secret123`, `admin`, `password`).
- **Insecure Protocol Warnings**: Flags plain `http://` URLs configured in production or staging environments.
- **Environment Mismatch Detection**: Alerts when test keys are placed in `prod` or live production credentials appear in `dev`.

### 3. DevVault CLI (Zero-Disk In-Memory Injection)

- **Direct Process Memory Injection**: Runs your development server (`devvault run -- npm run dev`) with decrypted environment variables fed directly into process memory. Plaintext `.env` files are never written to disk.
- **Personal Access Tokens (PATs)**: Secure, scoped CLI tokens with optional expiration dates and last-used timestamps.
- **Project Directory Linking**: Link any repository directory to a DevVault project using `devvault link`.
- **Selective Pulls**: Download environment configurations into local `.env` or JSON files on demand via `devvault pull`.

### 4. Team Workspaces & Role-Based Access Control (RBAC)

- **Multi-Tenant Workspaces**: Switch seamlessly between your Personal Vault and Organization Workspaces.
- **Granular RBAC Roles**:
  - `owner`: Complete administrative control, workspace settings, and member management.
  - `admin`: Full project and member management rights.
  - `developer`: View and edit authorized environment configurations.
  - `viewer`: Read-only access to authorized environments.
- **Environment-Level Guardrails**: Restrict team member visibility by environment (`dev`, `staging`, `test`, `prod` gating).
- **Capability Flags**:
  - `canRevealSecrets`: Governs whether a member can unmask plaintext secrets in the UI.
  - `canExportSecrets`: Governs whether a member can download or export `.env` bundles.

### 5. Cloud & CI/CD Integrations Engine

- **Vercel Integration**: Automatically synchronize DevVault environment variables directly into Vercel Project Environment Variables via the Vercel REST API.
- **GitHub Actions Integration**: Encrypt and push secrets directly into GitHub Repository Secrets using libsodium sealed-box encryption.
- **Custom Webhooks**: Dispatch HMAC-signed HTTP POST payloads to custom CI/CD pipelines or deployment hooks when secrets update.
- **Environment Mapping**: Map local environments to provider target environments (e.g., DevVault `prod` $\rightarrow$ Vercel `Production`).

### 6. Variable Interpolation & Reference Resolution

- **Cross-Referenced Variables**: Define variables using `${VAR_NAME}` syntax (e.g., `DATABASE_URL="mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"`).
- **Circular Dependency Protection**: Built-in resolution graph prevents infinite loops and surfaces unresolvable variable warnings.

### 7. Multi-Environment & Multi-Format Exporter

- **Environment Separation**: Switch between `dev`, `staging`, `prod`, and `test` tabs instantly.
- **Export Formats**:
  - Standard `.env`, `.env.local`, `.env.development`, `.env.production`, `.env.test`
  - Sanitized `.env.example` (values replaced with placeholder format hints)
  - Structured `JSON`
  - Cloud-ready `YAML`
  - Formatted `Markdown Table` for documentation

### 8. Smart .env Parser & Collision-Safe Importer

- **Intelligent Parser**: Paste or drag-and-drop raw `.env` contents. Supports inline comments, multi-line values, single and double quotes, and empty line spacing.
- **Automatic Type Inference**: Classifies imported keys into `database_url`, `jwt`, `api_key`, or `secret`.
- **Collision & Overwrite Protection**: Highlights duplicate keys before saving, allowing selective merges.

### 9. Missing Env Checker & Schema Diffing

- Compare active project secrets directly against a `.env.example` schema file.
- Categorizes variables into **Matched**, **Missing**, and **Extra** with visual status badges so you never deploy with missing keys.

### 10. Token & Credential Expiration Tracker

- Assign expiration timestamps to sensitive tokens, SSL certificates, or API keys.
- Real-time status indicators (`Active`, `Expiring Soon`, `Expired`) alert your team before service disruptions occur.

### 11. Developer Cryptographic Generators

- **Customizable Password Generator**: Configure length, character classes (uppercase, lowercase, numbers, symbols), and eliminate ambiguous characters (like `0`/`O` and `1`/`l`).
- **JWT & Secret Key Generator**: Cryptographically strong random strings (32 to 128+ bytes) using the Web Crypto API (`crypto.getRandomValues`) for authentication tokens and HMAC secrets.

### 12. Stack Blueprints & Reusable Snippets

- **Pre-Built Stack Blueprints**: Seed new projects with one click:
  - _Next.js + MongoDB + Better Auth_
  - _MERN Stack (Express, Mongo, JWT)_
  - _Stripe Billing Integration_
  - _AWS S3 Storage_
  - _Cloudinary Media Suite_
  - _Firebase Web Suite_
  - _Supabase & GitHub OAuth_
- **Code Snippet Library**: Verified, syntax-highlighted code implementations (Mongoose connection singleton, Stripe webhook verifier, Axios interceptors, AWS S3 presigned URLs) linked to required environment variables.

### 13. Project Documentation Hub

- Each project includes a dedicated documentation area (`/dashboard/projects/[id]/docs`):
  - **Repositories**: Client, server, and monorepo repository links.
  - **Deployments**: Live URLs, Vercel preview environments, and Heroku dashboards.
  - **Database & Auth**: Database cluster names, test credentials, and admin handles.
  - **Markdown Notes**: Rich project setup instructions, troubleshooting steps, and architectural notes.

### 14. Inactivity Auto-Lock & Session Defense

- **Session Auto-Lock**: Configurable inactivity timer detects idle periods and locks the vault interface.
- **PIN / Password Unlock**: Unlocks without invalidating the session, safeguarding unattended developer workstations.

---

## 📖 User Guide & How-To Workflows

### Workflow 1: Getting Started & Creating Workspaces

1. **Sign Up / Log In**:
   - Open DevVault in your browser. Register with email and password or sign in with Google.
2. **Access Your Personal Vault**:
   - By default, your dashboard displays your **Personal Vault** for private solo projects.
3. **Create a Team Workspace**:
   - Click the **Workspace Switcher** in the top navigation bar.
   - Select **+ Create New Workspace**.
   - Provide a workspace name (e.g., `Acme Engineering`) and custom slug (e.g., `acme-engineering`).
   - Switch into the workspace to collaborate with teammates.

---

### Workflow 2: Managing Secrets & Resolving Interpolation

1. **Create or Open a Project**:
   - Click **+ New Project**, fill in the project title, category, framework, and tags.
2. **Add Environment Variables**:
   - Navigate to the **Variables** tab.
   - Click **Add Variable**.
   - Input `Key` (e.g., `DATABASE_URL`), `Value`, `Environment` (`dev`, `staging`, `prod`, `test`), and `Type`.
3. **Use Variable Interpolation**:
   - Store base variables like `PORT=5000` and `HOST=localhost`.
   - Create composite variables: `API_URL="http://${HOST}:${PORT}/api"`.
   - DevVault resolves these references dynamically on export, sync, and CLI execution.
4. **Reveal or Copy**:
   - Click the **Eye icon** to view masked secrets.
   - Click the **Copy icon** to copy the value (auto-clears from clipboard shortly after).

---

### Workflow 3: Auditing Secrets with the Security Scanner

1. Open your project and click the **Security** tab (`/dashboard/projects/[id]/security`).
2. Review your **Security Health Score** (0–100):
   - **Critical Issues**: Leaked AWS, Stripe, GitHub, or private SSH keys, or plain HTTP URLs in production.
   - **Warnings**: Low-entropy/weak passwords or Google API keys missing IP/domain restrictions.
   - **Info**: Suggestions for credential expiration dates.
3. Follow the remediation recommendations directly beside each detected issue to secure your project.

---

### Workflow 4: Synchronizing Secrets to Vercel, GitHub & Webhooks

1. Open your project and click the **Integrations** tab (`/dashboard/projects/[id]/integrations`).
2. Click **+ Connect Integration**:
   - **Vercel**: Enter your Vercel Project ID / Name and Personal Access Token. Map `prod` $\rightarrow$ `Production` and `dev` $\rightarrow$ `Development`.
   - **GitHub Actions**: Enter your repository (`owner/repo`) and GitHub PAT with `repo` scope. DevVault encrypts your secrets via GitHub's public key using libsodium sealed boxes.
   - **Webhook**: Provide a webhook URL and secret. DevVault delivers an HMAC-signed JSON payload whenever variables update.
3. Click **Sync Now** to push all current variables to the provider with real-time status and logs.

---

### Workflow 5: Running Local Apps with the DevVault CLI

The DevVault CLI eliminates the need to maintain dangerous `.env` files on your local drive:

```bash
# 1. Install / link the CLI globally
npm link

# 2. Generate a Personal Access Token (PAT)
# In DevVault web UI: Go to Tools -> API Keys -> Create Token

# 3. Authenticate the CLI
devvault login --token dv_live_xxxxxxxxxxxxxxxx

# 4. Link your project folder
cd my-node-project
devvault link --project my-project-slug --env dev

# 5. Run your application with injected in-memory secrets
devvault run -- npm run dev
```

> [!TIP]
> `devvault run` injects decrypted variables directly into the child process environment via `process.env`. Nothing is written to `.env`, preventing accidental Git commits!

If you do need a physical `.env` file for Docker or external tooling, download it securely:

```bash
devvault pull --env dev --format env
```

---

### Workflow 6: Team Collaboration & Granular RBAC

1. In your workspace, click **Manage Team** or navigate to `/dashboard/workspaces/[id]/members`.
2. Click **Invite Member**:
   - Enter teammate's email address.
   - Select their role: `Admin`, `Developer`, or `Viewer`.
   - Select **Allowed Environments** (e.g., check `dev`, `staging`, `test` and leave `prod` unchecked to gate production access).
   - Set permission toggles:
     - Check/uncheck **Can Reveal Plaintext Secrets**.
     - Check/uncheck **Can Export / Download .env Files**.
3. Team members can now access only the environments and actions you permitted.

---

### Workflow 7: Importing and Exporting Environment Files

#### Importing

1. Navigate to **Tools $\rightarrow$ Import .env** or click **Import** inside any project.
2. Drag and drop your existing `.env` file or paste its contents.
3. Review the preview table showing parsed keys, values, and detected types.
4. Select the target environment and click **Import All Variables**.

#### Exporting

1. Click **Export** on the project page.
2. Select your desired format:
   - `.env` / `.env.local`
   - `.env.example` (masks all sensitive data with placeholder hints)
   - `JSON`
   - `YAML`
   - `Markdown Table`
3. Click **Download File** or **Copy to Clipboard**.

---

## 💻 DevVault CLI Command Reference

The DevVault CLI is bundled inside `./bin/devvault.mjs` and registered as `devvault`.

| Command          | Arguments / Options                       | Description                                                                                              |
| :--------------- | :---------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| `devvault login` | `--token <pat>`                           | Authenticates CLI with a DevVault Personal Access Token.                                                 |
| `devvault link`  | `--project <slug/id>` `[--env <name>]`    | Links the current working directory to a DevVault project via `.devvault.json`.                          |
| `devvault run`   | `-- <command>`                            | Fetches secrets for the linked project/environment and executes the child command with injected secrets. |
| `devvault pull`  | `[--env <name>]` `[--format <env\|json>]` | Downloads decrypted secrets and writes them to `.env` or JSON locally.                                   |
| `devvault help`  | —                                         | Displays the CLI help manual and options.                                                                |

### Global CLI Options

- `--project <id|slug>`: Explicitly target a project instead of using `.devvault.json`.
- `--env <name>`: Environment to query (`dev`, `staging`, `prod`, `test`). Default: `dev`.
- `--token <token>`: Override the stored authentication token (or set `DEVVAULT_TOKEN`).
- `--url <url>`: DevVault API URL (default: `http://localhost:3000` or `DEVVAULT_API_URL`).

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with design tokens and CSS variables
- **Icons**: [Lucide React](https://lucide.dev/)
- **UI Primitives**: [Radix UI](https://www.radix-ui.com/) (Dialog, Dropdown Menu)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes) (System / Dark / Light)
- **Syntax Highlighting**: [PrismJS](https://prismjs.com/) & [React Syntax Highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter)
- **Notifications**: [React Toastify](https://fkhadra.github.io/react-toastify/)

### Backend & Database

- **Runtime**: Next.js Route Handlers & Server Actions
- **Database**: [MongoDB](https://www.mongodb.com/) (Native driver `mongodb` v7 + [Mongoose](https://mongoosejs.com/) v9 ODM)
- **Authentication**: [Better Auth](https://better-auth.com/) with MongoDB Adapter and session management
- **Cryptography**: [Crypto-JS](https://cryptojs.altervista.org/) (AES-256) + Node.js Native `crypto` (HMAC, SHA-256) + Web Crypto API

### CLI & Tools

- **CLI Engine**: Native Node.js ES Modules executable (`bin/devvault.mjs`)
- **Package Manager**: [pnpm](https://pnpm.io/)
- **Linting & Formatting**: ESLint 9 + Prettier (with `prettier-plugin-tailwindcss`)
- **Language**: TypeScript 5

---

## 📂 Project Architecture

```plaintext
dev-vault/
├── bin/
│   └── devvault.mjs        # DevVault CLI executable (in-memory secret injection)
├── public/                 # Static assets, logos, brand icons
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── api/            # API Route Handlers
│   │   │   ├── api-keys/   # Personal Access Token (PAT) management
│   │   │   ├── auth/       # Better Auth authentication endpoints
│   │   │   ├── cli/        # CLI secret retrieval & validation endpoints
│   │   │   ├── env/        # Environment variable CRUD & expiration
│   │   │   ├── projects/   # Project CRUD, docs, integrations & security audit
│   │   │   ├── snippets/   # Integration code snippets
│   │   │   ├── templates/  # Stack blueprint endpoints
│   │   │   ├── tools/      # Validation & diffing endpoints
│   │   │   └── workspaces/ # Multi-tenant workspaces & member RBAC
│   │   ├── auth/           # Login, registration, error views
│   │   └── dashboard/      # Protected dashboard application
│   │       ├── projects/   # Project management, docs, integrations, security
│   │       ├── snippets/   # Reusable code snippet directory
│   │       ├── templates/  # Architecture template catalog
│   │       ├── tools/      # Security auditor, missing env checker, generators, PATs
│   │       └── workspaces/ # Team workspace switcher & member permissions
│   ├── components/         # Modular React UI components
│   │   ├── auth/           # Auth forms, AutoLockModal, LogoutButton
│   │   ├── common/         # BrandLogo, FilterPanel, SearchBar, ToastProvider
│   │   ├── env/            # EnvVariableTable, EnvVariableForm, ExpiryBadge
│   │   ├── export/         # ExportModal, GenerateExample
│   │   ├── import/         # ImportEnvFile, ImportPreview
│   │   ├── integrations/   # IntegrationsManager (Vercel, GitHub, Webhook)
│   │   ├── projects/       # ProjectCard, ProjectForm, ProjectDocs
│   │   ├── security/       # SecurityHealthCard, ScannerReports
│   │   ├── snippets/       # SnippetCard, SnippetForm, SnippetViewer
│   │   ├── templates/      # TemplateCard, UseTemplateModal
│   │   ├── theme/          # ThemeProvider, ThemeToggle
│   │   ├── tools/          # ApiKeysManager, EnvChecker, Generators
│   │   └── workspaces/     # WorkspaceSwitcher, MembersManagement, Dialogs
│   ├── hooks/              # Custom React hooks (useAutoLock, etc.)
│   ├── lib/                # Database connection, auth client, session helpers
│   ├── models/             # Mongoose schemas (Project, Workspace, EnvVariable, ApiKey, etc.)
│   ├── services/           # Background engines (SyncEngine for Vercel/GitHub/Webhooks)
│   ├── types/              # Centralized TypeScript interfaces & Zod schemas
│   └── utils/              # AES-256 encryption, security scanner, interpolation, parser
├── .env.example            # Environment configuration reference
├── package.json            # Scripts, CLI binary registration & dependencies
├── tsconfig.json           # TypeScript configuration
└── README.md               # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js**: `v20.x` or later
- **pnpm**: `v9.x` or later (`npm install -g pnpm`)
- **MongoDB**: A running local instance (`mongodb://localhost:27017`) or a [MongoDB Atlas](https://www.mongodb.com/atlas) URI.

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-username/dev-vault.git
   cd dev-vault
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   ```

3. **Link the CLI locally (optional, for global `devvault` command)**:
   ```bash
   npm link
   ```

### Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Configure the following variables:

```env
# MongoDB Connection String
MONGODB_URL=mongodb://localhost:27017/dev-vault

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
BETTER_AUTH_URL=http://localhost:3000

# Better Auth Secret (Generate a strong 32+ character key)
BETTER_AUTH_SECRET=your-random-better-auth-secret-key-at-least-32-chars

# Master Encryption Key for Stored Secrets (AES-256)
ENCRYPTION_KEY=your-secure-master-encryption-key-for-aes-256

# Optional: Google OAuth (for Google Sign-In)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

> [!IMPORTANT]
> The `ENCRYPTION_KEY` encrypts and decrypts all secrets stored in your database. Store this key in a secure location. If lost, encrypted values cannot be recovered.

### Running the Application

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Security Architecture

| Security Layer               | Implementation                    | Description                                                                                             |
| :--------------------------- | :-------------------------------- | :------------------------------------------------------------------------------------------------------ |
| **Data at Rest**             | AES-256 (`crypto-js`)             | All environment values are encrypted before persistence; decrypted strictly on authorized request.      |
| **Integrations Security**    | Libsodium / Sealed-Box Encryption | GitHub secret synchronization uses asymmetrical libsodium public-key encryption.                        |
| **CLI Runtime Defense**      | In-Memory Child Process Injection | The CLI feeds secrets directly into process memory; unencrypted `.env` files are never written to disk. |
| **Session Control**          | Better Auth + Secure Cookies      | HttpOnly, SameSite cookies guarded by server proxy route middleware.                                    |
| **Inactivity Defense**       | `useAutoLock` Hook                | Protects unattended workstations by triggering a PIN/password lock modal after idle timeout.            |
| **Input Validation**         | Zod Schemas                       | Strict type parsing and sanitization across all API endpoints and mutations.                            |
| **Cryptographic Randomness** | Web Crypto API                    | `crypto.getRandomValues()` ensures cryptographically secure passwords, JWTs, and API tokens.            |

---

## 📜 Available Scripts

| Command             | Description                                                      |
| :------------------ | :--------------------------------------------------------------- |
| `pnpm dev`          | Starts the Next.js development server on `http://localhost:3000` |
| `pnpm build`        | Compiles and builds the production application                   |
| `pnpm start`        | Runs the compiled production build                               |
| `pnpm lint`         | Validates code using ESLint                                      |
| `pnpm lint:fix`     | Automatically fixes ESLint issues                                |
| `pnpm format`       | Formats all files using Prettier and Tailwind CSS plugin         |
| `pnpm format:check` | Verifies code formatting without writing changes                 |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to your branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.
