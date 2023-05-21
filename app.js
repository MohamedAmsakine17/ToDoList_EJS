const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");

const port = 3000;

const items = [];
const workItems = [];

app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("list", { listTitle: date.getDay(), newListItems: items });
});

app.post("/", (req, res) => {
  const item = req.body.newItem;
  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    items.push(item);
    res.redirect("/");
  }
});

app.listen(port, () => {
  console.log("Server Listen to the port " + port);
});
