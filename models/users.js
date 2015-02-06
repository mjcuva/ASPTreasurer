var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    email:    {type: String, required: true},
    name:     {type: String, required: true},
    pw_hash:  {type: String, required: true},
    paid:     {type: Number, default: 0},
    admin:    {type: Boolean, required: true, default: false}
});

var passwordHash = require('password-hash');

UserSchema.statics.findByEmail = function(em, cb){
    this.find({email: em}, cb);
}

UserSchema.statics.createAccount = function(u, cb){
    this.findByEmail(u.email, function(err, user){
        if(user.length == 0){
            // Expected case - Create new user
            var User = mongoose.model('User');
            var newUser = new User(u);
            newUser.pw_hash = passwordHash.generate(u.pw_hash);
            newUser.save(function(err, createdUser){
                if(err){ cb("An error occurred.", null, null); }
                cb(null, createdUser, newUser._id);
            })
        }else{
            console.log(user);
            cb("User already exists", null, null);
        }
    });
}

UserSchema.statics.login = function(email, pass, cb){
    this.findByEmail(email, function(err, users){
        user = users[0];
        if(err || users.length === 0){ cb("Incorrect login", null, null) }
        else if(passwordHash.verify(pass, user.pw_hash)){
            cb(null, user, user._id);
        }else{
            cb("Incorrect login", null, null);
        }
    });
}

UserSchema.statics.LoggedIn = function(userInfo, cb){

    if(userInfo === undefined){
        cb(false);
    }else{
        this.findById(userInfo.toString(), function(err, users){
            if(users === undefined){
                cb(false);
            }else{
                cb(true);
            }
        });
    }
}

mongoose.model('User', UserSchema);