import { Types } from 'mongoose'
import { EnvVariableVersion } from '@/models/EnvVariableVersion'

export async function recordEnvVersion({
	variableId,
	projectId,
	environment,
	key,
	value,
	changeType,
	changeReason = '',
	modifiedByUserId,
}: {
	variableId: Types.ObjectId | string
	projectId: Types.ObjectId | string
	environment: string
	key: string
	value: string
	changeType: 'created' | 'updated' | 'deleted' | 'rollback'
	changeReason?: string
	modifiedByUserId: string
}) {
	const latest = await EnvVariableVersion.findOne({ variableId })
		.sort({ versionNumber: -1 })
		.select('versionNumber')

	const versionNumber = latest ? latest.versionNumber + 1 : 1

	return EnvVariableVersion.create({
		variableId,
		projectId,
		environment,
		key,
		encryptedValue: value,
		versionNumber,
		changeType,
		changeReason,
		modifiedByUserId,
	})
}
