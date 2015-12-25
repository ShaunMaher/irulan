var irulan = angular.module('irulan', ['components', 'ngResource', 'ngSanitize'])
  .filter('unsafe', ['$sce', function($sce) {
    return function(htmlCode) {
      console.log('is this called?');
      console.log($sce);
      return $sce.trustAsHtml(htmlCode);
    }
  }])
  .factory('WikiPage', function() {
    this.name = '';
    this.sourceFormat = 'md';
    this.returnedJson = '';
    this.content = '';
    return this;
  })
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
        thisWikiPage.returnedJson = value;
        context.callback(thisWikiPage);
      }).bind(context), (function(res){
        console.log("everything went to hell");
        console.log(res);
      }));
    }
  }])
  .controller('IrulanController', ['$scope', 'WikiPages', function($scope, WikiPages) {
    console.log($scope);

    $scope.pages = {
      "page1": "Page 1"
    };

    WikiPages.get({ name: 'home' }, function(page) {
      console.log(page);
      $scope.pages['wikipage:home'] = page;
    })
  }]);
