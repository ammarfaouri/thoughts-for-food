const mongoose = require("mongoose");
const Recipe = require("./Models/recipe");

let data = [
  {
    name: "Chicken Nuggets",
    author: "Ammar Faouri",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    prepTime: 30,
    difficulty: 2,
    ingredients: [
      { amount: 1, unit: "kg", name: "Chicken" },
      { amount: 2, unit: "g", name: "Nuggets" },
      { amount: 1, unit: "kg", name: "more chicken" },
    ],
    method: ["add chicken", "cook chicken", "ezpz"],
  },
  {
    name: "Pizza",
    author: "Ammar Faouri",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    prepTime: 50,
    difficulty: 5,
    ingredients: [
      { amount: 1, unit: "kg", name: "Flour" },
      { amount: 2, unit: "kg", name: "water" },
      { amount: 3, unit: "kg", name: "Tomatos" },
    ],
    method: ["add water", "add flour", "ezpz"],
  },
  {
    name: "Chicken Nuggets",
    author: "Ammar Faouri",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    prepTime: 30,
    difficulty: 2,
    ingredients: [
      { amount: 1, unit: "kg", name: "Chicken" },
      { amount: 2, unit: "g", name: "Nuggets" },
      { amount: 1, unit: "kg", name: "more chicken" },
    ],
    method: ["add chicken", "cook chicken", "ezpz"],
  },
];

//delete content of collection
//add seed data to collection
function seedDB() {
  Recipe.deleteMany({}, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("collection is cleared");
      for (let recipe of data) {
        Recipe.create(recipe, function (err) {
          if (err) {
            console.log(err);
          } else {
            console.log("added recipe from seed");
          }
        });
      }
    }
  });
}

module.exports = seedDB;
