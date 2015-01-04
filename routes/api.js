var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Transaction = mongoose.model('Transaction');
var Budget = mongoose.model('Budget');

router.get('/currentuser', function(req, res, next){
    User.findById(req.cookies.u, function(err, user){
        if(err){
            res.send(err);
        }else{
            res.json(user);
        }
    });
});


// Transactions
router.get('/transactions', function(req, res, next){
    Transaction.find(function(err, transactions){
        if(err){
            res.send(err);
        }else{
            res.json(transactions);
        }
    })
});

router.post('/transactions', function(req, res, next){

    Transaction.findById(req.body._id, function(err, trans){
        if(trans === null){
            var newTrans = new Transaction(req.body);
            newTrans.save(function(err, createdTrans){
                if(err){
                    res.send(err);
                }else{
                    res.json(createdTrans);
                }
            });
        }else{
            trans.cost = req.body.cost;
            trans.date = req.body.date;
            trans.description = req.body.description;
            trans.position = req.body.position;
            trans.save(function(err){
                if(err){
                    res.send(err);
                }else{
                    res.json(trans);
                }
            });
        }
    });

});

router.delete('/transactions/:id', function(req, res, next){
    console.log(req);
    Transaction.findById(req.params.id, function(err, trans){
        if(trans != null){
            trans.remove(function(err){
                if(err){
                    res.send(err);
                }else{
                    res.send('Deleted');
                }
            });
        }else{
            res.send("Doesn't exist");
        }
    });
});


// Users
router.post('/users', function(req, res, next){
    User.createAccount(req.body, function(err, user, hash){
        if(err){ res.send(err); }
        else{
            res.cookie('u', hash);
            res.json(user);
        }
    });
});

router.get('/users', function(req, res, next){
    User.LoggedIn(req.cookies.u, function(loggedin){
        if(loggedin){
            User.find({}, 'email name position', function(err, users){
                if(err){
                    res.send(err);
                }else{
                    res.json(users);
                }
            });
        }else{
            res.send("Not logged in");
        }
    });

});


// Budgets

router.get('/budgets', function(req, res, next){
    Budget.find(function(err, budgets){
        if(err){
            res.send(err);
        }else{
            res.json(budgets);
        }
    });
});

router.post('/budgets', function(req, res, next){
    var pos = req.body.position;
    var sem = req.body.semester;
    Budget.findOne({position: pos, semester: sem}, function(err, budget){
        if(budget === null && req.body.amount != 0){
            var newBudget = new Budget(req.body);
            newBudget.save(function(err, createdBudget){
                if(err){
                    res.send(err);
                }else{
                    res.json(createdBudget);
                }
            });
        }else if(budget != null){
            if(req.body.amount == 0){
                budget.remove(function(){
                    res.send('Removed');
                });
            }else{
                budget.amount = req.body.amount;
                budget.save(function(err){
                    if(err){
                        res.send(err);
                    }else{
                        res.json(budget);
                    }
                });
            }
        }
    });
});

module.exports = router;