const { log, http } = require('./src/utilities')

/**
 * Responds to any HTTP request that can provide a "message" field in the body.
 *
 * @param {!Object} req Cloud Function request context.
 * @param {!Object} res Cloud Function response context.
 */
exports.main = (req, res) => {
	return res.status(200).send(a);
}