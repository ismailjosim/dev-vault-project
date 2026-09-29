import type { EnvVariableSummary } from '@/components/env/EnvVariableItem'

export interface EnvComparisonResult {
	sourceEnv: string
	targetEnv: string
	missingInTarget: EnvVariableSummary[]
	missingInSource: EnvVariableSummary[]
	presentInBoth: {
		key: string
		sourceVar: EnvVariableSummary
		targetVar: EnvVariableSummary
	}[]
}

export interface EnvironmentCompareModalProps {
	projectId: string
	environments: string[]
	isOpen: boolean
	onClose: () => void
	onClonedSuccess?: () => void
}
