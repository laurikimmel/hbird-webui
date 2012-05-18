define([
    "dojo/_base/declare",
    "dojo/data/ItemFileWriteStore",
    "webui/common/Constants",
    "webui/assembly/AssemblerBase",
    "webui/view/ParametersView",
    "webui/view/ComponentsViewOld",
    "webui/view/ChannelsView",
    "webui/view/LogView",
    ],

    function(declare, ItemFileWriteStore, Constants, base, parameters, components, channels, log) {
        return [

            declare("MultiViewAssembler", AssemblerBase, {

                build: function() {
                    this.setupCacheRequest({ delay: 1500 });
                    this.setupCommunication();

                    var channelsStore = new ItemFileWriteStore({
                        data: {
                            identifier: "channel",
                            items: [],
                        }
                    });
                    var channelsController = new ChannelsController({ id: "Communication Channels", store: channelsStore });

                    this.setupParameters();
                    this.setupComponents();
                    var channelsView = new ChannelsView({ store: channelsStore, parentDivId: "CenterContainer" });
                    this.setupLog();
                },

                setupLog: function() {
                    var logStore = new ItemFileWriteStore({
                        data: {
                            identifier: "storeId",
                            items: [],
                        }
                    });
                    var logView = new LogView({ parentDivId: "CenterContainer", store: logStore });
                    var logController = new LogController({ id: "log", channels: ["/log"], store: logStore, historyLimit: 30 });
                },

                setupComponents: function() {
                    var componentsStore =  new ItemFileWriteStore({
                        data: {
                            identifier: "id",
                            items: [],
                        }
                    });
                    var componentsView = new ComponentsView({ store: componentsStore, parentDivId: "CenterContainer" });
                    var componentsController = new ComponentsController({ id: "System Components", channels: ["/system"], store: componentsStore });
                },

                setupParameters: function() {
                    var parametersStore =  new ItemFileWriteStore({
                        data: {
                            identifier: "storeId",
                            items: [],
                        }
                    });
                    var parametersView = new ParametersView({ store: parametersStore, parentDivId: "CenterContainer" });
                    var parametersController = new ParametersController({ id: "Parameters", channels: ["/parameters"], store: parametersStore });
                },

//                setupChannels: function() {
//                    var channelsStore = new ItemFileWriteStore({
//                        data: {
//                            identifier: "channel",
//                            items: [],
//                        }
//                    });
//                    var channelsController = new ChannelsController({ id: "Communication Channels", store: channelsStore });
//                    var channelsView = new ChannelsView({ store: channelsStore, parentDivId: "CenterContainer" });
//                },

            }),
        ];
    }
);