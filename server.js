const express = require("express");
const fs = require("fs");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 3000;


app.use(session({
   secret: process.env.SESSION_SECRET || "lokalni-demo-secret",
    resave: false,
    saveUninitialized: false
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/admin.html", (req, res) => {
    if (!req.session.loggedIn) {
        return res.redirect("/login.html");
    }

    res.sendFile(__dirname + "/admin.html");
});
app.use(express.static("."));

app.post("/rezervacija", (req, res) => {
    const rezervacija = req.body;

    let rezervacije = [];

    if (fs.existsSync("rezervacije.json")) {
        rezervacije = JSON.parse(fs.readFileSync("rezervacije.json"));
    }

    rezervacije.push(rezervacija);

    fs.writeFileSync(
        "rezervacije.json",
        JSON.stringify(rezervacije, null, 2)
    );

    console.log("Nova rezervacija spremljena:", rezervacija);

    res.json({
        success: true,
        message: "Rezervacija je uspješno spremljena! ✅"
    });
});
app.get("/rezervacije", (req, res) => {
    if (!req.session.loggedIn) {
    return res.status(401).json({
        success: false,
        message: "Niste prijavljeni."
    });
}
    let rezervacije = [];

    if (fs.existsSync("rezervacije.json")) {
        rezervacije = JSON.parse(fs.readFileSync("rezervacije.json"));
    }

    res.json(rezervacije);
});
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (
        username === process.env.ADMIN_USERNAME &&
        password === process.env.ADMIN_PASSWORD
    ) {
        req.session.loggedIn = true;
        return res.redirect("/admin.html");
    }

    res.send("Pogrešno korisničko ime ili lozinka.");
});
app.delete("/rezervacija/:index", (req, res) => {
    let rezervacije = [];

    if (fs.existsSync("rezervacije.json")) {
        rezervacije = JSON.parse(fs.readFileSync("rezervacije.json"));
    }

    const index = parseInt(req.params.index);

    if (index < 0 || index >= rezervacije.length) {
        return res.status(404).json({
            success: false,
            message: "Rezervacija nije pronađena."
        });
    }

    rezervacije.splice(index, 1);

    fs.writeFileSync(
        "rezervacije.json",
        JSON.stringify(rezervacije, null, 2)
    );

    res.json({
        success: true,
        message: "Rezervacija je obrisana."
    });
});
app.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login.html");
    });
});
app.listen(PORT, () => {
    console.log(`Server radi na http://localhost:${PORT}`);
});
