define([
    "dojo/_base/declare",
    "dojo/_base/Deferred",
    "dojo/dom-construct",
    "dojo/store/Memory",
    "dijit/Tree",
    "dijit/tree/dndSource",
    "../common/Constants",
    "../common/Utils",
    "./ViewBase",
    ],

    function(declare, Deferred, domConstruct, Memory, Tree, dndSource, Constants, Utils, ViewBase) {

        var ROOT  = "root";
        var GROUP = "group";

        return [

            declare("TreeController", Controller, {

                model: null,
                beforeInsert: null,
                rootLabel: "Root",

                constructor: function(args) {
                    if (this.model != null) {
                        this.model.put({ storeId: ROOT, type: ROOT, name: this.rootLabel });
                    }
                },

                channelHandler: function(message, channel) {
                    if (this.model != null) {
                        if (this.beforeInsert != null) {
                            message = this.beforeInsert(message);
                        }
                        this.model.put(message);

                        if (this.model.query({ storeId: message.issuedBy }).total < 1) {
                            console.log("[TreeController] adding new group: " + message.issuedBy);
                            this.model.put({ storeId: message.issuedBy, type: GROUP, name: message.issuedBy });
                        }
                    }
                },

            }),

            declare("TreeView", View, {

                model: null,
                dndTypes: [],
                labelFormatter: null,
                titleFormatter: null,

                build: function() {

                    var tree = new Tree({
                            model: this.model,
                        }).placeAt(this.divId);

                    var lFormatter = this.labelFormatter || function(item) { return item.name; };
                    var tFormatter = this.titleFormatter || function(item) { return item.description; };
                    var dTypes = this.dndTypes;

                    new dndSource(tree, {
                        isSource: true,
                        copyOnly: true,
                        checkAcceptance: function(source, nodes) {
                            return false;
                        },
                        getItem: function(key) {
                            var item = dndSource.prototype.getItem.apply(this, arguments);
                            var parameter = item.data.item;
                            var listItem = domConstruct.create("div", {
                                innerHTML: lFormatter(parameter),
                                id: Utils.getParameterId(parameter),
                                title: tFormatter(parameter),
                            });

                            return {
                                node: listItem,
                                data: parameter,
                                type: dTypes,
                            };
                        },
                    });

                    tree.startup();
                },

            }),

            declare("ParameterTreeModel", Memory, {

                idProperty: "storeId",

                mayHaveChildren: function(object) {
                    return object.type == ROOT || object.type == GROUP;
                },

                getChildren: function(object, onComplete, onError) {
                    if (object.type == ROOT) {
                        Deferred.when(this.query({ type: GROUP }), onComplete, onError);
                    } else if (object.type == GROUP) {
                        Deferred.when(this.query({ issuedBy: object.storeId }), onComplete, onError);
                    } else {
                        console.warn("*** getChildren " + JSON.stringify(object));
                    }
                },

                getRoot: function(onItem, onError) {
                    Deferred.when(this.get(ROOT), onItem, onError);
                },

                getLabel: function(object) {
                    return object.name;
                },

                pasteItem: function(child, oldParent, newParent, bCopy, insertIndex) {
                    console.warn("*** pasteItem");
                },

                put: function(object, options) {
                    var result = Memory.prototype.put.apply(this, arguments);
                    var item = object;
                    var children = [];
                    if (object.type == ROOT) {
                        children = this.query({ type: GROUP });
                    } else if (object.type == GROUP) {
                        item = this.get(ROOT);
                        children = this.query({ type: GROUP });
                    } else {
                        item = this.query({ storeId: object.issuedBy });
                        children = this.query({ issuedBy: object.issuedBy });
                    }

                    this.onChildrenChange(item, children);
                    this.onChange(item);

                    return result;
                },

                remove: function(id){
                    var result = Memory.prototype.remove.apply(this, arguments);
                    // We call onDelete to signal to the tree to remove the child. The
                    // remove(id) gets and id, but onDelete expects an object, so we create
                    // a fake object that has an identity matching the id of the object we
                    // are removing.
                    this.onDelete({id: id});
                    // note that you could alternately wait for this inherited add function to
                    // finish (using .then()) if you don't want the event to fire until it is
                    // confirmed by the server
                    return result;
                },

                // we can also put event stubs so these methods can be
                // called before the listeners are applied
                onChildrenChange: function(parent, children) {
                    // fired when the set of children for an object change
                },

                onChange: function(object){
                    // fired when the properties of an object change
                },

                onDelete: function(object){
                    // fired when an object is deleted
                },

            }),

        ];
    }
);