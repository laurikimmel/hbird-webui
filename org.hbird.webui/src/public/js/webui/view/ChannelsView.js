define([
    "dojo/_base/declare",
    "dojox/grid/DataGrid",
    "dojo/date/locale",
    "dojo/aspect",
    "../common/Constants",
    "../common/Utils",
    "../net/ProxyBase",
    "./ViewBase",
    ],

    function(declare, DataGrid, locale, aspect, Constants, Utils, ProxyBase, ViewBase) {

        function toString(statusMessage) {
            return statusMessage == null ? "" : statusMessage;
        }

        return [
            declare("ChannelsController", [ProxyBase, Controller], {

                constructor: function(args) {
                    dojo.subscribe(Constants.TOPIC_CHANNEL_EVENT, dojo.hitch(this, this.handleChannelEvent));
                },

                connect: function(channel, activeChannels) {
                    dojo.subscribe(channel, dojo.hitch(this, this.channelHandler));
                    console.log("[ChannelsController] added new channel " + channel);
                    activeChannels.push(channel);
                },

                handleChannelEvent: function(channel, status, source, statusMessage) {
                    try {
                        this.store.fetchItemByIdentity({
                            scope: this,
                            identity: channel,
                            onItem: function(item) {
                                if (item == null) {
                                    this.store.newItem({
                                        channel: channel,
                                        timestamp: new Date().getTime(),
                                        counterIn: 0,
                                        counterOut: 0,
                                        status: status,
                                        statusMessage: toString(statusMessage),
                                        source: source,
                                    });
                                } else {
                                    this.store.setValue(item, "timestamp", new Date().getTime());
                                    this.store.setValue(item, "status", status);
                                    this.store.setValue(item, "statusMessage", toString(statusMessage));
                                    this.store.setValue(item, "source", source);
                                }
                            },
                            onError: function(er) {
                                console.error(er);
                            }
                        });
                    }
                    catch (e) {
                        console.error("[ChannelsController] Failed to handle channel event " + channel + "; status: " + status + "; " + e);
                    }
                },

                channelHandler: function(message, channel) {
//                    console.log("[ChannelsController] channel: " + channel + "; message: " + message);

                    try {
                        this.store.fetch({ query: { channel: channel },
                            scope: this,
                            onBegin: function(size, request) {
                                if (size == 0) {
                                    var item = {};
                                    item.channel = channel;
                                    item.timestamp = new Date().getTime();
                                    item.counterIn = 1;
                                    item.counterOut = 0;
                                    item.status = "OK";
                                    this.store.newItem(item);
                                }
                            },
                            onItem: function(item) {
                                this.store.setValue(item, "timestamp", new Date().getTime());
                                this.store.setValue(item, "counterIn", parseInt(item.counterIn) + 1);
                            },
                            onError: function(er) {
                                console.error(er);
                            }
                        });
                    }
                    catch (e) {
                        console.error("[ChannelsController] Failed to handle message on channel " + channel + "; " + e);
                    }

                },

                sendMessage: function(channel, message) {
                    try {
                        this.store.fetch({ query: { channel: channel },
                            scope: this,
                            onBegin: function(size, request) {
                                if (size == 0) {
                                    var item = {};
                                    item.channel = channel;
                                    item.timestamp = new Date().getTime();
                                    item.counterIn = 0;
                                    item.counterOut = 1;
                                    item.status = "OK";
                                    this.store.newItem(item);
                                }
                            },
                            onItem: function(item) {
                                this.store.setValue(item, "timestamp", new Date().getTime());
                                this.store.setValue(item, "counterOut", parseInt(item.counterOut) + 1);
                            },
                            onError: function(er) {
                                console.error(er);
                            }
                        });
                    }
                    catch (e) {
                        console.error("[ChannelsController] Failed to handle message on channel " + channel + "; " + e);
                    }

                }
            }),

            declare("ChannelsView", View, {

                divId: "ChannelsView",
                title: "Channels",

                build: function() {

                    var grid = new DataGrid({
                            id: this.divId,
                            title: this.title,
                            store: this.store,
                            structure: [
                                { field: "channel", name: "Channel", width: "200px" },
                                { field: "status", name: "Status", width: "100px" },
                                { field: "counterIn", name: "In", width: "100px" },
                                { field: "counterOut", name: "Out", width: "100px" },
                                { field: "timestamp", name: "Last Message", width: "200px", formatter: Utils.formatDate, },
                                { field: "source", name: "Source", width: "200px" },
                                { field: "statusMessage", name: "Status Message", width: "100%" },
                            ],
                    });

                    var container = dijit.byId(this.parentDivId);
                    container.addChild(grid);
                    grid.startup();

                },
            }),

        ];
    }
);