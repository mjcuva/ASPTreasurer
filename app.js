var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/asp');
require('./models/users');
require('./models/transactions');
require('./models/budgets');

var api = require('./routes/api');
var login = require('./routes/login');

// var routes = require('./routes/')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));

app.use('/api', api);
app.use('/login', login);

// Route for logout
app.get('/logout', function(req, res, next){
    res.clearCookie('u');
    res.redirect('/');
});

// Catchall so Angular can do the rest of the routing
app.all("/*", function(req, res, next) {

    mongoose.model('User').LoggedIn(req.cookies.u, function(loggedIn){
        if(loggedIn){
            res.sendFile("index.html", { root: __dirname + "/views" });
        }else{
            res.redirect('login');
        }
    });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
