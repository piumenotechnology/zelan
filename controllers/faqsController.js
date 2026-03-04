const { pool } = require('../config/database');

// Get all FAQs
const getAllFaqs = async (req, res) => {
    try {
        const { active } = req.query;

        let query = `SELECT * FROM faqs`;

        if (active !== 'false') {
            query += ` WHERE is_active = TRUE`;
        }

        query += ` ORDER BY display_order ASC`;

        const [rows] = await pool.query(query);

        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error fetching FAQs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch FAQs',
            error: error.message
        });
    }
};

// Get single FAQ
const getFaqById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(
            `SELECT * FROM faqs WHERE id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'FAQ not found'
            });
        }

        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Error fetching FAQ:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch FAQ',
            error: error.message
        });
    }
};

// Create FAQ
const createFaq = async (req, res) => {
    try {
        const { question, answer, display_order } = req.body;

        if (!question || !answer) {
            return res.status(400).json({
                success: false,
                message: 'Question and answer are required'
            });
        }

        const [result] = await pool.query(
            `INSERT INTO faqs (question, answer, display_order)
             VALUES (?, ?, ?)`,
            [question, answer, display_order || 0]
        );

        const [newFaq] = await pool.query(
            `SELECT * FROM faqs WHERE id = ?`,
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'FAQ created successfully',
            data: newFaq[0]
        });
    } catch (error) {
        console.error('Error creating FAQ:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create FAQ',
            error: error.message
        });
    }
};

// Update FAQ
const updateFaq = async (req, res) => {
    try {
        const { id } = req.params;
        const { question, answer, is_active, display_order } = req.body;

        const updates = [];
        const values = [];

        if (question !== undefined) {
            updates.push('question = ?');
            values.push(question);
        }
        if (answer !== undefined) {
            updates.push('answer = ?');
            values.push(answer);
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
            `UPDATE faqs SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'FAQ not found'
            });
        }

        const [updated] = await pool.query(
            `SELECT * FROM faqs WHERE id = ?`,
            [id]
        );

        res.json({
            success: true,
            message: 'FAQ updated successfully',
            data: updated[0]
        });
    } catch (error) {
        console.error('Error updating FAQ:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update FAQ',
            error: error.message
        });
    }
};

// Delete FAQ
const deleteFaq = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query(
            `DELETE FROM faqs WHERE id = ?`,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'FAQ not found'
            });
        }

        res.json({
            success: true,
            message: 'FAQ deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting FAQ:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete FAQ',
            error: error.message
        });
    }
};

module.exports = {
    getAllFaqs,
    getFaqById,
    createFaq,
    updateFaq,
    deleteFaq
};
