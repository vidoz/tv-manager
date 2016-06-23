/**
 * Created by alessandro on 15/10/14.
 */
angular.module(myAppName).controller('OnePieceCtrl', ["$scope", "$timeout", "$http", "$q", function ($scope, $timeout, $http, $q) {
    $scope.params = {};

    function MangaEdenApi(){
        var baseImageUrl = "http://cdn.mangaeden.com/mangasimg";
        this.baseImageUrl = baseImageUrl;
        this.baseApiUrl = "https://www.mangaeden.com/api";

        this.languages = {
            "en": 0,
            "it": 1
        };

        var mangaKeys = {
            "title": "t",
            "id": "i",
            "alias": "a",
            "status": "s",
            "category": "c",
            "lastChapterDate": "ld",
            "views": "h"
        };
        var chapterKeys = {
            "number": 0,
            "date": 1,
            "title": 2,
            "id": 3
        };
        var imageKeys = {
            "number": 0,
            "relativeUrl": 1,
            "width": 2,
            "height": 3
        };
        var mangaList = null;

        var mangaDetails = {};

        this.getMangaList = function(language){
            if(mangaList){
                return $q.when(mangaList);
            }else{
                return $http.get(this.baseApiUrl+"/list/"+this.languages[language]).then(function(data){
                    mangaList = [];
                    angular.forEach(data.data.manga, function(mangaEden){
                        var m = {};
                        angular.forEach(mangaKeys, function(mangaEdenKey, myKey){
                            m[myKey] = mangaEden[mangaEdenKey];
                        });
                        mangaList.push(m);
                    });
                    return mangaList;
                });
            }
        };
        this.getChapterList = function(manga){
            if(mangaDetails[manga.id]){
                return $q.when(mangaDetails[manga.id].chapters);
            }else{
                return $http.get(this.baseApiUrl+"/manga/"+manga.id).then(function(data){
                    mangaDetails[manga.id] = data.data;
                    var chapters = [];
                    angular.forEach(mangaDetails[manga.id].chapters, function(mangaEdenChapter){
                        var chapter = {};
                        angular.forEach(chapterKeys, function(mangaEdenKey, myKey){
                            chapter[myKey] = mangaEdenChapter[mangaEdenKey];
                        });
                        chapters.push(chapter);
                    });
                    mangaDetails[manga.id].chapters = chapters;
                    return mangaDetails[manga.id].chapters;
                });
            }
        };
        this.getChapterImages = function(chapter){
            return $http.get(this.baseApiUrl+"/chapter/"+chapter.id).then(function(data){
                var imageList = [];
                angular.forEach(data.data.images, function(mangaEdenImage){
                    var image = {};
                    angular.forEach(imageKeys, function(mangaEdenKey, myKey){
                        image[myKey] = mangaEdenImage[mangaEdenKey];
                        if(myKey == 'relativeUrl'){
                            image['url'] =  baseImageUrl + "/" + mangaEdenImage[mangaEdenKey];
                        }
                    });
                    imageList.push(image);
                });
                return imageList;
            });
        };
    }

    $scope.mangaList = null;
    $scope.chapterList = null;
    $scope.imageList = null;

    $scope.filters = {
        manga: {},
        chapter: {},
        image: {}
    };

    //function Pagination(pageItems){
    //    this.pageItems = pageItems;
    //    this.currentPage = 0;
    //    this.totalItems = 0;
    //    this.pages = [];
    //
    //    this.updatePagination = function(totalItems){
    //        this.totalItems = totalItems;
    //        this.currentPage = 0;
    //        this.pages = [];
    //
    //        for(var i=0; i < Math.ceil(totalItems/this.pageItems); i++){
    //            this.pages.push(i);
    //        }
    //    };
    //    this.goToPage = function(page){
    //        this.currentPage = page;
    //    }
    //}

    //$scope.pagination = new Pagination(25);

    var mangaApi = new MangaEdenApi();

    mangaApi.getMangaList("it").then(function(data){
        $scope.mangaList = data;
        //$scope.pagination.updatePagination(data.length);
    });
    $scope.getMangaChapters = function(manga){
        mangaApi.getChapterList(manga).then(function(data){$scope.chapterList = data});
    };
    $scope.getChapterImages = function(chapter){
        mangaApi.getChapterImages(chapter).then(function(data){$scope.imageList = data});
    };

    $scope.backToMangaList = function(){
        $scope.chapterList = null;
        $scope.imageList = null;
    };
    $scope.backToChapterList = function(){
        $scope.imageList = null;
    };

}]);
