var myapp = angular.module('asp-budget', []);

myapp.controller('mainCtrl', ['$scope', '$http', function($scope, $http){
    $scope.test = "TEST"
    
    $http.get('/currentuser').success(function(data, status, headers, config){
        $scope.user = data;

        $scope.authorized = function(){
            if($scope.user.position === "Treasurer" || $scope.user.position === 'President' || $scope.user.position === 'Vice President'){
                return true;
            }else{
                return false;
            }
        }
    });

    $http.get('/transactions').success(function(data, status, headers, config){
        $scope.transactions = data;
    });

}]);