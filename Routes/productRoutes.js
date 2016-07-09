var express = require('express');

var routes = function(Product){

	var productRouter = express.Router();

	productRouter.route('/Products')
	.post(function(req, res){
		var product = new Product(req.body);
		product.save();
        //console.log(req.body);
        res.status(201).send(product);
    })
	.get(function(req, res){
		Product.find(function(err, products){
			if(err)
				console.log(err);
			else
				res.json(products);

		});
	});	

	return productRouter;

};

module.exports = routes;