import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { AutoLockModal } from '@/components/auth/AutoLockModal'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { ToastProvider } from '@/components/common/ToastProvider'
import './globals.css'
import 'react-toastify/dist/ReactToastify.css'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const metadata: Metadata = {
	metadataBase: new URL(appUrl),
	title: {
		default: 'DevVault - Developer Environment Variable & Secrets Manager',
		template: '%s | DevVault',
	},
	description:
		'Securely store, encrypt, compare, and export environment variables, configuration templates, and code snippets across all development environments with AES-256 security.',
	applicationName: 'DevVault',
	keywords: [
		'environment variables',
		'secret manager',
		'env vault',
		'developer tools',
		'AES-256 encryption',
		'dotenv',
		'Next.js',
		'Better Auth',
		'configuration management',
		'credentials manager',
	],
	authors: [{ name: 'DevVault Team' }],
	creator: 'DevVault',
	publisher: 'DevVault',
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
	openGraph: {
		type: 'website',
		locale: 'en_US',
		url: appUrl,
		siteName: 'DevVault',
		title: 'DevVault - Developer Environment Variable & Secrets Manager',
		description:
			'Securely store, encrypt, compare, and export environment variables, configuration templates, and code snippets across all development environments with AES-256 security.',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'DevVault - Developer Environment Variable & Secrets Manager',
		description:
			'Securely store, encrypt, compare, and export environment variables, configuration templates, and code snippets across all development environments with AES-256 security.',
	},
	icons: {
		icon: [
			{ url: '/icon.ico' },
			{ url: '/icon-16x16.png', sizes: '16x16', type: 'image/png' },
			{ url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
		],
		apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
	},
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html
			lang='en'
			suppressHydrationWarning
			className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
		>
			<body className='flex min-h-full flex-col' suppressHydrationWarning>
				<ThemeProvider>
					<ToastProvider>
						{children}
						<AutoLockModal />
					</ToastProvider>
				</ThemeProvider>
			</body>
		</html>
	)
}
