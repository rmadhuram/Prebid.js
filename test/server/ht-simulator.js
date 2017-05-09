var q = require('q');


function getConfig(req) {
  var config = {
    bidRatio: 1.0,  // bid or not 50/50
    pMin: 1.0,
    pMax: 4.0,
    respDelay: 0
  };

  if (req.cookies.config) {
    config = JSON.parse(req.cookies.config);
  }

  console.log(config);
  return config;
}

exports.serveBid = function(req) {

  var config = getConfig(req),
    deferred = q.defer();

  var site = req.param('site'),
    nUnits = req.param('adunits'),
    adunits = [];

  for (var i=0; i<nUnits; i++) {
    var item = {};
    item.adId = req.param('a' + (i+1));

    var sizes = req.param('a' + (i+1) + 's');
    item.sizes = sizes.replace(/\[/g, '').replace(/\]/g, '').split(',')
    adunits.push(item);
  }

  var resp = [];

  for (var i=0; i<nUnits; i++) {
    var adunit = adunits[i];

    // should bid or not?
    var rnd = Math.random(),
      shouldBid = false;

    if (rnd < config.bidRatio) {
      shouldBid = true;
    }

    var floorPrice = config.pMin,
        maxPrice = config.pMax;
    //
    if(req.param('a' + (i+1) + 'p') && !isNaN(req.param('a' + (i+1) + 'p'))) {
      floorPrice = +req.param('a' + (i+1) + 'p');
      maxPrice = floorPrice + 4;
    }

    var price = floorPrice + Math.random() * (maxPrice - floorPrice);
    price = Math.floor(price * 100)/100;

    var bid = {};
    if (shouldBid) {
      var adType = req.param('a' + (i + 1) + 't'),
          creative = '';

      // pick an ad size to deliver creative.
      var sizes = adunit.sizes;
      var pickedSize = sizes[Math.floor(Math.random() * sizes.length)].split('x'),
          w = pickedSize[0],
          h = pickedSize[1];

      if (adType && adType === 'adap') {
        var fs = require('fs'),
            path = require('path');
            creative = fs.readFileSync(path.join(__dirname, 'assets/adaptive-genesis.html'), 'utf-8');
      } else {
        var txt = encodeURIComponent('C1X Ad ' + w + 'x' + h);
            creative = '<script>document.write(\'' + '<div><a target="_new" href="http://c1exchange.com"><img src="https://placeholdit.imgix.net/~text?txtsize=38&txt=' + txt + '&w=' + w + '&h=' + h + '&txttrack=0"></a></div>\')</script>';
      }

      bid = {
        adId: adunit.adId,
        bid: true,
        cpm: price,
        ad: creative,
        width: w,
        height: h
      };
    } else {
      bid = {
        adId: adunit.adId,
        bid: false
      };
    }

    resp.push(bid);
  }

  setTimeout(function() {
    deferred.resolve(resp);
  }, 0);

  return deferred.promise;
};