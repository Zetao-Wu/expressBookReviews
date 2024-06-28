const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (isValid(username)) {
    return res.status(400).json({ message: "User already exists." });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User registered successfully." });
});

// Get the book list available in the shop
public_users.get('/', (req, res) => {
  new Promise((resolve, reject) => {
    resolve(books);
  }).then((bookList) => {
    res.send(JSON.stringify(bookList, null, 4));
  }).catch((error) => {
    res.status(500).json({ message: "Error fetching book list" });
  });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
  const { isbn } = req.params;

  new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject("Book not found");
    }
  }).then((book) => {
    res.status(200).json(book);
  }).catch((error) => {
    res.status(404).json({ message: error });
  });
});

// Get book details based on author
public_users.get('/author/:author', (req, res) => {
  const author = req.params.author;

  new Promise((resolve, reject) => {
    const filteredBooks = Object.values(books).filter((book) => book.author === author);
    if (filteredBooks.length > 0) {
      resolve(filteredBooks);
    } else {
      reject("No books found by this author");
    }
  }).then((books) => {
    res.send(books);
  }).catch((error) => {
    res.status(404).json({ message: error });
  });
});

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title;

  new Promise((resolve, reject) => {
    const filteredBooks = Object.values(books).filter((book) => book.title === title);
    if (filteredBooks.length > 0) {
      resolve(filteredBooks);
    } else {
      reject("No books found with this title");
    }
  }).then((books) => {
    res.send(books);
  }).catch((error) => {
    res.status(404).json({ message: error });
  });
});

// Get book review
public_users.get('/review/:isbn', (req, res) => {
  const { isbn } = req.params;

  new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book && book.reviews) {
      resolve(book.reviews);
    } else {
      reject("Reviews not found");
    }
  }).then((reviews) => {
    res.status(200).json(reviews);
  }).catch((error) => {
    res.status(404).json({ message: error });
  });
});

module.exports.general = public_users;
