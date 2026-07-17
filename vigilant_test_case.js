const express = require('express');
const mysql = require('mysql');

const app = express();
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'testdb'
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to database');
});

app.get('/user', (/** @type {import('express').Request} */ req, /** @type {import('express').Response} */ res) => {
    let username = req.query.username;  // Input directly from user
    let sql = `SELECT * FROM users WHERE username = '${username}'`; // 🔴 VULNERABLE TO SQL INJECTION

    db.query(sql, (err, result) => {
        if (err) {
            res.status(500).send('Error executing query');
        } else {
            res.json(result);
        }
    });
});

app.listen(3000, () => console.log('Server running on port 3000'));
