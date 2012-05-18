define([
    "dojo/_base/declare",
    "dojo/store/Memory",
    "webui/common/Constants",
    "webui/common/Utils",
    "webui/assembly/AssemblerBase",
    "webui/view/TreeView",
    "webui/view/ParameterChartViewOld",
    ],

    function(declare, Memory, Constants, Utils, base, tree, chart) {
        return [

            declare("TreeViewAssembler", AssemblerBase, {

                build: function() {
                    this.setupCacheRequest({ delay: 1500, channels: ["/parameters"] });
                    this.setupCommunication();
                    this.setupTree();
                    this.setupChart();
                },

                setupChart: function() {
                    var view = new ParameterChartView({
                        divId: "chart",
                    });
                    var controller = new ParameterChartController({
                        id: "Parameter Chart Controller",
                        legendDivId: "legend",
                        channels: ["/parameters"],
                        historyLimit: 40,
                        chartView: view,
                    });
                },

                setupTree: function() {

                    var model = new ParameterTreeModel();

                    var controller = new TreeController({
                        model: model,
                        id: "Parameters Tree Controller",
                        channels: ["/parameters"],
                        rootLabel: "Parameters",
                        beforeInsert: function(message) {
                            message.storeId = Utils.getParameterId(message);
                            return message;
                        },
                    });


                    var view = new TreeView({
                        model: model,
                        divId: "parameters",
                        dndTypes: [Constants.DND_TYPE_PARAMETER],
                        labelFormatter: function(parameter) {
                            return parameter.issuedBy + " - " + parameter.name;
                        },
                        titleFormatter: function(parameter) {
                            return parameter.description + "\n" + parameter.issuedBy + " - " + parameter.name;
                        }
                    });

                },

            }),
        ];
    }
);