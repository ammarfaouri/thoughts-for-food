const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let recipeSchema = new Schema({
  name: String,
  author: String,
  description: String,
  prepTime: Number,
  difficulty: Number,
  ingredients: [{ amount: Number, unit: String, ingredientName: String }],
  method: [],
});

let Recipe = mongoose.model("Recipe", recipeSchema);
module.exports = Recipe;
