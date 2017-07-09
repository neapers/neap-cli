const _ = require('lodash');

module.exports = {
	OptionType: {
		DROPDOWNLIST: 1,
	 	RADIOLIST: 2,
	 	GRID: 3,
	 	getType: (id) => {
	 	    switch (id) {
	 	        case 1:
	 	            return "DROPDOWNLIST";
	 	        case 2:
	 	            return "RADIOLIST";
	 	        case 3:
	 	            return "GRID";
	 	        default:
	 	            throw new Error(`Cannot convert id '${id}' into type 'OptionControlType'.`);
	 	    }
	 	}
	}
}