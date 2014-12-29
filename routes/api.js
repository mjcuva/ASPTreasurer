var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Transaction = mongoose.model('Transaction');

router.get('/currentuser', function(req, res, next){
    User.findById(req.cookies.u, function(err, user){
        if(err){
            res.send(err);
        }else{
            res.json(user);
        }
    });
});

router.get('/transactions', function(req, res, next){
    Transaction.find(function(err, transactions){
        if(err){
            res.send(err);
        }else{
            res.json(transactions);
        }
    })
});

router.post('/users/create', function(req, res, next){
    User.createAccount(req.body, function(err, user, hash){
        if(err){ res.send(err); }
        else{
            res.cookie('u', hash);
            res.json(user);
        }
    });
});

module.exports = router;