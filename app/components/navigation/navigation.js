(function () {
    'use strict';

    var dep = ['ngRoute'];

    angular.module('angular-navigation', dep)
        .provider('manifest', [
            '$routeProvider',
            function ($routeProvider) {
                var self = this;
                var otherwise = "home";
                var manifests = window.manifests || {};
                var coreResolvers = {
                    manifest: ["manifest", "$route", function (manifest, $route) {
                        return manifest.getManifest($route.current.$$route.moduleName);
                    }],
                    currentView: ["$route", function ($route) {
                        return $route.current.$$route.viewName;
                    }]
                };

                if (!angular.isDefined(window.manifests)) {
                    console.warn("[WARNING] :: window.manifests not defined! run grunt task to generate it!");
                }

                //Private methods
                function capitalize(str) {
                    return str.charAt(0).toUpperCase() + str.slice(1);
                }

                function parseTemplate(templateUrl) {
                    var tokReg = "[^/].*";

                    var ret;
                    var parameters = {};
                    //    = {};
                    //ret.template = templateUrl;
                    //ret.parameters = {};
                    //ret.urlReg = null;

                    //TODO: da migliorare l'espressione regolare
                    if (templateUrl.indexOf(":") != -1) {
                        var toks = templateUrl.split('/');
                        for (var x in toks) {
                            if (toks[x].indexOf(":") == 0) {
                                if (toks[x].indexOf(".") != -1) {
                                    parameters[toks[x].slice(1, toks[x].lastIndexOf("."))] = x;
                                } else {
                                    parameters[toks[x].slice(1)] = x;
                                }
                                toks[x] = tokReg;
                            }
                        }
                        ret = new RegExp(toks.join("/") + "(" +tokReg+ ")?");

                    } else {
                        ret = new RegExp('^'+templateUrl+'$');
                    }
                    return ret;
                }


                //Public Methods
                this.init = function () {
                    for (var x in manifests) {
                        var m = manifests[x];
                        m.name = m.name || x;
                        m.url = (angular.isDefined(m.url) ? m.url : "/"+ m.name);
                        m.url = m.url.indexOf("/") != 0 ? '/' + m.url : m.url;
                        m.urlRegex = parseTemplate(m.url);
                        m.ctrl = m.ctrl || capitalize(m.name) + 'Ctrl';
                        m.views = m.views || [];
                        m.params = m.params || [];
                        m.reloadOnSearch = (angular.isDefined(m.reloadOnSearch) && m.reloadOnSearch.constructor === Boolean) ? m.reloadOnSearch : true;
                        m.templateUrl = m.templateUrl || null;
                        m.keepFirstLevel = (angular.isDefined(m.keepFirstLevel) && m.keepFirstLevel.constructor === Boolean) ? m.keepFirstLevel : false;

                        if (m.otherwise) {
                            otherwise = m.name;
                        }

                        for (var y in m.views) {
                            var v = m.views[y];
                            v.name = v.name || y;
                            v.url = v.url ?  v.url : m.url + '/' + v.name;
                            v.url = v.url.indexOf("/") != 0 ? '/' + v.url : v.url;
                            v.urlRegex = parseTemplate(v.url);
                            v.ctrl = v.ctrl || capitalize(v.name) + 'Ctrl'
                            v.reloadOnSearch = (angular.isDefined(v.reloadOnSearch) && v.reloadOnSearch.constructor === Boolean) ? v.reloadOnSearch : true;
                            v.templateUrl = v.templateUrl || null;
                        }
                    }

                };

                this.getManifest = function (name) {
                    if (name) {
                        return manifests[name];
                    }
                    return manifests;
                };

                this.getByUrl = function (url) {
                    if(url.indexOf('/') != 0){
                        url = '/'+url;
                    }

                    for (var x in manifests) {
                        if (manifests[x].urlRegex.test(url)) {
                            return manifests[x];
                        } else if (manifests[x].views) {
                            for (var y in manifests[x].views) {
                                if (manifests[x].views[y].urlRegex.test(url)) {
                                    return manifests[x];
                                }
                            }
                        }
                    }

                    return null;
                };

                this.getOtherwise = function () {
                    if(otherwise){
                        return self.getManifest(otherwise);
                    }
                };

                this.generateRoutes = function (resolvers) {
                    var baseResolve = coreResolvers;
                    if (resolvers && resolvers.constructor === Object) {
                        angular.extend(baseResolve, resolvers);
                    }

                    var manifests = self.getManifest();

                    for (var x in manifests) {
                        var m = manifests[x];

                        //TODO manifest param keepFirstRoute
                        //First level route generation
                        if(!(m.views && Object.keys(m.views).length) || m.keepFirstLevel && m.keepFirstLevel === true){
                            var tplUrl = m.templateUrl || 'modules/' + m.name + '/partials/index.html';

                            $routeProvider.when(m.url, {
                                moduleName: m.name,
                                viewName: "",
                                templateUrl: tplUrl,
                                controller: m.ctrl,
                                resolve: baseResolve,
                                reloadOnSearch: m.reloadOnSearch
                            });
                        }


                        //TODO recursive for infinite level...
                        //Second level routes generation
                        if (m.views && Object.keys(m.views).length) {
                            for (var y in m.views) {
                                var v = m.views[y];
                                var subTplUrl = v.templateUrl || 'modules/' + m.name + '/partials/' + v.name + '.html';

                                $routeProvider.when(v.url, {
                                    moduleName: m.name,
                                    viewName: v.name,
                                    templateUrl: subTplUrl,
                                    controller: v.ctrl,
                                    resolve: baseResolve,
                                    reloadOnSearch: v.reloadOnSearch
                                });
                            }
                        }
                    }

                    //set $routeProvider.otherwise only if otherwise exists
                    if(self.getOtherwise()){
                        $routeProvider.otherwise({redirectTo: self.getOtherwise().url});
                    }

                };

                //Init
                this.init();

                /*Factory function*/
                this.$get = [function () {
                    return {
                        getManifest: self.getManifest,
                        getByUrl: self.getByUrl,
                        getOtherwise: self.getOtherwise,
                        generateRoutes: self.generateRoutes
                    };
                }];

            }
        ])
        .provider('nav', [
            "$httpProvider",
            function ($httpProvider) {
                var self = this;

                /*Factory function*/
                this.$get = ["$rootScope", "manifest", "$location", "$routeParams", function ($rootScope, manifestService, $location, $routeParams) {
                    var breadcrumbs = [];
                    var currentModule = null;

                    var secureChange = false;

                    function Module(manifest){
                        if(!manifest){
                            manifest = manifestService.getOtherwise();
                        }
                        this.manifest = manifest;
                        this.inputParams = {};
                        this.output = {};

                        this.setInput = function(data){
                            var externalParams = $location.search();
                            for(var x in this.manifest.params){
                                if(!angular.isDefined(data[x])){
                                    if(externalParams[x]){
                                        data[x] = externalParams[x];
                                    }else{
                                        console.log("missing param",x);
                                        return false;
                                    }
                                }
                            }
                            this.inputParams = data;
                            return true;
                        }
                    }

                    function goToModule(url, output, preventChangeLocation){
                        secureChange = true;
                        if(currentModule && output){
                            currentModule.output = output;
                        }

                        if(url.indexOf("?")!=-1){
                            url = url.substring(0, url.indexOf("?"));
                        }

                        var targetModule = new Module(manifestService.getByUrl(url));
                        if(targetModule.setInput(currentModule ? currentModule.output : (output || {}))){
                            if(currentModule){
                                //TODO enable when implement goBack
                                //breadcrumbs.unshift(currentModule);
                            }

                            currentModule = targetModule;
                            //console.log('currentModule', currentModule.manifest.name);

                            if(!preventChangeLocation) {
                                $location.url(url);
                            }
                        }else{
                            //TODO manage error
                            return false;
                        }
                        return true;
                    }

                    $rootScope.$on("$locationChangeStart", function($event, newUrl){
                        if(!secureChange) {
                            /*TODO clean this*/
                            var baseLen = $location.absUrl().length - $location.url().length;

                            var getPath = function(fullUrl) {
                                return fullUrl.substr(baseLen + 1, fullUrl.indexOf("?") > 0 ? fullUrl.indexOf("?") : undefined);
                            };
                            /**/
                            if (!goToModule(getPath(newUrl), {}, true)) {
                                $event.preventDefault();
                            }
                        }
                        secureChange = false;
                    });

                    return {
                        goToModule: goToModule,
                        goToHome: function(){
                            goToModule(manifestService.getOtherwise().url,{});
                        },
                        getCurrentModuleName: function(){
                            return currentModule.manifest.name;
                        },
                        goBack: function(){
                            //TODO implement me
                        },
                        setOutput: function(data){
                            currentModule.output = data;
                        },
                        getOutput: function(){
                            return currentModule.output || {};
                        },
                        getInputParams: function(){
                            return currentModule ? (currentModule.inputParams || {}) : {};
                        },
                        init: function(){
                            if(!goToModule($location.url().substring(1), {}, true)){
                                goToModule(manifestService.getOtherwise().url,{});
                            }
                        }
                    };
                }];
            }
        ])
    ;

})();