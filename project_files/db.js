// db.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',                // 👈 Change this if you're not using 'root'
  password: 'mysql',  // 👈 Put your actual MySQL password here
  database: 'iflix'   // 👈 Replace with your actual database name
});

module.exports = connection;

