import type { Metadata } from 'next'
import { MembersManagement } from '@/components/workspaces/MembersManagement'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { serializeDocument } from '@/lib/api'
import { connectDB } from '@/lib/mongodb'
import { getCurrentUser } from '@/lib/session'
import { Workspace } from '@/models/Workspace'
import { WorkspaceMember } from '@/models/WorkspaceMember'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

interface WorkspaceMembersPageProps {
	params: Promise<{ id: string }>
}

export async function generateMetadata({
	params,
}: WorkspaceMembersPageProps): Promise<Metadata> {
	const { id } = await params
	await connectDB()
	const workspace = await Workspace.findById(id).select('name')
	return {
		title: workspace ? `${workspace.name} - Team Members` : 'Workspace Members',
		description:
			'Manage workspace collaborators, roles, and environment permissions.',
	}
}

export default async function WorkspaceMembersPage({
	params,
}: WorkspaceMembersPageProps) {
	const user = await getCurrentUser()
	if (!user?.id) redirect('/auth/login')

	const { id } = await params
	await connectDB()

	const workspace = await Workspace.findById(id)
	if (!workspace) notFound()

	const isOwner = workspace.ownerId === user.id
	const currentMember = await WorkspaceMember.findOne({
		workspaceId: id,
		userId: user.id,
	})

	if (!isOwner && !currentMember) notFound()

	const members = await WorkspaceMember.find({ workspaceId: id }).sort({
		createdAt: 1,
	})

	const userRole = isOwner ? 'owner' : currentMember?.role || 'viewer'

	return (
		<main className='bg-background min-h-screen px-6 py-8'>
			<div className='mx-auto max-w-5xl'>
				<div className='flex items-center justify-between'>
					<Link
						href={`/dashboard?workspaceId=${workspace._id}`}
						className='text-muted-foreground hover:text-foreground text-sm'
					>
						← Back to Workspace Projects
					</Link>
					<ThemeToggle />
				</div>

				<div className='mt-4 mb-8'>
					<div className='flex items-center gap-2'>
						<span className='rounded bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold text-indigo-500'>
							Workspace
						</span>
						<h1 className='text-foreground text-2xl font-bold'>
							{workspace.name}
						</h1>
					</div>
					<p className='text-muted-foreground mt-1 text-sm'>
						{workspace.description || 'DevVault Team Workspace'} (Slug:{' '}
						<code className='font-mono text-xs'>{workspace.slug}</code>)
					</p>
				</div>

				<MembersManagement
					workspaceId={workspace._id.toString()}
					initialMembers={serializeDocument(members)}
					currentUserRole={userRole}
				/>
			</div>
		</main>
	)
}
