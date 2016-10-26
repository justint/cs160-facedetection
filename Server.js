var express = require("express");
var multer = require("multer");
var bodyParser = require('body-parser');

var router = express.Router();
var path = __dirname + '/views/';
var upload = multer({ dest: 'uploads/' });

var app = express();



app.use(bodyParser.urlencoded({ extended: true }));

router.use(function (req,res,next) {
  console.log("/" + req.method);
  next();
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

app.post('/start-job', function (req, res){
    console.log("Job starting...");
    console.log(req.body);
    res.sendStatus(200);
});

app.post('/create-job', upload.single('video-file'), function (req, res, next) {
    console.log("Incoming job:");
    console.log(req.body);
    console.log(req.file);
    res.status(200).send();
});

app.use('/css',express.static(__dirname+'/css'));
app.use('/js',express.static(__dirname+'/js'));
app.use('/img',express.static(__dirname+'/img'));

app.use("/",router);

app.use("*",function(req,res){
  res.sendFile(path + "404.html");
});

app.listen(3000,function(){
  console.log("Live at Port 3000");
});
