/**
 * Mock server for C1X Header Bidding.
 */

var express = require('express'),
  http = require('http'),
  cookieParser = require('cookie-parser')

var app = module.exports = express();
app.use(cookieParser())

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
          cpm: 1.5,
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

var server = http.createServer(app);
server.listen(9000, function () {
  console.log('Express server listening on port ' + app.get('port'));
});
