define([
    "dojo/_base/declare",
    "dojo/Stateful",
    "webui/common/Constants",
    "webui/assembly/AssemblerBase",
    "webui/view/MapView",
    ],

    function(declare, Stateful, Constants, base, MapView) {
        return [

            declare("MapViewAssembler", AssemblerBase, {

                build: function() {
                    this.setupCacheRequest({ delay: 1500, channels: ["/orbitalpredictions"] });
                    this.setupCommunication();
                    this.setupMap();
                },

                setupMap: function() {
                    var geoLocation = new Stateful();
                    var mapController = new MapController({ id: "Map Controller", channels: ["/orbitalpredictions"], geoLocation: geoLocation });
                    var mapView = new SimpleMapView({ divId: "map", geoLocation: geoLocation, initialLocation: { lon: 26.726409, lat: 58.373365 } });
                },

            }),
        ];
    }
);