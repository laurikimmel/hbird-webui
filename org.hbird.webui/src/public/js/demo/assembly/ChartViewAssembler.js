define(
    ["dojo/_base/declare",
     "dojo/store/Memory",
     "dojo/store/Observable",
     "webui/common/Constants",
     "webui/common/Utils",
     "webui/assembly/AssemblerBase",
     "webui/view/ListView",
     "webui/view/ParameterChartView",
     ],

    function(declare, Memory, Observable, Constants, Utils, base, list, chart) {
        return [

            declare("ChartViewAssembler", AssemblerBase, {

                build: function() {
                    this.setupCacheRequest({ delay: 1500, channels: ["/parameters"] });
                    this.setupCommunication();
                    this.setupList();
                    this.setupChart();
                },

                setupChart: function() {
                    var limit = 10;
                    var store = new Memory({ idProperty: "storeId" });
                    var view = new ParameterChartView({
                        store: store,
                        divId: "chart",
                        historyLimit: limit,
                    });
                    var controller = new ParameterChartController({
                        store: store,
                        id: "Parameter Chart Controller",
                        channels: ["/parameters"],
                        historyLimit: limit,
                    });
                },

                setupList: function() {
                    var store = new Observable(new Memory({ idProperty: "storeId" }));
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
});