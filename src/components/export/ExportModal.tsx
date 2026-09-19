'use client'

import { Download, Clipboard } from 'lucide-react'
import { useState } from 'react'

const formats = [
	'env',
	'env.local',
	'env.production',
	'env.development',
	'env.test',
	'json',
	'yaml',
	'markdown',
	'example',
]

const environments = [
	{ value: '', label: 'All environments' },
	{ value: 'dev', label: 'Development' },
	{ value: 'staging', label: 'Staging' },
	{ value: 'prod', label: 'Production' },
	{ value: 'test', label: 'Test' },
]

export function ExportModal({
	projects,
}: {
	projects: { _id: string; projectName: string }[]
}) {
	const [projectId, setProjectId] = useState(projects[0]?._id || '')
	const [format, setFormat] = useState('env')
	const [environment, setEnvironment] = useState('')
	const [preview, setPreview] = useState('')
	const [filename, setFilename] = useState('')
	const [resolveInterpolation, setResolveInterpolation] = useState(false)
	const [error, setError] = useState<string | null>(null)

	async function loadExport() {
		setError(null)
		const response = await fetch(`/api/projects/${projectId}/export`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				format,
				environment: environment || undefined,
				resolveInterpolation,
			}),
		})

		if (!response.ok) {
			setError('Could not generate export')
			return null
		}

		const payload = (await response.json()) as {
			filename: string
			content: string
		}
		setPreview(payload.content)
		setFilename(payload.filename)
		return payload
	}

	async function downloadExport() {
		const payload = await loadExport()
		if (!payload) return

		const blob = new Blob([payload.content], { type: 'text/plain' })
		const url = URL.createObjectURL(blob)
		const anchor = document.createElement('a')
		anchor.href = url
		anchor.download = payload.filename
		anchor.click()
		URL.revokeObjectURL(url)
	}

	async function copyExport() {
		const payload = await loadExport()
		if (!payload) return
		await navigator.clipboard.writeText(payload.content)
	}

	if (projects.length === 0) {
		return (
			<div className='border-border bg-card text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm'>
				Create a project before exporting environment files.
			</div>
		)
	}

	return (
		<div className='grid gap-6 lg:grid-cols-[360px_1fr]'>
			<section className='border-border bg-card rounded-lg border p-5'>
				<div className='space-y-4'>
					<label className='block'>
						<span className='text-muted-foreground text-sm'>Project</span>
						<select
							value={projectId}
							onChange={(event) => setProjectId(event.target.value)}
							className='border-border bg-background text-foreground mt-1 w-full rounded-md border px-3 py-2'
						>
							{projects.map((project) => (
								<option key={project._id} value={project._id}>
									{project.projectName}
								</option>
							))}
						</select>
					</label>

					<label className='block'>
						<span className='text-muted-foreground text-sm'>Format</span>
						<select
							value={format}
							onChange={(event) => setFormat(event.target.value)}
							className='border-border bg-background text-foreground mt-1 w-full rounded-md border px-3 py-2'
						>
							{formats.map((item) => (
								<option key={item}>{item}</option>
							))}
						</select>
					</label>

					<label className='block'>
						<span className='text-muted-foreground text-sm'>Environment</span>
						<select
							value={environment}
							onChange={(event) => setEnvironment(event.target.value)}
							className='border-border bg-background text-foreground mt-1 w-full rounded-md border px-3 py-2'
						>
							{environments.map((item) => (
								<option key={item.value} value={item.value}>
									{item.label}
								</option>
							))}
						</select>
					</label>

					<label className='text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-2 text-xs'>
						<input
							type='checkbox'
							checked={resolveInterpolation}
							onChange={(e) => setResolveInterpolation(e.target.checked)}
							className='border-border text-primary rounded'
						/>
						<span>
							Resolve variable references (e.g.{' '}
							<code className='font-mono'>${'{VAR}'}</code> → evaluated values)
						</span>
					</label>

					<div className='flex gap-2'>
						<button
							type='button'
							onClick={downloadExport}
							className='bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold hover:opacity-90'
						>
							<Download className='h-4 w-4' />
							Download
						</button>
						<button
							type='button'
							onClick={copyExport}
							className='border-border text-foreground hover:bg-hover inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm'
						>
							<Clipboard className='h-4 w-4' />
							Copy
						</button>
					</div>

					{error && <p className='text-danger text-sm'>{error}</p>}
				</div>
			</section>

			<section className='border-border bg-card rounded-lg border p-5'>
				<div className='flex items-center justify-between gap-3'>
					<h2 className='text-card-foreground text-base font-semibold'>
						Preview
					</h2>
					{filename && (
						<span className='text-muted-foreground font-mono text-xs'>
							{filename}
						</span>
					)}
				</div>
				<pre className='border-border bg-background text-foreground mt-4 min-h-90 overflow-auto rounded-md border p-4 text-sm'>
					{preview || 'Generate an export to preview it here.'}
				</pre>
			</section>
		</div>
	)
}
