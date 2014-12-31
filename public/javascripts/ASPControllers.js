var ASPControllers = angular.module('ASPControllers', []);

var positions = ['President',
                 'Vice President',
                 'Treasurer',
                 'Recruitment',
                 'Social',
                 'Scholarship',
                 'Philantropy',
                 'Service',
                 'Fundraising',
                 'Family Relations',
                 'Secretary',
                 'Sergeant at Arms',
                 'Marshall',
                 'Membership Education'];

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
    $scope.positions = positions;

    $scope.budgets = [];

    $scope.addBudget = function(){
        $scope.budgets.push({"position": positions[0], "amount":0, editing: true, "semester": "Spring 2015"});
    }

    $scope.edit = function(budget){
        budget.editing = true;
    }

    $scope.save = function(budget){
        budget.editing = false;
        $http.post('/api/budgets', budget).success(function(data, status, headers, config){
            console.log(data);
        });
    }

    $http.get('/api/budgets').success(function(data, status, header, config){
        $scope.budgets = data;
        $scope.budgets.forEach(function(b){
            b.editing = false;
        });
    });
}]);

ASPControllers.controller('usersCtrl', ['$scope', '$http', function($scope, $http){
    $scope.users = [];

    $http.get('/api/users').success(function(data, status, header, config){
        $scope.users = data;
    });
}]);