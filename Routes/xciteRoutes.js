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

        $('.product-item').each(function (i, el) {
          try { //console.log($(this).html());
              item = {};
              item['site'] = s.site;
              item['href'] = $(this).find('.product-image').attr('href').split(/[?#]/)[0];
              item['image_tn'] = $(this).find('.product-image').find('img').data('src');
              item['product'] = $(this).find('.product-image').attr('title');
              /*if ($(this).find(' .special-price').children('.price').html() === null) {
                    item['price'] = Number($(this).find(' .price').html().split(/ /)[0]);
                } else {
                    item['price'] = Number($(this).find(' .special-price').children('.price').html().split(/ /)[0]);
                }*/
              item['price'] = Number($(this).find(' .finalprice').html().split(/ /)[0]);

              item['stock'] = $(this).find(' .out-of-stock').html() === null ? 1 : 0;
              prds.push(item);
          } catch (e) {
              console.log(i + item['product'] + e);
          }
        });


    };

    productRouter.route('/Products')

        .get(function(req, res) {

            var options = {
                url: s.burl + '/catalogsearch/result/?cat=&q='+req.query.q,
                headers: {
                    'User-Agent': 'Request'
                }
            };

            var html = cache.get(s.site + '-' + req.query.q );

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

    productRouter.route('/Deals')

        .get(function(req, res) {

            var options = {
                url: s.burl + '/dailydeal/index/list/',
                headers: {
                    'User-Agent': config.user_agent
                }
            };

            var html = cache.get(s.site + '-' + 'deals' );

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