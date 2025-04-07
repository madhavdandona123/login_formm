const express = require('express');
const app = express();
const path = require("path");
const hbs = require("hbs");
const bcrypt = require("bcrypt");  // Added bcrypt for password hashing
const collection = require("./mongoose");
const { timeEnd } = require('console');
const PORT = 8000

const templatePath = path.join(__dirname, "templates");
app.use(express.json());
app.set("view engine", "hbs");
app.set("views", templatePath);
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

// Signup Route
app.post("/signup", async (req, res) => {
    try {
        const { name, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
        const timestamp = new Date()
        const timenow = timestamp.toString()
        const data = { name, password: hashedPassword , timenow};

        await collection.insertMany([data]);
        res.render("home");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error signing up");
    }
});

// Login Route
app.all("/login", async (req, res) => {
    if (req.method === "GET") {
        res.render("login");
    } else if (req.method === "POST") {
        try {
            const user = await collection.findOne({ name: req.body.name });
            if (!user) {
                return res.send("User not found");
            }

            // Compare hashed password
            const isMatch = await bcrypt.compare(req.body.password, user.password);
            if (isMatch) {
                res.render("home");
            } else {
                res.send("Wrong credentials");
            }
        } catch (error) {
            console.error(error);
            res.send("Error logging in");
        }
    }
});

app.get("/logout", (req, res) => {
    res.redirect("/login");
});

app.listen(PORT, () => {
    console.log("Server running on port 8000");
});
