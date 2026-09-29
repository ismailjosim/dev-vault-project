import { compareEnvFiles, generateComparisonReport } from '@/utils/env-checker'
import { parseEnvText } from '@/utils/env-parser'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const checkMissingSchema = z.object({
	projectName: z.string().trim().optional().default('Project'),
	exampleContent: z.string(),
	projectContent: z.string(),
})

export async function POST(request: NextRequest) {
	try {
		const body = await request.json().catch(() => ({}))
		const parsed = checkMissingSchema.safeParse(body)
		if (!parsed.success) {
			return NextResponse.json(
				{
					error:
						'Invalid input. Please provide exampleContent and projectContent.',
				},
				{ status: 400 },
			)
		}

		const { projectName, exampleContent, projectContent } = parsed.data
		const comparison = compareEnvFiles(
			parseEnvText(exampleContent).variables,
			parseEnvText(projectContent).variables,
		)

		return NextResponse.json({
			comparison,
			report: generateComparisonReport(projectName, comparison),
		})
	} catch (error) {
		return NextResponse.json(
			{ error: (error as Error).message || 'Failed to compare env files' },
			{ status: 500 },
		)
	}
}
