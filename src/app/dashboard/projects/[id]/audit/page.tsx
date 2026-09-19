import type { Metadata } from 'next'
import { AuditLogTable } from '@/components/audit/AuditLogTable'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { serializeDocument } from '@/lib/api'
import { connectDB } from '@/lib/mongodb'
import { getCurrentUser } from '@/lib/session'
import { Project } from '@/models/Project'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

type ProjectAuditPageProps = {
	params: Promise<{ id: string }>
}

export async function generateMetadata({
	params,
}: ProjectAuditPageProps): Promise<Metadata> {
	const user = await getCurrentUser()
	if (!user?.id) return { title: 'Audit Trail' }

	await connectDB()
	const { id } = await params
	const project = await Project.findOne({ _id: id, userId: user.id }).select(
		'projectName',
	)
	if (!project) return { title: 'Project Not Found' }

	return {
		title: `${project.projectName} Audit Trail`,
		description: `Immutable audit activity log, access history, and compliance trail for ${project.projectName}.`,
	}
}

export default async function ProjectAuditPage({
	params,
}: ProjectAuditPageProps) {
	const user = await getCurrentUser()
	if (!user?.id) redirect('/auth/login')

	await connectDB()
	const { id } = await params
	const project = await Project.findOne({ _id: id, userId: user.id })

	if (!project) notFound()

	const projectPayload = serializeDocument<{
		_id: string
		projectName: string
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

				<div className='mt-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center'>
					<div>
						<h1 className='text-foreground text-2xl font-semibold'>
							{projectPayload.projectName} audit trail
						</h1>
						<p className='text-muted-foreground mt-1 text-sm'>
							Tamper-evident activity trail for secret reveals, copies, updates,
							and exports.
						</p>
					</div>
				</div>

				<div className='mt-6'>
					<AuditLogTable projectId={projectPayload._id} />
				</div>
			</div>
		</main>
	)
}
