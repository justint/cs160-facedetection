var express = require("express");
var app = express();
var router = express.Router();
var path = __dirname + '/views/';

router.use(function (req,res,next) {
  console.log("/" + req.method);
  next();
});

router.get("/",function(req,res){
  res.sendFile(path + "index.html");
});

router.get("/stats",function(req,res){
  res.sendFile(path + "stats.html");
});

router.get("/dashboard",function(req,res){
  res.sendFile(path + "dashboard.html");
});

router.get("/css/index.css",function(req,res){
  res.sendFile(__dirname + "/css/index.css");
});

app.use("/",router);

app.use("*",function(req,res){
  res.sendFile(path + "404.html");
});

app.listen(3000,function(){
  console.log("Live at Port 3000");
});
