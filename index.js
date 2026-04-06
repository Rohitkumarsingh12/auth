

const express = require("express");
const app = express();
const db = require("./db");

app.use(express.json());

const jwt = require("jsonwebtoken");
const key_secret = "rohit";


// ================= REGISTER =================
app.post("/ragister_email", (request, response) => {

    const { name, email, phone, password } = request.body;

    // ✅ field check
    if (!name || !email || !phone || !password) {
        return response.status(400).json({ message: "All fields are required" });
    }

    const sql = "SELECT * FROM students WHERE email=?";

    // ❌ pehle galat tha (extra params diye the)
    db.query(sql, [email], (err, result) => {
        if (err) {
            return response.status(500).json({ message: "Database error" });
        }

        if (result.length > 0) {
            return response.json({ message: "Student already registered" });
        }

        const insertSql = "INSERT INTO students (name,email,phone,password) VALUES (?,?,?,?)";

        db.query(insertSql, [name, email, phone, password], (err, result) => {
            if (err) {
                console.log(err);
                return response.status(500).json({ message: "Insert error" });
            }

            response.json({ message: "Data inserted successfully" });
        });
    });
});
app.post("/login_email", (req, res) => {
    console.log("BODY RECEIVED:", req.body); // ✅ ab sahi
    const { phone, password } = req.body;

    if (!phone || !password) {
        return res.status(400).json({ message: "Phone and password required" });
    }

    const sql = "SELECT * FROM students WHERE phone=? AND password=?";

    db.query(sql, [phone, password], (err, result) => {
        if (err) {
            console.log("DB ERROR:", err);
            return res.status(500).json({ message: "Server error" });
        }

        if (result.length === 0) {
            return res.status(401).json({ message: "Invalid phone or password" });
        }

        const student = result[0];

        const token = jwt.sign(
            { id: student.id, name: student.name, email: student.email },
            key_secret,
            { expiresIn: "1h" }
        );

        return res.json({
            message: "Login success",
            student: { token, name: student.name, email: student.email, phone: student.phone }
        });
    });
});

// ================= PROFILE =================
app.get("/profile", (request, response) => {
    const authheader = request.headers['authorization'];

    // ✅ Bearer token handle
    const token = authheader && authheader.split(' ')[1];

    if (!token) {
        return response.status(401).json({ message: "Token missing" });
    }

    jwt.verify(token, key_secret, (err, result) => {
        if (err) {
            return response.status(403).json({ message: "Invalid token" });
        }

        return response.status(200).json({
            message: "This is your profile",
            user: result
        });
    });
});


// ================= SERVER =================
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});