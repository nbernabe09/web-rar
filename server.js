var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var mongojs = require("mongojs");
var request = require("request");
var cheerio = require("cheerio");
var mongoose = require("mongoose");
var db = require("./models");

var app = express();
var port = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({ extended: false }));
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/webrar";

mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
  useMongoClient: true
});

app.get("/", function(req, res) {
  db.Article
    .find({})
    .then(function(dbArticle) {
      res.render("index", {article: dbArticle});
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.get("/scrape", function(req, res) {
  request("https://www.reddit.com/r/Switch/", function(error, response, html) {
    var $ = cheerio.load(html);
    $("div.thing").each(function(i, element) {
      var result = {};
      var url = $(element)
        .attr("data-url");

      result.headline = $(element)
        .children("div.entry")
        .children("div.top-matter")
        .children("p.title")
        .children("a")
        .text();
      result.img = $(element)
        .children("a.thumbnail")
        .children("img")
        .attr("src") || "assets/images/none.jpg";
      if (url.includes("https")) {
        result.url = url;
      } else {
        result.url = "https://www.reddit.com" + url;
      }

      db.Article.create(result);
    });
    res.redirect("/");
  });
});

app.listen(port, function() {
  console.log("App listening on PORT " + port);
});