var validator = require('validator');

exports.validate= function(validate_array){

	var return_array = [];

	validate_array.forEach(function(val) {

		switch(val.rule)
		{
			case 'empty';

			if(!validator.isEmpty(val.value))
			{
				var message = val.key.split('_').union(' ');
				return_array.push(message+' must not be empty');
			}

			break;

		}
	}

	return return_array;
}