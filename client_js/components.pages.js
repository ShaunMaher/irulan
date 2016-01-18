irulan.directive('pages', function() {
  console.log("pages directive")
  return {
    restrict: 'E',
    transclude: true,
    template:
      '<div id="pagesworkspace">'+
      '  <div ng-repeat="(name, page) in pages">'+
      '    <page ng-pagename="{{name}}">{{name}}</page>'+
      '    <ng-transclude></ng-transclude>'+
      '  </div>'+
      '</div>',
  }
})

irulan.directive('page', ['$filter', '$timeout', '$compile', function($filter, $timeout, $compile) {
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
      console.log($filter('pageRenderer')(page));
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
          //window.setTimeout(
          $timeout((function() {
            console.log("page update detected");

            // If we were to simply push the new HTML content into
            //  element[0].innerHTML then any directives it contains (e.g.
            //  "<warning>some text</warning>") would not get processed.
            //  Instead the new content is passed back through the compiler for
            //  further AngularJS processing.  Talking directly to the DOM
            //  (.innerHTML attribute) hides the update from AngularJS.
            var template = $filter('pageRenderer')(context.page);
            var linkFunction = $compile(template);
            var content = linkFunction(context.scope);
            context.element.empty();
            context.element.append(content);

          }).bind(context), 1, true);
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

// Register our ability to handle page requests in the "wiki/" name space
irulan.run(['WorkspaceProviders', 'Page', 'Pages', function(WorkspaceProviders, Page, Pages) {
  // How can I push the factory?
  WorkspaceProviders.push({
    namespace: null,
    factory: Page,
    workspace: Pages,
  });
}]);

irulan.service('Pages', ['Page', 'WorkspaceProviders', '$resource', function(Page, WorkspaceProviders, $resource){
  //this.Page = Page
  this.pages = {};

  console.log("Pages: WorkspaceProviders: " + JSON.stringify(WorkspaceProviders));

  this.get = function(options, callback) {
    for (index in WorkspaceProviders) {
      WorkspaceProvider = WorkspaceProviders[index];
      //console.log(PageNamespaceProvider);
      if (WorkspaceProvider.namespace) {
        if (options.name.substring(0, WorkspaceProvider.namespace.length) == WorkspaceProvider.namespace) {
          console.log(WorkspaceProvider.namespace + ' can handle the request for ' + options.name);
          console.log(WorkspaceProvider);
          var newPage = WorkspaceProvider.factory;
          return newPage.get(options, callback)
        }
      }
    }
    //TODO: work out what will happen if this happens
    return false;
  }

  this.show = function(options, $scope, callback) {
    console.log("Show Pages scope:")
    console.log($scope);

    //TODO: unhide the pagesworkspace div

    //TODO: I think that if we specifically target the correct
    //  NameSpaceProvider's own array of pages then we can have multiple apps
    //  using the common "Pages" provider with the actual pages for that
    //  namespace shown.
    $scope.pages = this.pages;

    $scope.pages[options.name] = this.get(options, function () {
      console.log("Show pages callback");
      callback();
    });
  }

  this.hide = function() {
    //TODO: hide the pagesworkspace div
  }

  this.new = function() {
    return new Page;
  }
}])

// This filter takes a "page" object and runs it through the appropraite
//  functions to convert it from Markdown/Wiki Syntax, etc to HTML
irulan.filter('pageRenderer', ['$filter', 'SourceRenderers', 'Pages', function($filter, SourceRenderers, Pages) {
  return function(page) {
    // The provided page might actually be just a pointer (alias) to another
    //  page
    if (page.alias) {
      //TODO
    }

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
