const express = require("express");
const ejs = require("ejs");

const app = express();

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.get("/", function (req, res) {
  res.render("home");
});

app.post("/", function (req, res) {
  res.render("home");
});
app.listen(3000, function () {
  console.log("Listening on port 3000.");
});
