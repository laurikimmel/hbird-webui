define([
    "dojo/_base/declare",
    "dojo/data/ItemFileWriteStore",
    "webui/common/Constants",
    "webui/assembly/AssemblerBase",
    "webui/net/WebSocketProxy",
    "webui/view/ParametersView",
    ],

    function(declare, ItemFileWriteStore, Constants, base, proxy, view) {
        return [

            declare("ParametersAssembler", AssemblerBase, {

                build: function() {
                    this.setupCacheRequest({ delay: 1500, channels: ["/parameters"], });
                    this.setupCommunication();

                    var store =  new ItemFileWriteStore({
                        data : {
                            identifier : "storeId",
                            items: [],
                        }
                    });

                    var view = new ParametersView({ store: store, parentDivId: "CenterContainer" });
                    var controller = ParametersController({ id: "Parameters", channels: ["/parameters"], store: store });
                },

            }),

        ];
    }
);