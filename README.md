<div align="center">

# 🔐 DevVault

**The Developer's Secure Environment Variable & Project Secrets Command Center**

A production-ready platform to securely store, encrypt, compare, and export environment variables, project metadata, configuration templates, and code snippets across all your environments.

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
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the App](#running-the-app)
- [Application Walkthrough](#-application-walkthrough)
  - [Environment Variable Management](#1-environment-variable-management)
  - [Project Documentation Hub](#2-project-documentation-hub)
  - [Developer Utilities](#3-developer-utilities)
  - [Built-In Templates](#4-built-in-templates)
  - [Code Snippets Library](#5-code-snippets-library)
- [Security Architecture](#-security-architecture)
- [Available Scripts](#-available-scripts)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

Managing `.env` files across multiple projects, branches, and environments (`dev`, `staging`, `prod`, `test`) is fraught with risk: misplaced API keys, outdated `.env.example` templates, unencrypted credentials stored in plain text, and repetitive manual setup.

**DevVault** solves this by centralizing your development secrets into an encrypted vault with granular per-environment access, instant schema diffing against example files, multi-format export/import, built-in architecture templates, and a developer toolkit.

---

## ✨ Key Features

- 🔒 **Zero-Exposure AES-256 Encryption**: Every secret value is automatically encrypted at rest using AES-256 before being committed to the database. Values are never exposed in bulk payloads.
- 🌐 **Multi-Environment Support**: Organize variables cleanly by environment (`dev`, `staging`, `prod`, `test`) with instant tabbed switching and filtering.
- 📋 **Multi-Format Env Exporter**: Export variables to `.env`, `.env.local`, `.env.production`, `.env.development`, `.env.test`, `.env.example`, JSON, YAML, and Markdown tables.
- 📥 **Smart .env Import & Parser**: Drag-and-drop or paste `.env` files. Includes auto-formatting, syntax validation, duplicate collision detection, and variable type inference.
- 🔍 **Missing Env Checker**: Compare your active project secrets against `.env.example` templates to identify missing, extra, and available keys before deployment.
- 🎲 **Cryptographic Generators**:
  - **Password Generator**: Highly customizable (length, uppercase, lowercase, numbers, symbols, and exclusion of ambiguous characters like `0`/`O` and `1`/`l`).
  - **JWT / Secret Generator**: Cryptographically strong random secrets (64+ chars) for token signing and API access keys.
- 📦 **Pre-Built Stack Templates**: Rapidly seed projects with ready-to-fill templates for Next.js + Better Auth, MERN Stack, Stripe, Cloudinary, Firebase, AWS S3, GitHub OAuth, and Supabase.
- 💻 **Reusable Code Snippets**: Browse and save copy-paste-ready integration snippets (Mongoose connection, Cloudinary v2, Axios interceptors, Stripe webhooks, etc.) linked directly to their required environment variables.
- 📑 **Project Documentation Vault**: Consolidate repos (client/server), deployment links (Vercel, Heroku, live), test credentials, database names, team members, and markdown notes in one place.
- ⏳ **Credential Expiry Tracking**: Set expiration dates on tokens and certificates with automated countdowns and status indicators (`Active`, `Expiring Soon`, `Expired`).
- 🛡️ **Session Auto-Lock**: Built-in inactivity monitoring locks your session after idle periods to prevent unauthorized physical access.
- 🌓 **Adaptive Light & Dark Themes**: High-contrast, tailored palette utilizing Tailwind CSS v4 design tokens and `next-themes`.

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with CSS variables and custom design tokens
- **Icons**: [Lucide React](https://lucide.dev/)
- **UI Primitives**: [Radix UI](https://www.radix-ui.com/) (Dialog, Dropdown Menu)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes)
- **Syntax Highlighting**: [PrismJS](https://prismjs.com/) & [React Syntax Highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter)
- **Notifications**: [React Toastify](https://fkhadra.github.io/react-toastify/)

### Backend & Database

- **Runtime**: Next.js Server Components & Route Handlers (`src/app/api/*`)
- **Database**: [MongoDB](https://www.mongodb.com/) (Native driver `mongodb` v7 + [Mongoose](https://mongoosejs.com/) v9 ODM)
- **Authentication**: [Better Auth](https://better-auth.com/) with MongoDB Adapter, email/password credentials, and Google OAuth support
- **Cryptography**: [Crypto-JS](https://cryptojs.altervista.org/) (AES-256, SHA-256) and browser Web Crypto API (`crypto.getRandomValues`)

### Tooling & Package Management

- **Package Manager**: [pnpm](https://pnpm.io/)
- **Formatting & Linting**: ESLint 9 + Prettier (with `prettier-plugin-tailwindcss`)
- **Language**: TypeScript 5

---

## 📂 Project Architecture

```plaintext
dev-vault/
├── public/                 # Static assets, logos, and favicons
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── api/            # Route Handlers
│   │   │   ├── auth/       # Better Auth backend handler (*route.ts)
│   │   │   ├── env/        # Environment variable CRUD & expiry endpoints
│   │   │   ├── projects/   # Project management endpoints
│   │   │   ├── snippets/   # Custom snippet management
│   │   │   ├── tags/       # Tag aggregation endpoints
│   │   │   ├── templates/  # Preset template endpoints
│   │   │   └── tools/      # Validation & env comparison endpoints
│   │   ├── auth/           # Authentication pages (login, signup, error)
│   │   ├── dashboard/      # Protected dashboard routes
│   │   │   ├── projects/   # Project overview, creation, and detail [id]
│   │   │   │   └── [id]/docs/ # Project documentation hub
│   │   │   ├── snippets/   # Code snippet directory
│   │   │   ├── tags/       # Tag navigation and usage
│   │   │   ├── templates/  # Architecture template catalog
│   │   │   └── tools/      # Developer utilities:
│   │   │       ├── env-checker/        # Missing env comparison tool
│   │   │       ├── export/             # Multi-format exporter
│   │   │       ├── import/             # .env file importer & parser
│   │   │       ├── jwt-generator/      # JWT & secret key generator
│   │   │       └── password-generator/ # Strong password generator
│   │   ├── globals.css     # Tailwind v4 theme configuration & color tokens
│   │   ├── layout.tsx      # Root layout with ThemeProvider, Toast, & AutoLock
│   │   └── page.tsx        # Entrypoint (redirects to /dashboard)
│   ├── components/         # Reusable React UI components
│   │   ├── auth/           # AutoLockModal, LogoutButton, LoginForm, SignupForm
│   │   ├── common/         # BrandLogo, FilterPanel, SearchBar, TagCloud, ToastProvider
│   │   ├── env/            # EnvVariableForm, EnvVariableTable, EnvironmentTabs, ExpiryBadge
│   │   ├── export/         # ExportModal, GenerateExample
│   │   ├── import/         # ImportEnvFile, ImportPreview
│   │   ├── projects/       # ProjectCard, ProjectForm, ProjectList, ProjectDocs
│   │   ├── snippets/       # SnippetCard, SnippetForm, SnippetList, SnippetViewer
│   │   ├── templates/      # TemplateCard, TemplateList, UseTemplateModal
│   │   ├── theme/          # ThemeProvider, ThemeToggle
│   │   └── tools/          # EnvChecker, JWTGenerator, PasswordGenerator
│   ├── hooks/              # Custom React hooks (useAutoLock, etc.)
│   ├── lib/                # Core libraries (Better Auth, MongoDB client, session utils)
│   ├── models/             # Mongoose schemas (Project, EnvVariable, Snippet, Template, UserSettings)
│   ├── proxy.ts            # Route protection proxy / middleware logic
│   ├── types/              # TypeScript types & Zod schemas
│   └── utils/              # Encryption, generators, env-parser, exporters, templates, snippets
├── .env.example            # Environment configuration reference
├── package.json            # Dependencies and scripts
├── pnpm-lock.yaml          # Pnpm lockfile
├── tsconfig.json           # TypeScript configuration
└── README.md               # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed on your machine:

- **Node.js**: `v20.x` or later
- **pnpm**: `v9.x` or later (`npm install -g pnpm` or `pnpm self-update`)
- **MongoDB**: A running local MongoDB instance or a [MongoDB Atlas](https://www.mongodb.com/atlas) connection URI.

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/dev-vault.git
   cd dev-vault
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

### Environment Variables

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

# Better Auth Secret (Generate a strong random string)
BETTER_AUTH_SECRET=your-random-better-auth-secret-key-at-least-32-chars

# Master Encryption Key for Stored Credentials (AES-256)
ENCRYPTION_KEY=your-secure-master-encryption-key-for-aes-256

# Optional: Google OAuth (for social sign-in)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

> [!IMPORTANT]
> The `ENCRYPTION_KEY` is used to encrypt and decrypt all secrets stored in your database. Keep it safe! If lost, encrypted values cannot be recovered.

### Running the App

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. DevVault will guide you to create an account or sign in to your dashboard.

---

## 🖥️ Application Walkthrough

### 1. Environment Variable Management

- **Add / Edit Secrets**: Specify variable key, secret value, environment (`dev`, `prod`, `staging`, `test`), type (`secret`, `jwt`, `api_key`, `url`, `database_url`), optional notes, and expiration dates.
- **Masking & Security**: Values are masked by default (`••••••••`). Click to reveal with auto-clipboard clearing support.
- **Expiration Alerts**: Set certificate/token expiration dates; DevVault highlights impending expirations.

### 2. Project Documentation Hub

- Each project features a dedicated **Docs** area (`/dashboard/projects/[id]/docs`).
- Track:
  - **Repositories**: Client & server GitHub/GitLab links.
  - **Deployments**: Live production URL, Vercel preview, Heroku dashboard.
  - **Database & Auth**: Database name, admin email, test credentials.
  - **Team & Notes**: Team member assignments, markdown documentation, and status flags.

### 3. Developer Utilities

- **Missing Env Checker**: Select a project and upload or paste your `.env.example` to review missing, matched, and extra variables.
- **Import Tool**: Import multi-line `.env` files with collision detection and environment assignment.
- **Export Tool**: Download or copy project variables in formats including `.env`, `.env.local`, `.env.production`, JSON, YAML, or Markdown tables.
- **Password & JWT Generators**: Generate high-entropy, cryptographically safe passwords and JWT secrets directly in the dashboard.

### 4. Built-In Templates

Start projects instantly with pre-populated environment blueprints:

- **Next.js + MongoDB + Better Auth**
- **MERN Stack** (Express, Mongo, JWT, Client URL)
- **Stripe Integration** (Secret key, webhook secret, publishable key)
- **Cloudinary** (Cloud name, API key, API secret)
- **Firebase** (Web config credentials)
- **AWS Integration** (Access keys, S3 bucket, region)
- **Supabase & GitHub OAuth**

### 5. Code Snippets Library

- Store, search, and star reusable code snippets with syntax highlighting.
- Built-in snippets include:
  - Better Auth Next.js server setup
  - MongoDB Mongoose client singleton
  - Cloudinary Node.js configuration
  - Stripe webhook handler
  - Axios client with bearer token interceptors
  - AWS S3 upload helper
  - JWT verification middleware

---

## 🔒 Security Architecture

| Layer                  | Implementation               | Description                                                                                |
| ---------------------- | ---------------------------- | ------------------------------------------------------------------------------------------ |
| **Data at Rest**       | AES-256 (`crypto-js`)        | Values encrypted before persistence; decrypted only when requested by authenticated owner. |
| **Session Control**    | Better Auth + Secure Cookies | HttpOnly, SameSite cookies with route proxy protection (`src/proxy.ts`).                   |
| **Inactivity Defense** | `useAutoLock` Hook           | Triggers an auto-lock modal on idle state to safeguard unattended browser tabs.            |
| **Input Sanitization** | Zod Schemas                  | Strict type parsing and validation on all API endpoints and mutations.                     |
| **Token Generation**   | Web Crypto API               | `crypto.getRandomValues()` ensures uniform, unguessable secrets and passwords.             |

---

## 📜 Available Scripts

| Script         | Command             | Description                                                      |
| -------------- | ------------------- | ---------------------------------------------------------------- |
| `dev`          | `pnpm dev`          | Starts the Next.js development server on `http://localhost:3000` |
| `build`        | `pnpm build`        | Builds the optimized production application                      |
| `start`        | `pnpm start`        | Runs the compiled production build                               |
| `lint`         | `pnpm lint`         | Checks code with ESLint                                          |
| `lint:fix`     | `pnpm lint:fix`     | Automatically fixes ESLint warnings and errors                   |
| `format`       | `pnpm format`       | Formats all files using Prettier and Tailwind plugin             |
| `format:check` | `pnpm format:check` | Validates formatting without writing changes                     |

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve DevVault:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.
