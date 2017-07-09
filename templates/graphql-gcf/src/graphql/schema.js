const makeExecutableSchema = require('graphql-tools').makeExecutableSchema;
const fs = require('fs');
const _ = require('lodash');

// 0. Add your new module's name here
const modelFolders = [
  "core",
  "enum"
];

// 1. Aggregate all schemas and resolvers stored in the module folders
const schemas = _(modelFolders).filter(f => fs.existsSync(`${__dirname}/${f}/schema.js`)).map(f => require(`./${f}/schema`));
const resolvers = _(modelFolders).filter(f => fs.existsSync(`${__dirname}/${f}/resolver.js`)).map(f => require(`./${f}/resolver`));

// 2. Combine all schemas into singles strings
const schemaStringQueries = schemas.filter(s => s.query != null && s.query != undefined && s.query != "").map('query').join('');
const schemaStringMutations = schemas.filter(s => s.mutation != null && s.mutation != undefined && s.mutation != "").map('mutation').join('');
const schemaStringTypes = schemas.filter(s => s.type != null && s.type != undefined && s.type != "").map('type').join('');

const schema = `
${schemaStringTypes}

# ## Welcome to Super GraphQl API (beta) 
# This API is a [Graphql API](http://graphql.org/learn/). This API is in beta mode, and functionalities 
# are being developed on a daily basis. We do not recommend to use this API in production, as it may change.
# 
# 
# ©2017 Your Company, Inc.
type Query {
${schemaStringQueries}
}

type Mutation {
${schemaStringMutations}
}
`;

//console.log(schema);

// 3. Combine all the resolvers into a single object
// resolvers: [{ root: { Query: { ... }, ... }, dependencies: { Product: { ... }, ...}}]
// We need to have a single object: { Query: {...}, Product: { ... }, ... }
const resolver = _(resolvers).flatMap(r => [r.root, r.dependencies]).filter(r => r).reduce((r1, r2) => _.merge(r1,r2));

// 4. Build the GraphQl executable schema
const executableSchema = makeExecutableSchema({
  typeDefs: [schema],
  resolvers: resolver
});

// Do not replace this line with 'exports.executableSchema = executableSchema'. This object is of class 'GraphQLSchema' and it seems
// that exporting it with 'exports.executableSchema = executableSchema' casts it to a type object. Because later in this code, a 
// check 'instanceof GraphQLSchema' is performed, then an error 'Schema must be an instance of GraphQLSchema.' is thrown.
module.exports = { executableSchema }

