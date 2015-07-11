var should = require('should');
var request = require('supertest');
var mongoose = require('mongoose');

var config = require('../config');
var app = require('../app.js');

describe('Budgets', function(){

    before(function(done){
        mongoose.disconnect(function(err){
            mongoose.connect(config.MONGO_TEST, function(err){
                if(err){
                    console.log(err);
                    done();
                }else{
                    console.log("Connected to TESTDB");
                    done();
                }
            });
        });
    });

    it("Should be empty", function(done){
        request(app)
        .get('/api/budgets')
        .expect(200)
        .end(function(err, res){
            res.status.should.equal(200);
            res.body.length.should.equal(0);
            done();
        });
    });

    it("Should add one budget", function(done){
        var budget = {amount:100, position:"President",semester:"Fall 2015"};

        request(app)
        .post('/api/budgets')
        .send(budget)
        .expect(200)
        .end(function(err, res){
            res.status.should.equal(200);
            res.body.amount.should.equal(budget.amount);
            res.body.position.should.equal("President");
            res.body.semester.should.equal("Fall 2015");
            done();
        });
    });

    it("Should have one budget", function(done){
        request(app)
        .get('/api/budgets')
        .expect(200)
        .end(function(err,res){
            res.body.length.should.equal(1);
            done();
        });
    });

    it("Should edit one budget", function(done){
        //Get budget to edit
        request(app)
        .get('/api/budgets')
        .end(function(err, res){
            var editedBudget = res.body[0];
            editedBudget.amount = 200;
            request(app)
            .post('/api/budgets')
            .send(editedBudget)
            .expect(200)
            .end(function(err, res){
                res.body.amount.should.equal(200);
                res.body.position.should.equal(editedBudget.position);
                done();
            });
        });
    });

    it("should still just have one transaction", function(done){
        request(app)
        .get('/api/budgets')
        .end(function(err, res){
            res.body.length.should.equal(1);
            done();
        });
    });

    it("should delete the budget", function(done){
        // Get budget to delete
        request(app)
        .get('/api/budgets')
        .end(function(err, res){
            budget = res.body[0];
            budget.amount = 0;
            request(app)
            .post('/api/budgets')
            .send(budget)
            .end(function(err, res){
                res.text.should.equal("Removed");
                done();
            })
        });
    });

    it("should have zero budgets", function(done){
        request(app)
        .get('/api/budgets')
        .expect(200)
        .end(function(err, res){
            res.body.length.should.equal(0);
            done();
        })
    })
});