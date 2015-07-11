var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Transaction = mongoose.model('Transaction');
var Budget = mongoose.model('Budget');

var nodemailer = require('nodemailer');
var sprintf = require("sprintf-js").sprintf

require('./auth.js');

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
    var semester = req.query.sem;
    if(semester == undefined){
        semester = "Fall 2015"
    }
    Transaction.find({"semester" : semester}, function(err, transactions){
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
            trans.semester = req.body.semester;
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
    var user = req.body;
    Budget.findOne({email:user.email}, function(err, u){
        if(u === null){
            res.redirect(307, "/api/sendemail");
        }else{
            u.name = user.name;
            u.admin = user.admin;
            u.save(function(err){
                if(err){
                    res.send(err);
                }else{
                    res.send("Updated.");
                }
            });
        }
    })
});

router.get('/users', function(req, res, next){
    User.LoggedIn(req.cookies.u, function(loggedin){
        if(loggedin){
            User.find({}, 'email name admin', function(err, users){
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
    var semesterOriginal = req.query.sem;
    if(semesterOriginal != undefined){
        semester = semesterOriginal.replace('%20', " ");
    }else{
        semester = "Fall 2015";
    }
    Budget.find({'semester':semester}, function(err, budgets){
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

// Graph
router.get('/graphdata', function(req, res, next){
    var main = {'name': "budgetapp", "children":[]};
    var semester = req.query.sem.replace('%20', ' ');
    Budget.find({"semester" : semester}, function(err, budgets){
        Transaction.find({"semester":semester}, function(err, transactions){
            for(budgetIndex in budgets){
                budget = budgets[budgetIndex];
                var budgetJson = {"name": budget.position, "type":"position", "size":budget.amount, children:[]};
                var totalUsed = 0;
                var used = {"name":"Used", "size":totalUsed, "children":[]};
                for(transactionIndex in transactions){
                    transaction = transactions[transactionIndex];
                    if(transaction.position === budget.position){
                        totalUsed += transaction.cost;
                        used.children.push({"name":transaction.description, "size":transaction.cost});
                        used.size = Math.min(totalUsed, budget.amount);
                    }
                }
                var unused = {"name": "Unused", "size": Math.max(budget.amount - totalUsed, 0)};
                budgetJson.children.push(unused);
                budgetJson.children.push(used);
                main.children.push(budgetJson);
            }
            res.json(main);
        });
    });
});

// Email
router.post('/sendemail', function(req, res, next){
    var email = req.body.email;
    var name = req.body.name;
    var urlName = encodeURIComponent(name);
    var admin = req.body.admin;

    link = sprintf("http://alphasigs.herokuapp.com/login/edit?email=%s&name=%s&admin=%s&src=%s", email, urlName, admin, 'abcdefg');

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'alphasig@umn.edu',
            pass: password
        }
    });

    transporter.sendMail({
        from: 'alphasig@umn.edu',
        to: email,
        subject: 'Create Budget Account',
        html: sprintf("Hello %s, please create an account on the budget site by clicking <a href='%s'>here</a>. Thanks!", name, link)
    });
});

module.exports = router;