var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var User = mongoose.model('User');

var url = require("url");

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

router.get('/edit', function(req, res){
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    res.render('edit', {error: "", name: query.name});
});

router.post('/edit', function(req, res, next){
    var pass = req.body.pass;
    var passVerify = req.body.passVerify;

    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;

    if(pass != passVerify){
        var err = "Passwords don't match.";
        render('edit', {error: err});
    }else{
        var name = query.name;
        var email = query.email;
        var admin = query.admin;
        var user = {"name":name, "email":email, "admin":admin, "pw_hash":pass};
        User.createAccount(user, function(err, u, hash){
            if(err){
                res.send(err)
            }else{
                res.cookie('u', hash);
                res.redirect('/');
            }
        });
    }
});

module.exports = router;