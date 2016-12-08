// load all the things we need
var LocalStrategy    = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy  = require('passport-twitter').Strategy;
var GoogleStrategy   = require('passport-google-oauth').OAuth2Strategy;
var bcrypt           = require('bcrypt-nodejs');


// load up the user model
var User       = require('../lib/user');

// load the auth variables
var configAuth = require('./auth');

module.exports = function(passport) {

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
       console.log("serializing user: " + JSON.stringify(user));
       if (user.provider != null)
          done(null, user);
       else if (user._result != null)
          done(null, user._result.rows[0].ownerid);
       else done(null, user.ownerid);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        console.log("deserializing user id: " + JSON.stringify(id));
        if (id.provider != null)
           done(null, id);
        else {
          User.findById(id, function(err, user) {
              done(err, user);
        })};
    });


    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne(email, function(err, isNotAvailable, user) {
            console.log("returned user: " + JSON.stringify(user));
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!isNotAvailable)
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            console.log("password: " + password);
            console.log("user.password: " + user._result.rows[0].password);
            if (!bcrypt.compareSync(password, user._result.rows[0].password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            return done(null, user);
        });

    }));

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, email, password, done) {
        if (email)
            email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

        // asynchronous
        process.nextTick(function() {
            // if the user is not already logged in:
            if (!req.user) {
                User.findOne({ 'email' :  email }, function(err, isNotAvailable, user) {
                    // if there are any errors, return the error
                    if (err)
                        return done(err);

                    // check to see if theres already a user with that email
                    if (isNotAvailable) {
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } else {

                        // create the user
                        var newUser            = new User();

                        newUser.email    = email;
                        newUser.password = user.generateHash(password);

                        newUser.save(function(err, user) {
                            if (err)
                                return done(err);
                            newUser.ownerid  = user.ownerid;
                        console.log("created new user, now going somewhere");
                            return done(null, newUser);
                        });
                    }

                });
            // if the user is logged in but has no local account...
            } else if ( !req.user.email ) {
                // ...presumably they're trying to connect a local account
                // BUT let's check if the email used to connect a local account is being used by another user
                User.findOne({ 'email' :  email }, function(err, isNotAvailable, user) {
                    if (err)
                        return done(err);

                    if (isNotAvailable) {
                        return done(null, false, req.flash('loginMessage', 'That email is already taken.'));
                        // Using 'loginMessage instead of signupMessage because it's used by /connect/local'
                    } else {
                        var user = req.user;
                        user.email = email;
                        user.password = user.generateHash(password);
                        user.save(function (err) {
                            if (err)
                                return done(err);
                        console.log("created new user, now going somewhere");
                            return done(null,user);
                        });
                    }
                });
            } else {
                // user is logged in and already has a local account. Ignore signup. (You should log out before trying to create a new account, user!)
                return done(null, req.user);
            }

        });

    }));


        // =========================================================================
        // FACEBOOK ================================================================
        // =========================================================================
        passport.use(new FacebookStrategy({

            // pull in our app id and secret from our auth.js file
            clientID        : configAuth.facebookAuth.clientID,
            clientSecret    : configAuth.facebookAuth.clientSecret,
            callbackURL     : configAuth.facebookAuth.callbackURL

        },

        // facebook will send back the token and profile
        function(token, refreshToken, profile, done) {
            return done(null, profile);
        }));



        // =========================================================================
        // TWITTER =================================================================
        // =========================================================================
        passport.use(new TwitterStrategy({

            consumerKey     : configAuth.twitterAuth.consumerKey,
            consumerSecret  : configAuth.twitterAuth.consumerSecret,
            callbackURL     : configAuth.twitterAuth.callbackURL

        },
        function(token, tokenSecret, profile, done) {
            return done(null, profile);
        }));



        // =========================================================================
        // GOOGLE ==================================================================
        // =========================================================================
        passport.use(new GoogleStrategy({

            clientID        : configAuth.googleAuth.clientID,
            clientSecret    : configAuth.googleAuth.clientSecret,
            callbackURL     : configAuth.googleAuth.callbackURL,

        },
        function(token, refreshToken, profile, done) {

            return done(null, profile);

        }));


};
