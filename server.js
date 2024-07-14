const exp = require('constants');
const express = require('express');
const path = require('path');
const mysql = require('mysql2');
require('dotenv').config();


//  script files
const generateESN = require('./javascript/generate_esn');



// server files
const moveCurrentToArchive = require('./server/current_to_archive');

const app = express();
const port = process.env.PORT || 3000;


// open connection for mysql database
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// if error connecting to database
db.connect((err)=>{
  if (err) {
    console.error('Error connecting to database:',err.stack);
    return;
  }
  console.log('Connected to the database as id ' + db.threadId);
});



// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'assets','images')));
app.use(express.static(path.join(__dirname, 'assets','products')));
app.use(express.static(path.join(__dirname, 'assets','videos')));
app.use(express.static(path.join(__dirname, 'css')));
app.use(express.static(path.join(__dirname, 'index')));
app.use(express.static(path.join(__dirname, 'javascript')));
app.use(express.static(path.join(__dirname, 'server')));

//
app.use(express.json());







// All routes
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////


// Handle all other routes by serving the 'index.html' file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index', 'homepage.html'));
});




//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
app.post('/generate-esns', (req, res) => {
  const { model, from, to, carrier } = req.body;

  // Validate request parameters
  if (!model || !from || !to || isNaN(from) || isNaN(to) || from < 0 || to < 0 || from > to || !carrier) {
    return res.status(400).json({ error: 'Invalid model, from, to, or carrier.' });
  }

  // Move current data to archive
  moveCurrentToArchive(db, (err, moveResult) => {
    if (err) {
      // Check if the error is due to a duplicate entry
      if (err.message.includes("Duplicate entry")) {
        return res.status(500).json({ error: 'Error moving data to archive: Duplicate entry error.' });
      }
      return res.status(500).json({ error: 'Failed to move data to archive.' });
    }

    // Generate ESNs
    const esns = generateESN(model, parseInt(from), parseInt(to));
    console.log('Generated ESNs with Carriers:');
    esns.forEach((esn, index) => {
      console.log(`${esn} - ${carrier}`);
    });

    // Prepare data for database insertion
    const values = esns.map(esn => [esn, carrier]);

    // Insert ESNs and carrier into the database
    const sql = 'INSERT INTO current_esn (serial_number, carrier) VALUES ?';

    db.query(sql, [values], (err, result) => {
      if (err) {
        console.error('Error inserting ESNs: ' + err.stack);
        return res.status(500).json({ error: 'Failed to insert ESNs into database.' });
      }
      console.log('Inserted ' + result.affectedRows + ' rows');
      res.json({ esns, carrier });
    });
  });
});



//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
// Route to handle fetching latest ESNs
app.get('/latest_esn', (req, res) => {
  const query = 'SELECT serial_number FROM current_esn'; 

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing MySQL query: ', err);
      res.status(500).send('Error fetching latest ESNs.');
      return;
    }
    res.json(results); // Assuming sending JSON response
    
  });
});




//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
// API endpoint to fetch device models
app.get('/api/models', (req, res) => {
  const query = 'SELECT model FROM devicemodel';
  db.query(query, (err, results) => {
      if (err) {
          console.error('Error fetching device models:', err);
          res.status(500).json({ error: 'Failed to fetch device models' });
          return;
      }
      res.json(results);
      console.log('This is node getting data:', results)
      
  });
});





// start the server
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});




// Close the MySQL connection on process exit
process.on('SIGINT', () => {
  db.end((err) => {
    if (err) {
      console.error('Error closing the database connection:', err.stack);
      process.exit(1);
    }
    console.log('MySQL connection closed');
    server.close(() => {
      console.log('Server stopped');
      process.exit(0);
    });
  });
});
