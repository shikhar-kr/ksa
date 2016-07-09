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

    var $ = cheerio.load(html);
    prds = [];

    $('.placard').each(function (i, el) {
      try {
        item = {};
        item['site'] = s.site;
        item['href'] = $(this).find('.itemLink').attr('href').split(/[?#]/)[0];
        item['image_tn'] = $(this).find('img').attr('src');
        item['product'] = $(this).find('.itemLink').attr('title').trim();
        //item['price'] = ‌‌$(this).find(' .price').html().split(/ /)[0];
        item['price'] = Number($(this).find('.is').html().split(/&/)[0].trim());
        item['stock'] = 1;
        prds.push(item);
      } catch (e) {
        console.log(i + item['product'] + e);
      }
    });


  };

  var scrapeDeals = function (html) {

    var $ = cheerio.load(html);
    prds = [];
    item = {};

    try {
      item['site'] = s.site;
      item['href'] = $('.wd-info a').attr('href');
      item['image_tn'] = $('.wd-info a img').attr('src');
      item['product'] = $('.wd-cta h6 a').text().trim();
      item['price'] = Number($('.wd-cta h5 .is').text().split(/ /)[0]);
      item['list_price'] = Number($('.wd-cta h5 .was').text().split(/ /)[0]);
      item['stock'] = 1;
      prds.push(item);
    } catch (e) {
      console.log(e);
    }

  };

  productRouter.route('/Products')

    .get(function (req, res) {

      var options = {
        url: s.burl + '/kw-en/' + req.query.q + '/s/', //?page=$pageNum,
        headers: {
          'User-Agent': config.user_agent
        }
      };

      var html = cache.get(s.site + '-' + req.query.q);

      if (html) {
        scrape(html);
        //console.log(html);
        res.set(config.res_headers).status(200).json(prds);

      } else {
        request(options, function (error, response, html) {
          console.log('request callback ' + s.site);
          if (error) {
            res.set(config.res_headers).send(500);
          } else {
            cache.put(s.site + '-' + req.query.q, html, config.cache_expiry);
            scrape(html);
            res.set(config.res_headers).status(200).json(prds);
          }
        });

      }

    });

  productRouter.route('/Deals')

    .get(function (req, res) {

      var options = {
        url: 'http://deals.souq.com/kw-en/', //?page=$pageNum,
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