const shell = require('shelljs')
const colors = require('colors')

const env = process.argv[2]
const startClock = Date.now()

const config = !env
	? {
		GCPproject: '{{GCPproject}}',
		GCPbucket: '{{GCPbucket}',
		GCFname: '{{GCFname}}',
		GCFtrigger: '{{GCFtrigger}}',
		GCFmainFunc: '{{GCFmainFunc}}'
	} 
	: env == 'staging'
	? {
		GCPproject: '{{GCPproject}}',
		GCPbucket: '{{GCPbucket}',
		GCFname: '{{GCFname}}',
		GCFtrigger: '{{GCFtrigger}}',
		GCFmainFunc: '{{GCFmainFunc}}'
	} 
	: env == 'prod'
	? {
		GCPproject: '{{GCPproject}}',
		GCPbucket: '{{GCPbucket}',
		GCFname: '{{GCFname}}',
		GCFtrigger: '{{GCFtrigger}}',
		GCFmainFunc: '{{GCFmainFunc}}'
	} : (() => { 
		console.log(`${`Failed to deploy: Environment '${env}' is unknown. Please configure your 'deploy.js' for that environment.`.red}`)
		process.exit(1)
	})()

if (!env) { // Local environment. Make Sure the Google function emulator is running.
	const emulatorsRunning = shell.exec(`ps -ax | grep functions-emulator | wc -l`, {silent:true}).stdout * 1

	if (emulatorsRunning < 3) {
		console.log(`No emulator running. Time to start one!`.cyan)
		shell.exec(`functions start`)
	}

	console.log(`${'LOCALLY'.italic.bold} deploying entry-point ${config.GCFmainFunc.italic.bold} using trigger type ${config.GCFtrigger.italic.bold}`.cyan)
	shell.exec(`functions deploy ${config.GCFmainFunc} ${config.GCFtrigger}`)
}
else {
	console.log(`Deploying entry-point ${config.GCFmainFunc.italic.bold} to ${`GOOGLE CLOUD FUNCTION ${config.GCFname}`.italic.bold} located in project ${config.GCPproject.italic.bold} using trigger type ${config.GCFtrigger.italic.bold}`.cyan)
	shell.exec(`gcloud config set project ${config.GCPproject}`)
	shell.exec(`gcloud beta functions deploy ${config.GCFname} --stage-bucket ${config.GCPbucket} ${config.GCFtrigger} --entry-point ${config.GCFmainFunc}`)
}

console.log(`Deployment successful (${(Date.now() - startClock)/1000} sec.)`.green)



