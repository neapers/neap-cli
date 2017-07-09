const shell = require('shelljs')
const limit = process.argv[2]

if (limit)
	shell.exec(`functions logs read --limit=${limit}`)
else
	shell.exec(`functions logs read`)