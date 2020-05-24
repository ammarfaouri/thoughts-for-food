const express = require("express");
const app = express();
const port = 5000;
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
var Recipe = require("./Models/recipe");
var seedDB = require("./seeds");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());

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
    //responds with all the recipes in the DB
    Recipe.find({}, function (err, recipes) {
      if (err) {
        console.log(err);
      } else {
        res.json(recipes);
      }
    });
  })
  .post(function (req, res) {
    //adds recipe to collection
    Recipe.create(req.body.data, function (err, createdRecipe) {
      if (err) {
        console.log(err);
      } else {
        console.log("added recipe from POST request", createdRecipe);
      }
    });
  })
  .put(function (req, res) {
    res.send("Update the book");
  });

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
