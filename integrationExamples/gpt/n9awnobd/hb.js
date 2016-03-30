// http://hindi.webdunia.com/hindi-news

    /** Pixel insertion code **/
    (function() {
        var pixel = document.createElement('img');
        pixel.width = 1;
        pixel.height = 1;
        var useSSL = 'https:' == document.location.protocol;
        pixel.src = (useSSL ? 'https:' : 'http:') +
        '//s6-pixel.c1exchange.com/pubpixel/82739';
        setTimeout(function() {
          document.body.insertBefore(pixel, null);
        }, 100);

    })();

    var PREBID_TIMEOUT = 700;

    var googletag = googletag || {};
    googletag.cmd = googletag.cmd || [];

    /* pbjs.initAdserver will be called either when all bids are back, or
       when the timeout is reached.
    */
    function initAdserver() {
        if (pbjs.initAdserverSet) return;
        //load GPT library here
        (function() {
            var gads = document.createElement('script');
            gads.async = true;
            gads.type = 'text/javascript';
            var useSSL = 'https:' == document.location.protocol;
            gads.src = (useSSL ? 'https:' : 'http:') +
            '//www.googletagservices.com/tag/js/gpt.js';
            var node = document.getElementsByTagName('script')[0];
            node.parentNode.insertBefore(gads, node);
        })();
        pbjs.initAdserverSet = true;
    };
    // Load GPT when timeout is reached.
    setTimeout(initAdserver, PREBID_TIMEOUT);

    var pbjs = pbjs || {};
    pbjs.que = pbjs.que || [];

    // Load the Prebid Javascript Library Async. We recommend loading it immediately after
    // the initAdserver() and setTimeout functions.
    (function() {
        var d = document, pbs = d.createElement("script"), pro = d.location.protocol;
        pbs.type = "text/javascript";

        var useSSL = 'https:' == document.location.protocol;
        pbs.src = (useSSL ? 'https:' : 'http:') + '//c1x.s3.amazonaws.com/headertag/prebid.min.js';
        var target = document.getElementsByTagName("head")[0];
        target.insertBefore(pbs, target.firstChild);
    })();


    pbjs.que.push(function(){

    	/* 1. Register bidder tag Ids

        Registers the bidder tags for your ad units. Once the prebid.js
        library loads, it reads the pbjs.adUnits object and sends out
        bid requests. Find the complete reference on bidders at
        http://prebid.org/bidders.html.

        code:  Your GPT slot’s ad unit path. If they don’t match, prebid.js
               would not be able to set targeting correctly
        sizes: All sizes your ad unit accepts. They should match with GPT.

        */

     var criteoZoneMap = {
        'C1XIN120600': {id: 358823, size: [120, 600], cpm: 0.6},
        'C1XIN160600': {id: 358824, size: [160, 600], cpm: 0.6},
        'C1XIN300250': {id:	358825, size: [300, 250], cpm: 0.6},
        'C1XIN300600': {id:	358826, size: [300, 600], cpm: 0.6},
        'C1XIN72890' : {id: 358827, size: [728, 90], cpm: 0.6},
        'C1XIN336280': {id: 358828, size: [336, 280], cpm: 0.6},
        'C1XIN97090' : {id: 358829, size: [970, 90], cpm: 0.6},
        'C1XIN970250': {id: 358830, size: [970, 250], cpm: 0.6},
        'C1XIN32050' : {id: 358831, size: [320, 50], cpm: 0.6},
        'C1XUS120600': {id: 358832, size: [120, 600], cpm: 3.5},
        'C1XUS160600': {id: 358833, size: [160, 600], cpm: 3.5},
        'C1XUS300250': {id: 358834, size: [300, 250], cpm: 3.5},
        'C1XUS300600': {id: 358835, size: [300, 600], cpm: 3.5},
        'C1XUS72890' : {id: 358836, size: [728, 90], cpm: 3.5},
        'C1XUS336280': {id: 358837, size: [336, 280], cpm: 3.5},
        'C1XUS97090' : {id: 358838, size: [970, 90], cpm: 3.5},
        'C1XUS970250': {id: 358839, size: [970, 250], cpm: 3.5},
        'C1XUS32050' : {id: 358840, size: [320, 50], cpm: 3.5},
        'C1XJP120600': {id: 358842, size: [120, 600], cpm: 1.0},
        'C1XJP160600': {id: 358843, size: [160, 600], cpm: 1.0},
        'C1XJP300250': {id: 358844, size: [300, 250], cpm: 1.0},
        'C1XJP300600': {id: 358845, size: [300, 600], cpm: 1.0},
        'C1XJP72890' : {id: 358846, size: [728, 90], cpm: 1.0},
        'C1XJP336280': {id: 358847, size: [336, 280], cpm: 1.0},
        'C1XJP97090' : {id: 358848, size: [970, 90], cpm: 1.0},
        'C1XJP970250': {id:	358849, size: [970, 250], cpm: 1.0},
        'C1XJP32050' : {id: 358850, size: [320, 50], cpm: 1.0}
     };

     function genCriteoParams(imprURL, clickURL) {
       return {
         nid: '4988',
         cookieName: 'crtg_rta',
         varName: 'crtg_content',
         zoneMap: criteoZoneMap,
         imprURL: imprURL,
         clickURL: clickURL
       };
     }



	   var adUnits = [{
        code: 'div-gpt-ad-1422880866248-0',
        sizes: [[728, 90]],
        bids: [
           {
            bidder: 'c1x-criteo',
            params: genCriteoParams('http://s6-pixel.c1exchange.com/pubpixel/99991','http://s6-pixel.c1exchange.com/pubpixel/99993?')
           }
        ]
    },{
        code: 'div-gpt-ad-1402916359723-0',
        sizes: [[300, 250]],
        bids: [
           {
            bidder: 'c1x-criteo',
            params: genCriteoParams('http://s6-pixel.c1exchange.com/pubpixel/99992','http://s6-pixel.c1exchange.com/pubpixel/99994?')
           }
        ]
    }];

    //add the adUnits
    pbjs.addAdUnits(adUnits);

    //register a callback handler
    pbjs.addCallback('adUnitBidsBack', function(adUnitCode){
            console.log('ad unit bids back for : ' + adUnitCode);
        });

     /* Request bids for the added ad units. If adUnits or adUnitCodes are
           not specified, the function will request bids for all added ad units.
    */
    pbjs.requestBids({

            /* The bidsBack function will be called when either timeout is
               reached, or when all bids come back, whichever happens sooner.
            */
            bidsBackHandler: function(bidResponses) {
                initAdserver();
            }

            /* You can specify specific `adUnitCodes` to only request bids
               for certain ad units.
               adUnitCodes: ['code1', 'code2']
            */

            /* You can also make one off bid requests for the given `adUnits`.
               adUnits: [adUnit2, adUnit1]
            */

            /* The bidsBackHandler will be executed either when all bids are
               back, or when the timeout is reached.
               timeout: 1000
            */
    });


    /* 2. Configure Ad Server Targeting

    The below section defines what key value targeting will be sent to GPT.
    For each bidder’s bid, Prebid.js will set the below 4 keys (hb_bidder,
    hb_adid, hb_pb, hb_size) with their corresponding values.

    Bidders all have different recommended ad server line item targeting and
    creative setup. To remove the headache for you, Prebid.js has a default
    recommended query string targeting setting for all bidders.

    If you’d like to customize the key value pairs, you can overwrite the settings
    as the below example shows. Let your ad ops team know about the change, so they
    can update the line item targeting accordingly.

    */

    pbjs.bidderSettings = {
        standard: {
            adserverTargeting: [{
                key: "hb_bidder",
                val: function(bidResponse) {
                    return bidResponse.bidderCode;
                }
            }, {
                key: "hb_adid",
                val: function(bidResponse) {
                    return bidResponse.adId;
                }
            }, {
                key: "hb_pb",
                val: function(bidResponse) {
                    return bidResponse.pbLg;
                }
            }
            ]
        },
        "c1x-criteo": {
            adserverTargeting: [{
                key: "hb_bidder",
                val: function(bidResponse) {
                    return bidResponse.bidderCode;
                }
            }, {
                key: "hb_adid",
                val: function(bidResponse) {
                    return bidResponse.adId;
                }
            }, {
                key: "hb_pb",
                val: function(bidResponse) {
                    return bidResponse.pbHg;
                }
            }
            ]
        },
        appnexus: {
            alwaysUseBid : true, // <-- new field - always send these custom keys for the specified bidder
            adserverTargeting: [{
                key: "custom_bidder",
                val: function(bidResponse) {
                    return bidResponse.bidderCode;
                }
            }, {
                key: "custom_adid",
                val: function(bidResponse) {
                    return bidResponse.adId;
                }
            }, {
                key: "custom_pb",
                val: function(bidResponse) {
                    return bidResponse.pbMg;
                }
            }, {
                key: "custom_size",
                val: function(bidResponse) {
                    return bidResponse.getSize();

                }
            }]
        }
    };

});
