exports.type = `
type NewModel {
  id: ID!
  name: String!
  shortDescription: String
}

input NewModelInput {
  name: String!
  shortDescription: String
}
`

exports.query = `
  # ### Gets the new model that matches this id
  #
  # _Arguments_
  # - **id**: ID of the object
  newModelById(id: ID!): NewModel
`

exports.mutation = `
  # ### Creates a new Model.
  #
  # _Arguments_
  # - **input**: Model's details
  newModelCreate(input: NewModelInput!): NewModel
`