const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "ledger_user",
  password: "ledger123",
  database: "double_entry_ledger",
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
