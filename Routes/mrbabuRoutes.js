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

      $('.ty-grid-list__item').each(function (i, el) {
        try {
          item = {};
          item['site'] = s.site;
          item['href'] = $(this).find('.product-title').attr('href').split(/[?#]/)[0];
          item['image_tn'] = $(this).find('.ty-pict').attr('src');
          item['product'] = $(this).find('.product-title').attr('title');
          item['price'] = Number($(this).find('.ty-price').children('span').eq(1).html().trim());
          item['stock'] = 1;
          prds.push(item);
        } catch (e) {
          console.log(i + item['product'] + e);
        }
      });


    };

  productRouter.route('/Products')

      .get(function(req, res) {

        var options = {
          url: s.burl + '/?subcats=Y&status=A&pshort=Y&pfull=Y&pname=Y&pkeywords=Y&search_performed=Y&searchid=All&sort_by=null&sort_order=asc&q='+req.query.q+'&dispatch=products.search&items_per_page=16',
          headers: {
              'User-Agent': config.user_agent
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
                  console.log(error);
                  console.log(response);
                  res.set(config.res_headers).sendStatus(500);
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