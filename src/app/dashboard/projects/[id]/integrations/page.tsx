import type { Metadata } from 'next'
import { IntegrationsManager } from '@/components/integrations/IntegrationsManager'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { serializeDocument } from '@/lib/api'
import { connectDB } from '@/lib/mongodb'
import { getCurrentUser } from '@/lib/session'
import { Integration } from '@/models/Integration'
import { Project } from '@/models/Project'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

interface ProjectIntegrationsPageProps {
	params: Promise<{ id: string }>
}

export async function generateMetadata({
	params,
}: ProjectIntegrationsPageProps): Promise<Metadata> {
	const { id } = await params
	await connectDB()
	const project = await Project.findById(id).select('projectName')
	return {
		title: project
			? `${project.projectName} - CI/CD Integrations`
			: 'Project Integrations',
		description:
			'Automate environment synchronization to Vercel, GitHub Actions, and Webhooks.',
	}
}

export default async function ProjectIntegrationsPage({
	params,
}: ProjectIntegrationsPageProps) {
	const user = await getCurrentUser()
	if (!user?.id) redirect('/auth/login')

	const { id } = await params
	await connectDB()

	const project = await Project.findOne({ _id: id, userId: user.id })
	if (!project) notFound()

	const integrations = await Integration.find({ projectId: project._id })
		.select('-encryptedAuthToken')
		.sort({ createdAt: -1 })

	return (
		<main className='bg-background min-h-screen px-6 py-8'>
			<div className='mx-auto max-w-5xl'>
				<div className='flex items-center justify-between'>
					<Link
						href={`/dashboard/projects/${project._id}`}
						className='text-muted-foreground hover:text-foreground text-sm'
					>
						← Back to {project.projectName}
					</Link>
					<ThemeToggle />
				</div>

				<div className='mt-4 mb-8'>
					<div className='flex items-center gap-2'>
						<span className='bg-primary/10 text-primary rounded px-2 py-0.5 text-xs font-semibold'>
							Platform Sync
						</span>
						<h1 className='text-foreground text-2xl font-bold'>
							{project.projectName} Integrations
						</h1>
					</div>
					<p className='text-muted-foreground mt-1 text-sm'>
						Keep external deployment environments and cloud targets
						automatically updated whenever you save secrets in DevVault.
					</p>
				</div>

				<IntegrationsManager
					projectId={project._id.toString()}
					initialIntegrations={serializeDocument(integrations)}
				/>
			</div>
		</main>
	)
}
