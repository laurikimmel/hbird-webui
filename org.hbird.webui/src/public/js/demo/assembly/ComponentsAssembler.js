define([
    "dojo/_base/declare",
    "dojo/store/Memory",
    "dojo/store/Observable",
    "dojo/data/ObjectStore",
    "webui/common/Constants",
    "webui/assembly/AssemblerBase",
    "webui/view/ComponentsView",
     ],

    function(declare, Memory, Observable, ObjectStore, Constants, base, view) {
        return [

            declare("ComponentsAssembler", AssemblerBase, {

                build: function() {
                    this.setupCacheRequest({ delay: 1500, channels: ["/system"] });
                    this.setupCommunication();
                    var store =  Observable(new Memory({ idProperty: "issuedBy" }), true);
                    var view = new ComponentsView({ store: store, parentDivId: "CenterContainer" });
                    var controller = new ComponentsController({ id: "System Components", channels: ["/system"], store: store });
                },

            }),

        ];
    }
);