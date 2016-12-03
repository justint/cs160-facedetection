// Import modules
var express = require("express");
var multer = require("multer");
var bodyParser = require('body-parser');
var repl = require("repl");

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

// Enable body-parser for JSON parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

router.use(function (req,res,next) {
  console.log("/" + req.method);
  next();

  clearShell();
});

router.get("/", function(req,res){
  res.sendFile(path + "index.html");
});

router.get("/stats", function(req,res){
  res.sendFile(path + "stats.html");
});

router.get("/dashboard", function(req,res){
  res.sendFile(path + "dashboard.html");
});

// Handle when user starts a job
app.post('/start-job', function (req, res){

    console.log("Job " + req.body['job-number']  + " starting...");
    //console.log(req.body);

    //Start job pipeline
    jobList[ req.body['job-number'] - 1 ].execute( req.body['job-number'] );

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
      var newJob = new Job(req.body['job-number']);
      jobList.push(newJob);

      // Send success status to client
      res.status(200).send();
    }
    clearShell();
});

app.post('/add-job', function(req, res) {
  console.log("Incoming client ping for Job " + req.body.jobNum + "...");
  if (jobList[req.body.jobNum - 1] != null)
  {
    console.log("File upload complete, adding to client job list...");
    res.status(200).send(req.body.jobNum);
  }
  clearShell();
});

// Serve static content
app.use('/css',express.static(__dirname+'/css'));
app.use('/js',express.static(__dirname+'/js'));
app.use('/img',express.static(__dirname+'/img'));
app.use('/templates',express.static(__dirname+'/views/templates'));

app.use("/",router);

// Handle 404 errors
app.use("*",function(req,res){
  res.sendFile(path + "404.html");
});

app.listen(3000,function(){
  console.log("Live at Port 3000");
  console.log("");
  // Initialize + clear shell
  repl.start("160-pipeline> ").context.jobList = jobList;;
});

function clearShell() {
  process.stdout.write("160-pipeline> ");
}
