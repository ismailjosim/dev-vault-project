import type { Metadata } from 'next'
import { FilterPanel } from '@/components/common/FilterPanel'
import { BrandLogo } from '@/components/common/BrandLogo'
import { SearchBar } from '@/components/common/SearchBar'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { ProjectList } from '@/components/projects/ProjectList'
import { ProjectSummary } from '@/components/projects/ProjectCard'
import { WorkspaceSwitcher } from '@/components/workspaces/WorkspaceSwitcher'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { getCurrentUser } from '@/lib/session'
import { connectDB } from '@/lib/mongodb'
import { serializeDocument } from '@/lib/api'
import { Project } from '@/models/Project'
import { Workspace } from '@/models/Workspace'
import { WorkspaceMember } from '@/models/WorkspaceMember'
import { projectQuerySchema } from '@/types/project'
import {
	Code2,
	FileCheck2,
	FileDown,
	FileUp,
	Flame,
	KeyRound,
	LayoutTemplate,
	ShieldCheck,
	Tags,
	Terminal,
	Users,
} from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
	title: 'Dashboard',
	description:
		'View, organize, and manage your project vaults, environment secrets, and developer tools in DevVault.',
}

type DashboardPageProps = {
	searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function DashboardPage({
	searchParams,
}: DashboardPageProps) {
	const user = await getCurrentUser()
	if (!user?.id) redirect('/auth/login')

	await connectDB()
	const rawParams = await searchParams
	const selectedWorkspaceId =
		typeof rawParams.workspaceId === 'string' &&
		rawParams.workspaceId !== 'personal'
			? rawParams.workspaceId
			: null

	// Fetch user's workspaces
	const memberships = await WorkspaceMember.find({ userId: user.id })
	const workspaceIds = memberships.map((m) => m.workspaceId)
	const userWorkspaces = await Workspace.find({
		$or: [{ ownerId: user.id }, { _id: { $in: workspaceIds } }],
	}).select('_id name slug')

	const activeWorkspace = selectedWorkspaceId
		? await Workspace.findById(selectedWorkspaceId)
		: null

	const query = projectQuerySchema.parse({
		search: rawParams.search,
		category: rawParams.category,
		framework: rawParams.framework,
		tag: rawParams.tag,
		workspaceId: rawParams.workspaceId,
		page: rawParams.page,
		limit: rawParams.limit,
	})

	const filter: Record<string, unknown> = {}
	if (selectedWorkspaceId) {
		filter.workspaceId = selectedWorkspaceId
	} else {
		// Personal projects: owned by user and not assigned to a workspace
		filter.userId = user.id
		filter.$or = [{ workspaceId: null }, { workspaceId: { $exists: false } }]
	}

	if (query.search) {
		const searchCondition = [
			{ projectName: { $regex: query.search, $options: 'i' } },
			{ description: { $regex: query.search, $options: 'i' } },
		]
		if (filter.$or) {
			filter.$and = [{ $or: filter.$or }, { $or: searchCondition }]
			delete filter.$or
		} else {
			filter.$or = searchCondition
		}
	}

	if (query.category) filter.category = query.category
	if (query.framework) filter.framework = query.framework
	if (query.tag) filter.tags = query.tag

	const projects = await Project.find(filter)
		.sort({ isPinned: -1, createdAt: -1 })
		.limit(query.limit)

	return (
		<main className='bg-background min-h-screen px-6 py-8'>
			<div className='mx-auto max-w-6xl'>
				<div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
					<div className='flex items-center gap-3'>
						<BrandLogo href='/dashboard' size='sm' />
						<WorkspaceSwitcher
							initialWorkspaces={serializeDocument(userWorkspaces)}
						/>
					</div>
					<div className='flex items-center gap-3'>
						{activeWorkspace && (
							<Link
								href={`/dashboard/workspaces/${activeWorkspace._id}/members`}
								className='border-border bg-card text-foreground hover:bg-muted flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium'
							>
								<Users className='text-primary h-3.5 w-3.5' />
								Manage Team
							</Link>
						)}
						<ThemeToggle />
						<LogoutButton />
						<Link
							href={
								selectedWorkspaceId
									? `/dashboard/projects/create?workspaceId=${selectedWorkspaceId}`
									: '/dashboard/projects/create'
							}
							className='bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-semibold hover:opacity-90'
						>
							New project
						</Link>
					</div>
				</div>

				<div className='mt-6'>
					<h1 className='text-foreground text-2xl font-semibold'>
						{activeWorkspace
							? `${activeWorkspace.name} Projects`
							: 'Personal Projects'}
					</h1>
					<p className='text-muted-foreground mt-1 text-sm'>
						{activeWorkspace
							? `Collaborative workspace vault (${activeWorkspace.slug})`
							: 'Your personal credentials and environment configurations.'}
					</p>
				</div>

				<div className='mt-6 grid gap-3 lg:grid-cols-[1fr_360px]'>
					<SearchBar />
					<FilterPanel />
				</div>

				<div className='mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
					<ToolLink
						href='/dashboard/tools/api-keys'
						icon={<Terminal className='h-4 w-4 text-emerald-500' />}
						title='Developer CLI'
						description='CLI injection & API tokens.'
					/>
					<ToolLink
						href='/dashboard/tools/secret-share'
						icon={<Flame className='h-4 w-4 text-amber-500' />}
						title='Secret share'
						description='Burn-after-reading ephemeral links.'
					/>
					<ToolLink
						href='/dashboard/tools/password-generator'
						icon={<KeyRound className='h-4 w-4' />}
						title='Password generator'
						description='Create strong project passwords.'
					/>
					<ToolLink
						href='/dashboard/tools/jwt-generator'
						icon={<ShieldCheck className='h-4 w-4' />}
						title='JWT generator'
						description='Generate access and refresh secrets.'
					/>
					<ToolLink
						href='/dashboard/templates'
						icon={<LayoutTemplate className='h-4 w-4' />}
						title='Templates'
						description='Apply common .env presets.'
					/>
					<ToolLink
						href='/dashboard/snippets'
						icon={<Code2 className='h-4 w-4' />}
						title='Snippets'
						description='Save reusable setup code.'
					/>
					<ToolLink
						href='/dashboard/tools/import'
						icon={<FileUp className='h-4 w-4' />}
						title='Import .env'
						description='Preview and save env files.'
					/>
					<ToolLink
						href='/dashboard/tools/export'
						icon={<FileDown className='h-4 w-4' />}
						title='Export .env'
						description='Download files in many formats.'
					/>
					<ToolLink
						href='/dashboard/tools/env-checker'
						icon={<FileCheck2 className='h-4 w-4' />}
						title='Env checker'
						description='Compare saved keys to examples.'
					/>
					<ToolLink
						href='/dashboard/tags'
						icon={<Tags className='h-4 w-4' />}
						title='Tags'
						description='Browse project tag usage.'
					/>
				</div>

				<div className='mt-6'>
					<ProjectList
						projects={serializeDocument<ProjectSummary[]>(projects)}
					/>
				</div>
			</div>
		</main>
	)
}

function ToolLink({
	href,
	icon,
	title,
	description,
}: {
	href: string
	icon: ReactNode
	title: string
	description: string
}) {
	return (
		<Link
			href={href}
			className='border-border bg-card text-card-foreground hover:border-muted-foreground rounded-lg border p-4 transition'
		>
			<div className='flex items-center gap-2 text-sm font-semibold'>
				{icon}
				{title}
			</div>
			<p className='text-muted-foreground mt-1 text-sm'>{description}</p>
		</Link>
	)
}
