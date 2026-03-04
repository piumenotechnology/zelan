const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../controllers/authController');

// Auth middleware - verifies JWT token
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }
        
        const token = authHeader.replace('Bearer ', '');
        
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Attach user info to request
        req.user = {
            id: decoded.id,
            username: decoded.username,
            role: decoded.role
        };
        
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }
        
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};

// Optional auth - doesn't fail if no token, but attaches user if present
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.replace('Bearer ', '');
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = {
                id: decoded.id,
                username: decoded.username,
                role: decoded.role
            };
        }
        
        next();
    } catch (error) {
        // Ignore auth errors in optional mode
        next();
    }
};

// Admin only middleware
const adminOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }
    
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }
    
    next();
};

module.exports = {
    authMiddleware,
    optionalAuth,
    adminOnly
};
