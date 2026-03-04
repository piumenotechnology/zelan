const { pool } = require('../config/database');
const path = require('path');
const fs = require('fs');
const compressImage = require('../utils/compressImage');

// Helper to create slug
const createSlug = (text) => {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
};

// Helper to delete file
const deleteFile = (filePath) => {
    if (filePath) {
        const fullPath = path.join(__dirname, '..', filePath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
    }
};

// Get all menu items
const getAllMenuItems = async (req, res) => {
    try {
        const { category, featured, available, search } = req.query;
        
        let query = `
            SELECT 
                m.*,
                c.name as category_name,
                c.slug as category_slug,
                mi.image_url as image_url
            FROM menu_items m
            LEFT JOIN categories c ON m.category_id = c.id
            LEFT JOIN menu_images mi ON m.id = mi.menu_id AND mi.is_main = TRUE
            WHERE 1=1
        `;
        const params = [];
        
        if (category) {
            query += ` AND (c.id = ? OR c.slug = ?)`;
            params.push(category, category);
        }
        
        if (featured === 'true') {
            query += ` AND m.is_featured = TRUE`;
        }
        
        if (available !== 'false') {
            query += ` AND m.is_available = TRUE`;
        }
        
        if (search) {
            query += ` AND (m.name LIKE ? OR m.description LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }
        
        query += ` ORDER BY m.display_order ASC, m.name ASC`;
        
        const [rows] = await pool.query(query, params);
        
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch menu items',
            error: error.message
        });
    }
};

// Get single menu item
const getMenuItemById = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.query(
            `SELECT
                m.*,
                c.name as category_name,
                c.slug as category_slug
            FROM menu_items m
            LEFT JOIN categories c ON m.category_id = c.id
            WHERE m.id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }

        // Fetch images for this menu item
        const [images] = await pool.query(
            `SELECT * FROM menu_images WHERE menu_id = ? ORDER BY sort_order ASC`,
            [id]
        );

        res.json({
            success: true,
            data: {
                ...rows[0],
                images: images
            }
        });
    } catch (error) {
        console.error('Error fetching menu item:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch menu item',
            error: error.message
        });
    }
};

// Create menu item
const createMenuItem = async (req, res) => {
    try {
        const {
            category_id,
            name,
            description,
            voice_description,
            // image_url,
            price,
            price_display,
            tag,
            is_featured,
            is_available,
            display_order
        } = req.body;
        
        // Validation
        if (!category_id || !name || !description || !price) {
            return res.status(400).json({
                success: false,
                message: 'Category, name, description, and price are required'
            });
        }
        
        const slug = createSlug(name);

        // Handle file uploads
        let voiceFilePath = null;
        // let imageFilePath = image_url || null;

        if (req.files) {
            if (req.files.voice_file && req.files.voice_file[0]) {
                voiceFilePath = `uploads/voice/${req.files.voice_file[0].filename}`;
            }
            // if (req.files.image_file && req.files.image_file[0]) {
            //     imageFilePath = `uploads/images/${req.files.image_file[0].filename}`;
            // }
        }

        const [result] = await pool.query(
            `INSERT INTO menu_items (
                category_id, name, slug, description, voice_description,
                voice_file, price, price_display, tag,
                is_featured, is_available, display_order
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                category_id,
                name,
                slug,
                description,
                voice_description || null,
                voiceFilePath,
                price,
                price_display || null,
                tag || null,
                is_featured === 'true' || is_featured === true,
                is_available !== 'false' && is_available !== false,
                display_order || 0
            ]
        );

        const menuId = result.insertId;

        // Insert image into menu_images table if provided
        // if (imageFilePath) {
        //     await pool.query(
        //         `INSERT INTO menu_images (menu_id, image_url, is_main, sort_order) VALUES (?, ?, TRUE, 0)`,
        //         [menuId, imageFilePath]
        //     );
        // }

        const [newItem] = await pool.query(
            `SELECT m.*, c.name as category_name, c.slug as category_slug
             FROM menu_items m
             LEFT JOIN categories c ON m.category_id = c.id
             WHERE m.id = ?`,
            [menuId]
        );

        // Fetch images for the new item
        // const [images] = await pool.query(
        //     `SELECT * FROM menu_images WHERE menu_id = ? ORDER BY sort_order ASC`,
        //     [menuId]
        // );

        res.status(201).json({
            success: true,
            message: 'Menu item created successfully',
            data: {
                ...newItem[0],
                // images: images
            }
        });
    } catch (error) {
        console.error('Error creating menu item:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: 'Menu item with this name already exists'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to create menu item',
            error: error.message
        });
    }
};

// Update menu item - FIXED: preserves existing files
const updateMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            category_id,
            name,
            description,
            voice_description,
            image_url,
            price,
            price_display,
            tag,
            is_featured,
            is_available,
            display_order,
            remove_voice_file
        } = req.body;
        
        // Get current item to handle file updates
        const [currentItem] = await pool.query(
            `SELECT * FROM menu_items WHERE id = ?`,
            [id]
        );
        
        if (currentItem.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }
        
        const current = currentItem[0];
        const updates = [];
        const values = [];
        
        // Update text fields only if provided
        if (category_id !== undefined && category_id !== '') {
            updates.push('category_id = ?');
            values.push(category_id);
        }
        if (name !== undefined && name !== '') {
            updates.push('name = ?', 'slug = ?');
            values.push(name, createSlug(name));
        }
        if (description !== undefined && description !== '') {
            updates.push('description = ?');
            values.push(description);
        }
        if (voice_description !== undefined) {
            updates.push('voice_description = ?');
            values.push(voice_description || null);
        }
        if (price !== undefined && price !== '') {
            updates.push('price = ?');
            values.push(price);
        }
        if (price_display !== undefined) {
            updates.push('price_display = ?');
            values.push(price_display || null);
        }
        if (tag !== undefined) {
            updates.push('tag = ?');
            values.push(tag || null);
        }
        if (is_featured !== undefined) {
            updates.push('is_featured = ?');
            values.push(is_featured === 'true' || is_featured === true);
        }
        if (is_available !== undefined) {
            updates.push('is_available = ?');
            values.push(is_available === 'true' || is_available === true);
        }
        if (display_order !== undefined && display_order !== '') {
            updates.push('display_order = ?');
            values.push(display_order);
        }
        
        // Handle VOICE file - only update if new file uploaded or explicitly removed
        if (req.files && req.files.voice_file && req.files.voice_file[0]) {
            // New voice file uploaded - delete old one and use new
            deleteFile(current.voice_file);
            updates.push('voice_file = ?');
            values.push(`uploads/voice/${req.files.voice_file[0].filename}`);
        } else if (remove_voice_file === 'true') {
            // Explicitly requested to remove voice file
            deleteFile(current.voice_file);
            updates.push('voice_file = ?');
            values.push(null);
        }
        // If neither condition met, voice_file stays unchanged (not in updates)
        
        // Handle IMAGE file - insert into menu_images table
        let newImagePath = null;
        if (req.files && req.files.image_file && req.files.image_file[0]) {
            newImagePath = `uploads/images/${req.files.image_file[0].filename}`;
            // Compress image before saving to DB
            await compressImage(newImagePath);
        } else if (image_url !== undefined && image_url !== '') {
            newImagePath = image_url;
        }
        
        if (updates.length === 0 && !newImagePath) {
            // No changes, return current data
            const [unchanged] = await pool.query(
                `SELECT m.*, c.name as category_name, c.slug as category_slug
                 FROM menu_items m
                 LEFT JOIN categories c ON m.category_id = c.id
                 WHERE m.id = ?`,
                [id]
            );
            const [images] = await pool.query(
                `SELECT * FROM menu_images WHERE menu_id = ? ORDER BY sort_order ASC`,
                [id]
            );
            return res.json({
                success: true,
                message: 'No changes made',
                data: {
                    ...unchanged[0],
                    images: images
                }
            });
        }

        if (updates.length > 0) {
            values.push(id);
            await pool.query(
                `UPDATE menu_items SET ${updates.join(', ')} WHERE id = ?`,
                values
            );
        }

        // Insert new image into menu_images if provided
        if (newImagePath) {
            // Get current image count to determine sort_order
            const [imageCount] = await pool.query(
                `SELECT COUNT(*) as count FROM menu_images WHERE menu_id = ?`,
                [id]
            );

            // Check if under limit (max 4)
            if (imageCount[0].count < 4) {
                const isMain = imageCount[0].count === 0;
                const [maxOrder] = await pool.query(
                    `SELECT COALESCE(MAX(sort_order), -1) + 1 as next_order FROM menu_images WHERE menu_id = ?`,
                    [id]
                );
                await pool.query(
                    `INSERT INTO menu_images (menu_id, image_url, is_main, sort_order) VALUES (?, ?, ?, ?)`,
                    [id, newImagePath, isMain, maxOrder[0].next_order]
                );
            }
        }

        const [updated] = await pool.query(
            `SELECT m.*, c.name as category_name, c.slug as category_slug
             FROM menu_items m
             LEFT JOIN categories c ON m.category_id = c.id
             WHERE m.id = ?`,
            [id]
        );

        const [images] = await pool.query(
            `SELECT * FROM menu_images WHERE menu_id = ? ORDER BY sort_order ASC`,
            [id]
        );

        res.json({
            success: true,
            message: 'Menu item updated successfully',
            data: {
                ...updated[0],
                images: images
            }
        });
    } catch (error) {
        console.error('Error updating menu item:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update menu item',
            error: error.message
        });
    }
};

// Delete menu item
const deleteMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get item to delete associated files
        const [item] = await pool.query(
            `SELECT * FROM menu_items WHERE id = ?`,
            [id]
        );
        
        if (item.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }
        
        // Delete voice file
        deleteFile(item[0].voice_file);

        // Delete associated images from menu_images
        const [images] = await pool.query(
            `SELECT image_url FROM menu_images WHERE menu_id = ?`,
            [id]
        );
        for (const img of images) {
            if (img.image_url && img.image_url.startsWith('uploads/')) {
                deleteFile(img.image_url);
            }
        }

        // Delete images from database (will also be deleted via CASCADE if set up)
        await pool.query(
            `DELETE FROM menu_images WHERE menu_id = ?`,
            [id]
        );

        await pool.query(
            `DELETE FROM menu_items WHERE id = ?`,
            [id]
        );
        
        res.json({
            success: true,
            message: 'Menu item deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete menu item',
            error: error.message
        });
    }
};

// Upload voice file for existing menu item
const uploadVoiceFile = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No voice file uploaded'
            });
        }
        
        // Get current item
        const [currentItem] = await pool.query(
            `SELECT * FROM menu_items WHERE id = ?`,
            [id]
        );
        
        if (currentItem.length === 0) {
            // Delete uploaded file
            deleteFile(`uploads/voice/${req.file.filename}`);
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }
        
        // Delete old voice file
        deleteFile(currentItem[0].voice_file);
        
        // Update with new voice file
        const voiceFilePath = `uploads/voice/${req.file.filename}`;
        await pool.query(
            `UPDATE menu_items SET voice_file = ? WHERE id = ?`,
            [voiceFilePath, id]
        );
        
        const [updated] = await pool.query(
            `SELECT m.*, c.name as category_name, c.slug as category_slug
             FROM menu_items m
             LEFT JOIN categories c ON m.category_id = c.id
             WHERE m.id = ?`,
            [id]
        );
        
        res.json({
            success: true,
            message: 'Voice file uploaded successfully',
            data: updated[0]
        });
    } catch (error) {
        console.error('Error uploading voice file:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload voice file',
            error: error.message
        });
    }
};

// Get menu items grouped by category
const getMenuByCategory = async (req, res) => {
    try {
        const [categories] = await pool.query(
            `SELECT * FROM categories WHERE is_active = TRUE ORDER BY display_order ASC`
        );
        
        const [items] = await pool.query(
            `SELECT m.*, c.name as category_name, c.slug as category_slug
             FROM menu_items m
             LEFT JOIN categories c ON m.category_id = c.id
             WHERE m.is_available = TRUE
             ORDER BY m.display_order ASC, m.name ASC`
        );
        
        // Group items by category
        const menu = categories.map(category => ({
            ...category,
            items: items.filter(item => item.category_id === category.id)
        }));
        
        res.json({
            success: true,
            data: menu
        });
    } catch (error) {
        console.error('Error fetching menu by category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch menu',
            error: error.message
        });
    }
};

// Upload menu image (max 4 images per menu item)
const uploadMenuImage = async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file uploaded'
            });
        }

        // Check if menu item exists
        const [menuItem] = await pool.query(
            `SELECT id FROM menu_items WHERE id = ?`,
            [id]
        );

        if (menuItem.length === 0) {
            deleteFile(`uploads/images/${req.file.filename}`);
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }

        // Check current image count (max 4)
        const [imageCount] = await pool.query(
            `SELECT COUNT(*) as count FROM menu_images WHERE menu_id = ?`,
            [id]
        );

        if (imageCount[0].count >= 4) {
            deleteFile(`uploads/images/${req.file.filename}`);
            return res.status(400).json({
                success: false,
                message: 'Maximum of 4 images allowed per menu item'
            });
        }

        // Determine if this should be the main image (first image auto-set as main)
        const isMain = imageCount[0].count === 0;

        // Get next sort_order
        const [maxOrder] = await pool.query(
            `SELECT COALESCE(MAX(sort_order), -1) + 1 as next_order FROM menu_images WHERE menu_id = ?`,
            [id]
        );

        const imageUrl = `uploads/images/${req.file.filename}`;

        // Compress image before saving to DB
        await compressImage(imageUrl);

        const [result] = await pool.query(
            `INSERT INTO menu_images (menu_id, image_url, is_main, sort_order) VALUES (?, ?, ?, ?)`,
            [id, imageUrl, isMain, maxOrder[0].next_order]
        );

        // Fetch all images for this menu item
        const [images] = await pool.query(
            `SELECT * FROM menu_images WHERE menu_id = ? ORDER BY sort_order ASC`,
            [id]
        );

        res.status(201).json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                id: result.insertId,
                menu_id: parseInt(id),
                image_url: imageUrl,
                is_main: isMain,
                sort_order: maxOrder[0].next_order
            },
            images: images
        });
    } catch (error) {
        console.error('Error uploading menu image:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload image',
            error: error.message
        });
    }
};

// Delete menu image
const deleteMenuImage = async (req, res) => {
    try {
        const { id, imageId } = req.params;

        // Get the image to delete
        const [image] = await pool.query(
            `SELECT * FROM menu_images WHERE id = ? AND menu_id = ?`,
            [imageId, id]
        );

        if (image.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }

        const wasMain = image[0].is_main;

        // Delete the file
        deleteFile(image[0].image_url);

        // Delete from database
        await pool.query(
            `DELETE FROM menu_images WHERE id = ?`,
            [imageId]
        );

        // If deleted image was main, set next image as main (by lowest sort_order)
        if (wasMain) {
            const [nextImage] = await pool.query(
                `SELECT id FROM menu_images WHERE menu_id = ? ORDER BY sort_order ASC LIMIT 1`,
                [id]
            );

            if (nextImage.length > 0) {
                await pool.query(
                    `UPDATE menu_images SET is_main = TRUE WHERE id = ?`,
                    [nextImage[0].id]
                );
            }
        }

        // Fetch remaining images
        const [images] = await pool.query(
            `SELECT * FROM menu_images WHERE menu_id = ? ORDER BY sort_order ASC`,
            [id]
        );

        res.json({
            success: true,
            message: 'Image deleted successfully',
            images: images
        });
    } catch (error) {
        console.error('Error deleting menu image:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete image',
            error: error.message
        });
    }
};

// Set image as main
const setMainImage = async (req, res) => {
    try {
        const { id, imageId } = req.params;

        // Check if image exists
        const [image] = await pool.query(
            `SELECT * FROM menu_images WHERE id = ? AND menu_id = ?`,
            [imageId, id]
        );

        if (image.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }

        // Unset all other images as main
        await pool.query(
            `UPDATE menu_images SET is_main = FALSE WHERE menu_id = ?`,
            [id]
        );

        // Set this image as main
        await pool.query(
            `UPDATE menu_images SET is_main = TRUE WHERE id = ?`,
            [imageId]
        );

        // Fetch all images
        const [images] = await pool.query(
            `SELECT * FROM menu_images WHERE menu_id = ? ORDER BY sort_order ASC`,
            [id]
        );

        res.json({
            success: true,
            message: 'Main image updated successfully',
            images: images
        });
    } catch (error) {
        console.error('Error setting main image:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to set main image',
            error: error.message
        });
    }
};

// Get menu images for a menu item
const getMenuImages = async (req, res) => {
    try {
        const { id } = req.params;

        const [images] = await pool.query(
            `SELECT * FROM menu_images WHERE menu_id = ? ORDER BY sort_order ASC`,
            [id]
        );

        res.json({
            success: true,
            data: images
        });
    } catch (error) {
        console.error('Error fetching menu images:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch images',
            error: error.message
        });
    }
};

module.exports = {
    getAllMenuItems,
    getMenuItemById,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    uploadVoiceFile,
    getMenuByCategory,
    uploadMenuImage,
    deleteMenuImage,
    setMainImage,
    getMenuImages
};
