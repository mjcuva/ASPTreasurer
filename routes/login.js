var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var User = mongoose.model('User');

router.get('/', function(req, res){
    res.render('login', {error: ""});
});

router.post('/', function(req, res, next){
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

module.exports = router;