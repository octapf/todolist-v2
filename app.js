//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// Connect to DataBase
mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})


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

const item1 = new Item({
  name: "Do laundry"
});

const item2 = new Item({
  name: "Workout"
});

const item3 = new Item({
  name: "Play videoGames"
});

const defaultItems = [item1, item2, item3];

app.get("/", function (req, res) {

  Item.find({}, (err, result) => {

    if (result.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.error(err);
        } else {
          console.log("Successfully saved default items to DB.");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: result
      });
    }
  });
});


app.get("/:customListName", (req, res) => {

  const listName = req.params.customListName;

  List.findOne({ name: listName }, (err, result) => {
    if (result) {

      console.log("Exists!");

      res.render("list", {
        listTitle: listName,
        newListItems: [result]
      });
      
    } else {
      console.log("Doens't exist!");

      const list = new List({
        name: listName,
        items: defaultItems
      });

      list.save();
      res.redirect( "/" + listName );
    }
  } );
  



});

app.post("/:newList", (req, res) => {

});


app.post("/", function (req, res) {

  const itemName = req.body.newItem;

  const item = new Item({
    name: itemName
  });

  item.save();

  res.redirect("/");

});

app.post("/delete", (req, res) => {
  const itemId = req.body.checkBoxDelete;


  Item.findByIdAndRemove(itemId, (err) => {
    if (!err) {
      console.log("Successfully deleted document.");
      res.redirect("/");
    }
  });



});



app.listen(3000, function () {
  console.log("Server started on port 3000");
});