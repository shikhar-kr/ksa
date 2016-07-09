var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var cache = require('memory-cache');
var config = require('../config');

var routes = function (s) {

  var productRouter = express.Router();
  var prds = [];
  var item = {};
  var scrape = function (html) {

    // no search

  };

  var scrapeDeals = function (html) {

    var $ = cheerio.load(html);
    prds = [];
    item = {};

    try {
      item['site'] = s.site;
      item['href'] = s.burl;
      item['image_tn'] = $('.product-view .product-img-box img').first().attr('src');
      item['product'] = $('.product-view .product-name').text().trim();
      item['price'] = Number($('.product-view .price').first().text().replace(/KD/i, ''));
      //item['list_price'] = Number($('.wd-cta h5 .was').text().split(/ /)[0]);
      item['stock'] = 1;
      prds.push(item);
    } catch (e) {
      console.log(e);
    }

  };

  productRouter.route('/Products')

    .get(function (req, res) {

      res.set(config.res_headers).status(200).json(prds);

    });

  productRouter.route('/Deals')

    .get(function (req, res) {

      var options = {
        url: s.burl, //?page=$pageNum,
        headers: {
          'User-Agent': config.user_agent
        }
      };

      var html = cache.get(s.site + '-' + 'deals');

      if (html) {
        scrapeDeals(html);
        //console.log(html);
        res.set(config.res_headers).status(200).json(prds);

      } else {
        request(options, function (error, response, html) {
          console.log('request callback ' + s.site);
          if (error) {
            res.set(config.res_headers).send(500);
          } else {
            cache.put(s.site + '-' + req.query.q, html, config.cache_expiry);
            scrapeDeals(html);
            res.set(config.res_headers).status(200).json(prds);
          }
        });

      }

    });

  return productRouter;

};

module.exports = routes;