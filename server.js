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
    .populate("comment")
    .sort({ createdAt: -1 })
    .then(function(dbArticle) {
      res.render("index", {article: dbArticle});
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.get("/old", function(req, res) {
  db.Article
    .find({})
    .populate("comment")
    .sort({ createdAt: 1 })
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
      if (url.includes("http")) {
        result.url = url;
      } else {
        result.url = "https://www.reddit.com" + url;
      }

      db.Article.create(result);
    });
    res.redirect("/");
  });
});

app.post("/comment/:id", function(req, res) {
  var id = req.params.id;
  var message = req.body.message;
  
  db.Comment
    .create(req.body)
    .then(function(dbComment) {
      return db.Article.findOneAndUpdate({ _id: id }, { $push: { comment: dbComment._id } }, { new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.delete("/delete/", function(req, res) {
  var id = req.body.id;

  db.Comment
    .remove({ _id: id })
    .then(function(dbComment) {
      res.json(dbComment);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.listen(port, function() {
  console.log("App listening on PORT " + port);
});