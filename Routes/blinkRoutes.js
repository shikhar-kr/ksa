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

    $('.innerPlist li').each(function (i, el) {
      try {
        item = {};
        item['site'] = s.site;
        item['href'] = s.burl + $(this).children('a').attr('href').split(/[?#]/)[0];
        item['image_tn'] = s.burl + $(this).children('a').children('img').attr('src');
        item['product'] = $(this).children('a').children('img').attr('alt');
        item['price'] = Number($(this).find(' .price').html().split(/ /)[0]);
        item['stock'] = $(this).find(' .outStock').html() === null ? 1 : 0;
        prds.push(item);
      } catch (e) {
        console.log(i + item['product'] + e);
      }
    });


  };

  var scrapeDeals = function (html) {

    var $ = cheerio.load(html);
    prds = [];

    $('.dealcenterContainer').each(function (i, el) {
      try {
        item = {};
        item['site'] = s.site;
        item['href'] = s.burl + $(this).find('.dodProducttitle').find('a').attr('href');
        item['image_tn'] = s.burl + $(this).find('.slides_container').find('img').first().attr('src');
        item['product'] = $(this).find('.dodProducttitle').find('a').text().trim();
        item['price'] = Number($(this).find(' .dodPrice').html().split(/ /)[1].trim());
        item['list_price'] = Number($(this).find(' .dodSubblock li').first().find('p').html().split(/ /)[1].trim());
        item['stock'] = 1;
        prds.push(item);
      } catch (e) {
        console.log(i + item['product'] + e);
      }
    });

  };

  productRouter.route('/Products')

    .get(function (req, res) {

      var options = {
        url: s.burl + '/search.aspx?text=' + req.query.q + '&searchfor=all', //&page=1',
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
        url: s.burl + '/deals',
        headers: {
          'User-Agent': config.user_agent
        }
      };

      var html = cache.get(s.site + '-' + req.query.q);

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