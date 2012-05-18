define([
    "dojo/_base/declare",
    "dojox/cometd/_base",
    "../common/Constants",
    "./ProxyBase",
    ],

    /*
     * Cometd is not working in dojo 1.7.2 with AMD =|
     *
     * http://www.google.ee/search?q=dojo+1.7.2+cometd
     */
    function(declare, cometd, Constants, proxyBase) {

        return declare("CometProxy", ProxyBase, {

            url: "http://localhost:9494/cometd",
            isConnected: false,

            constructor: function(args) {
                this.initCometConnection();
            },

            initCometConnection: function() {
                console.log("[CometProxy] connecting to " + this.url);
                try {
                    dojox.cometd.init(this.url);
                    this.isConnected = true;
                } catch (e) {
                    console.error("[CometProxy] connecting to " + this.url + " failed!");
                    console.error(e);
                }
            },

            connect: function(channel, activeChannels) {
                if (!this.isConnected) { // TODO - use dojo.cometd.state() here
                    dojo.publish(Constants.TOPIC_CHANNEL_EVENT, [channel, "Error", "CometProxy", "CometProxy no connection to the server"]);
                    console.error("[CometProxy] failed to listent channel " + channel + "; No connection to the server.");
                    return;
                }
                try {
                    console.log("[CometProxy] connecting to " + channel);

                    var handle = dojox.cometd.subscribe(channel, function(message) {
                        // console.log("[ConnectionManager] received " + JSON.stringify(message));
                        // console.log("[ConnectionManager] received " + message.channel + ": " + JSON.parse(message.data));
                        try {
                            var data = JSON.parse(message.data);
                            dojo.publish(message.channel, [data, message.channel]);
                        }
                        catch (e) {
                            console.error("[CometProxy] error: " + e + "; channel: " + message.channel + "; message: " + JSON.stringify(message));
                        }
                    });

                    handle.addCallback(dojo.hitch(this, function() {
                        dojo.publish(Constants.TOPIC_CHANNEL_EVENT, [channel, "Connected", "CometProxy"]);
                        console.log("[CometProxy] channel " + handle.args[0] + " is active now; total channels " + this.activeChannels.length);
                    }));
                    activeChannels.push(channel);
                    dojo.publish(Constants.TOPIC_CHANNEL_EVENT, [channel, "Connecting", "CometProxy"]);
                    console.log("[CometProxy] added new channel: " + channel);
                }
                catch (e) {
                    dojo.publish(Constants.TOPIC_CHANNEL_EVENT, [channel, "Error", "CometProxy", e]);
                    console.error("[CometProxy] failed to listent channel " + channel + "; " + e);
                }
            },

            sendMessage: function(channel, message) {
                try {
                    dojox.cometd.publish(channel, message);
                } catch (e) {
                    dojo.publish(Constants.TOPIC_CHANNEL_EVENT, [channel, "Error", "CometProxy", e]);
                    console.log("[CometProxy] failed to send message " + JSON.stringify(message) + " to channel " + channel);
                }
            },

        });
    }
);