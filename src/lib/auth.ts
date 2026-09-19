import { betterAuth } from 'better-auth'
import { mongodbAdapter } from 'better-auth/adapters/mongodb'
import { MongoClient } from 'mongodb'

const mongoUrl =
	process.env.MONGODB_URL || 'mongodb://localhost:27017/dev-vault'
const mongoClient = new MongoClient(mongoUrl)
const authBaseUrl =
	process.env.BETTER_AUTH_URL ||
	process.env.NEXT_PUBLIC_APP_URL ||
	'http://localhost:3000'
const authSecret =
	process.env.BETTER_AUTH_SECRET ||
	'dev-vault-local-secret-for-builds-only-000000'

export const auth = betterAuth({
	database: mongodbAdapter(mongoClient.db(), {
		client: mongoClient,
		transaction: false,
	}),
	secret: authSecret,
	baseURL: authBaseUrl,
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false,
		minPasswordLength: 8,
	},
	socialProviders: {
		google: {
			enabled:
				!!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
			clientId: process.env.GOOGLE_CLIENT_ID || '',
			clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
		},
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // Update every 24 hours
		cookieCache: {
			enabled: false,
		},
	},
	appName: 'DevVault',
	trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'],
})
