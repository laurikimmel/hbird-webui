define([
    "dojo/_base/declare",
    "dojo/data/ItemFileWriteStore",
    "webui/common/Constants",
    "webui/assembly/AssemblerBase",
    "webui/net/WebSocketProxy",
    "webui/view/ComponentsViewOld",
    ],

    function(declare, ItemFileWriteStore, Constants, base, proxy, view) {
        return [

            declare("ComponentsAssemblerOld", AssemblerBase, {

                build: function() {
                    this.setupCacheRequest({ delay: 1500, channels: ["/system"] });
                    this.setupCommunication();

                    var store =  new ItemFileWriteStore({
                        data: {
                            identifier: "id",
                            items: [],
                        }
                    });

                    var view = new ComponentsView({ store: store, parentDivId: "CenterContainer" });
                    var controller = new ComponentsController({ id: "System Components", channels: ["/system"], store: store });
                },

            }),

        ];
    }
);