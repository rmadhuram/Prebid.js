/**
 * Mock server for C1X Header Bidding.
 */

var express = require('express'),
  http = require('http'),
  cookieParser = require('cookie-parser'),
  htSim = require('./ht-simulator');

var app = module.exports = express();
app.use(cookieParser());


app.get('/ht', function(req, res) {
  htSim.serveBid(req).then(function(data) {
    res.send('_c1xResponse(' + JSON.stringify(data) + ')');
  }, function(err) {
    res.send([]);
  });
});

function getConfigFromCookie(req) {

}

app.get('/config', function(req, res) {
  var config = {
    bidRatio: 1.0,  // bid or not 50/50
    pMin: 1.0,
    pMax: 4.0,
    respDelay: 0
  };

  if (req.param('bidRatio')) {
    config.bidRatio = +req.param('bidRatio');
  }

  if (req.param('pMin')) {
    config.pMin = +req.param('pMin');
  }

  if (req.param('pMax')) {
    config.pMax = +req.param('pMax');
  }

  res.cookie('config', JSON.stringify(config));
  res.json(config);
});

app.get('/config/get', function(req, res) {
  var config = {};
  if (req.cookies.config) {
    config = JSON.parse(req.cookies.config);
  }

  res.json(config);
});

app.get('/config/clear', function(req, res) {
  res.clearCookie('config');
  res.json({});
});


app.get('/status', function(req, res) {
  var shouldBid = true;
  if (req.cookies) {
    if (req.cookies.htdemo === 'false') {
      shouldBid = false;
    }
  }

  var bid = req.param('bid');
  if (typeof bid !== 'undefined') {
    if (bid === 'false') {
      res.cookie('htdemo', 'false');
      shouldBid = false;
    } else {
      res.clearCookie('htdemo');
      shouldBid = true;
    }
  }

  res.json({bid: shouldBid});

})

app.get('/bid', function(req, res) {
  var site = req.param('site'),
    nUnits = req.param('adunits'),
    adunits = [];

  for (var i=0; i<nUnits; i++) {
    var item = {};
    item.adId = req.param('a' + (i+1)),
    item.sizes = req.param('a' + (i+1) + 's');
    adunits.push(item);
  }

  console.log('cookies:' , req.cookies);
  var shouldBid = true;
  if (req.cookies) {
    if (req.cookies.htdemo === 'false') {
      shouldBid = false;
    }
  }

  var resp = [];

  for (var i=0; i<nUnits; i++) {
    var adunit = adunits[i],
      nobid = true;

    if (shouldBid) {
      if (adunit.sizes == '[300x250]') {
        nobid = false;
        resp.push({
          adId: adunit.adId,
          bid: true,
          cpm: 60,
          ad: '<div><a target="_new" href="http://c1exchange.com"><img src="http://c1x.s3.amazonaws.com/ads/house/banner300x250/c1x-ad2.jpg"></a></div>',
          width: 300,
          height: 250
        });
      }
    }

    if (nobid) {
      resp.push({
        adId: adunit.adId,
        bid: false
      });
    }
  }

  res.setHeader('content-type', 'text/plain');
  res.send('_c1xResponse(' + JSON.stringify(resp) + ')');
});

app.get('/ad', function(req, res) {
  var w = req.param('w'),
    h = req.param('h'),
    fs = require('fs');

  fs.readFile('./ad-template.html', 'utf8', function(err, contents) {
    res.setHeader('content-type', 'text/javascript');
    contents = contents.replace(/{{w}}/g, w);
    contents = contents.replace(/{{h}}/g, h);
    contents = contents.replace(/{{bgurl}}/g, 'http://subtlepatterns2015.subtlepatterns.netdna-cdn.com/patterns/wov.png');

    res.send(contents);
  });
});

var server = http.createServer(app);
server.listen(9000, function () {
  console.log('Express server listening on port ' + app.get('port'));
});
