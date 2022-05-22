const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");
const app = express();
const multer = require("multer");
const { randomUUID } = require("crypto");
const upload = multer();

// session middleware
app.use(session({
    secret: "pTlPecOGXZT1trUhG00m5BLwlbv5vjm8",
    saveUninitialized: false,
    resave: true,
    cookie: {
        maxAge: 1000 * 60 * 10
    }
}))

// cookie parser
app.use(cookieParser());

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

function requiresPIN(req, res, next) {
    if(!req.session.hasPIN) {
        res.redirect("/pin")
        return;
    }
    next();
}

app.get("/", (req, res) => {
    let data = fs.readFileSync(path.join(__dirname, "data/forms.json"), {encoding: "utf8"});
    res.render("home", {
        title: "النمازج الإدارية لمصنع بيترا",
        data,
        hasPin: req.session.hasPIN
    })
});

app.get("/pin", (req, res) => {
    res.render("pin")
})

app.post("/pin", (req, res) => {
    if(req.body.pin == 3333) {
        req.session.hasPIN = true;
        res.redirect("/")
        return;
    }
    res.render("pin", {
        errors: JSON.stringify({
            pin: "رمز خاطئ"
        }),
        form: req.body
    })
})

app.get("/logout", (req, res) => {
    req.session.hasPIN = null;
    res.redirect("/")
})

app.get("/upload", requiresPIN, (req, res) => {
    let departments = fs.readFileSync(path.join(__dirname, "data/departments.json"), {encoding: "utf8"})
    res.render("upload", {
        departments,
        hasPin: req.session.hasPIN,
        errors: "{}"
    });
})

app.post("/upload", requiresPIN, upload.single("file"), (req, res) => {

    let data = req.body;
    let errors = {};
    if(!data.description) {
        errors.description = "حقل مطلوب"
    }

    if(!data.code) {
        errors.code = "حقل مطلوب"
    }

    if(!data.department) {
        errors.department = "حقل مطلوب"
    }

    if(Object.keys(errors).length > 0) {
        let departments = fs.readFileSync(path.join(__dirname, "data/departments.json"), {encoding: "utf8"})
        res.render("upload", {
            departments,
            hasPin: req.session.hasPIN,
            errors: JSON.stringify(errors)
        });
        return
    }

    let name = randomUUID();
    let extension = req.file.originalname.split('.').pop();
    fs.writeFileSync(path.join(__dirname, "storage",  name + "." + extension), req.file.buffer);
    
    let forms = fs.readFileSync(path.join(__dirname, "data", "forms.json"), { encoding: "utf8" });
    forms = JSON.parse(forms);
    forms.push({
        department: req.body.department,
        description: req.body.description,
        code: req.body.code,
        href: `/storage/${name}.${extension}`
    })
    fs.writeFileSync(path.join(__dirname, "data", "forms.json"), JSON.stringify(forms))

    res.redirect("/")
});

app.use("/storage", express.static(path.join(__dirname, "storage")))

app.listen(3000, () => console.log("server is running"))