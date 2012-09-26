define(
    ["dojo/_base/declare",
     "dojo/dom-construct",
     "dojo/dnd/Source",
     "../common/Constants",
     "../common/Utils",
     "./ViewBase",
    ],

    function(declare, domConstruct, Source, Constants, Utils, ViewBase) {

        return [

            declare("ListController", Controller, {

                store: null,
                beforeInsert: null,

                channelHandler: function(message, channel) {
                    if (this.store != null) {
                        if (this.beforeInsert != null) {
                            message = this.beforeInsert(message);
                        }
                        this.store.put(message);
                    }
                },

            }),

            declare("ListView", null, {

                dndSource: null,
                dndTypes: [],
                labelFormatter: null,
                titleFormatter: null,

                constructor: function(args) {
                    declare.safeMixin(this, args);
                    
                    if (this.dndSource == null) {
                        this.dndSource = new dojo.dnd.Source(this.divId, {
                            copyOnly: true,
                            creator: dojo.hitch(this, this.nodeCreator),
                        });
                    }

                    var all = this.store.query();

                    all.observe(dojo.hitch(this, this.dataUpdateHandler), true); // true to listen objects property changes

                    if (this.selectionTopic != null) {
                        dojo.connect(this.dndSource, "onMouseDown", this.dndSource, dojo.hitch(this, function(e) {
                            var item = this.dndSource.getItem(e.target.id);
                            if (item == null) {
                                return;
                            }
                            console.log("Posting selection to: " + this.selectionTopic + "; data: " + item.data);
                            dojo.publish(this.selectionTopic, [item.data]);
                        }));
                    }


                    // TODO - figure out way to listen all of the dnd drops originated from this view.
                    // - dojo.connect(dndSource, "onDrop", context, someFunction(source, nodes, copy));
                    // works for the target not for the source.
                    // Eg. has to be added to all possible targets.
                    // - msgbus.subscribe("/dnd/drop", function(source, nodes, copy, target) {});
                    // works, but can't access dnd data object
                    // - any other way?

                    this.labelFormatter = this.labelFormatter || function(item) { return item.name; };
                    this.titleFormatter = this.titleFormatter || function(item) { return item.description; };
                },

                getId: function(item) {
//                    return Utils.hashCode(this.divId + item.name);
                    return Utils.hashCode(this.divId + Utils.getParameterId(item));
                },

                nodeCreator: function(item, hint) {

                    var listItemId = this.getId(item);
                    var listItem = domConstruct.create("div", {
                        innerHTML: this.labelFormatter(item),
                        id: listItemId,
                        title: this.titleFormatter(item),
                    });

                    return {
                        node: listItem,
                        data: item,
                        type: this.dndTypes,
                    };
                },

                dataUpdateHandler: function(object, removedFrom, insertedInto) {
                    if (removedFrom > -1) {
                        // existing object removed
                        // TODO - implement
                    }
                    if (insertedInto > -1) {
                        // new or updated object inserted
                        var id = this.getId(object);
                        var item = this.dndSource.getItem(id);
                        if (item == null) {
                            // new object; add new node
                            this.dndSource.insertNodes(false, [object]);
                        }
                        else {
                            // existing object; update data
                            this.dndSource.setItem(id, {data: object, type: this.dndTypes});
                        }
                    }
                },
            }),

        ];
});