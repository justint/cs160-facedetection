module.exports = function(app, passport, express) {


    // route for home page
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

  	// =====================================
  	// LOGIN ===============================
  	// =====================================
  	// show the login form
  	app.get('/login', function(req, res) {

  		// render the page and pass in any flash data if it exists
  		res.render('login.ejs', { message: req.flash('loginMessage') });
  	});

  	// process the login form
  	app.post('/login', passport.authenticate('local-login', {
  		successRedirect : '/dashboard', // redirect to the secure profile section
  		failureRedirect : '/login', // redirect back to the signup page if there is an error
  		failureFlash : true // allow flash messages
  	}));

  	// =====================================
  	// SIGNUP ==============================
  	// =====================================
  	// show the signup form
  	app.get('/signup', function(req, res) {

  		// render the page and pass in any flash data if it exists
  		res.render('signup.ejs', { message: req.flash('signupMessage') });
  	});

  	// process the signup form
  	app.post('/signup', passport.authenticate('local-signup', {
  		successRedirect : '/dashboard', // redirect to the secure dashboard section
  		failureRedirect : '/signup', // redirect back to the signup page if there is an error
  		failureFlash : true // allow flash messages
  	}));

    // route for showing the dashboard page
    app.get('/dashboard', isLoggedIn, function(req, res) {

        console.log("incoming user: " + JSON.stringify(req.user));
        res.render('dashboard.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

        // =====================================
        // FACEBOOK ROUTES =====================
        // =====================================
        // route for facebook authentication and login
        app.get('/auth/facebook',
            passport.authenticate('facebook', { scope: ['email']}),
            function(req, res){
        });

        // handle the callback after facebook has authenticated the user
        app.get('/auth/facebook/callback',
            passport.authenticate('facebook', {
                successRedirect : '/dashboard',
                failureRedirect : '/'
            }));

        // =====================================
        // TWITTER ROUTES ======================
        // =====================================
        // route for twitter authentication and login
        app.get('/auth/twitter', passport.authenticate('twitter'), function(req, res) {
            console.log("debug: showing /auth/twitter page");
        });

        // handle the callback after twitter has authenticated the user
        app.get('/auth/twitter/callback',
            passport.authenticate('twitter', {
                successRedirect : '/dashboard',
                failureRedirect : '/'
            }));

        // =====================================
        // GOOGLE ROUTES =======================
        // =====================================
        // send to google to do the authentication
        // profile gets us their basic information including their name
        // email gets their emails
        app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

        // the callback after google has authenticated the user
        app.get('/auth/google/callback',
                passport.authenticate('google', {
                        successRedirect : '/dashboard',
                        failureRedirect : '/'
                }));



    // route for logging out
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    // Serve static content
    app.use('/css', express.static(__dirname+'/css'));
    app.use('/js', express.static(__dirname+'/js'));
    app.use('/img', express.static(__dirname+'/img'));
    app.use('/templates', express.static(__dirname+'/views/templates'));

};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

      function simpleStringify (object){
        var simpleObject = {};
        for (var prop in object ){
            if (!object.hasOwnProperty(prop)){
                continue;
            }
            if (typeof(object[prop]) == 'object'){
                continue;
            }
            if (typeof(object[prop]) == 'function'){
                continue;
            }
            simpleObject[prop] = object[prop];
        }
      return JSON.stringify(simpleObject); // returns cleaned up JSON
    };

    console.log("checking if user is logged in: " + simpleStringify(req));
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/notauth');
}
