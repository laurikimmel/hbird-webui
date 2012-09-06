define([
    "dojo/_base/declare",
    "dojox/grid/DataGrid",
    "dojo/data/ObjectStore",
    "dojo/aspect",
    "dijit/registry",
    "../common/Constants",
    "../common/Utils",
    "./ViewBase",
    ],

    /* Not working with dojo 1.7.2 - table refresh is broken. */

    function(declare, DataGrid, ObjectStore, aspect, registry, Constants, Utils, ViewBase) {

        // XXX - hack for Observable not working in dojo 1.7.2
        var addFlag = false;

        function getStatus(component, now) {
            var limit = component.nextBeat - component.timestamp;
            var diff = now - component.nextBeat;
            return diff <= 0 ? "OK" : (diff > limit ? "Error" : "Warning");
        }

        return [
            declare("ComponentsController", Controller, {
                channelHandler: function(message, channel) {
                    var id = message.issuedBy;
                    if (id == null) {
                        return;
                    }
                    var entry = this.store.get(id);
                    message.status = getStatus(message, new Date().getTime());
                    if (entry == null) {
                        addFlag = true;
                        this.store.add(message);
                    } else {
                        this.store.put(message);
                    }
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
                            store: ObjectStore({ objectStore: this.store }),
                            structure: [
                                { name: "Component ID", field: "issuedBy", width: "200px" },
                                { name: "Timestamp", field: "timestamp", width: "200px", formatter: Utils.formatDate, },
                                { name: "Status", field: "status", width: "200px" },
                                { name: "Description", field: "description", width: "100%" },
                            ]
                    });

                    // hack for Observable not working in dojo 1.7.2
                    aspect.before(this.store, 'notify', function() {
                        if (addFlag) {
                            addFlag = false;
                        } else {
                            grid._refresh();
                        }
                    });

                    var container = registry.byId(this.parentDivId);
                    container.addChild(grid);
                    grid.startup();

                    setInterval(dojo.hitch(this, function() {
                        var now = new Date().getTime();
                        this.store.query({}).forEach(dojo.hitch(this, function(component) {
                            component.status = getStatus(component, now);
                            this.store.put(component);
                        }));
                    }), this.updateInterval);


                },
            }),

        ];
    }
);