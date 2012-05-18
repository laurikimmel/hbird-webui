define(
    ["dojo/_base/declare",
     "dojox/grid/DataGrid",
     "dojox/uuid/Uuid",
     "dojox/uuid/generateRandomUuid",
     "../common/Constants",
     "../common/Utils",
     "./ViewBase",
    ],

    function(declare, DataGrid, Uuid, generateRandomUuid,  Constants, Utils, ViewBase) {

        var counter = 0;

        return [

            declare("LogController", Controller, {

                historyLimit: 10,

                channelHandler: function(message, channel) {
//                    console.log("[LogController] message on channel " + channel + ": " + JSON.stringify(message));
                    if (this.store != null) {
                        this.store.newItem({
                            storeId: generateRandomUuid(),
                            message: message.renderedMessage,
                            timestamp: message.timeStamp,
                        });

                        counter ++;
                        if (counter > this.historyLimit) {
                            // first query is for getting the number of stored items
                            this.store.fetch({
                                query: {},
                                start: 0,
                                count: 0,
                                onBegin: dojo.hitch(this, function(size, request) {
                                    // now we have the number of stored items
                                    // fetch all "below" limit and remove them
                                    this.store.fetch({
                                        count: (size - this.historyLimit), // diff between limit and actual size
                                        onItem: dojo.hitch(this, function(item) {
                                            this.store.deleteItem(item);
                                        }),
                                    });
                                }),
                            });
                        }
                    }
                },
            }),

            declare("LogView", View, {

                divId: "LogView",
                title: "Log",

                build: function() {

                    var grid = new DataGrid({
                            id: this.divId,
                            title: this.title,
                            store: this.store,
                            structure: [
                                { name: "Timestamp", field: "timestamp", width: "200px", formatter: Utils.formatDate, },
                                { name: "Message", field: "message", width: "100%" },
                            ],
                    });

                    var container = dijit.byId(this.parentDivId);
                    container.addChild(grid);
                    grid.startup();

                },
            }),

        ];
});