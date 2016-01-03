irulan.directive('pages', function() {
  console.log("pages directive")
  return {
    restrict: 'E',
    transclude: true,
    template:
      '<div ng-repeat="(name, page) in pages">'+
      '<page ng-pagename="{{name}}">{{name}}</page>'+
      '<ng-transclude></ng-transclude>'+
      '</div>',
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

      var page = $scope.pages[$attrs['ngPagename']];
      //console.log($filter('pageRenderer')(page));
      console.log($element)
      //$element[0].innerHTML = $filter('pageRenderer')(page);

      var context = {
        page: page,
        pagename: $attrs['ngPagename'],
        scope: $scope,
        element: $element,
        attrs: $attrs,
        filter: $filter,
        controller: controller,
        transclude: $transclude
      }
      $scope.$watch(
        (function() {
          return JSON.stringify($scope.pages[context.pagename]);
        }).bind(context),
        (function() {
          window.setTimeout((function() {
            console.log("page update detected");
            context.element[0].innerHTML = $filter('pageRenderer')(context.page);
          }).bind(context), 100);
        }).bind(context)
      )
    }
  }
}])

irulan.directive('warning', function() {
  console.log("warning directive")
  return {
    restrict: 'E',
    transclude: true,
    template:
      '<div class="alert alert-warning">'+
      '<ng-transclude></ng-transclude>'+
      '</div>',
  }
})

// Empty template for a "Page" object
irulan.factory('Page', function() {
  function Page() {
    this.name = '';
    this.title = 'Loading';
    this.sourceFormat = 'txt';
    this.content = 'empty content here';
  }
  //Page.prototype = {
  //  test: function() {
  //    return this.name;
  //  }
  //}
  return (Page);
})

// An array of Page Namespaces and the factories that can create them.  Not yet finished.
irulan.value('PageNamespaceProviders', Array());

irulan.service('Pages', ['Page', 'PageNamespaceProviders', '$resource', function(Page, PageNamespaceProviders, $resource){
  //this.Page = Page
  this.pages = {};

  console.log("Pages: PageNamespaceProviders: " + JSON.stringify(PageNamespaceProviders));

  this.get = function(options, callback) {
    for (index in PageNamespaceProviders) {
      PageNamespaceProvider = PageNamespaceProviders[index];
      //console.log(PageNamespaceProvider);
      if (options.name.substring(0, PageNamespaceProvider.namespace.length) == PageNamespaceProvider.namespace) {
        //console.log(PageNamespaceProvider.namespace + ' can handle the request for ' + options.name);
        var newPage = PageNamespaceProviders[0].factory;
        return newPage.get(options, callback)
      }
    }
    //TODO: work out what will happen if this happens
    return false;
  }
  this.new = function() {
    return new Page;
  }
}])

// This filter takes a "page" object and runs it through the appropraite
//  functions to convert it from Markdown/Wiki Syntax, etc to HTML
irulan.filter('pageRenderer', ['$filter', 'SourceRenderers', function($filter, SourceRenderers) {
  return function(page) {
    if (page.sourceFormat) {
      if (page.sourceFormat == null) {
        return page.content
      }

      var rendered = false;
      for (index in SourceRenderers) {
        SourceRenderer = SourceRenderers[index];
        if (SourceRenderer.sourceFormat == page.sourceFormat) {
          console.log('Using ' + SourceRenderer.name);
          page.renderedHtml = $filter(SourceRenderer.name)(page);
          rendered = true;
        }
      }
      if (!rendered) {
        page.renderedHtml = "I don't know how to render this page: " + JSON.stringify(page);
      }

      var html = '<div style="margin-left: 2em; margin-right: 2em;" class="panel panel-primary">';
      //if (page.title != null) {
      html = html + '<div class="panel-heading">' +
        '<h3 class="panel-title">' +
        page.title +
        '<span style="float: right; margin-top: -0.3em;">' +
          '<button type="button" class="close" style="padding-left: 0.4em; font-size: 150%; color: white;" data-dismiss="modal" aria-hidden="true">&#x2715;</button>' +
          '<button type="button" class="close" style="padding-left: 0.4em; font-size: 150%; color: white;" data-dismiss="modal" aria-hidden="true">&#x23bd;</button>' +
        '</span>' +
        '</h3></div>';
      //}
      html = html + '<div class="panel-footer"> test' +
      '<span style="float: right; margin-top: -0.3em;">' +
        '<button type="button" class="close" style="padding-left: 0.4em; font-size: 150%;" data-dismiss="modal" aria-hidden="true">&#x21BB;</button>' +
        '<button type="button" class="close" style="padding-left: 0.4em; font-size: 190%;" data-dismiss="modal" aria-hidden="true">&#xE207;</button>' +
      '</span>' +
      '</div>' +
      '<div class="panel-body">' + page.renderedHtml + '</div></div>';
      return html;
    }
    else {
      console.log("Rendering page raw since it has no sourceFormat")
      return page
    }
  }
}])
