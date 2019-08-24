//jshint esversion:6
require('dotenv').config(); //require package dotenv harus ditaruh paling awal
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose =require("mongoose");
const session = require("express-session"); //require package express-session
const passport = require("passport"); //require package passport
const passportLocalMongoose = require("passport-local-mongoose"); //require package passport-local-mongoose
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
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

//inisialisasi session (express-session package documentation)
app.use(session({
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
userSchema.plugin(findOrCreate); //mengaktifkan plugin package findOrCreate
// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] } ); //lihat dokumentasi mongoose-encryption

const User = new mongoose.model("User", userSchema); //membuat model User dan collection
passport.use(User.createStrategy()); //konfigurasi passport-local

//// Methode Serialize & Deserialize dari package passport untuk semua strategi
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

//// Methode Serialize & Deserialize dari package passport-local-mongoose
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());
//-----------------------------------

////---inisialisasi passport-google-oauth2 google strategy, untuk login user---
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL:"https://www.googleapis.com/oauth2/v3/userinfo" //fix deprecated google plus oauth2.0
  },
  function(accessToken, refreshToken, profile, cb) { //accessToken yang dikirim google, data pada profile,
    console.log(profile);
    //metode User.findOrCreatOne ini harus dibuat terlebih dulu,
    //metode USER.findOrCreate bukan merupakan method langsung dari mongoose atau passport, dan harus menginstall package mongoose-findorcreate
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get("/", function(req, res){
  res.render("home");
});

//otentikasi google server untuk meminta profile user
app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

app.get("/auth/google/secrets", //masuk ke local web
  passport.authenticate("google", { failureRedirect: "/login" }), //otentikasi dengan lokal database, metode login passport
  function(req, res) {
    // Successful authentication, redirect halaman secrets, login berhasil
    res.redirect("/secrets");
  });

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});

app.get("/secrets", function(req, res){
  if (req.isAuthenticated()){ //jika user terotentikasi, dengan session, passport passport-local, passport-local-mongoose
    res.render("secrets");
  }else{
    res.redirect("/login");
  }

});
app.get("/logout", function(req, res){
  //metode logout dari package passport
  req.logout();
  res.redirect("/");
});
//update kode
//setiap server diupdate maka cookies akan terhapus dan session akan di restart
app.post("/register", function(req, res){
//---metode register dari passport-local-passportLocalMongoose--
  User.register({username: req.body.username}, req.body.password, function(err, user){
    if (err){
      console.log(err);
      res.redirect("/register");
    }else{
      //otentikasi untuk menyiapkan login session cookies, agar ketika user login akan langsung diarahkan ke halaman secrets
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
    });
  }
});
//-------------------------------------------------------
//--metode regster hash bcrypt--
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
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  //metode login dari passport
  req.login(user, function(err){
    if(err){
      console.log(err);
    }else{
      passport.authenticate("local")(req, res, function(){ //memeriksa cookies session user ketika login
        res.redirect("/secrets");
      });
    }
  });

  //-------------------------------------------------------
  //--metode login hash bcrypt--
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
