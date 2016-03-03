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

    function genAdCode(zoneId, imprURL, clickURL) {

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

      // if there is an impression tracking url, append it.
      if (imprURL) {
        adCode += '<img src="' + imprURL + '"></img>';
      }

      return adCode;
    }

    /**
     * Determine if an ad can be shown based on the key-values returned.
     *
     * @param sizes Array of sizes accepted by the ad unit. Ex: [[300,250], [728,90]]
     * @param criteoResponse Response from Criteo. Ex: "SEA300250=1;SEA900600=1" or "C1XIN300250,C1XIN300600,C1XIN336280,C1XIN97090,C1XIN970250,C1XJP970250,"
     * @returns first matching size. For example 'SEA300250'
     */
    function canShowAd(sizes, criteoResponse) {
      var sizeStrs = sizes.map(function(s) { return s[0] + '' + s[1]; }),
        criteoSizes = criteoResponse.split(',').map(function(s) { return s.replace('=1', ''); });

      for (var i=0; i<sizeStrs.length; i++) {
        for (var j=0; j<criteoSizes.length; j++) {
          if (criteoSizes[j].indexOf(sizeStrs[i]) != -1) {

            // there may be multiple matches, but we pick the first one.
            return criteoSizes[j];
          }
        }
      }

      return false;
    }

    function _callBids(params){

      window.console.log(params);

      // these should ideally be defined once per provider, but the way it is configured in Prebid.js, we have to specify for all ad units. We pick from the first config.
      var props = params.bids[0].params,
        crtg_nid = props.nid,
        crtg_cookiename = props.cookieName,
        crtg_varname = props.varName;

      // as-is from the criteo tag.
      function crtg_getCookie(c_name){ var i,x,y,ARRCookies=document.cookie.split(";");for(i=0;i<ARRCookies.length;i++){x=ARRCookies[i].substr(0,ARRCookies[i].indexOf("="));y=ARRCookies[i].substr(ARRCookies[i].indexOf("=")+1);x=x.replace(/^\s+|\s+$/g,"");if(x==c_name){return unescape(y);} }return'';}
      var crtg_content = crtg_getCookie(crtg_cookiename);
      var crtg_rnd=Math.floor(Math.random()*99999999999);

      var crtg_url=location.protocol+ RTA_ENDPOINT + '?netId='+escape(crtg_nid);
      crtg_url +='&cookieName='+escape(crtg_cookiename);
      crtg_url +='&rnd='+crtg_rnd;
      crtg_url +='&varName=' + escape(crtg_varname);

      // Call to RTA to determine what sizes we can bid for.
      adloader.loadScript(crtg_url, function() {

        // the call to RTA asynchronously returns here.
        // iterate over all ad slots for which this adapter is configured for.
        // window[crtg_varname] = 'C1XIN300250,C1XIN300600,C1XIN336280,C1XIN72890,C1XIN970250,C1XJP970250,';
        window.console.log('c1x-criteo INFO: criteo response - ' + window[crtg_varname]);

        for (var i=0; i<params.bids.length; i++) {
          var thisBid = params.bids[i],
            adId = thisBid.placementCode,
            adunitSizes = thisBid.sizes,  // ad unit sizes
            zoneMappings = thisBid.params.zoneMap;

          window.console.log('c1x-criteo INFO: ad id: ' + adId + ', sizes: ' + adunitSizes);

          if (!zoneMappings) {
            console.log('c1x-criteo WARNING: No zone mapping found! Please check configuration');
            break;
          }

          var showAdCode = canShowAd(adunitSizes, window[crtg_varname]),
            bidObject = null;

          pbjs.criteo = {
            response: window[crtg_varname]
          };

          if (showAdCode) {
            var zoneMapping = zoneMappings[showAdCode],
              zoneId = zoneMapping.id,
              cpm = zoneMapping.cpm;

            if (zoneId) {

              // create bid.
              console.log('c1x-criteo INFO creating a valid bid for adunit: ' + adId + ' size: ' +showAdCode);
              bidObject = bidfactory.createBid(1);
              bidObject.bidderCode = 'c1x-criteo';
              bidObject.cpm = cpm;
              bidObject.ad = genAdCode(zoneId, thisBid.params.imprURL, thisBid.params.clickURL);

              console.log(bidObject.ad);

              // get the ad size based on the ad code returned from Criteo. Remove the leading region code.
              var size = zoneMapping.size;
              if (size) {
                bidObject.width = size[0];
                bidObject.height = size[1];
              } else {
                // we don't abort as it is not critical. Criteo might still get the right creative based on the zone Id.
                console.log('c1x-criteo WARNING: could not determine IAB ad size for ' + showAdCode);
              }

            } else {
              console.log('c1x-criteo WARNING: could not determine zone id for ' + showAdCode);
            }
          }

          if (!bidObject) {

            // no bid.
            bidObject = bidfactory.createBid(2);
            console.log('c1x-criteo INFO creating a NO bid for adunit: ' + adId + ' size: ' +showAdCode);
            bidObject.bidderCode = 'c1x-criteo';
          }

          console.log('c1x-criteo adding response: ', bidObject);
          bidmanager.addBidResponse(adId, bidObject);

        }
      });

    }

    // Export the callBids function, so that prebid.js can execute this function
    // when the page asks to send out bid requests.
    return {
        callBids: _callBids
    };
};

module.exports = C1XCriteoAdapter;