const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    for (let user of users) {
      if (user.username === username) {
        return true;
      }
    }
    return false;
}

const authenticatedUser = (username, password) => {
    // Use the find method to check if a user with the given username and password exists
    const user = users.find(user => user.username === username && user.password === password);
    // Return true if the user exists, false otherwise
    return user !== undefined;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }
    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
  });


// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const { review } = req.query;
    const username = req.session.authorization.username;
  
    if (!isbn || !review) {
      return res.status(400).json({ message: "ISBN and review are required." });
    }
  
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found." });
    }
  
    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }
  
    books[isbn].reviews[username] = review;
  
    return res.status(200).json({ message: "Review successfully added/modified.", reviews: books[isbn].reviews });
  });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
