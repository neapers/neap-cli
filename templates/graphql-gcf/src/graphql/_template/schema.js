exports.type = `
type NewModel {
  id: ID!
  name: String!
  shortDescription: String
}
`

exports.query = `
  # ### GET the new model that matches this id
  #
  # _Arguments_
  # - **id**: ID of the object
  newModelById(id: Int!): NewModel
`