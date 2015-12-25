var express = require("express");
var fs = require("fs");
//var url = require("url");
var path = require("path");
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
router.get("/components.pages.js", function (req, res) {
  res.sendFile(clientJsDir + "components.pages.js");
});
router.get("/marked.min.js", function (req, res) {
  res.sendFile(__dirname + '/node_modules/marked/marked.min.js');
});
router.get("/app.js", function (req, res) {
  res.sendFile(clientJsDir + "app.js");
});

// Locally cached resources
var locallyCachedResources = require("locallyCachedResources");
locallyCachedResources(cachedJsDir, cachedCssDir);
router.get(/^\/cached\//, function (req, res, next) {
  locallyCachedResources.sendFromCache(req, res, next);
})

// RESTful object: wiki markdown
router.get(/^\/pages\/wikipages\//, function (req, res, next) {
  var wikipage = {
    name: "home",
    sourceFormat: "md",
    content: "# Home\n## This is Markdown!"
  };
  console.log(wikipage);
  console.log(JSON.stringify(wikipage));
  res.send(JSON.stringify(wikipage));
})

app.use("/", router);

app.use("*", function(req, res) {
  res.sendFile(viewsDir + "404.html");
});

app.listen(3000, function() {
  console.log("Listening on port 3000");
});
