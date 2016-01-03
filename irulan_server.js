var express = require("express");
var fs = require("fs");
//var url = require("url");
var path = require("path");
var app = express();
var router = express.Router();

// Default settings
//TODO: Load these from json file
var global_settings = {};
global_settings['views directory'] = __dirname + '/views/';
global_settings['node modules directory'] = __dirname + 'node_modules';
global_settings['offline mode'] = true;
global_settings['clientCssDir'] = __dirname + '/client_css/';
global_settings['clientJsDir'] = __dirname + '/client_js/';
global_settings['cachedJsDir'] = global_settings['clientJsDir'] + '/cached/';
global_settings['cachedCssDir'] = global_settings['clientCssDir'] + '/cached/';
global_settings['wiki content directory'] = __dirname + '/content/wikipages/';
global_settings['client scripts'] = {};
global_settings['client scripts']['single page application'] = Array();
global_settings['client css'] = {};
global_settings['client css']['single page application'] = Array();
global_settings['index page module name'] = 'irulan-single-page-application';
global_settings['http listening port'] = 3000;
global_settings['load plugins'] = Array("wikipage");
global_settings['loaded plugins'] = {};

router.use(function (req, res, next) {
  console.log("/" + req.method);
  next();
});

// The default index.html provider (also provides error pages)
var indexpageapplication = require(global_settings['index page module name']);
indexpageapplication(global_settings, router);

router.get("/components.navbar.js", function (req, res) {
  res.sendFile(global_settings['clientJsDir'] + "components.navbar.js");
});
router.get("/components.pages.js", function (req, res) {
  res.sendFile(global_settings['clientJsDir'] + "components.pages.js");
});
router.get("/marked.min.js", function (req, res) {
  res.sendFile(__dirname + '/node_modules/marked/marked.min.js');
});
router.get("/app.js", function (req, res) {
  res.sendFile(global_settings['clientJsDir'] + "app.js");
});

// Locally cached resources
var locallyCachedResources = require("locallyCachedResources");
locallyCachedResources(global_settings['cachedJsDir'], global_settings['cachedCssDir']);
router.get(/^\/cached\//, function (req, res, next) {
  locallyCachedResources.sendFromCache(req, res, next);
})

// Dynamic loading of selected plugins
for (index in global_settings['load plugins']) {
  //TODO
}

// RESTful object: wiki markdown (replace with dynamic loading above)
var wikipages = require("wikipages");
wikipages(global_settings, router);

console.log(global_settings);
console.log(global_settings['client scripts']['single page application']);
console.log(indexpageapplication.InjectClientScripts());

// URL to a specific wiki page - we just send the index.html page and let it
//  load the right content
//TODO: Move to wikipage module
router.get(/^\/wiki\//, function (req, res, next) {
  indexpageapplication.IndexPage(req, res);
});

app.use("/", router);

// When all other request handlers have had a chance to pick up the request and
//  haven't done so, it's time for a 404 error.
app.use("*", function(req, res) {
  indexpageapplication.ErrorPage(req, res, 404, "Page not found");
});

app.listen(global_settings['http listening port'], function() {
  console.log("Listening on port " + global_settings['http listening port']);
});
