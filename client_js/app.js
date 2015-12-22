angular.module('irulan', ['components', 'ngSanitize'])
  .filter('unsafe', ['$sce', function($sce) {
    return function(htmlCode) {
      console.log('is this called?');
      console.log($sce);
      return $sce.trustAsHtml(htmlCode);
    }
  }]);
