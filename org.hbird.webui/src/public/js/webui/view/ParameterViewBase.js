define([
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/dom-construct",
    "dijit/layout/ContentPane",
    "../common/Constants",
    "../common/Utils",
     "./DndSupport",
    ],

    function(declare, Arrays, domConstruct, ContentPane, Constants, Utils, DndSupport) {

        function checkParameters(source, nodes, instance) {
            var result = true;
            Arrays.forEach(nodes, function(node, i) {
                var parameter = source.getItem(node.id).data;
                result = result && instance.acceptParameter(parameter);
            });
            return result;
        }


        return [

            declare("ParameterController", Controller, {

                parameterRegistry: [], // should be static (shared among all sub classes)

                constructor: function(args) {
                    dojo.subscribe(Constants.TOPIC_PARAMETER_SHOW, dojo.hitch(this, this.onParameterShow));
                    dojo.subscribe(Constants.TOPIC_PARAMETER_HIDE, dojo.hitch(this, this.onParameterHide));
                },

                onParameterShow: function(parameter) {
                    if (parameter.name != null) {
                        this.parameterRegistry[Utils.getParameterId(parameter)] = true;
                        this.onParameter(parameter);
                    }
                },

                onParameterHide: function(parameter) {
                    if (parameter.name != null) {
                        this.parameterRegistry[Utils.getParameterId(parameter)] = false;
                        this.onParameterRemove(parameter);
                    }
                },

                channelHandler: function(parameter, channel) {
                    // check if we accept this parameter at the moment
                    if (parameter.name == null || !this.parameterRegistry[Utils.getParameterId(parameter)] || this.parameterRegistry[Utils.getParameterId(parameter)] === false) {
                        // drop parameter
                        return;
                    }
                    else {
                        // handle parameter
                        try {
                            this.onParameter(parameter);
                        } catch (e) {
                            console.error(e);
                        }
                    }
                },

                onParameter: function(parameter) {
                    console.warn("No handler implemented in " + this.id + " for parameter " + JSON.stringify(parameter));
                },

                onParameterRemove: function(parameter) {
                    console.warn("No handler implemented in " + this.id + " to remove parameter " + JSON.stringify(parameter));
                },

            }),

            declare("ParameterView", View, {

                build: function() {
                    // build the view
                    var view = this.createView();
                    if (view == null) {
                        console.warn("[ParameterView] " + this.divId + " did not create any view component!");
                        return;
                    }

                    var instance = this;

                    // add dnd target support to view
                    new webgui.view.DndTarget(view, {
                        creator: function (item, hint) {
//                            console.log("item creator");
//                            console.log(item);
//                            console.log("hint: " + hint);
                            var n = domConstruct.create("div");
                            try {
                                dojo.publish(Constants.TOPIC_PARAMETER_SHOW, [item]);
                            } catch (e) {
                                console.error("Failed to publish parameter drop.\n" + e);
                            }
                            return { node: n, data: item };
                        },
                        accept: [Constants.DND_TYPE_PARAMETER],
                        checkAcceptance: function(source, nodes) {
//                            console.log("*** checkAcceptance!");
//                            console.log(source);
//                            console.log(nodes);
                            if (!checkParameters(source, nodes, instance)) {
                                return false;
                            }
                            return this.inherited(arguments);
                        },
                    });
                },

                createView: function() {
                    // sub classe should build view here!
                    return null;
                },

                acceptParameter: function(parameter) {
                    // override in sub classes
                    return true;
                },
            }),

        ];
});
