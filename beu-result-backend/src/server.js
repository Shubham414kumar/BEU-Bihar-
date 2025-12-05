const express = require('express');
const cors = require('cors');
const winston = require('winston');
const routes = require('./routes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Logger Configuration
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

// Middleware
app.use(cors());
app.use(express.json());

// Request Logging Middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api', routes);

// Health Check
app.get('/', (req, res) => {
    res.send('BEU Result Backend is running');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    logger.error(err.message);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

// Start Server
app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
    console.log(`Server is running on http://localhost:${PORT}`);
});
