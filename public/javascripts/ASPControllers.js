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

ASPControllers.controller('mainCtrl', ['$scope', '$http', '$filter', function($scope, $http, $filter){

    $scope.transactions = [];
    
    $http.get('/api/currentuser').success(function(data, status, headers, config){
        $scope.user = data;

        $scope.predicate = '-date';

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
        $scope.transactions.forEach(function(t){
            t.editing = false;
            t.date = new Date(t.date);
        });
    });

    $scope.addTransaction = function(){
        $scope.transactions.push({'cost':0, 'date':new Date(), 'description':'', 'position':positions[0], 'editing':true});
    }

    $scope.positions = positions;

    $scope.edit = function(transaction){
        transaction.editing = true;
    }

    $scope.save = function(transaction){
        transaction.editing = false;
        $http.post('/api/transactions', transaction).success(function(data, status, headers, config){
            console.log(data);
        });
    }

    $scope.delete = function(transaction){
        console.log(transaction);
        $http.delete('/api/transactions/' + transaction._id).success(function(data, status, headers, config){
            var index = $scope.transactions.indexOf(transaction);
            if (index > -1) {
                $scope.transactions.splice(index, 1);
            }
            console.log(data);
        });
    }

}]);


ASPControllers.controller('budgetCtrl', ['$scope', '$http', function($scope, $http){
    $scope.positions = positions;

    $scope.budgets = [];

    $scope.predicate = 'position';

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