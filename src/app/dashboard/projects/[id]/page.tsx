import type { Metadata } from 'next'
import { EnvVariableForm } from '@/components/env/EnvVariableForm'
import { EnvVariableSummary } from '@/components/env/EnvVariableItem'
import { EnvVariableTable } from '@/components/env/EnvVariableTable'
import { EnvironmentTabs } from '@/components/env/EnvironmentTabs'
import { ExportMenu } from '@/components/env/ExportMenu'
import { DeleteProjectDialog } from '@/components/projects/DeleteProjectDialog'
import { PinProjectButton } from '@/components/projects/PinProjectButton'
import { ProjectSummary } from '@/components/projects/ProjectCard'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { serializeDocument } from '@/lib/api'
import { connectDB } from '@/lib/mongodb'
import { getCurrentUser } from '@/lib/session'
import { EnvVariable } from '@/models/EnvVariable'
import { Project } from '@/models/Project'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

type ProjectDetailPageProps = {
	params: Promise<{ id: string }>
	searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({
	params,
}: ProjectDetailPageProps): Promise<Metadata> {
	const user = await getCurrentUser()
	if (!user?.id) return { title: 'Project Details' }

	await connectDB()
	const { id } = await params
	const project = await Project.findOne({ _id: id, userId: user.id }).select(
		'projectName description category framework',
	)
	if (!project) return { title: 'Project Not Found' }

	return {
		title: project.projectName,
		description:
			project.description ||
			`Manage encrypted environment variables and secrets for ${project.projectName} (${project.framework} / ${project.category}).`,
	}
}

export default async function ProjectDetailPage({
	params,
	searchParams,
}: ProjectDetailPageProps) {
	const user = await getCurrentUser()
	if (!user?.id) redirect('/auth/login')

	await connectDB()
	const { id } = await params
	const rawParams = await searchParams
	const currentEnvironment =
		typeof rawParams.environment === 'string' ? rawParams.environment : 'all'
	const project = await Project.findOne({ _id: id, userId: user.id })

	if (!project) notFound()

	const envFilter: Record<string, unknown> = { projectId: project._id }
	if (currentEnvironment !== 'all') envFilter.environment = currentEnvironment

	const variables = await EnvVariable.find(envFilter).sort({
		environment: 1,
		key: 1,
	})
	const safeVariables = variables.map((variable) => {
		const payload = serializeDocument<EnvVariableSummary>(variable)
		payload.value = null
		return payload
	})
	const projectPayload = serializeDocument<ProjectSummary>(project)

	return (
		<main className='bg-background min-h-screen px-6 py-8'>
			<div className='mx-auto max-w-6xl'>
				<div className='flex items-center justify-between'>
					<Link href='/dashboard' className='text-muted-foreground text-sm'>
						Back to dashboard
					</Link>
					<ThemeToggle />
				</div>

				<div className='mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-start'>
					<div>
						<h1 className='text-foreground text-2xl font-semibold'>
							{projectPayload.projectName}
						</h1>
						<p className='text-muted-foreground mt-1 max-w-2xl text-sm'>
							{projectPayload.description || 'No description yet'}
						</p>
						<div className='mt-3 flex flex-wrap gap-2'>
							<span className='bg-secondary text-secondary-foreground rounded px-2 py-1 text-xs'>
								{projectPayload.category}
							</span>
							<span className='rounded bg-emerald-100 px-2 py-1 text-xs text-emerald-800'>
								{projectPayload.framework}
							</span>
						</div>
					</div>
					<div className='flex flex-wrap gap-2'>
						<PinProjectButton
							projectId={projectPayload._id}
							isPinned={projectPayload.isPinned}
						/>
						<Link
							href={`/dashboard/projects/${projectPayload._id}/docs`}
							className='border-border text-foreground hover:bg-hover rounded-md border px-3 py-2 text-sm font-medium transition'
						>
							Docs
						</Link>
						<DeleteProjectDialog projectId={projectPayload._id} />
					</div>
				</div>

				<div className='mt-6'>
					<EnvironmentTabs
						projectId={projectPayload._id}
						currentEnvironment={currentEnvironment}
						environments={projectPayload.environments || ['dev', 'prod']}
					/>
				</div>

				<div className='mt-6'>
					<div className='flex flex-col justify-between gap-3 sm:flex-row sm:items-center'>
						<ExportMenu projectId={projectPayload._id} />
						<EnvVariableForm projectId={projectPayload._id} />
					</div>
				</div>

				<div className='mt-6'>
					<EnvVariableTable
						projectId={projectPayload._id}
						variables={safeVariables}
					/>
				</div>
			</div>
		</main>
	)
}
