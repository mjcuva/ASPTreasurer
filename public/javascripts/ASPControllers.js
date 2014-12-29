var ASPControllers = angular.module('ASPControllers', []);

ASPControllers.controller('mainCtrl', ['$scope', '$http', function($scope, $http){
    
    $http.get('/api/currentuser').success(function(data, status, headers, config){
        $scope.user = data;

        $scope.authorized = function(){
            if($scope.user.position === "Treasurer" || $scope.user.position === 'President' || $scope.user.position === 'Vice President'){
                return true;
            }else{
                return false;
            }
        }
    });

    $http.get('/api/transactions').success(function(data, status, headers, config){
        $scope.transactions = data;
    });

}]);


ASPControllers.controller('budgetCtrl', ['$scope', '$http', function($scope, $http){

}]);