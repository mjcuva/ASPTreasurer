
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
                 'Membership Education',
                 'Alumni',
                 'Athletic',
                 'Brotherhood', 
                 'House Manager'];

ASPControllers.controller('mainCtrl', ['$scope', '$http', '$filter', function($scope, $http, $filter){

    $scope.transactions = [];
    $scope.semesters = ['Fall 2015', 'Spring 2015'];
    $scope.selectedSemester = $scope.semesters[0];
    
    $http.get('/api/currentuser').success(function(data, status, headers, config){
        $scope.user = data;

        $scope.predicate = '-date';

        $scope.authorized = function(){
            if($scope.user.admin === true){
                return true;
            }else{
                return false;
            }
        };
    });

    $scope.selectNewSemester = function(){
        getTransactions();
        getBudget();
        createGraph("#graph", $scope.selectedSemester);
    };

    // Made function so it can update on select change
    function getTransactions(){
        $http.get('/api/transactions?sem=' + $scope.selectedSemester).success(function(data, status, headers, config){
            $scope.transactions = data;
            $scope.transactions.forEach(function(t){
                t.editing = false;
                t.date = new Date(t.date);
            });
            $scope.totalSpent = totalTransactions($scope.transactions);
        });
    }

    $scope.addTransaction = function(){
        $scope.selectedSemester = "Fall 2015";
        getTransactions();
        $scope.transactions.push({'cost':0, 'date':new Date(), 'description':'', 'position':positions[0], 'editing':true, "semester": "Fall 2015"});
    };

    $scope.positions = positions;

    $scope.edit = function(transaction){
        transaction.editing = true;
    };

    $scope.save = function(transaction){
        transaction.editing = false;
        $http.post('/api/transactions', transaction).success(function(data, status, headers, config){
            console.log(data);
            createGraph('#graph', $scope.selectedSemester);
        });
    };

    $scope.delete = function(transaction){
        console.log(transaction);
        $http.delete('/api/transactions/' + transaction._id).success(function(data, status, headers, config){
            var index = $scope.transactions.indexOf(transaction);
            if (index > -1) {
                $scope.transactions.splice(index, 1);
            }
            console.log(data);
            createGraph('#graph', $scope.selectedSemester);
        });
    };

    // Get Budget
    function getBudget(){
        $http.get('/api/budgets?sem=' + $scope.selectedSemester).success(function(data, status, header, config){
            budgets = data;
            $scope.totalBudget = totalBudget(budgets);
        });
    }

    getTransactions();
    getBudget();
    

}]);


ASPControllers.controller('budgetCtrl', ['$scope', '$http', function($scope, $http){
    $scope.positions = positions;

    $scope.budgets = [];

    $scope.semesters = ['Fall 2015', 'Spring 2015'];
    $scope.selectedSemester = $scope.semesters[0];

    $scope.changeSelectedSemester = function(){
        getBudgets();
    };

    $scope.predicate = 'position';

    $scope.addBudget = function(){
        $scope.budgets.push({"position": positions[0], "amount":0, editing: true, "semester": "Fall 2015"});
    };

    $scope.edit = function(budget){
        budget.editing = true;
    };

    $scope.save = function(budget){
        budget.editing = false;
        $http.post('/api/budgets', budget).success(function(data, status, headers, config){
            console.log(data);
            $scope.total = totalBudget($scope.budgets);
        });
    };

    function getBudgets(){
        $http.get('/api/budgets?sem='+$scope.selectedSemester).success(function(data, status, header, config){
            $scope.budgets = data;
            $scope.budgets.forEach(function(b){
                b.editing = false;
            });

            $scope.total = totalBudget($scope.budgets);
        });
    }
    

    $scope.total = 0;
    
}]);

ASPControllers.controller('usersCtrl', ['$scope', '$http', function($scope, $http){
    $scope.users = [];

    $http.get('/api/users').success(function(data, status, header, config){
        $scope.users = data;
        $scope.users.forEach(function(u){
            u.editing = false;
        });
    });

    $scope.addUser = function(){
        $scope.users.push({"name":"", "email":"", "admin": false, "editing":true});
    };

    $scope.save = function(u){
        // Save
        u.editing = false;
        $http.post('/api/users', u).success(function(data, status, header, config){
            console.log(data);
        });
    };

}]);

totalBudget = function(input){
    var total = 0;
    for(var i in input){
        total += parseInt(input[i].amount);
    }
    return total;
};

totalTransactions = function(trans){
    var total = 0;
    for(var i in trans){
        total += parseInt(trans[i].cost);
    }
    return total;
};

