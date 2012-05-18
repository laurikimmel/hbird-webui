define(
    ["dojo/_base/declare",
     "dojo/data/ItemFileWriteStore",
     "webui/common/Constants",
     "webui/assembly/AssemblerBase",
     "webui/view/LogView"],

    function(declare, ItemFileWriteStore, Constants, base, view) {
        return [

            declare("LogAssembler", AssemblerBase, {

                build: function() {
                    this.setupCacheRequest({ delay: 1500, channels: ["/log"] });
                    this.setupCommunication();
                    var store = new ItemFileWriteStore({
                        data: {
                            identifier: "storeId",
                            items: [],
                        }
                    });
                    var view = new LogView({ parentDivId: "CenterContainer", store: store });
                    var controller = new LogController({ id: "log", channels: ["/log"], store: store, historyLimit: 30 });
                },

            }),

        ];
});