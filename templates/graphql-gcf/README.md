## Prerequisites
Make sure that both the **_deploy.sh_** and **_logs.sh_** bash files can be executed in your terminal:
```bash
chmod u+rwx ./deploy.sh
chmod u+rwx ./logs.sh
```

## Run The Project
Install all dependencies:
```bash
npm install
```

Deploy it locally:
```bash
functions start
./deploy.sh dev
```
Add 'graphiql' at the end of your URI, and test if GraphiQl runs in your browser. Your URI should look something like: [http://localhost:8010/[PROJECT-ID]/us-central1/[FUNCTION-NAME]/graphiql](http://localhost:8010/[PROJECT_ID]/us-central1/[FUNCTION-NAME]/graphiql)

## Deploying Your Project Locally or to Google Cloud Functions 
To deploy locally using the Google Cloud Function Emulator, run the following:
```bash
functions start
./deploy.sh dev
```

To deploy to Google Cloud Functions, run the following:
```bash
./deploy.sh
```

## Access The Logs 
Simply run 
```bash
./logs
```
The above returns the last 20 logs. To get more logs (e.g. the last 100):
```bash
./logs 100
```

## Adding New Models To Your GraphQl Project
To add a new model to your GraphQl schema, simple copy/pase the **_'src/graphql/\_template'_** folder, and rename _\_template_ with the name of your new model (e.g. _Product_). 

Each time you add a new model, you need to add its name under the **modelFolders** array variable, in the **_'src/graphql/schema.js'_** file (using the previous _Product_ example, after having copied the _\_template_ folder under the graphql folder, and renaming to _Product_, you would need to add "Product" in the **modelFolders** array).

## Paging
You can see an example in the **_'src/graphql/\_template'_** folder. Have a look at the 'resolver.js' file. Just return a Page object by using the ``` core.Page(args, getTotalSize) ``` method, where _getTotalSize_ must me a function returning a promise which should return an integer representing the total number of items in the systems.