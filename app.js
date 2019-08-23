//jshint esversion:6
require('dotenv').config(); //require package dotenv harus ditaruh paling awal
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose =require("mongoose");
const session = require("express-session"); //require package express-session
const passport = require("passport"); //require package passport
const passportLocalMongoose = require("passport-local-mongoose"); //require package passport-local-mongoose

// const encrypt = require("mongoose-encryption");
// const md5 = require("md5");
// const bcrypt = require('bcrypt');
// const saltRounds = 10;

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({ //inisialisasi session (express-session package documentation)
  secret: "Super string secret.", // kode secret string
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize()); //inisialisasi passport
app.use(passport.session()); //inisialisasi passport-session

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true}); //membuat koneksi dan collection mongoose
mongoose.set("useCreateIndex", true); //fix DeprecatedWarning

const userSchema = new mongoose.Schema ({ //membuat schema objek mongoose
  email: String,
  password: String,
});

userSchema.plugin(passportLocalMongoose); //mengaktifkan plugin package passport-local-mongoose
// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] } ); //lihat dokumentasi npm mongoose-encryption

const User = new mongoose.model("User", userSchema); //membuat model User dan collection
passport.use(User.createStrategy()); //konfigurasi passport-local

passport.serializeUser(User.serializeUser());  //membuat cookie
passport.deserializeUser(User.deserializeUser()); //destory cookie

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


//   bcrypt.hash(req.body.password, saltRounds, function(err, hash) { //teknik hash password pada package bcrypt
//     const newUser = new User({ //membuat objer newUser saat register
//       email: req.body.username, //membaca username
//       password: hash //membaca password
//   });
//   newUser.save(function(err){ //menyimpan newUser dari register di mongoose
//     if (err){
//       console.log(err);
//     } else{
//       res.render("secrets"); //menampilkan halaman secrets
//     }
//   });
// });

});



app.post("/login", function(req, res){

  // const username = req.body.username; //membaca input email/username
  // const password = req.body.password; //membaca input password
  //
  // User.findOne({email: username}, function(err, foundUser){ //mencocokan email dengan database
  //   if(err){
  //     console.log(err);
  //   } else {
  //     if (foundUser){
  //       bcrypt.compare(password, foundUser.password, function(err, result) { // teknik komparasi pada metode bcrypt . res = true
  //         if (result === true) {
  //           res.render("secrets"); //apabila sesuai maka akan diampilkan halaman "secrets"
  //         }
  //       });
  //     }
  //    }
  // });
});
//pada projek ini halaman "secrets" adalah halaman yang hanya dapat diakses oleh user yang register dan login saja












app.listen(3000, function(){
  console.log("Server started on port.");
});
