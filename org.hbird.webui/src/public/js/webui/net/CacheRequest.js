define([
    "dojo/_base/declare",
    "../common/Constants",
    ],

    function(declare, Constants) {

        return declare("CacheRequest", null, {

            channels: null, // if not set all channels are accepted
            delay: 1000, // default delay 1 sec.

            constructor: function(args) {
                declare.safeMixin(this, args);
                console.log("[CacheRequest] init");
                dojo.subscribe(Constants.TOPIC_CHANNEL_EVENT, dojo.hitch(this, this.handleChannelEvent));
            },

            handleChannelEvent: function(channel, type, source) {
                if (type == "Connected") {
                    if (this.channels == null || this.channels.indexOf(channel) > -1) {
                        console.log("[CacheRequest] scheduling cache request for channel " + channel + " with timeout " + this.delay + " ms");
                        setTimeout(function() {
                            console.log("[CacheRequest] requesting cache for " + channel);
                            dojo.publish(Constants.TOPIC_CHANNEL_SEND_MESSAGE, [channel, "cache"]);
                        }, this.delay);
                    }
                }
            },
        });
    }
);