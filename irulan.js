var express = require("express");
var app = express();
var router = express.Router();
var viewsDir = __dirname + '/views/';
var clientJsDir = __dirname + '/client_js/';
var clientCssDir = __dirname + '/client_css/';
var cachedJsDir = clientJsDir + '/cached/';
var cachedCssDir = clientCssDir + '/cached/';

router.use(function (req, res, next) {
  console.log("/" + req.method);
  next();
});

router.get("/", function (req, res) {
  res.sendFile(viewsDir + "index.html");
});

router.get("/components.navbar.js", function (req, res) {
  res.sendFile(clientJsDir + "components.navbar.js");
});
router.get("/app.js", function (req, res) {
  res.sendFile(clientJsDir + "app.js");
});
// Locally cached resources
router.get("/cached/bootstrap.min.css", function (req, res) {
  res.sendFile(cachedCssDir + "bootstrap.min.css");
});
router.get("/cached/bootstrap.min.js", function (req, res) {
  res.sendFile(cachedJsDir + "bootstrap.min.js");
});
router.get("/cached/jquery.min.js", function (req, res) {
  res.sendFile(cachedJsDir + "bootstrap.min.js");
});
router.get("/cached/angular.min.js", function (req, res) {
  res.sendFile(cachedJsDir + "angular.min.js");
});
router.get("/cached/angular-sanitize.min.js", function (req, res) {
  res.sendFile(cachedJsDir + "angular-sanitize.min.js");
});
router.get("/cached/angular-route.min.js", function (req, res) {
  res.sendFile(cachedJsDir + "angular-route.min.js");
});



app.use("/", router);

app.use("*", function(req, res) {
  res.sendFile(viewsDir + "404.html");
});

app.listen(3000, function() {
  console.log("Listening on port 3000");
});
