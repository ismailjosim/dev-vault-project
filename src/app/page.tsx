import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
	title: 'Home',
	description:
		'DevVault centralizes, encrypts, and manages developer environment variables, project secrets, and configuration templates.',
}

export default function HomePage() {
	redirect('/dashboard')
}
