//jshint esversion:6

const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const ListJs = require(__dirname + "/ListJs.js");



const app = express();

//Set ejs
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));


// Connect to DataBase 
/*
mongoose.connect("mongodb://localhost:27017/todolistDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});*/

// Connect to dataBase in Atlas
mongoose.connect("mongodb+srv://octapff:weddewtr3_ASD@cluster0.7usqj.mongodb.net/todolistDB", {
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


app.get("/", function (req, res) {

  res.redirect("/Today");
  /*
  const itemName = req.body.newItem;
  const listName = req.body.list;
  let lists = [];

  
  List.find({}, (err, result) => {
    if (result.length > 0) {
      lists = result;
    }
  });

  Item.find({}, (err, result) => {

    if (result.length === 0) {
      res.render("list", {
        listsEjs: lists,
        listTitle: "Create a new item",
        newListItems: result,
        errorEjs: err
      });

    } else {
      res.render("list", {
        listsEjs: lists,
        listTitle: "Today",
        newListItems: result,
        errorEjs: err

      });
    }
  });
*/



});


app.get("/:customListName", (req, res) => {

  
  let listName = req.params.customListName;
  let lists = [];

  console.log(listName)

  if (listName === "favicon.ico"){
    listName = "Today";    
  }


  List.find({}, (err, result) => {
    if (!err) {
      lists = result;
    }
  });

  List.findOne({name: listName}, (err, result) => {
    console.log("this is the result: " + result);
    if (result) {


      res.render("list", {
        listTitle: result.name,
        newListItems: result.items,
        listsEjs: lists,
        errorEjs: err
      });

    } else {

      console.log("LLEGO ");
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

    List.findOne({
      name: listName
    }, (err, foundList) => {
      if (foundList) {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      } else {
        console.log("No list found");
        const unNamedList = new List({
          name: "New-list",
          items: [item]
        });
        unNamedList.save();
        console.log("new list created");
        res.redirect("/");
      }
    })
  
});

app.post("/delete", (req, res) => {
  const itemId = req.body.checkBox;
  const listName = req.body.listName;

  List.findOneAndUpdate({
    name: listName
  }, {
    $pull: {
      items: {
        _id: itemId
      }
    }
  }, (err, result) => {
      res.redirect("/" + listName);
  });

});

app.post("/deleteList", (req, res) => {
  const listId = req.body.checkboxList;
  const listName = req.body.listName;

  List.findByIdAndRemove(listId, (err, result) => {
    if (err) {
      console.error(err);
    } else {
      if (listId === listName) {
        res.redirect("/");  
      } else {
        res.redirect("/" + listName);
      }
      
    }
  })
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.listen(port, function () {
  console.log("Server started on port 3000");
});