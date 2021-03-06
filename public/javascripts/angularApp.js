var budgetApp = angular.module('asp-budget', ['ngRoute', 'ASPControllers']);

budgetApp.config(['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    $routeProvider.
    when('/', {
        templateUrl: 'partials/main.html',
        controller: 'mainCtrl'
    }).
    when('/budget', {
        templateUrl: 'partials/budgets.html',
        controller: 'budgetCtrl'
    }).
    when('/users', {
        templateUrl: 'partials/users.html',
        controller: 'usersCtrl'
    }).
    otherwise({
        redirectTo: '/'
    });

    $locationProvider.html5Mode(true);
}]);



