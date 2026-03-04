const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'zelan-bakery-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Login
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }
        
        // Get user from database
        const [users] = await pool.query(
            `SELECT * FROM users WHERE username = ? AND is_active = TRUE`,
            [username]
        );
        
        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }
        
        const user = users[0];
        
        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );
        
        // Update last login
        await pool.query(
            `UPDATE users SET last_login = NOW() WHERE id = ?`,
            [user.id]
        );
        
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    name: user.name,
                    role: user.role
                }
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
};

// Verify token
const verifyToken = async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }
        
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Get user from database to ensure still exists and active
        const [users] = await pool.query(
            `SELECT id, username, name, role FROM users WHERE id = ? AND is_active = TRUE`,
            [decoded.id]
        );
        
        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'User not found or inactive'
            });
        }
        
        res.json({
            success: true,
            data: {
                user: users[0]
            }
        });
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
        
        console.error('Error verifying token:', error);
        res.status(500).json({
            success: false,
            message: 'Token verification failed',
            error: error.message
        });
    }
};

// Change password
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id; // From auth middleware
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters'
            });
        }
        
        // Get user
        const [users] = await pool.query(
            `SELECT * FROM users WHERE id = ?`,
            [userId]
        );
        
        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, users[0].password);
        
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }
        
        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update password
        await pool.query(
            `UPDATE users SET password = ? WHERE id = ?`,
            [hashedPassword, userId]
        );
        
        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password',
            error: error.message
        });
    }
};

// Refresh token
const refreshToken = async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }
        
        // Verify current token (allow expired)
        const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });
        
        // Check if token is not too old (max 30 days)
        const tokenAge = Date.now() / 1000 - decoded.iat;
        if (tokenAge > 30 * 24 * 60 * 60) {
            return res.status(401).json({
                success: false,
                message: 'Token too old, please login again'
            });
        }
        
        // Get user from database
        const [users] = await pool.query(
            `SELECT id, username, name, role FROM users WHERE id = ? AND is_active = TRUE`,
            [decoded.id]
        );
        
        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'User not found or inactive'
            });
        }
        
        const user = users[0];
        
        // Generate new token
        const newToken = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );
        
        res.json({
            success: true,
            data: {
                token: newToken,
                user
            }
        });
    } catch (error) {
        console.error('Error refreshing token:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to refresh token',
            error: error.message
        });
    }
};

// Get all admins (admin only)
const getAllAdmins = async (req, res) => {
    try {
        const [admins] = await pool.query(
            `SELECT id, username, name, role, is_active, created_at, last_login
             FROM users
             WHERE role = 'admin'
             ORDER BY created_at DESC`
        );

        res.json({
            success: true,
            data: admins
        });
    } catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch admins',
            error: error.message
        });
    }
};

// Register new admin (admin only)
const register = async (req, res) => {
    try {
        const { username, password, name } = req.body;

        if (!username || !password || !name) {
            return res.status(400).json({
                success: false,
                message: 'Username, password, and name are required'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        // Check if username already exists
        const [existing] = await pool.query(
            'SELECT id FROM users WHERE username = ?',
            [username]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Username already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new admin user
        const [result] = await pool.query(
            'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, name, 'admin']
        );

        res.status(201).json({
            success: true,
            message: 'Admin registered successfully',
            data: {
                id: result.insertId,
                username,
                name,
                role: 'admin'
            }
        });
    } catch (error) {
        console.error('Error registering admin:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to register admin',
            error: error.message
        });
    }
};

module.exports = {
    login,
    verifyToken,
    changePassword,
    refreshToken,
    register,
    getAllAdmins,
    JWT_SECRET
};
