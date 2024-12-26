//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true },

});

const Item = mongoose.model("item", itemsSchema);


const item1 = new Item({
  name: "Welcome to the To-Do List!",

});

const item2 = new Item({
  name: "Buy Food",


});

const item3 = new Item({
  name: "Eat Food",

});

const defaultItems = [ item1, item2, item3 ];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

    Item.find({listName:'default'}).then(function(items){
      if (items.length === 0){ 
        Item.insertMany(defaultItems).then(function(){
          console.log("Successfully saved default items to DB");
        }).catch(function(error){
          console.log(error);
        })
        res.redirect("/"); }
      else {
        res.render("list", {listTitle: "today", newListItems: items});
      }

  }).catch(function(error){
  console.log(error);
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
    });

    if(listName === "Today"){
      item.save();
      res.redirect("/");
    }
    else {
      List.findOne({ name: listName}).then(function(foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      });

    }


});

app.post("/delete", function(req, res){
  const checkedId =req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today"){
  Item.findByIdAndDelete(checkedId).then(function(){
    console.log("Successfully deleted item")})
    res.redirect("/");
  }

  else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedId}}}).then(function(){
      res.redirect("/" + listName);
    })};

  });
app.get("/:customListName", (req,res) => {
  const customListName = req.params.customListName;

  List.findOne({name: customListName}).then(function(foundList){
    if(!foundList){
      const list = new List ({
        name: customListName,
        items: defaultItems
      });
      
      list.save();
      res.redirect("/" + customListName);
        }   
      else {
        res.render("list", {listTitle: customListName, newListItems: foundList.items});

      }
});
});


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
