//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");//embedded dynamic content <%=message%>
const mongoose = require("mongoose");//We're using Mongoose, a popular MongoDB library for Node.js.

const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const app = express();// creating an instance of an Express application

app.use(express.static("public"));//make static assets (like stylesheets, images, client-side JavaScript files) accessible to the client (browser).
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({        //middleware is used in Express.js to parse the body of incoming HTTP requests.
extended: true
}));

app.use(session({
secret: "Our Little Secret",
resave: false,
saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser:true});
mongoose.set("useCreateIndex", true);
app.get("/",function(req, res){
  res.render("home");
});

const userSchema = new mongoose.Schema({
email: String,
password: String
}); 
userSchema.plugin(passportLocalMongoose);


const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/login",function(req, res){
    res.render("login");
  });
  app.get("/register",function(req, res){
    res.render("register");
  }); 
app.get("/secrets",function(req,res){
     if(req.isAuthenticated()){
      res.render("secrets");
    }
    else{
       res.redirect("/login");
    }
});  
app.get("/logout", function(req, res){
  req.logout(function(err) {
    if (err) {
      console.log(err);
    }
    res.redirect("/");
  });
});
  app.post("/register", function(req , res){
   User.register({username: req.body.username}, req.body.password, function(err, user){
  if(err)
    {
    console.log(err);
    }//here 5:21 left
   else{
      passport.authenticate("local") ( req , res , function(){
      res.redirect("/secrets");
      });

  } 
  });
});

app.post("/login",function(req,res){
const user = new User ({
username : req.body.username,
password : req.body.password
});

req.login(user, function(err){
 if(err) {
console.log(err);

} else{
       passport.authenticate("local")(req ,res ,function(){
      res.redirect("/secrets");
      });
}
});
});

app.listen(3000,function(){
console.log("Hi Function is running great and on port 3000");
});