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

// This filter takes a "page" object and runs it through the appropraite
//  functions to convert it from Markdown/Wiki Syntax, etc to HTML
irulan.filter('pageRenderer', function() {
  return function(page) {
    if (page.sourceFormat) {
      if (page.sourceFormat == null) {
        return page.content
      }
      else if (page.sourceFormat == "md") {
        var renderer = new marked.Renderer();
        var lexer = new marked.Lexer({});
        //console.log(lexer.rules);
        //console.log(renderer)
        renderer.link = function(href, title, text) {
          if (title == null) {
            title = page.name;
          }
          if (/:\/\//.test(href)) {
            console.log("absolute uri: " + href);
          }
          else if (/^\/\//.test(href)) {
            console.log("absolute uri (relative protocol): " + href);
          }
          else if (/^\//.test(href)) {
            console.log("relative uri (to site base): " + href);
          }
          else {
            console.log("relative uri: " + href);
            var base = page.name.split("/", 2)[0];
            //var relativeName = page.name.split(":", 2)[1];
            href = "/" + base + "/" + href
            console.log(href);
          }
          return '<a href="'+ href + '" title="' + title + '">' + text + '</a>';
        }
        var context = [];
        context.titleExtracted = false;
        context.page = page;
        renderer.heading = (function(string, level) {
          if ((level < 3) && (!context.titleExtracted)) {
            context.page.title = string;
            context.titleExtracted = true;
            return "";
          }
          else {
            level = level + 2;
            return '<h' + level + '>' + string + '</h' + level + '>';
          }
        }).bind(context);

        page.renderedHtml = marked(page.content, {renderer: renderer});
      }
      else {
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
})
