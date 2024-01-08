const exp = require('constants');
const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;




// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'assets','images')));
app.use(express.static(path.join(__dirname, 'assets','products')));
app.use(express.static(path.join(__dirname, 'assets','videos')));
app.use(express.static(path.join(__dirname, 'css')));
app.use(express.static(path.join(__dirname, 'index')));
app.use(express.static(path.join(__dirname, 'javascript','homepage')));

//
app.use(express.json());







// All routes
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////


// Handle all other routes by serving the 'index.html' file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index', 'home2.html'));
});

// all_products.html page
app.get("/products", (req, res) => {
  res.sendFile(path.join(__dirname, 'index', 'all_products.html'));
});


// about.html page
app.get("/about-us", (req, res) => {
  res.sendFile(path.join(__dirname, 'index', 'about.html'));
});












// start the server
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
