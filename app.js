//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// Connect to DataBase
mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


// define Schemas
const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, "Please insert a name for the item."]
  }
});

const listSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true]
  },
  items: [itemsSchema]
});

// Compiling schemas - singular word
const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List", listSchema);



const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));




app.get("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  let lists = [];

  List.find({}, (err, result) => {
    if (result) {
      console.log(result);
      lists = result;
    } else {
      const list = new List({
        name: "My new list",
        items: [itemName]
      });
      list.save();
    }
    
  });

  Item.find({}, (err, result) => {

    if (result.length === 0) {
      res.render("list", {
        listsEjs: lists,
        listTitle: "Create a new item",
        newListItems: result
      });

    } else {
      res.render("list", {
        listsEjs: lists,
        listTitle: "Today",
        newListItems: result

      });
    }
  });




});


app.get("/:customListName", (req, res) => {

  const listName = req.params.customListName;
  let lists = [];

  List.find({}, (err, result) => {
    if (!err) {
      lists = result;
    }
  });

  List.findOne({
    name: listName
  }, (err, result) => {
    if (result) {



      res.render("list", {
        listTitle: result.name,
        newListItems: result.items,
        listsEjs: lists
      });

    } else {


      const list = new List({
        name: listName,
        items: []
      });

      list.save();
      res.redirect("/" + listName);
    }
  });



});


app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {

    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, (err, foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", (req, res) => {
  const itemId = req.body.checkBox;
  const listName = req.body.listName;
  console.log("im inside /delete");


  if (listName === "Today") {
    Item.findByIdAndRemove(itemId, (err) => {
      if (!err) {
        console.log("Successfully deleted document.");
        res.redirect("/");
      } else {
        console.log(err);
      }
    });
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: itemId
        }
      }
    }, (err, result) => {
      console.log(result);
      res.redirect("/" + listName);
    });
  }
});

app.post("/deleteList", (req, res) => {
  const listId = req.body.checkboxList;
  const listName = req.body.listName;

  List.findByIdAndRemove(listId, (err) => {
    if (err) {
      console.error(err);
    } else {
      res.redirect("/");
    }
  })
})


app.listen(3000, function () {
  console.log("Server started on port 3000");
});