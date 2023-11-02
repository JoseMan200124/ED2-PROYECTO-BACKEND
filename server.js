const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;
const personRoutes = require('./routes/personRoutes');
const http = require("http");
app.use(cors({
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
}));

app.use(express.json());

app.use('/person', personRoutes);

const server = http.createServer(app);
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

});