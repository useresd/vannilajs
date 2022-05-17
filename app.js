const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");

const app = express();

// session middleware
app.use(session({
    secret: "pTlPecOGXZT1trUhG00m5BLwlbv5vjm8",
    saveUninitialized: false,
    resave: true
}))

// cookie parser
app.use(cookieParser());

// set the view engine to ejs
app.set('view engine', 'ejs');

app.get("/", (req, res) => {
    res.render("home", {
        title: "النمازج الإدارية لمصنع بيترا"
    })
});

app.get("/api/forms", (req, res) => {
    setTimeout(() => {
        let data = fs.readFileSync(path.join(__dirname, "data/forms.json"), {encoding: "utf8"});
        res.json(JSON.parse(data))
    }, 1000)
});

app.use("/forms", express.static(path.join(__dirname, "forms")))

app.listen(3000, () => console.log("server is running"))