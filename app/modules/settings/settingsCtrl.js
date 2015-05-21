/**
 * Created by alessandro on 15/10/14.
 */
angular.module(myAppName).controller('SettingsCtrl', ["$scope", "$timeout", "dataStorage", function ($scope, $timeout, dataStorage) {
    $scope.settings = dataStorage.getData("settings");
    $scope.params = {};
    $scope.params.patterns = [
        "(.+?\\d{4}\\W\\D*?)[sS]?(\\d\\d?)\\D*?(\\d\\d).*", // this one works for titles with years
        "(.+?\\W\\D*?)[sS](\\d\\d?)[eE](\\d\\d?).*", // this one matches SXXEXX
        "(.+\\W\\D*?)[sS](\\d\\d?)\\D*?[eE](\\d\\d).*", // this one matches sXX.eXX
        "(.+\\W\\D*?)(\\d\\d?)\\D+(\\d\\d).*", // this one matches everything else
        "(.+\\W*)(\\d\\d?)(\\d\\d).*" // truly last resort
    ];
    $scope.params.nameTemplate = "{{name}} S{{season}}E{{episode}} - {{episodeTitle}}";
    $scope.params.pathTemplate = "{{baseFolder}}{{DS}}{{show.name}}{{DS}}{{show.name}} S{{show.season}}";

    $scope.addFilePattern = function(){
        $scope.settings.patterns.push("");
    };
    $scope.saveSettings = function(){
        dataStorage.getData("settings", $scope.settings);
    }
}]);
