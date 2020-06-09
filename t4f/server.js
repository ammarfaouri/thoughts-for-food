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
mongoose.connect("mongodb://localhost:27017/myapp", {
  useNewUrlParser: true,
  useFindAndModify: false,
});
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Database is connected");
});

//populate db with seed files
seedDB();

app
  .route("/recipes")

  .get(function (req, res) {
    //retrieve all recipes
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
    Recipe.create(req.body, function (err, createdRecipe) {
      if (err) {
        console.log(err);
      } else {
        console.log("added recipe from POST request", createdRecipe);
        res.status(201).send("Success");
      }
    });
  });

app
  .route("/recipes/:id")
  .get(function (req, res) {
    let id = req.params.id;
    Recipe.findById(id, function (err, Recipe) {
      if (err) {
        console.log(err);
      } else {
        res.json(Recipe);
      }
    });
  })
  .put(function (req, res) {
    //finds recipe by id and updates it
    let id = req.params.id;
    let recipe = req.body;
    Recipe.findOneAndUpdate(id, recipe, function (err, updatedRecipe) {
      if (err) {
        console.log(err);
      } else {
        console.log(`recipe with id ${id} updated`, updatedRecipe);
      }
    });
    res.end("yes");
  })
  .delete(function (req, res) {
    //deletes recipe with id from Database
    let id = req.params.id;

    Recipe.findOneAndDelete(id, function () {
      if (err) {
        console.log(err);
      } else {
        console.log(`Deleted Recipe with id ${id}`);
      }
    });
  });

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
