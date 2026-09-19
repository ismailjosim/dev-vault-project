import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
	title: 'Projects',
	description: 'Manage project environment variables and secrets in DevVault.',
}

export default function ProjectsPage() {
	redirect('/dashboard')
}
