var CONSTANTS = require('../constants.json');
var utils = require('../utils.js');
var bidfactory = require('../bidfactory.js');
var bidmanager = require('../bidmanager.js');
var adloader = require('../adloader');

/**
 * Adapter for requesting bids from C1X header tag server.
 * v0.2 (c) C1X Inc., 2016
 *
 * @param {Object} options - Configuration options for C1X
 *
 * @returns {{callBids: _callBids}}
 * @constructor
 */
var C1XAdapter = function C1XAdapter() {

    // default endpoint. Can be overridden by adding an "endpoint" property to the first param in bidder config.
    var ENDPOINT = 'http://ht.c1exchange.com:8080/ht',
      PIXEL_ENDPOINT = '//px.c1exchange.com/pubpixel/',
      PIXEL_FIRE_DELAY = 3000;

    function getSettings(key) {
      var pbjs = window.pbjs;
      if (pbjs && pbjs.bidderSettings) {
        var c1xSettings = pbjs.bidderSettings['c1x'];
        if (c1xSettings) {
          return c1xSettings[key];
        }
      }

      return null;
    }

    // inject the audience pixel only if pbjs.bidderSettings['c1x'].pixelId is set.
    function injectAudiencePixel() {
      var pixelId = getSettings('pixelId');

      if (pixelId) {
        window.setTimeout(function() {
          var pixel = document.createElement('img');
          pixel.width = 1;
          pixel.height = 1;
          var useSSL = 'https:' == document.location.protocol;
          pixel.src = (useSSL ? 'https:' : 'http:') +
            PIXEL_ENDPOINT + pixelId;

          document.body.insertBefore(pixel, null);
        }, PIXEL_FIRE_DELAY);
      }
    }

    function _callBids(params){

      injectAudiencePixel();

      // serialize all the arguments and send it to C1X header bidder.
      // example: ?site=goodsite.com&adunits=2&a1=gpt-34-banner1&a1s=[300x250]&a2=gpt-36-right-center&a2s=[300x200,300x600]

      var siteId = getSettings('siteId');
      if (!siteId) {
        console.log('c1x: error - no site id supplied!');
        return;
      }

      var bids = params.bids,
        options = ['adunits=' + bids.length];

      options.push('site=' + siteId);

      for (var i=0; i<bids.length; i++) {
        options.push('a' + (i+1) + '=' + bids[i].placementCode);
        var sizes = bids[i].sizes,
          sizeStr = sizes.reduce(function(prev, current) { return prev + (prev === '' ? '' : ',') + current.join('x') }, '')

        options.push('a' + (i+1) + 's=[' + sizeStr + ']');
      }

      options.push('rnd=' + new Date().getTime());

      var c1xEndpoint = ENDPOINT;

      if (getSettings('endpoint')) {
        c1xEndpoint = getSettings('endpoint');
      }

      if (getSettings('dspid')) {
        options.push('dspid=' + getSettings('dspid'));
      }

      var url = c1xEndpoint + '?' + options.join('&');

      window._c1xResponse = function(response) {

        for (var i=0; i<response.length; i++) {
          var data = response[i],
            bidObject = null;

          if (data.bid) {
            bidObject = bidfactory.createBid(1);
            bidObject.bidderCode = 'c1x';
            bidObject.cpm = data.cpm;
            bidObject.ad = data.ad;
            bidObject.width = data.width;
            bidObject.height = data.height;
            console.log('c1x: INFO creating bid for adunit: ' + data.adId + ' size: ' + data.width + 'x' + data.height);

          } else {
            // no bid.
            bidObject = bidfactory.createBid(2);
            bidObject.bidderCode = 'c1x';
            console.log('c1x: INFO creating a NO bid for adunit: ' + data.adId);
          }

          bidmanager.addBidResponse(data.adId, bidObject);
        }
      }

      adloader.loadScript(url);
    }

    // Export the callBids function, so that prebid.js can execute this function
    // when the page asks to send out bid requests.
    return {
        callBids: _callBids
    };
};

module.exports = C1XAdapter;