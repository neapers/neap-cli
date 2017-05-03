## Replace the following tokens
### package.json
- **name**
- **version**
### index.js
- **export.[NAME-OF-YOUR-PROJECT]**: That can be anything so you could leave it to 'main', but you may already have a 'main' function running on your Google Cloud Functions Emulator.
### srr/graphql/schema.js
- New modules: Each time you add a new module (i.e. a folder containing a schema.js, resolver.js and mapper.js), you need to add it under **modelFolders** array variable.
### deploy.sh & logs.sh
- For both files, update their access permission so they can be executed in your terminal
	```bash
	chmod u+rwx ./deploy.sh
	chmod u+rwx ./logs.sh
	```
- Google Cloud Functions settings: In the **deploy.sh**, update the following 4 variables:
	- **f**: Name of your main Google Cloud Function. This is the name you must have configured before ([NAME-OF-YOUR-PROJECT]).
	- **bucket**: Name of the Google Cloud Functions' bucket you've set up, in your Google Cloud Project.
	- **trigger**: Type of trigger you're using (most probably "--trigger-http").
	- **gf**: Name of your Google Cloud Function.