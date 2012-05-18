define(
    ["dojo/_base/declare",
     "dojo/dom-construct",
     "dojo/store/Observable",
     "dojox/charting/StoreSeries",
     "dojox/charting/widget/Chart",
//     "dojox/charting/widget/SelectableLegend",
     "dojox/charting/widget/Legend",
     "dojox/charting/themes/Claro",
     "dojox/charting/plot2d/Lines",
     "dojox/charting/axis2d/Default",
     "dojox/charting/action2d/Tooltip",
     "dojox/charting/action2d/Magnify",
     "../common/Constants",
     "../common/Utils",
     "./ParameterViewBase",
    ],

    /* Not working 'cos unable to remove old items from store =( */

    function(declare, domConstruct, Observable, StoreSeries, Chart, Legend, Theme, Lines, Default, Tooltip, Magnify, Constants, Utils, ViewBase) {

        function isNumericParameter(parameter) {
            return Utils.isNumber(parameter.value);
        }

        return[

            declare("ParameterChartController", ParameterController, {

                historyLimit: 100,

                onParameter: function(parameter) {
                    if (!isNumericParameter(parameter)) {
                        return;
                    }
                    console.log("*** new value for parameter " + parameter.name + " - " + parameter.value);
                    // TODO - check this, parameter.datasetId has to be part of store id
                    parameter.storeId = parameter.datasetId + parameter.name + parameter.timestamp;
                    this.store.put(parameter);

                    console.log("*** this.store.idProperty: " + this.store.idProperty);

                    var total = this.store.query({ name: parameter.name }).total;
                    if (total > this.historyLimit) {
                        this.store.query({ name: parameter.name },
                        {
                            start: 0,
                            count: total - this.historyLimit,
                        }).forEach(function(parameter) {
                            try {
                                var id = this.store.getIdentity(parameter);
                                var success = this.store.remove(parameter.storeId);
                                console.log("Removed " + parameter.storeId + "; " + id + " => " + success + "; " + (id == parameter.storeId));
                            } catch (e) {
                                console.error(e);
                            }
                        });
                    }
                },
            }),

            declare("ParameterChartView", ParameterView, {

                historyLimit: 100,

                createView: function() {
                    var chartWidget = new Chart({
                        srcNodeRef: domConstruct.create("div"),
                        domId: this.divId
                    }).placeAt(this.divId);

                    var chart = chartWidget.chart;
                    chart.setTheme(Theme);

                        chart.addPlot("default", {
                            type: "Lines",
                            markers: true,
//                            areas: true,
//                            labelOffset: -30,
//                            shadows: { dx:2, dy:2, dw:2 }
                        });

                        // Add axes
                        chart.addAxis("x", { microTickStep: 1, minorTickStep: 1, /*max: this.historyLimit*/ });
                        chart.addAxis("y", { vertical: true, fixLower: "major", fixUpper: "major", });

                        // Add the series of data
//                        chart.addSeries("SalesThisDecade",chartData);

/*
                    chart.addPlot("default", {
                        type: "Lines", // type of chart
                        markers: true,
                        lines: true,
                        // areas: true,
                        labelOffset: -30,
                        shadows: { dx:2, dy:2, dw:2 }
                    });
                    chart.addAxis("x");
                    chart.addAxis("y", { vertical: true });
                    chart.resize(800, 400);
*/
                    var dim = dijit.byId(this.divId)._contentBox;
                    chart.resize(dim.w, dim.h - 30);

                    new Tooltip(chart, "default");
                    new Magnify(chart, "default");

                    chart.render();

                    var obs = new Observable(this.store);

                    var legend;
                    var chartContainer = dojo.byId(this.divId);


                    dojo.subscribe(Constants.TOPIC_PARAMETER_SHOW, dojo.hitch(this, function(parameter) {

                        if (!this.acceptParameter(parameter)) {
                            return;
                        }

//                        chart.addSeries(parameter.name, new StoreSeries(obs, {
//                                query: { name: parameter.name },
//                                "options":  {
//                                        count: 10,
//                                        start: 0,
//                                        sort: [
//                                            { attribute: "timestamp", descending: true },
//                                        ]
//                                     }
//                        },"value"));

                        chart.addSeries(parameter.name, new StoreSeries(obs, { query: { name: parameter.name } }, "value"));
//                        chart.addSeries(parameter.name, new StoreSeries(obs, { query: { name: parameter.name } }, { x: "timestamp", y: "value" }));

                        if (legend) {
                            legend.destroy();
                        }
                        chartContainer.appendChild(dojo.create("div", { id: "legend" }));
                        legend = new Legend({ chart:chart }, "legend");

                    }));

                    dojo.subscribe(Constants.TOPIC_PARAMETER_HIDE, function(parameter) {
                        chart.removeSeries(parameter.name);
                    });

                    return chartWidget;
                },

                acceptParameter: function(parameter) {
                    return isNumericParameter(parameter) && this.store.query({ name: parameter.name}).total == 0;
                },
            }),
        ];

    }
);