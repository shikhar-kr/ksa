var express = require('express');
var request = require('request');
var config = require('../config');

var routes = function () {

    var configRouter = express.Router();

    configRouter.route('/sites')

        .get(function(req, res) {
			
			res.set(config.res_headers);
			
            res.status(200).json(config.sites);
        });

    return configRouter;

};

module.exports = routes;