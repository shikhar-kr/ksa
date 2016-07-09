var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var productModel = new Schema({
	searchid: {type: String},
	siteid: {type: Number},
	title: {type: String},
	url: {type: String},
	currency: {type: String},
	price: {type: Number},
	oos: {type: Boolean},
	timestamp: {type: Number}
});

module.exports=mongoose.model('Product', productModel);