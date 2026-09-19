import type { Metadata } from 'next'
import { UseTemplateModal } from '@/components/templates/UseTemplateModal'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { serializeDocument } from '@/lib/api'
import { connectDB } from '@/lib/mongodb'
import { getCurrentUser } from '@/lib/session'
import { Project } from '@/models/Project'
import { ProjectSummary } from '@/components/projects/ProjectCard'
import { getBuiltInTemplate } from '@/utils/templates'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

type TemplatePageProps = {
	params: Promise<{ id: string }>
}

export async function generateMetadata({
	params,
}: TemplatePageProps): Promise<Metadata> {
	const { id } = await params
	const template = getBuiltInTemplate(id)
	if (!template) return { title: 'Template Not Found' }

	return {
		title: `${template.name} Template`,
		description: template.description,
	}
}

export default async function TemplatePage({ params }: TemplatePageProps) {
	const user = await getCurrentUser()
	if (!user?.id) redirect('/auth/login')

	const { id } = await params
	const template = getBuiltInTemplate(id)
	if (!template) notFound()

	await connectDB()
	const projects = await Project.find({ userId: user.id }).sort({
		isPinned: -1,
		createdAt: -1,
	})

	return (
		<main className='bg-background min-h-screen px-6 py-8'>
			<div className='mx-auto max-w-6xl'>
				<div className='flex items-center justify-between'>
					<Link
						href='/dashboard/templates'
						className='text-muted-foreground text-sm'
					>
						Back to templates
					</Link>
					<ThemeToggle />
				</div>

				<div className='mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-start'>
					<div>
						<h1 className='text-foreground text-2xl font-semibold'>
							{template.name}
						</h1>
						<p className='text-muted-foreground mt-1 max-w-2xl text-sm'>
							{template.description}
						</p>
					</div>
					{projects.length > 0 ? (
						<UseTemplateModal
							template={template}
							projects={serializeDocument<ProjectSummary[]>(projects)}
						/>
					) : (
						<Link
							href='/dashboard/projects/create'
							className='bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-semibold hover:opacity-90'
						>
							Create project
						</Link>
					)}
				</div>

				<div className='border-border bg-card mt-6 overflow-hidden rounded-lg border'>
					<table className='w-full min-w-160 text-left'>
						<thead>
							<tr className='text-muted-foreground text-xs uppercase'>
								<th className='px-3 py-3'>Key</th>
								<th className='px-3 py-3'>Type</th>
								<th className='px-3 py-3'>Placeholder</th>
							</tr>
						</thead>
						<tbody>
							{template.variables.map((variable) => (
								<tr key={variable.key} className='border-border border-t'>
									<td className='text-foreground px-3 py-3 font-mono text-sm'>
										{variable.key}
									</td>
									<td className='px-3 py-3'>
										<span className='bg-secondary text-secondary-foreground rounded px-2 py-1 text-xs'>
											{variable.type}
										</span>
									</td>
									<td className='text-muted-foreground px-3 py-3 text-sm'>
										{variable.placeholder || 'Empty value'}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</main>
	)
}
