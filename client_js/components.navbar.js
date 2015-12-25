angular.module('components', [])
  // The way that items are added to the "navbar" is a little complicated.  You
  //  can't ng-transclude on the same element that you're doing a ng-repeat= on.
  //  I'm not entirely sure I understand why to be honest.  It's got to do with
  //  the scope of the transclude.  Read this page:
  //  https://github.com/angular/angular.js/issues/7874
  //
  // I was unable to get the provided example on the above page working but I
  //  was able to modify it enough to suit my needs.
  //
  // The addNavItem item in the navbar directive stores the desired HTML in a
  //  property of the navitem object that is appended to the navitems array.
  //
  // The template on the navbar directive uses ng-repeat= to create an empty li
  //  for each item and sets the "inject" attribute.  The inject directive is
  //  then called to handle this attribute.  This directive fetches the HTML
  //  from where the navbar directive stashed it and drops it into the innerHTML
  //  of the li.
  .controller('ctrl', function ($scope) {
    // This empty controller is here to provide a scope to work within.
  })
  .directive('inject', function() {
    return {
      link: function($scope, $element, $attrs, controller, $transclude) {
        console.log('navbar item inject!');
        if (!$transclude) {
          throw minErr('ngTransclude')('orphan',
            'Illegal use of ngTransclude directive in the template! ' +
            'No parent directive that requires a transclusion found. ' +
            'Element: {0}',
            startingTag($element)
          );
        }
        var innerScope = $scope.$new();
        $element[0].innerHTML = $scope.$parent.$parent.navitems[$scope.$parent.$parent.renderedItems].innerHTML;
        $scope.$parent.$parent.renderedItems++;
      }
    }
  })

  .directive('navbar', function($parse) {
    return {
      restrict: 'E',
      transclude: true,
      scope: { title: '@'},
      controller: function($scope, $element) {
        console.log("navbar.controller()");
        console.log($scope);
        var navitems = $scope.navitems = [];
        var renderedItems = $scope.renderedItems = 0;

        $scope.select = function(navitem) {
          angular.forEach(navitems, function(navitem) {
            navitem.selected = false;
          });
          navitem.selected = true;
        }

        this.addNavItem = function(navitem, element, attrs) {
          console.log('navbar.controller().addNavItem()');
          navitem.innerHTML = element[0].outerHTML;
          if (navitems.length == 0) $scope.select(navitem);
          navitems.push(navitem);
        }
      },
      template:
        '<nav class="navbar navbar-inverse">' +
        '  <div class="container-fluid">' +
        '    <div class="navbar-header">' +
        '      <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">' +
        '        <span class="sr-only">Toggle navigation</span>' +
        '        <span class="icon-bar"></span>' +
        '        <span class="icon-bar"></span>' +
        '        <span class="icon-bar"></span>' +
        '      </button>' +
        '      <a class="navbar-brand" href="#">{{title}}</a>' +
        '    </div>' +
        '    <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1" ng-controller="ctrl">' +
        '        <ul class="nav navbar-nav">' +
        '        <li ng-repeat="navitem in navitems" inject="{{$index}}"></li>' +
        '        <li class="dropdown">' +
        '          <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">Dropdown <span class="caret"></span></a>' +
        '          <ul class="dropdown-menu" role="menu">' +
        '            <li><a href="#">Action</a></li>' +
        '            <li><a href="#">Another action</a></li>' +
        '            <li><a href="#">Something else here</a></li>' +
        '            <li class="divider"></li>' +
        '            <li><a href="#">Separated link</a></li>' +
        '            <li class="divider"></li>' +
        '            <li><a href="#">One more separated link</a></li>' +
        '          </ul>' +
        '        </li>' +
        '      </ul>' +
        '      <div style="display: none" ng-transclude></div>' +
        '      <form class="navbar-form navbar-left" role="search">' +
        '        <div class="form-group">' +
        '          <input type="text" class="form-control" placeholder="Search">' +
        '        </div>' +
        '        <button type="submit" class="btn btn-default">Submit</button>' +
        '      </form>' +
        '      <ul class="nav navbar-nav navbar-right">' +
        '        <li><a href="#">Link</a></li>' +
        '      </ul>' +
        '    </div>' +
        '  </div>' +
        '</nav>',
      //replace: true
    };
  })

  .directive('navlink', function() {
    console.log('navlink()');
    return {
      require: '^navbar',
      restrict: 'E',
      transclude: true,
      scope: { title: '@' },
      link: function(scope, element, attrs, navbarController) {
        console.log('navlink.link()');
        navbarController.addNavItem(scope, element, attrs);
      },
      template:
        '<a href="#" ng-transclude></a>',
      replace: true
    };
  })
