irulan.directive('pages', function() {
  console.log("pages directive")
  return {
    restrict: 'E',
    transclude: true,
    template:
      '<div ng-repeat="(name, page) in pages"><page ng-pagename="{{name}}">{{name}}</page><ng-transclude></ng-transclude></div>',
  }
})

irulan.directive('page', ['$filter', function($filter) {
  return {
    restrict: 'E',
    link: function($scope, $element, $attrs, controller, $transclude) {
      console.log('inject page!');
      if (!$transclude) {
        throw minErr('ngTransclude')('orphan',
          'Illegal use of ngTransclude directive in the template! ' +
          'No parent directive that requires a transclusion found. ' +
          'Element: {0}',
          startingTag($element)
        );
      }

      page = $scope.pages[$attrs['ngPagename']];
      //console.log($filter('pageRenderer')(page));
      $element[0].innerHTML = $filter('pageRenderer')(page);
    }
  }
}])

// This filter takes a "page" object and runs it through the appropraite
//  functions to convert it from Markdown/Wiki Syntax, etc to HTML
irulan.filter('pageRenderer', ['$sce', function($sce) {
  return function(page) {
    if (page.sourceFormat == "md") {
      return marked(page.content);
    }
    else {
      return "I don't know how to render this page: " + JSON.stringify(page);
    }
  }
}])
