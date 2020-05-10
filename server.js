const express = require("express");
const app = express();
const port = 5000;

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);

app
  .route("/helloworld")
  .get(function (req, res) {
    res.json({ hello: 1 });
  })
  .post(function (req, res) {
    res.send("Add a book");
  })
  .put(function (req, res) {
    res.send("Update the book");
  });
