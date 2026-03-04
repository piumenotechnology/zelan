const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./config/database');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware

// CORS configuration
app.use(cors({
    origin: ['http://localhost:5173', 'https://zelannbakery.netlify.app', 'http://localhost:3000' ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded images and voice files)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging (development)
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
    });
}

// Health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

app.get('/', (req, res) => {
    res.send('Welcome to the API Server');
});

// API routes
app.use('/api', apiRoutes);

// Error Handling

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    // Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 10MB'
        });
    }
    
    if (err.message && err.message.includes('Only')) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV !== 'production' ? err.message : undefined
    });
});

// Start Server
async function startServer() {
    // Test database connection
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
        console.error('⚠️  Warning: Database connection failed. Some features may not work.');
    }
    
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
}

startServer();
