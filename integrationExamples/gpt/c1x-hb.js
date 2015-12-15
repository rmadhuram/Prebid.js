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
        var d = document, pbs = d.createElement("script"), pro = d.location.protocal;
        pbs.type = "text/javascript";
        pbs.src = '../../dist/prebid.js';
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
	   var adUnits = [{
        code: 'div-gpt-ad-1446192128868-0',
        sizes: [[300, 250]],
        bids: [
           {
             bidder: 'c1x',
             params: {
               endpoint: 'http://mymac.c1exchange.com:9000/bid',
               site: 'pubdemo.c1exchange.com'
             }
           }
        ]
    },{
        code: 'div-gpt-ad-1446192128868-1',
        sizes: [[728, 90], [970, 90]],
        bids: [
           {
              bidder: 'c1x',
              params: {
                site: 'pubdemo.c1exchange.com'
              }
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
