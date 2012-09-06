define([
    "dojo/_base/declare",
    "dojo/dom",
    "dojo/fx",
    "../common/Utils",
    "../net/WebSocketProxy",
    "../net/MockProxy",
    "../net/CometProxy",
    "../net/CacheRequest",
    ],

    function(declare, dom, fx, Utils, WebSocketProxy, MockProxy, CometProxy, CacheRequest) {
        return [

            declare("AssemblerBase", null, {

                name: "default",
                loaderDivId: "loader",
                loaderFadeOutDelay: 500,

                constructor: function(args) {
                    declare.safeMixin(this, args);
                    try {
                        console.log("[Assembler] loading " + this.declaredClass);
                        this.preBuild();
                        this.build();
                        this.postBuild();
                    } catch (e) {
                        this.onBuildFailure(e);
                    }
                },

                preBuild: function() {
                    var loader = dom.byId(this.loaderDivId);
                    if (loader != null) {
                        loader.innerHTML = "Initializing";
                    }
                },

                build: function() {
                    console.warn("[Assembler]" + this.declaredClass + " is not implementing method build!");
                },

                postBuild: function() {
                	var loader = dom.byId(this.loaderDivId);
                    if (loader != null) {
                        loader.innerHTML = "Done!";
                        setTimeout(dojo.hitch(this, function() {
                            dojo.fadeOut({
                                node : loader,
                                duration : this.loaderFadeOutDelay,
                                onEnd : function() {
                                    loader.style.display = "none";
                                }
                            }).play();
                        }), this.loaderFadeOutDelay);
                    }
                    console.log("[Assembler] assembly for " + this.declaredClass + " completed");
                },

                onBuildFailure: function(error) {
                    var loader = dom.byId(this.loaderDivId);
                    if (loader != null) {
                        loader.innerHTML = "Faled to load application!<br/>" + error;
                    }
                    else {
                        alert("Failed to load application!\n" + error);
                    }
                    console.error("[Assembler] assembly for " + this.declaredClass + " failed with error " + error);
                    console.error(error);
                },

                // communication setup
                // has to be called from Assembler implementation
                setupCommunication: function(args) {

                    // TODO - replace with conditional module loading using
                    //        require(["../net/XXXProxy"], function(Proxy) { ... });
                    //        Currently require(...) is async call and wont fit into assemblers logic -
                    //        proxy has to be started before views.
                    //        To fix this - figure out how to wait for completition of require(...) so that method
                    //        setupCommunication stays sync.

                    var proxyName = Utils.getUrlQuery().proxy;
                    var proxy;

                    switch (proxyName) {
                        case "mock":
                            proxy = new MockProxy(args);
                            break;
                        case "comet":
                        case "cometd":
                            proxy = new CometProxy(args);
                            break;
                        case "ws":
                        default:
                            proxy = new WebSocketProxy(args);
                            break;
                    }

                    console.log("[Assembler] " + this.declaredClass + " using " + proxy.declaredClass);
                },

                // cache request setup
                // has to be called from Assembler implementation
                setupCacheRequest: function(args) {
                    var cacheRequest = new CacheRequest(args);
                },

            }),

        ];
    }
);