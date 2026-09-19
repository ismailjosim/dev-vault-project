'use client'

import { useState } from 'react'

export function ExportMenu({ projectId }: { projectId: string }) {
	const [resolveInterpolation, setResolveInterpolation] = useState(false)
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

	async function getExport(format: string, environment = '') {
		const response = await fetch(`/api/projects/${projectId}/export`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				format,
				environment: environment || undefined,
				resolveInterpolation,
			}),
		})

		return (await response.json()) as {
			filename: string
			content: string
		}
	}

	async function exportProject(format: string) {
		const payload = await getExport(format)
		const blob = new Blob([payload.content], { type: 'text/plain' })
		const url = URL.createObjectURL(blob)
		const anchor = document.createElement('a')
		anchor.href = url
		anchor.download = payload.filename
		anchor.click()
		URL.revokeObjectURL(url)
	}

	async function copyProject(format: string) {
		const payload = await getExport(format)
		await navigator.clipboard.writeText(payload.content)
	}

	return (
		<div className='flex flex-col gap-2'>
			<label className='text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-2 text-xs'>
				<input
					type='checkbox'
					checked={resolveInterpolation}
					onChange={(e) => setResolveInterpolation(e.target.checked)}
					className='border-border text-primary rounded'
				/>
				<span>
					Resolve variable references (e.g. <code>{'${HOST}'}</code> → evaluated
					value)
				</span>
			</label>
			<div className='flex flex-wrap gap-2'>
				{formats.map((format) => (
					<div
						key={format}
						className='border-border flex overflow-hidden rounded-md border'
					>
						<button
							type='button'
							onClick={() => exportProject(format)}
							className='text-foreground hover:bg-hover px-3 py-2 text-sm'
						>
							Export {format}
						</button>
						<button
							type='button'
							onClick={() => copyProject(format)}
							className='border-border text-muted-foreground hover:bg-hover hover:text-foreground border-l px-3 py-2 text-sm'
						>
							Copy
						</button>
					</div>
				))}
			</div>
		</div>
	)
}
