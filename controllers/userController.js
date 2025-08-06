// controllers/userController.js

const { response } = require("express");
const pool = require("../db");
const bcrypt = require("bcrypt");

// Controller to the register 
const registerUser = async (request, response) => {
    const { nombre, email, password } = request.body;

    if (!nombre || !email || !password) {
        return response.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    try {
        const saltRounds = 10; 
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const query = "INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING id, email, nombre";
        const values = [nombre, email, hashedPassword];
        const result = await pool.query(query, values); 

        response.status(201).json({
            message: "Usuario registrado con éxito",
            user: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        if (error.code === "23505") {
            return response.status(400).json({ error: "El correo electrónico ya está registrado." });
        }
        response.status(500).json({ error: "Error interno del servidor "});
    }
};

// Controller to the login 
const loginUser = async (request, response) => {
    const { email, password } = request.body;

    if (!email || !password) {
        return response.status(400).json ({ error: "Email y contraseña son obligatorios"});
    }

    try {
        const query = "SELECT * FROM usuarios WHERE email = $1";
        const result = await pool.query(query, [email]);

        if (result.rows.length === 0) {
            return response.status(401).json ({ error: "Credenciales inválidas" });
        }

        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password); 

        if (!passwordMatch) {
            return response.status(401).json({ error: "Credenciales inválidas "});
        }

        response.status(200).json({
            message: "Login exitoso",
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email
            }
        });

    } catch (error) {
        console.error(error);
        response.status(500).json({ error: "Error interno del servidor" });
    }
};

// Export the functions
module.exports = {
    registerUser,
    loginUser
}; 