/**
 * Setup Script - Create Admin User
 * Run this after setting up the database: node scripts/setup-admin.js
 */

const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
require('dotenv').config();

const DEFAULT_ADMIN = {
    username: 'admin',
    password: 'admin123', // Change this!
    name: 'Administrator',
    role: 'admin'
};

async function setupAdmin() {
    try {
        console.log('🔧 Setting up admin user...\n');
        
        // Hash password
        const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 10);
        
        // Check if admin exists
        const [existing] = await pool.query(
            'SELECT id FROM users WHERE username = ?',
            [DEFAULT_ADMIN.username]
        );
        
        if (existing.length > 0) {
            // Update existing admin
            await pool.query(
                'UPDATE users SET password = ?, name = ?, role = ?, is_active = TRUE WHERE username = ?',
                [hashedPassword, DEFAULT_ADMIN.name, DEFAULT_ADMIN.role, DEFAULT_ADMIN.username]
            );
            console.log('✅ Admin user updated!');
        } else {
            // Create new admin
            await pool.query(
                'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
                [DEFAULT_ADMIN.username, hashedPassword, DEFAULT_ADMIN.name, DEFAULT_ADMIN.role]
            );
            console.log('✅ Admin user created!');
        }
        
        console.log('\n📋 Login credentials:');
        console.log(`   Username: ${DEFAULT_ADMIN.username}`);
        console.log(`   Password: ${DEFAULT_ADMIN.password}`);
        console.log('\n⚠️  IMPORTANT: Change the password after first login!\n');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error setting up admin:', error.message);
        process.exit(1);
    }
}

setupAdmin();
