import mongoose from 'mongoose'

async function testClone() {
	await mongoose.connect('mongodb://localhost:27017/dev-vault')
	const db = mongoose.connection.db

	const project = await db.collection('projects').findOne()
	if (!project) {
		console.log('No project found')
		process.exit(0)
	}

	console.log('Testing clone for project:', project.projectName, project._id.toString())
	const envVars = await db.collection('envvariables').find({ projectId: project._id }).toArray()
	console.log(`Found ${envVars.length} total env variables in project`)

	await mongoose.disconnect()
	console.log('Test completed successfully')
}

testClone().catch(console.error)
