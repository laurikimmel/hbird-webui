define([
    "dojo/_base/declare",
    "dojox/socket",
    "dojox/socket/Reconnect",
    "../common/Constants",
    "./ProxyBase",
    ],

    function(declare, socket, reconnect, Constants, proxyBase) {

        return declare("WebSocketProxy", ProxyBase, {

            sockets: [],
            baseUrl: "",

            connect: function(channel, activeChannels) {
                try {
                    var channelUrl = this.baseUrl + channel;
                    console.log("[WebSocketProxy] connecting to " + channelUrl);
                    dojo.publish(Constants.TOPIC_CHANNEL_EVENT, [channel, "Connecting", "WebSocketProxy"]);
                    activeChannels.push(channel);
                    var socket = dojox.socket.Reconnect(dojox.socket(channelUrl));
                    dojo.hitch(this, this.listenSocket(activeChannels, channel, socket));
                }
                catch (e) {
                    dojo.publish(Constants.TOPIC_CHANNEL_EVENT, [channel, "Error", "WebSocketProxy", e]);
                    console.error("[WebSocketProxy] failed to listent WebSocket " + channel + "; " + e);
                }
            },

            listenSocket: function(activeChannels, channel, socket) {
                socket.on("open", dojo.hitch(this, this.onSocketOpen, activeChannels, channel, socket));
                socket.on("close", dojo.hitch(this, this.onSocketClose, activeChannels, channel));
                socket.on("error", dojo.hitch(this, this.onSocketError, channel));
                socket.on("message", dojo.hitch(this, this.onSocketMessage, channel));
            },

            onSocketOpen: function(activeChannels, channel, socket, event) {
                this.addSocket(channel, socket);
                console.log("[WebSocketProxy] channel " + channel + " is active now; total channels: " + activeChannels.length);
                dojo.publish(Constants.TOPIC_CHANNEL_EVENT, [channel, "Connected", "WebSocketProxy"]);
            },

            onSocketClose: function(activeChannels, channel, event) {
                var i = activeChannels.indexOf(channel);
                if (i != -1) {
                    activeChannels.splice(i, 1);
                }
                this.removeSocket(channel);
                console.log("[WebSocketProxy] channel " + channel + " closed; total channels: " + activeChannels.length);
                dojo.publish(Constants.TOPIC_CHANNEL_EVENT, [channel, "Closed", "WebSocketProxy"]);
            },

            onSocketError: function(channel, error) {
                console.error("[WebSocketProxy] socket error in channel " + channel + "; " + JSON.stringify(error));
                dojo.publish(Constants.TOPIC_CHANNEL_EVENT, [channel, "Error", "WebSocketProxy", error]);
                throw error;
            },

            onSocketMessage: function(channel, event) {
                try {
//                    console.log("[WebSocketProxy] message in channel " + channel + "; " + JSON.stringify(event.data));
                    var data = this.parseInput(event.data);
                    dojo.publish(channel, [data, channel]);
                } catch (error) {
                    console.error("[WebSocketProxy] error on delivering message in channel " + channel + "; " + error);
                    dojo.publish(Constants.TOPIC_CHANNEL_EVENT, [channel, "Error", "WebSocketProxy", error]);
                }
            },

            sendMessage: function(channel, message) {
                var socket = this.getSocket(channel);
                if (socket != null) {
                    try {
                        socket.send(message);
                    } catch (e) {
                        this.onSocketError(channel, e);
                    }
                } else {
                    console.warn("[WebSocketProxy] socket not available for channel " + channel);
                }
            },

            addSocket: function(channel, socket) {
                this.sockets[channel] = socket;
            },

            removeSocket: function(channel) {
                delete this.sockets[channel];
            },

            getSocket: function(channel) {
                return this.sockets[channel];
            },

        });
    }
);