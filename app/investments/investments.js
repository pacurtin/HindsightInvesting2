angular.module('hindsightInvesting.investments', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/investments', {
        templateUrl: 'investments/investments.html',
        controller: 'InvestmentsCtrl'
    });
}]);
