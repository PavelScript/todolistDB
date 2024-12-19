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
    required: true }

});

const Item = mongoose.model("item", itemsSchema);


const item1 = new Item({
  name: "Welcome to the To-Do List!"

});

const item2 = new Item({
  name: "Buy Food"

});

const item3 = new Item({
  name: "Eat Food"
});

const defaultItems = [ item1, item2, item3 ];



app.get("/", function(req, res) {

    Item.find().then(function(items){
      if (items.length === 0){ 
        Item.insertMany(defaultItems).then(function(){
          console.log("Successfully saved default items to DB");
        }).catch(function(error){
          console.log(error);
        })
        res.redirect("/"); }
      else {
        res.render("list", {listTitle: "Today", newListItems: items});
      }

  }).catch(function(error){
  console.log(error);
  });



});

app.post("/", function(req, res){

  const itemName = req.body.newItem;

  const item = new Item({
    name: itemName
  });
  item.save();
  res.redirect("/");

});

app.post("/delete", function(req, res){
  const checkedId =req.body.checkbox;
  Item.findByIdAndDelete(checkedId).then(function(){
    console.log("Successfully deleted item")})
    res.redirect("/");
 
})


app.get("/:listTitle", (req,res) => {
  const AnotherItem = mongoose.model("AnotherItem", itemsSchema);
  const anotherItemName = new AnotherItem({
    name: req.params.listTitle
  })
  res.redirect("/" + req.params.listTitle);
});
  res.render("list", {listTitle: req.params.listTitle, newListItems: defaultItems});



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
