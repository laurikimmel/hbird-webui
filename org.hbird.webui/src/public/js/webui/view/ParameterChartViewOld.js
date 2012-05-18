define([
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/dom-construct",
    "dojox/charting/widget/Chart",
    "dojox/charting/widget/SelectableLegend",
//    "dojox/charting/widget/Legend",
    "dojox/charting/themes/Claro",
    "dojox/charting/plot2d/Lines",
    "dojox/charting/axis2d/Default",
    "dojox/charting/action2d/Tooltip",
    "dojox/charting/action2d/Magnify",
    "../common/Constants",
    "../common/Utils",
    "./ParameterViewBase",
    ],

    function(declare, Arrays, domConstruct, Chart, Legend, Theme, Lines, Default, Tooltip, Magnify, Constants, Utils, ViewBase) {

        function isNumericParameter(parameter) {
            return Utils.isNumber(parameter.value);
        }

        return[

            declare("ParameterChartController", ParameterController, {

                chartView: null,

                onParameter: function(parameter) {
                    if (!isNumericParameter(parameter)) {
                        return;
                    }
                    console.log("*** new value for parameter " + Utils.getParameterId(parameter) + " - " + parameter.value);
                    if (this.chartView != null && this.chartView.parameterCallback != null) {
                        this.chartView.parameterCallback(parameter);
                    }
                },
            }),

            declare("ParameterChartView", ParameterView, {

                historyLimit: 100,
                chart: null,
                legendDivId: "legend",
                legend: null,

                createView: function() {
                    var chartWidget = new Chart({
                        srcNodeRef: domConstruct.create("div"),
                        domId: this.divId
                    }).placeAt(this.divId);

                    this.chart = chartWidget.chart;
                    this.chart.setTheme(Theme);

                        this.chart.addPlot("default", {
                            type: "Lines",
                            markers: true,
//                            enableCache: true,
//                            areas: true,
//                            labelOffset: -30,
//                            shadows: { dx:2, dy:2, dw:2 }
                        });

                        // Add axes
                        this.chart.addAxis("x", {
                            labelFunc: function(n) {
                                return Utils.formatDate(parseInt(n));
                            },
                        });
                        this.chart.addAxis("y", { vertical: true });
//                        this.chart.addAxis("x", { microTickStep: 1, minorTickStep: 1, /*max: this.historyLimit*/ });
//                        this.chart.addAxis("y", { vertical: true, fixLower: "major", fixUpper: "major", });

                    this.resize();

                    new Tooltip(this.chart, "default");
                    new Magnify(this.chart, "default");

                    this.chart.render();

//                    dojo.subscribe(Constants.TOPIC_PARAMETER_SHOW, dojo.hitch(this, function(parameter) {
//
//                        if (!this.acceptParameter(parameter)) {
//                            return;
//                        }
//
//                    }));

                    dojo.subscribe(Constants.TOPIC_PARAMETER_HIDE, function(parameter) {
                        this.chart.removeSeries(Utils.getParameterId(parameter));
                    });

                    var div = dijit.byId("chart");
                    dojo.connect(div, "resize", this, this.rezise);

                    return chartWidget;
                },

                resize: function() {
                    console.log("*** resize *** " + this.divId + "; " + this.chart);
                    var dim = dijit.byId(this.divId)._contentBox;
                    this.chart.resize(dim.w, dim.h - 30);
                },

                acceptParameter: function(parameter) {
                    return isNumericParameter(parameter) && !this.getSeriesData(parameter);
                },

                parameterCallback: function(parameter) {

                    var data = this.getSeriesData(parameter);
                    if (data) {
                        this.removeOldEntries(data, this.historyLimit);
                        data.push({ x: parameter.timestamp, y: parameter.value });
                        this.chart.updateSeries(Utils.getParameterId(parameter), data);
                    } else {
                        this.chart.addSeries(Utils.getParameterId(parameter), [{ x: parameter.timestamp, y: parameter.value }]);
                        this.updateLegend();
                    }
                    this.chart.render();
                },

                getSeriesData: function(parameter) {
                    var seriesData;
                    var seriesExists;
                    Arrays.forEach(this.chart.series, function(entry) {
                        if (entry.name == Utils.getParameterId(parameter)) {
                            seriesExists = true;
                            seriesData = entry.data;
                        }
                    });
                    return seriesExists ? seriesData : null;
                },

                removeOldEntries: function(data, limit) {
                    if (data.length > limit) {
                        data.splice(0, data.length - limit);
                    }
                },

                updateLegend: function() {
                    if (this.legend) {
                        this.legend.refresh();
                    } else {
                        var chartContainer = dojo.byId(this.divId);
                        chartContainer.appendChild(domConstruct.create("div", { id: this.legendDivId }));
//                        this.legend = new Legend({ chart: this.chart }, this.legendDivId);
                        this.legend = new Legend({ chart: this.chart }, this.legendDivId);
                        this.legend.refresh();
                    }
                },
            }),
        ];

    }
);