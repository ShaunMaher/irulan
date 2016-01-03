var express = require("express");
var fs = require("fs");
//var url = require("url");
var path = require("path");
var app = express();
var router = express.Router();

// Default settings
//TODO: Load these from json file
app.Settings = {};
app.Settings['views directory'] = __dirname + '/views/';
app.Settings['node modules directory'] = __dirname + '/node_modules/';
app.Settings['offline mode'] = true;
app.Settings['clientCssDir'] = __dirname + '/client_css/';
app.Settings['clientJsDir'] = __dirname + '/client_js/';
app.Settings['cachedJsDir'] = app.Settings['clientJsDir'] + '/cached/';
app.Settings['cachedCssDir'] = app.Settings['clientCssDir'] + '/cached/';
app.Settings['wiki content directory'] = __dirname + '/content/wikipages/';
app.Settings['client scripts'] = {};
app.Settings['client scripts']['single page application'] = Array();
app.Settings['client css'] = {};
app.Settings['client css']['single page application'] = Array();
app.Settings['index page module name'] = 'irulan-single-page-application';
app.Settings['http listening port'] = 3000;
app.Settings['load plugins'] = Array("wikipage");

// Runtime objects
app.ClientScripts = {};
app.ClientScripts['single page application'] = Array();
app.ClientCss = {};
app.ClientCss['single page application'] = Array();
app.LoadedPlugins = {};

router.use(function (req, res, next) {
  console.log("/" + req.method);
  next();
});

// The default index.html provider (also provides error pages)
app.IndexPageApplication = require(app.Settings['index page module name']);
app.IndexPageApplication(app, router);

router.get("/components.navbar.js", function (req, res) {
  res.sendFile(app.Settings['clientJsDir'] + "components.navbar.js");
});
router.get("/components.pages.js", function (req, res) {
  res.sendFile(app.Settings['clientJsDir'] + "components.pages.js");
});
router.get("/components.wikipages.js", function (req, res) {
  res.sendFile(app.Settings['clientJsDir'] + "components.wikipages.js");
});
router.get("/marked.min.js", function (req, res) {
  res.sendFile(__dirname + '/node_modules/marked/marked.min.js');
});
router.get("/app.js", function (req, res) {
  res.sendFile(app.Settings['clientJsDir'] + "app.js");
});
router.get("/irulan_client.js", function (req, res) {
  res.sendFile(app.Settings['node modules directory'] + '/' + app.Settings['index page module name'] + "/irulan_client.js");
});

// Locally cached resources
var locallyCachedResources = require("locallyCachedResources");
locallyCachedResources(app.Settings['cachedJsDir'], app.Settings['cachedCssDir']);
router.get(/^\/cached\//, function (req, res, next) {
  locallyCachedResources.sendFromCache(req, res, next);
})

// Dynamic loading of selected plugins
for (index in app.Settings['load plugins']) {
  //TODO
}

// RESTful object: wiki markdown (replace with dynamic loading above)
var wikipages = require("wikipages");
wikipages(app, router);

console.log(app.Settings);
console.log(app.Settings['client scripts']['single page application']);
console.log(app.IndexPageApplication.InjectClientScripts());

// URL to a specific wiki page - we just send the index.html page and let it
//  load the right content
//TODO: Move to wikipage module
router.get(/^\/wiki\//, function (req, res, next) {
  app.IndexPageApplication.IndexPage(req, res);
});

app.use("/", router);

// When all other request handlers have had a chance to pick up the request and
//  haven't done so, it's time for a 404 error.
app.use("*", function(req, res) {
  app.IndexPageApplication.ErrorPage(req, res, 404, "Page not found");
});

app.listen(app.Settings['http listening port'], function() {
  console.log("Listening on port " + app.Settings['http listening port']);
});
