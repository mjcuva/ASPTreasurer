var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Transaction = mongoose.model('Transaction');

// router.get('/users', function(req, res, next){
//     User.find(function(err, users){
//         if(err){ return next(err); }
//         res.json(users);
//     });
// });

module.exports = router;
