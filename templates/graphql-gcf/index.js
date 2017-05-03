const graphiQL = require('google-graphql-functions');
const u = require('./src/utilities');
const executableSchema = require('./src/graphql/schema.js').executableSchema;

const context = { 
    // add the constant variables you want to be passed to any GraphQl queries here 
};

const graphql_options = {
    schema: executableSchema,
    graphiql: true,
    endpointURL: "/graphiql",
    context
};

/**
 * Responds to any HTTP request that can provide a "message" field in the body.
 *
 * @param {!Object} req Cloud Function request context.
 * @param {!Object} res Cloud Function response context.
 */
 // exports.main = (req, res) => {
 // 	return res.status(200).send(a);
 // }
exports.{{project-function}} = graphiQL.serveHTTP(graphql_options, (req, res, results) => {
	//u.log(u.shortRequest(req), "REQUEST");
	//Some code to inspect req, res, or results
});
