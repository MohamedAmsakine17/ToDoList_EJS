// Importing
const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");

// Server Port
const port = 3000;

// Creating new express app
app = express();

app.use(express.urlencoded()); // For get the date from the body
app.use(express.static("public")); // For using any file inside the public folder
app.set("view engine", "ejs"); // For using EJS

// Connecting to the database
mongoose.connect("mongodb://127.0.0.1:27017/toDoListDB");

// Creating Items Schema
const itemSchema = {
  name: { type: String, required: true },
};

//Creating Items Model
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcom to your todolist!",
});

const item2 = new Item({
  name: "Click the + button to add a new item",
});

const item3 = new Item({
  name: "<-- Hit this to delete an item",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema],
};

const List = mongoose.model("List", listSchema);

// Route
app.get("/", (req, res) => {
  Item.find()
    .then((itemsCollection) => {
      if (itemsCollection.length === 0) {
        Item.insertMany(defaultItems)
          .then(() => {
            console.log("All Items inserted with success");
          })
          .catch((err) => {
            console.log(err);
          });
        res.redirect("/");
      } else {
        res.render("list", {
          listTitle: "Today",
          newListItems: itemsCollection,
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/:customListName", (req, res) => {
  const c_listName = _.capitalize(req.params.customListName);

  List.findOne({ name: c_listName })
    .then((foundList) => {
      if (foundList == null) {
        const newList = new List({
          name: c_listName,
          items: defaultItems,
        });
        newList.save();
        res.redirect("/" + c_listName);
      } else {
        res.render("list", {
          listTitle: c_listName,
          newListItems: foundList.items,
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/", (req, res) => {
  const itemName = req.body.newItem;
  const newItem = new Item({
    name: itemName,
  });
  if (req.body.list == "Today") {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({ name: req.body.list }).then((list) => {
      list.items.push(newItem);
      list.save();
      res.redirect("/" + req.body.list);
    });
  }
});

app.post("/delete", (req, res) => {
  const listName = req.body.listName;

  if (listName == "Today") {
    Item.findByIdAndRemove(req.body.checkbox)
      .then(() => {
        console.log("Item delete successfuly");
      })
      .catch((err) => {
        console.log(err);
      });
    res.redirect("/");
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: req.body.checkbox } } }
    )
      .then(() => {
        res.redirect("/" + listName);
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

app.listen(port, () => {
  console.log("Server Listen to the port " + port);
});
