exports.type = `
# ### Page - Pagination Metadata 
# The Page object represents metadata about the size of the dataset returned. It helps with pagination. 
# Example:
#
# \`\`\`js
# getData(first: 100, skip: 200) 
# \`\`\`
# Skips the first 200 items, and gets the next 100. 
#
# To help represent this query using pages, GraphHub adds properties like _current_ and _total_. In the 
# example above, the returned Page object could be: 
#
# \`\`\`js
# {
#	first: 100,
#	skip: 200,
#	current: 3,
#	total: {
#		size: 1000,
#		pages: 10
#	}
# }
# \`\`\`
type Page {
	# The pagination parameter sent in the query
	first: Int!

	# The pagination parameter sent in the query
	skip: Int!

	# The convertion from 'first' and 'after' in terms of the current page 
	# (e.g. { first: 100, after: 200 } -> current: 3).
    current: Int!

    # Inspect the total size of your dataset ignoring pagination.
    total: DatasetSize
}

# ### DatasetSize - Pagination Metadata
# Used in the Page object to describe the total number of pages available.
type DatasetSize {
	size: Int!
	pages: Int!
}
`
