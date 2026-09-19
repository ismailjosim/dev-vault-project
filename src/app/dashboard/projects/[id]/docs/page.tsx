import type { Metadata } from 'next'
import {
	ProjectDocs,
	ProjectDocumentation,
} from '@/components/projects/ProjectDocs'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { serializeDocument } from '@/lib/api'
import { connectDB } from '@/lib/mongodb'
import { getCurrentUser } from '@/lib/session'
import { Project } from '@/models/Project'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

type ProjectDocsPageProps = {
	params: Promise<{ id: string }>
}

export async function generateMetadata({
	params,
}: ProjectDocsPageProps): Promise<Metadata> {
	const user = await getCurrentUser()
	if (!user?.id) return { title: 'Documentation' }

	await connectDB()
	const { id } = await params
	const project = await Project.findOne({ _id: id, userId: user.id }).select(
		'projectName',
	)
	if (!project) return { title: 'Project Not Found' }

	return {
		title: `${project.projectName} Documentation`,
		description: `Deployment endpoints, repositories, credentials, and documentation for ${project.projectName}.`,
	}
}

export default async function ProjectDocsPage({
	params,
}: ProjectDocsPageProps) {
	const user = await getCurrentUser()
	if (!user?.id) redirect('/auth/login')

	await connectDB()
	const { id } = await params
	const project = await Project.findOne({ _id: id, userId: user.id })

	if (!project) notFound()

	const projectPayload = serializeDocument<{
		_id: string
		projectName: string
		documentation?: ProjectDocumentation
	}>(project)

	return (
		<main className='bg-background min-h-screen px-6 py-8'>
			<div className='mx-auto max-w-6xl'>
				<div className='flex items-center justify-between'>
					<Link
						href={`/dashboard/projects/${projectPayload._id}`}
						className='text-muted-foreground text-sm'
					>
						Back to project
					</Link>
					<ThemeToggle />
				</div>

				<h1 className='text-foreground mt-4 text-2xl font-semibold'>
					{projectPayload.projectName} documentation
				</h1>
				<p className='text-muted-foreground mt-1 text-sm'>
					Store repo links, deployment metadata, test users, and project notes.
				</p>

				<div className='mt-6'>
					<ProjectDocs
						projectId={projectPayload._id}
						documentation={projectPayload.documentation || {}}
					/>
				</div>
			</div>
		</main>
	)
}
