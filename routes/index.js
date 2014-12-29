var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Transaction = mongoose.model('Transaction');

/* GET home page. */
router.get('/', function(req, res) {

    User.LoggedIn(req.cookies.u, function(loggedIn){
        if(loggedIn){
            res.render('index', { title: 'Express' });
        }else{
            res.redirect('login');
        }
    })
});

router.get('/login', function(req, res){
    res.render('login', {error: ""});
});

router.post('/login', function(req, res, next){
    var email = req.body.email;
    var pass = req.body.pass;

    User.login(email, pass, function(err, user, hash){
        if(err){
            res.render('login', {error: err});
        }else{
            res.cookie('u', hash);
            res.redirect("/");
        }
    });
});

router.get('/logout', function(req, res, next){
    res.clearCookie('u');
    res.redirect('/');
});

// router.get('/users', function(req, res, next){
//     User.find(function(err, users){
//         if(err){ return next(err); }
//         res.json(users);
//     });
// });

router.post('/users/create', function(req, res, next){
    User.createAccount(req.body, function(err, user, hash){
        if(err){ res.send(err); }
        else{
            res.cookie('u', hash);
            res.json(user);
        }
    });
});

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

module.exports = router;
