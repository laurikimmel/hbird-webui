define([
    "dojo/_base/declare",
    "dojox/geo/openlayers/Map",
    "dojox/geo/openlayers/GfxLayer",
    "dojox/geo/openlayers/GeometryFeature",
    "dojox/geo/openlayers/Point",
    "../common/Constants",
    "../common/Utils",
    "./ViewBase",
    ],

    function(declare, Map, GfxLayer, GeometryFeature, Point, Constants, Utils, ViewBase) {

        return [

            declare("MapController", Controller, {

                geoLocation: null,
                initialLocation: { lon: 0, lat: 0 },

                constructor: function(args) {
                    this.geoLocation.set("lat", this.initialLocation.lat);
                    this.geoLocation.set("lon", this.initialLocation.lon);
                },

                channelHandler: function(message, channel) {
                    if (this.geoLocation != null) {
                        if (message.name == "Latitude") {
                            this.geoLocation.set("lat", message.value);
                        }
                        if (message.name == "Longitude") {
                            this.geoLocation.set("lon", message.value);
                        }
                    }
                },

            }),

            // Can't use MapView as name here. It is conflicting with something else.
            // Will end up with error on instance creation using new MapView(...)
            declare("SimpleMapView", View, {

                mapProvider: dojox.geo.openlayers.BaseLayerType.OSM,
//                mapProvider: dojox.geo.openlayers.BaseLayerType.WMS,
//                mapProvider: dojox.geo.openlayers.BaseLayerType.GOOGLE,         // add to html: <script src="http://maps.google.com/maps/api/js?v=3&amp;sensor=false"></script>
//                mapProvider: dojox.geo.openlayers.BaseLayerType.VIRTUAL_EARTH,  // add to html: <script src='http://dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=6.3'></script>
//                mapProvider: dojox.geo.openlayers.BaseLayerType.YAHOO,          // add to html: <script src="http://api.maps.yahoo.com/ajaxymap?v=3.0&appid=euzuro-openlayers"></script>
//                mapProvider: dojox.geo.openlayers.BaseLayerType.ARCGIS,

                geoLocation: null,

                build: function() {

                    var map = new Map(this.divId, {
                        baseLayerType: this.mapProvider,
                    });

                    var layer = new GfxLayer();
                    var point = new Point({ x: this.geoLocation.get("lon"), y: this.geoLocation.get("lat") });
                    // create a GeometryFeature
                    var feature = new GeometryFeature(point);
                    // set the shape properties, fill and stroke
//                    feature.setFill([ 0, 128, 128 ]);
                    feature.setStroke([ 255, 0, 0 ]);
                    feature.setShapeProperties({ r: 10});
                    // add the feature to the layer
                    layer.addFeature(feature);
                    // add layer to the map
                    map.addLayer(layer);
                    dojo.hitch(this, updatePosition);

                    if (this.geoLocation != null) {
                        this.geoLocation.watch("lon", dojo.hitch(this, updatePosition));
                        this.geoLocation.watch("lat", dojo.hitch(this, updatePosition));
                    }

                    function updatePosition() {
                        var loc = point.getPoint();
                        // set new location
                        loc.x = this.geoLocation.get("lon");
                        loc.y = this.geoLocation.get("lat");
                        // center map to new location
                        map.fitTo({
                            position: [loc.x, loc.y],
                            extent: 12.0, // TODO - make it dynamic
                        });
                        // update "marker"
                        point.setPoint(loc);
                        feature.render(point);
//                        console.log("*** lon: " + this.geoLocation.get("lon") + "; lat: " + this.geoLocation.get("lat") + "; map: " + map);
                    }

                },

            }),

        ];
    }
);