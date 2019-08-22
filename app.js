//jshint esversion:6
require('dotenv').config(); //require package dotenv harus ditaruh paling awal
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose =require("mongoose");
// const encrypt = require("mongoose-encryption");
const md5 = require("md5");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true}); //membuat koneksi dan collection mongoose

const userSchema = new mongoose.Schema ({ //membuat schema objek mongoose
  email: String,
  password: String,
});

// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] } ); //lihat dokumentasi npm mongoose-encryption


const User = new mongoose.model("User", userSchema); //membuat model User dan collection


app.get("/", function(req, res){
  res.render("home");
});

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});

app.post("/register", function(req, res){
  const newUser = new User({ //membuat objer newUser saat register
    email: req.body.username, //membaca username
    password: md5(req.body.password) //membaca password
  });

  newUser.save(function(err){ //menyimpan newUser dari register di mongoose
    if (err){
      console.log(err);
    } else{
      res.render("secrets"); //menampilkan halaman secrets
    }
  });
 });

app.post("/login", function(req, res){
  const username = req.body.username; //membaca input email/username
  const password = md5(req.body.password); //membaca input password dengan enkripsi md5

  User.findOne({email: username}, function(err, foundUser){ //mencocokan email dengan database
    if(err){
      console.log(err);
    } else {
      if (foundUser){
        if (foundUser.password === password){ //mencocokan password dengan database
          res.render("secrets"); //apabila sesuai maka akan diampilkan halaman "secrets"
        }
      }
     }
  });
});
//halaman "secrets" adalah halaman yang hanya dapat diakses oleh user yang register dan login saja












app.listen(3000, function(){
  console.log("Server started on port.");
});
