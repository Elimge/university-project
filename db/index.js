// db/index.js 

const { Pool } = require("pg");

const pool = new Pool ({
    user: "coder",
    host: "localhost",
    database: "universidad_db", 
    password: "123456",
    port: 5432,
});

module.exports = pool;

