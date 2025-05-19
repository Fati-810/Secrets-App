//jshint esversion:6
require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());
app.use(express.static("public"));
console.log("Connecting to:", process.env.MONGO_URI);
// ✅ Cleaned for Mongoose v8
mongoose.connect(process.env.MONGO_URI);
const articleSchema = {
    title: String
    , content: String
};
const Article = mongoose.model("Article", articleSchema);
// All articles route
app.route("/articles").get(function (req, res) {
    Article.find(function (err, foundArticles) {
        if (!err) res.send(foundArticles);
        else res.send(err);
    });
}).post(function (req, res) {
    console.log("POST /articles route hit!");
    console.log("BODY:", req.body);
    const newArticle = new Article({
        title: req.body.title
        , content: req.body.content
    });
    newArticle.save(function (err) {
        if (!err) {
            console.log("Successfully Added.");
            res.send("Successfully Added Article.");
        }
        else {
            console.log(err);
            res.send(err);
        }
    });
}).delete(function (req, res) {
    Article.deleteMany(function (err) {
        if (!err) res.send("Successfully Deleted.");
        else res.send(err);
    });
});
// Specific article route
app.route("/articles/:articleTitle").get(function (req, res) {
    Article.findOne({
        title: req.params.articleTitle
    }, function (err, foundArticle) {
        if (err) res.send(err);
        else if (!foundArticle) res.send("❗ No Article Found with that Title.");
        else res.json(foundArticle);
    });
}).put(function (req, res) {
    Article.updateOne({
        title: req.params.articleTitle
    }, {
        title: req.body.title
        , content: req.body.content
    }, {
        overwrite: true
    }, function (err) {
        if (!err) res.send("Successfully Changed.");
        else res.send(err);
    });
}).patch(function (req, res) {
    Article.updateOne({
        title: req.params.articleTitle
    }, {
        $set: req.body
    }, function (err, result) {
        if (err) res.send(err);
        else if (result.matchedCount === 0 || result.n === 0) {
            res.send("❗ Article Not Found. Nothing was Updated.");
        }
        else {
            res.send("✅ Article Updated Successfully.");
        }
    });
}).delete(function (req, res) {
    Article.deleteOne({
        title: req.params.articleTitle
    }, function (err, result) {
        if (err) res.send(err);
        else if (result.deletedCount === 0) {
            res.send("❗ Article already Deleted or Not Found.");
        }
        else {
            res.send("✅ Successfully Deleted.");
        }
    });
});
// Home route
app.get("/", function (req, res) {
    res.send("Welcome to the Wiki API! Use /articles to get started.");
});
// Port for Render or local
const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
    console.log(`Server started on port ${PORT}`);
});