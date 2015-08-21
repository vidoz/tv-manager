/**
 * Created by alessandro on 15/10/14.
 */
angular.module(myAppName).controller('CompareCtrl', ["$scope", "$timeout", "$q", "dataStorage", function ($scope, $timeout, $q, dataStorage) {
    var fs = require('fs');
    //var mv = require('mv');
    var dir = require('node-dir');
    var path = require('path');

    $scope.params = {};
    $scope.params.sourceDir = null;
    $scope.params.destinationDir = null;
    $scope.files = {
        source: [],
        destination: []
    };

    function processFile(fsFileName, basePath){
        var file = {
            filePath: fsFileName,
            relativePath: path.relative(basePath, fsFileName),
            dirName: path.dirname(fsFileName),
            fileName: path.basename(fsFileName),
            ext: path.extname(fsFileName)
        };
        return file;
    }
    function checkDestination(file){
        jQuery.each($scope.files.destination, function(index, destFile){
            if(destFile.relativePath == file.relativePath){
                destFile.fileExist = true;
                file.fileExist = true;
                return false;
            }
        });
    }
    $scope.compareDirectories = function compareDirectories(){
        if(!$scope.params.sourceDir || !$scope.params.destinationDir){
            alert("Missing folder");
            return;
        }
        //var deferSource = $q.defer();
        //var deferDestination = $q.defer();

        dir.files($scope.params.destinationDir, function (err, destinationFiles) {
            $scope.files.destination.splice(0);
            angular.forEach(destinationFiles, function (destinationFileName) {
                $scope.files.destination.push(processFile(destinationFileName, $scope.params.destinationDir));
            });
            dir.files($scope.params.sourceDir, function (err, sourceFiles) {
                $timeout(function () {
                    $scope.files.source.splice(0);
                    angular.forEach(sourceFiles, function (sourceFileName) {
                        var file = processFile(sourceFileName, $scope.params.sourceDir);
                        checkDestination(file);
                        $scope.files.source.push(file);
                    });
                });
            });
        });
    };

    $scope.countMissing = function countMissing(fileArray){
        var count = 0;
        angular.forEach(fileArray, function(f){
            if(!f.fileExist){
                count++;
            }
        });
        return count;
    };

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
