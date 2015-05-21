/**
 * Created by Alessandro on 05/10/2014.
 */

var dep = [
    'ngRoute',
    'ngResource',
    'ngSanitize',

    'ui.bootstrap',

    'angular-navigation',
    'tvRage',
    'dataStorage',

    'version'
];

angular.module('tvManager', dep)
    .config(['$routeProvider', "$provide", "manifestProvider", function ($routeProvider, $provide, manifestProvider) {
        var resolvers = {};
        manifestProvider.generateRoutes(resolvers);

        $provide.decorator('$controller', ["$delegate", function ($delegate) {
            return function (expression, locals, later, ident) {
//                locals.$scope.locale = locals.$scope.locale || (locals.locale ? locals.locale : $injector.get("locale"));
                if (locals.manifest) {
                    locals.$scope.manifest = locals.manifest;
                    locals.$scope.view = locals.currentView;
                }
                return $delegate(expression, locals, later, ident);
            };
        }]);

    }])
    .run(["nav", "dataStorage", function (nav, dataStorage) {
        var settings = dataStorage.getData('settings');
        if(!settings){
            settings = {};
            settings.patterns = [
                "(.+?\\d{4}\\W\\D*?)[sS]?(\\d\\d?)\\D*?(\\d\\d).*", // this one works for titles with years
                "(.+?\\W\\D*?)[sS](\\d\\d?)[eE](\\d\\d?).*", // this one matches SXXEXX
                "(.+\\W\\D*?)[sS](\\d\\d?)\\D*?[eE](\\d\\d).*", // this one matches sXX.eXX
                "(.+\\W\\D*?)(\\d\\d?)\\D+(\\d\\d).*", // this one matches everything else
                "(.+\\W*)(\\d\\d?)(\\d\\d).*" // truly last resort
            ];
            settings.nameTemplate = "{{name}} S{{season}}E{{episode}} - {{episodeTitle}}";
            settings.pathTemplate = "{{baseFolder}}{{DS}}{{show.name}}{{DS}}{{show.name}} S{{show.season}}";
            dataStorage.setData('settings', settings);
        }

        nav.init();
    }]);