const { pool } = require('../config/database');

// Helper to create slug
const createSlug = (text) => {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
};

// Get all categories
const getAllCategories = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT * FROM categories WHERE is_active = TRUE ORDER BY display_order ASC, name ASC`
        );
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories',
            error: error.message
        });
    }
};

// Get single category
const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(
            `SELECT * FROM categories WHERE id = ?`,
            [id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch category',
            error: error.message
        });
    }
};

// Create category
const createCategory = async (req, res) => {
    try {
        const { name, description, display_order } = req.body;
        
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }
        
        const slug = createSlug(name);
        
        const [result] = await pool.query(
            `INSERT INTO categories (name, slug, description, display_order) VALUES (?, ?, ?, ?)`,
            [name, slug, description || null, display_order || 0]
        );
        
        const [newCategory] = await pool.query(
            `SELECT * FROM categories WHERE id = ?`,
            [result.insertId]
        );
        
        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: newCategory[0]
        });
    } catch (error) {
        console.error('Error creating category:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'Category with this name already exists'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to create category',
            error: error.message
        });
    }
};

// Update category
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, display_order, is_active } = req.body;
        
        const updates = [];
        const values = [];
        
        if (name !== undefined) {
            updates.push('name = ?', 'slug = ?');
            values.push(name, createSlug(name));
        }
        if (description !== undefined) {
            updates.push('description = ?');
            values.push(description);
        }
        if (display_order !== undefined) {
            updates.push('display_order = ?');
            values.push(display_order);
        }
        if (is_active !== undefined) {
            updates.push('is_active = ?');
            values.push(is_active);
        }
        
        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }
        
        values.push(id);
        
        await pool.query(
            `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`,
            values
        );
        
        const [updated] = await pool.query(
            `SELECT * FROM categories WHERE id = ?`,
            [id]
        );
        
        if (updated.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Category updated successfully',
            data: updated[0]
        });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update category',
            error: error.message
        });
    }
};

// Delete category
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if category has menu items
        const [items] = await pool.query(
            `SELECT COUNT(*) as count FROM menu_items WHERE category_id = ?`,
            [id]
        );
        
        if (items[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete category with existing menu items'
            });
        }
        
        const [result] = await pool.query(
            `DELETE FROM categories WHERE id = ?`,
            [id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete category',
            error: error.message
        });
    }
};

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};
