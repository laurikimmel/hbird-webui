define([
    "dojo/_base/declare",
    "../common/Constants",
    ],

    function(declare, Constants) {

        var JSON_STRING_FIXES = {
            "NaN": "\"-\"",
        };

        return declare("ProxyBase", null, {

            constructor: function(args) {
                declare.safeMixin(this, args);
                console.log("[ProxyBase] init");
                this.activeChannels = [];
                dojo.subscribe(Constants.TOPIC_CHANNEL_REQUEST, dojo.hitch(this, this.subscribeToChannel));
                dojo.subscribe(Constants.TOPIC_CHANNEL_SEND_MESSAGE, dojo.hitch(this, this.sendMessage));
            },

            connect: function(channel, activeChannels) {
                console.warn("[ProxyBase] connect(channel, activeChannels) not implemented in " + this.declaredClass);
            },

            sendMessage: function(channel, message) {
                console.warn("[ProxyBase] sendMessage(channel, message) not implemented in " + this.declaredClass);
            },

            subscribeToChannel: function(subscription) {
                if (subscription == null) {
                    console.error("[ProxyBase] void channel subscription!");
                    return;
                }

                if (subscription.channel == null) {
                    console.error("[ProxyBase] invalid channel subscription!" + JSON.stringify(subscription));
                    return;
                }

                console.log("[ProxyBase] new channel subscription " + subscription.channel + "; source: " + subscription.source);

                var existing = dojo.filter(this.activeChannels, function(channel) {
                    return channel == subscription.channel;
                });

                if (existing.length > 0) {
                    console.log("[ProxyBase] channel " + subscription.channel + " already active ");
                    return;
                }

                if (this.connect != null) {
                    console.log("[ProxyBase] adding channel " + subscription.channel);
                    dojo.hitch(this, this.connect(subscription.channel, this.activeChannels));
                }
            },

            parseInput: function(input) {
                try {
                    return JSON.parse(input);
                } catch (e) {
                    return this.parseInvalidInput(input);
                }
            },

            parseInvalidInput: function(input) {
                var tmp = input;
                for (key in JSON_STRING_FIXES) {
                    tmp = tmp.replace(key, JSON_STRING_FIXES[key]);
                }
                try {
                    return JSON.parse(tmp);
                } catch (e) {
                    console.error("JSON parse exception " + e + "\nInput: " + tmp);
                }
            },

        });

    }
);