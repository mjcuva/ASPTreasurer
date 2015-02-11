var should = require('should');
var request = require('supertest');
var mongoose = require('mongoose');

var config = require('../config');
var app = require('../app.js');

describe('Transactions', function(){

    before(function(done){
        mongoose.disconnect(function(err){
            mongoose.connect(config.MONGO_TEST, function(err){
                if(err){
                    console.log(err);
                    done();
                }else{
                    console.log("Connected to TestDB")
                    done();
                }
            });
        });
    });

    it("should be empty", function(done){
        request(app)
        .get('/api/transactions')
        .expect(200)
        .end(function(err, res){
            res.status.should.equal(200);
            res.body.length.should.equal(0);
            done();
        });
    });

    it("Should add one transaction", function(done){

        var transaction = {cost:100, "date": Date.now(), description:'test', 'position':"President"};

        request(app)
        .post('/api/transactions')
        .send(transaction)
        .expect(200)
        .end(function(err, res){
            res.status.should.equal(200);
            res.body.cost.should.equal(transaction.cost);
            res.body.description.should.equal(transaction.description);
            res.body.position.should.equal(transaction.position);
            done();
        });
    });

    it("Should contain one transaction", function(done){
        request(app)
        .get('/api/transactions')
        .expect(200)
        .end(function(err, res){
            res.body.length.should.equal(1);
            done();
        })
    });

    it("Should edit one transcation", function(done){
        // Get transaction to edit
        request(app)
        .get('/api/transactions')
        .end(function(err, res){
            var editedTrans = res.body[0];
            editedTrans.cost = 200;
            request(app)
            .post('/api/transactions')
            .send(editedTrans)
            .expect(200)
            .end(function(err, res){
                res.body.cost.should.equal(200);
                res.body.description.should.equal(editedTrans.description);
                done();
            })
        });
    });

    it("Should still just have one transaction", function(done){
        request(app)
        .get('/api/transactions')
        .end(function(err, res){
            res.body.length.should.equal(1);
            done();
        });
    });

    it("Should delete the transaction", function(done){
        request(app)
        .get('/api/transactions')
        .end(function(err, res){
            id = res.body[0]._id;
            url = "/api/transactions/" + id;
            request(app)
            .del(url)
            .expect(200)
            .end(function(err, res){
                res.text.should.equal('Deleted');
                done();
            });
        });
    });

    it("Should have zero transactions", function(done){
        request(app)
        .get('/api/transactions')
        .expect(200)
        .end(function(err, res){
            res.body.length.should.equal(0);
            done();
        });
    });

    it("Should fail to delete", function(done){
        request(app)
        .del('/api/transactions/notexistant')
        .end(function(err, res){
            res.text.should.equal("Doesn't exist");
            done();
        })

    })

    after(function(done){
        mongoose.connection.db.dropDatabase(function(err, result) {
            console.log("Dropped database.");
            done();
        });
    });
    
});