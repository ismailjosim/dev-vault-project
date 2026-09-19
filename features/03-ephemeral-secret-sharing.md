# Feature Specification: Ephemeral Secret Sharing ("Burn-After-Reading")

- **Status**: Implemented ✅
- **Priority**: P1 (High)
- **Target Component**: Developer Tools & Security Sharing

---

## 1. Problem Statement

Developers frequently need to share a one-time secret (e.g. temporary staging database password, API test key, SSH key) with a colleague, contractor, or support engineer. Today, developers resort to sending plaintext credentials over **Slack**, **Discord**, or **Email**, where they remain indexed and vulnerable in chat histories indefinitely.

Industry-standard tools like **1Password Send**, **Yopass**, and **Bitwarden Send** solve this via client-side encrypted, ephemeral links that self-destruct after viewing or expiry.

---

## 2. User Stories

1. **As a Developer**, I want to paste a sensitive key and generate a secure link that can only be viewed once before being permanently destroyed.
2. **As an Engineering Lead**, I want to set an expiration window (e.g., 10 minutes, 1 hour, 1 day) and an optional password for the recipient.
3. **As a Recipient**, I want to view and copy the secret without needing to create an account on DevVault.

---

## 3. Cryptographic Architecture (Zero-Knowledge)

To maintain true zero-knowledge privacy:

1. **Client-side Encryption**: The secret is encrypted in the user's browser using a random 256-bit encryption key before transmission.
2. **URL Fragment Hash**: The encryption key is included in the URL fragment (`#<key>`), which is **never sent to the server** by modern browsers.
3. **Server Role**: The server only stores the ciphertext and self-destructs it immediately upon first retrieval or expiration.
4. **Decryption**: The recipient's browser extracts the key from the fragment `#` and decrypts the ciphertext locally.

---

## 4. Data Architecture

### Mongoose Model: `SharedSecret` (`src/models/SharedSecret.ts`)

```typescript
import mongoose, { Schema, Document } from 'mongoose'

export interface ISharedSecret extends Document {
	shareId: string
	encryptedContent: string
	passphraseHash?: string
	maxViews: number
	currentViews: number
	expiresAt: Date
	createdAt: Date
}

const sharedSecretSchema = new Schema<ISharedSecret>(
	{
		shareId: { type: String, required: true, unique: true, index: true },
		encryptedContent: { type: String, required: true },
		passphraseHash: { type: String, default: null },
		maxViews: { type: Number, default: 1 },
		currentViews: { type: Number, default: 0 },
		expiresAt: { type: Date, required: true, index: { expires: 0 } }, // MongoDB TTL index
	},
	{ timestamps: true },
)

export const SharedSecret =
	mongoose.models.SharedSecret ||
	mongoose.model<ISharedSecret>('SharedSecret', sharedSecretSchema)
```

---

## 5. API Endpoints

### 1. `POST /api/tools/share`

Create a new shared secret link.

- **Request**:

```json
{
	"encryptedContent": "U2FsdGVkX1+...",
	"maxViews": 1,
	"ttlSeconds": 3600,
	"passphrase": "optional-user-passphrase"
}
```

- **Response**:

```json
{
	"shareId": "sec_abc123",
	"expiresAt": "2026-09-19T17:30:00Z"
}
```

### 2. `GET /api/tools/share/[shareId]`

Retrieve and burn the secret.

- **Behavior**:
  - Increments `currentViews`. If `currentViews >= maxViews`, the document is immediately deleted from MongoDB.
  - Returns `encryptedContent`.

---

## 6. UI/UX Workflow

1. **Dashboard Tool**: Accessible via `/dashboard/tools/secret-share`.
2. **Creation Screen**:
   - Secret payload textarea with mask/unmask toggle.
   - Expiration dropdown: `View once (immediate burn)`, `1 hour`, `24 hours`, `7 days`.
   - Optional passphrase field.
   - Generates a shareable URL: `https://devvault.app/share/sec_abc123#<client_key>`.
3. **Public View Screen**: Accessible at `/share/[shareId]`.
   - Prompts for passphrase if enabled.
   - Warning: "This secret will be destroyed once revealed."
   - One-click copy with confetti notification and instant deletion notice.
