import type { Metadata } from 'next'
import { ProjectForm } from '@/components/projects/ProjectForm'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { getCurrentUser } from '@/lib/session'
import { connectDB } from '@/lib/mongodb'
import { serializeDocument } from '@/lib/api'
import { Workspace } from '@/models/Workspace'
import { WorkspaceMember } from '@/models/WorkspaceMember'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
	title: 'Create Project',
	description:
		'Create a new project in DevVault to organize and encrypt environment variables across environments.',
}

type CreateProjectPageProps = {
	searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function CreateProjectPage({
	searchParams,
}: CreateProjectPageProps) {
	const user = await getCurrentUser()
	if (!user?.id) redirect('/auth/login')

	await connectDB()
	const rawParams = searchParams ? await searchParams : {}
	const selectedWorkspaceId =
		typeof rawParams.workspaceId === 'string' &&
		rawParams.workspaceId !== 'personal'
			? rawParams.workspaceId
			: undefined

	// Fetch all workspaces the user can create projects in
	const memberships = await WorkspaceMember.find({ userId: user.id })
	const workspaceIds = memberships.map((m) => m.workspaceId)
	const workspaces = await Workspace.find({
		$or: [{ ownerId: user.id }, { _id: { $in: workspaceIds } }],
	})
		.select('_id name')
		.sort({ name: 1 })

	return (
		<main className='bg-background min-h-screen px-6 py-8'>
			<div className='mx-auto max-w-6xl'>
				<div className='flex items-center justify-between'>
					<Link
						href={
							selectedWorkspaceId
								? `/dashboard?workspaceId=${selectedWorkspaceId}`
								: '/dashboard'
						}
						className='text-muted-foreground text-sm hover:underline'
					>
						Back to dashboard
					</Link>
					<ThemeToggle />
				</div>
				<h1 className='text-foreground mt-4 text-2xl font-semibold'>
					Create project
				</h1>
				<div className='border-border bg-card mt-6 rounded-lg border p-6'>
					<ProjectForm
						defaultWorkspaceId={selectedWorkspaceId}
						workspaces={serializeDocument(workspaces)}
					/>
				</div>
			</div>
		</main>
	)
}
