var CONSTANTS = require('../constants.json');
var utils = require('../utils.js');
var bidfactory = require('../bidfactory.js');
var bidmanager = require('../bidmanager.js');
var adloader = require('../adloader');

/**
 * Criteo adapter developed by C1X.
 * First a call is made to the rta endpoint to determine if a Criteo ad can be shown.
 * If so, it makes the call to ajs.php to retrieve the creative code.
 *
 * @author Raj Madhuram
 * (c) C1X Inc. 2016.
 *
 * @param {Object} options - Configuration options for Criteo adapter.
 *   options.cpm - Fixed CPM
 *   options.nid - Network ID
 *   options.zoneMap - The mapping between the strings returned from Criteo & zoneId. It could be something like:
 *       {
 *          'SEA300250':  329125,
 *          'SEA300600':  342628,
 *          'SEA160600':  342629,
 *          'SEA72890' :  342630,
 *          'SEA32050' :  342631
 *       }
 *
 * @returns {{callBids: _callBids}}
 * @constructor
 */
var C1XCriteoAdapter = function C1XCriteoAdapter() {

    // Criteo end points.
    var DELIVERY_ENDPOINT = '//cas.criteo.com/delivery/ajs.php';
    var RTA_ENDPOINT = '//rtax.criteo.com/delivery/rta/rta.js';

    function genAdCode(zoneId, clickURL) {

      var rnd = Math.floor(Math.random()*99999999999);

      var adCode = '<script type="text/javascript" src="' +  location.protocol;
      adCode += DELIVERY_ENDPOINT + '?zoneid=' + zoneId;
      adCode += '&cb=' + rnd;

      if (document.MAX_used && document.MAX_used != ',') {
        adCode += '&exclude=' + document.MAX_used;
      }

      if (document.charset) {
        adCode += '&charset=' + document.charset;
      }

      adCode += '&loc=' + escape(window.location).substring(0,1600);

      if (document.context) {
        adCode += '&context=' + document.context;
      }

      if (clickURL) {
        adCode += '&ct0=' + escape(clickURL);
      }

      if (document.mmm_fo) {
        adCode += '&mmm_fo=1';
      }

      adCode += '</script>';

      return adCode;
    }

    /**
     * Determine if an ad can be shown based on the key-values returned.
     *
     * @param sizes Array of sizes accepted by the ad unit. Ex: [[300,250], [728,90]]
     * @param criteoResponse Response from Criteo. Ex: "SEA300250=1;SEA900600=1"
     */
    function canShowAd(sizes, criteoResponse) {
      var sizeStrs = sizes.map(function(s) { return s[0] + '' + s[1]; }),
        criteoSizes = criteoResponse.split(';').map(function(s) { return s.replace('=1', ''); });

      for (var i=0; i<sizeStrs.length; i++) {
        for (var j=0; j<criteoSizes.length; j++) {
          if (criteoSizes[j].indexOf(sizeStrs[i]) != -1) {
            return criteoSizes[j];
          }
        }
      }

      return false;
    }

    function _callBids(params){

      // We will only consider one ad unit for Criteo at the time being.
      var bids = params.bids;
      if (bids.length > 1) {
        window.console.log('Multiple bids from Criteo not supported. Taking the first ad unit only.')
      }

      var bidParams = bids[0],
        adId = bidParams.placementCode,
        adunitSizes = bidParams.sizes,
        zoneMappings = bidParams.params.zoneMap;

      if (!zoneMappings) {
        console.log('c1x-criteo WARNING: No zone mapping found!');
      }

      console.log(bidParams);

      // parametrize these
      var crtg_nid = bidParams.params.nid;
      var crtg_cookiename = 'crtg_rta';
      var crtg_varname = 'crtg_content';


      function crtg_getCookie(c_name){ var i,x,y,ARRCookies=document.cookie.split(";");for(i=0;i<ARRCookies.length;i++){x=ARRCookies[i].substr(0,ARRCookies[i].indexOf("="));y=ARRCookies[i].substr(ARRCookies[i].indexOf("=")+1);x=x.replace(/^\s+|\s+$/g,"");if(x==c_name){return unescape(y);} }return'';}
      var crtg_content = crtg_getCookie(crtg_cookiename);
      var crtg_rnd=Math.floor(Math.random()*99999999999);

      var crtg_url=location.protocol+ RTA_ENDPOINT + '?netId='+escape(crtg_nid);
      crtg_url +='&cookieName='+escape(crtg_cookiename);
      crtg_url +='&rnd='+crtg_rnd;
      crtg_url +='&varName=' + escape(crtg_varname);

      adloader.loadScript(crtg_url, function(response) {
        var showAdCode = canShowAd(adunitSizes, window[crtg_varname]),
          bidObject;

        if (showAdCode) {
          var zoneId = zoneMappings[showAdCode];
          if (zoneId) {

            // create bid.
            bidObject = bidfactory.createBid(1);
            bidObject.bidderCode = 'c1x-criteo';
            bidObject.cpm = bidParams.params.cpm;
            bidObject.ad = genAdCode(zoneId);
            bidObject.width = 300;
            bidObject.height = 250;
          } else {
            console.log('c1x-criteo WARNING: could not determine zone id for ' + showAdCode);
          }
        }

        if (!bidObject) {

          // no bid.
          bidObject = bidfactory.createBid(2);
          bidObject.bidderCode = 'c1x-criteo';
        }

        bidmanager.addBidResponse(adId, bidObject);

      });

    }

    // Export the callBids function, so that prebid.js can execute this function
    // when the page asks to send out bid requests.
    return {
        callBids: _callBids
    };
};

module.exports = C1XCriteoAdapter;