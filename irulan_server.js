"use strict"
var express = require("express");
var fs = require("fs");
//var url = require("url");
var path = require("path");
var http = require("http");
var url = require("url");
var app = express();
var router = express.Router();

var localStorage = require("modular-localstorage");
//var TestLocalStorage = new testLocalStorage();

app.localStorage = localStorage;

// Default settings
let defaultSettings = {
  'views directory': __dirname + '/views/',
  'node modules directory': __dirname + '/node_modules/',
  'offline mode': true,
  'cachedJsDir': __dirname + '/cache/js/',
  'cachedCssDir': __dirname + '/cache/css/',
  'wiki content directory': __dirname + '/content/wikipages/',
  'index page module name': 'irulanclient',
  'http listening port': 3000,
  'load plugins': [
    'irulanwiki',
    'irulankeepass',
    'irulansysinfo',
    'irulanlxd'
  ]
}

// Build the
app.Settings = {};
for (let index in defaultSettings) {
  app.Settings[index] = localStorage.getItem(index, defaultSettings[index]);
}

// Shutdown handler.
function graceful_shutdown(options, err) {
  console.log("Shutting down.");
  for (let index in app.LoadedPlugins) {
    //console.log("Shutting down ", app.LoadedPlugins[index]);
    if (app.LoadedPlugins[index].graceful_shutdown) {
      app.LoadedPlugins[index].graceful_shutdown();
    }
  }
  // Save settings to disk.
  for (let index in app.Settings) {
    if (app.Settings[index] != defaultSettings[index]) {
      localStorage.setItem(index, app.Settings[index]);
    }
  }
  if (err) console.log(err.stack);
  if (options.exit) process.exit();
}
process.on('exit', graceful_shutdown.bind(null,{}));
process.on('SIGINT', graceful_shutdown.bind(null, {exit:true}));
//process.on('uncaughtException', graceful_shutdown.bind(null, {exit:true}));

// Runtime objects
app.ClientScripts = {};
app.ClientScripts['single page application'] = Array();
app.ClientCSS = {};
app.ClientCSS['single page application'] = Array();
app.LoadedPlugins = {};

router.use(function (req, res, next) {
  //console.log("/" + req.method);
  next();
});

// The default index.html provider (also provides error pages)
app.IndexPageApplication = require(app.Settings['index page module name']);
app.IndexPageApplication(app, router);

// Dynamic loading and initialisation of selected plugins
for (index in app.Settings['load plugins']) {
  var pluginName = app.Settings['load plugins'][index];
  console.log("Loading plugin: " + pluginName);
  try {
    var newPlugin = require(pluginName);
    var newObject = new newPlugin(app, router);
    app.LoadedPlugins[pluginName] = newObject;
  }
  catch(err) {
    console.log("Failed to load plugin: " + pluginName);
    console.log(err);
    console.log(err.stack);
  }
}

// The loaded plugins might have specified remote URLs as the source of JS and
//  CSS resources which we definately allow but, we will download a copy of
//  these resources and store them locally for use in "offline mode"
for (var index in app.ClientScripts['single page application']) {
  var client_script = app.ClientScripts['single page application'][index];
  if (client_script.online_url) {
    console.log("Client script: " + client_script.online_url);
    var context = {};
    context.client_script = client_script;
    context.file_name = path.basename(client_script.online_url);
    fs.stat(app.Settings['cachedJsDir'] + context.file_name, (function (err, stats) {
      if ((err != null) || (!stats)) {
        var request_url = this.client_script.online_url;

        // Url might start with 2 slashes which indicates that the browser
        //  should use the current protocol.  We will just use HTTP.
        if (request_url.match(/^\/\//)) {
          request_url = 'http:' + request_url;
        }
        console.log("Info: We should download and cache the resource at '"+ request_url + "'");

        if (url.parse(request_url).protocol == 'https:') {
          console.log("HTTPS client support needed")
        }
        else if (url.parse(request_url).protocol == 'http:') {
          http.get(request_url, (function(res) {
            var body = '';
            //var file_name = path.basename(request_url);
            res.on('data', function (chunk) {
              body += chunk;
            });
            res.on('end', (function() {
              fs.writeFile(app.Settings['cachedJsDir'] + this.file_name, body, (function(err) {
                if (err) {
                  console.log("Error: Unable to save remote resource to local cache.  " + err.message);
                }
                else {
                  console.log("Info: Remote resource cached in '" + app.Settings['cachedJsDir'] + this.file_name + "'");
                  this.client_script.offline_path = app.Settings['cachedJsDir'] + this.file_name;
                }
              }).bind(this));
            }).bind(this));
            res.resume();
          }).bind(this)).on('error', function(e) {
            console.log("Error: Unable to fetch remote resource '" + request_url + "'.  " + e.message);
          });
        }
        else {
          console.log("Error: Unknown protocol: '" + url.parse(request_url).protocol);
        }
      }
      else {
        console.log("Info: Will provide '" + this.file_name + "' from local cache if requested.");
        this.client_script.offline_path = app.Settings['cachedJsDir'] + this.file_name;
      }
    }).bind(context));
  }
}

console.log(app.Settings);
console.log(app.ClientScripts['single page application']);
console.log(app.IndexPageApplication.InjectClientScripts());
console.log(app.IndexPageApplication.InjectClientCSS());

// URL to a specific wiki page - we just send the index.html page and let it
//  load the right content
//TODO: Move to wikipage module
router.get(/^\/wiki\//, function (req, res, next) {
  app.IndexPageApplication.IndexPage(req, res, next);
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

//process.exit();
