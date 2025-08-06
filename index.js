// index.js 

const express =  require("express");

// Import the router
const userRoutes = require(".routes/userRoutes");

// Create the Express's app 
const app = express();
const port = 3000;

// Global middlewares
app.use(express.json());

// Connect the routes
app.use("/api/users", userRoutes);

// Test route
app.get("/", (reques, response) => {
    response.send("¡El servidor de la universidad está funcionando!");
});

// Start the server 
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost${port}`);
});