define([
    "dojo/_base/declare",
    "dojo/_base/array",
    "../common/Constants",
    ],

    function(declare, Arrays, Constants) {

        return [

            declare("Controller", null, {

                channels: null,

                constructor: function(args) {
                    declare.safeMixin(this, args);
                    console.log("[Controller] init " + this.declaredClass + " (id: " + this.id + ")");
                    this.subscribe();
                },

                channelHandler: function(message, channel) {
                    console.log("[Controller] Missing handler implementation for " + channel + " in " + this.declaredClass);
                },

                subscribe : function() {
                    if (this.channels == null) {
                        return;
                    }
                    var channelHandler = this.channelHandler;
                    Arrays.forEach(this.channels, function(channel, i) {
                        console.log("[Controller] (id: " + this.id + ") Subscribing to channel[" + i + "]: " + channel);
                        try {
                            dojo.subscribe(channel, dojo.hitch(this, channelHandler));
                            dojo.publish(Constants.TOPIC_CHANNEL_REQUEST, [{ channel: channel, source: this.id }]);
                        } catch (e) {
                            console.error("[Controller] (id: " + this.id + ") Failed to subscribe to channel " + channel + "; " + e);
                        }
                    }, this);
                },

            }),

            declare("View", null, {

                divId: null,
                parentDivId: null,

                constructor: function (args) {
                    declare.safeMixin(this, args);
                    this.preBuild();
                    this.build();
                    this.postBuild();
                },

                preBuild: function() {
                },

                build: function() {
                    console.log("[ViewBase] build() unimplemented in " + this.declaredClass);
                },

                postBuild: function() {
                },

            }),
        ];
    }
);
