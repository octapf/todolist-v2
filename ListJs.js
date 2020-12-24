
const express = require("express");
const bodyParser = require("body-parser");





exports.createList = function (nameList, itemsArr) {
    const list = new List({
        name: nameList,
        items: itemsArr
    });
    list.save();
}

exports.deleteList = function () {}

exports.createItem = function () {}

exports.deleteItem = function () {}


exports.findOrCreateList = function (itemName, listName) {


    let lists = [];

    List.find({}, (err, result) => {
        if (result.length > 0) {
            console.log(result);
            lists = result;
        } else {

            const list = new List({
                name: listName,
                items: [itemName]
            });
            list.save();
        }
    })
}

exports.findOrCreateItem = function(lists){

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


}