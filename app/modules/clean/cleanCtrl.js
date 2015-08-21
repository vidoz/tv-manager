/**
 * Created by alessandro on 15/10/14.
 */
angular.module(myAppName).controller('CleanCtrl', ["$scope", "$timeout", "$q", "dataStorage", function ($scope, $timeout, $q, dataStorage) {
    var fs = require('fs');
    //var mv = require('mv');
    var dir = require('node-dir');
    var path = require('path');

    $scope.params = {};
    $scope.params.sourceDir = null;

    $scope.files = {
        source: []
    };

    $scope.findEmptyFolders = function findEmptyFolders() {
        if (!$scope.params.sourceDir) {
            alert("Missing folder");
            return;
        }
        //var deferSource = $q.defer();
        //var deferDestination = $q.defer();

        dir.subdirs($scope.params.sourceDir, function (err, folders) {
            $scope.files.source.splice(0);
            angular.forEach(folders, function (folderPath) {
                dir.files(folderPath, function (err, files) {
                    $timeout(function () {
                        if (!files.length) {
                            $scope.files.source.push({name:folderPath});
                        }
                    });
                });
            });
        });
    };

    $scope.removeFolders = function removeFolders(folders){
        angular.forEach(folders, function(folder){
            //console.log(folder);
            fs.rmdirSync(folder.name);
        });
        alert("Done");
        $scope.findEmptyFolders();
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
}]);
