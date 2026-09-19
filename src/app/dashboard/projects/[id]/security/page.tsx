import type { Metadata } from 'next'
import { SecurityHealthCard } from '@/components/security/SecurityHealthCard'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { connectDB } from '@/lib/mongodb'
import { getCurrentUser } from '@/lib/session'
import { EnvVariable } from '@/models/EnvVariable'
import { Project } from '@/models/Project'
import { decryptValue } from '@/utils/encryption'
import { evaluateProjectHealth } from '@/utils/security-scanner'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

interface ProjectSecurityPageProps {
	params: Promise<{ id: string }>
}

export async function generateMetadata({
	params,
}: ProjectSecurityPageProps): Promise<Metadata> {
	const { id } = await params
	await connectDB()
	const project = await Project.findById(id).select('projectName')
	return {
		title: project
			? `${project.projectName} - Security Diagnostics`
			: 'Security Diagnostics',
		description:
			'Shannon entropy evaluation, pattern leak scanner, and configuration audits.',
	}
}

export default async function ProjectSecurityPage({
	params,
}: ProjectSecurityPageProps) {
	const user = await getCurrentUser()
	if (!user?.id) redirect('/auth/login')

	const { id } = await params
	await connectDB()

	const project = await Project.findOne({ _id: id, userId: user.id })
	if (!project) notFound()

	const variables = await EnvVariable.find({ projectId: project._id })

	const decryptedVariables = variables.map((v) => {
		let value = ''
		try {
			value = decryptValue(v.encryptedValue)
		} catch {
			value = ''
		}
		return {
			key: v.key,
			value,
			environment: v.environment,
			type: v.type,
		}
	})

	const scanResult = evaluateProjectHealth(decryptedVariables)

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
						<span className='rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-500'>
							Audit & Diagnostics
						</span>
						<h1 className='text-foreground text-2xl font-bold'>
							{project.projectName} Security Diagnostics
						</h1>
					</div>
					<p className='text-muted-foreground mt-1 text-sm'>
						Continuous entropy analysis, secret signature pattern matching, and
						production misconfiguration detection.
					</p>
				</div>

				<SecurityHealthCard
					projectId={project._id.toString()}
					initialData={scanResult}
				/>
			</div>
		</main>
	)
}
