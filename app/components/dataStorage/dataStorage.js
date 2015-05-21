(function () {
    'use strict';

    var dep = [];

    angular.module('dataStorage', dep)
        .provider('dataStorage', [
            function () {

                /*Factory function*/
                this.$get = ["$q", function ($q) {
                    var data = {};

                    return {
                        getData: function(name){
                            return angular.isObject(data[name]) ? angular.copy(data[name]) : data[name];
                        },
                        setData: function(name, value){
                            data[name] = angular.isObject(value) ? angular.copy(value) : value;
                        }
                    };
                }];

            }
        ]);

})();