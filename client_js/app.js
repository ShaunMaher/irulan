var irulan = angular.module('irulan', ['components', 'ngResource', 'ngSanitize'])
  .filter('unsafe', ['$sce', function($sce) {
    return function(htmlCode) {
      console.log('is this called?');
      console.log($sce);
      return $sce.trustAsHtml(htmlCode);
    }
  }])
  .config(function($locationProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');
  })
  .factory('WikiPage', ['Page', function(Page) {
    var wikipage = new Page;
    wikipage.name = '';
    wikipage.sourceFormat = 'txt';
    wikipage.returnedJson = '';
    wikipage.content = '';
    return wikipage;
  }])
  .service('Pages', ['Page', 'WikiPages', '$resource', function(Page, WikiPages, $resource){
    this.WikiPages = WikiPages
    this.Page = Page

    this.get = function(options, callback) {
      return this.WikiPages.get(options, callback)
    }
    this.new = function() {
      return new Page;
    }
  }])
  .service('WikiPages', ['WikiPage', '$resource', function(WikiPage, $resource) {
    this.wikipages = [];
    this.resource = $resource('/pages/wikipages/:name');
    this.get = function(options, callback) {
      console.log(options)
      var context = [];
      context.options = options;
      context.thisWikiPage = WikiPage;
      console.log(context.thisWikiPage);
      context.callback = callback;
      context.wikipages = this.wikipages;
      this.resource.get(options, (function(value) {
        console.log(value);
        thisWikiPage = this.thisWikiPage;
        thisWikiPage.name = this.options.name;
        thisWikiPage.content = value.content;
        thisWikiPage.sourceFormat = value.sourceFormat;
        thisWikiPage.returnedJson = value;
        context.callback(thisWikiPage);
      }).bind(context), (function(res){
        console.log("everything went to hell");
        console.log(res);
      }));
      return context.thisWikiPage
    }
  }])
  .controller('IrulanController', ['$scope', '$location', 'Pages', function($scope, $location, Pages) {
    console.log($scope);

    $scope.pages = {};

    console.log($location.path());

    var newpage = Pages.new();
    $scope.pages['start'] = newpage;

    $scope.pages['wikipage:home'] = Pages.get({ name: 'home' }, function(page) {
      console.log(page);
      //$scope.pages['wikipage:home'] = page;
    })

    //var context = {};
    //context.pagename = 'wikipage:home';

    //$scope.$watch(
    //  function() {
    //    return JSON.stringify($scope.pages['wikipage:home']);
    //  },
    //  (function() {
    //    console.log("value changed: " + context.pagename);
    //    pageElements = angular.element(document).find("page");
    //    console.log(pageElements);
    //    for (var index=0;index<pageElements.length;index++) {
    //      page = pageElements[index];
    //      if (page.attributes['ng-pagename'].value == context.pagename) {
    //        console.log('need to update...');
    //        console.log(JSON.stringify(page));
    //        page.outerHTML('<page ng-pagename="' + context.pagename + '"></page>');
    //      }
    //    }
    //  }).bind(context)
    //)
  }]);
