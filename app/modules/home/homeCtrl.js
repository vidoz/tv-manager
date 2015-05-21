/**
 * Created by alessandro on 15/10/14.
 */
angular.module(myAppName).controller('HomeCtrl', ["$scope", "$timeout", "$interpolate", "tvRage", "dataStorage", function ($scope, $timeout, $interpolate, tvRage, dataStorage) {
    var fs = require('fs');
    var mv = require('mv');
    var dir = require('node-dir');
    var path = require('path');
    //var ffmetadata = require("ffmetadata");

    function stripJunk(input) {
        var output = input;
        output = removeLast(output, "hdtv");
        output = removeLast(output, "dvdrip");
        output = removeLast(output, "720p");
        output = removeLast(output, "1080p");
        return output;
    }

    function removeLast(input, match) {
        var idx = input.toLowerCase().lastIndexOf(match);
        if (idx > 0) {
            input = input.substring(0, idx);
        }
        return input;
    }

    $scope.files = [];

    $scope.tableFilter = {};

    $scope.params = dataStorage.getData('settings');
    $scope.params.moveFile = false;
    $scope.params.renameFile = true;

    var getShowData = function getShowData(sourceName) {
        var show = {
            sourceName: stripJunk(sourceName)
        };
        var matches;
        show.pattern = null;
        for (var x in $scope.params.patterns) {
            matches = (new RegExp($scope.params.patterns[x])).exec(show.sourceName);
            if (matches && matches.length == 4) {
                show.pattern = x;
                break;
            }
        }
        if (matches) {
            show.name = matches[1].replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g, " ").trim();
            show.season = matches[2];
            show.episode = matches[3];
        }
        return show;
    };
    var getDirName = function getDirName(additionalData){
        var dirInterpolate = angular.extend({
            DS: path.sep,
            baseFolder: $scope.params.destinationDir
        }, additionalData || {});
        if ($scope.params.moveFile && $scope.params.destinationDir) {
            return $interpolate($scope.params.pathTemplate)(dirInterpolate);
        } else {
            return null;
        }
    };
    var processFile = function processFile(oldName) {
        var file = {
            filePath: oldName,
            dirName: path.dirname(oldName),
            oldFileName: path.basename(oldName),
            ext: path.extname(oldName),
            status: 0
        };
        if($scope.params.renameFile) {
            file.show = getShowData(file.oldFileName);
            file.status = file.show.pattern === null ? 500 : (file.show.pattern >= 3 ? 300 : 0);
            file.process = file.status < 300;
            if (file.status < 500) {
                tvRage.getTvShowData(file.show.name).then(function (data) {
                    file.show.name = tvRage.getShowName(data);
                    file.show.genres = tvRage.getShowGenres(data);
                    file.show.episodeTitle = tvRage.getEpisodeTitle(data, file.show.season, file.show.episode);
                    file.fileName = file.show.name ? $interpolate($scope.params.nameTemplate)(file.show) : file.show.sourceName;

                    file.destinationDir = getDirName({show: file.show}) || file.dirName;
                });
            }
        }else if($scope.params.moveFile){
            file.fileName = path.parse(oldName).name;
            file.destinationDir = getDirName() || file.dirName;

            file.status = 0;
            file.process = file.status < 300;
        }
        return file;
    };

    $scope.moveFiles = function () {
        angular.forEach($scope.files, function (file) {
            //fs.renameSync(self.value+"/arrow.321.hdtv-lol.mp4_prova", self.value+"/arrow.321.hdtv-lol.mp4");
            if (file.process) {

                mv(file.filePath, path.join(file.destinationDir, file.fileName) + file.ext, {mkdirp: true}, function (err) {
                    $timeout(function () {
                        file.status = !err ? 200 : 500;
                        //if(err){
                        //    file.error = err;
                        //}
                    }, 0);
                });
            }
        });
    };

    $scope.processFiles = function () {
        if (!$scope.params.sourceDir) {
            return;
        }
        dir.files($scope.params.sourceDir, function (err, files) {
            $timeout(function () {
                $scope.files.splice(0);
                angular.forEach(files, function (file) {
                    $scope.files.push(processFile(file));
                });
            });
        });
    };

    $scope.$watch('params', function (newValue) {
        if (newValue) {
            $scope.processFiles();
        }
    }, true);

    $('#sourceDirSelector').on('change', function (evt) {
        var self = this;
        $timeout(function () {
            $scope.params.sourceDir = self.value;
            //if(!$scope.params.destinationDir){
            //    $scope.params.destinationDir = $scope.params.sourceDir;
            //}
        }, 0);
    });

    $('#destinationDirSelector').on('change', function (evt) {
        var self = this;
        $timeout(function () {
            $scope.params.destinationDir = self.value;
            $scope.params.moveFile = true;
        }, 0);
    });
}]);
