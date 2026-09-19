import type { Metadata } from 'next'
import { EnvChecker } from '@/components/tools/EnvChecker'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { serializeDocument } from '@/lib/api'
import { connectDB } from '@/lib/mongodb'
import { getCurrentUser } from '@/lib/session'
import { EnvVariable } from '@/models/EnvVariable'
import { Project } from '@/models/Project'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
	title: 'Missing Env Checker',
	description:
		'Compare an .env.example template against your project variables to detect missing, matched, and extra keys.',
}

export default async function EnvCheckerPage() {
	const user = await getCurrentUser()
	if (!user?.id) redirect('/auth/login')

	await connectDB()
	const projects = await Project.find({ userId: user.id })
		.sort({ isPinned: -1, createdAt: -1 })
		.select('_id projectName')
	const projectPayload =
		serializeDocument<{ _id: string; projectName: string }[]>(projects)
	const variables = await EnvVariable.find({
		projectId: { $in: projectPayload.map((project) => project._id) },
	}).select('projectId key')
	const variablePayload =
		serializeDocument<{ projectId: string; key: string }[]>(variables)

	const projectsWithVariables = projectPayload.map((project) => ({
		...project,
		variables: variablePayload
			.filter((variable) => String(variable.projectId) === project._id)
			.map((variable) => ({ key: variable.key, value: '' })),
	}))

	return (
		<main className='bg-background min-h-screen px-6 py-8'>
			<div className='mx-auto max-w-6xl'>
				<div className='flex items-center justify-between'>
					<Link href='/dashboard' className='text-muted-foreground text-sm'>
						Back to dashboard
					</Link>
					<ThemeToggle />
				</div>
				<h1 className='text-foreground mt-4 text-2xl font-semibold'>
					Missing env checker
				</h1>
				<p className='text-muted-foreground mt-1 text-sm'>
					Compare a .env.example file with a project&apos;s saved variables.
				</p>
				<div className='mt-6'>
					<EnvChecker projects={projectsWithVariables} />
				</div>
			</div>
		</main>
	)
}
