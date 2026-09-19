export type VariableMap = Record<string, string>

export interface InterpolationResult {
	resolved: VariableMap
	errors: Record<string, string>
	dependencies: Record<string, string[]>
}

/**
 * Extract all variable names referenced as ${VAR_NAME} within a string
 */
export function extractVariableReferences(value: string): string[] {
	if (!value || typeof value !== 'string') return []
	const matches = value.matchAll(/\$\{([a-zA-Z0-9_]+)\}/g)
	const refs = new Set<string>()
	for (const match of matches) {
		if (match[1]) {
			refs.add(match[1])
		}
	}
	return Array.from(refs)
}

/**
 * Check if a string contains any ${VAR_NAME} interpolation patterns
 */
export function hasInterpolation(value: string): boolean {
	return /\$\{([a-zA-Z0-9_]+)\}/.test(value)
}

/**
 * Recursively resolve variable interpolations (${VAR_NAME}) across a dictionary of variables.
 * Detects circular dependencies and missing variable references.
 */
export function resolveInterpolation(
	variables: VariableMap,
): InterpolationResult {
	const resolved: VariableMap = {}
	const errors: Record<string, string> = {}
	const dependencies: Record<string, string[]> = {}
	const visiting = new Set<string>()
	const visited = new Set<string>()

	for (const [key, val] of Object.entries(variables)) {
		dependencies[key] = extractVariableReferences(val || '')
	}

	function resolveKey(key: string, path: string[] = []): string {
		if (visiting.has(key)) {
			const cyclePath = [...path, key].join(' → ')
			errors[key] = `Circular dependency detected: ${cyclePath}`
			return `\${${key}}`
		}

		if (visited.has(key)) {
			return resolved[key] ?? variables[key] ?? ''
		}

		visiting.add(key)
		const rawValue = variables[key] ?? ''

		const evaluated = rawValue.replace(
			/\$\{([a-zA-Z0-9_]+)\}/g,
			(fullMatch, referencedKey: string) => {
				if (referencedKey === key) {
					errors[key] = `Self-referencing variable: ${key} references itself`
					return fullMatch
				}

				if (variables[referencedKey] !== undefined) {
					return resolveKey(referencedKey, [...path, key])
				}

				errors[key] = `Referenced variable \${${referencedKey}} is missing`
				return fullMatch
			},
		)

		visiting.delete(key)
		visited.add(key)
		resolved[key] = evaluated
		return evaluated
	}

	for (const key of Object.keys(variables)) {
		if (!visited.has(key)) {
			resolveKey(key)
		}
	}

	return { resolved, errors, dependencies }
}

/**
 * Resolves a single candidate value against an environment dictionary.
 * Useful for real-time live preview in form inputs.
 */
export function resolvePreview(
	candidateKey: string,
	candidateValue: string,
	existingVariables: VariableMap,
): { resolved: string; error: string | null } {
	if (!hasInterpolation(candidateValue)) {
		return { resolved: candidateValue, error: null }
	}

	const tempScope: VariableMap = {
		...existingVariables,
		[candidateKey || '__PREVIEW__']: candidateValue,
	}

	const result = resolveInterpolation(tempScope)
	const resolved =
		result.resolved[candidateKey || '__PREVIEW__'] || candidateValue
	const error = result.errors[candidateKey || '__PREVIEW__'] || null

	return { resolved, error }
}
