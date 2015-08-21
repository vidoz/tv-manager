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

    $scope.findGarbage = function findGarbage(){
        dir.files($scope.params.sourceDir, function (err, files) {
            $scope.files.source.splice(0);
            $timeout(function () {
                angular.forEach(files, function(fsFileName){
                    var ext = path.extname(fsFileName);
                    //console.log(fsFileName, ext);
                    if(ext=='.txt' || ext=='.nfo') {
                        $scope.files.source.push({name: fsFileName});
                    }
                });
            });
        });
    };

    $scope.removeElements = function removeElements(elements){
        angular.forEach(elements, function(elem){
            //console.log(elem);
            var stat = fs.statSync(elem.name);
            if(stat.isDirectory()) {
                fs.rmdirSync(elem.name);
            }else{
                fs.unlinkSync(elem.name)
            }
        });
        alert("Done");
        $timeout(function(){
            $scope.files.source.splice(0);
        },0);
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
