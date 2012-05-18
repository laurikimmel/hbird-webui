define(
    ["dojo/_base/declare",
     "dojo/dom-construct",
     "dojo/_base/window",
     "dojo/dnd/Source",
     "../common/Constants",
    ],

    function(declare, domConstruct, win, Source, Constants) {

        return [

            declare("webgui.view.DndTarget", null, {

                constructor: function(agent, args) {
                    // check for domId
                    if (agent.domId == null) {
                        console.warn("[DndTarget] agent has no domId set! Creating DndTarget will fail now");
                    }

                    // First we set the dnd.Source options.
                    // Make the presentation container tag a DnD source with
                    // a new not displayed "dropbox" div to collect the dropped items
                    var dndOptions = {
                        parent: domConstruct.create("div", { style : { display : "none" } },  win.body()),
                        isSource: false,
                    };
                    // then we mixin the opt
                    declare.safeMixin(dndOptions, args);
                    //finally add the DnD capability
                    agent.dndSource = new dojo.dnd.Source(agent.domId, dndOptions);

                    /*
                    dojo.connect(agent.dndSource, "onDrop", function(source, nodes, copy, target) {
                        console.log(nodes);
                    });
                    */
                },

            }),


        ];
});