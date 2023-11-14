// Archivo principal (puede ser index.js, app.js, server.js o cualquier nombre que utilices)

const express = require('express');
const cors = require('cors');
const http = require("http");
const Database = require('./models/Database'); // Asegúrate de que la ruta sea correcta
const personRoutes = require('./routes/personRoutes');

const app = express();
const PORT = 3001;

// Crear la instancia de Database
const db = new Database();

app.use(cors({
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
}));
app.use(express.json());

// Pasar la instancia de db a las rutas
app.use('/person', (req, res, next) => {
    req.db = db;
    next();
}, personRoutes);

const server = http.createServer(app);
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
