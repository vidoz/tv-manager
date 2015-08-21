(function () {
    'use strict';

    var dep = [];

    angular.module('dataStorage', dep)
        .provider('dataStorage', [
            function () {
                //var Datastore = require('nedb');
                //var path = require('path');
                //var db = {};
                //db.settings = new Datastore({ filename: path.join(require('nw.gui').App.dataPath, 'settings.db'), autoload: true });
                //db.movies = new Datastore({ filename: path.join(require('nw.gui').App.dataPath, 'movies.db'), autoload: true });

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