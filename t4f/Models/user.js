const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let userSchema = new Schema({
  firstName: String,
  lastName: String,
  username: String,
  email: String,
  password: String,
});

let User = mongoose.model("User", userSchema);
module.exports = User;
