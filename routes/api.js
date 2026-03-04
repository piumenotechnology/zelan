const express = require('express');
const router = express.Router();

// Import controllers
const categoriesController = require('../controllers/categoriesController');
const menuItemsController = require('../controllers/menuItemsController');
const specialsController = require('../controllers/specialsController');
const faqsController = require('../controllers/faqsController');
const authController = require('../controllers/authController');

// Import middleware
const { authMiddleware, adminOnly } = require('../middleware/auth');

// Import upload middleware
const { uploadVoice, uploadMenuFiles, uploadImage } = require('../config/upload');

// Auth Routes (Public)
router.post('/auth/login', authController.login);
router.get('/auth/verify', authController.verifyToken);
router.post('/auth/refresh', authController.refreshToken);

// Auth Routes (Protected)
router.get('/auth/admins', authMiddleware, adminOnly, authController.getAllAdmins);
router.post('/auth/register', authMiddleware, adminOnly, authController.register);
router.put('/auth/change-password', authMiddleware, authController.changePassword);

// Categories Routes (Public: Read, Protected: Write)
router.get('/categories', categoriesController.getAllCategories);
router.get('/categories/:id', categoriesController.getCategoryById);
router.post('/categories', authMiddleware, categoriesController.createCategory);
router.put('/categories/:id', authMiddleware, categoriesController.updateCategory);
router.delete('/categories/:id', authMiddleware, categoriesController.deleteCategory);

// Menu Items Routes (Public: Read, Protected: Write)
router.get('/menu', menuItemsController.getAllMenuItems);
router.get('/menu/by-category', menuItemsController.getMenuByCategory);
router.get('/menu/:id', menuItemsController.getMenuItemById);

// Protected menu routes
router.post('/menu', 
    authMiddleware,
    uploadMenuFiles.fields([
        { name: 'voice_file', maxCount: 1 },
        { name: 'image_file', maxCount: 1 }
    ]),
    menuItemsController.createMenuItem
);

router.put('/menu/:id',
    authMiddleware,
    uploadMenuFiles.fields([
        { name: 'voice_file', maxCount: 1 },
        { name: 'image_file', maxCount: 1 }
    ]),
    menuItemsController.updateMenuItem
);

router.delete('/menu/:id', authMiddleware, menuItemsController.deleteMenuItem);

router.post('/menu/:id/voice',
    authMiddleware,
    uploadVoice.single('voice_file'),
    menuItemsController.uploadVoiceFile
);

// Menu Images Routes (Protected)
router.get('/menu/:id/images', menuItemsController.getMenuImages);

router.post('/menu/:id/images',
    authMiddleware,
    uploadImage.single('image'),
    menuItemsController.uploadMenuImage
);

router.delete('/menu/:id/images/:imageId',
    authMiddleware,
    menuItemsController.deleteMenuImage
);

router.patch('/menu/:id/images/:imageId/main',
    authMiddleware,
    menuItemsController.setMainImage
);

// Specials Routes (Public: Read, Protected: Write)
router.get('/specials', specialsController.getAllSpecials);
router.get('/specials/:id', specialsController.getSpecialById);
router.post('/specials', authMiddleware, specialsController.createSpecial);
router.put('/specials/:id', authMiddleware, specialsController.updateSpecial);
router.delete('/specials/:id', authMiddleware, specialsController.deleteSpecial);

// FAQs Routes (Public: Read, Protected: Write)
router.get('/faqs', faqsController.getAllFaqs);
router.get('/faqs/:id', faqsController.getFaqById);
router.post('/faqs', authMiddleware, faqsController.createFaq);
router.put('/faqs/:id', authMiddleware, faqsController.updateFaq);
router.delete('/faqs/:id', authMiddleware, faqsController.deleteFaq);

// Stats Route (Protected)
router.get('/stats', authMiddleware, async (req, res) => {
    const { pool } = require('../config/database');
    
    try {
        const [totalItems] = await pool.query('SELECT COUNT(*) as count FROM menu_items');
        const [totalCategories] = await pool.query('SELECT COUNT(*) as count FROM categories WHERE is_active = TRUE');
        const [featuredItems] = await pool.query('SELECT COUNT(*) as count FROM menu_items WHERE is_featured = TRUE');
        const [voiceEnabled] = await pool.query('SELECT COUNT(*) as count FROM menu_items WHERE voice_file IS NOT NULL');
        const [activeSpecials] = await pool.query('SELECT COUNT(*) as count FROM specials WHERE is_active = TRUE');
        
        res.json({
            success: true,
            data: {
                totalItems: totalItems[0].count,
                totalCategories: totalCategories[0].count,
                featuredItems: featuredItems[0].count,
                voiceEnabled: voiceEnabled[0].count,
                activeSpecials: activeSpecials[0].count
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stats',
            error: error.message
        });
    }
});

module.exports = router;
