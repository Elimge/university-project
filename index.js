// Imports
const express = require("express");
const { Pool } = require("pg");
const bcrypt = require("bcrypt"); 

// Instances of Express app
const app = express();
const port = 3000; // The running port

// Middleware for JSON understanding 
app.use(express.json());

// Configurate the db conecction
const pool = new Pool ({
    user: "coder",
    host: "localhost",
    database: "universidad_db", 
    password: "123456",
    port: 5432,
});

// Create a test route
app.get("/", (req, res) => {
    res.send("¡El servidor de la universidad está funcionando!");
});

// Route to register a new user (POST)
app.post("/register", async (req, res) => {
    const { nombre, email, password } = req.body;

    // Basic verification 
    if (!nombre || !email || !password) {
        return res.status(400).json ({ error: "Todos los campos son obligatorios" });
    }

    try {
        // Hash the password
        const saltRounds = 10; // Hashin "costs"
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const query = "INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING id, email, nombre";
        const values = [nombre, email, hashedPassword]; // Save the hashed password

        const result = await pool.query(query, values);

        res.status(201).json ({
            message: "Usuario registrado con éxito",
            user: result.rows[0]
        });

    } catch (error) {
        // Handle errors (ex. double email)
        console.error(error);
        if (error.code === "23505") { //Postgres code to unique violation
            return res.status(400).json({ error: "El correo electrónico ya está resgistrado." });
        }
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Start the server to listen queries
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`)
});  

// Route to login (POST)
app.post ("/login", async (req, res) => {
    const { email, password } = req.body;

    if(!email || !password) {
        return res.status(400).json({ error: "Email y contraseña son obligatorios "});
    }

    try {
        // Search the email 
        const query = "SELECT * FROM usuarios WHERE email = $1";
        const result = await pool.query(query, [email]);

        if (result.rows.length === 0) {
            // User doesn't exists 
            return res.status(401).json ({ error: "Credenciales inválidas" });  // Secure message
        }

        const user = result.rows[0];

        // Comparate the passwords
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            // Wrong password
            return res.status(401).json({ error: "Credenciales inválidas "});
        }

        // Successfull login
        // Future JWT 
        res.status(200).json({
            message: "Login existoso",
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email
            }
        });
    
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error interno del servidor "});
    }
});