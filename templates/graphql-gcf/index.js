const graphiQL = require('google-graphql-functions')
const { log, http } = require('./src/utilities')
const executableSchema = require('./src/graphql/schema.js').executableSchema

const context = { 
    // add the constant variables you want to be passed to any GraphQl queries here 
}

const graphql_options = {
    schema: executableSchema,
    graphiql: true,
    endpointURL: "/graphiql",
    context
}

/**
 * Responds to any HTTP request that can provide a "message" field in the body.
 *
 * @param {!Object} req Cloud Function request context.
 * @param {!Object} res Cloud Function response context.
 */
exports.{{GCFmainFunc}} = (req, res) => {
	// Manipulate 'req' and 'res' before it gets process by GraphQL (e.g. authentication).
	// The following line is just an example of what could be passed to GraphQL's rootValue prop.
	const { url } = http.shortRequest(req)
	return graphiQL.serveHTTP({ rootValue: url, __proto__: graphql_options }, (req, res, results) => {
		// Add some code to inspect req, res, or results (i.e. the GraphQL response) here. 
		// Notice that at this stage, 'req' and 'res' can't be modified anymore as they've already 
		// be written to a stream.
	})(req, res)
}