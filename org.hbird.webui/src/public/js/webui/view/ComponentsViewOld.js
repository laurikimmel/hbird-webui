define([
    "dojo/_base/declare",
    "dojox/grid/DataGrid",
    "dojo/date/locale",
    "dijit/registry",
    "../common/Constants",
    "../common/Utils",
    "./ViewBase",
    ],

    function(declare, DataGrid, locale, registry, Constants, Utils, ViewBase) {

        function getStatus(component, now) {
            var limit = component.nextBeat - component.timestamp;
            var diff = now - component.nextBeat;
            return diff <= 0 ? "OK" : (diff > limit ? "Error" : "Warning");
        }

        return [
            declare("ComponentsController", Controller, {

                getId: function(component) {
                    return component.issuedBy;
                },

                channelHandler: function(message, channel) {
                    var componentId = this.getId(message);
                    if (componentId == null) {
                        return;
                    }
                    var now = new Date().getTime();
                    this.store.fetchItemByIdentity({
                        scope: this,
                        identity: componentId,
                        onItem: function(item) {
                            if (item == null) {
                                this.store.newItem({
                                    id: componentId,
                                    timestamp: message.timestamp,
                                    issuedBy: message.issuedBy,
                                    description: message.description,
                                    nextBeat: message.nextBeat,
                                    status: getStatus(message, now),
                                });
                            } else {
                                this.store.setValue(item, "timestamp", message.timestamp);
                                this.store.setValue(item, "issuedBy", message.issuedBy);
                                this.store.setValue(item, "description", message.description);
                                this.store.setValue(item, "nextBeat", message.nextBeat);
                                this.store.setValue(item, "status", getStatus(item, now));
                            }
                        }
                    });
                },
            }),

            declare("ComponentsView", View, {

                divId: "ComponentsView",
                title: "System Components",
                updateInterval: 3000,

                build: function() {
                    var grid = new DataGrid({
                            id: this.divId,
                            title: this.title,
                            store: this.store,
                            structure: [
                                { name: "Component ID", field: "issuedBy", width: "200px" },
                                { name: "Timestamp", field: "timestamp", width: "200px", formatter: Utils.formatDate, },
                                { name: "Status", field: "status", width: "200px" },
                                { name: "Description", field: "description", width: "100%" },
                            ]
                    });


                    var container = registry.byId(this.parentDivId);
                    container.addChild(grid);
                    grid.startup();

                    setInterval(dojo.hitch(this, function() {
                        var now = new Date().getTime();
                        this.store.fetch({
                            scope: this,
                            query: {},
                            onItem: function(item) {
                                if (item != null) {
                                    this.store.setValue(item, "status", getStatus(item, now));
                                }
                            },
                        });
                    }), this.updateInterval);

                },
            }),

        ];
    }
);