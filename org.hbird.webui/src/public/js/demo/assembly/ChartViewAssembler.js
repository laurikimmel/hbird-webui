define(
    ["dojo/_base/declare",
     "dojo/store/Memory",
     "webui/common/Constants",
     "webui/assembly/AssemblerBase",
     "webui/view/ListView",
     "webui/view/ParameterChartView",
     ],

    function(declare, Memory, Constants, base, list, chart) {
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
                    var store = new Memory({ idProperty: "name" });
                    var view = new ListView({
                        store: store,
                        divId: "parameters",
                        dndTypes: [Constants.DND_TYPE_PARAMETER],
                        selectionTopic: Constants.TOPIC_SELECTION_PARAMETER,
                    });
                    var controller = new ListController({
                        store: store,
                        id: "Parameters List Controller",
                        channels: ["/parameters"],
                    });
                },

            }),
        ];
});