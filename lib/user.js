var pg           = require('pg');
var bcrypt           = require('bcrypt-nodejs');

//var client       = new pg.Client('postgres://localhost:5432/faceservice');



var User = function User(){
    var self = this;

    this.ownerid;
    //this.name ='';
    //this.photo ='';
    this.email = "";
    this.password= ""; //need to declare the things that i want to be remembered for each user in the database

    this.save = function(callback) {
        var client       = new pg.Client('postgres://localhost:5432/faceservice');
        client.connect();

        console.log(this.email +' will be saved');

            client.query("INSERT INTO users(ownerid, email, password) VALUES(nextval('ownerid'), trim($1), $2)", [this.email, this.password], function (err, result) {
                if(err){
                    console.log(err);
                    return console.error('error running query', err);
                }
                console.log(result.rows);
                //console.log(this.email);
            });
            client.query('SELECT * FROM users ORDER BY ownerid desc limit 1', null, function(err, result){

                if(err){
                    return callback(err);
                }
                //if no rows were returned from query, then new user
                if (result.rows.length > 0){
                    console.log(JSON.stringify(result.rows[0]) + ' is found!');
                    var user = new User();
                    user.email= result.rows[0]['email'];
                    user.password = result.rows[0]['password'];
                    user.ownerid = result.rows[0]['ownerid'];
                    console.log("new user email: " + user.email);
                    console.log("new user id: " + user.ownerid);
                    client.end();
                    return callback(null, user);
                }
            });
    };
}

User.findOne = function(email, callback){
    var client = new pg.Client('postgres://localhost:5432/faceservice');

    var isNotAvailable = false; //we are assuming the email is taking
    //var email = this.email;
    //var rowresult = false;
    console.log(JSON.stringify(email) + ' is in the findOne function test');
    //check if there is a user available for this email;
    client.connect();
    //client.connect(function(err) {
    ////    //console.log(this.photo);
    //    console.log(email);
    //    if (err) {
    //        return console.error('could not connect to postgres', err);
    //    }

    client.query("SELECT * FROM users WHERE email=$1", [email], function(err, result){
        this.generateHash = function(password) {
                return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
        };

        if(err){
            //return callback(err, isNotAvailable, this);
            return callback(err, null);
        }
        //if no rows were returned from query, then new user
        if (result.rows.length > 0){
            isNotAvailable = true; // update the user for return in callback
            ///email = email;
            //password = result.rows[0].password;
            console.log(email + ' is not available!');
        }
        else{
            isNotAvailable = false;
            //email = email;
            console.log(email + ' is available');
        }
        //the callback has 3 parameters:
        // parameter err: false if there is no error
        //parameter isNotAvailable: whether the email is available or not
        // parameter this: the User object;

        client.end();
        //console.log("Users.findOne returns 'this': " + JSON.stringify(this._result.rows[0].password));
        return callback(false, isNotAvailable, this);


    });
//});
};

User.findById = function(id, callback){
    console.log("we are in findbyid");
    var client = new pg.Client('postgres://localhost:5432/faceservice');

    client.connect();
    client.query("SELECT * FROM users WHERE ownerid=$1", [id], function(err, result){

        if(err){
            return callback(err, null);
        }
        //if no rows were returned from query, then new user
        if (result.rows.length > 0){
            console.log(result.rows[0] + ' is found!');
            var user = new User();
            user.email= result.rows[0]['email'];
            user.password = result.rows[0]['password'];
            user.u_id = result.rows[0]['ownerid'];
            console.log(user.email);
            return callback(null, user);
        }
    });
};

User.prototype.validPassword = function(password) {
        return bcrypt.compareSync(password, this.password);
};
User.prototype.generateHash = function(password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

module.exports = User;
