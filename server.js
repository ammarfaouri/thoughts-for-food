const express = require("express");
const app = express();
const port = 5000;
const mongoose = require("mongoose");
var Recipe = require("./Models/recipe");
var seedDB = require("./seeds");

//Mongoose Setup
mongoose.connect("mongodb://localhost:27017/myapp", { useNewUrlParser: true });
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Database is connected");
});

seedDB();

app
  .route("/recipes")
  .get(function (req, res) {
    Recipe.find({}, function (err, recipes) {
      if (err) {
        console.log(err);
      } else {
        res.json(recipes);
      }
    });
  })
  .post(function (req, res) {
    res.send("Add a book");
  })
  .put(function (req, res) {
    res.send("Update the book");
  });

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
