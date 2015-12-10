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

    function _callBids(params){
      window.console.log('Sending bids');
      window.console.log(params);
      var adUnitCode = params.bids[0].placementCode,
        scriptUrl = 'c1x-mock-bidder.js';

      window._c1xResponse = function(data) {
        console.log('calling bid response with data: ', data);
        var bidObject = bidfactory.createBid(1);
        bidObject.bidderCode = 'c1x';
        bidObject.cpm = data.cpm;
        bidObject.ad = data.ad;
        bidObject.width = data.width;
        bidObject.height = data.height;

        //send the bidResponse object to bid manager with the adUnitCode.
        bidmanager.addBidResponse(adUnitCode, bidObject);
      }

      adloader.loadScript(scriptUrl);

      /*
      setTimeout(function() {
        var bidObject = bidfactory.createBid(1);
        bidObject.bidderCode = 'c1x';
        bidObject.cpm = 1.50;
        bidObject.ad = '<div><img src="http://c1x.s3.amazonaws.com/ads/house/banner300x250/c1x-ad2.jpg"></div>';
        bidObject.width = 300;
        bidObject.height = 250;

        //send the bidResponse object to bid manager with the adUnitCode.
        bidmanager.addBidResponse(adUnitCode, bidObject);
      }, 300); */
    }

    // Export the callBids function, so that prebid.js can execute this function
    // when the page asks to send out bid requests.
    return {
        callBids: _callBids
    };
};

module.exports = C1XAdapter;