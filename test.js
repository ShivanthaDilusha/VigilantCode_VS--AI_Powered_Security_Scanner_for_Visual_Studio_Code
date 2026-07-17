let username = req.query.username; 
let sql = "SELECT * FROM users WHERE username = '" + username + "'";