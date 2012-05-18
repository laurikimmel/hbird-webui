define([
    "dojo/_base/declare",
    "dojo/store/Memory",
    "webui/common/Constants",
    "webui/common/Utils",
    "webui/assembly/AssemblerBase",
    "webui/view/ListView",
    "webui/view/ParameterChartViewOld",
    ],

    function(declare, Memory, Constants, Utils, base, list, chart) {
        return [

            declare("ChartViewAssemblerOld", AssemblerBase, {

                build: function() {
                    this.setupCacheRequest({ delay: 1500, channels: ["/parameters"] });
                    this.setupCommunication();
                    this.setupList();
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

                setupList: function() {
                    var store = new Memory({ idProperty: "storeId" });
                    var view = new ListView({
                        store: store,
                        divId: "parameters",
                        dndTypes: [Constants.DND_TYPE_PARAMETER],
                        selectionTopic: Constants.TOPIC_SELECTION_PARAMETER,
                        labelFormatter: function(parameter) {
                            return parameter.issuedBy + " - " + parameter.name;
                        },
                        titleFormatter: function(parameter) {
                            return parameter.description + "\n" + parameter.issuedBy + " - " + parameter.name;
                        }
                    });
                    var controller = new ListController({
                        store: store,
                        id: "Parameters List Controller",
                        channels: ["/parameters"],
                        beforeInsert: function(message) {
                            message.storeId = Utils.getParameterId(message);
                            return message;
                        },
                    });
                },

            }),
        ];
    }
);