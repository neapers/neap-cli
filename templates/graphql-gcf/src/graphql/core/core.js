const u = require("../../utilities");

module.exports = {

	/**	
	 * Page is a function that builds a single object made of @args and @getTotalSize.
	 * It's purpose is to make sure the the Promise @getTotalSize's name is indeed 'getTotalSize',
	 * so it can be invoked consistently in the core/resolver.js -> getTotal function.
	 *  
	 * @param  {object}			args			- Any object with usefull properties]
	 * @param  {ES6 Promise}	getTotalSize	- Promise that returns an int
	 * @return {ES6 Promise} 					- Object that has inherited from @args and contains 
	 * 											  an extra property named @getTotalSize 
	 */
	Page: (args, getTotalSize) => { return { __proto__: args, getTotalSize: getTotalSize } }
}