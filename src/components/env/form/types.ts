export interface EnvEnvironmentOption {
	id: string
	label: string
}

export const ENVIRONMENTS: EnvEnvironmentOption[] = [
	{ id: 'prod', label: 'Production' },
	{ id: 'staging', label: 'Preview' },
	{ id: 'dev', label: 'Development' },
	{ id: 'test', label: 'Test' },
]

export interface EnvVariableFormProps {
	projectId: string
}
