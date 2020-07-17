const express = require("express");
const app = express();
const port = 5000;
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
var Recipe = require("./Models/recipe");
var User = require("./Models/user");
var seedDB = require("./seeds");
var session = require("express-session");
var bcrypt = require("bcryptjs");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());

//Express-session setup
app.use(
  session({
    secret: "Illumi",
    resave: false,
    saveUninitialized: true,
  })
);

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
    // adds recipe to collection
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

app.route("/users").post(function (req, res) {
  User.findOne({ username: req.body.username }, (err, user) => {
    if (!user) {
      req.body.password = bcrypt.hashSync(req.body.password, 10);
      let user = new User(req.body);
      user.save((err, user) => {
        if (err) {
          console.log(err);
        } else {
          console.log("User Created", user);
          req.session.id = user._id;
          res.sendStatus("201");
        }
      });
    } else {
      console.log("user already exists");
      res.sendStatus("409");
    }
  });
});
app.route("/login").post(function (req, res) {
  //find user using email submitted
  User.findOne({ username: req.body.username }, (err, user) => {
    if (err) console.log(err);
    if (!user) {
      console.log("user does not exist");
      res.sendStatus("404");
    } else {
      bcrypt.compare(req.body.password, user.password, function (err, match) {
        if (err) console.log(err);
        if (match) {
          req.session.id = user.id;
          res.sendStatus("200");
        } else {
          console.log("password incorrect");
          res.sendStatus("401");
        }
      });
    }
  });
});

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
