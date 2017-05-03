exports.type = `
enum VariantSort {
  ID
  NAME
}

enum ProductSort {
  ID
  NAME
}

enum OptionType {
	DROPDOWNLIST
 	RADIOLIST 
 	GRID
}
`
exports.query = ``
// `
//   # ### GET the product that matches this id
//   #
//   # _Arguments_
//   # - **id**: ID of the object
//   productById(id: Int!): Product
// `