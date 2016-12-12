// Import modules
var express = require("express");
var session = require('express-session');
var multer = require("multer");
var bodyParser = require('body-parser');
var repl = require("repl");
var passport = require('passport');
var flash    = require('connect-flash');
var configAuth = require('./config/auth');
const pg = require('pg');
const connectionString = process.env.DATABASE_URL || configAuth.database.url;
// Import our code
var Job = require("./lib/Job.js");

// Set up router, upload config
var router = express.Router();
var path = __dirname + '/views/';
var upload = multer({ dest: 'uploads/' });

var app = express();

console.log("Initializing server...");

// Initialize empty list of jobs
var jobList = [];
require('./config/passport')(passport); // pass passport for configuration

// Enable body-parser for JSON parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'slob on my knob like corn on the cob',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

require('./lib/routes.js')(app, passport, express); // load our routes and pass in our app and fully configured passport

router.use(function (req,res,next) {
  console.log("/" + req.method);
  next();

  clearShell();
});

router.get("/", function(req,res){
  res.render("index.ejs");
  //res.sendFile(path + "index.html");
});

/*
router.get("/dashboard", function(req,res){
  res.render("dashboard.ejs");
  //res.sendFile(path + "dashboard.html");
});
*/
/*
router.get("/stats", function(req,res){
  res.sendFile(path + "stats.html");
});
*/


// Handle when user starts a job
app.post('/start-job', function (req, res){

    console.log("Job " + req.body['job-number'] + " starting...");
    //console.log(req.body);

    //Start job pipeline
    jobList[ req.body['job-number'] - 1 ].execute( req.body['job-number'], jobList[req.body['job-number'] - 1].jobData );

    updateJobStatus(req.body['ownerid'], req.body['job-number'], 1);

    // Send success status to client
    res.sendStatus(200);
});

// Handle when user creates a job
app.post('/create-job', upload.single('video-file'), function (req, res, next) {

    console.log("Incoming job:");
    console.log(req.body);
    console.log(req.file);

    if (!req.file.mimetype.match(/video\/./))
    {
      console.log("Bad file type, returning 415 error");
      res.status(415).send({ error: "errorFiletype" });
    }
    else
    {
      // Create new job, add to job list
      //TODO: pass in actual job data
      var newJob = new Job(req.body['job-number'], [req.body, req.file]);
      var status = 0;
      jobList.push(newJob);

      insertdb(
        req.body['ownerid'],
        req.body['cv-implementation'],
        req.file['fieldname'],
        req.body['job-number'],
        req.file['originalname'],
        req.file['encoding'],
        req.file['mimetype'],
        req.file['destination'],
        req.file['filename'],
        req.file['path'],
        req.file['size'],
        status
      );

      // Send success status to client
      res.status(200).send();
    }
    clearShell();



});

// Get a list of jobs for a user
app.post('/getjobs:ownerid', (req, res, next) => {
  const results = [];
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }

    const query = client.query('SELECT * FROM jobs WHERE ownerid=' + req.body.ownerid + ';');
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

//update a job's status
function updateJobStatus(ownerid, jobnumber, status) {

  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
    }
    // SQL Query > Update Data
    client.query('UPDATE jobs SET status=($3) WHERE ownerid=($1) AND jobnumber=($2)',
    [ownerid, jobnumber, status]);
  });
};

/*
  returns a list of jobs for a user
*/
function getJobs(ownerid) {

  var results = [];

  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
    }
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM jobs WHERE ownerid=(' + ownerid + ');');
    // Stream results back one row at a time
    query.on('row', (row) => {
      console.log("row: " + row);
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      console.log("return results");
      return results;
    });
  });

}

/*
  inserts a job into database
*/
function insertdb(ownerid, cvimplementation, fieldname, jobnumber, originalname, encoding, mimetype, destination, filename, path, size, status) {

  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);

    }
    // SQL Query > Insert Data
    client.query('INSERT INTO jobs(ownerid, cvimplementation, fieldname,' +
    ' jobnumber, originalname, encoding, mimetype, destination, filename, path, size, status)' +
    ' values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
    [ownerid, cvimplementation, fieldname, jobnumber, originalname, encoding, mimetype, destination, filename, path, size, status]);

  });

}

// Client ping handler
app.post("/job-status", function(req, res){
  console.log("Incoming client ping type " + req.body.pingType + " for Job " + req.body.jobNum);
  switch(parseInt(req.body.pingType))
  {
    case 0: // Upload status
    {
      if (jobList[req.body.jobNum - 1] != null)
      {
        console.log("File upload complete, adding to client job list...");
        res.status(200).send(req.body.jobNum);
      }
      break;
    }
    case 1: // Processing status
    {

      if (jobList[req.body.jobNum - 1].complete) {
        console.log("Sending job complete status...");
        var jobFinishPath = "/Users/justintennant/Desktop/cs160-testdrive/exec/output/" + jobList[req.body.jobNum - 1].jobData[1].filename + ".mp4";
        res.send(jobFinishPath);
      }
      else res.send(false);
      break;
    }
    default: // Improper ping type
    {
      break;
    }
  }
  clearShell();
});

// Serve static content
app.use('/css', express.static(__dirname+'/css'));
app.use('/js', express.static(__dirname+'/js'));
app.use('/img', express.static(__dirname+'/img'));
app.use('/templates', express.static(__dirname+'/views/templates'));

app.use("/", router);

// Handle 404 errors
app.use("*", function(req, res) {
  res.sendFile(path + "404.html");
});

app.listen(3000, function() {
  console.log("Live at Port 3000");
  console.log("");

  // Initialize shell
  var replServer = repl.start("160-pipeline> ");

  // Make jobList accessible to shell
  replServer.context.jobList = jobList;

  // Define .shutdown command
  /*
  replServer.defineCommand('shutdown', {
    help: 'Shuts down server gracefully',
    action: function() {
      this.lineParser.reset();
      this.bufferedCommand = '';

      safeShutdown();
    }
  });
  */

  // Handle Cntl-C quits
  replServer.on('exit', safeShutdown);

});

function clearShell() {
  process.stdout.write("160-pipeline> ");
}

function safeShutdown() {
  console.log('Successfully saved job data to file');
  process.exit();
}
