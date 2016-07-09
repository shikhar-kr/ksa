var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var cache = require('memory-cache');
var config = require('../config');

var routes = function (s) {

    var productRouter = express.Router();
    var prds = [] ;
    var item = {} ;
    var scrape = function(html){

        var $ = cheerio.load(html);
        prds = [] ;

        $('.proList li').each(function (i, el) {
            try {
                item = {};
                item['site'] = s.site;
                item['href'] = s.burl + '/' + $(this).find('a').attr('href').split(/[?#]/)[0];
                item['image_tn'] = s.burl + $(this).find('img').attr('src');
                item['product'] = $(this).find('img').attr('alt');
                item['price'] = Number($(this).find('.cost').html().trim().split(/ /)[0].trim());
                item['stock'] = 1 ;
                prds.push(item);
            } catch (e) {
                console.log(i + item['product'] + e);
            }
        });


    };

    productRouter.route('/Products')

        .get(function(req, res) {

            var options = {
                url: s.burl + '/search.aspx?text='+req.query.q,
                headers: {
                    'User-Agent': 'Request'
                }
            };

            var html = cache.get( s.site + '-' + req.query.q );

            if(html){
                scrape(html) ;
                //console.log(html);
                res.set(config.res_headers).status(200).json(prds);

            } else {
                request(options, function (error, response, html) {
                    console.log('request callback ' + s.site);
                    if (error) {
                        res.set(config.res_headers).send(500);
                    } else {
                        cache.put(s.site + '-' + req.query.q, html, config.cache_expiry) ;
                        scrape(html) ;
                        res.set(config.res_headers).status(200).json(prds);
                    }
                });

            }

        });

    return productRouter;

};

module.exports = routes;