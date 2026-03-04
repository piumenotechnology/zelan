const { pool } = require('../config/database');

// Get all specials
const getAllSpecials = async (req, res) => {
    try {
        const { active } = req.query;
        
        let query = `SELECT * FROM specials`;
        const params = [];
        
        if (active !== 'false') {
            query += ` WHERE is_active = TRUE`;
        }
        
        query += ` ORDER BY display_order ASC`;
        
        const [rows] = await pool.query(query, params);
        
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error fetching specials:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch specials',
            error: error.message
        });
    }
};

// Get single special
const getSpecialById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(
            `SELECT * FROM specials WHERE id = ?`,
            [id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Special not found'
            });
        }
        
        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Error fetching special:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch special',
            error: error.message
        });
    }
};

// Create special
const createSpecial = async (req, res) => {
    try {
        const { title, description, time_period, icon, display_order } = req.body;
        
        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: 'Title and description are required'
            });
        }
        
        const [result] = await pool.query(
            `INSERT INTO specials (title, description, time_period, icon, display_order) 
             VALUES (?, ?, ?, ?, ?)`,
            [title, description, time_period || null, icon || 'clock', display_order || 0]
        );
        
        const [newSpecial] = await pool.query(
            `SELECT * FROM specials WHERE id = ?`,
            [result.insertId]
        );
        
        res.status(201).json({
            success: true,
            message: 'Special created successfully',
            data: newSpecial[0]
        });
    } catch (error) {
        console.error('Error creating special:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create special',
            error: error.message
        });
    }
};

// Update special
const updateSpecial = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, time_period, icon, is_active, display_order } = req.body;
        
        const updates = [];
        const values = [];
        
        if (title !== undefined) {
            updates.push('title = ?');
            values.push(title);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            values.push(description);
        }
        if (time_period !== undefined) {
            updates.push('time_period = ?');
            values.push(time_period);
        }
        if (icon !== undefined) {
            updates.push('icon = ?');
            values.push(icon);
        }
        if (is_active !== undefined) {
            updates.push('is_active = ?');
            values.push(is_active);
        }
        if (display_order !== undefined) {
            updates.push('display_order = ?');
            values.push(display_order);
        }
        
        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }
        
        values.push(id);
        
        const [result] = await pool.query(
            `UPDATE specials SET ${updates.join(', ')} WHERE id = ?`,
            values
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Special not found'
            });
        }
        
        const [updated] = await pool.query(
            `SELECT * FROM specials WHERE id = ?`,
            [id]
        );
        
        res.json({
            success: true,
            message: 'Special updated successfully',
            data: updated[0]
        });
    } catch (error) {
        console.error('Error updating special:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update special',
            error: error.message
        });
    }
};

// Delete special
const deleteSpecial = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await pool.query(
            `DELETE FROM specials WHERE id = ?`,
            [id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Special not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Special deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting special:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete special',
            error: error.message
        });
    }
};

module.exports = {
    getAllSpecials,
    getSpecialById,
    createSpecial,
    updateSpecial,
    deleteSpecial
};
