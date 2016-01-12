var CONSTANTS = require('../constants.json');
var utils = require('../utils.js');
var bidfactory = require('../bidfactory.js');
var bidmanager = require('../bidmanager.js');
var adloader = require('../adloader');

/**
 * Adapter for requesting bids from C1X header tag server.
 *
 * @param {Object} options - Configuration options for C1X
 *
 * @returns {{callBids: _callBids}}
 * @constructor
 */
var C1XAdapter = function C1XAdapter() {

    // default endpoint. Can be overridden by adding an "endpoint" property to the first param in bidder config.
    var ENDPOINT = 'http://ht.c1exchange.com/target';

    function _callBids(params){

      // serialize all the arguments and send it to C1X header bidder.
      // example: ?site=goodsite.com&adunits=2&a1=gpt-34-banner1&a1s=[300x250]&a2=gpt-36-right-center&a2s=[300x200,300x600]
      var bids = params.bids,
        options = ['adunits=' + bids.length];

      for (var i=0; i<bids.length; i++) {
        options.push('a' + (i+1) + '=' + bids[i].placementCode);
        var sizes = bids[i].sizes,
          sizeStr = sizes.reduce(function(prev, current) { return prev + (prev === '' ? '' : ',') + current.join('x') }, '')

        options.push('a' + (i+1) + 's=[' + sizeStr + ']');
      }

      options.push('rnd=' + new Date().getTime());

      var c1xEndpoint = ENDPOINT;

      if (bids[0].params && bids[0].params.endpoint) {
        c1xEndpoint = bids[0].params.endpoint;
      }

      if (bids[0].params && bids[0].params.site) {
        options.push('site=' + bids[0].params.site);
      }

      var url = c1xEndpoint + '?' + options.join('&');

      window._c1xResponse = function(response) {

        for (var i=0; i<response.length; i++) {
          var data = response[i];
          if (data.bid) {
            var bidObject = bidfactory.createBid(1);
            bidObject.bidderCode = 'c1x';
            bidObject.cpm = data.cpm;
            bidObject.ad = data.ad;
            bidObject.width = data.width;
            bidObject.height = data.height;
            bidmanager.addBidResponse(data.adId, bidObject);
          }
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