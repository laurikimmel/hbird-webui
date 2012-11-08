define(["dojo/_base/declare",
        "dojo/_base/window",
        "dojo/date/locale",
        "dojo/io-query",
        "./Constants"
       ], function(declare, win, locale, ioQuery, Constants) {

        function format(date, format) {
            return dojo.date.locale.format(date, {
                selector: "date",
                datePattern: format,
            });
        }

        return {

            /**
             * Returns date string for given timestamp using Constants.DEFAULT_DATE_FORMAT.
             */
//            formatDate: function(timestamp, str) {
//                str = str || Constants.DEFAULT_DATE_FORMAT;
//                return format(new Date(timestamp), str);
//            },

            formatDate: function(timestamp) {
                return format(new Date(timestamp), Constants.DEFAULT_DATE_FORMAT);
            },

            /**
             * Returns hash code for given string.
             */
            hashCode: function(str) {
                var hash = 0;
                if (str.length == 0) {
                    return code;
                }
                for (i = 0; i < str.length; i++) {
                    char = str.charCodeAt(i);
                    hash = 31 * hash + char;
                    hash = hash & hash; // Convert to 32bit integer
                }
                return hash.toString(16);
            },

            /**
             * Checks if given argument is number.
             *
             * Returns true if given argument n is number.
             */
            isNumber: function(n) {
                return !isNaN(parseFloat(n)) && isFinite(n);
            },

            /**
             * Returns URL query part as object.
             *
             * Eg. from page http://localhost/asd.html?foo=a&bar=B
             * return { foo: "a", bar: "B" }
             */
            getUrlQuery: function() {
                return ioQuery.queryToObject(win.doc.location.search.substr((dojo.doc.location.search[0] === "?" ? 1 : 0)));
            },

            /**
             * Returns unique id for given parameter
             */
            getParameterId: function(parameter) {
                return parameter.datasetidentifier + "/" + parameter.name;
            },

            /**
             * Returns normalized value for storage.
             *
             * Storages are not accepting null values.
             * In case value is null returns empty string.
             */
            normalizeForStorage: function(value) {
                return value == null ? "" : value;
            },

        };
});
