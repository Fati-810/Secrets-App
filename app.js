// Fully corrected app.js with manual login success flash
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(session({
    secret: "Our little secret."
    , resave: false
    , saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
mongoose.set('strictQuery', false);
mongoose.connect("mongodb://127.0.0.1:27017/userDB");
const userSchema = new mongoose.Schema({
    email: String
    , password: String
    , secrets: [String]
});
userSchema.plugin(passportLocalMongoose);
const User = mongoose.model("User", userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}
app.get("/", function (req, res) {
    res.render("home");
});
app.get("/register", function (req, res) {
    res.render("register", {
        success_msg: req.flash('success_msg')
        , error_msg: req.flash('error_msg')
    });
});
app.post("/register", async function (req, res) {
    try {
        const existingUser = await User.findOne({
            username: req.body.username
        });
        if (existingUser) {
            req.flash("error_msg", "User already Exists.");
            return res.redirect("/register");
        }
        await User.register({
            username: req.body.username
        }, req.body.password);
        req.flash("success_msg", "Registration Successful! Please Log in.");
        res.redirect("/login");
    }
    catch (err) {
        console.log(err);
        req.flash("error_msg", "Registration Failed. Try again.");
        res.redirect("/register");
    }
});
app.get("/login", function (req, res) {
    res.render("login", {
        success_msg: req.flash('success_msg')
        , error_msg: req.flash('error_msg').concat(req.flash('error'))
    });
});
app.post("/login", function (req, res, next) {
    passport.authenticate("local", function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            req.flash("error_msg", info.message || "Invalid Username or Password.");
            return res.redirect("/login");
        }
        req.logIn(user, function (err) {
            if (err) {
                return next(err);
            }
            req.flash("success_msg", "Login Successful!");
            return res.redirect("/secrets");
        });
    })(req, res, next);
});
app.get("/secrets", ensureAuthenticated, async function (req, res) {
    try {
        const foundUsers = await User.find({
            secrets: {
                $exists: true
                , $not: {
                    $size: 0
                }
            }
        });
        res.render("secrets", {
            usersWithSecrets: foundUsers
            , userLoggedInId: req.user ? req.user._id : null
            , success_msg: req.flash('success_msg')
            , error_msg: req.flash('error_msg')
        });
    }
    catch (err) {
        console.log(err);
        res.redirect("/");
    }
});
app.get("/submit", ensureAuthenticated, function (req, res) {
    res.render("submit", {
        success_msg: req.flash('success_msg')
        , error_msg: req.flash('error_msg')
    });
});
app.post("/submit", ensureAuthenticated, async function (req, res) {
    const submittedSecret = req.body.secret;
    if (!submittedSecret || submittedSecret.trim().length === 0) {
        req.flash("error_msg", "Secret cannot be Empty.");
        return res.redirect("/submit");
    }
    try {
        const foundUser = await User.findById(req.user.id);
        if (foundUser) {
            foundUser.secrets.push(submittedSecret);
            await foundUser.save();
            req.flash("success_msg", "Secret submitted Successfully!");
            res.redirect("/secrets");
        }
    }
    catch (err) {
        console.log(err);
        req.flash("error_msg", "Something went wrong while submitting your secret.");
        res.redirect("/submit");
    }
});
app.get("/edit-secret", ensureAuthenticated, function (req, res) {
    const oldSecret = req.query.secret;
    res.render("edit", {
        oldSecret: oldSecret
        , success_msg: req.flash('success_msg')
        , error_msg: req.flash('error_msg')
    });
});
app.post("/edit-secret", ensureAuthenticated, async function (req, res) {
    const oldSecret = req.body.oldSecret;
    const newSecret = req.body.newSecret;
    try {
        await User.findByIdAndUpdate(req.user.id, {
            $pull: {
                secrets: oldSecret
            }
        });
        const user = await User.findById(req.user.id);
        user.secrets.push(newSecret);
        await user.save();
        req.flash("success_msg", "Secret Updated Successfully! ✨");
        res.redirect("/secrets");
    }
    catch (err) {
        console.log(err);
        req.flash("error_msg", "Failed to Update Secret. ❌");
        res.redirect("/secrets");
    }
});
app.post("/delete-secret", ensureAuthenticated, async function (req, res) {
    const secretToDelete = req.body.secret;
    try {
        await User.findByIdAndUpdate(req.user.id, {
            $pull: {
                secrets: secretToDelete
            }
        });
        req.flash("success_msg", "Secret Deleted Successfully!");
        res.redirect("/secrets");
    }
    catch (err) {
        console.log(err);
        req.flash("error_msg", "Failed to Delete Secret.");
        res.redirect("/secrets");
    }
});
app.get("/logout", function (req, res, next) {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash("success_msg", "You are Logged Out.");
        res.redirect("/login");
    });
});
app.listen(3000, function () {
    console.log("Server started on port 3000.");
});