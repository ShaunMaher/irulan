var irulan = angular.module('irulan', ['components', 'ngResource', 'ngSanitize', 'ngRoute'])
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
    function WikiPage() {
      //What here?
    }
    //var wikipage = new Page;
    //wikipage.name = '';
    //wikipage.sourceFormat = 'txt';
    //wikipage.returnedJson = '';
    //wikipage.content = '';
    return WikiPage;
  }])
  .service('Pages', ['Page', 'WikiPages', '$resource', function(Page, WikiPages, $resource){
    this.WikiPages = WikiPages
    //this.Page = Page
    this.pages = {};

    this.get = function(options, callback) {
      return this.WikiPages.get(options, callback)
    }
    this.new = function() {
      return new Page;
    }
  }])
  .service('WikiPages', ['WikiPage', '$resource', function(WikiPage, $resource) {
    this.wikipages = [];
    this.resource = $resource('/pages/wiki/:name');

    this.get = function(options, callback) {
      console.log(options)

      // We need this information to be available to the callback function so we
      //  create a "context" object which will become the "this" object within
      //  the callback function.
      var context = [];
      context.options = options;
      console.log("what comes next should be an empty page object:")
      context.thisWikiPage = new WikiPage;
      console.log(context.thisWikiPage);
      context.thisWikiPage.name = options.name
      console.log(context.thisWikiPage);
      context.callback = callback;
      context.wikipages = this.wikipages;

      // We need to remove the "wiki:" from the start of the requested page
      //  name.
      options.name = options.name.replace(/^wiki\//i, "");
      console.log("will request: " + options.name);

      // Make the http call
      this.resource.get(options, (function(value) {
        console.log(value);
        thisWikiPage = this.thisWikiPage;
        //thisWikiPage.name = this.options.name;
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

    //TODO: Move this to a .config? item
    $scope.homePage = 'wiki/home';

    $scope.pages = Pages.pages;

    console.log($location.path());

    //var newpage = Pages.new();
    //$scope.pages['start'] = newpage;

    //$scope.pages['wiki/home'] = Pages.get({ name: 'wiki/home' }, function(page) {
    //  console.log(page);
    //  //$scope.pages['wikipage:home'] = page;
    //})

    $scope.$on('$locationChangeStart', function(event, next, current) {
      //console.log(event);
      //console.log($location.path());
      console.log(Pages.pages);
      var newpage = $location.path();
      newpage = newpage.replace(/^\//, "");
      if (newpage.length < 1) {
        newpage = $scope.homePage;
      }

      if(!(newpage in Pages.pages)) {
        console.log("Load page not previously loaded: " + newpage);
        Pages.pages[newpage] = Pages.get({ name: newpage }, function(page) {
          console.log(Pages.pages);
        });
      }
    });

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
