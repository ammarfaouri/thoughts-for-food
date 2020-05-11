var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var recipeSchema = new Schema({
  name: String,
  author: String,
  description: String,
  prepTime: Number,
  difficulty: Number,
  ingredients: [{ amount: Number, unit: String, name: String }],
  method: [],
});

var Recipe = mongoose.model("Recipe", recipeSchema);
module.exports = Recipe;
