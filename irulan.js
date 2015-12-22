var express = require("express");
var app = express();
var router = express.Router();
var viewsDir = __dirname + '/views/';
var clientJsDir = __dirname + '/client_js/';

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

app.use("/", router);

app.use("*", function(req, res) {
  res.sendFile(viewsDir + "404.html");
});

app.listen(3000, function() {
  console.log("Listening on port 3000");
});
