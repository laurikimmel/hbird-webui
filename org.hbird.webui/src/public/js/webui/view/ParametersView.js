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

        return [
            declare("ParametersController", Controller, {
                channelHandler: function(message, channel) {
//                    console.log("[ParametersController] channel: " + channel + "; message: " + message);
                    var parameterId = Utils.getParameterId(message);
                    this.store.fetchItemByIdentity({
                        scope: this,
                        identity: parameterId,
                        onItem: function(item) {
                            if (item == null) {
                                this.store.newItem({
                                    storeId: parameterId,
                                    name: message.name,
                                    value: message.value,
                                    timestamp: message.timestamp,
                                    issuedBy: message.issuedBy,
                                    unit: message.unit,
                                    description: message.description,
                                    datasetidentifier: message.datasetidentifier,
                                });
                            } else {
                                this.store.setValue(item, "value", message.value);
                                this.store.setValue(item, "timestamp", message.timestamp);
                                this.store.setValue(item, "issuedBy", message.issuedBy);
                                this.store.setValue(item, "unit", message.unit);
                                this.store.setValue(item, "description", message.description);
                                this.store.setValue(item, "datasetidentifier", message.datasetidentifier);
                            }
                        }
                    });

                },
            }),

            declare("ParametersView", View, {

                divId: "ParametesView",
                title: "Parameters",

                build: function() {
                    var grid = new DataGrid({
                            id: this.divId,
                            title: this.title,
                            store: this.store,
                            structure: [
                                { name: "Source", field: "issuedBy", width: "200px" },
                                { name: "Name", field: "name", width: "300px" },
                                { name: "Value", field: "value", width: "200px" },
                                { name: "Unit", field: "unit", width: "100px" },
                                { name: "Timestamp", field: "timestamp", width: "200px", formatter: Utils.formatDate, },
                                { name: "Data Set", field: "datasetidentifier", width: "140px" },
                                { name: "Description", field: "description", width: "100%" },
                            ],
                    });

                    var container = registry.byId(this.parentDivId);
                    container.addChild(grid);
                    grid.startup();

                },
            }),

        ];
    }
);