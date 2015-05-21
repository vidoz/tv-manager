(function () {
    'use strict';

    var dep = [];

    angular.module('tvRage', dep)
        .provider('tvRage', [
            function () {
                var xml2js = require('xml2js');
                var parser = new xml2js.Parser();

                /*Factory function*/
                this.$get = ["$http", "$q", function ($http, $q) {
                    var showMap = {};

                    function searchShow(showName){
                        var defer = $q.defer();

                        showName = encodeURIComponent(showName);
                        var baseApiUrl = "http://services.tvrage.com/feeds/";
                        var search = baseApiUrl+"search.php?show=";
                        var fullShowInfo = baseApiUrl+"full_show_info.php?sid=";
                        $http.get(search+showName).success(function (searchXmlResult, status, headers, config) {
                            parser.parseString(searchXmlResult, function (err, searchResult) {
                                //console.dir(searchResult.Results.show[0]);

                                $http.get(fullShowInfo+searchResult.Results.show[0].showid[0]).success(function (data, status, headers, config) {
                                    parser.parseString(data, function (err, result) {
                                        //console.dir(result);

                                        defer.resolve(result.Show);
                                    });
                                }).error(function (data, status, headers, config) {
                                    defer.reject(data);
                                });
                            });
                        }).error(function (data, status, headers, config) {
                            defer.reject(data);
                        });

                        return defer.promise;
                    }

                    function getTvShowData(showName){
                        if(!showMap[showName]){
                            showMap[showName] = searchShow(showName);
                        }
                        return showMap[showName];
                    }

                    return {
                        getTvShowData: getTvShowData,
                        getEpisodeTitle: function(showData, season, episode){
                            if(showData.Episodelist[0].Season[season-1] && showData.Episodelist[0].Season[season-1].episode[episode-1]) {
                                return showData.Episodelist[0].Season[season - 1].episode[episode - 1].title[0];
                            }
                            return null;
                        },
                        getShowName: function(showData){
                            return showData.name[0];
                        },
                        getShowGenres: function(showData){
                            return showData.genres[0].genre.join(",");
                        }
                    };
                }];

            }
        ]);

})();